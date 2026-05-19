package middleware

import (
	"strings"

	"classroom-api/internal/auth"
	"classroom-api/pkg/response"

	"github.com/gin-gonic/gin"
)

func AuthMiddleware(secret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		tokenString := ""

		if authHeader == "" {
			if cookieToken, err := c.Cookie("access_token"); err == nil {
				tokenString = cookieToken
			}
		} else {
			parts := strings.SplitN(authHeader, " ", 2)
			if len(parts) != 2 || strings.ToLower(parts[0]) != "bearer" {
				response.Unauthorized(c, "invalid authorization header format")
				c.Abort()
				return
			}
			tokenString = parts[1]
		}

		if tokenString == "" {
			response.Unauthorized(c, "missing authorization token")
			c.Abort()
			return
		}

		claims, err := auth.ParseAccessToken(tokenString, secret)
		if err != nil {
			response.Unauthorized(c, "invalid or expired token")
			c.Abort()
			return
		}

		c.Set("userID", claims.UserID)
		c.Set("email", claims.Email)
		c.Set("role", claims.Role)
		c.Next()
	}
}

func RequireRoles(allowed ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		role, exists := c.Get("role")
		if !exists {
			response.Forbidden(c, "role not found in context")
			c.Abort()
			return
		}

		roleStr, ok := role.(string)
		if !ok {
			response.Forbidden(c, "invalid role type")
			c.Abort()
			return
		}

		for _, allowedRole := range allowed {
			if roleStr == allowedRole {
				c.Next()
				return
			}
		}

		response.Forbidden(c, "insufficient permissions")
		c.Abort()
	}
}
