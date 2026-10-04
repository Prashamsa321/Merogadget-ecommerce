import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';

const AdminOrders = () => {
  const { success, error: toastError } = useToast();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusComment, setStatusComment] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch real orders from backend
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/orders/admin/all?limit=100');
      if (data.success) {
        setOrders(data.orders || []);
      } else {
        toastError(data.message || 'Failed to load orders');
      }
    } catch (error) {
      console.error('Fetch orders error:', error);
      toastError(error.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const statusOptions = [
    { value: 'Pending', label: 'Pending', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', icon: '⏳', message: 'Order status updated to Pending' },
    { value: 'Processing', label: 'Processing', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: '⚙️', message: 'Order status updated to Processing' },
    { value: 'Shipped', label: 'Shipped', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', icon: '🚚', message: 'Order status updated to Shipped' },
    { value: 'Delivered', label: 'Delivered', color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: '✅', message: 'Order status updated to Delivered' },
    { value: 'Cancelled', label: 'Cancelled', color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: '❌', message: 'Order status updated to Cancelled' }
  ];

  const getStatusBadge = (status) => {
    const badges = {
      Pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      Processing: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      Shipped: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      Delivered: 'bg-green-500/20 text-green-400 border-green-500/30',
      Cancelled: 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    return badges[status] || badges.Pending;
  };

  const getStatusLabel = (status) => status || 'Pending';

  const getStatusIcon = (status) => {
    const icons = {
      Pending: '⏳',
      Processing: '⚙️',
      Shipped: '🚚',
      Delivered: '✅',
      Cancelled: '❌'
    };
    return icons[status] || '📦';
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setIsDetailsModalOpen(true);
  };

  const handleUpdateStatus = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.orderStatus || 'Pending');
    setStatusComment('');
    setIsStatusModalOpen(true);
  };

  // ✅ Actually call backend to update status
  const handleConfirmStatusUpdate = async () => {
    if (!newStatus || !selectedOrder) return;

    try {
      const { data } = await api.put(`/orders/admin/${selectedOrder._id}/status`, {
        orderStatus: newStatus,
        comment: statusComment
      });

      if (data.success) {
        // Update local state
        setOrders(prev => prev.map(o =>
          o._id === selectedOrder._id ? data.order : o
        ));
        const statusMessage = statusOptions.find(opt => opt.value === newStatus)?.message || 'Order status updated';
        success(statusMessage);
        setIsStatusModalOpen(false);
        setSelectedOrder(null);
        setNewStatus('');
        setStatusComment('');
      } else {
        toastError(data.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Update status error:', error);
      toastError(error.response?.data?.message || 'Failed to update status');
    }
  };

  const stats = {
    totalOrders: orders.length,
    totalRevenue: orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0),
    pending: orders.filter(o => o.orderStatus === 'Pending').length,
    processing: orders.filter(o => o.orderStatus === 'Processing').length,
    shipped: orders.filter(o => o.orderStatus === 'Shipped').length,
    delivered: orders.filter(o => o.orderStatus === 'Delivered').length,
    cancelled: orders.filter(o => o.orderStatus === 'Cancelled').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Orders Management</h1>
          <p className="text-slate-400 text-sm sm:text-base mt-1">View and manage customer orders</p>
        </div>
        <div className="flex gap-2 items-center">
          <button
            onClick={fetchOrders}
            className="text-xs sm:text-sm text-white bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-full transition-colors"
          >
            🔄 Refresh
          </button>
          <div className="text-xs sm:text-sm text-slate-400 bg-slate-800/50 px-3 py-1.5 rounded-full">
            {stats.totalOrders} Total Orders
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-800 rounded-xl p-3 sm:p-4 border border-slate-700">
          <div className="text-xl sm:text-2xl mb-1">📦</div>
          <div className="text-xl sm:text-2xl font-bold text-white">{stats.totalOrders}</div>
          <div className="text-xs text-slate-400">Total Orders</div>
        </div>
        <div className="bg-emerald-500/10 rounded-xl p-3 sm:p-4 border border-emerald-500/20">
          <div className="text-xl sm:text-2xl mb-1">💰</div>
          <div className="text-lg sm:text-2xl font-bold text-emerald-400">रु {stats.totalRevenue.toLocaleString()}</div>
          <div className="text-xs text-slate-400">Total Revenue</div>
        </div>
        <div className="bg-amber-500/10 rounded-xl p-3 sm:p-4 border border-amber-500/20">
          <div className="text-xl sm:text-2xl mb-1">⏳</div>
          <div className="text-xl sm:text-2xl font-bold text-amber-400">{stats.pending}</div>
          <div className="text-xs text-slate-400">Pending</div>
        </div>
        <div className="bg-green-500/10 rounded-xl p-3 sm:p-4 border border-green-500/20">
          <div className="text-xl sm:text-2xl mb-1">✅</div>
          <div className="text-xl sm:text-2xl font-bold text-green-400">{stats.delivered}</div>
          <div className="text-xs text-slate-400">Delivered</div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-800 rounded-xl shadow-lg overflow-hidden border border-slate-700">
        {orders.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <div className="text-5xl sm:text-6xl mb-3">🛒</div>
            <p className="text-slate-400">No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-700 hidden md:table">
              <thead className="bg-slate-900">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Order ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Items</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-slate-800 divide-y divide-slate-700">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-700/50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-xs sm:text-sm font-mono text-blue-400">
                        {order.orderNumber || order._id?.slice(-8)}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-white">
                          {order.shippingAddress?.fullName || order.userId?.name || 'N/A'}
                        </p>
                        <p className="text-xs text-slate-400 truncate max-w-[150px]">
                          {order.shippingAddress?.email || order.userId?.email || '—'}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="text-sm text-slate-300">{order.items?.length || 0} items</p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="text-sm font-semibold text-teal-400">
                        रु {order.totalAmount?.toLocaleString()}
                      </p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(order.orderStatus)}`}>
                        <span className="mr-1">{getStatusIcon(order.orderStatus)}</span>
                        {getStatusLabel(order.orderStatus)}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="text-sm text-slate-400">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewDetails(order)}
                          className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded-lg text-xs hover:bg-blue-600/30 transition-colors"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(order)}
                          className="px-2 py-1 bg-teal-600/20 text-teal-400 rounded-lg text-xs hover:bg-teal-600/30 transition-colors"
                        >
                          Update
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3 p-3">
              {orders.map((order) => (
                <div key={order._id} className="bg-slate-700/50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs text-slate-400">Order ID</p>
                      <p className="text-sm font-mono text-blue-400">
                        {order.orderNumber || order._id?.slice(-8)}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(order.orderStatus)}`}>
                      <span className="mr-1">{getStatusIcon(order.orderStatus)}</span>
                      {getStatusLabel(order.orderStatus)}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Customer</p>
                    <p className="text-sm font-medium text-white">
                      {order.shippingAddress?.fullName || order.userId?.name || 'N/A'}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-slate-400">Items</p>
                      <p className="text-sm text-white">{order.items?.length || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400">Total</p>
                      <p className="text-sm font-semibold text-teal-400">रु {order.totalAmount?.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleViewDetails(order)}
                      className="flex-1 py-2 bg-blue-600/20 text-blue-400 rounded-lg text-sm"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(order)}
                      className="flex-1 py-2 bg-teal-600/20 text-teal-400 rounded-lg text-sm"
                    >
                      Update
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {isDetailsModalOpen && selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setIsDetailsModalOpen(false)}
        >
          <div
            className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-slate-800 border-b border-slate-700 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
              <h3 className="text-lg sm:text-xl font-bold text-white">Order Details</h3>
              <button onClick={() => setIsDetailsModalOpen(false)} className="text-slate-400 hover:text-white text-2xl">&times;</button>
            </div>
            <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div>
                  <p className="text-xs text-slate-400">Order Number</p>
                  <p className="text-xs sm:text-sm font-mono text-blue-400 break-all">
                    {selectedOrder.orderNumber || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Order Date</p>
                  <p className="text-xs sm:text-sm text-white">
                    {new Date(selectedOrder.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Payment Method</p>
                  <p className="text-xs sm:text-sm text-white uppercase">{selectedOrder.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Payment Status</p>
                  <p className="text-xs sm:text-sm capitalize text-white">{selectedOrder.paymentStatus}</p>
                </div>
              </div>

              <div className="bg-slate-700/30 rounded-xl p-3 sm:p-4">
                <h4 className="text-sm sm:text-base text-white font-semibold mb-2 sm:mb-3">Customer Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  <div>
                    <p className="text-xs text-slate-400">Name</p>
                    <p className="text-sm text-white">
                      {selectedOrder.shippingAddress?.fullName || selectedOrder.userId?.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Email</p>
                    <p className="text-sm text-white break-all">
                      {selectedOrder.shippingAddress?.email || selectedOrder.userId?.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Phone</p>
                    <p className="text-sm text-white">{selectedOrder.shippingAddress?.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Address</p>
                    <p className="text-sm text-white">
                      {selectedOrder.shippingAddress?.address}, {selectedOrder.shippingAddress?.city}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm sm:text-base text-white font-semibold mb-2 sm:mb-3">
                  Products ({selectedOrder.items?.length} items)
                </h4>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-slate-700/20 rounded-lg">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <span className="text-xl sm:text-2xl">📦</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm sm:text-base text-white font-medium">{item.name}</p>
                        <p className="text-xs text-slate-400">
                          Qty: {item.quantity} × रु {item.price?.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm sm:text-base text-white font-semibold">
                          रु {(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-slate-700 text-right">
                  <p className="text-white text-sm sm:text-base">
                    Total: <span className="text-lg sm:text-xl font-bold text-teal-400">रु {selectedOrder.totalAmount?.toLocaleString()}</span>
                  </p>
                </div>
              </div>

              {selectedOrder.statusHistory?.length > 0 && (
                <div>
                  <h4 className="text-sm sm:text-base text-white font-semibold mb-2 sm:mb-3">Status History</h4>
                  <div className="space-y-2">
                    {selectedOrder.statusHistory.map((history, idx) => (
                      <div key={idx} className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-teal-400"></div>
                        <p className="text-slate-300 capitalize">{history.status}</p>
                        <p className="text-slate-500 text-xs">{new Date(history.updatedAt).toLocaleString()}</p>
                        {history.comment && <p className="text-slate-400 text-xs">- {history.comment}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Update Status Modal */}
      {isStatusModalOpen && selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setIsStatusModalOpen(false)}
        >
          <div
            className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-teal-600 to-blue-600 px-4 sm:px-6 py-4 rounded-t-2xl">
              <h3 className="text-lg sm:text-xl font-bold text-white">Update Order Status</h3>
              <p className="text-white/80 text-xs sm:text-sm mt-1 break-all">
                Order: {selectedOrder.orderNumber || selectedOrder._id?.slice(-8)}
              </p>
            </div>

            <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2 sm:mb-3">Select Status</label>
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  {statusOptions.map((status) => (
                    <button
                      key={status.value}
                      onClick={() => setNewStatus(status.value)}
                      className={`p-2 sm:p-3 rounded-xl border-2 transition-all duration-200 flex items-center gap-1 sm:gap-2 text-sm sm:text-base ${
                        newStatus === status.value
                          ? `${status.color} border-current`
                          : 'bg-slate-700/50 border-slate-600 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      <span className="text-lg sm:text-xl">{status.icon}</span>
                      <span className="font-medium">{status.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Comment (optional)</label>
                <input
                  type="text"
                  value={statusComment}
                  onChange={(e) => setStatusComment(e.target.value)}
                  placeholder="Add a note about this update..."
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              <div className="bg-slate-700/30 rounded-lg p-3">
                <p className="text-xs text-slate-400">Current Status</p>
                <p className="text-sm text-white font-medium mt-1">
                  <span className="mr-1">{getStatusIcon(selectedOrder.orderStatus)}</span>
                  {getStatusLabel(selectedOrder.orderStatus)}
                </p>
              </div>
            </div>

            <div className="border-t border-slate-700 px-4 sm:px-6 py-3 sm:py-4 flex gap-3">
              <button
                onClick={() => setIsStatusModalOpen(false)}
                className="flex-1 px-3 sm:px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmStatusUpdate}
                disabled={!newStatus}
                className="flex-1 px-3 sm:px-4 py-2 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-lg hover:from-teal-600 hover:to-blue-600 transition-all disabled:opacity-50 text-sm sm:text-base"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;