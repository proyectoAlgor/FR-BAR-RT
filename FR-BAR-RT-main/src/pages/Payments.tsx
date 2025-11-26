import React, { useState, useEffect } from 'react'
import { CreditCard, DollarSign, CheckCircle, XCircle, Search, Filter } from 'lucide-react'
import { salesService, Order, Payment, CreatePaymentRequest } from '../services/salesService'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

const Payments: React.FC = () => {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer' | 'other'>('cash')
  const [paymentAmount, setPaymentAmount] = useState('')
  const [referenceNumber, setReferenceNumber] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('')

  useEffect(() => {
    loadCashierOrders()
  }, [filterStatus])

  const loadCashierOrders = async () => {
    try {
      setLoading(true)
      const data = await salesService.getCashierOrders()
      let filtered = data
      
      if (filterStatus) {
        filtered = data.filter((order: Order) => order.status === filterStatus)
      }
      
      setOrders(filtered)
    } catch (error: any) {
      console.error('Error loading orders:', error)
      toast.error(error.response?.data?.error || 'Error al cargar órdenes')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(cents / 100)
  }

  const calculateTotalPaid = (order: Order) => {
    if (!order.payments) return 0
    return order.payments
      .filter(p => p.payment_status === 'completed')
      .reduce((sum, p) => sum + p.amount_cents, 0)
  }

  const calculateRemaining = (order: Order) => {
    const paid = calculateTotalPaid(order)
    return order.total_cents - paid
  }

  const handleOpenPaymentModal = (order: Order) => {
    setSelectedOrder(order)
    setPaymentAmount('')
    setReferenceNumber('')
    setPaymentMethod('cash')
    setShowPaymentModal(true)
  }

  const handleProcessPayment = async () => {
    if (!selectedOrder) return

    const amount = parseFloat(paymentAmount) * 100 // Convertir a centavos
    if (isNaN(amount) || amount <= 0) {
      toast.error('Ingrese un monto válido')
      return
    }

    const remaining = calculateRemaining(selectedOrder)
    if (amount > remaining) {
      toast.error(`El monto excede lo pendiente: ${formatCurrency(remaining)}`)
      return
    }

    try {
      const paymentData: CreatePaymentRequest = {
        order_id: selectedOrder.id,
        amount_cents: amount,
        payment_method: paymentMethod,
        reference_number: referenceNumber || undefined,
      }

      await salesService.createPayment(paymentData)
      toast.success('Pago procesado correctamente')
      setShowPaymentModal(false)
      loadCashierOrders()
      
      // Recargar la orden para ver los pagos actualizados
      const updatedOrder = await salesService.getOrder(selectedOrder.id)
      setSelectedOrder(updatedOrder)
    } catch (error: any) {
      console.error('Error processing payment:', error)
      toast.error(error.response?.data?.error || 'Error al procesar el pago')
    }
  }

  const handleCloseOrder = async (order: Order) => {
    if (!order.payments || order.payments.length === 0) {
      toast.error('Debe procesar al menos un pago antes de cerrar la orden')
      return
    }

    const remaining = calculateRemaining(order)
    if (remaining > 0) {
      toast.error(`Falta por pagar: ${formatCurrency(remaining)}`)
      return
    }

    if (!confirm(`¿Está seguro de cerrar la orden ${order.order_number}?`)) {
      return
    }

    try {
      const payments: CreatePaymentRequest[] = order.payments.map(p => ({
        order_id: order.id,
        amount_cents: p.amount_cents,
        payment_method: p.payment_method,
        reference_number: p.reference_number,
      }))

      await salesService.closeOrder(order.id, { payments })
      toast.success('Orden cerrada correctamente')
      loadCashierOrders()
    } catch (error: any) {
      console.error('Error closing order:', error)
      toast.error(error.response?.data?.error || 'Error al cerrar la orden')
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      preparing: 'bg-orange-100 text-orange-800',
      ready: 'bg-green-100 text-green-800',
      delivered: 'bg-purple-100 text-purple-800',
      cancelled: 'bg-red-100 text-red-800',
      closed: 'bg-gray-100 text-gray-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: 'Pendiente',
      confirmed: 'Confirmada',
      preparing: 'Preparando',
      ready: 'Lista',
      delivered: 'Entregada',
      cancelled: 'Cancelada',
      closed: 'Cerrada',
    }
    return labels[status] || status
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-golden-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
          <CreditCard className="mr-3 h-8 w-8 text-golden-600" />
          Gestión de Pagos y Cierre
        </h1>
        <p className="text-gray-600">Procesa pagos y cierra órdenes como cajero</p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex items-center space-x-4">
          <Filter className="h-5 w-5 text-gray-500" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-golden-500 focus:border-transparent"
          >
            <option value="">Todos los estados</option>
            <option value="pending">Pendiente</option>
            <option value="confirmed">Confirmada</option>
            <option value="ready">Lista</option>
          </select>
          <button
            onClick={loadCashierOrders}
            className="bg-golden-600 text-white px-4 py-2 rounded-lg hover:bg-golden-700 transition-colors"
          >
            Actualizar
          </button>
        </div>
      </div>

      {/* Lista de órdenes */}
      <div className="grid gap-6">
        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No hay órdenes pendientes de pago</p>
          </div>
        ) : (
          orders.map((order) => {
            const totalPaid = calculateTotalPaid(order)
            const remaining = calculateRemaining(order)
            const canClose = remaining === 0 && order.status !== 'closed'

            return (
              <div key={order.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800">
                      Orden #{order.order_number}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleString('es-CO')}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                    {getStatusLabel(order.status)}
                  </span>
                </div>

                {/* Items de la orden */}
                {order.items && order.items.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-700 mb-2">Items:</h4>
                    <div className="space-y-1">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm text-gray-600">
                          <span>{item.quantity}x Item #{item.product_id}</span>
                          <span>{formatCurrency((item as any).subtotal_cents || 0)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Resumen financiero */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-semibold">{formatCurrency(order.subtotal_cents)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-600">IVA (19%):</span>
                    <span className="font-semibold">{formatCurrency(order.tax_cents)}</span>
                  </div>
                  {order.discount_cents > 0 && (
                    <div className="flex justify-between mb-2 text-red-600">
                      <span>Descuento:</span>
                      <span>-{formatCurrency(order.discount_cents)}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-300 pt-2 mt-2">
                    <div className="flex justify-between">
                      <span className="font-bold text-lg">Total:</span>
                      <span className="font-bold text-lg text-golden-600">
                        {formatCurrency(order.total_cents)}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between mt-2 text-sm">
                    <span className="text-gray-600">Pagado:</span>
                    <span className="text-green-600 font-semibold">
                      {formatCurrency(totalPaid)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Pendiente:</span>
                    <span className={`font-semibold ${remaining > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {formatCurrency(remaining)}
                    </span>
                  </div>
                </div>

                {/* Pagos realizados */}
                {order.payments && order.payments.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-700 mb-2">Pagos realizados:</h4>
                    <div className="space-y-2">
                      {order.payments.map((payment) => (
                        <div key={payment.id} className="flex justify-between items-center bg-white border border-gray-200 rounded p-2">
                          <div className="flex items-center space-x-2">
                            {payment.payment_status === 'completed' ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-yellow-500" />
                            )}
                            <span className="text-sm text-gray-600">
                              {payment.payment_method.toUpperCase()}
                            </span>
                            {payment.reference_number && (
                              <span className="text-xs text-gray-500">
                                Ref: {payment.reference_number}
                              </span>
                            )}
                          </div>
                          <span className="font-semibold">{formatCurrency(payment.amount_cents)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Acciones */}
                <div className="flex space-x-3">
                  {remaining > 0 && order.status !== 'closed' && (
                    <button
                      onClick={() => handleOpenPaymentModal(order)}
                      className="flex-1 bg-golden-600 text-white px-4 py-2 rounded-lg hover:bg-golden-700 transition-colors flex items-center justify-center"
                    >
                      <DollarSign className="h-5 w-5 mr-2" />
                      Procesar Pago
                    </button>
                  )}
                  {canClose && (
                    <button
                      onClick={() => handleCloseOrder(order)}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center"
                    >
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Cerrar Orden
                    </button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Modal de pago */}
      {showPaymentModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Procesar Pago - Orden #{selectedOrder.order_number}
            </h2>
            
            <div className="mb-4">
              <p className="text-gray-600 mb-2">Total a pagar:</p>
              <p className="text-2xl font-bold text-golden-600">
                {formatCurrency(selectedOrder.total_cents)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Pendiente: {formatCurrency(calculateRemaining(selectedOrder))}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Método de pago
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-golden-500 focus:border-transparent"
                >
                  <option value="cash">Efectivo</option>
                  <option value="card">Tarjeta</option>
                  <option value="transfer">Transferencia</option>
                  <option value="other">Otro</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monto (COP)
                </label>
                <input
                  type="number"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-golden-500 focus:border-transparent"
                />
              </div>

              {(paymentMethod === 'card' || paymentMethod === 'transfer') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número de referencia
                  </label>
                  <input
                    type="text"
                    value={referenceNumber}
                    onChange={(e) => setReferenceNumber(e.target.value)}
                    placeholder="Opcional"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-golden-500 focus:border-transparent"
                  />
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleProcessPayment}
                  className="flex-1 bg-golden-600 text-white px-4 py-2 rounded-lg hover:bg-golden-700 transition-colors"
                >
                  Procesar Pago
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Payments

