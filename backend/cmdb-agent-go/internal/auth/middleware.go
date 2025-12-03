package auth

import (
	"context"
	"encoding/base64"
	"net/http"
	"strings"
	"time"
)

// contextKey is a custom type for context keys
type contextKey string

const (
	userContextKey contextKey = "user"
)

// Middleware provides HTTP middleware for authentication
type Middleware struct {
	auth *Authenticator
}

// NewMiddleware creates authentication middleware
func NewMiddleware(auth *Authenticator) *Middleware {
	return &Middleware{auth: auth}
}

// BasicAuth middleware enforces HTTP Basic Authentication
func (m *Middleware) BasicAuth(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		auth := r.Header.Get("Authorization")
		if auth == "" {
			m.requireAuth(w)
			return
		}

		// Parse Basic Auth header
		if !strings.HasPrefix(auth, "Basic ") {
			m.requireAuth(w)
			return
		}

		payload, err := base64.StdEncoding.DecodeString(auth[6:])
		if err != nil {
			m.requireAuth(w)
			return
		}

		pair := strings.SplitN(string(payload), ":", 2)
		if len(pair) != 2 {
			m.requireAuth(w)
			return
		}

		username, password := pair[0], pair[1]

		// Authenticate user
		user, err := m.auth.Authenticate(username, password)
		if err != nil {
			m.requireAuth(w)
			return
		}

		// Add user to context
		ctx := context.WithValue(r.Context(), userContextKey, user)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// RequirePermission middleware checks if user has specific permission
func (m *Middleware) RequirePermission(perm Permission) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			user := GetUserFromContext(r.Context())
			if user == nil {
				http.Error(w, "Unauthorized", http.StatusUnauthorized)
				return
			}

			if !HasPermission(user.Role, perm) {
				http.Error(w, "Forbidden: insufficient permissions", http.StatusForbidden)
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}

// RequireRole middleware checks if user has specific role
func (m *Middleware) RequireRole(roles ...Role) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			user := GetUserFromContext(r.Context())
			if user == nil {
				http.Error(w, "Unauthorized", http.StatusUnauthorized)
				return
			}

			for _, role := range roles {
				if user.Role == role {
					next.ServeHTTP(w, r)
					return
				}
			}

			http.Error(w, "Forbidden: insufficient role", http.StatusForbidden)
		})
	}
}

// RateLimiter implements simple rate limiting
func (m *Middleware) RateLimiter(requestsPerMinute int) func(http.Handler) http.Handler {
	type client struct {
		requests int
		resetAt  time.Time
	}

	clients := make(map[string]*client)

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ip := r.RemoteAddr

			now := time.Now()
			c, exists := clients[ip]
			if !exists || now.After(c.resetAt) {
				clients[ip] = &client{
					requests: 1,
					resetAt:  now.Add(time.Minute),
				}
				next.ServeHTTP(w, r)
				return
			}

			if c.requests >= requestsPerMinute {
				http.Error(w, "Rate limit exceeded", http.StatusTooManyRequests)
				return
			}

			c.requests++
			next.ServeHTTP(w, r)
		})
	}
}

// requireAuth sends 401 with WWW-Authenticate header
func (m *Middleware) requireAuth(w http.ResponseWriter) {
	w.Header().Set("WWW-Authenticate", `Basic realm="CMDB Agent"`)
	http.Error(w, "Unauthorized", http.StatusUnauthorized)
}

// GetUserFromContext retrieves user from request context
func GetUserFromContext(ctx context.Context) *User {
	user, ok := ctx.Value(userContextKey).(*User)
	if !ok {
		return nil
	}
	return user
}
