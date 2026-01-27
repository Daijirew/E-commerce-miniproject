package controllers

import (
	"net/http"
	"pet-food-ecommerce/config"
	"pet-food-ecommerce/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// CreateOrderRequest represents the request body for creating an order
type CreateOrderRequest struct {
	ShippingAddress string `json:"shipping_address" binding:"required" example:"123 Main St, Bangkok 10110"`
}

// UpdateOrderStatusRequest represents the request body for updating order status
type UpdateOrderStatusRequest struct {
	Status string `json:"status" binding:"required" example:"processing" enums:"pending,processing,shipped,delivered,cancelled"`
}

// CreateOrder godoc
// @Summary Create a new order
// @Description Create an order from the items in the user's cart
// @Tags Orders
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body CreateOrderRequest true "Shipping address"
// @Success 201 {object} map[string]interface{} "Order created successfully"
// @Failure 400 {object} map[string]interface{} "Bad request - empty cart or insufficient stock"
// @Failure 401 {object} map[string]interface{} "Unauthorized"
// @Failure 500 {object} map[string]interface{} "Internal server error"
// @Router /orders [post]
func CreateOrder(c *gin.Context) {
	userID := c.GetString("user_id")

	var req CreateOrderRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Get user's cart items
	var cartItems []models.Cart
	if err := config.GetDB().Preload("Product").Where("user_id = ?", userID).Find(&cartItems).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch cart"})
		return
	}

	if len(cartItems) == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Cart is empty"})
		return
	}

	// Calculate total and prepare order items
	var totalAmount float64
	var orderItems []models.OrderItem

	for _, item := range cartItems {
		// Check stock availability
		if item.Product.Stock < item.Quantity {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": "Insufficient stock for product: " + item.Product.Name,
			})
			return
		}

		totalAmount += item.Product.Price * float64(item.Quantity)
		orderItems = append(orderItems, models.OrderItem{
			ProductID: item.ProductID,
			Quantity:  item.Quantity,
			Price:     item.Product.Price,
		})
	}

	// Start transaction
	tx := config.GetDB().Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Create order
	userUUID, _ := uuid.Parse(userID)
	order := models.Order{
		UserID:          userUUID,
		TotalAmount:     totalAmount,
		Status:          "pending",
		ShippingAddress: req.ShippingAddress,
	}

	if err := tx.Create(&order).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create order"})
		return
	}

	// Create order items and update stock
	for i := range orderItems {
		orderItems[i].OrderID = order.ID
		if err := tx.Create(&orderItems[i]).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create order items"})
			return
		}

		// Update product stock
		if err := tx.Model(&models.Product{}).Where("id = ?", orderItems[i].ProductID).
			Update("stock", gorm.Expr("stock - ?", orderItems[i].Quantity)).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update stock"})
			return
		}
	}

	// Clear cart
	if err := tx.Where("user_id = ?", userID).Delete(&models.Cart{}).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to clear cart"})
		return
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to complete order"})
		return
	}

	// Reload order with items
	config.GetDB().Preload("OrderItems.Product").First(&order, order.ID)

	c.JSON(http.StatusCreated, gin.H{
		"message": "Order created successfully",
		"order":   order,
	})
}

// GetOrders godoc
// @Summary Get user's orders
// @Description Get all orders for the authenticated user
// @Tags Orders
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} map[string]interface{} "List of user's orders"
// @Failure 401 {object} map[string]interface{} "Unauthorized"
// @Failure 500 {object} map[string]interface{} "Internal server error"
// @Router /orders [get]
func GetOrders(c *gin.Context) {
	userID := c.GetString("user_id")

	var orders []models.Order
	if err := config.GetDB().Preload("OrderItems.Product").Where("user_id = ?", userID).
		Order("created_at DESC").Find(&orders).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch orders"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"orders": orders})
}

// GetOrder godoc
// @Summary Get order by ID
// @Description Get detailed information about a specific order
// @Tags Orders
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Order ID"
// @Success 200 {object} map[string]interface{} "Order details"
// @Failure 401 {object} map[string]interface{} "Unauthorized"
// @Failure 404 {object} map[string]interface{} "Order not found"
// @Router /orders/{id} [get]
func GetOrder(c *gin.Context) {
	userID := c.GetString("user_id")
	orderID := c.Param("id")

	var order models.Order
	if err := config.GetDB().Preload("OrderItems.Product").Preload("OrderItems.Product.Category").
		Where("id = ? AND user_id = ?", orderID, userID).First(&order).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Order not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"order": order})
}

// UpdateOrderStatus godoc
// @Summary Update order status (Admin only)
// @Description Update the status of an order
// @Tags Admin - Orders
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Order ID"
// @Param request body UpdateOrderStatusRequest true "New status"
// @Success 200 {object} map[string]interface{} "Order status updated"
// @Failure 400 {object} map[string]interface{} "Invalid status"
// @Failure 401 {object} map[string]interface{} "Unauthorized"
// @Failure 403 {object} map[string]interface{} "Forbidden - Admin access required"
// @Failure 404 {object} map[string]interface{} "Order not found"
// @Failure 500 {object} map[string]interface{} "Internal server error"
// @Router /admin/orders/{id}/status [put]
func UpdateOrderStatus(c *gin.Context) {
	orderID := c.Param("id")

	var req UpdateOrderStatusRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Validate status
	validStatuses := []string{"pending", "processing", "shipped", "delivered", "cancelled"}
	isValid := false
	for _, status := range validStatuses {
		if req.Status == status {
			isValid = true
			break
		}
	}

	if !isValid {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid status"})
		return
	}

	var order models.Order
	if err := config.GetDB().Where("id = ?", orderID).First(&order).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Order not found"})
		return
	}

	order.Status = req.Status
	if err := config.GetDB().Save(&order).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update order status"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Order status updated successfully",
		"order":   order,
	})
}

// GetAllOrders godoc
// @Summary Get all orders (Admin only)
// @Description Get all orders in the system with user details
// @Tags Admin - Orders
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} map[string]interface{} "List of all orders"
// @Failure 401 {object} map[string]interface{} "Unauthorized"
// @Failure 403 {object} map[string]interface{} "Forbidden - Admin access required"
// @Failure 500 {object} map[string]interface{} "Internal server error"
// @Router /admin/orders [get]
func GetAllOrders(c *gin.Context) {
	var orders []models.Order
	if err := config.GetDB().Preload("User").Preload("OrderItems.Product").
		Order("created_at DESC").Find(&orders).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch orders"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"orders": orders})
}
