package migrate

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/rs/zerolog/log"
)

// Run applies all pending .up.sql migrations from the given directory.
// It tracks applied migrations in the app_migrations table (separate from
// golang-migrate's schema_migrations to avoid conflicts).
// "Already exists" errors are tolerated to allow re-import on existing databases.
func Run(ctx context.Context, db *pgxpool.Pool, migrationsDir string) error {
	log.Info().Str("dir", migrationsDir).Msg("auto-migration starting")

	// Ensure tracker table
	if _, err := db.Exec(ctx, `
		CREATE TABLE IF NOT EXISTS app_migrations (
			version TEXT PRIMARY KEY,
			applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
		)
	`); err != nil {
		return fmt.Errorf("failed to create app_migrations: %w", err)
	}

	// Verify migrations directory exists
	if info, err := os.Stat(migrationsDir); err != nil || !info.IsDir() {
		log.Error().Str("dir", migrationsDir).Err(err).Msg("migrations directory not found or not a directory")
		return fmt.Errorf("migrations dir not found: %s", migrationsDir)
	}

	// Read migration files
	entries, err := os.ReadDir(migrationsDir)
	if err != nil {
		log.Warn().Err(err).Str("dir", migrationsDir).Msg("migrations dir not readable, skipping auto-migrate")
		return nil
	}

	var files []string
	for _, e := range entries {
		if e.IsDir() {
			continue
		}
		if strings.HasSuffix(e.Name(), ".up.sql") {
			files = append(files, e.Name())
		}
	}
	sort.Strings(files)

	// Get already applied
	rows, err := db.Query(ctx, `SELECT version FROM app_migrations`)
	if err != nil {
		return fmt.Errorf("failed to query applied migrations: %w", err)
	}
	applied := map[string]bool{}
	for rows.Next() {
		var v string
		if err := rows.Scan(&v); err != nil {
			rows.Close()
			return err
		}
		applied[v] = true
	}
	rows.Close()

	appliedCount := 0
	for _, f := range files {
		version := strings.TrimSuffix(f, ".up.sql")
		if applied[version] {
			continue
		}

		path := filepath.Join(migrationsDir, f)
		content, err := os.ReadFile(path)
		if err != nil {
			log.Error().Err(err).Str("file", f).Msg("failed to read migration")
			continue
		}

		log.Info().Str("migration", version).Msg("applying migration")
		if _, err := db.Exec(ctx, string(content)); err != nil {
			// Tolerate already-exists errors (e.g. tables created previously without tracker)
			msg := strings.ToLower(err.Error())
			if strings.Contains(msg, "already exists") || strings.Contains(msg, "duplicate") {
				log.Warn().Str("migration", version).Msg("migration already applied (tolerated)")
			} else {
				log.Error().Err(err).Str("migration", version).Msg("migration failed")
				continue
			}
		}
		appliedCount++

		if _, err := db.Exec(ctx, `INSERT INTO app_migrations (version) VALUES ($1) ON CONFLICT DO NOTHING`, version); err != nil {
			log.Error().Err(err).Str("migration", version).Msg("failed to mark migration as applied")
		}
	}

	log.Info().Int("applied", appliedCount).Msg("auto-migration complete")

	// Ensure demo users exist (idempotent)
	ensureDemoUsers(ctx, db)

	return nil
}

// ensureDemoUsers inserts demo users only if the users table is empty.
// Passwords match what's in 000012_seed.up.sql:
//
//	admin@school.edu / admin123
//	teacher@school.edu / teacher123
//	student@school.edu / student123
//	student2@school.edu / student123
//	guest@school.edu / guest123
func ensureDemoUsers(ctx context.Context, db *pgxpool.Pool) {
	var count int
	if err := db.QueryRow(ctx, `SELECT COUNT(*) FROM users`).Scan(&count); err != nil {
		log.Warn().Err(err).Msg("ensureDemoUsers: failed to count users")
		return
	}
	if count > 0 {
		return
	}
	log.Info().Msg("users table is empty, inserting demo users")
	_, err := db.Exec(ctx, `
		INSERT INTO users (id, email, password_hash, full_name, role, student_id, employee_id, department, status)
		VALUES
			('11111111-1111-1111-1111-111111111111', 'admin@school.edu', '$2b$10$DMrdX3ymJfK7TwUdzbWASuVTIsHVyhv4vaWY5BGC1YoIL58jr83hG', 'System Administrator', 'admin', NULL, 'EMP001', 'IT', 'active'),
			('22222222-2222-2222-2222-222222222222', 'teacher@school.edu', '$2b$10$QuwGKl07fBvmrja9MLqTZec14HtY6tb6r.86q9wW4BX8itUlltyVO', 'John Smith', 'teacher', NULL, 'EMP002', 'Mathematics', 'active'),
			('33333333-3333-3333-3333-333333333333', 'student@school.edu', '$2b$10$sGVKhNRGw548pY2YkizNy.j/NAPJwy5qgGMVhhTuGKH3mIHeigsmi', 'Alice Johnson', 'student', 'STU001', NULL, NULL, 'active'),
			('44444444-4444-4444-4444-444444444444', 'student2@school.edu', '$2b$10$sGVKhNRGw548pY2YkizNy.j/NAPJwy5qgGMVhhTuGKH3mIHeigsmi', 'Bob Williams', 'student', 'STU002', NULL, NULL, 'active'),
			('55555555-5555-5555-5555-555555555555', 'guest@school.edu', '$2b$10$CrJQsTM.wZinP5O/P/1KbO1.tLdkJ9SOXa3oOvw.cpWoIvzzYMiAC', 'Guest User', 'guest', NULL, NULL, NULL, 'active')
		ON CONFLICT (email) DO NOTHING
	`)
	if err != nil {
		log.Warn().Err(err).Msg("ensureDemoUsers: insert failed")
	} else {
		log.Info().Msg("demo users inserted")
	}
}
