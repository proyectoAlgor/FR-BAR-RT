package repository

import (
	"database/sql"
	"fmt"
	"strings"
	"time"

	"ms-sales-go/internal/models"

	_ "github.com/lib/pq"
)

type SalesRepository interface {
	// Order operations
	CreateOrder(order *models.Order) error
	GetOrders(filter *models.OrderFilter) ([]models.Order, error)
	GetOrder(id string) (*models.Order, error)
	UpdateOrder(id string, order *models.Order) error
	CloseOrder(id string, cashierID string, closedAt time.Time) error

	// Order items operations
	CreateOrderItem(item *models.OrderItem) error
	GetOrderItems(orderID string) ([]models.OrderItem, error)
	DeleteOrderItems(orderID string) error

	// Payment operations
	CreatePayment(payment *models.Payment) error
	GetPayments(filter *models.PaymentFilter) ([]models.Payment, error)
	GetPayment(id string) (*models.Payment, error)
	GetPaymentsByOrder(orderID string) ([]models.Payment, error)
	UpdatePaymentStatus(id string, status models.PaymentStatus, completedAt *time.Time) error

	// Summary operations
	GetSalesSummary(startDate, endDate *time.Time, locationID *string) (*models.SalesSummary, error)
}

type salesRepository struct {
	db *sql.DB
}

func NewSalesRepository(dbURL string) (SalesRepository, error) {
	db, err := sql.Open("postgres", dbURL)
	if err != nil {
		return nil, fmt.Errorf("failed to open database: %w", err)
	}

	if err := db.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	return &salesRepository{db: db}, nil
}

// ================================================
// Order operations
// ================================================

func (r *salesRepository) CreateOrder(order *models.Order) error {
	query := `
		INSERT INTO bar_system.orders (
			id, order_number, table_id, location_id, waiter_id, 
			status, subtotal_cents, tax_cents, discount_cents, total_cents, notes
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
		RETURNING created_at, updated_at
	`

	err := r.db.QueryRow(
		query,
		order.ID, order.OrderNumber, order.TableID, order.LocationID, order.WaiterID,
		order.Status, order.SubtotalCents, order.TaxCents, order.DiscountCents, order.TotalCents, order.Notes,
	).Scan(&order.CreatedAt, &order.UpdatedAt)

	return err
}

func (r *salesRepository) GetOrders(filter *models.OrderFilter) ([]models.Order, error) {
	var conditions []string
	var args []interface{}
	argIndex := 1

	if filter.LocationID != nil {
		conditions = append(conditions, fmt.Sprintf("o.location_id = $%d", argIndex))
		args = append(args, *filter.LocationID)
		argIndex++
	}

	if filter.TableID != nil {
		conditions = append(conditions, fmt.Sprintf("o.table_id = $%d", argIndex))
		args = append(args, *filter.TableID)
		argIndex++
	}

	if filter.WaiterID != nil {
		conditions = append(conditions, fmt.Sprintf("o.waiter_id = $%d", argIndex))
		args = append(args, *filter.WaiterID)
		argIndex++
	}

	if filter.CashierID != nil {
		conditions = append(conditions, fmt.Sprintf("o.cashier_id = $%d", argIndex))
		args = append(args, *filter.CashierID)
		argIndex++
	}

	if filter.Status != nil {
		conditions = append(conditions, fmt.Sprintf("o.status = $%d", argIndex))
		args = append(args, *filter.Status)
		argIndex++
	}

	if filter.StartDate != nil {
		conditions = append(conditions, fmt.Sprintf("o.created_at >= $%d", argIndex))
		args = append(args, *filter.StartDate)
		argIndex++
	}

	if filter.EndDate != nil {
		conditions = append(conditions, fmt.Sprintf("o.created_at <= $%d", argIndex))
		args = append(args, *filter.EndDate)
		argIndex++
	}

	whereClause := ""
	if len(conditions) > 0 {
		whereClause = "WHERE " + strings.Join(conditions, " AND ")
	}

	limit := 100
	offset := 0
	if filter.Limit > 0 {
		limit = filter.Limit
	}
	if filter.Offset > 0 {
		offset = filter.Offset
	}

	query := fmt.Sprintf(`
		SELECT o.id, o.order_number, o.table_id, o.location_id, o.waiter_id, o.cashier_id,
		       o.status, o.subtotal_cents, o.tax_cents, o.discount_cents, o.total_cents,
		       o.notes, o.created_at, o.updated_at, o.closed_at
		FROM bar_system.orders o
		%s
		ORDER BY o.created_at DESC
		LIMIT $%d OFFSET $%d
	`, whereClause, argIndex, argIndex+1)

	args = append(args, limit, offset)

	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	orders := make([]models.Order, 0)
	for rows.Next() {
		var order models.Order
		err := rows.Scan(
			&order.ID, &order.OrderNumber, &order.TableID, &order.LocationID,
			&order.WaiterID, &order.CashierID, &order.Status,
			&order.SubtotalCents, &order.TaxCents, &order.DiscountCents, &order.TotalCents,
			&order.Notes, &order.CreatedAt, &order.UpdatedAt, &order.ClosedAt,
		)
		if err != nil {
			return nil, err
		}
		orders = append(orders, order)
	}

	return orders, rows.Err()
}

