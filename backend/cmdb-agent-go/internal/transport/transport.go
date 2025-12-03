package transport

import (
	"bytes"
	"compress/gzip"
	"crypto/tls"
	"crypto/x509"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"

	"github.com/iac/cmdb-agent/internal/config"
	"github.com/iac/cmdb-agent/internal/logger"
)

type Transport struct {
	config *config.Config
	log    *logger.Logger
	client *http.Client
}

func New(cfg *config.Config, log *logger.Logger) (*Transport, error) {
	// Setup TLS
	tlsConfig, err := setupTLS(cfg)
	if err != nil {
		return nil, fmt.Errorf("failed to setup TLS: %w", err)
	}

	client := &http.Client{
		Transport: &http.Transport{
			TLSClientConfig: tlsConfig,
		},
		Timeout: time.Duration(cfg.Transport.Timeout) * time.Second,
	}

	return &Transport{
		config: cfg,
		log:    log,
		client: client,
	}, nil
}

func setupTLS(cfg *config.Config) (*tls.Config, error) {
	tlsConfig := &tls.Config{
		MinVersion: tls.VersionTLS12,
	}

	// Load CA bundle if specified
	if cfg.Server.CABundle != "" {
		caCert, err := os.ReadFile(cfg.Server.CABundle)
		if err != nil {
			return nil, fmt.Errorf("failed to read CA bundle: %w", err)
		}

		caCertPool := x509.NewCertPool()
		if !caCertPool.AppendCertsFromPEM(caCert) {
			return nil, fmt.Errorf("failed to parse CA bundle")
		}
		tlsConfig.RootCAs = caCertPool
	}

	// Load client certificate for mTLS
	if cfg.Auth.Method == "mTLS" {
		cert, err := tls.LoadX509KeyPair(cfg.Auth.CertFile, cfg.Auth.KeyFile)
		if err != nil {
			return nil, fmt.Errorf("failed to load client certificate: %w", err)
		}
		tlsConfig.Certificates = []tls.Certificate{cert}
	}

	return tlsConfig, nil
}

func (t *Transport) SendBatch(items []interface{}) error {
	endpoint := fmt.Sprintf("%s/api/v1/agent/ci", t.config.Server.Primary)

	payload := map[string]interface{}{
		"items":     items,
		"timestamp": time.Now().UTC().Format(time.RFC3339),
	}

	return t.sendRequest("POST", endpoint, payload)
}

func (t *Transport) SendTelemetry(data map[string]interface{}) error {
	endpoint := fmt.Sprintf("%s/api/v1/agent/telemetry", t.config.Server.Primary)
	return t.sendRequest("POST", endpoint, data)
}

func (t *Transport) FetchConfig() (map[string]interface{}, error) {
	endpoint := fmt.Sprintf("%s/api/v1/agent/config", t.config.Server.Primary)
	
	req, err := http.NewRequest("GET", endpoint, nil)
	if err != nil {
		return nil, err
	}

	resp, err := t.doRequest(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var result map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	return result, nil
}

func (t *Transport) FetchPolicies() ([]map[string]interface{}, error) {
	endpoint := fmt.Sprintf("%s/api/v1/agent/policy", t.config.Server.Primary)
	
	req, err := http.NewRequest("GET", endpoint, nil)
	if err != nil {
		return nil, err
	}

	resp, err := t.doRequest(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var result []map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	return result, nil
}

func (t *Transport) FetchDeployments() ([]map[string]interface{}, error) {
	endpoint := fmt.Sprintf("%s/api/v1/agent/deployments", t.config.Server.Primary)
	
	req, err := http.NewRequest("GET", endpoint, nil)
	if err != nil {
		return nil, err
	}

	resp, err := t.doRequest(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var result []map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	return result, nil
}

func (t *Transport) SendDeploymentStatus(deploymentID string, status map[string]interface{}) error {
	endpoint := fmt.Sprintf("%s/api/v1/agent/deployments/status", t.config.Server.Primary)
	
	payload := map[string]interface{}{
		"deployment_id": deploymentID,
		"status":        status,
		"timestamp":     time.Now().UTC().Format(time.RFC3339),
	}

	return t.sendRequest("POST", endpoint, payload)
}

func (t *Transport) sendRequest(method, url string, data interface{}) error {
	jsonData, err := json.Marshal(data)
	if err != nil {
		return fmt.Errorf("failed to marshal data: %w", err)
	}

	var body io.Reader = bytes.NewReader(jsonData)

	// Compress if enabled
	if t.config.Transport.Compression {
		var buf bytes.Buffer
		gzWriter := gzip.NewWriter(&buf)
		if _, err := gzWriter.Write(jsonData); err != nil {
			return fmt.Errorf("failed to compress: %w", err)
		}
		gzWriter.Close()
		body = &buf
	}

	req, err := http.NewRequest(method, url, body)
	if err != nil {
		return fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	if t.config.Transport.Compression {
		req.Header.Set("Content-Encoding", "gzip")
	}

	resp, err := t.doRequest(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		bodyBytes, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("server returned status %d: %s", resp.StatusCode, string(bodyBytes))
	}

	return nil
}

func (t *Transport) doRequest(req *http.Request) (*http.Response, error) {
	attempts := 0
	backoff := time.Duration(t.config.Transport.RetryBackoffMS) * time.Millisecond

	for attempts < t.config.Transport.RetryAttempts {
		resp, err := t.client.Do(req)
		if err == nil && resp.StatusCode < 500 {
			return resp, nil
		}

		if resp != nil {
			resp.Body.Close()
		}

		attempts++
		if attempts < t.config.Transport.RetryAttempts {
			t.log.Warn("Request failed, retrying", "attempt", attempts, "error", err)
			time.Sleep(backoff)
			backoff *= 2 // Exponential backoff
		}
	}

	return nil, fmt.Errorf("request failed after %d attempts", attempts)
}
