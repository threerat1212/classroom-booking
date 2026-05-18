# Classroom & Meeting Room Management System

A full-stack web application for managing classroom and meeting room bookings, assignments, attendance, grades, and gamification badges.

## Tech Stack

**Backend:**
- Go 1.23 + Gin web framework
- PostgreSQL 16 with pgx driver
- JWT authentication with refresh tokens
- sqlc for type-safe SQL
- zerolog for structured logging

**Frontend:**
- Next.js 16 + React 19 + TypeScript
- Tailwind CSS 4 + shadcn/ui components
- TanStack Query for data fetching
- Zod for schema validation

## Project Structure

```
├── common-api/          # Go backend API
│   ├── cmd/api/         # Entry point
│   ├── internal/        # Core application code
│   ├── db/queries/      # sqlc queries
│   └── pkg/             # Shared packages
├── web/                 # Next.js frontend
│   ├── app/             # App Router pages
│   ├── components/ui/   # shadcn/ui components
│   ├── lib/             # Utilities, API clients, schemas
│   └── hooks/           # React hooks
├── migrations/            # Database migrations
├── docs/                  # Documentation
├── Makefile
└── docker-compose.yml
```

## Quick Start

### Prerequisites
- Go 1.23+
- Node.js 20+
- PostgreSQL 16+
- Docker (optional)

### 1. Environment Setup

```bash
cp .env.example .env
```

Edit `.env` with your database credentials and JWT secrets.

### 2. Start Database

```bash
make db-up
```

### 3. Run Migrations

```bash
make migrate-up
```

### 4. Start Backend

```bash
cd common-api
go mod tidy
go run cmd/api/main.go
```

### 5. Start Frontend

```bash
cd web
npm install
npm run dev
```

## Default Users (after seed migration)

| Role   | Email                | Password  |
|--------|----------------------|-----------|
| Admin  | admin@school.edu     | admin123  |
| Teacher| teacher@school.edu   | teacher123|
| Student| student@school.edu   | student123|
| Guest  | guest@school.edu     | guest123  |

## API Endpoints

- `POST /api/v1/auth/login` — Login
- `POST /api/v1/auth/refresh` — Refresh token
- `POST /api/v1/auth/logout` — Logout
- `GET /api/v1/users` — List users
- `GET /api/v1/rooms` — List rooms
- `POST /api/v1/bookings` — Create booking
- `GET /api/v1/bookings` — List bookings
- `POST /api/v1/bookings/:id/approve` — Approve booking
- `POST /api/v1/bookings/:id/reject` — Reject booking

## Makefile Commands

| Command         | Description                          |
|-----------------|--------------------------------------|
| `make db-up`    | Start PostgreSQL container           |
| `make migrate-up`| Run database migrations             |
| `make migrate-down`| Rollback migrations               |
| `make sqlc`     | Generate sqlc code                   |
| `make dev-api`  | Run backend dev server               |
| `make dev-web`  | Run frontend dev server              |
| `make test`     | Run all tests                        |
| `make lint`     | Run linters                          |
| `make build`    | Build production binaries            |

## Features

### Room Booking
- Create, update, delete rooms
- Booking with overlap prevention
- Approve/reject workflow for bookings
- Calendar view for availability

### Assignments & Submissions
- Teachers create assignments
- Students submit work (file, link, text)
- Grading with feedback

### Attendance
- QR-code based attendance sessions
- Manual attendance marking
- Attendance reports

### Gamification
- Badge system for student achievements
- Automatic badge awards on milestones

### Notifications
- In-app notifications
- Assignment reminders
- Booking status updates

## License

MIT
