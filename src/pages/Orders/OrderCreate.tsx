import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import orderService from '../../services/orderService';
import { locationService } from '../../services/locationService';
import { productService } from '../../services/productService';
import { useAuth } from '../../contexts/AuthContext';

interface Table {
  id: string;
  location_id: string;
  code: string;
  seats: number;
  status: string;
  is_active: boolean;
}

interface Product {
  id: string;
  code: string;
  name: string;
  price_cents: number;
  category_id: string;
  is_active: boolean;
}

export default function OrderCreate() {
  const [searchParams] = useSearchParams();
  const tableId = searchParams.get('tableId');
  const locationId = searchParams.get('locationId');

  const [table, setTable] = useState<Table | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<Array<{ product: Product; quantity: number }>>([]);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (tableId && locationId) {
      loadData();
    }
  }, [tableId, locationId]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load table info
      if (tableId) {
        const tableData = await locationService.getTable(tableId);
        setTable(tableData);
        
        // Check if table already has an active order with items
        try {
          const activeOrder = await orderService.getActiveOrderByTable(tableId);
          if (activeOrder) {
            const orderWithItems = await orderService.getOrderById(activeOrder.id);
            // If order has items, redirect to it
            if (orderWithItems.items && orderWithItems.items.length > 0) {
              navigate(`/orders/${activeOrder.id}`);
              return;
            }
            // If order is empty, we can continue here to add items
            setCurrentOrderId(activeOrder.id);
          }
        } catch (err: any) {
          // 404 means no active order, which is fine - continue with order creation
          if (err.response?.status !== 404) {
            console.error('Error checking active order:', err);
          }
        }
      }

      // Load products
      const productsData = await productService.getProducts();
      setProducts(productsData.filter(p => p.is_active));
      
      setError('');
    } catch (err: any) {
      setError(err.message || 'Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async () => {
    if (!selectedProduct || quantity < 1 || !tableId || !locationId || !user) return;

    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;

    try {
      setLoading(true);

      // If no order exists yet, create it when adding first item
      let orderId = currentOrderId;
      if (!orderId) {
        const newOrder = await orderService.createOrder({
          table_id: tableId,
          location_id: locationId,
          waiter_id: user.id,
          notes,
        });
        orderId = newOrder.id;
        setCurrentOrderId(orderId);
      }

      // Add item to order
      await orderService.addItemToOrder(orderId, {
        product_id: product.id,
        quantity: quantity,
      });

      // Update local items state
      const existingIndex = items.findIndex(item => item.product.id === product.id);
      if (existingIndex >= 0) {
        const newItems = [...items];
        newItems[existingIndex].quantity += quantity;
        setItems(newItems);
      } else {
        setItems([...items, { product, quantity }]);
      }

      // Reset form
      setSelectedProduct('');
      setQuantity(1);
      setError('');
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Error adding item';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (productId: string) => {
    if (!currentOrderId) {
      // If no order exists, just remove from local state
      setItems(items.filter(item => item.product.id !== productId));
      return;
    }

    try {
      setLoading(true);
      
      // Find the item to get its ID from the order
      const itemToRemove = items.find(item => item.product.id === productId);
      if (!itemToRemove) return;

      // Get current order to find the item ID
      const order = await orderService.getOrderById(currentOrderId);
      const orderItem = order.items.find(item => item.product_id === productId);
      
      if (orderItem) {
        await orderService.removeItemFromOrder(orderItem.id);
      }

      // Update local state
      const newItems = items.filter(item => item.product.id !== productId);
      setItems(newItems);

      // If no items left, the backend automatically deletes the order
      // Clear the order ID and update table status
      if (newItems.length === 0 && currentOrderId) {
        setCurrentOrderId(null);
        // Table status will be updated to 'available' by the backend automatically
      }
    } catch (err: any) {
      console.error('Error removing item:', err);
      setError(err.response?.data?.error || err.message || 'Error removing item');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemoveItem(productId);
      return;
    }

    if (!currentOrderId) {
      // If no order exists, just update local state
      const newItems = items.map(item =>
        item.product.id === productId ? { ...item, quantity: newQuantity } : item
      );
      setItems(newItems);
      return;
    }

    try {
      setLoading(true);
      
      // Get current order to find the item ID
      const order = await orderService.getOrderById(currentOrderId);
      const orderItem = order.items.find(item => item.product_id === productId);
      
      if (orderItem) {
        await orderService.updateOrderItem(orderItem.id, { quantity: newQuantity });
      }

      // Update local state
      const newItems = items.map(item =>
        item.product.id === productId ? { ...item, quantity: newQuantity } : item
      );
      setItems(newItems);
    } catch (err: any) {
      console.error('Error updating quantity:', err);
      setError(err.response?.data?.error || err.message || 'Error updating quantity');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.product.price_cents * item.quantity, 0);
  };

  const handleViewOrder = () => {
    // Navigate to order detail if order exists and has items
    if (currentOrderId && items.length > 0) {
      navigate(`/orders/${currentOrderId}`);
    }
  };

  if (!tableId || !locationId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          Please select a table from the venues view.
          <button
            onClick={() => navigate('/venues')}
            className="ml-4 text-yellow-800 font-medium hover:underline"
          >
            Go to Venues →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4 sm:py-6 md:py-8 max-w-4xl">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">New Order</h1>
        {table && (
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            Table: {table.code} | Capacity: {table.seats} people
          </p>
        )}
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Left: Add items */}
        <div className="space-y-4 md:space-y-6">
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Add Products</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product
                </label>
                <select
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select product...</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.name} - {orderService.formatPrice(product.price_cents)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <button
                onClick={handleAddItem}
                disabled={!selectedProduct}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 sm:py-3 rounded-lg font-medium transition-colors text-sm sm:text-base"
              >
                + Add to Order
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Customer asked about promotions..."
              rows={3}
              className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Right: Cart */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Current Order</h2>

          {items.length === 0 ? (
            <p className="text-sm sm:text-base text-gray-600 text-center py-8">
              No items in the order yet.
              <br />
              Add products from the form.
            </p>
          ) : (
            <>
              <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
                {items.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1 min-w-0 mr-2">
                      <p className="font-medium text-gray-900 text-sm sm:text-base truncate">{item.product.name}</p>
                      <p className="text-xs sm:text-sm text-gray-600">
                        {orderService.formatPrice(item.product.price_cents)} c/u
                      </p>
                    </div>

                    <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                      <button
                        onClick={() => handleUpdateQuantity(item.product.id, item.quantity - 1)}
                        className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-200 hover:bg-gray-300 rounded text-gray-700 font-bold text-sm sm:text-base touch-manipulation"
                      >
                        -
                      </button>
                      <span className="w-6 sm:w-8 text-center font-medium text-sm sm:text-base">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateQuantity(item.product.id, item.quantity + 1)}
                        className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-200 hover:bg-gray-300 rounded text-gray-700 font-bold text-sm sm:text-base touch-manipulation"
                      >
                        +
                      </button>
                      <button
                        onClick={() => handleRemoveItem(item.product.id)}
                        className="ml-1 sm:ml-2 text-red-600 hover:text-red-800 text-lg sm:text-xl touch-manipulation"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4 sm:mb-6">
                  <span className="text-base sm:text-lg font-semibold text-gray-900">Total:</span>
                  <span className="text-xl sm:text-2xl font-bold text-blue-600">
                    {orderService.formatPrice(calculateTotal())}
                  </span>
                </div>

                <button
                  onClick={handleViewOrder}
                  disabled={loading || items.length === 0 || !currentOrderId}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-3 sm:py-4 rounded-lg font-medium transition-colors text-sm sm:text-base touch-manipulation"
                >
                  {loading ? 'Processing...' : 'View Order'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

