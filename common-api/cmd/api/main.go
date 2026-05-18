package main

import (
	"context"
	"os"

	"classroom-api/internal/config"
	"classroom-api/internal/handler"
	"classroom-api/internal/migrate"
	"classroom-api/internal/router"
	"classroom-api/internal/service"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
)

func main() {
	zerolog.TimeFieldFormat = zerolog.TimeFormatUnix
	log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stderr})

	cfg := config.Load()

	ctx := context.Background()
	db, err := pgxpool.New(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Fatal().Err(err).Msg("failed to connect to database")
	}
	defer db.Close()

	if err := db.Ping(ctx); err != nil {
		log.Fatal().Err(err).Msg("failed to ping database")
	}
	log.Info().Msg("database connected")

	// Auto-run migrations
	migrationsDir := os.Getenv("MIGRATIONS_DIR")
	if migrationsDir == "" {
		candidates := []string{"/app/migrations", "/migrations", "./migrations", "../../migrations"}
		for _, c := range candidates {
			if _, err := os.Stat(c); err == nil {
				migrationsDir = c
				break
			}
		}
	}
	if migrationsDir != "" {
		log.Info().Str("dir", migrationsDir).Msg("found migrations directory")
		if err := migrate.Run(ctx, db, migrationsDir); err != nil {
			log.Error().Err(err).Msg("auto-migration failed (continuing)")
		}
	} else {
		log.Warn().Msg("no migrations directory found — checked /app/migrations, /migrations, ./migrations, ../../migrations")
	}

	services := service.NewServices(db, cfg)
	handlers := handler.NewHandlers(services, cfg)

	r := router.New(cfg, handlers)

	port := cfg.APIPort
	if port == "" {
		port = "8080"
	}

	log.Info().Str("port", port).Msg("starting server")
	if err := r.Run(":" + port); err != nil {
		log.Fatal().Err(err).Msg("server failed")
	}
}
