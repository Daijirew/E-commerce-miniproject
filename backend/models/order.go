package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Order struct {
	ID              uuid.UUID   `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	UserID          uuid.UUID   `gorm:"type:uuid;not null" json:"user_id"`
	User            User        `gorm:"foreignKey:UserID" json:"user,omitempty"`
	TotalAmount     float64     `gorm:"not null" json:"total_amount"`
	Status          string      `gorm:"default:'pending'" json:"status"` // pending, processing, shipped, delivered, cancelled
	ShippingAddress string      `gorm:"not null" json:"shipping_address"`
	OrderItems      []OrderItem `gorm:"foreignKey:OrderID" json:"order_items,omitempty"`
	CreatedAt       time.Time   `json:"created_at"`
	UpdatedAt       time.Time   `json:"updated_at"`
}

type OrderItem struct {
	ID        uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	OrderID   uuid.UUID `gorm:"type:uuid;not null" json:"order_id"`
	ProductID uuid.UUID `gorm:"type:uuid;not null" json:"product_id"`
	Product   Product   `gorm:"foreignKey:ProductID" json:"product,omitempty"`
	Quantity  int       `gorm:"not null" json:"quantity"`
	Price     float64   `gorm:"not null" json:"price"` // Price at time of purchase
}

func (o *Order) BeforeCreate(tx *gorm.DB) error {
	if o.ID == uuid.Nil {
		o.ID = uuid.New()
	}
	return nil
}

func (oi *OrderItem) BeforeCreate(tx *gorm.DB) error {
	if oi.ID == uuid.Nil {
		oi.ID = uuid.New()
	}
	return nil
}
