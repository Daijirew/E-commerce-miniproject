package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Cart struct {
	ID        uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UserID    uuid.UUID `gorm:"type:uuid;not null" json:"user_id"`
	User      User      `gorm:"foreignKey:UserID" json:"user,omitempty"`
	ProductID uuid.UUID `gorm:"type:uuid;not null" json:"product_id"`
	Product   Product   `gorm:"foreignKey:ProductID" json:"product,omitempty"`
	Quantity  int       `gorm:"not null;default:1" json:"quantity"`
	CreatedAt time.Time `json:"created_at"`
}

func (c *Cart) BeforeCreate(tx *gorm.DB) error {
	if c.ID == uuid.Nil {
		c.ID = uuid.New()
	}
	return nil
}
