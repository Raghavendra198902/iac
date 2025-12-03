package webui

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/iac/cmdb-agent/internal/auth"
	"github.com/iac/cmdb-agent/internal/config"
	"github.com/iac/cmdb-agent/internal/logger"
)

// Server provides web UI and REST API
type Server struct {
	config *config.Config
	log    *logger.Logger
	auth   *auth.Authenticator
	router *chi.Mux
	server *http.Server
}

// NewServer creates a new web UI server
func NewServer(cfg *config.Config, log *logger.Logger) *Server {
	authenticator := auth.NewAuthenticator()
	
	// Create default admin user (password should be changed on first login)
	err := authenticator.AddUser("admin", "changeme", auth.RoleAdmin)
	if err != nil {
		log.Error("Failed to create admin user", "error", err)
	}
	
	// Create default viewer user
	authenticator.AddUser("viewer", "viewer123", auth.RoleViewer)
	
	s := &Server{
		config: cfg,
		log:    log,
		auth:   authenticator,
	}

	s.setupRouter()
	return s
}

func (s *Server) setupRouter() {
	r := chi.NewRouter()

	// Middleware
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Timeout(60 * time.Second))

	authMiddleware := auth.NewMiddleware(s.auth)

	// Public routes (no auth required)
	r.Get("/", s.handleIndex)
	r.Get("/health", s.handleHealth)

	// API routes (require authentication)
	r.Route("/api", func(r chi.Router) {
		r.Use(authMiddleware.BasicAuth)

		// Dashboard
		r.Get("/dashboard", s.handleDashboard)

		// Inventory endpoints
		r.Route("/inventory", func(r chi.Router) {
			r.Get("/system", s.handleInventorySystem)
			r.Get("/hardware", s.handleInventoryHardware)
			r.Get("/network", s.handleInventoryNetwork)
			r.Get("/software", s.handleInventorySoftware)
			r.Get("/services", s.handleInventoryServices)
			r.Get("/licenses", s.handleInventoryLicenses)
			r.Get("/processes", s.handleInventoryProcesses)
			r.Get("/users", s.handleInventoryUsers)
			r.Get("/certificates", s.handleInventoryCertificates)
		})

		// Monitoring endpoints
		r.Route("/monitoring", func(r chi.Router) {
			r.Get("/metrics", s.handleMonitoringMetrics)
			r.Get("/processes", s.handleMonitoringProcesses)
			r.Get("/performance", s.handleMonitoringPerformance)
		})

		// Collection endpoints (require trigger permission)
		r.Group(func(r chi.Router) {
			r.Use(authMiddleware.RequirePermission(auth.PermTriggerScan))
			r.Post("/collectors/run", s.handleCollectorRun)
			r.Post("/collectors/schedule", s.handleCollectorSchedule)
		})

		// Queue management
		r.Get("/queue/stats", s.handleQueueStats)
		r.With(authMiddleware.RequirePermission(auth.PermFlushQueue)).
			Post("/queue/flush", s.handleQueueFlush)

		// Enforcement endpoints (require enforce permission)
		r.Route("/enforcement", func(r chi.Router) {
			r.Use(authMiddleware.RequirePermission(auth.PermEnforceActions))
			r.Get("/policies", s.handleEnforcementPolicies)
			r.Get("/violations", s.handleEnforcementViolations)
			r.Post("/policies/evaluate", s.handleEnforcementEvaluate)
			r.Post("/actions/execute", s.handleEnforcementExecute)
		})

		// Logs
		r.Get("/logs", s.handleLogs)

		// Agent management (admin only)
		r.Group(func(r chi.Router) {
			r.Use(authMiddleware.RequireRole(auth.RoleAdmin))
			r.Get("/config", s.handleConfigGet)
			r.Post("/config", s.handleConfigUpdate)
			r.Post("/agent/update", s.handleAgentUpdate)
			r.Post("/agent/enroll", s.handleAgentEnroll)
		})

		// User management (admin only)
		r.Route("/users", func(r chi.Router) {
			r.Use(authMiddleware.RequireRole(auth.RoleAdmin))
			r.Get("/", s.handleUserslist)
			r.Post("/", s.handleUserCreate)
			r.Delete("/{username}", s.handleUserDelete)
			r.Post("/{username}/password", s.handleUserPasswordChange)
		})
	})

	s.router = r
}

