package config

import (
	"os"
	"testing"
)

func TestLoadConfig(t *testing.T) {
	// Create temp config file
	configYAML := `
server:
  primary: https://cmdb.example.com:8443
  ca_bundle: /etc/cmdb-agent/ca.pem

agent:
  version: 1.0.0
  collectors:
    - name: system
      schedule: "@hourly"
      enabled: true

auth:
  method: mTLS
  cert_file: /etc/cmdb-agent/agent.crt
  key_file: /etc/cmdb-agent/agent.key

logging:
  level: info
  output: stdout

transport:
  batch_max_size_kb: 512
  batch_max_items: 50
  compression: true
`

	tmpFile, err := os.CreateTemp("", "config-*.yaml")
	if err != nil {
		t.Fatal(err)
	}
	defer os.Remove(tmpFile.Name())

	if _, err := tmpFile.Write([]byte(configYAML)); err != nil {
		t.Fatal(err)
	}
	tmpFile.Close()

	// Load config
	cfg, err := Load(tmpFile.Name())
	if err != nil {
		t.Fatalf("Failed to load config: %v", err)
	}

	// Validate
	if cfg.Server.Primary != "https://cmdb.example.com:8443" {
		t.Error("Server primary mismatch")
	}

	if cfg.Agent.Version != "1.0.0" {
		t.Error("Agent version mismatch")
	}

	if len(cfg.Agent.Collectors) != 1 {
		t.Error("Expected 1 collector")
	}

	if cfg.Auth.Method != "mTLS" {
		t.Error("Auth method mismatch")
	}

	if cfg.Transport.BatchMaxSizeKB != 512 {
		t.Error("Transport batch size mismatch")
	}
}

func TestConfigValidation(t *testing.T) {
	tests := []struct {
		name    string
		cfg     *Config
		wantErr bool
	}{
		{
			name: "valid mTLS config",
			cfg: &Config{
				Server: ServerConfig{Primary: "https://test.com"},
				Auth: AuthConfig{
					Method:   "mTLS",
					CertFile: "/path/to/cert",
					KeyFile:  "/path/to/key",
				},
			},
			wantErr: false,
		},
		{
			name: "missing server",
			cfg: &Config{
				Auth: AuthConfig{Method: "mTLS"},
			},
			wantErr: true,
		},
		{
			name: "missing auth method",
			cfg: &Config{
				Server: ServerConfig{Primary: "https://test.com"},
			},
			wantErr: true,
		},
		{
			name: "mTLS without certs",
			cfg: &Config{
				Server: ServerConfig{Primary: "https://test.com"},
				Auth:   AuthConfig{Method: "mTLS"},
			},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := tt.cfg.Validate()
			if (err != nil) != tt.wantErr {
				t.Errorf("Validate() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}
