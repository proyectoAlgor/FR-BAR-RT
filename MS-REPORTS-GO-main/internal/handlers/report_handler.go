package handlers

import (
	"fmt"
	"net/http"

	"ms-reports-go/internal/service"

	"github.com/gin-gonic/gin"
)

type ReportHandler struct {
	reportService service.ReportService
}

func NewReportHandler(reportService service.ReportService) *ReportHandler {
	return &ReportHandler{
		reportService: reportService,
	}
}

// GetAnalyticsReport obtiene el reporte completo de analytics (solo admin)
func (h *ReportHandler) GetAnalyticsReport(c *gin.Context) {
	report, err := h.reportService.GetAnalyticsReport()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, report)
}

// GetUserReport obtiene el reporte de usuarios
func (h *ReportHandler) GetUserReport(c *gin.Context) {
	report, err := h.reportService.GetUserReport()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, report)
}

// GetProductReport obtiene el reporte de productos
func (h *ReportHandler) GetProductReport(c *gin.Context) {
	report, err := h.reportService.GetProductReport()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, report)
}

// GetVenueReport obtiene el reporte de sedes
func (h *ReportHandler) GetVenueReport(c *gin.Context) {
	report, err := h.reportService.GetVenueReport()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, report)
}

// GetActivityReport obtiene el reporte de actividad
func (h *ReportHandler) GetActivityReport(c *gin.Context) {
	days := 30 // Default
	if daysParam := c.Query("days"); daysParam != "" {
		var err error
		if days, err = parseInt(daysParam); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid days parameter"})
			return
		}
	}

	report, err := h.reportService.GetActivityReport(days)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, report)
}

// GetVenueSpecificReport obtiene el reporte específico de una sede (para cajeros)
func (h *ReportHandler) GetVenueSpecificReport(c *gin.Context) {
	locationID := c.Param("locationId")
	if locationID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "location_id is required"})
		return
	}

	report, err := h.reportService.GetVenueSpecificReport(locationID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, report)
}

// Helper function to parse int
func parseInt(s string) (int, error) {
	var result int
	_, err := fmt.Sscanf(s, "%d", &result)
	return result, err
}

