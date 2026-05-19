package handler

import (
	"classroom-api/internal/config"
	"classroom-api/internal/model"
	"classroom-api/internal/service"
	"classroom-api/pkg/response"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/rs/zerolog/log"
)

type AuthHandler struct {
	authService *service.AuthService
	userService *service.UserService
	cfg         *config.Config
}

func NewAuthHandler(authSvc *service.AuthService, userSvc *service.UserService, cfg *config.Config) *AuthHandler {
	return &AuthHandler{authService: authSvc, userService: userSvc, cfg: cfg}
}

func (h *AuthHandler) setRefreshCookie(c *gin.Context, value string, maxAge int) {
	secure := c.Request.TLS != nil || c.GetHeader("X-Forwarded-Proto") == "https"
	sameSite := http.SameSiteLaxMode
	if secure {
		sameSite = http.SameSiteNoneMode
	}
	http.SetCookie(c.Writer, &http.Cookie{
		Name:     "refresh_token",
		Value:    value,
		Path:     "/",
		MaxAge:   maxAge,
		Secure:   secure,
		HttpOnly: true,
		SameSite: sameSite,
	})
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req model.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", err.Error())
		return
	}

	tokens, user, err := h.authService.Login(c.Request.Context(), req.Email, req.Password)
	if err != nil {
		response.Unauthorized(c, "invalid credentials")
		return
	}

	h.setRefreshCookie(c, tokens.RefreshToken, 7*24*60*60)

	response.OK(c, model.TokenResponse{
		AccessToken:  tokens.AccessToken,
		RefreshToken: tokens.RefreshToken,
		ExpiresIn:    tokens.ExpiresIn,
		User:         user,
	})
}

func (h *AuthHandler) Refresh(c *gin.Context) {
	refreshToken, err := c.Cookie("refresh_token")
	if err != nil {
		response.Unauthorized(c, "missing refresh token")
		return
	}

	tokens, err := h.authService.Refresh(c.Request.Context(), refreshToken)
	if err != nil {
		response.Unauthorized(c, "invalid refresh token")
		return
	}

	h.setRefreshCookie(c, tokens.RefreshToken, 7*24*60*60)

	response.OK(c, model.TokenResponse{
		AccessToken:  tokens.AccessToken,
		RefreshToken: tokens.RefreshToken,
		ExpiresIn:    tokens.ExpiresIn,
	})
}

func (h *AuthHandler) Register(c *gin.Context) {
	var req model.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", err.Error())
		return
	}

	tokens, user, err := h.authService.Register(c.Request.Context(), req)
	if err != nil {
		if err.Error() == "email already registered" {
			response.Conflict(c, "EMAIL_EXISTS", "email already registered")
			return
		}
		response.InternalError(c, "registration failed")
		return
	}

	h.setRefreshCookie(c, tokens.RefreshToken, 7*24*60*60)

	response.OK(c, model.TokenResponse{
		AccessToken:  tokens.AccessToken,
		RefreshToken: tokens.RefreshToken,
		ExpiresIn:    tokens.ExpiresIn,
		User:         user,
	})
}

func (h *AuthHandler) GoogleLogin(c *gin.Context) {
	var req model.GoogleLoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", err.Error())
		return
	}

	tokens, user, err := h.authService.GoogleLogin(c.Request.Context(), req.Credential, h.cfg.GoogleClientID)
	if err != nil {
		response.Unauthorized(c, err.Error())
		return
	}

	c.SetCookie("refresh_token", tokens.RefreshToken, 7*24*60*60, "/", "", false, true)

	response.OK(c, model.TokenResponse{
		AccessToken:  tokens.AccessToken,
		RefreshToken: tokens.RefreshToken,
		ExpiresIn:    tokens.ExpiresIn,
		User:         user,
	})
}

func (h *AuthHandler) Me(c *gin.Context) {
	userID, _ := c.Get("userID")
	id, err := uuid.Parse(userID.(string))
	if err != nil {
		response.BadRequest(c, "VALIDATION_ERROR", "invalid user id")
		return
	}

	user, err := h.userService.Get(c.Request.Context(), id)
	if err != nil {
		response.NotFound(c, "user")
		return
	}

	response.OK(c, user)
}

func (h *AuthHandler) Logout(c *gin.Context) {
	refreshToken, _ := c.Cookie("refresh_token")
	if refreshToken != "" {
		if err := h.authService.RevokeRefreshToken(c.Request.Context(), refreshToken); err != nil {
			log.Warn().Err(err).Msg("failed to revoke refresh token")
		}
	}

	h.setRefreshCookie(c, "", -1)
	response.NoContent(c)
}
