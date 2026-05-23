package service

import (
	"context"
	"errors"
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"
	"time"

	"classroom-api/internal/config"
	"classroom-api/internal/model"

	"github.com/aws/aws-sdk-go-v2/aws"
	awsconfig "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

const MaxUploadBytes int64 = 25 * 1024 * 1024

var allowedUploadExtensions = map[string]bool{
	".pdf":  true,
	".doc":  true,
	".docx": true,
	".ppt":  true,
	".pptx": true,
	".xls":  true,
	".xlsx": true,
	".txt":  true,
	".png":  true,
	".jpg":  true,
	".jpeg": true,
	".webp": true,
}

var allowedUploadEntityTypes = map[string]bool{
	"submission":        true,
	"assignment":        true,
	"learning_material": true,
	"room_image":        true,
	"avatar":            true,
	"export":            true,
}

type UploadService struct {
	db           *pgxpool.Pool
	uploadDir    string
	provider     string
	r2Bucket     string
	r2Client     *s3.Client
	r2Presigner  *s3.PresignClient
	r2PresignTTL time.Duration
	r2ConfigErr  error
}

func NewUploadService(db *pgxpool.Pool, cfg *config.Config) *UploadService {
	svc := &UploadService{
		db:           db,
		uploadDir:    cfg.UploadDir,
		provider:     strings.ToLower(strings.TrimSpace(cfg.StorageProvider)),
		r2Bucket:     strings.TrimSpace(cfg.R2Bucket),
		r2PresignTTL: time.Duration(cfg.R2PresignTTL) * time.Second,
	}
	if svc.provider == "" {
		svc.provider = "local"
	}
	if svc.r2PresignTTL <= 0 {
		svc.r2PresignTTL = 15 * time.Minute
	}
	if svc.provider == "r2" {
		svc.r2Client, svc.r2Presigner, svc.r2ConfigErr = newR2Client(cfg)
	}
	return svc
}

func (s *UploadService) Save(ctx context.Context, uploaderID uuid.UUID, file *multipart.FileHeader, entityType string, entityID *uuid.UUID) (*model.UploadedFile, error) {
	if file == nil {
		return nil, fmt.Errorf("%w: file is required", model.ErrValidation)
	}
	if file.Size <= 0 {
		return nil, fmt.Errorf("%w: file is empty", model.ErrValidation)
	}
	if file.Size > MaxUploadBytes {
		return nil, fmt.Errorf("%w: file size must be 25MB or less", model.ErrValidation)
	}

	entityType = strings.TrimSpace(entityType)
	if entityType == "" {
		entityType = "submission"
	}
	if !allowedUploadEntityTypes[entityType] {
		return nil, fmt.Errorf("%w: unsupported upload target", model.ErrValidation)
	}

	originalName := filepath.Base(file.Filename)
	ext := strings.ToLower(filepath.Ext(originalName))
	if !allowedUploadExtensions[ext] {
		return nil, fmt.Errorf("%w: unsupported file type", model.ErrValidation)
	}

	src, err := file.Open()
	if err != nil {
		return nil, err
	}
	defer src.Close()

	mimeType := strings.TrimSpace(file.Header.Get("Content-Type"))
	if mimeType == "" {
		mimeType = "application/octet-stream"
	}

	storageName := uuid.NewString() + ext
	storagePath := ""
	switch s.provider {
	case "r2":
		storageName = fmt.Sprintf("%s/%s%s", entityType, uuid.NewString(), ext)
		if err := s.saveToR2(ctx, storageName, mimeType, file.Size, src); err != nil {
			return nil, err
		}
		storagePath = storageName
	case "local":
		if err := os.MkdirAll(s.uploadDir, 0755); err != nil {
			return nil, err
		}
		storagePath = filepath.Join(s.uploadDir, storageName)
		dst, err := os.Create(storagePath)
		if err != nil {
			return nil, err
		}
		defer dst.Close()

		if _, err := io.Copy(dst, src); err != nil {
			return nil, err
		}
	default:
		return nil, fmt.Errorf("%w: unsupported storage provider", model.ErrValidation)
	}

	var id uuid.UUID
	if err := s.db.QueryRow(ctx, `
		INSERT INTO files (uploader_id, original_name, storage_name, mime_type, size_bytes, storage_path, entity_type, entity_id)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id`,
		uploaderID, originalName, storageName, mimeType, file.Size, storagePath, entityType, entityID,
	).Scan(&id); err != nil {
		return nil, err
	}

	downloadPath := "/api/v1/uploads/" + id.String() + "/download"
	return &model.UploadedFile{
		ID:           id.String(),
		URL:          downloadPath,
		OriginalName: originalName,
		MimeType:     mimeType,
		SizeBytes:    file.Size,
	}, nil
}

type storedUpload struct {
	ID           uuid.UUID
	UploaderID   uuid.UUID
	OriginalName string
	StorageName  string
	MimeType     string
	StoragePath  string
	EntityType   string
	EntityID     *uuid.UUID
}

func (s *UploadService) AccessURL(ctx context.Context, fileID, userID uuid.UUID, role string) (string, error) {
	file, err := s.authorizedFile(ctx, fileID, userID, role)
	if err != nil {
		return "", err
	}
	if s.provider == "r2" {
		if s.r2ConfigErr != nil {
			return "", s.r2ConfigErr
		}
		req, err := s.r2Presigner.PresignGetObject(ctx, &s3.GetObjectInput{
			Bucket: aws.String(s.r2Bucket),
			Key:    aws.String(file.StoragePath),
		}, s3.WithPresignExpires(s.r2PresignTTL))
		if err != nil {
			return "", err
		}
		return req.URL, nil
	}
	return "/api/v1/uploads/" + file.ID.String() + "/download", nil
}

func (s *UploadService) LocalFile(ctx context.Context, fileID, userID uuid.UUID, role string) (*storedUpload, error) {
	file, err := s.authorizedFile(ctx, fileID, userID, role)
	if err != nil {
		return nil, err
	}
	if s.provider == "r2" {
		return nil, fmt.Errorf("%w: remote storage files require signed URL access", model.ErrValidation)
	}
	return file, nil
}

func (s *UploadService) authorizedFile(ctx context.Context, fileID, userID uuid.UUID, role string) (*storedUpload, error) {
	var file storedUpload
	if err := s.db.QueryRow(ctx, `
		SELECT id, uploader_id, original_name, storage_name, mime_type, storage_path, entity_type, entity_id
		FROM files
		WHERE id = $1 AND deleted_at IS NULL`, fileID,
	).Scan(&file.ID, &file.UploaderID, &file.OriginalName, &file.StorageName, &file.MimeType, &file.StoragePath, &file.EntityType, &file.EntityID); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, model.ErrNotFound
		}
		return nil, err
	}

	if role == "admin" || file.UploaderID == userID {
		return &file, nil
	}

	downloadPath := "/api/v1/uploads/" + file.ID.String() + "/download"
	var allowed bool
	switch file.EntityType {
	case "submission":
		err := s.db.QueryRow(ctx, `
			SELECT EXISTS (
				SELECT 1
				FROM submissions sub
				JOIN assignments a ON a.id = sub.assignment_id AND a.deleted_at IS NULL
				WHERE sub.deleted_at IS NULL
				  AND (
					sub.file_urls @> ARRAY[$1]::text[]
					OR EXISTS (SELECT 1 FROM unnest(sub.file_urls) AS u(url) WHERE u.url = $1 OR u.url LIKE '%' || $1)
				  )
				  AND (sub.student_id = $2 OR a.teacher_id = $2)
			)`, downloadPath, userID).Scan(&allowed)
		if err != nil {
			return nil, err
		}
	case "learning_material":
		err := s.db.QueryRow(ctx, `
			SELECT EXISTS (
				SELECT 1
				FROM learning_materials lm
				JOIN rooms r ON r.id = lm.classroom_id AND r.deleted_at IS NULL
				LEFT JOIN classroom_members cm ON cm.room_id = lm.classroom_id AND cm.student_id = $2
				WHERE lm.deleted_at IS NULL
				  AND (
					lm.file_urls @> ARRAY[$1]::text[]
					OR EXISTS (SELECT 1 FROM unnest(lm.file_urls) AS u(url) WHERE u.url = $1 OR u.url LIKE '%' || $1)
				  )
				  AND (r.teacher_id = $2 OR (lm.is_published = true AND cm.student_id IS NOT NULL))
			)`, downloadPath, userID).Scan(&allowed)
		if err != nil {
			return nil, err
		}
	default:
		allowed = false
	}
	if !allowed {
		return nil, model.ErrForbidden
	}
	return &file, nil
}

