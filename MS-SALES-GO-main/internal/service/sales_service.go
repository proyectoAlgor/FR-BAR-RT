package service

import (
	"fmt"
	"time"

	"ms-sales-go/internal/models"
	"ms-sales-go/internal/repository"

	"github.com/google/uuid"
)

type SalesService interface {
	// Order operations
	CreateOrder(req *models.CreateOrderRequest, waiterID string) (*models.Order, error)
	GetOrders(filter *models.OrderFilter) ([]models.Order, error)
	GetOrder(id string) (*models.Order, error)
	UpdateOrder(id string, req *models.UpdateOrderRequest) (*models.Order, error)
	CloseOrder(id string, req *models.CloseOrderRequest, cashierID string) (*models.Order, error)

	// Payment operations
	CreatePayment(req *models.CreatePaymentRequest, cashierID string) (*models.Payment, error)
	GetPayments(filter *models.PaymentFilter) ([]models.Payment, error)
	GetPayment(id string) (*models.Payment, error)

	// History and queries
	GetSalesHistory(filter *models.OrderFilter) ([]models.Order, error)
	GetSalesSummary(startDate, endDate *time.Time, locationID *string) (*models.SalesSummary, error)
}

type salesService struct {
	repo repository.SalesRepository
}

func NewSalesService(repo repository.SalesRepository) SalesService {
	return &salesService{
		repo: repo,
	}
}

// ================================================
// Order operations
// ================================================

func (s *salesService) CreateOrder(req *models.CreateOrderRequest, waiterID string) (*models.Order, error) {
	// Generar número de orden único
	orderNumber := generateOrderNumber()

	// Obtener precios de productos y calcular totales
	subtotalCents := 0
	items := make([]models.OrderItem, 0, len(req.Items))

	for _, itemReq := range req.Items {
		// Obtener precio del producto desde la base de datos
		// Por ahora asumimos que el precio viene en el request o lo obtenemos de otra forma
		// En una implementación completa, haríamos una llamada al microservicio de catálogo
		unitPriceCents := 0 // TODO: Obtener del catálogo de productos
		itemSubtotal := unitPriceCents * itemReq.Quantity

		item := models.OrderItem{
			ID:            generateUUID(),
			OrderID:       "", // Se asignará después
			ProductID:     itemReq.ProductID,
			Quantity:      itemReq.Quantity,
			UnitPriceCents: unitPriceCents,
			SubtotalCents: itemSubtotal,
			Notes:         itemReq.Notes,
		}
		items = append(items, item)
		subtotalCents += itemSubtotal
	}

	// Calcular impuestos (19% IVA en Colombia)
	taxCents := int(float64(subtotalCents) * 0.19)
	totalCents := subtotalCents + taxCents

	// Crear orden
	order := &models.Order{
		ID:            generateUUID(),
		OrderNumber:   orderNumber,
		TableID:       req.TableID,
		LocationID:    req.LocationID,
		WaiterID:      &waiterID,
		Status:        models.OrderStatusPending,
		SubtotalCents: subtotalCents,
		TaxCents:      taxCents,
		DiscountCents: 0, // Se puede actualizar después
		TotalCents:    totalCents,
		Notes:         req.Notes,
	}

	// Guardar orden
	err := s.repo.CreateOrder(order)
	if err != nil {
		return nil, fmt.Errorf("failed to create order: %w", err)
	}

	// Guardar items
	for i := range items {
		items[i].OrderID = order.ID
		err := s.repo.CreateOrderItem(&items[i])
		if err != nil {
			// En caso de error, podríamos hacer rollback
			return nil, fmt.Errorf("failed to create order item: %w", err)
		}
	}

	order.Items = items
	return order, nil
}

func (s *salesService) GetOrders(filter *models.OrderFilter) ([]models.Order, error) {
	orders, err := s.repo.GetOrders(filter)
	if err != nil {
		return nil, fmt.Errorf("failed to get orders: %w", err)
	}

	// Cargar items para cada orden
	for i := range orders {
		items, err := s.repo.GetOrderItems(orders[i].ID)
		if err == nil {
			orders[i].Items = items
		}
	}

	return orders, nil
}

func (s *salesService) GetOrder(id string) (*models.Order, error) {
	order, err := s.repo.GetOrder(id)
	if err != nil {
		return nil, fmt.Errorf("failed to get order: %w", err)
	}

	// Cargar items
	items, err := s.repo.GetOrderItems(order.ID)
	if err == nil {
		order.Items = items
	}

	// Cargar pagos
	payments, err := s.repo.GetPaymentsByOrder(order.ID)
	if err == nil {
		order.Payments = payments
	}

	return order, nil
}

