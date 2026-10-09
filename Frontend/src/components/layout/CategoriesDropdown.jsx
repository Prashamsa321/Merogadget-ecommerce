import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../../services/productService';
import { ShoppingBag, ChevronDown, ArrowRight, Tag } from 'lucide-react';

const CategoriesDropdown = () => {
  const [categories, setCategories] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchCategoriesFromProducts();
  }, []);

  const fetchCategoriesFromProducts = async () => {
    setLoading(true);
    try {
      // Fetch all products and derive unique categories
      const products = await productService.getAllProducts();
      const productsArray = Array.isArray(products) ? products : [];

      // Build a map of category -> product count
      const categoryMap = new Map();
      productsArray.forEach((p) => {
        const cat = p.category?.trim();
        if (cat) {
          categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);
        }
      });

      // Convert to array, sorted alphabetically, with count
      const categoriesList = Array.from(categoryMap.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => a.name.localeCompare(b.name));

      setCategories(categoriesList);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 hover:scale-105 flex items-center gap-1 text-[#6B6258] hover:text-[#3D1A00] hover:bg-orange-50"
      >
        Categories
        <ChevronDown
          className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          strokeWidth={2}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 rounded-2xl shadow-xl py-2 z-50 border border-orange-100 bg-white animate-scale-in overflow-hidden">

          <div className="px-4 py-3 border-b border-orange-100 bg-[#FFF4E6]">
            <span className="text-xs font-bold uppercase tracking-widest text-orange-600">
              Shop by Category
            </span>
          </div>

          {loading ? (
            <div className="px-4 py-8 text-center">
              <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-orange-500 border-t-transparent"></div>
              <p className="text-xs mt-2 text-[#7A6A5A]">Loading...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-[#7A6A5A]">No categories available</p>
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto category-scroll">
              {categories.map((category) => (
                <Link
                  key={category.name}
                  to={`/products?category=${encodeURIComponent(category.name)}`}
                  onClick={() => setIsOpen(false)}
                  className="group flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-200 hover:bg-orange-50 text-[#3D1A00] hover:text-orange-600"
                >
                  <Tag className="w-4 h-4 text-orange-500 shrink-0" strokeWidth={2} />
                  <span className="flex-1 font-medium truncate">{category.name}</span>
                  <span className="text-[10px] font-bold text-[#A8998A] group-hover:text-orange-500 transition-colors">
                    {category.count}
                  </span>
                  <ArrowRight
                    className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 text-orange-500"
                    strokeWidth={2.5}
                  />
                </Link>
              ))}
            </div>
          )}

          <div className="border-t border-orange-100 px-2 py-2">
            <Link
              to="/products"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-bold rounded-full transition-all duration-200 bg-orange-600 text-white hover:bg-orange-700"
            >
              <ShoppingBag className="w-4 h-4" />
              View All Products
            </Link>
          </div>
        </div>
      )}

      <style>{`
        .category-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .category-scroll::-webkit-scrollbar-track {
          background: #F5EDE0;
          border-radius: 4px;
        }
        .category-scroll::-webkit-scrollbar-thumb {
          background: #F15A29;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
};

export default CategoriesDropdown;