func (r *salesRepository) GetOrder(id string) (*models.Order, error) {
	query := `
		SELECT o.id, o.order_number, o.table_id, o.location_id, o.waiter_id, o.cashier_id,
		       o.status, o.subtotal_cents, o.tax_cents, o.discount_cents, o.total_cents,
		       o.notes, o.created_at, o.updated_at, o.closed_at
		FROM bar_system.orders o
		WHERE o.id = $1
	`

	var order models.Order
	err := r.db.QueryRow(query, id).Scan(
		&order.ID, &order.OrderNumber, &order.TableID, &order.LocationID,
		&order.WaiterID, &order.CashierID, &order.Status,
		&order.SubtotalCents, &order.TaxCents, &order.DiscountCents, &order.TotalCents,
		&order.Notes, &order.CreatedAt, &order.UpdatedAt, &order.ClosedAt,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("order not found")
	}
	if err != nil {
		return nil, err
	}

	return &order, nil
}

func (r *salesRepository) UpdateOrder(id string, order *models.Order) error {
	query := `
		UPDATE bar_system.orders
		SET status = $1, subtotal_cents = $2, tax_cents = $3, 
		    discount_cents = $4, total_cents = $5, notes = $6, updated_at = CURRENT_TIMESTAMP
		WHERE id = $7
		RETURNING updated_at
	`

	err := r.db.QueryRow(
		query,
		order.Status, order.SubtotalCents, order.TaxCents,
		order.DiscountCents, order.TotalCents, order.Notes, id,
	).Scan(&order.UpdatedAt)

	return err
}

func (r *salesRepository) CloseOrder(id string, cashierID string, closedAt time.Time) error {
	query := `
		UPDATE bar_system.orders
		SET status = 'closed', cashier_id = $1, closed_at = $2, updated_at = CURRENT_TIMESTAMP
		WHERE id = $3
	`

	_, err := r.db.Exec(query, cashierID, closedAt, id)
	return err
}

// ================================================
// Order items operations
// ================================================

func (r *salesRepository) CreateOrderItem(item *models.OrderItem) error {
	query := `
		INSERT INTO bar_system.order_items (
			id, order_id, product_id, quantity, unit_price_cents, subtotal_cents, notes
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING created_at
	`

	err := r.db.QueryRow(
		query,
		item.ID, item.OrderID, item.ProductID, item.Quantity,
		item.UnitPriceCents, item.SubtotalCents, item.Notes,
	).Scan(&item.CreatedAt)

	return err
}

