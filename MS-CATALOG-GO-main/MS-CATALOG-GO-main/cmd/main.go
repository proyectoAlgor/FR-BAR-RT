package main

import (
	"log"
	"os"

	"ms-catalog-go/internal/handlers"
	"ms-catalog-go/internal/middleware"
	"ms-catalog-go/internal/repository"
	"ms-catalog-go/internal/service"

	"github.com/gin-gonic/gin"
	_ "github.com/lib/pq"
)

func main() {
	// Configuración
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgres://bar_user:bar_password@postgres:5432/bar?sslmode=disable"
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Repositorio
	repo, err := repository.NewProductRepository(dbURL)
	if err != nil {
		log.Fatal("Error connecting to database:", err)
	}

	// Servicios
	productService := service.NewProductService(repo)

	// Handlers
	productHandler := handlers.NewProductHandler(productService)

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
	router.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok", "service": "MS-CATALOG-BAR"})
	})

	// Rutas protegidas (requieren autenticación)
	api := router.Group("/")
	api.Use(middleware.RequireAuth())
	{
		// Categories
		api.POST("/categories", productHandler.CreateCategory)
		api.GET("/categories", productHandler.GetCategories)
		api.GET("/categories/:id", productHandler.GetCategory)
		api.PUT("/categories/:id", productHandler.UpdateCategory)
		api.DELETE("/categories/:id", productHandler.DeleteCategory)

		// Products
		api.POST("/products", productHandler.CreateProduct)
		api.GET("/products", productHandler.GetProducts)
		api.GET("/products/:id", productHandler.GetProduct)
		api.PUT("/products/:id", productHandler.UpdateProduct)
		api.DELETE("/products/:id", productHandler.DeleteProduct)
	}

	log.Printf("MS-PRODUCT-BAR starting on port %s", port)
	router.Run(":" + port)
}