// Start starts the web UI server
func (s *Server) Start(ctx context.Context, address string) error {
	s.server = &http.Server{
		Addr:         address,
		Handler:      s.router,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	s.log.Info("Web UI server starting", "address", address)
	s.log.Info("Default admin credentials", "username", "admin", "password", "changeme")
	s.log.Info("Default viewer credentials", "username", "viewer", "password", "viewer123")

	go func() {
		<-ctx.Done()
		s.Stop()
	}()

	if err := s.server.ListenAndServe(); err != http.ErrServerClosed {
		return err
	}

	return nil
}

// Stop stops the web UI server
func (s *Server) Stop() error {
	if s.server != nil {
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		return s.server.Shutdown(ctx)
	}
	return nil
}

// Response helpers
func (s *Server) jsonResponse(w http.ResponseWriter, data interface{}, status int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(data)
}

func (s *Server) errorResponse(w http.ResponseWriter, message string, status int) {
	s.jsonResponse(w, map[string]string{"error": message}, status)
}

// Handler implementations

func (s *Server) handleIndex(w http.ResponseWriter, r *http.Request) {
	html := `<!DOCTYPE html>
<html>
<head>
    <title>CMDB Agent - Dashboard</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; }
        h1 { color: #333; }
        .info { background: #e3f2fd; padding: 15px; border-radius: 4px; margin: 20px 0; }
        .endpoint { background: #f9f9f9; padding: 10px; margin: 10px 0; border-left: 4px solid #2196F3; }
        code { background: #f5f5f5; padding: 2px 6px; border-radius: 3px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🖥️ CMDB Agent Web UI</h1>
        <div class="info">
            <strong>Status:</strong> Running<br>
            <strong>Version:</strong> 1.0.0<br>
            <strong>Auth:</strong> HTTP Basic Authentication required
        </div>
        <h2>API Endpoints</h2>
        <div class="endpoint"><strong>GET</strong> /api/dashboard - Overview statistics</div>
        <div class="endpoint"><strong>GET</strong> /api/inventory/system - System information</div>
        <div class="endpoint"><strong>GET</strong> /api/inventory/hardware - Hardware details</div>
        <div class="endpoint"><strong>GET</strong> /api/inventory/software - Installed software</div>
        <div class="endpoint"><strong>GET</strong> /api/inventory/licenses - License audit</div>
        <div class="endpoint"><strong>GET</strong> /api/monitoring/metrics - Performance metrics</div>
        <div class="endpoint"><strong>GET</strong> /api/enforcement/policies - Policy status</div>
        <div class="endpoint"><strong>POST</strong> /api/collectors/run - Trigger collection</div>
        <div class="endpoint"><strong>POST</strong> /api/enforcement/actions/execute - Execute enforcement action</div>
        <h2>Default Credentials</h2>
        <p><strong>Admin:</strong> <code>admin</code> / <code>changeme</code> (full access)</p>
        <p><strong>Viewer:</strong> <code>viewer</code> / <code>viewer123</code> (read-only)</p>
        <p style="color: #d32f2f;"><strong>⚠️ Change default passwords immediately!</strong></p>
    </div>
</body>
</html>`
	w.Header().Set("Content-Type", "text/html")
	w.Write([]byte(html))
}

func (s *Server) handleHealth(w http.ResponseWriter, r *http.Request) {
	s.jsonResponse(w, map[string]string{
		"status":  "healthy",
		"version": "1.0.0",
		"time":    time.Now().Format(time.RFC3339),
	}, http.StatusOK)
}

func (s *Server) handleDashboard(w http.ResponseWriter, r *http.Request) {
	user := auth.GetUserFromContext(r.Context())
	
	data := map[string]interface{}{
		"agent": map[string]interface{}{
			"version":    "1.0.0",
			"uptime":     "TODO",
			"status":     "running",
			"last_heartbeat": time.Now().Add(-30 * time.Second).Format(time.RFC3339),
		},
		"collectors": map[string]interface{}{
			"total":    8,
			"active":   3,
			"last_run": time.Now().Add(-5 * time.Minute).Format(time.RFC3339),
		},
		"queue": map[string]interface{}{
			"size":     42,
			"oldest":   "5m30s",
			"failures": 2,
		},
		"enforcement": map[string]interface{}{
			"mode":       "monitor",
			"policies":   5,
			"violations": 3,
		},
		"user": map[string]interface{}{
			"username": user.Username,
			"role":     user.Role,
		},
	}

	s.jsonResponse(w, data, http.StatusOK)
}

func (s *Server) handleInventorySystem(w http.ResponseWriter, r *http.Request) {
	// TODO: Get actual system data from collector
	data := map[string]interface{}{
		"hostname":     "dev-server-01",
		"os":           "Linux",
		"os_version":   "Ubuntu 22.04.3 LTS",
		"kernel":       "6.5.0-14-generic",
		"architecture": "x86_64",
		"uptime":       "15d 8h 23m",
		"boot_time":    time.Now().Add(-15 * 24 * time.Hour).Format(time.RFC3339),
	}
	s.jsonResponse(w, data, http.StatusOK)
}

func (s *Server) handleInventoryHardware(w http.ResponseWriter, r *http.Request) {
	// TODO: Get actual hardware data
	data := map[string]interface{}{
		"cpu": map[string]interface{}{
			"model":  "Intel(R) Core(TM) i7-9700K",
			"cores":  8,
			"threads": 8,
			"speed":  "3600 MHz",
		},
		"memory": map[string]interface{}{
			"total": "32 GB",
			"used":  "18 GB",
			"free":  "14 GB",
		},
		"disks": []map[string]interface{}{
			{
				"device": "/dev/sda",
				"size":   "500 GB",
				"type":   "SSD",
				"used":   "285 GB",
			},
		},
	}
	s.jsonResponse(w, data, http.StatusOK)
}

func (s *Server) handleInventoryNetwork(w http.ResponseWriter, r *http.Request) {
	data := map[string]interface{}{
		"interfaces": []map[string]interface{}{
			{
				"name":   "eth0",
				"mac":    "00:1a:2b:3c:4d:5e",
				"ip":     "192.168.1.100",
				"status": "up",
			},
		},
		"gateway": "192.168.1.1",
		"dns":     []string{"8.8.8.8", "8.8.4.4"},
	}
	s.jsonResponse(w, data, http.StatusOK)
}

func (s *Server) handleInventorySoftware(w http.ResponseWriter, r *http.Request) {
	data := []map[string]interface{}{
		{
			"name":         "nginx",
			"version":      "1.24.0",
			"license":      "BSD-2-Clause",
			"install_date": "2024-01-15",
		},
		{
			"name":         "postgresql",
			"version":      "15.4",
			"license":      "PostgreSQL",
			"install_date": "2024-01-20",
		},
	}
	s.jsonResponse(w, data, http.StatusOK)
}

func (s *Server) handleInventoryServices(w http.ResponseWriter, r *http.Request) {
	data := []map[string]interface{}{
		{
			"name":    "nginx",
			"status":  "running",
			"enabled": true,
		},
		{
			"name":    "postgresql",
			"status":  "running",
			"enabled": true,
		},
	}
	s.jsonResponse(w, data, http.StatusOK)
}

func (s *Server) handleInventoryLicenses(w http.ResponseWriter, r *http.Request) {
	data := []map[string]interface{}{
		{
			"software":      "Microsoft Office",
			"license_type":  "Volume License",
			"status":        "active",
			"expiry":        "2025-12-31",
			"days_remaining": 393,
		},
		{
			"software":      "Adobe Acrobat",
			"license_type":  "Subscription",
			"status":        "expiring_soon",
			"expiry":        "2025-01-15",
			"days_remaining": 43,
		},
	}
	s.jsonResponse(w, data, http.StatusOK)
}

func (s *Server) handleInventoryProcesses(w http.ResponseWriter, r *http.Request) {
	data := []map[string]interface{}{
		{
			"pid":     1234,
			"name":    "nginx",
			"cpu":     2.5,
			"memory":  125000,
			"status":  "running",
		},
	}
	s.jsonResponse(w, data, http.StatusOK)
}

func (s *Server) handleInventoryUsers(w http.ResponseWriter, r *http.Request) {
	data := []map[string]interface{}{
		{
			"username":   "root",
			"uid":        0,
			"home":       "/root",
			"shell":      "/bin/bash",
			"last_login": "2024-12-01",
		},
	}
	s.jsonResponse(w, data, http.StatusOK)
}

func (s *Server) handleInventoryCertificates(w http.ResponseWriter, r *http.Request) {
	data := []map[string]interface{}{
		{
			"subject":         "example.com",
			"issuer":          "Let's Encrypt",
			"expiry":          "2025-03-01",
			"days_remaining":  88,
		},
	}
	s.jsonResponse(w, data, http.StatusOK)
}

func (s *Server) handleMonitoringMetrics(w http.ResponseWriter, r *http.Request) {
	data := map[string]interface{}{
		"cpu_usage":    45.2,
		"memory_usage": 56.7,
		"disk_usage":   62.3,
		"network_rx":   1024000,
		"network_tx":   512000,
		"timestamp":    time.Now().Format(time.RFC3339),
	}
	s.jsonResponse(w, data, http.StatusOK)
}

func (s *Server) handleMonitoringProcesses(w http.ResponseWriter, r *http.Request) {
	s.handleInventoryProcesses(w, r)
}

func (s *Server) handleMonitoringPerformance(w http.ResponseWriter, r *http.Request) {
	data := map[string]interface{}{
		"load_average": []float64{1.5, 1.2, 0.9},
		"cpu_cores":    []map[string]float64{
			{"core": 0, "usage": 45.0},
			{"core": 1, "usage": 32.0},
		},
		"memory": map[string]interface{}{
			"total":     32000000,
			"used":      18000000,
			"cached":    8000000,
			"available": 14000000,
		},
	}
	s.jsonResponse(w, data, http.StatusOK)
}

func (s *Server) handleCollectorRun(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Collector string `json:"collector"`
		Mode      string `json:"mode"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		s.errorResponse(w, "Invalid request", http.StatusBadRequest)
		return
	}

	user := auth.GetUserFromContext(r.Context())
	s.log.Info("Collector triggered", "collector", req.Collector, "mode", req.Mode, "user", user.Username)

	// TODO: Actually trigger collector
	s.jsonResponse(w, map[string]interface{}{
		"status":    "triggered",
		"collector": req.Collector,
		"mode":      req.Mode,
		"triggered_by": user.Username,
	}, http.StatusOK)
}

func (s *Server) handleCollectorSchedule(w http.ResponseWriter, r *http.Request) {
	s.errorResponse(w, "Not implemented", http.StatusNotImplemented)
}

func (s *Server) handleQueueStats(w http.ResponseWriter, r *http.Request) {
	data := map[string]interface{}{
		"size":         42,
		"oldest_age":   "5m30s",
		"failures":     2,
		"last_flush":   time.Now().Add(-10 * time.Minute).Format(time.RFC3339),
	}
	s.jsonResponse(w, data, http.StatusOK)
}

func (s *Server) handleQueueFlush(w http.ResponseWriter, r *http.Request) {
	user := auth.GetUserFromContext(r.Context())
	s.log.Info("Queue flush triggered", "user", user.Username)

	// TODO: Actually flush queue
	s.jsonResponse(w, map[string]interface{}{
		"status":      "flushed",
		"items_sent":  42,
		"flushed_by":  user.Username,
	}, http.StatusOK)
}

func (s *Server) handleEnforcementPolicies(w http.ResponseWriter, r *http.Request) {
	data := []map[string]interface{}{
		{
			"id":          "POL-001",
			"name":        "Nginx must be running",
			"status":      "compliant",
			"last_check":  time.Now().Add(-5 * time.Minute).Format(time.RFC3339),
		},
		{
			"id":          "POL-002",
			"name":        "SSH must use key auth only",
			"status":      "violated",
			"last_check":  time.Now().Add(-5 * time.Minute).Format(time.RFC3339),
		},
	}
	s.jsonResponse(w, data, http.StatusOK)
}

func (s *Server) handleEnforcementViolations(w http.ResponseWriter, r *http.Request) {
	data := []map[string]interface{}{
		{
			"policy_id":   "POL-002",
			"policy_name": "SSH must use key auth only",
			"severity":    "high",
			"detected_at": time.Now().Add(-1 * time.Hour).Format(time.RFC3339),
			"description": "SSH password authentication is enabled",
		},
	}
	s.jsonResponse(w, data, http.StatusOK)
}

func (s *Server) handleEnforcementEvaluate(w http.ResponseWriter, r *http.Request) {
	user := auth.GetUserFromContext(r.Context())
	s.log.Info("Policy evaluation triggered", "user", user.Username)

	s.jsonResponse(w, map[string]interface{}{
		"status":         "evaluated",
		"policies_checked": 5,
		"violations":     2,
		"evaluated_by":   user.Username,
	}, http.StatusOK)
}

func (s *Server) handleEnforcementExecute(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Action string                 `json:"action"`
		Params map[string]interface{} `json:"params"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		s.errorResponse(w, "Invalid request", http.StatusBadRequest)
		return
	}

	user := auth.GetUserFromContext(r.Context())
	s.log.Info("Enforcement action executed", "action", req.Action, "user", user.Username)

	// TODO: Actually execute enforcement action
	s.jsonResponse(w, map[string]interface{}{
		"status":      "executed",
		"action":      req.Action,
		"executed_by": user.Username,
		"result":      "success",
	}, http.StatusOK)
}

