package config

import (
	"fmt"
	"log"
	"os"
	"strings"

	"gorm.io/driver/postgres"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDatabase() {
	databaseURL := os.Getenv("DATABASE_URL")

	var err error

	// Try SQLite first for local testing if DATABASE_URL is empty or invalid
	if databaseURL == "" || databaseURL == "sqlite" {
		log.Println("Using SQLite for local testing...")
		DB, err = gorm.Open(sqlite.Open("test.db"), &gorm.Config{})
		if err != nil {
			log.Fatal("Failed to connect to SQLite database:", err)
		}
		fmt.Println("✅ Connected to SQLite database successfully!")
		return
	}

	// Try PostgreSQL/Supabase connection
	log.Println("Attempting to connect to PostgreSQL...")
	// เพิ่ม connect_timeout=10 เพื่อป้องกัน TCP hang นาน
	connStr := databaseURL
	if !contains(databaseURL, "connect_timeout") {
		separator := "?"
		if contains(databaseURL, "?") {
			separator = "&"
		}
		connStr = databaseURL + separator + "connect_timeout=10"
	}
	DB, err = gorm.Open(postgres.Open(connStr), &gorm.Config{})
	if err != nil {
		log.Printf("⚠️  Failed to connect to PostgreSQL: %v", err)
		log.Println("Falling back to SQLite for local testing...")

		// Fallback to SQLite
		DB, err = gorm.Open(sqlite.Open("file:test.db?cache=shared&mode=rwc"), &gorm.Config{})
		if err != nil {
			log.Fatal("Failed to connect to any database:", err)
		}
		fmt.Println("✅ Connected to SQLite database successfully!")
		return
	}

	fmt.Println("✅ Connected to PostgreSQL database successfully!")
}

func GetDB() *gorm.DB {
	return DB
}

func contains(s, substr string) bool {
	return strings.Contains(s, substr)
}
