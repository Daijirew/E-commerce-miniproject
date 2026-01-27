package controllers

import (
	"net/http"
	"pet-food-ecommerce/config"
	"pet-food-ecommerce/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// AddToCartRequest represents the request body for adding an item to cart
type AddToCartRequest struct {
	ProductID string `json:"product_id" binding:"required" example:"aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"`
	Quantity  int    `json:"quantity" binding:"required,min=1" example:"2"`
}

// UpdateCartRequest represents the request body for updating cart item quantity
type UpdateCartRequest struct {
	Quantity int `json:"quantity" binding:"required,min=1" example:"3"`
}

// GetCart godoc
// @Summary Get user's cart
// @Description Get all items in the authenticated user's shopping cart with total
// @Tags Cart
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} map[string]interface{} "Cart items and total"
// @Failure 401 {object} map[string]interface{} "Unauthorized"
// @Failure 500 {object} map[string]interface{} "Internal server error"
// @Router /cart [get]
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

// AddToCart godoc
// @Summary Add item to cart
// @Description Add a product to the authenticated user's shopping cart
// @Tags Cart
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body AddToCartRequest true "Cart item data"
// @Success 201 {object} map[string]interface{} "Item added to cart"
// @Success 200 {object} map[string]interface{} "Cart updated (item already exists)"
// @Failure 400 {object} map[string]interface{} "Bad request or insufficient stock"
// @Failure 401 {object} map[string]interface{} "Unauthorized"
// @Failure 404 {object} map[string]interface{} "Product not found"
// @Failure 500 {object} map[string]interface{} "Internal server error"
// @Router /cart [post]
func AddToCart(c *gin.Context) {
	userID := c.GetString("user_id")

	var req AddToCartRequest

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

// UpdateCartItem godoc
// @Summary Update cart item quantity
// @Description Update the quantity of an item in the cart
// @Tags Cart
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Cart item ID"
// @Param request body UpdateCartRequest true "New quantity"
// @Success 200 {object} map[string]interface{} "Cart updated successfully"
// @Failure 400 {object} map[string]interface{} "Bad request or insufficient stock"
// @Failure 401 {object} map[string]interface{} "Unauthorized"
// @Failure 404 {object} map[string]interface{} "Cart item not found"
// @Failure 500 {object} map[string]interface{} "Internal server error"
// @Router /cart/{id} [put]
func UpdateCartItem(c *gin.Context) {
	userID := c.GetString("user_id")
	cartID := c.Param("id")

	var cart models.Cart
	if err := config.GetDB().Where("id = ? AND user_id = ?", cartID, userID).First(&cart).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Cart item not found"})
		return
	}

	var req UpdateCartRequest

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

// RemoveFromCart godoc
// @Summary Remove item from cart
// @Description Remove a specific item from the cart
// @Tags Cart
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Cart item ID"
// @Success 200 {object} map[string]interface{} "Item removed from cart"
// @Failure 401 {object} map[string]interface{} "Unauthorized"
// @Failure 404 {object} map[string]interface{} "Cart item not found"
// @Failure 500 {object} map[string]interface{} "Internal server error"
// @Router /cart/{id} [delete]
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

// ClearCart godoc
// @Summary Clear entire cart
// @Description Remove all items from the authenticated user's cart
// @Tags Cart
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} map[string]interface{} "Cart cleared successfully"
// @Failure 401 {object} map[string]interface{} "Unauthorized"
// @Failure 500 {object} map[string]interface{} "Internal server error"
// @Router /cart [delete]
func ClearCart(c *gin.Context) {
	userID := c.GetString("user_id")

	if err := config.GetDB().Where("user_id = ?", userID).Delete(&models.Cart{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to clear cart"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Cart cleared successfully"})
}