func (s *Server) handleLogs(w http.ResponseWriter, r *http.Request) {
	level := r.URL.Query().Get("level")
	limit := r.URL.Query().Get("limit")
	
	data := []map[string]interface{}{
		{
			"timestamp": time.Now().Add(-1 * time.Minute).Format(time.RFC3339),
			"level":     "INFO",
			"message":   "Collector executed successfully",
			"collector": "system",
		},
		{
			"timestamp": time.Now().Add(-5 * time.Minute).Format(time.RFC3339),
			"level":     "WARN",
			"message":   "Queue size exceeding threshold",
			"size":      42,
		},
	}

	_ = level
	_ = limit
	s.jsonResponse(w, data, http.StatusOK)
}

func (s *Server) handleConfigGet(w http.ResponseWriter, r *http.Request) {
	// TODO: Return actual config (sanitized, no secrets)
	data := map[string]interface{}{
		"agent": map[string]interface{}{
			"hostname": "dev-server-01",
			"data_dir": "/var/lib/cmdb-agent",
		},
		"collectors": map[string]interface{}{
			"system":   "30s",
			"hardware": "1m",
			"network":  "1m",
		},
	}
	s.jsonResponse(w, data, http.StatusOK)
}

func (s *Server) handleConfigUpdate(w http.ResponseWriter, r *http.Request) {
	user := auth.GetUserFromContext(r.Context())
	s.log.Info("Configuration updated", "user", user.Username)

	s.jsonResponse(w, map[string]interface{}{
		"status":     "updated",
		"updated_by": user.Username,
	}, http.StatusOK)
}

