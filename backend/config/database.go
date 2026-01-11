package config

import (
	"fmt"
	"log"
	"os"

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
		DB, err = gorm.Open(sqlite.Dialector{
			DriverName: "sqlite",
			DSN:        "test.db",
		}, &gorm.Config{})
		if err != nil {
			log.Fatal("Failed to connect to SQLite database:", err)
		}
		fmt.Println("✅ Connected to SQLite database successfully!")
		return
	}

	// Try PostgreSQL/Supabase connection
	log.Println("Attempting to connect to PostgreSQL...")
	DB, err = gorm.Open(postgres.Open(databaseURL), &gorm.Config{})
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
