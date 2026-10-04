import React, { useEffect, useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const ProductModal = ({ isOpen, onClose, product }) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { success, error } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setQuantity(1);
      setCurrentImage(0);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleAddToCart = async () => {
    if (user?.role === 'admin') {
      error('Admin users cannot add items to cart');
      return;
    }

    const result = await addToCart(product._id, quantity);

    if (result.success) {
      success(`${quantity}x ${product.name} added to cart!`);
      onClose();
    } else if (result.notAuthenticated) {
      error(result.error || 'Please login to add items to cart');
    } else if (result.alreadyInCart) {
      error(result.message || 'Item already in cart');
    } else if (result.error) {
      error(result.error);
    }
  };

  const images = product.images?.filter(img => img) || [];
  const hasImages = images.length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#3D1A00]/70 backdrop-blur-md animate-fade-in p-4"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-orange-100 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-orange-100 px-6 md:px-8 py-5 flex justify-between items-center rounded-t-3xl z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-orange-50 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-lg md:text-xl font-bold text-[#3D1A00]">Product Details</h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#A8998A] hover:text-[#3D1A00] transition-all duration-300 text-2xl w-10 h-10 flex items-center justify-center rounded-full hover:bg-orange-50 hover:scale-110"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* Left — Images */}
            <div>
              <div className="bg-[#FFF4E6] rounded-2xl h-80 flex items-center justify-center overflow-hidden mb-4 border border-orange-100 group">
                {hasImages ? (
                  <img
                    src={images[currentImage]}
                    alt={product.name}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="text-8xl opacity-30">📦</div>
                )}
              </div>

              {hasImages && images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImage(index)}
                      className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all duration-300 flex-shrink-0 ${
                        currentImage === index
                          ? 'border-orange-500 ring-2 ring-orange-500/30 shadow-lg shadow-orange-500/20'
                          : 'border-orange-100 hover:border-orange-300'
                      }`}
                    >
                      <img src={img} alt={`View ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right — Info */}
            <div>
              {/* Name */}
              <h3 className="text-2xl font-bold text-[#3D1A00] mb-2 leading-tight">
                {product.name}
              </h3>

              {/* Category Badge */}
              {product.category && (
                <div className="mb-4">
                  <span className="text-xs uppercase tracking-widest font-bold bg-orange-50 text-orange-600 px-3 py-1.5 rounded-full border border-orange-100">
                    {product.category}
                  </span>
                </div>
              )}

              {/* Price */}
              <div className="mb-4">
                <span className="text-3xl font-bold text-orange-600">
                  रु {product.price?.toFixed(2)}
                </span>
                {product.originalPrice && (
                  <span className="ml-2 text-sm text-[#A8998A] line-through">
                    रु{product.originalPrice.toFixed(2)}
                  </span>
                )}
              </div>

              {/* Stock Status */}
              <div className="mb-4">
                {product.stock > 0 ? (
                  <span className="text-sm font-semibold text-green-700 bg-green-50 px-4 py-1.5 rounded-full inline-flex items-center gap-2 border border-green-100">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    In Stock
                  </span>
                ) : (
                  <span className="text-sm font-semibold text-red-600 bg-red-50 px-4 py-1.5 rounded-full inline-flex items-center gap-2 border border-red-100">
                    Out of Stock
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="mb-6">
                <h4 className="font-bold text-[#3D1A00] mb-3 flex items-center gap-2 text-sm uppercase tracking-widest">
                  Description
                </h4>
                <p className="text-[#5C4B3A] leading-relaxed text-sm">
                  {product.description}
                </p>
              </div>

              {/* Quantity */}
              {user?.role !== 'admin' && product.stock > 0 && (
                <div className="mb-6 text-center p-4 bg-[#FFF4E6] rounded-2xl border border-orange-100">
                  <label className="block text-xs font-bold text-[#3D1A00] uppercase tracking-widest mb-3">
                    Select Quantity
                  </label>
                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-12 h-12 bg-white border border-orange-200 rounded-full hover:bg-orange-600 hover:text-white hover:border-orange-600 transition-all duration-300 text-[#3D1A00] text-xl flex items-center justify-center font-bold"
                    >
                      −
                    </button>
                    <span className="w-16 text-center text-2xl font-bold text-[#3D1A00]">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="w-12 h-12 bg-white border border-orange-200 rounded-full hover:bg-orange-600 hover:text-white hover:border-orange-600 transition-all duration-300 text-[#3D1A00] text-xl flex items-center justify-center font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3">
                {user?.role !== 'admin' && product.stock > 0 && (
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 bg-orange-600 text-white py-4 rounded-full font-bold hover:bg-orange-700 transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                    Add to Cart ({quantity})
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="flex-1 bg-cream border border-orange-200 text-[#3D1A00] py-4 rounded-full font-bold hover:bg-orange-50 transition-all duration-300 active:scale-95"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scale-up {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in { animation: fade-in 0.2s ease-out; }
        .animate-scale-up { animation: scale-up 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
      `}</style>
    </div>
  );
};

export default ProductModal;