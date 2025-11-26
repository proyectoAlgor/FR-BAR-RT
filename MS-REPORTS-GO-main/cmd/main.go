package main

import (
	"log"
	"os"

	"ms-reports-go/internal/handlers"
	"ms-reports-go/internal/middleware"
	"ms-reports-go/internal/repository"
	"ms-reports-go/internal/service"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
)

func main() {
	// Configuración
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgres://bar_user:bar_password@postgres:5432/bar_management_db?sslmode=disable"
	}

	port := os.Getenv("SERVICE_PORT")
	if port == "" {
		port = "8080"
	}

	// Repositorio
	repo, err := repository.NewReportRepository(dbURL)
	if err != nil {
		log.Fatal("Error connecting to database:", err)
	}

	// Servicios
	reportService := service.NewReportService(repo)

	// Handlers
	reportHandler := handlers.NewReportHandler(reportService)

	// Router
	router := gin.Default()

	// Middleware CORS básico
	router.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	// Health check
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok", "service": "MS-REPORTS-BAR"})
	})

	// Rutas protegidas (requieren autenticación)
	protected := router.Group("/api/reports")
	protected.Use(middleware.RequireAuth())
	{
		// Reportes para cajeros (cashier) - reportes por sede
		protected.GET("/venue/:locationId", middleware.RequireRole("cashier", "admin"), reportHandler.GetVenueSpecificReport)

		// Reportes individuales (admin y cashier)
		protected.GET("/users", middleware.RequireRole("admin"), reportHandler.GetUserReport)
		protected.GET("/products", middleware.RequireRole("admin", "cashier"), reportHandler.GetProductReport)
		protected.GET("/venues", middleware.RequireRole("admin", "cashier"), reportHandler.GetVenueReport)
		protected.GET("/activity", middleware.RequireRole("admin"), reportHandler.GetActivityReport)

		// Reporte completo de analytics (solo admin)
		protected.GET("/analytics", middleware.RequireRole("admin"), reportHandler.GetAnalyticsReport)
	}

	log.Printf("MS-REPORTS-BAR starting on port %s", port)
	router.Run(":" + port)
}




