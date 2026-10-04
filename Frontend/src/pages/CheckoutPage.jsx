import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  CreditCard,
  Wallet,
  Truck,
  Shield,
  CheckCircle,
  AlertCircle,
  Loader2,
  MapPin,
  ShoppingBag,
  Clock,
  User,
  Mail
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { success, error: toastError } = useToast();
  const { cartItems, getCartTotal, clearCart, loading: cartLoading } = useCart();

  const [paymentMethod, setPaymentMethod] = useState(null);
  const [showKhalti, setShowKhalti] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    district: '',
    zipCode: ''
  });

  const items = Array.isArray(cartItems) ? cartItems : [];
  const subtotal = getCartTotal();
  const shipping = subtotal > 1000 ? 0 : 100;
  const total = subtotal + shipping;
  const totalItems = items.reduce((sum, item) => sum + (item.quantity || 0), 0);

  useEffect(() => {
    if (!cartLoading && items.length === 0) {
      toastError('Your cart is empty');
      navigate('/cart');
    }
  }, [items.length, cartLoading, navigate, toastError]);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      }));
    }
  }, [user]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleKhaltiPayment = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { data } = await api.post('/payment/khalti', {
        shippingAddress: formData,
        items: items,
        totalAmount: total
      });

      if (data.payment_url) {
        sessionStorage.setItem('pendingOrderId', data.orderId);
        window.location.href = data.payment_url;
      } else {
        throw new Error(data.message || 'Payment initiation failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      toastError(
        error.response?.data?.message ||
        error.message ||
        'Payment initiation failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCashOnDelivery = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { data } = await api.post('/orders/cod', {
        shippingAddress: formData,
        items: items,
        totalAmount: total,
        subtotal: subtotal,
        shipping: shipping
      });

      if (data.success) {
        setOrderSuccess(true);
        success('Order placed successfully!');
        await clearCart();
        setTimeout(() => {
          navigate('/orders');
        }, 3000);
      } else {
        throw new Error(data.message || 'Failed to place order');
      }
    } catch (error) {
      console.error('COD order error:', error);
      toastError(
        error.response?.data?.message ||
        error.message ||
        'Failed to place order. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const required = ['fullName', 'phone', 'address', 'district'];
    for (let field of required) {
      if (!formData[field] || formData[field].trim() === '') {
        toastError(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
        return false;
      }
    }
    if (formData.phone.length < 10) {
      toastError('Please enter a valid phone number (minimum 10 digits)');
      return false;
    }
    return true;
  };

  if (cartLoading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-[#7A6A5A]">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center border border-orange-100 shadow-soft">
          <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-12 h-12 text-orange-400" />
          </div>
          <h2 className="text-2xl font-bold text-[#3D1A00] mb-2">Your cart is empty</h2>
          <p className="text-[#7A6A5A] mb-6">Add some items to your cart before checking out</p>
          <button
            onClick={() => navigate('/products')}
            className="w-full bg-orange-600 text-white py-3 rounded-full font-semibold hover:bg-orange-700 transition-all"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center border border-orange-100 shadow-soft animate-scale-in">
          <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-[#3D1A00] mb-2">Order placed 🎉</h2>
          <p className="text-[#7A6A5A] mb-4">Your order has been confirmed successfully.</p>
          <div className="bg-orange-50 rounded-2xl p-4 mb-6">
            <p className="text-sm text-orange-700 font-medium">Redirecting to your orders...</p>
            <div className="w-full bg-orange-200 h-1 mt-2 rounded-full overflow-hidden">
              <div className="bg-orange-600 h-full rounded-full animate-progress"></div>
            </div>
          </div>
          <button
            onClick={() => navigate('/orders')}
            className="w-full bg-orange-600 text-white py-3 rounded-full font-semibold hover:bg-orange-700 transition-all"
          >
            View Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream py-10">
      <div className="container mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/cart')}
            className="flex items-center gap-2 text-[#7A6A5A] hover:text-orange-600 transition-colors group mb-6 text-sm font-medium"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span>Back to Cart</span>
          </button>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p className="eyebrow mb-2">Almost there</p>
              <h1 className="text-4xl md:text-5xl font-bold text-[#3D1A00]">
                Checkout
              </h1>
            </div>
            <div className="flex items-center gap-2 text-sm text-[#7A6A5A] bg-white border border-orange-100 px-4 py-2 rounded-full">
              <Shield size={16} className="text-green-600" />
              <span>Secure checkout</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Information */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-orange-100 shadow-soft">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-orange-50 rounded-2xl">
                  <MapPin className="w-5 h-5 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold text-[#3D1A00]">Delivery information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-[#3D1A00] mb-2">Full name *</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A8998A]">
                      <User size={18} />
                    </div>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      readOnly
                      className="w-full pl-11 pr-24 py-3 bg-orange-50/50 border border-orange-100 rounded-2xl text-[#3D1A00] cursor-not-allowed"
                      placeholder="John Doe"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-semibold uppercase tracking-wide">Verified</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#3D1A00] mb-2">Email *</label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A8998A]">
                      <Mail size={18} />
                    </div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      readOnly
                      className="w-full pl-11 pr-24 py-3 bg-orange-50/50 border border-orange-100 rounded-2xl text-[#3D1A00] cursor-not-allowed"
                      placeholder="john@example.com"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <span className="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold uppercase tracking-wide">Verified</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#3D1A00] mb-2">Phone number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-cream border border-orange-100 rounded-2xl text-[#3D1A00] placeholder-[#A8998A] focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                    placeholder="9800000000"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#3D1A00] mb-2">District *</label>
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-cream border border-orange-100 rounded-2xl text-[#3D1A00] placeholder-[#A8998A] focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                    placeholder="Kathmandu"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-[#3D1A00] mb-2">Delivery address *</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-cream border border-orange-100 rounded-2xl text-[#3D1A00] placeholder-[#A8998A] focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                    placeholder="House no., Street, Landmark"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-3xl p-6 md:p-8 border border-orange-100 shadow-soft">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-blue-50 rounded-2xl">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-[#3D1A00]">Payment method</h3>
              </div>

              {!showKhalti ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => {
                      setPaymentMethod('khalti');
                      setShowKhalti(true);
                    }}
                    className="group relative p-6 bg-cream border border-orange-100 rounded-2xl hover:border-orange-400 hover:shadow-card transition-all text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Wallet className="w-7 h-7 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-[#3D1A00]">Khalti</h4>
                        <p className="text-sm text-[#7A6A5A]">Pay with Khalti Wallet</p>
                      </div>
                    </div>
                    <div className="absolute top-3 right-3 text-[10px] bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-semibold uppercase tracking-wide">
                      Popular
                    </div>
                  </button>

                  <button
                    onClick={handleCashOnDelivery}
                    disabled={loading}
                    className="group relative p-6 bg-cream border border-orange-100 rounded-2xl hover:border-orange-400 hover:shadow-card transition-all text-left disabled:opacity-50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Truck className="w-7 h-7 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-[#3D1A00]">Cash on Delivery</h4>
                        <p className="text-sm text-[#7A6A5A]">Pay when you receive</p>
                      </div>
                    </div>
                    {loading && (
                      <div className="absolute inset-0 bg-white/80 rounded-2xl flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                      </div>
                    )}
                  </button>
                </div>
              ) : (
                <div className="animate-slide-in">
                  <button
                    onClick={() => setShowKhalti(false)}
                    className="text-[#7A6A5A] hover:text-orange-600 mb-6 flex items-center gap-2 transition-colors text-sm font-medium"
                  >
                    ← Back to payment methods
                  </button>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 mb-6 border border-purple-100">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-soft">
                        <Wallet className="w-8 h-8 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-bold text-[#3D1A00] text-lg">Khalti payment</h4>
                        <p className="text-sm text-[#7A6A5A]">Secure payment via Khalti wallet</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-2xl p-4 mb-6 flex items-start gap-3 border border-blue-100">
                    <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-700">
                      You will be redirected to Khalti's secure payment page to complete your transaction.
                    </p>
                  </div>

                  <button
                    onClick={handleKhaltiPayment}
                    disabled={loading}
                    className="w-full bg-orange-600 text-white py-4 rounded-2xl font-bold hover:bg-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Wallet size={20} />
                        Pay with Khalti
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl p-6 border border-orange-100 shadow-soft sticky top-24">
              <h3 className="text-xl font-bold text-[#3D1A00] mb-6">Order summary</h3>

              <div className="space-y-4 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                {items.map((item, index) => {
                  const itemId = item.productId || item._id;
                  const quantity = item.quantity || 1;
                  const price = item.price || 0;

                  return (
                    <div key={itemId || index} className="flex gap-3 items-start">
                      <img
                        src={item.image || '/placeholder.jpg'}
                        alt={item.name || 'Product'}
                        className="w-14 h-14 object-cover rounded-xl flex-shrink-0 border border-orange-100"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[#3D1A00] text-sm truncate">{item.name || 'Product'}</p>
                        <p className="text-xs text-[#7A6A5A]">Qty: {quantity}</p>
                        <p className="text-xs text-[#A8998A]">रु{price.toFixed(2)} each</p>
                      </div>
                      <p className="font-semibold text-[#3D1A00] whitespace-nowrap text-sm">
                        रु{(price * quantity).toFixed(2)}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-orange-100 mt-5 pt-4 space-y-2.5">
                <div className="flex justify-between text-[#7A6A5A] text-sm">
                  <span>Subtotal ({totalItems} items)</span>
                  <span className="text-[#3D1A00] font-medium">रु{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#7A6A5A] text-sm">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? 'text-green-600 font-semibold' : 'text-[#3D1A00] font-medium'}>
                    {shipping === 0 ? 'Free' : `रु${shipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-[#7A6A5A] text-sm">
                  <span>Tax</span>
                  <span className="text-[#3D1A00] font-medium">रु0.00</span>
                </div>
                <div className="border-t border-orange-100 pt-4 mt-3">
                  <div className="flex justify-between items-baseline">
                    <span className="text-[#3D1A00] font-semibold">Total</span>
                    <span className="text-2xl font-bold text-orange-600">रु{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {shipping === 0 && (
                <div className="mt-4 p-3 bg-green-50 rounded-2xl flex items-center gap-2 border border-green-100">
                  <Truck className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-700 font-medium">Free delivery!</span>
                </div>
              )}

              <div className="mt-6 p-4 bg-cream rounded-2xl border border-orange-100">
                <div className="flex items-center gap-2 text-sm text-[#7A6A5A]">
                  <Shield size={16} className="text-green-600" />
                  <span>Secure and encrypted payment</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-[#7A6A5A] mt-2">
                  <Clock size={16} className="text-blue-600" />
                  <span>Estimated delivery: 3–5 business days</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.9); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes slide-in {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes progress {
          from { width: 0%; }
          to   { width: 100%; }
        }
        .animate-scale-in { animation: scale-in 0.5s ease-out; }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }
        .animate-progress { animation: progress 3s linear forwards; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #F5EDE0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #F15A29; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #C2410C; }
      `}</style>
    </div>
  );
};

export default CheckoutPage;