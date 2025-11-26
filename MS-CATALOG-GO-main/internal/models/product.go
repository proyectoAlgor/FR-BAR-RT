package models

import (
	"time"
)

type Category struct {
	ID        string    `json:"id" db:"id"`
	Name      string    `json:"name" db:"name"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
}

type Product struct {
	ID         string    `json:"id" db:"id"`
	CategoryID *string   `json:"category_id" db:"category_id"`
	Code       string    `json:"code" db:"code"`
	Name       string    `json:"name" db:"name"`
	PriceCents int       `json:"price_cents" db:"price_cents"`
	IsActive   bool      `json:"is_active" db:"is_active"`
	CreatedAt  time.Time `json:"created_at" db:"created_at"`
	UpdatedAt  time.Time `json:"updated_at" db:"updated_at"`
	Category   *Category `json:"category,omitempty"`
}

type CreateCategoryRequest struct {
	Name string `json:"name" binding:"required"`
}

type UpdateCategoryRequest struct {
	Name string `json:"name" binding:"required"`
}

type CreateProductRequest struct {
	CategoryID *string `json:"category_id"`
	Code       string  `json:"code" binding:"required"`
	Name       string  `json:"name" binding:"required"`
	PriceCents int     `json:"price_cents" binding:"required,min=0"`
}

type UpdateProductRequest struct {
	CategoryID *string `json:"category_id"`
	Code       string  `json:"code" binding:"required"`
	Name       string  `json:"name" binding:"required"`
	PriceCents int     `json:"price_cents" binding:"required,min=0"`
	IsActive   bool    `json:"is_active"`
}
