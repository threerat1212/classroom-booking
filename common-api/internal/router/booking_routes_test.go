package router

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"classroom-api/internal/handler"

	"github.com/gin-gonic/gin"
)

func TestBookingMutationRoutesRequireAdmin(t *testing.T) {
	gin.SetMode(gin.TestMode)

	tests := []struct {
		name   string
		method string
		path   string
		body   string
	}{
		{
			name:   "teacher cannot update booking",
			method: http.MethodPut,
			path:   "/bookings/11111111-1111-1111-1111-111111111111",
			body:   `{"title":"Updated"}`,
		},
		{
			name:   "teacher cannot delete booking",
			method: http.MethodDelete,
			path:   "/bookings/11111111-1111-1111-1111-111111111111",
			body:   `{}`,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			r := gin.New()
			protected := r.Group("")
			protected.Use(func(c *gin.Context) {
				c.Set("role", "teacher")
				c.Next()
			})

			bookings := protected.Group("/bookings")
			registerBookingRoutes(bookings, &handler.BookingHandler{})

			req := httptest.NewRequest(tt.method, tt.path, strings.NewReader(tt.body))
			req.Header.Set("Content-Type", "application/json")
			w := httptest.NewRecorder()

			r.ServeHTTP(w, req)

			if w.Code != http.StatusForbidden {
				t.Fatalf("status = %d, want %d; body=%s", w.Code, http.StatusForbidden, w.Body.String())
			}
		})
	}
}
