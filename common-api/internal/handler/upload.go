package handler

import (
	"errors"
	"mime"
	"net/http"
	"strings"

	"classroom-api/internal/model"
	"classroom-api/internal/service"
	"classroom-api/pkg/response"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type UploadHandler struct {
	service *service.UploadService
}

func NewUploadHandler(svc *service.UploadService) *UploadHandler {
	return &UploadHandler{service: svc}
}

func (h *UploadHandler) Upload(c *gin.Context) {
	c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, service.MaxUploadBytes+1024*1024)

	file, err := c.FormFile("file")
	if err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", "file is required")
		return
	}

	var entityID *uuid.UUID
	if raw := strings.TrimSpace(c.PostForm("entity_id")); raw != "" {
		id, err := uuid.Parse(raw)
		if err != nil {
			response.BadRequest(c, "VALIDATION_ERROR", "invalid entity_id")
			return
		}
		entityID = &id
	}

	userIDValue, _ := c.Get("userID")
	userIDRaw, ok := userIDValue.(string)
	if !ok {
		response.BadRequest(c, "VALIDATION_ERROR", "invalid user")
		return
	}
	userID, err := uuid.Parse(userIDRaw)
	if err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", "invalid user")
		return
	}

	item, err := h.service.Save(c.Request.Context(), userID, file, c.PostForm("entity_type"), entityID)
	if err != nil {
		if errors.Is(err, model.ErrValidation) {
			response.BadRequest(c, "VALIDATION_ERROR", err.Error())
			return
		}
		response.InternalError(c, err.Error())
		return
	}

	item.URL = absoluteURL(c, item.URL)

	response.Created(c, item)
}

func (h *UploadHandler) Access(c *gin.Context) {
	fileID, userID, role, ok := uploadRequestContext(c)
	if !ok {
		return
	}

	fileURL, err := h.service.AccessURL(c.Request.Context(), fileID, userID, role)
	if err != nil {
		handleUploadError(c, err)
		return
	}

	response.OK(c, model.FileAccessResponse{URL: absoluteURL(c, fileURL)})
}

func (h *UploadHandler) Download(c *gin.Context) {
	fileID, userID, role, ok := uploadRequestContext(c)
	if !ok {
		return
	}

	localFile, err := h.service.LocalFile(c.Request.Context(), fileID, userID, role)
	if err == nil {
		if localFile.MimeType != "" {
			c.Header("Content-Type", localFile.MimeType)
		}
		c.Header("Content-Disposition", mime.FormatMediaType("inline", map[string]string{"filename": localFile.OriginalName}))
		c.File(localFile.StoragePath)
		return
	}
	if !errors.Is(err, model.ErrValidation) {
		handleUploadError(c, err)
		return
	}

	fileURL, err := h.service.AccessURL(c.Request.Context(), fileID, userID, role)
	if err != nil {
		handleUploadError(c, err)
		return
	}
	c.Redirect(http.StatusFound, absoluteURL(c, fileURL))
}

func uploadRequestContext(c *gin.Context) (uuid.UUID, uuid.UUID, string, bool) {
	fileID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", "invalid file id")
		return uuid.Nil, uuid.Nil, "", false
	}

	userIDValue, ok := c.Get("userID")
	if !ok {
		response.Unauthorized(c, "missing user")
		return uuid.Nil, uuid.Nil, "", false
	}
	userIDRaw, ok := userIDValue.(string)
	if !ok {
		response.BadRequest(c, "VALIDATION_ERROR", "invalid user")
		return uuid.Nil, uuid.Nil, "", false
	}
	userID, err := uuid.Parse(userIDRaw)
	if err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", "invalid user")
		return uuid.Nil, uuid.Nil, "", false
	}

	roleValue, _ := c.Get("role")
	role, _ := roleValue.(string)
	if role == "" {
		response.Forbidden(c, "role not found in context")
		return uuid.Nil, uuid.Nil, "", false
	}
	return fileID, userID, role, true
}

func handleUploadError(c *gin.Context, err error) {
	switch {
	case errors.Is(err, model.ErrValidation):
		response.BadRequest(c, "VALIDATION_ERROR", err.Error())
	case errors.Is(err, model.ErrForbidden):
		response.Forbidden(c, "insufficient permissions")
	case errors.Is(err, model.ErrNotFound):
		response.NotFound(c, "file")
	default:
		response.InternalError(c, err.Error())
	}
}

func absoluteURL(c *gin.Context, value string) string {
	if !strings.HasPrefix(value, "/") {
		return value
	}
	scheme := c.GetHeader("X-Forwarded-Proto")
	if scheme == "" {
		scheme = "http"
		if c.Request.TLS != nil {
			scheme = "https"
		}
	}
	return scheme + "://" + c.Request.Host + value
}
