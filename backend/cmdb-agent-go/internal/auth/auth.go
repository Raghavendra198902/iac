package auth

import (
	"crypto/rand"
	"crypto/subtle"
	"encoding/base64"
	"errors"
	"time"

	"golang.org/x/crypto/bcrypt"
)

// User represents an authenticated user
type User struct {
	Username  string    `json:"username"`
	Role      Role      `json:"role"`
	CreatedAt time.Time `json:"created_at"`
	LastLogin time.Time `json:"last_login"`
}

// Role defines user permissions
type Role string

const (
	RoleAdmin    Role = "admin"     // Full access
	RoleOperator Role = "operator"  // Can trigger collections and view data
	RoleViewer   Role = "viewer"    // Read-only access
)

// Permission defines what actions a role can perform
type Permission string

const (
	PermViewStatus      Permission = "view:status"
	PermViewInventory   Permission = "view:inventory"
	PermViewLogs        Permission = "view:logs"
	PermTriggerScan     Permission = "trigger:scan"
	PermFlushQueue      Permission = "flush:queue"
	PermUpdateAgent     Permission = "update:agent"
	PermEnroll          Permission = "enroll:agent"
	PermManagePolicies  Permission = "manage:policies"
	PermEnforceActions  Permission = "enforce:actions"
	PermViewMetrics     Permission = "view:metrics"
	PermConfigureAgent  Permission = "configure:agent"
)

// RolePermissions maps roles to their permissions
var RolePermissions = map[Role][]Permission{
	RoleAdmin: {
		PermViewStatus,
		PermViewInventory,
		PermViewLogs,
		PermTriggerScan,
		PermFlushQueue,
		PermUpdateAgent,
		PermEnroll,
		PermManagePolicies,
		PermEnforceActions,
		PermViewMetrics,
		PermConfigureAgent,
	},
	RoleOperator: {
		PermViewStatus,
		PermViewInventory,
		PermViewLogs,
		PermTriggerScan,
		PermFlushQueue,
		PermViewMetrics,
	},
	RoleViewer: {
		PermViewStatus,
		PermViewInventory,
		PermViewLogs,
		PermViewMetrics,
	},
}

// Authenticator handles user authentication
type Authenticator struct {
	users map[string]*StoredUser
}

// StoredUser contains user credentials
type StoredUser struct {
	Username     string
	PasswordHash string
	Role         Role
	CreatedAt    time.Time
	LastLogin    time.Time
}

// NewAuthenticator creates a new authenticator
func NewAuthenticator() *Authenticator {
	return &Authenticator{
		users: make(map[string]*StoredUser),
	}
}

// AddUser adds a new user with hashed password
func (a *Authenticator) AddUser(username, password string, role Role) error {
	if username == "" || password == "" {
		return errors.New("username and password required")
	}

	if _, exists := a.users[username]; exists {
		return errors.New("user already exists")
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	a.users[username] = &StoredUser{
		Username:     username,
		PasswordHash: string(hash),
		Role:         role,
		CreatedAt:    time.Now(),
		LastLogin:    time.Time{},
	}

	return nil
}

// Authenticate verifies username and password
func (a *Authenticator) Authenticate(username, password string) (*User, error) {
	stored, exists := a.users[username]
	if !exists {
		return nil, errors.New("invalid credentials")
	}

	err := bcrypt.CompareHashAndPassword([]byte(stored.PasswordHash), []byte(password))
	if err != nil {
		return nil, errors.New("invalid credentials")
	}

	// Update last login
	stored.LastLogin = time.Now()

	return &User{
		Username:  stored.Username,
		Role:      stored.Role,
		CreatedAt: stored.CreatedAt,
		LastLogin: stored.LastLogin,
	}, nil
}

// ChangePassword updates user password
func (a *Authenticator) ChangePassword(username, oldPassword, newPassword string) error {
	stored, exists := a.users[username]
	if !exists {
		return errors.New("user not found")
	}

	// Verify old password
	err := bcrypt.CompareHashAndPassword([]byte(stored.PasswordHash), []byte(oldPassword))
	if err != nil {
		return errors.New("invalid old password")
	}

	// Hash new password
	hash, err := bcrypt.GenerateFromPassword([]byte(newPassword), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	stored.PasswordHash = string(hash)
	return nil
}

// HasPermission checks if a role has a specific permission
func HasPermission(role Role, perm Permission) bool {
	perms, exists := RolePermissions[role]
	if !exists {
		return false
	}

	for _, p := range perms {
		if p == perm {
			return true
		}
	}
	return false
}

// GetUser retrieves user info
func (a *Authenticator) GetUser(username string) (*User, error) {
	stored, exists := a.users[username]
	if !exists {
		return nil, errors.New("user not found")
	}

	return &User{
		Username:  stored.Username,
		Role:      stored.Role,
		CreatedAt: stored.CreatedAt,
		LastLogin: stored.LastLogin,
	}, nil
}

// ListUsers returns all users (without password hashes)
func (a *Authenticator) ListUsers() []*User {
	users := make([]*User, 0, len(a.users))
	for _, stored := range a.users {
		users = append(users, &User{
			Username:  stored.Username,
			Role:      stored.Role,
			CreatedAt: stored.CreatedAt,
			LastLogin: stored.LastLogin,
		})
	}
	return users
}

// DeleteUser removes a user
func (a *Authenticator) DeleteUser(username string) error {
	if _, exists := a.users[username]; !exists {
		return errors.New("user not found")
	}
	delete(a.users, username)
	return nil
}

// GenerateAPIKey creates a random API key
func GenerateAPIKey() (string, error) {
	b := make([]byte, 32)
	_, err := rand.Read(b)
	if err != nil {
		return "", err
	}
	return base64.URLEncoding.EncodeToString(b), nil
}

// SecureCompare performs constant-time string comparison
func SecureCompare(a, b string) bool {
	return subtle.ConstantTimeCompare([]byte(a), []byte(b)) == 1
}
