> For full workflow context, see docs/project-workflow.md.

## Management System Notice

This repository targets a Lawyer management system.

# Go Development Guide

> Definitive reference for building production Go applications with Gin, sqlc, PostgreSQL, and modern tooling. Synthesized from 60+ authoritative sources including official Go documentation, community best practices, library research, and AI agent skills.

---

## Table of Contents

1. [Guiding Principles](#1-guiding-principles)
2. [Project Structure](#2-project-structure)
3. [Naming Conventions](#3-naming-conventions)
4. [Code Style & Formatting](#4-code-style--formatting)
5. [Error Handling](#5-error-handling)
6. [Concurrency](#6-concurrency)
7. [Interfaces & Types](#7-interfaces--types)
8. [Context Usage](#8-context-usage)
9. [Database Layer (sqlc + pgx + PostgreSQL)](#9-database-layer)
10. [API Layer (Gin)](#10-api-layer-gin)
11. [Middleware](#11-middleware)
12. [Configuration](#12-configuration)
13. [Logging & Observability](#13-logging--observability)
14. [Authentication (JWT)](#14-authentication-jwt)
15. [Validation](#15-validation)
16. [Testing](#16-testing)
17. [Performance](#17-performance)
18. [Security](#18-security)
19. [Tooling & CI/CD](#19-tooling--cicd)
20. [Recommended Library Stack](#20-recommended-library-stack)

---

## 1. Guiding Principles

### Priority Order

1. **Clarity** — purpose and rationale obvious to the reader
2. **Simplicity** — accomplishes the goal in the simplest way
3. **Correctness** — handles edge cases, errors, and concurrency safely
4. **Maintainability** — easy to modify without breaking other parts
5. **Consistency** — matches surrounding code conventions

### Rules

- Code is read far more than written. Optimize for the reader.
- If you can't understand it in 30 seconds, it's too complex.
- No premature abstraction. Don't create interfaces, helpers, or layers before you need them.
- Follow existing patterns in the codebase. Uniformity beats personal preference.
- `gofmt` settles all formatting debates. Don't fight it.

---

## 2. Project Structure

### Standard Layout

```
project/
├── cmd/
│   └── api/
│       └── main.go                 # Entry point — wiring only
├── internal/
│   ├── config/
│   │   └── config.go               # Viper-based config loading
│   ├── handler/
│   │   └── user_handler.go         # HTTP handlers (transport layer)
│   ├── service/
│   │   └── user_service.go         # Business logic
│   ├── repository/                  # Data access (optional — sqlc can serve as repo)
│   ├── model/
│   │   └── user.go                 # Domain types, request/response structs
│   ├── middleware/
│   │   ├── auth.go                 # JWT auth middleware
│   │   ├── cors.go                 # CORS middleware
│   │   ├── logger.go               # Request logging middleware
│   │   └── error.go                # Error recovery middleware
│   └── router/
│       └── router.go               # Route registration
├── db/
│   ├── migrations/
│   │   ├── 000001_init.up.sql
│   │   └── 000001_init.down.sql
│   ├── queries/
│   │   └── user.sql                # sqlc queries
│   └── sqlc/                       # Generated code (do not edit)
├── pkg/
│   └── response/
│       └── response.go             # Shared response helpers
├── docs/
│   └── golang-guide.md             # This file
├── go.mod
├── go.sum
├── sqlc.yaml
├── Makefile
├── Dockerfile
├── docker-compose.yml
├── .env.example
├── .gitignore
└── .golangci.yml
```

### Layer Dependency Flow

```
main.go → router → handler → service → db/sqlc (generated)
              ↓          ↓         ↓
          middleware   model    config
```

**Rules:**
- `cmd/api/main.go` only does wiring (config load → DB connect → create services → create handlers → setup router → start server)
- `internal/` is the architectural boundary — nothing outside can import it
- Handlers call services; services call sqlc-generated queries
- Service layer defines the interfaces it needs (not the data layer)
- No circular imports — dependencies flow one direction

---

## 3. Naming Conventions

### Identifiers

| Kind | Convention | Example |
|------|-----------|---------|
| Exported | MixedCaps starting uppercase | `UserService`, `HandleCreate` |
| Unexported | mixedCaps starting lowercase | `userRepo`, `validateInput` |
| Acronyms | Consistent case | `HTTPServer`, `userID`, `apiURL` |
| Receiver | 1-2 letter abbreviation of type | `func (s *Server) Start()` |
| Loop vars | Single letter | `for i, v := range items` |
| Context | Always `ctx` | `func Get(ctx context.Context) {}` |
| Database | `db` for pool, `tx` for transaction | — |

### Functions

- Name for the result: `Owner()` not `GetOwner()`
- Setters use `Set` prefix: `SetOwner()`
- Constructors: `NewClient()`, `NewServer()`
- Booleans: `IsValid()`, `HasPermission()`, `CanDelete()`

### Packages

- Short, lowercase, single word: `user`, `config`, `handler`
- No `utils`, `helpers`, `common`, `base`, `shared`
- Package name is part of caller's namespace: `config.Load()` not `config.LoadConfig()`

### Errors

- Sentinel errors: `var ErrNotFound = errors.New("not found")`
- Error types: `type ValidationError struct{}`
- Error strings: lowercase, no punctuation, no "failed to" prefix

---

## 4. Code Style & Formatting

### Formatting

Run `gofmt` and `goimports` on all files. Non-negotiable.

### Import Grouping

```go
import (
    "context"           // 1. Standard library
    "fmt"
    "net/http"

    "github.com/gin-gonic/gin"       // 2. Third-party
    "github.com/jackc/pgx/v5"

    "github.com/yourproject/internal/handler"  // 3. Internal
)
```

### Guard Clauses

Handle errors first, return early. Keep the happy path at minimal indentation.

```go
func (s *UserService) Get(ctx context.Context, id string) (*User, error) {
    if id == "" {
        return nil, ErrInvalidInput
    }

    user, err := s.queries.GetUser(ctx, id)
    if err != nil {
        return nil, fmt.Errorf("get user %s: %w", id, err)
    }

    return &user, nil
}
```

### Declarations

- `var x Type` for zero values
- `x := value` for initialized values
- Use field names in struct literals: `User{Name: "Alice", Email: "a@b.com"}`
- Omit zero-value fields

---

## 5. Error Handling

### Core Rules

1. **Always handle errors.** Never use `_` without explicit justification.
2. **Wrap with context** using `%w`: `fmt.Errorf("get user: %w", err)`
3. **Handle once.** Don't log AND return the same error.
4. **Return early.** Handle error first, then continue with success path.
5. **No panic in production.** Use recovery middleware at the HTTP boundary only.

### Error Wrapping

```go
// Within module boundaries — preserve chain for errors.Is/errors.As
return fmt.Errorf("get user %s: %w", id, err)

// At API boundaries — hide internal details
return fmt.Errorf("database unavailable: %v", err)

// Succinct context (errors compose during propagation)
return fmt.Errorf("new store: %w", err)   // NOT "failed to create new store"
```

### Error Types

| Caller needs to match? | Static? | Approach |
|------------------------|---------|----------|
| No | Yes | `errors.New("something bad")` |
| No | No | `fmt.Errorf("file %q not found", file)` |
| Yes | Yes | `var ErrNotFound = errors.New("not found")` |
| Yes | No | Custom type with `Error()` method |

### Error Propagation by Layer

```
Handler:    Map domain error → HTTP status code (400, 404, 500)
Service:    Domain errors (ErrNotFound, ErrConflict, ErrValidation)
Repository: Infrastructure errors (DB timeout, constraint violation)
```

### errors.Is and errors.As

```go
// Check sentinel errors
if errors.Is(err, ErrNotFound) {
    c.JSON(http.StatusNotFound, gin.H{"error": "resource not found"})
    return
}

// Check error types
var validErr *ValidationError
if errors.As(err, &validErr) {
    c.JSON(http.StatusBadRequest, gin.H{"error": validErr.Error()})
    return
}
```

### Joining Multiple Errors (Go 1.20+)

```go
func validate(u User) error {
    var errs []error
    if u.Name == "" {
        errs = append(errs, errors.New("name required"))
    }
    if u.Email == "" {
        errs = append(errs, errors.New("email required"))
    }
    return errors.Join(errs...)
}
```

---

## 6. Concurrency

### Rules

1. Every goroutine must have a clear exit path (context cancellation, channel close, or WaitGroup)
2. Pass `context.Context` as first parameter to all blocking/long operations
3. Prefer `errgroup.Group` over raw `sync.WaitGroup` for error-returning goroutines
4. Channels should be size 0 (unbuffered) or 1. Larger buffers need justification.
5. Prefer synchronous functions. Let callers add concurrency.
6. Don't communicate by sharing memory — share memory by communicating.

### errgroup (Preferred for Concurrent Operations)

```go
func (s *Service) FetchAll(ctx context.Context, ids []string) ([]*User, error) {
    g, ctx := errgroup.WithContext(ctx)
    g.SetLimit(10)
    users := make([]*User, len(ids))

    for i, id := range ids {
        g.Go(func() error {
            u, err := s.GetUser(ctx, id)
            if err != nil {
                return err
            }
            users[i] = u
            return nil
        })
    }
    return users, g.Wait()
}
```

### Worker Pool

```go
func WorkerPool(ctx context.Context, jobs <-chan Job, results chan<- Result, workers int) {
    var wg sync.WaitGroup
    for i := 0; i < workers; i++ {
        wg.Add(1)
        go func() {
            defer wg.Done()
            for {
                select {
                case <-ctx.Done():
                    return
                case job, ok := <-jobs:
                    if !ok {
                        return
                    }
                    results <- process(job)
                }
            }
        }()
    }
    wg.Wait()
    close(results)
}
```

### Mutex Usage

Use when channels aren't cleaner for the use case:

```go
type Cache struct {
    mu   sync.RWMutex
    data map[string]string
}

func (c *Cache) Get(key string) (string, bool) {
    c.mu.RLock()
    defer c.mu.RUnlock()
    v, ok := c.data[key]
    return v, ok
}

func (c *Cache) Set(key, value string) {
    c.mu.Lock()
    defer c.mu.Unlock()
    c.data[key] = value
}
```

---

## 7. Interfaces & Types

### Rules

1. **Accept interfaces, return structs** — functions take interface params, return concrete types
2. **Define interfaces at the consumer** — not at the implementation
3. **Keep interfaces small** — prefer single-method interfaces, compose as needed
4. **Zero value should be useful** — design types so they work without explicit initialization

### Interface Definition (at Consumer)

```go
// service/user.go — consumer defines what it needs
type UserStore interface {
    GetByID(ctx context.Context, id string) (*model.User, error)
    Create(ctx context.Context, user *model.User) error
}

type UserService struct {
    store UserStore
}
```

### Functional Options

```go
type Option func(*Server)

func WithTimeout(d time.Duration) Option {
    return func(s *Server) { s.timeout = d }
}

func WithLogger(l *zerolog.Logger) Option {
    return func(s *Server) { s.logger = l }
}

func NewServer(addr string, opts ...Option) *Server {
    s := &Server{addr: addr, timeout: 30 * time.Second}
    for _, opt := range opts {
        opt(s)
    }
    return s
}
```

### Generics (Go 1.18+)

Use when you find yourself writing the same code for different types:

```go
func Filter[T any](slice []T, predicate func(T) bool) []T {
    result := make([]T, 0, len(slice))
    for _, v := range slice {
        if predicate(v) {
            result = append(result, v)
        }
    }
    return result
}
```

Don't over-generalize — use a concrete type or interface when it suffices.

---

## 8. Context Usage

### Rules

1. Always the first parameter: `func DoX(ctx context.Context, ...) error`
2. Never store in a struct field
3. Call `defer cancel()` immediately after creating cancelable contexts
4. Check `ctx.Done()` in long-running loops
5. Use for deadlines and cancellation, not for passing optional parameters

### Patterns

```go
// Timeout for external calls
ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
defer cancel()

// In long-running loops
for {
    select {
    case <-ctx.Done():
        return ctx.Err()
    case job := <-jobs:
        process(job)
    }
}
```

---

## 9. Database Layer

### Stack: sqlc + pgx/v5 + golang-migrate + PostgreSQL

#### sqlc Configuration

```yaml
# sqlc.yaml
version: "2"
sql:
  - engine: "postgresql"
    queries: "db/queries/"
        schema: "../migrations/"
    gen:
      go:
        package: "sqlc"
        out: "db/sqlc"
        sql_package: "pgx/v5"
        emit_json_tags: true
        emit_empty_slices: true
```

#### Migration Files

```sql
-- migrations/000001_init.up.sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- migrations/000001_init.down.sql
DROP TABLE IF EXISTS users;
```

#### sqlc Query Files

```sql
-- db/queries/user.sql

-- name: GetUser :one
SELECT * FROM users WHERE id = $1;

-- name: ListUsers :many
SELECT * FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2;

-- name: CreateUser :one
INSERT INTO users (name, email) VALUES ($1, $2)
RETURNING *;

-- name: UpdateUser :one
UPDATE users SET name = $1, email = $2, updated_at = NOW()
WHERE id = $3
RETURNING *;

-- name: DeleteUser :exec
DELETE FROM users WHERE id = $1;
```

#### Database Connection (pgx)

```go
package config

import (
    "context"
    "github.com/jackc/pgx/v5/pgxpool"
)

func NewDBPool(ctx context.Context, databaseURL string) (*pgxpool.Pool, error) {
    config, err := pgxpool.ParseConfig(databaseURL)
    if err != nil {
        return nil, fmt.Errorf("parse db config: %w", err)
    }

    config.MaxConns = 25
    config.MinConns = 5

    pool, err := pgxpool.NewWithConfig(ctx, config)
    if err != nil {
        return nil, fmt.Errorf("create db pool: %w", err)
    }

    if err := pool.Ping(ctx); err != nil {
        return nil, fmt.Errorf("ping db: %w", err)
    }

    return pool, nil
}
```

#### Migration Runner

```bash
# Install
go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest

# Create migration
migrate create -ext sql -dir migrations -seq init

# Run migrations
migrate -path migrations -database "$DATABASE_URL" up

# Rollback
migrate -path migrations -database "$DATABASE_URL" down 1
```

---

## 10. API Layer (Gin)

### Route Setup

```go
func SetupRouter(h *handler.UserHandler, mw *middleware.Middleware) *gin.Engine {
    r := gin.New()
    r.Use(mw.Logger(), mw.Recovery(), mw.CORS())

    api := r.Group("/api/v1")
    {
        users := api.Group("/users")
        {
            users.GET("", h.List)
            users.GET("/:id", h.Get)
            users.POST("", h.Create)
            users.PUT("/:id", h.Update)
            users.DELETE("/:id", h.Delete)
        }
    }

    r.GET("/health", func(c *gin.Context) {
        c.JSON(http.StatusOK, gin.H{"status": "ok"})
    })

    return r
}
```

### Handler Pattern

```go
type UserHandler struct {
    svc *service.UserService
}

func NewUserHandler(svc *service.UserService) *UserHandler {
    return &UserHandler{svc: svc}
}

func (h *UserHandler) Create(c *gin.Context) {
    var req model.CreateUserRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    user, err := h.svc.Create(c.Request.Context(), &req)
    if err != nil {
        handleError(c, err)
        return
    }

    c.JSON(http.StatusCreated, user)
}

func handleError(c *gin.Context, err error) {
    switch {
    case errors.Is(err, service.ErrNotFound):
        c.JSON(http.StatusNotFound, gin.H{"error": "resource not found"})
    case errors.Is(err, service.ErrConflict):
        c.JSON(http.StatusConflict, gin.H{"error": "resource already exists"})
    case errors.Is(err, service.ErrValidation):
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
    default:
        c.JSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
    }
}
```

### Request/Response Models

```go
type CreateUserRequest struct {
    Name  string `json:"name" binding:"required,min=1,max=255"`
    Email string `json:"email" binding:"required,email"`
}

type UserResponse struct {
    ID        string    `json:"id"`
    Name      string    `json:"name"`
    Email     string    `json:"email"`
    CreatedAt time.Time `json:"created_at"`
}
```

### Graceful Shutdown

```go
func main() {
    // ... setup ...

    srv := &http.Server{
        Addr:    ":" + cfg.Port,
        Handler: router,
    }

    go func() {
        if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
            log.Fatal().Err(err).Msg("server failed")
        }
    }()

    quit := make(chan os.Signal, 1)
    signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
    <-quit

    ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
    defer cancel()

    if err := srv.Shutdown(ctx); err != nil {
        log.Fatal().Err(err).Msg("forced shutdown")
    }
}
```

---

## 11. Middleware

### Logger Middleware (zerolog)

```go
func LoggerMiddleware(logger *zerolog.Logger) gin.HandlerFunc {
    return func(c *gin.Context) {
        start := time.Now()
        c.Next()

        logger.Info().
            Str("method", c.Request.Method).
            Str("path", c.Request.URL.Path).
            Int("status", c.Writer.Status()).
            Dur("latency", time.Since(start)).
            Str("ip", c.ClientIP()).
            Msg("request")
    }
}
```

### Recovery Middleware

```go
func RecoveryMiddleware(logger *zerolog.Logger) gin.HandlerFunc {
    return func(c *gin.Context) {
        defer func() {
            if r := recover(); r != nil {
                logger.Error().Interface("panic", r).Str("stack", string(debug.Stack())).Msg("panic recovered")
                c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "internal server error"})
            }
        }()
        c.Next()
    }
}
```

### CORS Middleware

```go
func CORSMiddleware(allowOrigins []string) gin.HandlerFunc {
    return cors.New(cors.Config{
        AllowOrigins:     allowOrigins,
        AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
        AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
        ExposeHeaders:    []string{"Content-Length"},
        AllowCredentials: true,
        MaxAge:           12 * time.Hour,
    })
}
```

### Auth Middleware (JWT)

```go
func AuthMiddleware(secret string) gin.HandlerFunc {
    return func(c *gin.Context) {
        tokenStr := extractToken(c)
        if tokenStr == "" {
            c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "missing token"})
            return
        }

        claims := &jwt.RegisteredClaims{}
        token, err := jwt.ParseWithClaims(tokenStr, claims, func(t *jwt.Token) (interface{}, error) {
            if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
                return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
            }
            return []byte(secret), nil
        })

        if err != nil || !token.Valid {
            c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
            return
        }

        c.Set("user_id", claims.Subject)
        c.Next()
    }
}

func extractToken(c *gin.Context) string {
    bearer := c.GetHeader("Authorization")
    if len(bearer) > 7 && bearer[:7] == "Bearer " {
        return bearer[7:]
    }
    return ""
}
```

---

## 12. Configuration

### Viper-based Config

```go
type Config struct {
    Port        string `mapstructure:"PORT"`
    DatabaseURL string `mapstructure:"DATABASE_URL"`
    JWTSecret   string `mapstructure:"JWT_SECRET"`
    Environment string `mapstructure:"ENVIRONMENT"`
    LogLevel    string `mapstructure:"LOG_LEVEL"`
    CORSOrigins string `mapstructure:"CORS_ORIGINS"`
}

func LoadConfig(path string) (*Config, error) {
    viper.SetConfigFile(path + "/.env")
    viper.AutomaticEnv()

    if err := viper.ReadInConfig(); err != nil {
        // .env file is optional; environment variables take precedence
    }

    var cfg Config
    if err := viper.Unmarshal(&cfg); err != nil {
        return nil, fmt.Errorf("unmarshal config: %w", err)
    }

    return &cfg, nil
}
```

### .env.example

```env
PORT=8080
DATABASE_URL=postgres://user:pass@localhost:5432/dbname?sslmode=disable
JWT_SECRET=your-secret-key-change-in-production
ENVIRONMENT=development
LOG_LEVEL=debug
CORS_ORIGINS=http://localhost:3000
```

### Rules

- Never hardcode configuration values
- Environment variables override config files
- Use `mapstructure` tags for Viper binding
- Validate required config at startup (fail fast)
- Secrets only from environment variables, never committed

---

## 13. Logging & Observability

### zerolog (Recommended)

```go
func NewLogger(level string) zerolog.Logger {
    lvl, err := zerolog.ParseLevel(level)
    if err != nil {
        lvl = zerolog.InfoLevel
    }

    return zerolog.New(os.Stdout).
        Level(lvl).
        With().
        Timestamp().
        Caller().
        Logger()
}
```

### Usage

```go
log.Info().Str("user_id", id).Msg("user created")
log.Error().Err(err).Str("operation", "db_query").Msg("query failed")
log.Debug().Int("count", len(users)).Msg("users fetched")
```

### Rules

- Structured logging (JSON) for all production logs
- Include request ID/trace ID in every log entry
- Log at appropriate levels: Debug (dev), Info (events), Warn (recoverable), Error (failures)
- Don't log sensitive data (passwords, tokens, PII)
- Log errors at the point of handling, not at every level

---

## 14. Authentication (JWT)

### Token Generation

```go
func GenerateToken(userID string, secret string, expiry time.Duration) (string, error) {
    claims := jwt.RegisteredClaims{
        Subject:   userID,
        ExpiresAt: jwt.NewNumericDate(time.Now().Add(expiry)),
        IssuedAt:  jwt.NewNumericDate(time.Now()),
    }

    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    return token.SignedString([]byte(secret))
}
```

### Rules

- Use `jwt.SigningMethodHS256` for HMAC or `jwt.SigningMethodRS256` for RSA
- Always validate the signing method in the parse callback
- Set reasonable expiry times (access: 15min, refresh: 7d)
- Store refresh tokens securely
- Never put sensitive data in JWT payload (it's base64, not encrypted)

---

## 15. Validation

### Gin's Built-in Validation (go-playground/validator)

```go
type CreateUserRequest struct {
    Name  string `json:"name" binding:"required,min=1,max=255"`
    Email string `json:"email" binding:"required,email"`
    Age   int    `json:"age" binding:"omitempty,gte=0,lte=150"`
}

// In handler
if err := c.ShouldBindJSON(&req); err != nil {
    c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
    return
}
```

### Common Validation Tags

| Tag | Description |
|-----|------------|
| `required` | Field must be present and non-zero |
| `email` | Valid email format |
| `min=N` / `max=N` | Min/max length (string) or value (number) |
| `gte=N` / `lte=N` | Greater/less than or equal |
| `oneof=a b c` | Must be one of the listed values |
| `uuid` | Valid UUID format |
| `url` | Valid URL format |

---

## 16. Testing

### TDD Workflow

```
RED → Write a failing test
GREEN → Write minimal code to pass
REFACTOR → Improve while keeping tests green
```

### Table-Driven Tests (Default Pattern)

```go
func TestUserService_Create(t *testing.T) {
    tests := []struct {
        name    string
        input   *model.CreateUserRequest
        want    *model.User
        wantErr bool
    }{
        {
            name:  "valid user",
            input: &model.CreateUserRequest{Name: "Alice", Email: "alice@example.com"},
            want:  &model.User{Name: "Alice", Email: "alice@example.com"},
        },
        {
            name:    "empty name",
            input:   &model.CreateUserRequest{Name: "", Email: "alice@example.com"},
            wantErr: true,
        },
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            svc := setupTestService(t)
            got, err := svc.Create(context.Background(), tt.input)
            if (err != nil) != tt.wantErr {
                t.Fatalf("err = %v, wantErr %v", err, tt.wantErr)
            }
            if tt.want != nil && got.Name != tt.want.Name {
                t.Errorf("got name %q, want %q", got.Name, tt.want.Name)
            }
        })
    }
}
```

### HTTP Handler Testing

```go
func TestUserHandler_Get(t *testing.T) {
    router := setupTestRouter(t)

    w := httptest.NewRecorder()
    req := httptest.NewRequest("GET", "/api/v1/users/123", nil)
    router.ServeHTTP(w, req)

    if w.Code != http.StatusOK {
        t.Errorf("got status %d, want %d", w.Code, http.StatusOK)
    }
}
```

### Interface-Based Mocking

```go
type MockUserStore struct {
    GetByIDFunc func(ctx context.Context, id string) (*model.User, error)
}

func (m *MockUserStore) GetByID(ctx context.Context, id string) (*model.User, error) {
    return m.GetByIDFunc(ctx, id)
}
```

### Coverage Targets

| Code Type | Target |
|-----------|--------|
| Business logic | 100% |
| Public APIs | 90%+ |
| General code | 80%+ |
| Generated code (sqlc) | Exclude |

### Commands

```bash
go test ./...                        # All tests
go test -race ./...                  # With race detector
go test -cover ./...                 # With coverage
go test -coverprofile=c.out ./...    # Coverage profile
go tool cover -html=c.out           # View in browser
go test -bench=. -benchmem ./...    # Benchmarks
```

---

## 17. Performance

### Slice Preallocation

```go
result := make([]Item, 0, len(input))
for _, v := range input {
    result = append(result, transform(v))
}
```

### String Building

```go
var sb strings.Builder
for _, s := range parts {
    sb.WriteString(s)
}
return sb.String()
```

### sync.Pool for Frequent Allocations

```go
var bufPool = sync.Pool{
    New: func() interface{} { return new(bytes.Buffer) },
}

func process(data []byte) {
    buf := bufPool.Get().(*bytes.Buffer)
    defer func() { buf.Reset(); bufPool.Put(buf) }()
    buf.Write(data)
}
```

### Profiling

```go
import _ "net/http/pprof"

// Access at /debug/pprof/ (remove in production)
```

```bash
go tool pprof http://localhost:8080/debug/pprof/heap
go tool pprof http://localhost:8080/debug/pprof/profile?seconds=30
```

---

## 18. Security

### Input Validation

- Validate all external inputs at the handler boundary
- Use binding tags for automatic validation
- Sanitize data before logging (no PII leaks)

### SQL Injection Prevention

sqlc generates parameterized queries by default — no manual string interpolation needed. Never build SQL strings manually.

### Authentication & Authorization

- JWT validation in middleware (before handlers)
- Always check signing method in parse callback
- Use HTTPS in production

### Secrets Management

- Never commit secrets to version control
- Load from environment variables only
- Use `.env.example` for documentation (no real values)
- Rotate secrets regularly

### CORS

- Whitelist specific origins (never `*` in production with credentials)
- Limit allowed methods and headers

### Rate Limiting

```go
import "go.uber.org/ratelimit"

rl := ratelimit.New(100) // 100 requests per second
rl.Take()                // Blocks until rate allows
```

---

## 19. Tooling & CI/CD

### Essential Commands

```bash
go build ./...              # Build
go run ./cmd/api            # Run
go vet ./...                # Static analysis
golangci-lint run           # Comprehensive linting
go mod tidy                 # Clean dependencies
go mod verify               # Verify checksums
sqlc generate               # Generate DB code
migrate -path migrations -database "$DATABASE_URL" up  # Run migrations
```

### golangci-lint Configuration

```yaml
# .golangci.yml
linters:
  enable:
    - errcheck
    - gosimple
    - govet
    - ineffassign
    - staticcheck
    - unused
    - gofmt
    - goimports
    - misspell
    - unconvert
    - unparam

linters-settings:
  errcheck:
    check-type-assertions: true
  govet:
    check-shadowing: true

issues:
  exclude-use-default: false
```

### Makefile

```makefile
.PHONY: run build test lint migrate-up migrate-down sqlc

run:
	go run ./cmd/api

build:
	go build -o bin/api ./cmd/api

test:
	go test -race -cover ./...

lint:
	golangci-lint run

migrate-up:
    migrate -path ../migrations -database "$$DATABASE_URL" up

migrate-down:
    migrate -path ../migrations -database "$$DATABASE_URL" down 1

sqlc:
	sqlc generate
```

### Dockerfile

```dockerfile
FROM golang:1.26-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o /api ./cmd/api

FROM alpine:3.20
RUN apk --no-cache add ca-certificates
COPY --from=builder /api /api
EXPOSE 8080
CMD ["/api"]
```

### docker-compose.yml

```yaml
services:
  api:
    build: .
    ports:
      - "8080:8080"
    environment:
      - DATABASE_URL=postgres://user:pass@db:5432/app?sslmode=disable
    depends_on:
      db:
        condition: service_healthy

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: app
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user -d app"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  pgdata:
```

### CI Pipeline Checklist

- [ ] `go vet ./...`
- [ ] `golangci-lint run`
- [ ] `go test -race -cover ./...`
- [ ] Coverage threshold (80%+)
- [ ] `sqlc vet` (validate queries)
- [ ] Docker build succeeds
- [ ] Vulnerability scanning

---

## 20. Recommended Library Stack

| Category | Library | Version | Purpose |
|----------|---------|---------|---------|
| Web Framework | gin-gonic/gin | v1.12.0 | HTTP routing, middleware, binding |
| SQL Generator | sqlc-dev/sqlc | v1.30.0 | Type-safe SQL → Go code |
| PostgreSQL Driver | jackc/pgx/v5 | v5 | Connection pool, 70+ PG types |
| Migrations | golang-migrate/migrate | v4.19.1 | Up/down SQL migrations |
| Config | spf13/viper | v1.21.0 | Files + env vars + flags |
| Logging | rs/zerolog | latest | Zero-allocation structured JSON |
| Validation | go-playground/validator | v10.30.1 | Struct/field validation (Gin default) |
| JWT | golang-jwt/jwt | v5.3.1 | Token signing/verification |
| UUID | google/uuid | v1.6.0 | UUID v4/v7 generation |
| Testing | Go standard `testing` | installed | Table-driven tests and small hand-written mocks |
| Mocking | not installed | n/a | Prefer narrow consumer-owned interfaces; add mock tooling only by explicit decision |
| Rate Limiting | in-repo middleware | n/a | `common-api/internal/middleware/rate_limit.go` |
| API Docs | not installed | n/a | Swag/Swagger is future tooling; see `docs/project-workflow.md` |
| Linting | golangci/golangci-lint | v2.11.3 | 100+ linters |
| Live Reload | air-verse/air | v1.64.5 | Hot reload in development |
| Env Loading | joho/godotenv | v1.5.1 | .env file support |

### DI Approach

Use manual dependency injection in `main.go`. No framework needed — Go's explicit style makes DI straightforward. Wire (google/wire) is archived as of August 2025.
