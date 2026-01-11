package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Product struct {
	ID          uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	Name        string    `gorm:"not null" json:"name"`
	Description string    `json:"description"`
	Price       float64   `gorm:"not null" json:"price"`
	Stock       int       `gorm:"not null;default:0" json:"stock"`
	CategoryID  uuid.UUID `gorm:"type:uuid;not null" json:"category_id"`
	Category    Category  `gorm:"foreignKey:CategoryID" json:"category,omitempty"`
	ImageURL    string    `json:"image_url"`
	Brand       string    `json:"brand"`
	Weight      string    `json:"weight"` // e.g., "1kg", "500g"
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

func (p *Product) BeforeCreate(tx *gorm.DB) error {
	if p.ID == uuid.Nil {
		p.ID = uuid.New()
	}
	return nil
}
