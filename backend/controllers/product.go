package controllers

import (
	"net/http"
	"pet-food-ecommerce/config"
	"pet-food-ecommerce/models"
	"strconv"

	"github.com/gin-gonic/gin"
)

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

func GetProduct(c *gin.Context) {
	productID := c.Param("id")

	var product models.Product
	if err := config.GetDB().Preload("Category").Where("id = ?", productID).First(&product).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"product": product})
}

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

func DeleteProduct(c *gin.Context) {
	productID := c.Param("id")

	if err := config.GetDB().Delete(&models.Product{}, "id = ?", productID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete product"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Product deleted successfully"})
}

func GetProductsByCategory(c *gin.Context) {
	categoryID := c.Param("categoryId")

	var products []models.Product
	if err := config.GetDB().Preload("Category").Where("category_id = ?", categoryID).Find(&products).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch products"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"products": products})
}