func (s *salesService) UpdateOrder(id string, req *models.UpdateOrderRequest) (*models.Order, error) {
	order, err := s.repo.GetOrder(id)
	if err != nil {
		return nil, fmt.Errorf("order not found: %w", err)
	}

	// Actualizar estado si se proporciona
	if req.Status != nil {
		order.Status = *req.Status
	}

	// Actualizar items si se proporcionan
	if req.Items != nil && len(req.Items) > 0 {
		// Eliminar items existentes
		err = s.repo.DeleteOrderItems(order.ID)
		if err != nil {
			return nil, fmt.Errorf("failed to delete order items: %w", err)
		}

		// Recalcular totales
		subtotalCents := 0
		for _, itemReq := range req.Items {
			unitPriceCents := 0 // TODO: Obtener del catálogo
			itemSubtotal := unitPriceCents * itemReq.Quantity

			item := models.OrderItem{
				ID:            generateUUID(),
				OrderID:       order.ID,
				ProductID:     itemReq.ProductID,
				Quantity:      itemReq.Quantity,
				UnitPriceCents: unitPriceCents,
				SubtotalCents: itemSubtotal,
				Notes:         itemReq.Notes,
			}

			err := s.repo.CreateOrderItem(&item)
			if err != nil {
				return nil, fmt.Errorf("failed to create order item: %w", err)
			}

			subtotalCents += itemSubtotal
		}

		order.SubtotalCents = subtotalCents
		order.TaxCents = int(float64(subtotalCents) * 0.19)
	}

	// Actualizar descuento si se proporciona
	if req.DiscountCents != nil {
		order.DiscountCents = *req.DiscountCents
	}

	// Actualizar notas si se proporciona
	if req.Notes != nil {
		order.Notes = req.Notes
	}

	// Recalcular total
	order.TotalCents = order.SubtotalCents + order.TaxCents - order.DiscountCents

	// Guardar cambios
	err = s.repo.UpdateOrder(id, order)
	if err != nil {
		return nil, fmt.Errorf("failed to update order: %w", err)
	}

	return s.GetOrder(id)
}

func (s *salesService) CloseOrder(id string, req *models.CloseOrderRequest, cashierID string) (*models.Order, error) {
	// Obtener orden
	order, err := s.repo.GetOrder(id)
	if err != nil {
		return nil, fmt.Errorf("order not found: %w", err)
	}

	// Verificar que la orden no esté ya cerrada
	if order.Status == models.OrderStatusClosed {
		return nil, fmt.Errorf("order is already closed")
	}

	// Procesar pagos
	totalPaidCents := 0
	for _, paymentReq := range req.Payments {
		payment := &models.Payment{
			ID:            generateUUID(),
			OrderID:       id,
			CashierID:     cashierID,
			AmountCents:   paymentReq.AmountCents,
			PaymentMethod: paymentReq.PaymentMethod,
			PaymentStatus: models.PaymentStatusCompleted,
			ReferenceNumber: paymentReq.ReferenceNumber,
			Notes:         paymentReq.Notes,
		}

		now := time.Now()
		payment.CompletedAt = &now

		err := s.repo.CreatePayment(payment)
		if err != nil {
			return nil, fmt.Errorf("failed to create payment: %w", err)
		}

		totalPaidCents += paymentReq.AmountCents
	}

	// Verificar que el total pagado sea suficiente
	if totalPaidCents < order.TotalCents {
		return nil, fmt.Errorf("insufficient payment: expected %d cents, got %d cents", order.TotalCents, totalPaidCents)
	}

	// Cerrar orden
	closedAt := time.Now()
	err = s.repo.CloseOrder(id, cashierID, closedAt)
	if err != nil {
		return nil, fmt.Errorf("failed to close order: %w", err)
	}

	return s.GetOrder(id)
}

// ================================================
// Payment operations
// ================================================

func (s *salesService) CreatePayment(req *models.CreatePaymentRequest, cashierID string) (*models.Payment, error) {
	// Verificar que la orden existe
	order, err := s.repo.GetOrder(req.OrderID)
	if err != nil {
		return nil, fmt.Errorf("order not found: %w", err)
	}

	// Verificar que la orden no esté cerrada
	if order.Status == models.OrderStatusClosed {
		return nil, fmt.Errorf("cannot add payment to closed order")
	}

	// Crear pago
	payment := &models.Payment{
		ID:            generateUUID(),
		OrderID:       req.OrderID,
		CashierID:     cashierID,
		AmountCents:   req.AmountCents,
		PaymentMethod: req.PaymentMethod,
		PaymentStatus: models.PaymentStatusPending,
		ReferenceNumber: req.ReferenceNumber,
		Notes:         req.Notes,
	}

	err = s.repo.CreatePayment(payment)
	if err != nil {
		return nil, fmt.Errorf("failed to create payment: %w", err)
	}

	// Completar pago automáticamente
	now := time.Now()
	err = s.repo.UpdatePaymentStatus(payment.ID, models.PaymentStatusCompleted, &now)
	if err != nil {
		return nil, fmt.Errorf("failed to complete payment: %w", err)
	}

	payment.PaymentStatus = models.PaymentStatusCompleted
	payment.CompletedAt = &now

	return payment, nil
}

func (s *salesService) GetPayments(filter *models.PaymentFilter) ([]models.Payment, error) {
	return s.repo.GetPayments(filter)
}

func (s *salesService) GetPayment(id string) (*models.Payment, error) {
	return s.repo.GetPayment(id)
}

// ================================================
// History and queries
// ================================================

func (s *salesService) GetSalesHistory(filter *models.OrderFilter) ([]models.Order, error) {
	// Filtrar solo órdenes cerradas para el historial
	closedStatus := models.OrderStatusClosed
	filter.Status = &closedStatus

	return s.GetOrders(filter)
}

func (s *salesService) GetSalesSummary(startDate, endDate *time.Time, locationID *string) (*models.SalesSummary, error) {
	return s.repo.GetSalesSummary(startDate, endDate, locationID)
}

// ================================================
// Helper functions
// ================================================

func generateUUID() string {
	return uuid.New().String()
}

func generateOrderNumber() string {
	// Formato: ORD-YYYYMMDD-HHMMSS-XXXX
	now := time.Now()
	timestamp := now.Format("20060102-150405")
	random := uuid.New().String()[:4]
	return fmt.Sprintf("ORD-%s-%s", timestamp, random)
}

