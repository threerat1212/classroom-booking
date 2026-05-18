package response

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type successResponse struct {
	Data interface{} `json:"data"`
}

type errorDetail struct {
	Code    string `json:"code"`
	Message string `json:"message"`
	Details string `json:"details,omitempty"`
}

type errorResponse struct {
	Error errorDetail `json:"error"`
}

func OK(c *gin.Context, data interface{}) {
	c.JSON(http.StatusOK, successResponse{Data: data})
}

func Created(c *gin.Context, data interface{}) {
	c.JSON(http.StatusCreated, successResponse{Data: data})
}

func NoContent(c *gin.Context) {
	c.Status(http.StatusNoContent)
}

func BadRequest(c *gin.Context, code, message string) {
	c.JSON(http.StatusBadRequest, errorResponse{Error: errorDetail{Code: code, Message: message}})
}

func Unauthorized(c *gin.Context, message string) {
	c.JSON(http.StatusUnauthorized, errorResponse{Error: errorDetail{Code: "UNAUTHORIZED", Message: message}})
}

func Forbidden(c *gin.Context, message string) {
	c.JSON(http.StatusForbidden, errorResponse{Error: errorDetail{Code: "FORBIDDEN", Message: message}})
}

func NotFound(c *gin.Context, resource string) {
	c.JSON(http.StatusNotFound, errorResponse{Error: errorDetail{Code: "NOT_FOUND", Message: resource + " not found"}})
}

func Conflict(c *gin.Context, code, message string) {
	c.JSON(http.StatusConflict, errorResponse{Error: errorDetail{Code: code, Message: message}})
}

func InternalError(c *gin.Context, message string) {
	c.JSON(http.StatusInternalServerError, errorResponse{Error: errorDetail{Code: "INTERNAL_ERROR", Message: message}})
}

func HandleError(c *gin.Context, err error) {
	switch err.Error() {
	case "not found":
		NotFound(c, "resource")
	case "unauthorized":
		Unauthorized(c, "invalid or missing token")
	case "forbidden":
		Forbidden(c, "insufficient permissions")
	case "conflict":
		Conflict(c, "CONFLICT", "resource conflict")
	case "validation":
		BadRequest(c, "VALIDATION_ERROR", err.Error())
	default:
		InternalError(c, err.Error())
	}
}