func (s *Server) handleAgentUpdate(w http.ResponseWriter, r *http.Request) {
	user := auth.GetUserFromContext(r.Context())
	s.log.Info("Agent update triggered", "user", user.Username)

	s.errorResponse(w, "Not implemented", http.StatusNotImplemented)
}

func (s *Server) handleAgentEnroll(w http.ResponseWriter, r *http.Request) {
	s.errorResponse(w, "Not implemented", http.StatusNotImplemented)
}

func (s *Server) handleUserslist(w http.ResponseWriter, r *http.Request) {
	users := s.auth.ListUsers()
	s.jsonResponse(w, users, http.StatusOK)
}

func (s *Server) handleUserCreate(w http.ResponseWriter, r *http.Request) {
	var req struct {
		Username string    `json:"username"`
		Password string    `json:"password"`
		Role     auth.Role `json:"role"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		s.errorResponse(w, "Invalid request", http.StatusBadRequest)
		return
	}

	if err := s.auth.AddUser(req.Username, req.Password, req.Role); err != nil {
		s.errorResponse(w, fmt.Sprintf("Failed to create user: %v", err), http.StatusBadRequest)
		return
	}

	adminUser := auth.GetUserFromContext(r.Context())
	s.log.Info("User created", "username", req.Username, "role", req.Role, "created_by", adminUser.Username)

	s.jsonResponse(w, map[string]interface{}{
		"status":   "created",
		"username": req.Username,
		"role":     req.Role,
	}, http.StatusCreated)
}

func (s *Server) handleUserDelete(w http.ResponseWriter, r *http.Request) {
	username := chi.URLParam(r, "username")

	if username == "admin" {
		s.errorResponse(w, "Cannot delete admin user", http.StatusForbidden)
		return
	}

	if err := s.auth.DeleteUser(username); err != nil {
		s.errorResponse(w, fmt.Sprintf("Failed to delete user: %v", err), http.StatusNotFound)
		return
	}

	adminUser := auth.GetUserFromContext(r.Context())
	s.log.Info("User deleted", "username", username, "deleted_by", adminUser.Username)

	s.jsonResponse(w, map[string]interface{}{
		"status":   "deleted",
		"username": username,
	}, http.StatusOK)
}

func (s *Server) handleUserPasswordChange(w http.ResponseWriter, r *http.Request) {
	username := chi.URLParam(r, "username")

	var req struct {
		OldPassword string `json:"old_password"`
		NewPassword string `json:"new_password"`
	}

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		s.errorResponse(w, "Invalid request", http.StatusBadRequest)
		return
	}

	currentUser := auth.GetUserFromContext(r.Context())
	
	// Users can only change their own password unless they're admin
	if currentUser.Role != auth.RoleAdmin && currentUser.Username != username {
		s.errorResponse(w, "Forbidden", http.StatusForbidden)
		return
	}

	if err := s.auth.ChangePassword(username, req.OldPassword, req.NewPassword); err != nil {
		s.errorResponse(w, fmt.Sprintf("Failed to change password: %v", err), http.StatusBadRequest)
		return
	}

	s.log.Info("Password changed", "username", username, "changed_by", currentUser.Username)

	s.jsonResponse(w, map[string]interface{}{
		"status": "changed",
	}, http.StatusOK)
}
