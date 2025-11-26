package models

import (
	"time"
)

// OrderStatus representa el estado de una orden
type OrderStatus string

const (
	OrderStatusPending   OrderStatus = "pending"
	OrderStatusConfirmed OrderStatus = "confirmed"
	OrderStatusPreparing OrderStatus = "preparing"
	OrderStatusReady     OrderStatus = "ready"
	OrderStatusDelivered OrderStatus = "delivered"
	OrderStatusCancelled OrderStatus = "cancelled"
	OrderStatusClosed    OrderStatus = "closed"
)

// PaymentMethod representa el método de pago
type PaymentMethod string

const (
	PaymentMethodCash      PaymentMethod = "cash"
	PaymentMethodCard      PaymentMethod = "card"
	PaymentMethodTransfer  PaymentMethod = "transfer"
	PaymentMethodOther     PaymentMethod = "other"
)

// PaymentStatus representa el estado del pago
type PaymentStatus string

const (
	PaymentStatusPending  PaymentStatus = "pending"
	PaymentStatusCompleted PaymentStatus = "completed"
	PaymentStatusFailed   PaymentStatus = "failed"
	PaymentStatusRefunded PaymentStatus = "refunded"
)

// Order representa una orden/pedido
type Order struct {
	ID           string     `json:"id" db:"id"`
	OrderNumber  string     `json:"order_number" db:"order_number"`
	TableID      string     `json:"table_id" db:"table_id"`
	LocationID   string     `json:"location_id" db:"location_id"`
	WaiterID     *string    `json:"waiter_id" db:"waiter_id"`
	CashierID    *string    `json:"cashier_id" db:"cashier_id"`
	Status       OrderStatus `json:"status" db:"status"`
	SubtotalCents int       `json:"subtotal_cents" db:"subtotal_cents"`
	TaxCents     int        `json:"tax_cents" db:"tax_cents"`
	DiscountCents int       `json:"discount_cents" db:"discount_cents"`
	TotalCents   int       `json:"total_cents" db:"total_cents"`
	Notes        *string    `json:"notes" db:"notes"`
	CreatedAt    time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at" db:"updated_at"`
	ClosedAt     *time.Time `json:"closed_at" db:"closed_at"`
	
	// Relaciones (opcionales, para respuestas completas)
	Table        *TableInfo    `json:"table,omitempty"`
	Location     *LocationInfo `json:"location,omitempty"`
	Waiter       *UserInfo     `json:"waiter,omitempty"`
	Cashier      *UserInfo     `json:"cashier,omitempty"`
	Items        []OrderItem   `json:"items,omitempty"`
	Payments     []Payment     `json:"payments,omitempty"`
}

// OrderItem representa un item/producto en una orden
type OrderItem struct {
	ID            string    `json:"id" db:"id"`
	OrderID       string    `json:"order_id" db:"order_id"`
	ProductID     string    `json:"product_id" db:"product_id"`
	Quantity      int       `json:"quantity" db:"quantity"`
	UnitPriceCents int      `json:"unit_price_cents" db:"unit_price_cents"`
	SubtotalCents int       `json:"subtotal_cents" db:"subtotal_cents"`
	Notes         *string   `json:"notes" db:"notes"`
	CreatedAt     time.Time `json:"created_at" db:"created_at"`
	
	// Relaciones (opcionales)
	Product       *ProductInfo `json:"product,omitempty"`
}

// Payment representa un pago
type Payment struct {
	ID            string        `json:"id" db:"id"`
	OrderID       string        `json:"order_id" db:"order_id"`
	CashierID     string        `json:"cashier_id" db:"cashier_id"`
	AmountCents   int           `json:"amount_cents" db:"amount_cents"`
	PaymentMethod PaymentMethod `json:"payment_method" db:"payment_method"`
	PaymentStatus PaymentStatus `json:"payment_status" db:"payment_status"`
	ReferenceNumber *string     `json:"reference_number" db:"reference_number"`
	Notes         *string       `json:"notes" db:"notes"`
	CreatedAt     time.Time     `json:"created_at" db:"created_at"`
	CompletedAt   *time.Time    `json:"completed_at" db:"completed_at"`
	
	// Relaciones (opcionales)
	Cashier       *UserInfo     `json:"cashier,omitempty"`
	Order         *Order        `json:"order,omitempty"`
}

// Información auxiliar para relaciones
type TableInfo struct {
	ID     string `json:"id"`
	Code   string `json:"code"`
	Seats  int    `json:"seats"`
	Status string `json:"status"`
}

type LocationInfo struct {
	ID      string `json:"id"`
	Code    string `json:"code"`
	Name    string `json:"name"`
	Address *string `json:"address"`
}

type UserInfo struct {
	ID        string `json:"id"`
	Email     string `json:"email"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
}

type ProductInfo struct {
	ID         string `json:"id"`
	Code       string `json:"code"`
	Name       string `json:"name"`
	PriceCents int    `json:"price_cents"`
}

// Request models
type CreateOrderRequest struct {
	TableID    string                `json:"table_id" binding:"required"`
	LocationID string                `json:"location_id" binding:"required"`
	WaiterID   *string               `json:"waiter_id"`
	Items      []CreateOrderItemRequest `json:"items" binding:"required,min=1"`
	Notes      *string               `json:"notes"`
}

type CreateOrderItemRequest struct {
	ProductID string `json:"product_id" binding:"required"`
	Quantity  int    `json:"quantity" binding:"required,min=1"`
	Notes     *string `json:"notes"`
}

type UpdateOrderRequest struct {
	Status        *OrderStatus `json:"status"`
	Items         []CreateOrderItemRequest `json:"items"`
	DiscountCents *int         `json:"discount_cents"`
	Notes         *string      `json:"notes"`
}

type CreatePaymentRequest struct {
	OrderID        string        `json:"order_id" binding:"required"`
	AmountCents    int           `json:"amount_cents" binding:"required,min=1"`
	PaymentMethod  PaymentMethod `json:"payment_method" binding:"required"`
	ReferenceNumber *string      `json:"reference_number"`
	Notes          *string       `json:"notes"`
}

type CloseOrderRequest struct {
	Payments []CreatePaymentRequest `json:"payments" binding:"required,min=1"`
	Notes    *string                `json:"notes"`
}

// Query filters
type OrderFilter struct {
	LocationID *string
	TableID    *string
	WaiterID   *string
	CashierID  *string
	Status     *OrderStatus
	StartDate  *time.Time
	EndDate    *time.Time
	Limit      int
	Offset     int
}

type PaymentFilter struct {
	OrderID       *string
	CashierID     *string
	PaymentMethod *PaymentMethod
	PaymentStatus *PaymentStatus
	StartDate     *time.Time
	EndDate       *time.Time
	Limit         int
	Offset        int
}

// Summary models
type SalesSummary struct {
	TotalOrders      int   `json:"total_orders"`
	TotalRevenueCents int  `json:"total_revenue_cents"`
	TotalPayments    int   `json:"total_payments"`
	ByPaymentMethod  map[PaymentMethod]int `json:"by_payment_method"`
	ByStatus         map[OrderStatus]int  `json:"by_status"`
}

