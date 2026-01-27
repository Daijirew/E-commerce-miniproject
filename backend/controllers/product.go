package controllers

import (
	"net/http"
	"pet-food-ecommerce/config"
	"pet-food-ecommerce/models"
	"strconv"

	"github.com/gin-gonic/gin"
)

// ProductInput represents the request body for creating/updating a product
type ProductInput struct {
	Name        string  `json:"name" binding:"required" example:"Royal Canin Medium Adult"`
	Description string  `json:"description" example:"Premium dog food for medium breeds"`
	Price       float64 `json:"price" binding:"required" example:"1599.00"`
	Stock       int     `json:"stock" example:"45"`
	CategoryID  string  `json:"category_id" binding:"required" example:"11111111-1111-1111-1111-111111111111"`
	Brand       string  `json:"brand" example:"Royal Canin"`
	Weight      string  `json:"weight" example:"3kg"`
	ImageURL    string  `json:"image_url" example:"https://example.com/image.jpg"`
}

// GetProducts godoc
// @Summary Get all products
// @Description Get a paginated list of products with optional filtering by category and search
// @Tags Products
// @Accept json
// @Produce json
// @Param page query int false "Page number" default(1)
// @Param page_size query int false "Number of items per page" default(12)
// @Param category_id query string false "Filter by category ID"
// @Param search query string false "Search by product name"
// @Success 200 {object} map[string]interface{} "List of products with pagination info"
// @Failure 500 {object} map[string]interface{} "Internal server error"
// @Router /products [get]
func GetProducts(c *gin.Context) {
	var products []models.Product

	// Pagination
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	pageSize, _ := strconv.Atoi(c.DefaultQuery("page_size", "12"))
	offset := (page - 1) * pageSize

	// Filter by category
	categoryID := c.Query("category_id")
	query := config.GetDB().Preload("Category")

	if categoryID != "" {
		query = query.Where("category_id = ?", categoryID)
	}

	// Search by name
	search := c.Query("search")
	if search != "" {
		query = query.Where("name ILIKE ?", "%"+search+"%")
	}

	var total int64
	query.Model(&models.Product{}).Count(&total)

	if err := query.Offset(offset).Limit(pageSize).Find(&products).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch products"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"products": products,
		"page":     page,
		"pageSize": pageSize,
		"total":    total,
	})
}

// GetProduct godoc
// @Summary Get a product by ID
// @Description Get detailed information about a specific product
// @Tags Products
// @Accept json
// @Produce json
// @Param id path string true "Product ID"
// @Success 200 {object} map[string]interface{} "Product details"
// @Failure 404 {object} map[string]interface{} "Product not found"
// @Router /products/{id} [get]
func GetProduct(c *gin.Context) {
	productID := c.Param("id")

	var product models.Product
	if err := config.GetDB().Preload("Category").Where("id = ?", productID).First(&product).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"product": product})
}

// CreateProduct godoc
// @Summary Create a new product (Admin only)
// @Description Create a new product in the catalog
// @Tags Admin - Products
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param product body ProductInput true "Product data"
// @Success 201 {object} map[string]interface{} "Product created successfully"
// @Failure 400 {object} map[string]interface{} "Bad request"
// @Failure 401 {object} map[string]interface{} "Unauthorized"
// @Failure 403 {object} map[string]interface{} "Forbidden - Admin access required"
// @Failure 500 {object} map[string]interface{} "Internal server error"
// @Router /admin/products [post]
func CreateProduct(c *gin.Context) {
	var product models.Product
	if err := c.ShouldBindJSON(&product); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := config.GetDB().Create(&product).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create product"})
		return
	}

	// Reload with category
	config.GetDB().Preload("Category").First(&product, product.ID)

	c.JSON(http.StatusCreated, gin.H{
		"message": "Product created successfully",
		"product": product,
	})
}

// UpdateProduct godoc
// @Summary Update a product (Admin only)
// @Description Update an existing product's information
// @Tags Admin - Products
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Product ID"
// @Param product body ProductInput true "Product data"
// @Success 200 {object} map[string]interface{} "Product updated successfully"
// @Failure 400 {object} map[string]interface{} "Bad request"
// @Failure 401 {object} map[string]interface{} "Unauthorized"
// @Failure 403 {object} map[string]interface{} "Forbidden - Admin access required"
// @Failure 404 {object} map[string]interface{} "Product not found"
// @Failure 500 {object} map[string]interface{} "Internal server error"
// @Router /admin/products/{id} [put]
func UpdateProduct(c *gin.Context) {
	productID := c.Param("id")

	var product models.Product
	if err := config.GetDB().Where("id = ?", productID).First(&product).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
		return
	}

	if err := c.ShouldBindJSON(&product); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := config.GetDB().Save(&product).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update product"})
		return
	}

	// Reload with category
	config.GetDB().Preload("Category").First(&product, product.ID)

	c.JSON(http.StatusOK, gin.H{
		"message": "Product updated successfully",
		"product": product,
	})
}

// DeleteProduct godoc
// @Summary Delete a product (Admin only)
// @Description Remove a product from the catalog
// @Tags Admin - Products
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Product ID"
// @Success 200 {object} map[string]interface{} "Product deleted successfully"
// @Failure 401 {object} map[string]interface{} "Unauthorized"
// @Failure 403 {object} map[string]interface{} "Forbidden - Admin access required"
// @Failure 500 {object} map[string]interface{} "Internal server error"
// @Router /admin/products/{id} [delete]
func DeleteProduct(c *gin.Context) {
	productID := c.Param("id")

	if err := config.GetDB().Delete(&models.Product{}, "id = ?", productID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete product"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Product deleted successfully"})
}

// GetProductsByCategory godoc
// @Summary Get products by category
// @Description Get all products belonging to a specific category
// @Tags Products
// @Accept json
// @Produce json
// @Param categoryId path string true "Category ID"
// @Success 200 {object} map[string]interface{} "List of products in the category"
// @Failure 500 {object} map[string]interface{} "Internal server error"
// @Router /products/category/{categoryId} [get]
func GetProductsByCategory(c *gin.Context) {
	categoryID := c.Param("categoryId")

	var products []models.Product
	if err := config.GetDB().Preload("Category").Where("category_id = ?", categoryID).Find(&products).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch products"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"products": products})
}
