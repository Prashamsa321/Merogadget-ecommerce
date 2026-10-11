import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Package, Clock, CheckCircle, Truck, XCircle,
  ShoppingBag, ArrowLeft, ChevronDown, ChevronUp,
  RefreshCw, CreditCard, Banknote
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

const ITEMS_PER_PAGE = 5;

const OrdersPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { error: toastError } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      const { data } = await api.get('/orders');
      if (data.success) setOrders(data.orders || []);
      else toastError(data.message || 'Failed to fetch orders');
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getStatusIcon = (status) => {
    const s = status?.toLowerCase();
    if (s === 'confirmed') return <CheckCircle className="w-3.5 h-3.5" />;
    if (s === 'pending') return <Clock className="w-3.5 h-3.5" />;
    if (s === 'processing') return <Package className="w-3.5 h-3.5" />;
    if (s === 'shipped') return <Truck className="w-3.5 h-3.5" />;
    if (s === 'delivered') return <CheckCircle className="w-3.5 h-3.5" />;
    if (s === 'cancelled' || s === 'failed') return <XCircle className="w-3.5 h-3.5" />;
    return <Clock className="w-3.5 h-3.5" />;
  };

  const getStatusColor = (status) => {
    const s = status?.toLowerCase();
    if (s === 'confirmed') return 'bg-green-50 text-green-700 border-green-200';
    if (s === 'pending') return 'bg-amber-50 text-amber-700 border-amber-200';
    if (s === 'processing') return 'bg-blue-50 text-blue-700 border-blue-200';
    if (s === 'shipped') return 'bg-purple-50 text-purple-700 border-purple-200';
    if (s === 'delivered') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (s === 'cancelled' || s === 'failed') return 'bg-red-50 text-red-700 border-red-200';
    return 'bg-gray-100 text-gray-600 border-gray-200';
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const getPaymentLabel = (method) => {
    if (!method) return 'Unknown';
    const m = method.toLowerCase();
    if (m === 'khalti') return 'Khalti';
    if (m === 'cod' || m === 'cash on delivery') return 'Cash on Delivery';
    return method;
  };

  const getPaymentIcon = (method) => {
    const m = method?.toLowerCase();
    if (m === 'khalti') return <CreditCard className="w-3.5 h-3.5" />;
    return <Banknote className="w-3.5 h-3.5" />;
  };

  // Pagination
  const totalPages = Math.ceil(orders.length / ITEMS_PER_PAGE);
  const paginatedOrders = orders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

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
      <div className="container mx-auto max-w-4xl">

        {/* Header */}
        <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
          <div>
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-[#7A6A5A] hover:text-orange-600 transition-colors mb-4 text-sm font-medium"
            >
              <ArrowLeft size={16} />
              Back
            </button>
            <p className="eyebrow mb-1">Order history</p>
            <h1 className="text-3xl md:text-4xl font-bold text-[#3D1A00]">Your Orders</h1>
            <p className="text-[#7A6A5A] text-sm mt-1">{orders.length} order{orders.length !== 1 ? 's' : ''} total</p>
          </div>
          <button
            onClick={() => fetchOrders(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-orange-200 text-[#3D1A00] rounded-full hover:bg-orange-50 transition-colors text-sm font-semibold mt-8"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
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
              Browse Products
            </button>
          </div>
        ) : (
          <>
            {/* Order List */}
            <div className="bg-white rounded-2xl border border-orange-100 shadow-soft overflow-hidden">

              {/* Table Header */}
              <div className="hidden md:grid grid-cols-12 px-6 py-3 bg-[#FFF4E6] border-b border-orange-100 text-xs font-bold text-[#7A6A5A] uppercase tracking-widest">
                <div className="col-span-3">Order</div>
                <div className="col-span-2">Date</div>
                <div className="col-span-2">Payment</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2 text-right">Total</div>
                <div className="col-span-1"></div>
              </div>

              {/* Rows */}
              <div className="divide-y divide-orange-50">
                {paginatedOrders.map((order) => (
                  <div key={order._id}>
                    {/* Main Row */}
                    <div className="px-5 py-4 md:grid md:grid-cols-12 md:items-center flex flex-wrap gap-3 hover:bg-orange-50/40 transition-colors">

                      {/* Order ID */}
                      <div className="col-span-3">
                        <p className="font-bold text-[#3D1A00] text-sm">
                          #{order._id?.slice(-8).toUpperCase()}
                        </p>
                        <p className="text-xs text-[#A8998A] mt-0.5">{order.items?.length} item{order.items?.length !== 1 ? 's' : ''}</p>
                      </div>

                      {/* Date */}
                      <div className="col-span-2">
                        <p className="text-sm text-[#5C4B3A]">{formatDate(order.createdAt)}</p>
                      </div>

                      {/* Payment Method */}
                      <div className="col-span-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-orange-50 border border-orange-100 rounded-full text-xs font-semibold text-[#3D1A00]">
                          {getPaymentIcon(order.paymentMethod)}
                          {getPaymentLabel(order.paymentMethod)}
                        </span>
                      </div>

                      {/* Status */}
                      <div className="col-span-2">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.orderStatus)}`}>
                          {getStatusIcon(order.orderStatus)}
                          {(order.orderStatus || 'Pending').charAt(0).toUpperCase() + (order.orderStatus || 'Pending').slice(1)}
                        </span>
                      </div>

                      {/* Total */}
                      <div className="col-span-2 text-right">
                        <p className="font-bold text-orange-600">रु{order.totalAmount?.toFixed(2)}</p>
                      </div>

                      {/* Expand Toggle */}
                      <div className="col-span-1 flex justify-end">
                        <button
                          onClick={() => setExpandedOrder(expandedOrder === order._id ? null : order._id)}
                          className="p-1.5 rounded-full hover:bg-orange-100 transition-colors text-[#7A6A5A] hover:text-orange-600"
                          title={expandedOrder === order._id ? 'Collapse' : 'View items'}
                        >
                          {expandedOrder === order._id
                            ? <ChevronUp className="w-4 h-4" />
                            : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Expanded Items */}
                    {expandedOrder === order._id && (
                      <div className="px-5 pb-5 bg-[#FFFAF5] border-t border-orange-50">
                        <p className="text-xs font-bold text-[#7A6A5A] uppercase tracking-widest mb-3 pt-4">Order Items</p>
                        <div className="space-y-3">
                          {order.items?.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-4 bg-white rounded-xl p-3 border border-orange-100">
                              <img
                                src={item.image || '/placeholder.jpg'}
                                alt={item.name}
                                className="w-12 h-12 object-cover rounded-lg border border-orange-100 flex-shrink-0"
                                onError={(e) => { e.target.src = 'https://via.placeholder.com/48'; }}
                              />
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-[#3D1A00] text-sm truncate">{item.name}</p>
                                <p className="text-xs text-[#7A6A5A]">Qty: {item.quantity} × रु{item.price?.toFixed(2)}</p>
                              </div>
                              <p className="font-bold text-[#3D1A00] text-sm">रु{(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                          ))}
                        </div>

                        {/* Shipping address */}
                        {order.shippingAddress?.fullName && (
                          <div className="mt-4 p-3 bg-white rounded-xl border border-orange-100 text-sm text-[#5C4B3A]">
                            <p className="font-bold text-[#3D1A00] text-xs uppercase tracking-widest mb-1">Shipping To</p>
                            <p>{order.shippingAddress.fullName}</p>
                            <p>{order.shippingAddress.address}, {order.shippingAddress.city}</p>
                            {order.shippingAddress.phone && <p>📞 {order.shippingAddress.phone}</p>}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex justify-center items-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                    currentPage === 1
                      ? 'bg-orange-50 text-[#A8998A] cursor-not-allowed'
                      : 'bg-white border border-orange-200 text-[#3D1A00] hover:bg-orange-50'
                  }`}
                >
                  Previous
                </button>

                <div className="flex gap-1.5">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-9 h-9 rounded-full text-sm font-semibold transition-colors ${
                        currentPage === page
                          ? 'bg-orange-600 text-white'
                          : 'bg-white border border-orange-200 text-[#3D1A00] hover:bg-orange-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                    currentPage === totalPages
                      ? 'bg-orange-50 text-[#A8998A] cursor-not-allowed'
                      : 'bg-white border border-orange-200 text-[#3D1A00] hover:bg-orange-50'
                  }`}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
