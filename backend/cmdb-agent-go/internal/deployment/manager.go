package deployment

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"
	"runtime"
	"sync"
	"time"

	"github.com/iac/cmdb-agent/internal/config"
	"github.com/iac/cmdb-agent/internal/logger"
)

type Manager struct {
	config   *config.Config
	log      *logger.Logger
	jobs     map[string]*DeploymentJob
	mu       sync.RWMutex
	stopChan chan struct{}
}

type DeploymentJob struct {
	ID          string                   `json:"deployment_id"`
	Name        string                   `json:"name"`
	Version     string                   `json:"version"`
	Type        string                   `json:"type"`
	OS          []string                 `json:"os"`
	Arch        []string                 `json:"arch"`
	PreChecks   []Check                  `json:"pre_checks"`
	Actions     []DeploymentAction       `json:"actions"`
	PostChecks  []Check                  `json:"post_checks"`
	Rollback    []DeploymentAction       `json:"rollback"`
	Signature   map[string]string        `json:"signature"`
	Status      string                   `json:"status"`
	StartTime   time.Time                `json:"start_time"`
	EndTime     time.Time                `json:"end_time"`
	Error       string                   `json:"error"`
}

type Check struct {
	Type string `json:"type"`
	Path string `json:"path"`
	Service string `json:"service"`
}

type DeploymentAction struct {
	Type    string `json:"type"`
	Src     string `json:"src"`
	Dest    string `json:"dest"`
	Package string `json:"package"`
	Command string `json:"command"`
	Args    []string `json:"args"`
}

func NewManager(log *logger.Logger, cfg *config.Config) *Manager {
	return &Manager{
		config:   cfg,
		log:      log,
		jobs:     make(map[string]*DeploymentJob),
		stopChan: make(chan struct{}),
	}
}

func (m *Manager) Start(ctx context.Context) {
	m.log.Info("Starting deployment manager")

	ticker := time.NewTicker(2 * time.Minute)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return
		case <-m.stopChan:
			return
		case <-ticker.C:
			m.checkPendingJobs()
		}
	}
}

func (m *Manager) Stop() {
	close(m.stopChan)
}

func (m *Manager) checkPendingJobs() {
	// TODO: Fetch pending deployments from CMDB backend
	// For now, this is a placeholder
}

func (m *Manager) ExecuteJob(job *DeploymentJob) error {
	m.mu.Lock()
	m.jobs[job.ID] = job
	job.Status = "running"
	job.StartTime = time.Now()
	m.mu.Unlock()

	m.log.Info("Executing deployment", "id", job.ID, "name", job.Name)

	// Check OS/Arch compatibility
	if !m.isCompatible(job) {
		return fmt.Errorf("deployment not compatible with OS/Arch")
	}

	// Run pre-checks
	if err := m.runChecks(job.PreChecks); err != nil {
		job.Status = "failed"
		job.Error = fmt.Sprintf("pre-check failed: %v", err)
		return err
	}

	// Execute actions
	for i, action := range job.Actions {
		m.log.Debug("Executing action", "step", i+1, "type", action.Type)
		
		if err := m.executeAction(action, job); err != nil {
			m.log.Error("Action failed", "error", err)
			
			// Attempt rollback
			if len(job.Rollback) > 0 {
				m.log.Info("Attempting rollback")
				m.runRollback(job)
				job.Status = "rolled_back"
			} else {
				job.Status = "failed"
			}
			
			job.Error = err.Error()
			return err
		}
	}

	// Run post-checks
	if err := m.runChecks(job.PostChecks); err != nil {
		job.Status = "failed"
		job.Error = fmt.Sprintf("post-check failed: %v", err)
		
		// Attempt rollback
		if len(job.Rollback) > 0 {
			m.runRollback(job)
			job.Status = "rolled_back"
		}
		
		return err
	}

	job.Status = "success"
	job.EndTime = time.Now()
	
	m.log.Info("Deployment completed", "id", job.ID, "duration", job.EndTime.Sub(job.StartTime))
	
	// TODO: Send status to CMDB backend
	
	return nil
}

func (m *Manager) isCompatible(job *DeploymentJob) bool {
	// Check OS
	osMatch := false
	for _, os := range job.OS {
		if os == runtime.GOOS {
			osMatch = true
			break
		}
	}
	if !osMatch {
		return false
	}

	// Check Arch
	archMatch := false
	for _, arch := range job.Arch {
		if arch == runtime.GOARCH {
			archMatch = true
			break
		}
	}
	
	return archMatch
}

func (m *Manager) runChecks(checks []Check) error {
	for _, check := range checks {
		switch check.Type {
		case "file_exists":
			if _, err := os.Stat(check.Path); err != nil {
				return fmt.Errorf("file not found: %s", check.Path)
			}
		case "service_running":
			// TODO: Check if service is running
			m.log.Debug("Checking service", "service", check.Service)
		}
	}
	return nil
}

func (m *Manager) executeAction(action DeploymentAction, job *DeploymentJob) error {
	switch action.Type {
	case "download":
		return m.downloadFile(action.Src, action.Dest, job.Signature["sha256"])
	case "install":
		return m.installPackage(action.Package)
	case "command":
		return m.runCommand(action.Command, action.Args)
	default:
		return fmt.Errorf("unknown action type: %s", action.Type)
	}
}

func (m *Manager) downloadFile(url, dest, expectedHash string) error {
	m.log.Debug("Downloading file", "url", url, "dest", dest)

	resp, err := http.Get(url)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("download failed: status %d", resp.StatusCode)
	}

	out, err := os.Create(dest)
	if err != nil {
		return err
	}
	defer out.Close()

	hash := sha256.New()
	writer := io.MultiWriter(out, hash)

	if _, err := io.Copy(writer, resp.Body); err != nil {
		return err
	}

	// Verify hash
	if expectedHash != "" {
		actualHash := hex.EncodeToString(hash.Sum(nil))
		if actualHash != expectedHash {
			os.Remove(dest)
			return fmt.Errorf("hash mismatch: expected %s, got %s", expectedHash, actualHash)
		}
	}

	return nil
}

func (m *Manager) installPackage(packagePath string) error {
	m.log.Info("Installing package", "path", packagePath)

	var cmd *exec.Cmd

	switch runtime.GOOS {
	case "linux":
		// Detect package type
		if packagePath[len(packagePath)-4:] == ".deb" {
			cmd = exec.Command("dpkg", "-i", packagePath)
		} else if packagePath[len(packagePath)-4:] == ".rpm" {
			cmd = exec.Command("rpm", "-i", packagePath)
		} else {
			return fmt.Errorf("unknown package format")
		}
	case "windows":
		cmd = exec.Command("msiexec", "/i", packagePath, "/qn")
	case "darwin":
		cmd = exec.Command("installer", "-pkg", packagePath, "-target", "/")
	default:
		return fmt.Errorf("unsupported OS: %s", runtime.GOOS)
	}

	output, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("install failed: %v, output: %s", err, string(output))
	}

	return nil
}

func (m *Manager) runCommand(command string, args []string) error {
	m.log.Debug("Running command", "command", command, "args", args)

	cmd := exec.Command(command, args...)
	output, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("command failed: %v, output: %s", err, string(output))
	}

	m.log.Debug("Command output", "output", string(output))
	return nil
}

func (m *Manager) runRollback(job *DeploymentJob) {
	m.log.Info("Running rollback", "id", job.ID)

	for i, action := range job.Rollback {
		m.log.Debug("Rollback action", "step", i+1, "type", action.Type)
		if err := m.executeAction(action, job); err != nil {
			m.log.Error("Rollback action failed", "error", err)
		}
	}
}
