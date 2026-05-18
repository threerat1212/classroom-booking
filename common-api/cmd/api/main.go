package main

import (
	"context"
	"os"

	"classroom-api/internal/config"
	"classroom-api/internal/handler"
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

	services := service.NewServices(db, cfg)
	handlers := handler.NewHandlers(services)

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
