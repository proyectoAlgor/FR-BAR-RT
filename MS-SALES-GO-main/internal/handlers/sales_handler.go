package handlers

import (
	"net/http"
	"strconv"
	"time"

	"ms-sales-go/internal/middleware"
	"ms-sales-go/internal/models"
	"ms-sales-go/internal/service"

	"github.com/gin-gonic/gin"
)

type SalesHandler struct {
	salesService service.SalesService
}

func NewSalesHandler(salesService service.SalesService) *SalesHandler {
	return &SalesHandler{
		salesService: salesService,
	}
}

// ================================================
// Order handlers
// ================================================

func (h *SalesHandler) CreateOrder(c *gin.Context) {
	var req models.CreateOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	waiterID, _ := middleware.GetUserIDFromContext(c)

	order, err := h.salesService.CreateOrder(&req, waiterID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, order)
}

func (h *SalesHandler) GetOrders(c *gin.Context) {
	filter := &models.OrderFilter{
		Limit:  100,
		Offset: 0,
	}

	// Parsear parámetros de query
	if locationID := c.Query("location_id"); locationID != "" {
		filter.LocationID = &locationID
	}
	if tableID := c.Query("table_id"); tableID != "" {
		filter.TableID = &tableID
	}
	if waiterID := c.Query("waiter_id"); waiterID != "" {
		filter.WaiterID = &waiterID
	}
	if cashierID := c.Query("cashier_id"); cashierID != "" {
		filter.CashierID = &cashierID
	}
	if status := c.Query("status"); status != "" {
		orderStatus := models.OrderStatus(status)
		filter.Status = &orderStatus
	}
	if startDateStr := c.Query("start_date"); startDateStr != "" {
		if startDate, err := time.Parse("2006-01-02", startDateStr); err == nil {
			filter.StartDate = &startDate
		}
	}
	if endDateStr := c.Query("end_date"); endDateStr != "" {
		if endDate, err := time.Parse("2006-01-02", endDateStr); err == nil {
			filter.EndDate = &endDate
		}
	}
	if limitStr := c.Query("limit"); limitStr != "" {
		if limit, err := strconv.Atoi(limitStr); err == nil && limit > 0 {
			filter.Limit = limit
		}
	}
	if offsetStr := c.Query("offset"); offsetStr != "" {
		if offset, err := strconv.Atoi(offsetStr); err == nil && offset >= 0 {
			filter.Offset = offset
		}
	}

	orders, err := h.salesService.GetOrders(filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, orders)
}

func (h *SalesHandler) GetOrder(c *gin.Context) {
	id := c.Param("id")

	order, err := h.salesService.GetOrder(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Order not found"})
		return
	}

	c.JSON(http.StatusOK, order)
}

func (h *SalesHandler) UpdateOrder(c *gin.Context) {
	id := c.Param("id")

	var req models.UpdateOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	order, err := h.salesService.UpdateOrder(id, &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, order)
}

func (h *SalesHandler) CloseOrder(c *gin.Context) {
	id := c.Param("id")

	var req models.CloseOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	cashierID, _ := middleware.GetUserIDFromContext(c)

	order, err := h.salesService.CloseOrder(id, &req, cashierID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, order)
}

// ================================================
// Payment handlers
// ================================================

func (h *SalesHandler) CreatePayment(c *gin.Context) {
	var req models.CreatePaymentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	cashierID, _ := middleware.GetUserIDFromContext(c)

	payment, err := h.salesService.CreatePayment(&req, cashierID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, payment)
}

