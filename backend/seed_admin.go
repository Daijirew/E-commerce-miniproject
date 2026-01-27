//go:build ignore
// +build ignore

package main

import (
	"fmt"
	"log"
	"os"

	"github.com/google/uuid"
	"github.com/joho/godotenv"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

type User struct {
	ID           uuid.UUID `gorm:"type:uuid;primary_key"`
	Email        string    `gorm:"uniqueIndex;not null"`
	PasswordHash string    `gorm:"not null"`
	Name         string    `gorm:"not null"`
	Phone        string
	Address      string
	Role         string `gorm:"default:'customer'"`
}

func main() {
	// Load .env
	godotenv.Load()

	// Connect to database
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		log.Fatal("DATABASE_URL not set")
	}

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Hash password
	password := "123456"
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		log.Fatal("Failed to hash password:", err)
	}

	// Check if admin already exists
	var existingUser User
	result := db.Where("email = ?", "admin@admin.com").First(&existingUser)
	if result.Error == nil {
		// User exists, update role to admin
		db.Model(&existingUser).Update("role", "admin")
		fmt.Println("✅ Updated existing user to admin role")
		fmt.Println("   Email: admin@admin.com")
		return
	}

	// Create admin user
	admin := User{
		ID:           uuid.New(),
		Email:        "admin@admin.com",
		PasswordHash: string(hashedPassword),
		Name:         "Admin",
		Phone:        "",
		Address:      "",
		Role:         "admin",
	}

	if err := db.Create(&admin).Error; err != nil {
		log.Fatal("Failed to create admin user:", err)
	}

	fmt.Println("✅ Admin user created successfully!")
	fmt.Println("   Email: admin@admin.com")
	fmt.Println("   Password: 123456")
}
