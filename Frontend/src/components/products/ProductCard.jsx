import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Package } from 'lucide-react';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { success, error, info } = useToast();
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

  const handleView = () => {
    navigate(`/product/${product._id}`);
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden border border-orange-100 hover:border-orange-300 hover:shadow-lg transition-all duration-300 group flex flex-col h-full">

      <div
        onClick={handleView}
        className="h-40 sm:h-44 bg-orange-50 flex items-center justify-center overflow-hidden relative cursor-pointer"
      >
        {product.category && (
          <div className="absolute top-2 left-2 z-10 bg-orange-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide shadow-md">
            {product.category}
          </div>
        )}

        {product.images && product.images[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex items-center justify-center opacity-40 group-hover:scale-110 transition-transform duration-500">
            <Package className="w-12 h-12 text-orange-400" strokeWidth={1.5} />
          </div>
        )}

        {product.stock === 0 && (
          <div className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-sm text-red-600 text-[10px] px-2 py-0.5 rounded-full font-semibold border border-red-200">
            Out of Stock
          </div>
        )}
      </div>

      <div className="p-3 flex flex-col flex-grow">
        <h3
          onClick={handleView}
          className="font-bold text-[#3D1A00] text-sm sm:text-base leading-snug group-hover:text-orange-600 transition-colors line-clamp-1 mb-1.5 cursor-pointer"
        >
          {product.name}
        </h3>

        {product.description && (
          <p className="text-xs text-[#7A6A5A] leading-relaxed line-clamp-2 mb-2">
            {product.description}
          </p>
        )}

        <div className='flex'>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-lg font-bold text-orange-600">
              रु {product.price?.toFixed(0)}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-[#A8998A] line-through">
                रु {product.originalPrice.toFixed(0)}
              </span>
            )}
          </div>

          <div className="mb-2.5 ml-10">
            {product.stock > 0 ? (
              <span className="text-[10px] text-green-700 bg-green-50 px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide">
                Available
              </span>
            ) : (
              <span className="text-[10px] text-red-700 bg-red-50 px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide">
                Out of Stock
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-1.5 mt-auto">
          <button
            onClick={handleView}
            className="flex-1 bg-white text-[#3D1A00] border border-orange-200 text-[11px] py-2 rounded-full hover:bg-orange-50 transition-all font-semibold"
          >
            View
          </button>

          {!isAdmin && (
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0 || isAdding}
              className={`flex-1 text-white text-[11px] py-2 rounded-full font-semibold transition-all
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
  );
};

export default ProductCard;