func (h *SalesHandler) GetPayments(c *gin.Context) {
	filter := &models.PaymentFilter{
		Limit:  100,
		Offset: 0,
	}

	// Parsear parámetros de query
	if orderID := c.Query("order_id"); orderID != "" {
		filter.OrderID = &orderID
	}
	if cashierID := c.Query("cashier_id"); cashierID != "" {
		filter.CashierID = &cashierID
	}
	if paymentMethod := c.Query("payment_method"); paymentMethod != "" {
		method := models.PaymentMethod(paymentMethod)
		filter.PaymentMethod = &method
	}
	if paymentStatus := c.Query("payment_status"); paymentStatus != "" {
		status := models.PaymentStatus(paymentStatus)
		filter.PaymentStatus = &status
	}
	if startDateStr := c.Query("start_date"); startDateStr != "" {
		if startDate, err := time.Parse("2006-01-02", startDateStr); err == nil {
			filter.StartDate = &startDate
		}
	}
	if endDateStr := c.Query("end_date"); endDateStr != "" {
		if endDate, err := time.Parse("2006-01-02", endDateStr); err == nil {
			filter.EndDate = &endDate
		}
	}
	if limitStr := c.Query("limit"); limitStr != "" {
		if limit, err := strconv.Atoi(limitStr); err == nil && limit > 0 {
			filter.Limit = limit
		}
	}
	if offsetStr := c.Query("offset"); offsetStr != "" {
		if offset, err := strconv.Atoi(offsetStr); err == nil && offset >= 0 {
			filter.Offset = offset
		}
	}

	payments, err := h.salesService.GetPayments(filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, payments)
}

func (h *SalesHandler) GetPayment(c *gin.Context) {
	id := c.Param("id")

	payment, err := h.salesService.GetPayment(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Payment not found"})
		return
	}

	c.JSON(http.StatusOK, payment)
}

func (h *SalesHandler) ProcessPayment(c *gin.Context) {
	// Alias para CreatePayment con validación de cajero
	h.CreatePayment(c)
}

// ================================================
// History and query handlers
// ================================================

func (h *SalesHandler) GetSalesHistory(c *gin.Context) {
	filter := &models.OrderFilter{
		Limit:  100,
		Offset: 0,
	}

	// Parsear parámetros de query
	if locationID := c.Query("location_id"); locationID != "" {
		filter.LocationID = &locationID
	}
	if startDateStr := c.Query("start_date"); startDateStr != "" {
		if startDate, err := time.Parse("2006-01-02", startDateStr); err == nil {
			filter.StartDate = &startDate
		}
	}
	if endDateStr := c.Query("end_date"); endDateStr != "" {
		if endDate, err := time.Parse("2006-01-02", endDateStr); err == nil {
			filter.EndDate = &endDate
		}
	}
	if limitStr := c.Query("limit"); limitStr != "" {
		if limit, err := strconv.Atoi(limitStr); err == nil && limit > 0 {
			filter.Limit = limit
		}
	}
	if offsetStr := c.Query("offset"); offsetStr != "" {
		if offset, err := strconv.Atoi(offsetStr); err == nil && offset >= 0 {
			filter.Offset = offset
		}
	}

	orders, err := h.salesService.GetSalesHistory(filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, orders)
}

func (h *SalesHandler) GetSalesSummary(c *gin.Context) {
	var startDate, endDate *time.Time
	var locationID *string

	if startDateStr := c.Query("start_date"); startDateStr != "" {
		if parsed, err := time.Parse("2006-01-02", startDateStr); err == nil {
			startDate = &parsed
		}
	}
	if endDateStr := c.Query("end_date"); endDateStr != "" {
		if parsed, err := time.Parse("2006-01-02", endDateStr); err == nil {
			endDate = &parsed
		}
	}
	if locID := c.Query("location_id"); locID != "" {
		locationID = &locID
	}

	summary, err := h.salesService.GetSalesSummary(startDate, endDate, locationID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, summary)
}

func (h *SalesHandler) GetCashierOrders(c *gin.Context) {
	// Obtener órdenes pendientes de cierre para el cajero
	filter := &models.OrderFilter{
		Limit:  100,
		Offset: 0,
	}

	// Filtrar órdenes que no estén cerradas
	pendingStatus := models.OrderStatusPending
	confirmedStatus := models.OrderStatusConfirmed
	readyStatus := models.OrderStatusReady

	// Por simplicidad, obtenemos todas y filtramos en el servicio
	// En una implementación completa, podríamos hacer una query más específica

	orders, err := h.salesService.GetOrders(filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Filtrar órdenes que pueden ser cerradas
	filteredOrders := make([]models.Order, 0)
	for _, order := range orders {
		if order.Status == pendingStatus || order.Status == confirmedStatus || order.Status == readyStatus {
			filteredOrders = append(filteredOrders, order)
		}
	}

	c.JSON(http.StatusOK, filteredOrders)
}

