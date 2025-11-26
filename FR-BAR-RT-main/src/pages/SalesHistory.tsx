import React, { useState, useEffect } from 'react'
import { History, Search, Calendar, Filter, Download, Eye } from 'lucide-react'
import { salesService, Order, Payment } from '../services/salesService'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

const SalesHistory: React.FC = () => {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [summary, setSummary] = useState<any>(null)
  const [showSummary, setShowSummary] = useState(false)

  useEffect(() => {
    // Por defecto, mostrar ventas del último mes
    const end = new Date()
    const start = new Date()
    start.setMonth(start.getMonth() - 1)
    
    setStartDate(start.toISOString().split('T')[0])
    setEndDate(end.toISOString().split('T')[0])
  }, [])

  useEffect(() => {
    if (startDate && endDate) {
      loadSalesHistory()
    }
  }, [startDate, endDate])

  const loadSalesHistory = async () => {
    try {
      setLoading(true)
      const params: any = {
        start_date: startDate,
        end_date: endDate,
        limit: 100,
      }
      
      const data = await salesService.getSalesHistory(params)
      setOrders(data)
    } catch (error: any) {
      console.error('Error loading sales history:', error)
      toast.error(error.response?.data?.error || 'Error al cargar historial de ventas')
    } finally {
      setLoading(false)
    }
  }

  const loadSummary = async () => {
    try {
      const params: any = {
        start_date: startDate,
        end_date: endDate,
      }
      
      const data = await salesService.getSalesSummary(params)
      setSummary(data)
      setShowSummary(true)
    } catch (error: any) {
      console.error('Error loading summary:', error)
      toast.error(error.response?.data?.error || 'Error al cargar resumen')
    }
  }

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(cents / 100)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleViewOrder = async (orderId: string) => {
    try {
      const order = await salesService.getOrder(orderId)
      setSelectedOrder(order)
      setShowOrderModal(true)
    } catch (error: any) {
      console.error('Error loading order:', error)
      toast.error('Error al cargar detalles de la orden')
    }
  }

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      cash: 'Efectivo',
      card: 'Tarjeta',
      transfer: 'Transferencia',
      other: 'Otro',
    }
    return labels[method] || method
  }

  const calculateTotalPaid = (order: Order) => {
    if (!order.payments) return 0
    return order.payments
      .filter(p => p.payment_status === 'completed')
      .reduce((sum, p) => sum + p.amount_cents, 0)
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
          <History className="mr-3 h-8 w-8 text-golden-600" />
          Historial y Consulta de Ventas
        </h1>
        <p className="text-gray-600">Consulta el historial de ventas y genera reportes</p>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline h-4 w-4 mr-1" />
              Fecha Inicio
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-golden-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline h-4 w-4 mr-1" />
              Fecha Fin
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-golden-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={loadSalesHistory}
              className="w-full bg-golden-600 text-white px-4 py-2 rounded-lg hover:bg-golden-700 transition-colors flex items-center justify-center"
            >
              <Search className="h-5 w-5 mr-2" />
              Buscar
            </button>
          </div>
          <div className="flex items-end">
            <button
              onClick={loadSummary}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <Filter className="h-5 w-5 mr-2" />
              Resumen
            </button>
          </div>
        </div>
      </div>

      {/* Resumen (si está visible) */}
      {showSummary && summary && (
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg shadow-md p-6 mb-6 border border-blue-200">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Resumen de Ventas</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-gray-600">Total Órdenes</p>
              <p className="text-2xl font-bold text-gray-800">{summary.total_orders}</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-gray-600">Ingresos Totales</p>
              <p className="text-2xl font-bold text-golden-600">
                {formatCurrency(summary.total_revenue_cents)}
              </p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-gray-600">Total Pagos</p>
              <p className="text-2xl font-bold text-gray-800">{summary.total_payments}</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <p className="text-sm text-gray-600">Promedio por Orden</p>
              <p className="text-2xl font-bold text-blue-600">
                {summary.total_orders > 0
                  ? formatCurrency(Math.round(summary.total_revenue_cents / summary.total_orders))
                  : formatCurrency(0)}
              </p>
            </div>
          </div>
          {summary.by_payment_method && Object.keys(summary.by_payment_method).length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold text-gray-700 mb-2">Por Método de Pago:</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {Object.entries(summary.by_payment_method).map(([method, count]: [string, any]) => (
                  <div key={method} className="bg-white rounded p-2">
                    <p className="text-xs text-gray-600">{getPaymentMethodLabel(method)}</p>
                    <p className="text-lg font-bold">{count}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tabla de ventas */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Orden
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pagos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Método
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No se encontraron ventas en el período seleccionado</p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const totalPaid = calculateTotalPaid(order)
                  const paymentMethods = order.payments
                    ? [...new Set(order.payments.map(p => p.payment_method))]
                    : []

                  return (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          #{order.order_number}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {formatDate(order.closed_at || order.created_at)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-golden-600">
                          {formatCurrency(order.total_cents)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {order.payments?.length || 0} pago(s)
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatCurrency(totalPaid)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {paymentMethods.map((method) => (
                            <span
                              key={method}
                              className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                            >
                              {getPaymentMethodLabel(method)}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleViewOrder(order.id)}
                          className="text-golden-600 hover:text-golden-800 flex items-center"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Ver Detalles
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de detalles de orden */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold text-gray-800">
                Detalles de Orden #{selectedOrder.order_number}
              </h2>
              <button
                onClick={() => setShowOrderModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Fecha de creación</p>
                  <p className="font-semibold">{formatDate(selectedOrder.created_at)}</p>
                </div>
                {selectedOrder.closed_at && (
                  <div>
                    <p className="text-sm text-gray-600">Fecha de cierre</p>
                    <p className="font-semibold">{formatDate(selectedOrder.closed_at)}</p>
                  </div>
                )}
              </div>

              {selectedOrder.items && selectedOrder.items.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Items:</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span className="text-gray-600">
                          {item.quantity}x Item #{item.product_id}
                        </span>
                        <span className="font-semibold">
                          {formatCurrency((item as any).subtotal_cents || 0)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-semibold">{formatCurrency(selectedOrder.subtotal_cents)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">IVA (19%):</span>
                  <span className="font-semibold">{formatCurrency(selectedOrder.tax_cents)}</span>
                </div>
                {selectedOrder.discount_cents > 0 && (
                  <div className="flex justify-between mb-2 text-red-600">
                    <span>Descuento:</span>
                    <span>-{formatCurrency(selectedOrder.discount_cents)}</span>
                  </div>
                )}
                <div className="border-t border-gray-300 pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="font-bold text-lg">Total:</span>
                    <span className="font-bold text-lg text-golden-600">
                      {formatCurrency(selectedOrder.total_cents)}
                    </span>
                  </div>
                </div>
              </div>

              {selectedOrder.payments && selectedOrder.payments.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Pagos:</h3>
                  <div className="space-y-2">
                    {selectedOrder.payments.map((payment) => (
                      <div
                        key={payment.id}
                        className="bg-white border border-gray-200 rounded-lg p-3"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold text-gray-800">
                              {getPaymentMethodLabel(payment.payment_method)}
                            </p>
                            {payment.reference_number && (
                              <p className="text-sm text-gray-500">
                                Ref: {payment.reference_number}
                              </p>
                            )}
                            <p className="text-xs text-gray-500">
                              {formatDate(payment.created_at)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-golden-600">
                              {formatCurrency(payment.amount_cents)}
                            </p>
                            <span
                              className={`text-xs px-2 py-1 rounded ${
                                payment.payment_status === 'completed'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {payment.payment_status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedOrder.notes && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Notas:</h3>
                  <p className="text-gray-600 bg-gray-50 rounded-lg p-3">
                    {selectedOrder.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SalesHistory

