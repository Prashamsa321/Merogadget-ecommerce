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
  const [itemsPerPage] = useState(12);
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
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getAllProducts();
      const productsArray = Array.isArray(data) ? data : [];
      setProducts(productsArray);
      const uniqueCategories = [...new Set(productsArray.map(p => p.category).filter(Boolean))].sort();
      setCategories(uniqueCategories);
    } catch (err) {
      console.error('Failed to fetch products:', err);
      error('Failed to load products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesCategory = !selectedCategory ||
      (product.category && product.category.toLowerCase() === selectedCategory.toLowerCase());
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
    <div className="min-h-screen bg-cream py-6 px-4 sm:px-6 lg:px-10 xl:px-16">
      <div className="container mx-auto max-w-7xl">

        {/* Admin banner */}
        {isAdmin && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-6">
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

        <div className="mb-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

          {/* Left: heading */}
          <div className="shrink-0">
            <p className="eyebrow mb-1">Full catalog</p>
            <h1 className="text-2xl md:text-3xl font-bold text-[#3D1A00] mb-1">
              {selectedCategory ? `${selectedCategory}` : 'Choose your next upgrade.'}
            </h1>
            <p className="text-[#7A6A5A] text-sm">
              Comforting technology, fresh arrivals, and sweet deals.
            </p>
          </div>

          <div className="flex flex-col p-5 sm:flex-row gap-5 w-full lg:w-auto lg:max-w-2xl">

            {/* Search — with glow effect */}
            <div className="relative flex-1 min-w-0 sm:min-w-[220px]">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setSelectedCategory('');
                  setSearchParams({});
                }}
                className="w-full px-6 py-3 pl-11 bg-white border border-orange-100 rounded-full text-sm text-[#3D1A00] placeholder-[#A8998A] focus:outline-none transition-all duration-300
                  shadow-[0_0_0_3px_rgba(241,90,41,0.06),0_2px_8px_rgba(241,90,41,0.10)]
                  focus:border-orange-300
                  focus:shadow-[0_0_0_4px_rgba(241,90,41,0.15),0_0_20px_rgba(241,90,41,0.25)]"
              />
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A8998A] text-sm">🔍</span>
            </div>

            {/* Category — with custom arrow */}
            <div className="flex gap-2 shrink-0">
              <div className="relative">
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
                  className="appearance-none pl-5 pr-11 py-3 bg-white border border-orange-100 rounded-full text-sm text-[#3D1A00] focus:outline-none cursor-pointer transition-all duration-300
                    shadow-[0_0_0_3px_rgba(241,90,41,0.06),0_2px_8px_rgba(241,90,41,0.10)]
                    focus:border-orange-300
                    focus:shadow-[0_0_0_4px_rgba(241,90,41,0.15),0_0_20px_rgba(241,90,41,0.25)]"
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                {/* Custom dropdown arrow */}
                <svg
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3D1A00] pointer-events-none"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              {selectedCategory && (
                <button
                  onClick={clearCategoryFilter}
                  className="px-4 py-3 bg-[#3D1A00] text-white rounded-full hover:bg-orange-600 transition-colors font-semibold text-sm"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Results info */}
        {filteredProducts.length > 0 && !loading && (
          <p className="text-sm text-[#7A6A5A] mb-3">
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {currentProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-10 flex justify-center">
                <nav className="flex items-center gap-2">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-full transition-colors font-semibold text-sm ${
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
                              <span className="px-2 py-2 text-[#A8998A]">...</span>
                              <button
                                onClick={() => goToPage(pageNum)}
                                className={`w-10 h-10 rounded-full font-semibold text-sm transition-colors ${
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
                            className={`w-10 h-10 rounded-full font-semibold text-sm transition-colors ${
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
                    className={`px-4 py-2 rounded-full transition-colors font-semibold text-sm ${
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