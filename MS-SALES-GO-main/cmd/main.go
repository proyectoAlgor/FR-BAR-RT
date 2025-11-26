package main

import (
	"log"
	"os"

	"ms-sales-go/internal/handlers"
	"ms-sales-go/internal/middleware"
	"ms-sales-go/internal/repository"
	"ms-sales-go/internal/service"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
)

func main() {
	// Configuración
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgresql://bar_user:bar_pass@postgres-db:5432/bar_management_db?sslmode=disable"
	}

	port := os.Getenv("SERVICE_PORT")
	if port == "" {
		port = "8080"
	}

	// Repositorio
	repo, err := repository.NewSalesRepository(dbURL)
	if err != nil {
		log.Fatal("Error connecting to database:", err)
	}

	// Servicios
	salesService := service.NewSalesService(repo)

	// Handlers
	salesHandler := handlers.NewSalesHandler(salesService)

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

	// Rutas públicas
	api := router.Group("/")
	{
		api.GET("/health", func(c *gin.Context) {
			c.JSON(200, gin.H{"status": "ok", "service": "MS-SALES-GO"})
		})
	}

	// Rutas protegidas (requieren autenticación)
	protected := router.Group("/")
	protected.Use(middleware.RequireAuth())
	{
		// Órdenes
		protected.POST("/orders", salesHandler.CreateOrder)
		protected.GET("/orders", salesHandler.GetOrders)
		protected.GET("/orders/:id", salesHandler.GetOrder)
		protected.PUT("/orders/:id", salesHandler.UpdateOrder)
		protected.POST("/orders/:id/close", salesHandler.CloseOrder)
		
		// Pagos
		protected.POST("/payments", salesHandler.CreatePayment)
		protected.GET("/payments", salesHandler.GetPayments)
		protected.GET("/payments/:id", salesHandler.GetPayment)
		
		// Historial y consultas
		protected.GET("/sales/history", salesHandler.GetSalesHistory)
		protected.GET("/sales/summary", salesHandler.GetSalesSummary)
	}

	// Rutas de cajero (requieren rol cashier)
	cashier := router.Group("/cashier")
	cashier.Use(middleware.RequireAuth())
	cashier.Use(middleware.RequireRole("cashier"))
	{
		cashier.POST("/orders/:id/payments", salesHandler.ProcessPayment)
		cashier.GET("/orders", salesHandler.GetCashierOrders)
	}

	log.Printf("MS-SALES-GO starting on port %s", port)
	if err := router.Run(":" + port); err != nil {
		log.Fatal("Error starting server:", err)
	}
}

