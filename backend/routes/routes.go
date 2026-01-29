package routes

import (
	"pet-food-ecommerce/controllers"
	"pet-food-ecommerce/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(router *gin.Engine) {
	// Public routes
	api := router.Group("/api")
	{
		// Health check
		api.GET("/health", func(c *gin.Context) {
			c.JSON(200, gin.H{"status": "ok"})
		})

		// Auth routes
		auth := api.Group("/auth")
		{
			auth.POST("/register", controllers.Register)
			auth.POST("/login", controllers.Login)
			auth.POST("/forgot-password", controllers.RequestPasswordReset)
			auth.POST("/reset-password", controllers.ResetPassword)
		}

		// Public product routes
		products := api.Group("/products")
		{
			products.GET("", controllers.GetProducts)
			products.GET("/:id", controllers.GetProduct)
			products.GET("/category/:categoryId", controllers.GetProductsByCategory)
		}

		// Public category routes
		categories := api.Group("/categories")
		{
			categories.GET("", controllers.GetCategories)
			categories.GET("/:id", controllers.GetCategory)
		}
	}

	// Protected routes (require authentication)
	protected := api.Group("")
	protected.Use(middleware.AuthMiddleware())
	{
		// User profile
		protected.GET("/profile", controllers.GetProfile)
		protected.PUT("/profile", controllers.UpdateProfile)

		// Cart routes
		cart := protected.Group("/cart")
		{
			cart.GET("", controllers.GetCart)
			cart.POST("", controllers.AddToCart)
			cart.PUT("/:id", controllers.UpdateCartItem)
			cart.DELETE("/:id", controllers.RemoveFromCart)
			cart.DELETE("", controllers.ClearCart)
		}

		// Order routes
		orders := protected.Group("/orders")
		{
			orders.POST("", controllers.CreateOrder)
			orders.GET("", controllers.GetOrders)
			orders.GET("/:id", controllers.GetOrder)
		}
	}

	// Admin routes
	admin := api.Group("/admin")
	admin.Use(middleware.AuthMiddleware(), middleware.AdminMiddleware())
	{
		// Product management
		products := admin.Group("/products")
		{
			products.POST("", controllers.CreateProduct)
			products.PUT("/:id", controllers.UpdateProduct)
			products.DELETE("/:id", controllers.DeleteProduct)
		}

		// Category management
		categories := admin.Group("/categories")
		{
			categories.POST("", controllers.CreateCategory)
			categories.PUT("/:id", controllers.UpdateCategory)
			categories.DELETE("/:id", controllers.DeleteCategory)
		}

		// Order management
		orders := admin.Group("/orders")
		{
			orders.GET("", controllers.GetAllOrders)
			orders.PUT("/:id/status", controllers.UpdateOrderStatus)
		}
	}
}
