import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useCart } from '../context/CartContext';

const CartPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { success, error: toastError } = useToast();
  const { cartItems, loading, removeFromCart, updateQuantity, getCartTotal } = useCart();

  const [modalOpen, setModalOpen] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);
  const [updatingItemId, setUpdatingItemId] = useState(null);

  useEffect(() => {
    if (user?.role === 'admin') {
      toastError('Admin users cannot access shopping cart');
      navigate('/admin');
    }
  }, [user, navigate, toastError]);

  const handleRemoveClick = (item) => {
    setItemToRemove(item);
    setModalOpen(true);
  };

  const handleConfirmRemove = async () => {
    if (itemToRemove) {
      setUpdatingItemId(itemToRemove.productId || itemToRemove._id);
      try {
        await removeFromCart(itemToRemove.productId || itemToRemove._id);
        success(`${itemToRemove.name} removed from cart`);
        setModalOpen(false);
        setItemToRemove(null);
      } catch (err) {
        toastError('Failed to remove item');
      } finally {
        setUpdatingItemId(null);
      }
    }
  };

  const handlecheckout = () => {
    navigate('/checkout');
  };

  const handleCancelRemove = () => {
    setModalOpen(false);
    setItemToRemove(null);
  };

  const handleUpdateQuantity = useCallback(async (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    setUpdatingItemId(itemId);
    try {
      await updateQuantity(itemId, newQuantity);
    } catch (err) {
      toastError('Failed to update quantity');
    } finally {
      setUpdatingItemId(null);
    }
  }, [updateQuantity, toastError]);

  const handleDecrease = (itemId, currentQuantity) => {
    if (currentQuantity > 1) {
      handleUpdateQuantity(itemId, currentQuantity - 1);
    } else {
      const item = items.find(i => (i.productId || i._id) === itemId);
      if (item) {
        handleRemoveClick(item);
      }
    }
  };

  const handleIncrease = (itemId, currentQuantity, maxStock = 999) => {
    if (currentQuantity < maxStock) {
      handleUpdateQuantity(itemId, currentQuantity + 1);
    }
  };

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && modalOpen) {
        handleCancelRemove();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [modalOpen]);

  if (user?.role === 'admin') return null;

  const items = Array.isArray(cartItems) ? cartItems : [];

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-cream py-16">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center py-20">
            <div className="text-7xl mb-6">🛒</div>
            <h1 className="text-4xl font-bold text-[#3D1A00] mb-4">Your cart is empty</h1>
            <p className="text-[#7A6A5A] mb-8">Looks like you haven't added anything yet.</p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-orange-600 text-white px-8 py-4 rounded-full font-semibold hover:bg-orange-700 transition-all duration-300 shadow-lg shadow-orange-500/30"
            >
              🛍️ Start Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream py-16">
      <div className="container mx-auto max-w-7xl">

        {/* Header */}
        <div className="mb-10">
          <p className="eyebrow mb-2">Your selection</p>
          <h1 className="text-4xl md:text-5xl font-bold text-[#3D1A00]">
            Shopping cart
          </h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items */}
          <div className="lg:w-2/3 space-y-4">
            {items.map((item) => {
              const itemId = item.productId || item._id;
              const isUpdating = updatingItemId === itemId;

              return (
                <div
                  key={itemId}
                  className="bg-white rounded-2xl p-6 border border-orange-100 hover:border-orange-300 transition-all duration-300"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                    {/* Product Image */}
                    <div className="w-24 h-24 bg-orange-50 rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-3xl">📦</span>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-[#3D1A00] text-lg leading-snug">
                        {item.name || 'Product'}
                      </h3>
                      <p className="text-[#7A6A5A] text-sm mt-1">
                        रु {(item.price || 0).toFixed(2)} each
                      </p>

                      {/* Quantity Controls */}
                      <div className="flex items-center gap-3 mt-4">
                        <button
                          onClick={() => handleDecrease(itemId, item.quantity || 1)}
                          disabled={isUpdating}
                          className="w-9 h-9 rounded-full bg-cream border border-orange-200 text-[#3D1A00] hover:bg-orange-600 hover:text-white hover:border-orange-600 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                        >
                          −
                        </button>
                        <span className="w-10 text-center text-[#3D1A00] font-semibold">
                          {isUpdating ? (
                            <svg className="animate-spin h-4 w-4 mx-auto" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                          ) : (
                            item.quantity || 0
                          )}
                        </span>
                        <button
                          onClick={() => handleIncrease(itemId, item.quantity || 1, 99)}
                          disabled={isUpdating}
                          className="w-9 h-9 rounded-full bg-cream border border-orange-200 text-[#3D1A00] hover:bg-orange-600 hover:text-white hover:border-orange-600 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Price & Remove */}
                    <div className="text-right sm:text-right w-full sm:w-auto">
                      <p className="text-xl font-bold text-[#3D1A00]">
                        रु {((item.price || 0) * (item.quantity || 0)).toFixed(2)}
                      </p>
                      <button
                        onClick={() => handleRemoveClick(item)}
                        disabled={isUpdating}
                        className="text-red-500 hover:text-red-600 transition-colors mt-2 text-sm font-medium disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-2xl p-6 border border-orange-100 sticky top-24">
              <h2 className="text-xl font-bold text-[#3D1A00] mb-6">Order summary</h2>

              <div className="space-y-3">
                <div className="flex justify-between text-[#7A6A5A] text-sm">
                  <span>Subtotal ({items.reduce((sum, item) => sum + (item.quantity || 0), 0)} items)</span>
                  <span className="text-[#3D1A00] font-medium">रु {getCartTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#7A6A5A] text-sm">
                  <span>Shipping</span>
                  <span className="text-green-600 font-semibold">Free</span>
                </div>
                <div className="border-t border-orange-100 pt-4 mt-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-[#3D1A00] font-semibold">Total</span>
                    <span className="text-2xl font-bold text-orange-600">
                      रु {getCartTotal().toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <button
                className="w-full bg-orange-600 text-white py-4 rounded-full font-bold hover:bg-orange-700 transition-all duration-300 shadow-lg shadow-orange-500/20 mt-6 active:scale-95"
                onClick={handlecheckout}
              >
                Proceed to Checkout →
              </button>

              <Link
                to="/products"
                className="block text-center mt-4 text-[#7A6A5A] hover:text-orange-600 transition-colors text-sm font-medium"
              >
                Continue shopping
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Remove Confirmation Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#3D1A00]/60 backdrop-blur-sm p-4"
          onClick={handleCancelRemove}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-orange-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-red-50 rounded-full flex items-center justify-center text-3xl">
                  🗑️
                </div>
                <h3 className="text-xl font-bold text-[#3D1A00] mb-2">Remove item?</h3>
                <p className="text-[#7A6A5A]">
                  Are you sure you want to remove <strong className="text-[#3D1A00]">"{itemToRemove?.name}"</strong> from your cart?
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCancelRemove}
                  className="flex-1 py-3 bg-cream border border-orange-100 text-[#3D1A00] rounded-full font-semibold hover:bg-orange-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmRemove}
                  className="flex-1 py-3 bg-red-500 text-white rounded-full font-semibold hover:bg-red-600 transition-all"
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;