package controllers

import (
	"net/http"
	"pet-food-ecommerce/config"
	"pet-food-ecommerce/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func GetCart(c *gin.Context) {
	userID := c.GetString("user_id")

	var cartItems []models.Cart
	if err := config.GetDB().Preload("Product").Preload("Product.Category").Where("user_id = ?", userID).Find(&cartItems).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch cart"})
		return
	}

	// Calculate total
	var total float64
	for _, item := range cartItems {
		total += item.Product.Price * float64(item.Quantity)
	}

	c.JSON(http.StatusOK, gin.H{
		"cart_items": cartItems,
		"total":      total,
	})
}

func AddToCart(c *gin.Context) {
	userID := c.GetString("user_id")

	var req struct {
		ProductID string `json:"product_id" binding:"required"`
		Quantity  int    `json:"quantity" binding:"required,min=1"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check if product exists and has enough stock
	var product models.Product
	if err := config.GetDB().Where("id = ?", req.ProductID).First(&product).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
		return
	}

	if product.Stock < req.Quantity {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Insufficient stock"})
		return
	}

	// Check if item already in cart
	var existingCart models.Cart
	err := config.GetDB().Where("user_id = ? AND product_id = ?", userID, req.ProductID).First(&existingCart).Error

	if err == nil {
		// Update quantity
		existingCart.Quantity += req.Quantity
		if err := config.GetDB().Save(&existingCart).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update cart"})
			return
		}

		config.GetDB().Preload("Product").Preload("Product.Category").First(&existingCart, existingCart.ID)
		c.JSON(http.StatusOK, gin.H{
			"message":   "Cart updated successfully",
			"cart_item": existingCart,
		})
		return
	}

	// Create new cart item
	userUUID, _ := uuid.Parse(userID)
	productUUID, _ := uuid.Parse(req.ProductID)

	cartItem := models.Cart{
		UserID:    userUUID,
		ProductID: productUUID,
		Quantity:  req.Quantity,
	}

	if err := config.GetDB().Create(&cartItem).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add to cart"})
		return
	}

	config.GetDB().Preload("Product").Preload("Product.Category").First(&cartItem, cartItem.ID)

	c.JSON(http.StatusCreated, gin.H{
		"message":   "Added to cart successfully",
		"cart_item": cartItem,
	})
}

func UpdateCartItem(c *gin.Context) {
	userID := c.GetString("user_id")
	cartID := c.Param("id")

	var cart models.Cart
	if err := config.GetDB().Where("id = ? AND user_id = ?", cartID, userID).First(&cart).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Cart item not found"})
		return
	}

	var req struct {
		Quantity int `json:"quantity" binding:"required,min=1"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Check stock
	var product models.Product
	if err := config.GetDB().Where("id = ?", cart.ProductID).First(&product).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
		return
	}

	if product.Stock < req.Quantity {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Insufficient stock"})
		return
	}

	cart.Quantity = req.Quantity
	if err := config.GetDB().Save(&cart).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update cart"})
		return
	}

	config.GetDB().Preload("Product").Preload("Product.Category").First(&cart, cart.ID)

	c.JSON(http.StatusOK, gin.H{
		"message":   "Cart updated successfully",
		"cart_item": cart,
	})
}

func RemoveFromCart(c *gin.Context) {
	userID := c.GetString("user_id")
	cartID := c.Param("id")

	result := config.GetDB().Where("id = ? AND user_id = ?", cartID, userID).Delete(&models.Cart{})
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to remove from cart"})
		return
	}

	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Cart item not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Removed from cart successfully"})
}

func ClearCart(c *gin.Context) {
	userID := c.GetString("user_id")

	if err := config.GetDB().Where("user_id = ?", userID).Delete(&models.Cart{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to clear cart"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Cart cleared successfully"})
}
