package middleware

import (
	"net/http"

	"classroom-api/pkg/response"

	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog/log"
)

func RecoveryMiddleware() gin.HandlerFunc {
	return gin.CustomRecovery(func(c *gin.Context, err interface{}) {
		log.Error().Str("path", c.Request.URL.Path).Interface("panic", err).Msg("panic recovered")
		response.InternalError(c, "internal server error")
		c.AbortWithStatus(http.StatusInternalServerError)
	})
}
