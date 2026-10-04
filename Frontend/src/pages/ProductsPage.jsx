import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productService } from '../services/productService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ProductCard from '../components/products/ProductCard';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();

  const { user } = useAuth();
  const { error } = useToast();

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
      setCurrentPage(1);
      setSearchTerm('');
    }
  }, [searchParams]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getAllProducts();
      const productsArray = Array.isArray(data) ? data : [];
      setProducts(productsArray);
      const uniqueCategories = [...new Set(productsArray.map(p => p.category).filter(Boolean))];
      setCategories(uniqueCategories);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      error('Failed to load products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/categories');
      const data = await response.json();
      if (data.success && data.categories) {
        setCategories(data.categories.map(c => c.name));
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    const matchesSearch = !searchTerm ||
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    setTotalPages(Math.ceil(filteredProducts.length / itemsPerPage));
    setCurrentPage(1);
  }, [filteredProducts.length, itemsPerPage, selectedCategory, searchTerm]);

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearCategoryFilter = () => {
    setSelectedCategory('');
    setSearchParams({});
  };

  const isAdmin = user?.role === 'admin';

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream py-12">
      <div className="container mx-auto max-w-7xl">
        {/* Admin banner */}
        {isAdmin && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-8">
            <div className="flex items-center gap-3">
              <span className="text-2xl">👑</span>
              <div className="flex-1">
                <p className="text-[#3D1A00] font-semibold">Admin Mode</p>
                <p className="text-[#7A6A5A] text-sm">You are viewing as admin. Manage products from the Admin Dashboard.</p>
              </div>
              <a
                href="/admin/products"
                className="bg-orange-600 text-white px-4 py-2 rounded-full hover:bg-orange-700 transition-colors text-sm font-semibold"
              >
                Admin Panel →
              </a>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-10">
          <p className="eyebrow mb-2">Full catalog</p>
          <h1 className="text-4xl md:text-5xl font-bold text-[#3D1A00] mb-3">
            {selectedCategory ? `${selectedCategory}` : 'Choose your next upgrade.'}
          </h1>
          <p className="text-[#7A6A5A] max-w-2xl">
            Comforting technology, fresh new arrivals, and sweet deals made to brighten your day.
          </p>
        </div>

        {/* Search + Filter bar */}
        <div className="bg-white rounded-2xl p-5 mb-8 border border-orange-100 shadow-soft">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#3D1A00] uppercase tracking-widest mb-2">
                Search
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setSelectedCategory('');
                    setSearchParams({});
                  }}
                  className="w-full px-4 py-3 pl-10 bg-cream border border-orange-100 rounded-full text-[#3D1A00] placeholder-[#A8998A] focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A8998A]">🔍</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#3D1A00] uppercase tracking-widest mb-2">
                Category
              </label>
              <div className="flex gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    if (e.target.value) {
                      setSearchParams({ category: e.target.value });
                    } else {
                      setSearchParams({});
                    }
                    setSearchTerm('');
                    setCurrentPage(1);
                  }}
                  className="flex-1 px-4 py-3 bg-cream border border-orange-100 rounded-full text-[#3D1A00] focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                {selectedCategory && (
                  <button
                    onClick={clearCategoryFilter}
                    className="px-5 py-3 bg-[#3D1A00] text-white rounded-full hover:bg-orange-600 transition-colors font-semibold text-sm"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Results info */}
        {filteredProducts.length > 0 && !loading && (
          <p className="text-sm text-[#7A6A5A] mb-6">
            Showing <span className="font-semibold text-[#3D1A00]">{indexOfFirstItem + 1}–{Math.min(indexOfLastItem, filteredProducts.length)}</span> of <span className="font-semibold text-[#3D1A00]">{filteredProducts.length}</span> products
          </p>
        )}

        {/* Products grid */}
        {currentProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-orange-100">
            <p className="text-5xl mb-3">🔍</p>
            <p className="text-[#3D1A00] font-semibold text-lg mb-2">No products found</p>
            <p className="text-[#7A6A5A] mb-4">Try a different search or category</p>
            {(searchTerm || selectedCategory) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('');
                  setSearchParams({});
                }}
                className="bg-orange-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-orange-700 transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {currentProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <nav className="flex items-center gap-2">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-5 py-3 rounded-full transition-colors font-semibold text-sm ${
                      currentPage === 1
                        ? 'bg-orange-50 text-[#A8998A] cursor-not-allowed'
                        : 'bg-white border border-orange-200 text-[#3D1A00] hover:bg-orange-50'
                    }`}
                  >
                    Previous
                  </button>

                  <div className="flex gap-1.5">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(pageNum => {
                        if (pageNum === 1 || pageNum === totalPages) return true;
                        if (Math.abs(pageNum - currentPage) <= 1) return true;
                        return false;
                      })
                      .map((pageNum, index, array) => {
                        const prevPage = array[index - 1];
                        if (prevPage && pageNum - prevPage > 1) {
                          return (
                            <React.Fragment key={`ellipsis-${pageNum}`}>
                              <span className="px-3 py-3 text-[#A8998A]">...</span>
                              <button
                                onClick={() => goToPage(pageNum)}
                                className={`w-11 h-11 rounded-full font-semibold transition-colors ${
                                  currentPage === pageNum
                                    ? 'bg-orange-600 text-white'
                                    : 'bg-white border border-orange-200 text-[#3D1A00] hover:bg-orange-50'
                                }`}
                              >
                                {pageNum}
                              </button>
                            </React.Fragment>
                          );
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => goToPage(pageNum)}
                            className={`w-11 h-11 rounded-full font-semibold transition-colors ${
                              currentPage === pageNum
                                ? 'bg-orange-600 text-white'
                                : 'bg-white border border-orange-200 text-[#3D1A00] hover:bg-orange-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                  </div>

                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-5 py-3 rounded-full transition-colors font-semibold text-sm ${
                      currentPage === totalPages
                        ? 'bg-orange-50 text-[#A8998A] cursor-not-allowed'
                        : 'bg-white border border-orange-200 text-[#3D1A00] hover:bg-orange-50'
                    }`}
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;