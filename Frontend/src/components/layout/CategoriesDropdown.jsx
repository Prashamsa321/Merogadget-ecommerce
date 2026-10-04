import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { categoryService } from '../../services/categoryService';

const CategoriesDropdown = () => {
  const [categories, setCategories] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await categoryService.getAllCategories();
      setCategories(data);
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
        className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 hover:scale-105 flex items-center gap-1"
        style={{
          color: 'var(--text-secondary)',
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = 'var(--text-primary)'
          e.currentTarget.style.backgroundColor = 'var(--hover-bg)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = 'var(--text-secondary)'
          e.currentTarget.style.backgroundColor = 'transparent'
        }}
      >
        Categories
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 rounded-2xl shadow-hover py-2 z-50 border border-orange-100 bg-white animate-scale-in overflow-hidden">

          {/* Header */}
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
            <div className="max-h-80 overflow-y-auto">
              {categories.map((category) => (
                <Link
                  key={category._id}
                  to={`/products?category=${encodeURIComponent(category.name)}`}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-200 hover:bg-orange-50 hover:pl-5 text-[#3D1A00] hover:text-orange-600"
                >
                  <span className="text-lg">{category.icon || '📦'}</span>
                  <span className="flex-1 font-medium">{category.name}</span>
                  <span className="text-xs opacity-40 group-hover:opacity-100 transition-opacity">→</span>
                </Link>
              ))}
            </div>
          )}

          {/* View All */}
          <div className="border-t border-orange-100 px-2 py-2">
            <Link
              to="/products"
              onClick={() => setIsOpen(false)}
              className="flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-bold rounded-full transition-all duration-200 bg-orange-600 text-white hover:bg-orange-700"
            >
              <span>🛍️</span>
              View All Products
            </Link>
          </div>
        </div>
      )}

      <style>{`
        .overflow-y-auto::-webkit-scrollbar {
          width: 4px;
        }
        .overflow-y-auto::-webkit-scrollbar-track {
          background: #F5EDE0;
          border-radius: 4px;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #F15A29;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
};

export default CategoriesDropdown;