import React, { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import ProductModal from '../ProductModal';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { success, error, info } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const isAdmin = user?.role === 'admin';

  const handleAddToCart = async () => {
    if (isAdmin) {
      error('Admin users cannot add items to cart');
      return;
    }
    setIsAdding(true);
    const result = await addToCart(product._id, 1);
    setIsAdding(false);

    if (result.success) success(`${product.name} added to cart!`);
    else if (result.notAuthenticated) error(result.error || 'Please login to add items to cart');
    else if (result.alreadyInCart) info(result.message || `${product.name} is already in your cart!`);
    else if (result.error) error(result.error);
  };

  return (
    <>
      <div className="bg-white rounded-2xl overflow-hidden border border-orange-100 hover:border-orange-300 hover:shadow-xl transition-all duration-300 group flex flex-col h-full">
        {/* Image */}
        <div className="aspect-square bg-orange-50 flex items-center justify-center overflow-hidden relative">
          {product.images && product.images[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="text-5xl opacity-30 group-hover:scale-110 transition-transform duration-500">📦</div>
          )}
          {product.stock === 0 && (
            <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-sm text-red-600 text-xs px-2.5 py-1 rounded-full font-semibold border border-red-200">
              Out of Stock
            </div>
          )}
        </div>

        <div className="p-4 flex flex-col flex-grow">
          {/* Category eyebrow */}
          {product.category && (
            <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest mb-1">
              {product.category}
            </p>
          )}

          {/* Name */}
          <h3 className="font-semibold text-[#3D1A00] text-sm line-clamp-2 group-hover:text-orange-600 transition-colors leading-snug mb-2">
            {product.name}
          </h3>

          {/* Price */}
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-lg font-bold text-[#3D1A00]">
              रु {product.price?.toFixed(2)}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-[#A8998A] line-through">
                रु {product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>

          {/* Stock */}
          <div className="mb-3">
            {product.stock > 0 ? (
              <span className="text-[10px] text-green-700 bg-green-50 px-2 py-1 rounded-full font-semibold uppercase tracking-wide">
                Available
              </span>
            ) : (
              <span className="text-[10px] text-red-700 bg-red-50 px-2 py-1 rounded-full font-semibold uppercase tracking-wide">
                Out of Stock
              </span>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-2 mt-auto">
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex-1 bg-white text-[#3D1A00] border border-orange-200 text-xs py-2 rounded-full hover:bg-orange-50 transition-all font-semibold"
            >
              View
            </button>

            {!isAdmin && (
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0 || isAdding}
                className={`flex-1 text-white text-xs py-2 rounded-full font-semibold transition-all
                  ${product.stock === 0 || isAdding
                    ? 'bg-orange-300 cursor-not-allowed'
                    : 'bg-orange-600 hover:bg-orange-700 hover:shadow-lg hover:shadow-orange-500/30'
                  }`}
              >
                {isAdding ? 'Adding...' : 'Add to cart'}
              </button>
            )}
          </div>
        </div>
      </div>

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={product}
      />
    </>
  );
};

export default ProductCard;