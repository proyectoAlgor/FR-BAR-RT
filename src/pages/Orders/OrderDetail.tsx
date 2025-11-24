import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import orderService, { OrderWithItems, OrderItem } from '../../services/orderService';
import { productService } from '../../services/productService';

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<OrderWithItems | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'transfer'>('cash');
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      loadOrder();
    }
  }, [id]);

  const loadOrder = async () => {
    if (!id) return;

    try {
      setLoading(true);
      const orderData = await orderService.getOrderById(id);
      
      // Enrich items with product info
      for (const item of orderData.items) {
        try {
          const product = await productService.getProduct(item.product_id);
          item.product_name = product.name;
          item.product_code = product.code;
        } catch (err) {
          console.error('Error loading product:', err);
        }
      }
      
      setOrder(orderData);
      setError('');
    } catch (err: any) {
      setError(err.message || 'Error loading order');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (itemId: string, currentQuantity: number, change: number) => {
    const newQuantity = currentQuantity + change;
    
    if (newQuantity < 1) {
      if (confirm('Remove this item from the order?')) {
        await handleRemoveItem(itemId);
      }
      return;
    }

    try {
      await orderService.updateOrderItem(itemId, { quantity: newQuantity });
      await loadOrder();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error updating item');
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await orderService.removeItemFromOrder(itemId);
      
      // Try to reload order - if it was deleted (empty order), it will fail
      try {
        await loadOrder();
      } catch (loadErr: any) {
        // If order was deleted (empty order), redirect to orders list
        if (loadErr.response?.status === 404) {
          navigate('/orders');
          return;
        }
        throw loadErr;
      }
    } catch (err: any) {
      // If error is 404, order was deleted (empty order)
      if (err.response?.status === 404) {
        navigate('/orders');
        return;
      }
      setError(err.response?.data?.error || 'Error removing item');
    }
  };

  const handleCloseOrder = async () => {
    if (!id) return;

    try {
      setLoading(true);
      await orderService.closeOrder(id, { payment_method: paymentMethod });
      setShowCloseModal(false);
      await loadOrder();
      
      // Show success and redirect after 2 seconds
      setTimeout(() => {
        navigate('/orders');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error closing order');
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      open: 'bg-green-100 text-green-800',
      pending_payment: 'bg-yellow-100 text-yellow-800',
      paid: 'bg-gray-100 text-gray-800',
    };
    return badges[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      open: 'Open',
      pending_payment: 'Pending Payment',
      paid: 'Paid',
    };
    return texts[status] || status;
  };

  if (loading && !order) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Account not found
        </div>
      </div>
    );
  }

  const canModify = order.status === 'open';
  const isPaid = order.status === 'paid';

  return (
    <div className="container mx-auto px-4 py-4 sm:py-6 md:py-8 max-w-4xl">
      <div className="mb-4 sm:mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 hover:text-blue-800 mb-4 text-sm sm:text-base touch-manipulation"
        >
          ← Back
        </button>
        
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 break-words">
              Account #{order.id.substring(0, 8)}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-2">
              Created: {new Date(order.created_at).toLocaleString()}
            </p>
            {order.closed_at && (
              <p className="text-sm sm:text-base text-gray-600">
                Closed: {new Date(order.closed_at).toLocaleString()}
              </p>
            )}
          </div>
          <span
            className={`px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium ${getStatusBadge(
              order.status
            )} flex-shrink-0 self-start`}
          >
            {getStatusText(order.status)}
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {isPaid && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          ✅ This account has been paid and closed
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Order Items</h2>

        {order.items.length === 0 ? (
          <p className="text-sm sm:text-base text-gray-600 text-center py-8">No items in this account</p>
        ) : (
          <div className="space-y-2 sm:space-y-3">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex-1 min-w-0 mr-2">
                  <p className="font-medium text-gray-900 text-sm sm:text-base truncate">
                    {item.product_name || 'Product'}
                    {item.product_code && (
                      <span className="text-xs sm:text-sm text-gray-500 ml-2">({item.product_code})</span>
                    )}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {orderService.formatPrice(item.price_cents)} × {item.quantity} ={' '}
                    <span className="font-medium">
                      {orderService.formatPrice(item.subtotal_cents)}
                    </span>
                  </p>
                </div>

                {canModify && (
                  <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity, -1)}
                      className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-200 hover:bg-gray-300 rounded text-gray-700 font-bold text-sm sm:text-base touch-manipulation"
                    >
                      -
                    </button>
                    <span className="w-6 sm:w-8 text-center font-medium text-sm sm:text-base">{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateQuantity(item.id, item.quantity, 1)}
                      className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-200 hover:bg-gray-300 rounded text-gray-700 font-bold text-sm sm:text-base touch-manipulation"
                    >
                      +
                    </button>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="ml-1 sm:ml-2 text-red-600 hover:text-red-800 text-lg sm:text-xl touch-manipulation"
                    >
                      🗑️
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="border-t mt-4 sm:mt-6 pt-4">
          <div className="flex justify-between items-center">
            <span className="text-base sm:text-xl font-semibold text-gray-900">Total:</span>
            <span className="text-2xl sm:text-3xl font-bold text-blue-600">
              {orderService.formatPrice(order.total_cents)}
            </span>
          </div>
        </div>

        {order.notes && (
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
            <p className="text-xs sm:text-sm text-gray-700">
              <span className="font-medium">Notes:</span> {order.notes}
            </p>
          </div>
        )}
      </div>

      {canModify && order.items.length > 0 && (
        <button
          onClick={() => setShowCloseModal(true)}
          className="w-full bg-green-600 hover:bg-green-700 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-lg font-medium text-base sm:text-lg transition-colors touch-manipulation"
        >
          💰 Close Account (Mark as Paid)
        </button>
      )}

      {/* Close Order Modal */}
      {showCloseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Close Account</h3>
            
            <div className="mb-4 sm:mb-6">
              <p className="text-sm sm:text-base text-gray-700 mb-4">
                Total to pay:{' '}
                <span className="text-xl sm:text-2xl font-bold text-blue-600 block sm:inline mt-2 sm:mt-0">
                  {orderService.formatPrice(order.total_cents)}
                </span>
              </p>

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full px-3 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent touch-manipulation"
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="transfer">Transfer</option>
              </select>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowCloseModal(false)}
                disabled={loading}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base touch-manipulation"
              >
                Cancel
              </button>
              <button
                onClick={handleCloseOrder}
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base touch-manipulation"
              >
                {loading ? 'Processing...' : 'Confirm Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

