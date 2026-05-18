package config

import (
	"log"

	"github.com/spf13/viper"
)

type Config struct {
	DatabaseURL      string `mapstructure:"DATABASE_URL"`
	JWTSecret        string `mapstructure:"JWT_SECRET"`
	JWTRefreshSecret string `mapstructure:"JWT_REFRESH_SECRET"`
	APIPort          string `mapstructure:"API_PORT"`
	UploadDir        string `mapstructure:"UPLOAD_DIR"`
	GoogleClientID   string `mapstructure:"GOOGLE_CLIENT_ID"`
	GLMAPIKey        string `mapstructure:"GLM_API_KEY"`
}

func Load() *Config {
	viper.SetDefault("API_PORT", "8080")
	viper.SetDefault("UPLOAD_DIR", "./uploads")

	viper.AddConfigPath(".")
	viper.SetConfigName(".env")
	viper.SetConfigType("env")
	viper.AutomaticEnv()

	// Explicitly bind env vars (viper.Unmarshal doesn't read AutomaticEnv reliably)
	_ = viper.BindEnv("DATABASE_URL")
	_ = viper.BindEnv("JWT_SECRET")
	_ = viper.BindEnv("JWT_REFRESH_SECRET")
	_ = viper.BindEnv("API_PORT")
	_ = viper.BindEnv("PORT")
	_ = viper.BindEnv("GOOGLE_CLIENT_ID")
	_ = viper.BindEnv("UPLOAD_DIR")
	_ = viper.BindEnv("GLM_API_KEY")

	if err := viper.ReadInConfig(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	// Render sets PORT — use it if API_PORT not set
	if viper.GetString("API_PORT") == "" && viper.GetString("PORT") != "" {
		viper.Set("API_PORT", viper.GetString("PORT"))
	}

	var cfg Config
	if err := viper.Unmarshal(&cfg); err != nil {
		log.Fatalf("Failed to unmarshal config: %v", err)
	}

	if cfg.DatabaseURL == "" {
		log.Fatal("DATABASE_URL is required")
	}
	if cfg.JWTSecret == "" {
		log.Fatal("JWT_SECRET is required")
	}
	if cfg.JWTRefreshSecret == "" {
		cfg.JWTRefreshSecret = cfg.JWTSecret
	}

	return &cfg
}
