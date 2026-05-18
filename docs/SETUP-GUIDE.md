# Setup & Testing Guide

## Prerequisites (ต้องติดตั้งก่อน)

1. **Go 1.23+** — ดาวน์โหลดจาก https://go.dev/dl/
2. **PostgreSQL 16+** — ดาวน์โหลดจาก https://www.postgresql.org/download/
3. **Node.js 20+** — ดาวน์โหลดจาก https://nodejs.org/
4. **golang-migrate** (optional) — สำหรับรัน migrations
   ```bash
   # Windows (PowerShell)
   scoop install migrate
   # หรือดาวน์โหลด binary จาก https://github.com/golang-migrate/migrate/releases
   ```

## 1. Database Setup

สร้าง database ชื่อ `classroom`:
```bash
psql -U postgres -c "CREATE DATABASE classroom;"
```

## 2. Environment Variables

ไฟล์ `.env` อยู่ที่ root ของโปรเจคแล้ว:
```env
DATABASE_URL=postgres://postgres:password@localhost:5432/classroom?sslmode=disable
JWT_SECRET=your-jwt-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
API_PORT=8080
UPLOAD_DIR=./uploads
NEXT_PUBLIC_API_URL=http://localhost:8080
```

## 3. Run Migrations

### วิธีที่ 1: ใช้ golang-migrate
```bash
migrate -path migrations -database "postgres://postgres:password@localhost:5432/classroom?sslmode=disable" up
```

### วิธีที่ 2: รัน SQL ไฟล์โดยตรงผ่าน psql
```bash
# รันทุก migration ตามลำดับ
psql -U postgres -d classroom -f migrations/000001_init.up.sql
psql -U postgres -d classroom -f migrations/000002_rooms.up.sql
psql -U postgres -d classroom -f migrations/000003_bookings.up.sql
psql -U postgres -d classroom -f migrations/000004_assignments.up.sql
psql -U postgres -d classroom -f migrations/000005_submissions.up.sql
psql -U postgres -d classroom -f migrations/000006_attendance.up.sql
psql -U postgres -d classroom -f migrations/000007_grades.up.sql
psql -U postgres -d classroom -f migrations/000008_notifications.up.sql
psql -U postgres -d classroom -f migrations/000009_comments.up.sql
psql -U postgres -d classroom -f migrations/000010_badges.up.sql
psql -U postgres -d classroom -f migrations/000011_files.up.sql
psql -U postgres -d classroom -f migrations/000012_seed.up.sql
```

### Default Users (หลังรัน seed)
| Role   | Email               | Password   |
|--------|---------------------|------------|
| Admin  | admin@school.edu    | admin123   |
| Teacher| teacher@school.edu  | teacher123 |
| Student| student@school.edu  | student123 |
| Guest  | guest@school.edu    | guest123   |

## 4. Start Backend

```bash
cd common-api
go mod tidy
go run cmd/api/main.go
```

Backend จะรันที่ `http://localhost:8080`

## 5. Start Frontend

```bash
cd web
npm install
npm run dev
```

Frontend จะรันที่ `http://localhost:3000`

## 6. Run curl Tests

### Windows (PowerShell)
```powershell
.\scripts\curl-test.ps1
```

### Linux/Mac (Bash)
```bash
bash scripts/curl-test.sh
```

หรือทดสอบแต่ละ endpoint ด้วย curl:
```bash
# 1. Login
 curl -X POST http://localhost:8080/api/v1/auth/login \
   -H "Content-Type: application/json" \
   -d '{"email":"admin@school.edu","password":"admin123"}'

# 2. Get users (ใส่ token จากข้อ 1)
 curl http://localhost:8080/api/v1/users \
   -H "Authorization: Bearer <YOUR_TOKEN>"
```

## 7. Build for Production

### Backend
```bash
cd common-api
go build -o bin/api cmd/api/main.go
```

### Frontend
```bash
cd web
npm run build
```

## Troubleshooting

### Go command not found
- ตรวจสอบว่า `C:\Program Files\Go\bin` อยู่ใน PATH
- รัน `go version` เพื่อตรวจสอบ

### Database connection refused
- ตรวจสอบว่า PostgreSQL service กำลังรันอยู่
- ตรวจสอบ username/password ใน `DATABASE_URL`

### Port 8080 already in use
- ปิดโปรแกรมอื่นที่ใช้ port 8080
- หรือเปลี่ยน `API_PORT` ใน `.env`

### Frontend build error
```bash
cd web
npm install
npx tsc --noEmit
npm run build
```
