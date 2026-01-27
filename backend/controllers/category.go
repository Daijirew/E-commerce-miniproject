package controllers

import (
	"net/http"
	"pet-food-ecommerce/config"
	"pet-food-ecommerce/models"

	"github.com/gin-gonic/gin"
)

// CategoryInput represents the request body for creating/updating a category
type CategoryInput struct {
	Name        string `json:"name" binding:"required" example:"อาหารสุนัข"`
	Description string `json:"description" example:"อาหารคุณภาพสูงสำหรับสุนัขทุกวัย"`
	ImageURL    string `json:"image_url" example:"https://example.com/category.jpg"`
}

// GetCategories godoc
// @Summary Get all categories
// @Description Get a list of all product categories
// @Tags Categories
// @Accept json
// @Produce json
// @Success 200 {object} map[string]interface{} "List of categories"
// @Failure 500 {object} map[string]interface{} "Internal server error"
// @Router /categories [get]
func GetCategories(c *gin.Context) {
	var categories []models.Category
	if err := config.GetDB().Find(&categories).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch categories"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"categories": categories})
}

// GetCategory godoc
// @Summary Get a category by ID
// @Description Get detailed information about a specific category
// @Tags Categories
// @Accept json
// @Produce json
// @Param id path string true "Category ID"
// @Success 200 {object} map[string]interface{} "Category details"
// @Failure 404 {object} map[string]interface{} "Category not found"
// @Router /categories/{id} [get]
func GetCategory(c *gin.Context) {
	categoryID := c.Param("id")

	var category models.Category
	if err := config.GetDB().Where("id = ?", categoryID).First(&category).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Category not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"category": category})
}

// CreateCategory godoc
// @Summary Create a new category (Admin only)
// @Description Create a new product category
// @Tags Admin - Categories
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param category body CategoryInput true "Category data"
// @Success 201 {object} map[string]interface{} "Category created successfully"
// @Failure 400 {object} map[string]interface{} "Bad request"
// @Failure 401 {object} map[string]interface{} "Unauthorized"
// @Failure 403 {object} map[string]interface{} "Forbidden - Admin access required"
// @Failure 500 {object} map[string]interface{} "Internal server error"
// @Router /admin/categories [post]
func CreateCategory(c *gin.Context) {
	var category models.Category
	if err := c.ShouldBindJSON(&category); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := config.GetDB().Create(&category).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create category"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":  "Category created successfully",
		"category": category,
	})
}

// UpdateCategory godoc
// @Summary Update a category (Admin only)
// @Description Update an existing category's information
// @Tags Admin - Categories
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Category ID"
// @Param category body CategoryInput true "Category data"
// @Success 200 {object} map[string]interface{} "Category updated successfully"
// @Failure 400 {object} map[string]interface{} "Bad request"
// @Failure 401 {object} map[string]interface{} "Unauthorized"
// @Failure 403 {object} map[string]interface{} "Forbidden - Admin access required"
// @Failure 404 {object} map[string]interface{} "Category not found"
// @Failure 500 {object} map[string]interface{} "Internal server error"
// @Router /admin/categories/{id} [put]
func UpdateCategory(c *gin.Context) {
	categoryID := c.Param("id")

	var category models.Category
	if err := config.GetDB().Where("id = ?", categoryID).First(&category).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Category not found"})
		return
	}

	if err := c.ShouldBindJSON(&category); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := config.GetDB().Save(&category).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update category"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":  "Category updated successfully",
		"category": category,
	})
}

// DeleteCategory godoc
// @Summary Delete a category (Admin only)
// @Description Remove a category from the system
// @Tags Admin - Categories
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Category ID"
// @Success 200 {object} map[string]interface{} "Category deleted successfully"
// @Failure 401 {object} map[string]interface{} "Unauthorized"
// @Failure 403 {object} map[string]interface{} "Forbidden - Admin access required"
// @Failure 500 {object} map[string]interface{} "Internal server error"
// @Router /admin/categories/{id} [delete]
func DeleteCategory(c *gin.Context) {
	categoryID := c.Param("id")

	if err := config.GetDB().Delete(&models.Category{}, "id = ?", categoryID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete category"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Category deleted successfully"})
}
