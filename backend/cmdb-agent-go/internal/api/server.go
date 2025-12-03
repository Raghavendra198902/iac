package api

import (
	"context"
	"encoding/json"
	"net"
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
	"github.com/iac/cmdb-agent/internal/config"
	"github.com/iac/cmdb-agent/internal/logger"
)

type Server struct {
	config   *config.Config
	log      *logger.Logger
	router   *chi.Mux
	listener net.Listener
	server   *http.Server
}

func NewServer(cfg *config.Config, log *logger.Logger) *Server {
	r := chi.NewRouter()
	
	s := &Server{
		config: cfg,
		log:    log,
		router: r,
	}

	s.setupRoutes()
	return s
}

func (s *Server) setupRoutes() {
	s.router.Get("/status", s.handleStatus)
	s.router.Post("/scan", s.handleScan)
	s.router.Post("/flush", s.handleFlush)
	s.router.Post("/update", s.handleUpdate)
	s.router.Post("/enroll", s.handleEnroll)
	s.router.Get("/policy/list", s.handlePolicyList)
	s.router.Post("/policy/test", s.handlePolicyTest)
}

func (s *Server) Start(ctx context.Context) error {
	// Remove existing socket
	os.Remove(s.config.Agent.SocketPath)

	listener, err := net.Listen("unix", s.config.Agent.SocketPath)
	if err != nil {
		return err
	}

	// Set permissions
	os.Chmod(s.config.Agent.SocketPath, 0600)

	s.listener = listener
	s.server = &http.Server{
		Handler: s.router,
	}

	s.log.Info("API server listening", "socket", s.config.Agent.SocketPath)

	go func() {
		<-ctx.Done()
		s.Stop()
	}()

	return s.server.Serve(listener)
}

func (s *Server) Stop() {
	if s.server != nil {
		s.server.Close()
	}
	if s.listener != nil {
		s.listener.Close()
	}
	os.Remove(s.config.Agent.SocketPath)
}

func (s *Server) handleStatus(w http.ResponseWriter, r *http.Request) {
	status := map[string]interface{}{
		"status":  "running",
		"version": s.config.Agent.Version,
		"uptime":  "TODO",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(status)
}

func (s *Server) handleScan(w http.ResponseWriter, r *http.Request) {
	collector := r.URL.Query().Get("collector")
	mode := r.URL.Query().Get("mode")

	response := map[string]interface{}{
		"status":    "triggered",
		"collector": collector,
		"mode":      mode,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (s *Server) handleFlush(w http.ResponseWriter, r *http.Request) {
	response := map[string]interface{}{
		"status": "flushed",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (s *Server) handleUpdate(w http.ResponseWriter, r *http.Request) {
	response := map[string]interface{}{
		"status": "checking for updates",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (s *Server) handleEnroll(w http.ResponseWriter, r *http.Request) {
	token := r.URL.Query().Get("token")
	
	response := map[string]interface{}{
		"status": "enrolled",
		"token":  token[:8] + "...",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (s *Server) handlePolicyList(w http.ResponseWriter, r *http.Request) {
	policies := []map[string]interface{}{
		{
			"id":   "POLICY-001",
			"name": "Example Policy",
		},
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(policies)
}

func (s *Server) handlePolicyTest(w http.ResponseWriter, r *http.Request) {
	policyID := r.URL.Query().Get("id")
	
	response := map[string]interface{}{
		"status":    "tested",
		"policy_id": policyID,
		"result":    "passed",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
