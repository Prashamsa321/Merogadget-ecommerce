import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  ShoppingBag,
  Eye,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

const OrdersPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/orders');

      if (data.success) {
        setOrders(data.orders || []);
      } else {
        toastError(data.message || 'Failed to fetch orders');
      }
    } catch (error) {
      console.error('Fetch orders error:', error);
      toastError(error.response?.data?.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />;
      case 'Pending':
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'Processing':
      case 'processing':
        return <Package className="w-4 h-4" />;
      case 'Shipped':
      case 'shipped':
        return <Truck className="w-4 h-4" />;
      case 'Delivered':
      case 'delivered':
        return <CheckCircle className="w-4 h-4" />;
      case 'Cancelled':
      case 'cancelled':
      case 'failed':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-50 text-green-700 border border-green-100';
      case 'Pending':
      case 'pending':
        return 'bg-amber-50 text-amber-700 border border-amber-100';
      case 'Processing':
      case 'processing':
        return 'bg-blue-50 text-blue-700 border border-blue-100';
      case 'Shipped':
      case 'shipped':
        return 'bg-purple-50 text-purple-700 border border-purple-100';
      case 'Delivered':
      case 'delivered':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-100';
      case 'Cancelled':
      case 'cancelled':
      case 'failed':
        return 'bg-red-50 text-red-700 border border-red-100';
      default:
        return 'bg-gray-100 text-gray-700 border border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-orange-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-[#7A6A5A]">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream py-10 px-4 sm:px-6 lg:px-10 xl:px-16">
      <div className="container mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-10">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[#7A6A5A] hover:text-orange-600 transition-colors mb-6 text-sm font-medium"
          >
            <ArrowLeft size={18} />
            <span>Back</span>
          </button>

          <p className="eyebrow mb-2">Order history</p>
          <h1 className="text-4xl md:text-5xl font-bold text-[#3D1A00]">
            Your orders
          </h1>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-orange-100 shadow-soft">
            <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-5">
              <ShoppingBag className="w-12 h-12 text-orange-400" />
            </div>
            <h3 className="text-2xl font-bold text-[#3D1A00] mb-2">No orders yet</h3>
            <p className="text-[#7A6A5A] mb-8">Start shopping and your orders will appear here.</p>
            <button
              onClick={() => navigate('/products')}
              className="bg-orange-600 text-white px-8 py-4 rounded-full font-semibold hover:bg-orange-700 transition-all shadow-lg shadow-orange-500/20"
            >
              Browse products
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-3xl p-6 border border-orange-100 hover:border-orange-300 hover:shadow-card transition-all duration-300"
              >
                {/* Order header */}
                <div className="flex flex-wrap items-start justify-between gap-4 mb-5 pb-5 border-b border-orange-100">
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-bold text-[#3D1A00] text-lg">
                        #{order._id?.slice(-8).toUpperCase()}
                      </span>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.orderStatus)}`}>
                        {getStatusIcon(order.orderStatus)}
                        {(order.orderStatus || 'Pending').charAt(0).toUpperCase() + (order.orderStatus || 'Pending').slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-[#7A6A5A] mt-2">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-orange-600">
                      रु{order.totalAmount?.toFixed(2)}
                    </p>
                    <p className="text-xs text-[#7A6A5A] uppercase tracking-widest font-semibold mt-1">
                      {order.paymentMethod === 'khalti' ? 'Khalti' : 'Cash on Delivery'}
                    </p>
                  </div>
                </div>

                {/* Order items */}
                <div className="space-y-3">
                  {order.items?.slice(0, 3).map((item, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <img
                        src={item.image || '/placeholder.jpg'}
                        alt={item.name}
                        className="w-14 h-14 object-cover rounded-2xl border border-orange-100"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-[#3D1A00] text-sm truncate">{item.name}</p>
                        <p className="text-sm text-[#7A6A5A]">
                          Qty: {item.quantity} × रु{item.price?.toFixed(2)}
                        </p>
                      </div>
                      <p className="font-bold text-[#3D1A00] text-sm whitespace-nowrap">
                        रु{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                  {order.items?.length > 3 && (
                    <p className="text-sm text-[#7A6A5A] text-center pt-2">
                      +{order.items.length - 3} more item{order.items.length - 3 > 1 ? 's' : ''}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="border-t border-orange-100 pt-5 mt-5 flex flex-wrap gap-3">
                  <button
                    onClick={() => navigate(`/orders/${order._id}`)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-cream border border-orange-200 text-[#3D1A00] rounded-full hover:bg-orange-50 transition-colors text-sm font-semibold"
                  >
                    <Eye size={16} />
                    View Details
                  </button>
                  {order.orderStatus === 'confirmed' && (
                    <button
                      onClick={() => {
                        alert('Your order is being processed. You will receive tracking information soon.');
                      }}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-full hover:bg-blue-100 transition-colors text-sm font-semibold"
                    >
                      <Truck size={16} />
                      Track Order
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;