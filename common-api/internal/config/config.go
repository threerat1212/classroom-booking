package config

import (
	"log"

	"github.com/spf13/viper"
)

type Config struct {
	DatabaseURL       string `mapstructure:"DATABASE_URL"`
	JWTSecret         string `mapstructure:"JWT_SECRET"`
	JWTRefreshSecret  string `mapstructure:"JWT_REFRESH_SECRET"`
	APIPort           string `mapstructure:"API_PORT"`
	UploadDir         string `mapstructure:"UPLOAD_DIR"`
	StorageProvider   string `mapstructure:"STORAGE_PROVIDER"`
	R2AccountID       string `mapstructure:"R2_ACCOUNT_ID"`
	R2AccessKeyID     string `mapstructure:"R2_ACCESS_KEY_ID"`
	R2SecretAccessKey string `mapstructure:"R2_SECRET_ACCESS_KEY"`
	R2Bucket          string `mapstructure:"R2_BUCKET"`
	R2Endpoint        string `mapstructure:"R2_ENDPOINT"`
	R2Region          string `mapstructure:"R2_REGION"`
	R2PresignTTL      int    `mapstructure:"R2_PRESIGN_TTL_SECONDS"`
	GoogleClientID    string `mapstructure:"GOOGLE_CLIENT_ID"`
	TeacherInviteCode string `mapstructure:"TEACHER_INVITE_CODE"`
	AIProvider        string `mapstructure:"AI_PROVIDER"`
	AIAPIKey          string `mapstructure:"AI_API_KEY"`
	AIBaseURL         string `mapstructure:"AI_BASE_URL"`
	AIModel           string `mapstructure:"AI_MODEL"`
	AIGradingModel    string `mapstructure:"AI_GRADING_MODEL"`
	AIAppName         string `mapstructure:"AI_APP_NAME"`
	AISiteURL         string `mapstructure:"AI_SITE_URL"`
	GLMAPIKey         string `mapstructure:"GLM_API_KEY"` // legacy fallback
}

func Load() *Config {
	viper.SetDefault("API_PORT", "8080")
	viper.SetDefault("UPLOAD_DIR", "./uploads")
	viper.SetDefault("STORAGE_PROVIDER", "local")
	viper.SetDefault("R2_REGION", "auto")
	viper.SetDefault("R2_PRESIGN_TTL_SECONDS", 900)
	viper.SetDefault("AI_PROVIDER", "openrouter")
	viper.SetDefault("AI_BASE_URL", "https://openrouter.ai/api/v1/chat/completions")
	viper.SetDefault("AI_MODEL", "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free")
	viper.SetDefault("AI_GRADING_MODEL", "arcee-ai/trinity-large-thinking:free")
	viper.SetDefault("AI_APP_NAME", "Classroom MS AI Tutor")

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
	_ = viper.BindEnv("TEACHER_INVITE_CODE")
	_ = viper.BindEnv("UPLOAD_DIR")
	_ = viper.BindEnv("STORAGE_PROVIDER")
	_ = viper.BindEnv("R2_ACCOUNT_ID")
	_ = viper.BindEnv("R2_ACCESS_KEY_ID")
	_ = viper.BindEnv("R2_SECRET_ACCESS_KEY")
	_ = viper.BindEnv("R2_BUCKET")
	_ = viper.BindEnv("R2_ENDPOINT")
	_ = viper.BindEnv("R2_REGION")
	_ = viper.BindEnv("R2_PRESIGN_TTL_SECONDS")
	_ = viper.BindEnv("AI_PROVIDER")
	_ = viper.BindEnv("AI_API_KEY")
	_ = viper.BindEnv("AI_BASE_URL")
	_ = viper.BindEnv("AI_MODEL")
	_ = viper.BindEnv("AI_GRADING_MODEL")
	_ = viper.BindEnv("AI_APP_NAME")
	_ = viper.BindEnv("AI_SITE_URL")
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
	if cfg.AIAPIKey == "" && cfg.GLMAPIKey != "" {
		cfg.AIAPIKey = cfg.GLMAPIKey
	}

	return &cfg
}
