package config

import (
	"fmt"
	"os"

	"gopkg.in/yaml.v3"
)

type Config struct {
	Server    ServerConfig    `yaml:"server"`
	Agent     AgentConfig     `yaml:"agent"`
	WebUI     WebUIConfig     `yaml:"webui"`
	Auth      AuthConfig      `yaml:"auth"`
	Logging   LoggingConfig   `yaml:"logging"`
	Transport TransportConfig `yaml:"transport"`
}

type ServerConfig struct {
	Primary   string `yaml:"primary"`
	Secondary string `yaml:"secondary"`
	CABundle  string `yaml:"ca_bundle"`
}

type AgentConfig struct {
	Version    string              `yaml:"version"`
	Hostname   string              `yaml:"hostname"`
	Tags       map[string]string   `yaml:"tags"`
	Collectors []CollectorConfig   `yaml:"collectors"`
	DataDir    string              `yaml:"data_dir"`
	SocketPath string              `yaml:"socket_path"`
}

type WebUIConfig struct {
	Enabled       bool   `yaml:"enabled"`
	ListenAddress string `yaml:"listen_address"`
	AuthEnabled   bool   `yaml:"auth_enabled"`
	RateLimit     int    `yaml:"rate_limit"`
}

type CollectorConfig struct {
	Name     string `yaml:"name"`
	Schedule string `yaml:"schedule"`
	Enabled  bool   `yaml:"enabled"`
	Mode     string `yaml:"mode"` // full, incremental, event-driven
}

type AuthConfig struct {
	Method      string `yaml:"method"` // mTLS, oauth2
	CertFile    string `yaml:"cert_file"`
	KeyFile     string `yaml:"key_file"`
	TokenURL    string `yaml:"token_url"`
	ClientID    string `yaml:"client_id"`
	ClientSecret string `yaml:"client_secret"`
}

type LoggingConfig struct {
	Level      string `yaml:"level"`       // debug, info, warn, error
	Output     string `yaml:"output"`      // stdout, file
	FilePath   string `yaml:"file_path"`
	MaxSizeMB  int    `yaml:"max_size_mb"`
	MaxBackups int    `yaml:"max_backups"`
}

type TransportConfig struct {
	BatchMaxSizeKB int    `yaml:"batch_max_size_kb"`
	BatchMaxItems  int    `yaml:"batch_max_items"`
	Compression    bool   `yaml:"compression"`
	RetryAttempts  int    `yaml:"retry_attempts"`
	RetryBackoffMS int    `yaml:"retry_backoff_ms"`
	Timeout        int    `yaml:"timeout"`
}

func Load(path string) (*Config, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("failed to read config file: %w", err)
	}

	cfg := &Config{}
	if err := yaml.Unmarshal(data, cfg); err != nil {
		return nil, fmt.Errorf("failed to parse config: %w", err)
	}

	// Set defaults
	if cfg.Agent.DataDir == "" {
		cfg.Agent.DataDir = "/var/lib/cmdb-agent"
	}
	if cfg.Agent.SocketPath == "" {
		cfg.Agent.SocketPath = "/var/run/cmdb-agent.sock"
	}
	if cfg.WebUI.ListenAddress == "" {
		cfg.WebUI.ListenAddress = "127.0.0.1:8080"
	}
	if cfg.WebUI.RateLimit == 0 {
		cfg.WebUI.RateLimit = 60
	}
	if cfg.Transport.BatchMaxSizeKB == 0 {
		cfg.Transport.BatchMaxSizeKB = 512
	}
	if cfg.Transport.BatchMaxItems == 0 {
		cfg.Transport.BatchMaxItems = 50
	}
	if cfg.Transport.RetryAttempts == 0 {
		cfg.Transport.RetryAttempts = 3
	}
	if cfg.Transport.RetryBackoffMS == 0 {
		cfg.Transport.RetryBackoffMS = 1000
	}
	if cfg.Transport.Timeout == 0 {
		cfg.Transport.Timeout = 30
	}

	return cfg, nil
}

func (c *Config) Validate() error {
	if c.Server.Primary == "" {
		return fmt.Errorf("server.primary is required")
	}
	if c.Auth.Method == "" {
		return fmt.Errorf("auth.method is required")
	}
	if c.Auth.Method == "mTLS" {
		if c.Auth.CertFile == "" || c.Auth.KeyFile == "" {
			return fmt.Errorf("auth.cert_file and auth.key_file required for mTLS")
		}
	}
	return nil
}
