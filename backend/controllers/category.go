package controllers

import (
	"net/http"
	"pet-food-ecommerce/config"
	"pet-food-ecommerce/models"

	"github.com/gin-gonic/gin"
)

func GetCategories(c *gin.Context) {
	var categories []models.Category
	if err := config.GetDB().Find(&categories).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch categories"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"categories": categories})
}

func GetCategory(c *gin.Context) {
	categoryID := c.Param("id")

	var category models.Category
	if err := config.GetDB().Where("id = ?", categoryID).First(&category).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Category not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"category": category})
}

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

func DeleteCategory(c *gin.Context) {
	categoryID := c.Param("id")

	if err := config.GetDB().Delete(&models.Category{}, "id = ?", categoryID).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete category"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Category deleted successfully"})
}
