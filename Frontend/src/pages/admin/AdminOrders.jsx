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

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

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
    { value: 'Pending',    label: 'Pending',    color: 'bg-amber-50 text-amber-700 border-amber-200',   message: 'Order status updated to Pending' },
    { value: 'Processing', label: 'Processing', color: 'bg-blue-50 text-blue-700 border-blue-200',     message: 'Order status updated to Processing' },
    { value: 'Shipped',    label: 'Shipped',    color: 'bg-purple-50 text-purple-700 border-purple-200', message: 'Order status updated to Shipped' },
    { value: 'Delivered',  label: 'Delivered',  color: 'bg-green-50 text-green-700 border-green-200',  message: 'Order status updated to Delivered' },
    { value: 'Cancelled',  label: 'Cancelled',  color: 'bg-red-50 text-red-700 border-red-200',        message: 'Order status updated to Cancelled' }
  ];

  const getStatusBadge = (status) => {
    const badges = {
      Pending:    'bg-amber-50 text-amber-700 border-amber-200',
      Processing: 'bg-blue-50 text-blue-700 border-blue-200',
      Shipped:    'bg-purple-50 text-purple-700 border-purple-200',
      Delivered:  'bg-green-50 text-green-700 border-green-200',
      Cancelled:  'bg-red-50 text-red-700 border-red-200'
    };
    return badges[status] || badges.Pending;
  };

  const getStatusLabel = (status) => status || 'Pending';

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

  const handleConfirmStatusUpdate = async () => {
    if (!newStatus || !selectedOrder) return;

    try {
      const { data } = await api.put(`/orders/admin/${selectedOrder._id}/status`, {
        orderStatus: newStatus,
        comment: statusComment
      });

      if (data.success) {
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

  useEffect(() => {
    setTotalPages(Math.ceil(orders.length / itemsPerPage));
    setCurrentPage(1);
  }, [orders.length, itemsPerPage]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = orders.slice(indexOfFirstItem, indexOfLastItem);

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#7A6A5A]">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <p className="eyebrow mb-1">Order management</p>
          <h1 className="text-2xl md:text-3xl font-bold text-[#3D1A00]">Orders</h1>
          <p className="text-[#7A6A5A] text-sm mt-1">View and manage customer orders</p>
        </div>
        <div className="flex gap-2 items-center">
          <button
            onClick={fetchOrders}
            className="text-xs sm:text-sm text-white bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-full transition-colors font-semibold shadow-md shadow-orange-500/20"
          >
            Refresh
          </button>
          <div className="text-xs sm:text-sm text-[#3D1A00] bg-white border border-orange-100 px-4 py-2 rounded-full font-semibold">
            {stats.totalOrders} Orders
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-2xl px-4 py-3 border border-orange-100 shadow-soft">
          <div className="text-xs text-[#7A6A5A] uppercase tracking-widest font-semibold mb-1">Total Orders</div>
          <div className="text-xl font-bold text-[#3D1A00]">{stats.totalOrders}</div>
        </div>

        <div className="bg-white rounded-2xl px-4 py-3 border border-green-100 shadow-soft">
          <div className="text-xs text-[#7A6A5A] uppercase tracking-widest font-semibold mb-1">Revenue</div>
          <div className="text-lg font-bold text-green-600">रु {stats.totalRevenue.toLocaleString()}</div>
        </div>

        <div className="bg-white rounded-2xl px-4 py-3 border border-amber-100 shadow-soft">
          <div className="text-xs text-[#7A6A5A] uppercase tracking-widest font-semibold mb-1">Pending</div>
          <div className="text-xl font-bold text-amber-600">{stats.pending}</div>
        </div>

        <div className="bg-white rounded-2xl px-4 py-3 border border-green-100 shadow-soft">
          <div className="text-xs text-[#7A6A5A] uppercase tracking-widest font-semibold mb-1">Delivered</div>
          <div className="text-xl font-bold text-green-600">{stats.delivered}</div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl shadow-soft overflow-hidden border border-orange-100">
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[#7A6A5A]">No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-orange-100 hidden md:table">
              <thead className="bg-[#FFF4E6]">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-orange-700 uppercase tracking-widest">Order ID</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-orange-700 uppercase tracking-widest">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-orange-700 uppercase tracking-widest">Items</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-orange-700 uppercase tracking-widest">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-orange-700 uppercase tracking-widest">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-orange-700 uppercase tracking-widest">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-orange-700 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-orange-50">
                {currentOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-orange-50/50 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-xs font-mono text-orange-600 font-semibold">
                        {order.orderNumber || order._id?.slice(-8)}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-semibold text-[#3D1A00]">
                          {order.shippingAddress?.fullName || order.userId?.name || 'N/A'}
                        </p>
                        <p className="text-xs text-[#7A6A5A] truncate max-w-[150px]">
                          {order.shippingAddress?.email || order.userId?.email || '—'}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="text-sm text-[#7A6A5A]">{order.items?.length || 0} items</p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="text-sm font-bold text-orange-600">
                        रु {order.totalAmount?.toLocaleString()}
                      </p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border inline-flex items-center ${getStatusBadge(order.orderStatus)}`}>
                        {getStatusLabel(order.orderStatus)}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="text-sm text-[#7A6A5A]">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewDetails(order)}
                          className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-semibold hover:bg-blue-100 transition-colors"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(order)}
                          className="px-3 py-1.5 bg-orange-50 text-orange-700 rounded-full text-xs font-semibold hover:bg-orange-100 transition-colors"
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
              {currentOrders.map((order) => (
                <div key={order._id} className="bg-white rounded-2xl p-4 space-y-3 border border-orange-100">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs text-[#A8998A] uppercase tracking-widest font-semibold">Order ID</p>
                      <p className="text-sm font-mono text-orange-600 font-semibold">
                        {order.orderNumber || order._id?.slice(-8)}
                      </p>
                    </div>
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border inline-flex items-center ${getStatusBadge(order.orderStatus)}`}>
                      {getStatusLabel(order.orderStatus)}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-[#A8998A] uppercase tracking-widest font-semibold mb-1">Customer</p>
                    <p className="text-sm font-semibold text-[#3D1A00]">
                      {order.shippingAddress?.fullName || order.userId?.name || 'N/A'}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-[#A8998A] uppercase tracking-widest font-semibold mb-1">Items</p>
                      <p className="text-sm text-[#3D1A00]">{order.items?.length || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#A8998A] uppercase tracking-widest font-semibold mb-1">Total</p>
                      <p className="text-sm font-bold text-orange-600">रु {order.totalAmount?.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleViewDetails(order)}
                      className="flex-1 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(order)}
                      className="flex-1 py-2 bg-orange-50 text-orange-700 rounded-full text-sm font-semibold"
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-[#7A6A5A]">
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, orders.length)} of {orders.length} orders
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={goToPrevPage}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-full font-semibold text-sm transition-all duration-300 ${
                currentPage === 1
                  ? 'bg-orange-50 text-[#A8998A] cursor-not-allowed'
                  : 'bg-white border border-orange-200 text-[#3D1A00] hover:bg-orange-50'
              }`}
            >
              Previous
            </button>

            <div className="flex gap-1.5">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    className={`w-10 h-10 rounded-full font-semibold transition-all duration-300 ${
                      currentPage === pageNum
                        ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/30'
                        : 'bg-white border border-orange-200 text-[#3D1A00] hover:bg-orange-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              {totalPages > 5 && currentPage < totalPages - 2 && (
                <>
                  <span className="px-2 py-2 text-[#A8998A]">...</span>
                  <button
                    onClick={() => goToPage(totalPages)}
                    className="w-10 h-10 rounded-full font-semibold transition-all duration-300 bg-white border border-orange-200 text-[#3D1A00] hover:bg-orange-50"
                  >
                    {totalPages}
                  </button>
                </>
              )}
            </div>

            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-full font-semibold text-sm transition-all duration-300 ${
                currentPage === totalPages
                  ? 'bg-orange-50 text-[#A8998A] cursor-not-allowed'
                  : 'bg-white border border-orange-200 text-[#3D1A00] hover:bg-orange-50'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {isDetailsModalOpen && selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#3D1A00]/60 backdrop-blur-sm p-4"
          onClick={() => setIsDetailsModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto border border-orange-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-orange-100 px-6 py-4 flex justify-between items-center rounded-t-3xl z-10">
              <h3 className="text-lg font-bold text-[#3D1A00]">Order Details</h3>
              <button onClick={() => setIsDetailsModalOpen(false)} className="text-[#A8998A] hover:text-[#3D1A00] text-2xl">&times;</button>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-[#A8998A] uppercase tracking-widest font-semibold mb-1">Order Number</p>
                  <p className="text-sm font-mono text-orange-600 font-semibold break-all">
                    {selectedOrder.orderNumber || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#A8998A] uppercase tracking-widest font-semibold mb-1">Order Date</p>
                  <p className="text-sm text-[#3D1A00]">
                    {new Date(selectedOrder.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#A8998A] uppercase tracking-widest font-semibold mb-1">Payment</p>
                  <p className="text-sm text-[#3D1A00] uppercase font-semibold">{selectedOrder.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-xs text-[#A8998A] uppercase tracking-widest font-semibold mb-1">Payment Status</p>
                  <p className="text-sm capitalize text-[#3D1A00] font-semibold">{selectedOrder.paymentStatus}</p>
                </div>
              </div>

              <div className="bg-[#FFF4E6] rounded-2xl p-4 border border-orange-100">
                <h4 className="text-sm font-bold text-[#3D1A00] mb-3 uppercase tracking-widest">Customer Information</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-[#A8998A] uppercase tracking-widest font-semibold mb-1">Name</p>
                    <p className="text-sm text-[#3D1A00] font-medium">
                      {selectedOrder.shippingAddress?.fullName || selectedOrder.userId?.name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#A8998A] uppercase tracking-widest font-semibold mb-1">Email</p>
                    <p className="text-sm text-[#3D1A00] font-medium break-all">
                      {selectedOrder.shippingAddress?.email || selectedOrder.userId?.email}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-[#A8998A] uppercase tracking-widest font-semibold mb-1">Phone</p>
                    <p className="text-sm text-[#3D1A00] font-medium">{selectedOrder.shippingAddress?.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-[#A8998A] uppercase tracking-widest font-semibold mb-1">Address</p>
                    <p className="text-sm text-[#3D1A00] font-medium">
                      {selectedOrder.shippingAddress?.address}, {selectedOrder.shippingAddress?.city}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold text-[#3D1A00] mb-3 uppercase tracking-widest">
                  Products ({selectedOrder.items?.length} items)
                </h4>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-[#FFF4E6] rounded-2xl border border-orange-100">
                      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden border border-orange-100">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs text-orange-400 font-semibold">N/A</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-[#3D1A00] font-semibold">{item.name}</p>
                        <p className="text-xs text-[#7A6A5A]">
                          Qty: {item.quantity} × रु {item.price?.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-orange-600">
                          रु {(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-orange-100 text-right">
                  <p className="text-[#3D1A00] text-sm">
                    Total: <span className="text-xl font-bold text-orange-600">रु {selectedOrder.totalAmount?.toLocaleString()}</span>
                  </p>
                </div>
              </div>

              {selectedOrder.statusHistory?.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-[#3D1A00] mb-3 uppercase tracking-widest">Status History</h4>
                  <div className="space-y-2">
                    {selectedOrder.statusHistory.map((history, idx) => (
                      <div key={idx} className="flex flex-wrap items-center gap-2 text-xs">
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                        <p className="text-[#3D1A00] capitalize font-semibold">{history.status}</p>
                        <p className="text-[#A8998A] text-xs">{new Date(history.updatedAt).toLocaleString()}</p>
                        {history.comment && <p className="text-[#7A6A5A] text-xs">— {history.comment}</p>}
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#3D1A00]/60 backdrop-blur-sm p-4"
          onClick={() => setIsStatusModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md mx-4 border border-orange-100 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#3D1A00] px-6 py-4">
              <h3 className="text-lg font-bold text-white">Update Order Status</h3>
              <p className="text-[#D4C4B0] text-xs mt-1 break-all">
                Order: {selectedOrder.orderNumber || selectedOrder._id?.slice(-8)}
              </p>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-[#3D1A00] mb-3 uppercase tracking-widest">Select Status</label>
                <div className="grid grid-cols-2 gap-3">
                  {statusOptions.map((status) => (
                    <button
                      key={status.value}
                      onClick={() => setNewStatus(status.value)}
                      className={`p-3 rounded-2xl border-2 transition-all duration-200 flex items-center gap-2 text-sm ${
                        newStatus === status.value
                          ? `${status.color} border-current shadow-md`
                          : 'bg-cream border-orange-100 text-[#7A6A5A] hover:bg-orange-50'
                      }`}
                    >
                      <span className="font-semibold">{status.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#3D1A00] mb-2 uppercase tracking-widest">Comment (optional)</label>
                <input
                  type="text"
                  value={statusComment}
                  onChange={(e) => setStatusComment(e.target.value)}
                  placeholder="Add a note about this update..."
                  className="w-full px-4 py-2.5 bg-cream border border-orange-100 rounded-2xl text-[#3D1A00] placeholder-[#A8998A] text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                />
              </div>

              <div className="bg-[#FFF4E6] rounded-2xl p-3 border border-orange-100">
                <p className="text-xs text-[#A8998A] uppercase tracking-widest font-semibold mb-1">Current Status</p>
                <p className="text-sm text-[#3D1A00] font-semibold">
                  {getStatusLabel(selectedOrder.orderStatus)}
                </p>
              </div>
            </div>

            <div className="border-t border-orange-100 px-6 py-4 flex gap-3 bg-cream">
              <button
                onClick={() => setIsStatusModalOpen(false)}
                className="flex-1 px-4 py-2.5 bg-white border border-orange-200 text-[#3D1A00] rounded-full hover:bg-orange-50 transition-colors text-sm font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmStatusUpdate}
                disabled={!newStatus}
                className="flex-1 px-4 py-2.5 bg-orange-600 text-white rounded-full hover:bg-orange-700 transition-all disabled:opacity-50 text-sm font-bold shadow-lg shadow-orange-500/20"
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