func (r *salesRepository) GetOrderItems(orderID string) ([]models.OrderItem, error) {
	query := `
		SELECT oi.id, oi.order_id, oi.product_id, oi.quantity,
		       oi.unit_price_cents, oi.subtotal_cents, oi.notes, oi.created_at
		FROM bar_system.order_items oi
		WHERE oi.order_id = $1
		ORDER BY oi.created_at
	`

	rows, err := r.db.Query(query, orderID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := make([]models.OrderItem, 0)
	for rows.Next() {
		var item models.OrderItem
		err := rows.Scan(
			&item.ID, &item.OrderID, &item.ProductID, &item.Quantity,
			&item.UnitPriceCents, &item.SubtotalCents, &item.Notes, &item.CreatedAt,
		)
		if err != nil {
			return nil, err
		}
		items = append(items, item)
	}

	return items, rows.Err()
}

func (r *salesRepository) DeleteOrderItems(orderID string) error {
	query := `DELETE FROM bar_system.order_items WHERE order_id = $1`
	_, err := r.db.Exec(query, orderID)
	return err
}

// ================================================
// Payment operations
// ================================================

func (r *salesRepository) CreatePayment(payment *models.Payment) error {
	query := `
		INSERT INTO bar_system.payments (
			id, order_id, cashier_id, amount_cents, payment_method,
			payment_status, reference_number, notes
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING created_at
	`

	err := r.db.QueryRow(
		query,
		payment.ID, payment.OrderID, payment.CashierID, payment.AmountCents,
		payment.PaymentMethod, payment.PaymentStatus, payment.ReferenceNumber, payment.Notes,
	).Scan(&payment.CreatedAt)

	return err
}

func (r *salesRepository) GetPayments(filter *models.PaymentFilter) ([]models.Payment, error) {
	var conditions []string
	var args []interface{}
	argIndex := 1

	if filter.OrderID != nil {
		conditions = append(conditions, fmt.Sprintf("p.order_id = $%d", argIndex))
		args = append(args, *filter.OrderID)
		argIndex++
	}

	if filter.CashierID != nil {
		conditions = append(conditions, fmt.Sprintf("p.cashier_id = $%d", argIndex))
		args = append(args, *filter.CashierID)
		argIndex++
	}

	if filter.PaymentMethod != nil {
		conditions = append(conditions, fmt.Sprintf("p.payment_method = $%d", argIndex))
		args = append(args, *filter.PaymentMethod)
		argIndex++
	}

	if filter.PaymentStatus != nil {
		conditions = append(conditions, fmt.Sprintf("p.payment_status = $%d", argIndex))
		args = append(args, *filter.PaymentStatus)
		argIndex++
	}

	if filter.StartDate != nil {
		conditions = append(conditions, fmt.Sprintf("p.created_at >= $%d", argIndex))
		args = append(args, *filter.StartDate)
		argIndex++
	}

	if filter.EndDate != nil {
		conditions = append(conditions, fmt.Sprintf("p.created_at <= $%d", argIndex))
		args = append(args, *filter.EndDate)
		argIndex++
	}

	whereClause := ""
	if len(conditions) > 0 {
		whereClause = "WHERE " + strings.Join(conditions, " AND ")
	}

	limit := 100
	offset := 0
	if filter.Limit > 0 {
		limit = filter.Limit
	}
	if filter.Offset > 0 {
		offset = filter.Offset
	}

	query := fmt.Sprintf(`
		SELECT p.id, p.order_id, p.cashier_id, p.amount_cents, p.payment_method,
		       p.payment_status, p.reference_number, p.notes, p.created_at, p.completed_at
		FROM bar_system.payments p
		%s
		ORDER BY p.created_at DESC
		LIMIT $%d OFFSET $%d
	`, whereClause, argIndex, argIndex+1)

	args = append(args, limit, offset)

	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	payments := make([]models.Payment, 0)
	for rows.Next() {
		var payment models.Payment
		err := rows.Scan(
			&payment.ID, &payment.OrderID, &payment.CashierID, &payment.AmountCents,
			&payment.PaymentMethod, &payment.PaymentStatus, &payment.ReferenceNumber,
			&payment.Notes, &payment.CreatedAt, &payment.CompletedAt,
		)
		if err != nil {
			return nil, err
		}
		payments = append(payments, payment)
	}

	return payments, rows.Err()
}

func (r *salesRepository) GetPayment(id string) (*models.Payment, error) {
	query := `
		SELECT p.id, p.order_id, p.cashier_id, p.amount_cents, p.payment_method,
		       p.payment_status, p.reference_number, p.notes, p.created_at, p.completed_at
		FROM bar_system.payments p
		WHERE p.id = $1
	`

	var payment models.Payment
	err := r.db.QueryRow(query, id).Scan(
		&payment.ID, &payment.OrderID, &payment.CashierID, &payment.AmountCents,
		&payment.PaymentMethod, &payment.PaymentStatus, &payment.ReferenceNumber,
		&payment.Notes, &payment.CreatedAt, &payment.CompletedAt,
	)

	if err == sql.ErrNoRows {
		return nil, fmt.Errorf("payment not found")
	}
	if err != nil {
		return nil, err
	}

	return &payment, nil
}

func (r *salesRepository) GetPaymentsByOrder(orderID string) ([]models.Payment, error) {
	filter := &models.PaymentFilter{
		OrderID: &orderID,
		Limit:   100,
	}
	return r.GetPayments(filter)
}

func (r *salesRepository) UpdatePaymentStatus(id string, status models.PaymentStatus, completedAt *time.Time) error {
	query := `
		UPDATE bar_system.payments
		SET payment_status = $1, completed_at = $2
		WHERE id = $3
	`

	_, err := r.db.Exec(query, status, completedAt, id)
	return err
}

// ================================================
// Summary operations
// ================================================

func (r *salesRepository) GetSalesSummary(startDate, endDate *time.Time, locationID *string) (*models.SalesSummary, error) {
	var conditions []string
	var args []interface{}
	argIndex := 1

	if locationID != nil {
		conditions = append(conditions, fmt.Sprintf("o.location_id = $%d", argIndex))
		args = append(args, *locationID)
		argIndex++
	}

	if startDate != nil {
		conditions = append(conditions, fmt.Sprintf("o.created_at >= $%d", argIndex))
		args = append(args, *startDate)
		argIndex++
	}

	if endDate != nil {
		conditions = append(conditions, fmt.Sprintf("o.created_at <= $%d", argIndex))
		args = append(args, *endDate)
		argIndex++
	}

	whereClause := ""
	if len(conditions) > 0 {
		whereClause = "WHERE " + strings.Join(conditions, " AND ")
	}

	query := fmt.Sprintf(`
		SELECT 
			COUNT(DISTINCT o.id) as total_orders,
			COALESCE(SUM(p.amount_cents), 0) as total_revenue_cents,
			COUNT(DISTINCT p.id) as total_payments
		FROM bar_system.orders o
		LEFT JOIN bar_system.payments p ON o.id = p.order_id AND p.payment_status = 'completed'
		%s
	`, whereClause)

	var summary models.SalesSummary
	err := r.db.QueryRow(query, args...).Scan(
		&summary.TotalOrders,
		&summary.TotalRevenueCents,
		&summary.TotalPayments,
	)

	if err != nil {
		return nil, err
	}

	// Obtener resumen por método de pago
	paymentMethodQuery := fmt.Sprintf(`
		SELECT payment_method, COUNT(*) as count
		FROM bar_system.payments
		WHERE payment_status = 'completed'
		%s
		GROUP BY payment_method
	`, whereClause)

	rows, err := r.db.Query(paymentMethodQuery, args...)
	if err == nil {
		defer rows.Close()
		summary.ByPaymentMethod = make(map[models.PaymentMethod]int)
		for rows.Next() {
			var method string
			var count int
			if err := rows.Scan(&method, &count); err == nil {
				summary.ByPaymentMethod[models.PaymentMethod(method)] = count
			}
		}
	}

	// Obtener resumen por estado de orden
	statusQuery := fmt.Sprintf(`
		SELECT status, COUNT(*) as count
		FROM bar_system.orders
		%s
		GROUP BY status
	`, whereClause)

	rows, err = r.db.Query(statusQuery, args...)
	if err == nil {
		defer rows.Close()
		summary.ByStatus = make(map[models.OrderStatus]int)
		for rows.Next() {
			var status string
			var count int
			if err := rows.Scan(&status, &count); err == nil {
				summary.ByStatus[models.OrderStatus(status)] = count
			}
		}
	}

	return &summary, nil
}