func (s *UploadService) saveToR2(ctx context.Context, key, mimeType string, size int64, body io.Reader) error {
	if s.r2ConfigErr != nil {
		return s.r2ConfigErr
	}
	if s.r2Bucket == "" {
		return fmt.Errorf("%w: R2_BUCKET is required", model.ErrValidation)
	}
	_, err := s.r2Client.PutObject(ctx, &s3.PutObjectInput{
		Bucket:        aws.String(s.r2Bucket),
		Key:           aws.String(key),
		Body:          body,
		ContentLength: aws.Int64(size),
		ContentType:   aws.String(mimeType),
	})
	return err
}

func newR2Client(cfg *config.Config) (*s3.Client, *s3.PresignClient, error) {
	endpoint := strings.TrimSpace(cfg.R2Endpoint)
	if endpoint == "" && strings.TrimSpace(cfg.R2AccountID) != "" {
		endpoint = "https://" + strings.TrimSpace(cfg.R2AccountID) + ".r2.cloudflarestorage.com"
	}
	if endpoint == "" || cfg.R2AccessKeyID == "" || cfg.R2SecretAccessKey == "" || cfg.R2Bucket == "" {
		return nil, nil, fmt.Errorf("%w: R2 endpoint, bucket, access key, and secret are required", model.ErrValidation)
	}
	region := strings.TrimSpace(cfg.R2Region)
	if region == "" {
		region = "auto"
	}
	awsCfg, err := awsconfig.LoadDefaultConfig(context.Background(),
		awsconfig.WithRegion(region),
		awsconfig.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(cfg.R2AccessKeyID, cfg.R2SecretAccessKey, "")),
	)
	if err != nil {
		return nil, nil, err
	}
	client := s3.NewFromConfig(awsCfg, func(o *s3.Options) {
		o.BaseEndpoint = aws.String(endpoint)
		o.UsePathStyle = true
	})
	return client, s3.NewPresignClient(client), nil
}
