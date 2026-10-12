import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { brandService } from '../services/brandService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ProductCard from '../components/products/ProductCard';
import { Search, SlidersHorizontal, X, Package, ChevronDown } from 'lucide-react';

const ProductsPage = () => {
  const { products, loading } = useProducts();
  const [brands, setBrands] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [sortBy, setSortBy] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const { user } = useAuth();
  const { error } = useToast();

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [totalPages, setTotalPages] = useState(1);

  // ─── Read URL params on mount & change ───
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    const brandParam = searchParams.get('brand');

    setSelectedCategories(categoryParam ? categoryParam.split(',').filter(Boolean) : []);
    setSelectedBrands(brandParam ? brandParam.split(',').filter(Boolean) : []);
    setCurrentPage(1);
  }, [searchParams]);

  // ─── Fetch brands only ───
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const brandsData = await brandService.getAllBrands();
        setBrands(Array.isArray(brandsData) ? brandsData : []);
      } catch (err) {
        console.error('Failed to fetch brands:', err);
        setBrands([]);
      }
    };
    fetchBrands();
  }, []);

  // ─── Derive category list from products (with counts) ───
  const categoriesWithCounts = useMemo(() => {
    const map = new Map();
    products.forEach(p => {
      const cat = p.category?.trim();
      if (cat) map.set(cat, (map.get(cat) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [products]);

  // ─── Filter products (multi-select) ───
  const filteredProducts = useMemo(() => {
    return [...products.filter(product => {
      const matchesCategory = selectedCategories.length === 0 ||
        (product.category && selectedCategories.some(c => c.toLowerCase() === product.category.toLowerCase()));

      const matchesBrand = selectedBrands.length === 0 ||
        (product.brand && selectedBrands.some(b => b.toLowerCase() === product.brand.toLowerCase()));

      const matchesSearch = !searchTerm ||
        product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesCategory && matchesBrand && matchesSearch;
    })].sort((a, b) => {
      if (sortBy === 'az') return (a.name || '').localeCompare(b.name || '');
      if (sortBy === 'za') return (b.name || '').localeCompare(a.name || '');
      if (sortBy === 'lowhigh') return (a.price || 0) - (b.price || 0);
      if (sortBy === 'highlow') return (b.price || 0) - (a.price || 0);
      return 0;
    });
  }, [products, selectedCategories, selectedBrands, searchTerm, sortBy]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    setTotalPages(Math.ceil(filteredProducts.length / itemsPerPage));
    setCurrentPage(1);
  }, [filteredProducts.length, itemsPerPage]);

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleCategory = (catName) => {
    const next = selectedCategories.includes(catName)
      ? selectedCategories.filter(c => c !== catName)
      : [...selectedCategories, catName];
    setSelectedCategories(next);
    updateUrl(next, selectedBrands);
  };

  const toggleBrand = (brandName) => {
    const next = selectedBrands.includes(brandName)
      ? selectedBrands.filter(b => b !== brandName)
      : [...selectedBrands, brandName];
    setSelectedBrands(next);
    updateUrl(selectedCategories, next);
  };

  const updateUrl = (cats, brandList) => {
    const params = {};
    if (cats.length > 0) params.category = cats.join(',');
    if (brandList.length > 0) params.brand = brandList.join(',');
    setSearchParams(params);
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSearchTerm('');
    setSortBy('');
    setSearchParams({});
    setCurrentPage(1);
  };

  const hasActiveFilters = selectedCategories.length > 0 || selectedBrands.length > 0 || searchTerm || sortBy;
  const isAdmin = user?.role === 'admin';

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-16 py-6">

        {isAdmin && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 mb-6">
            <div className="flex flex-wrap items-center gap-3">
              <Package className="w-6 h-6 text-orange-600" strokeWidth={2} />
              <div className="flex-1 min-w-[200px]">
                <p className="text-[#3D1A00] font-semibold text-sm">Admin Mode</p>
                <p className="text-[#7A6A5A] text-xs">You are viewing as admin. Manage products from the Admin Dashboard.</p>
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

        <div className="mb-6">
          <p className="eyebrow mb-1">Full catalog</p>
          <h1 className="text-2xl md:text-3xl font-bold text-[#3D1A00] mb-1">
            {selectedBrands.length === 1 ? `${selectedBrands[0]} Products`
              : selectedCategories.length === 1 ? `${selectedCategories[0]}`
                : 'Choose your next upgrade.'}
          </h1>
          <p className="text-[#7A6A5A] text-sm">
            Comforting technology, fresh arrivals, and sweet deals.
          </p>
        </div>

        <div className="mb-5 flex flex-col sm:flex-row gap-3 sm:justify-end">
          <div className="relative w-full sm:w-64 md:w-72 lg:w-80">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full px-6 py-3 pl-11 bg-white border border-orange-100 rounded-full text-sm text-[#3D1A00] placeholder-[#A8998A] focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent shadow-soft"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A8998A]" />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full hover:bg-orange-50 flex items-center justify-center text-[#A8998A]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden inline-flex items-center gap-2 px-5 py-3 bg-white border border-orange-100 rounded-full text-sm font-semibold text-[#3D1A00] hover:bg-orange-50 transition-colors shadow-soft"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-orange-600"></span>
              )}
            </button>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
                className="appearance-none pl-5 pr-11 py-3 bg-white border border-orange-100 rounded-full text-sm text-[#3D1A00] focus:outline-none cursor-pointer shadow-soft"
              >
                <option value="">Sort By</option>
                <option value="az">A → Z</option>
                <option value="za">Z → A</option>
                <option value="lowhigh">Price: Low to High</option>
                <option value="highlow">Price: High to Low</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#3D1A00] pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="lg:flex lg:gap-6">

          {/* Desktop Sidebar */}
          <aside className="hidden lg:block lg:w-64 xl:w-72 shrink-0">
            <div className="sticky top-24 space-y-4">

              {hasActiveFilters && (
                <div className="bg-white rounded-2xl border border-orange-100 p-4 shadow-soft">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold text-[#A8998A] uppercase tracking-widest">Active</p>
                    <button
                      onClick={clearAllFilters}
                      className="text-xs text-orange-600 hover:text-orange-700 font-semibold"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCategories.map(c => (
                      <button
                        key={c}
                        onClick={() => toggleCategory(c)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-50 text-orange-700 text-xs font-semibold rounded-full border border-orange-100 hover:bg-orange-100"
                      >
                        {c}
                        <X className="w-3 h-3" />
                      </button>
                    ))}
                    {selectedBrands.map(b => (
                      <button
                        key={b}
                        onClick={() => toggleBrand(b)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-50 text-orange-700 text-xs font-semibold rounded-full border border-orange-100 hover:bg-orange-100"
                      >
                        {b}
                        <X className="w-3 h-3" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-white rounded-2xl border border-orange-100 p-4 shadow-soft">
                <h3 className="text-sm font-bold text-[#3D1A00] mb-3">Category</h3>
                {categoriesWithCounts.length === 0 ? (
                  <p className="text-xs text-[#A8998A]">No categories</p>
                ) : (
                  <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                    {categoriesWithCounts.map(cat => (
                      <label
                        key={cat.name}
                        className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-orange-50 cursor-pointer transition-colors group"
                      >
                        <input
                          type="checkbox"
                          checked={selectedCategories.includes(cat.name)}
                          onChange={() => toggleCategory(cat.name)}
                          className="w-4 h-4 accent-orange-600 cursor-pointer"
                        />
                        <span className="flex-1 text-sm text-[#3D1A00] group-hover:text-orange-600 truncate">
                          {cat.name}
                        </span>
                        <span className="text-xs text-[#A8998A] font-semibold">
                          ({cat.count})
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl border border-orange-100 p-4 shadow-soft">
                <h3 className="text-sm font-bold text-[#3D1A00] mb-3">Brand</h3>
                {brands.length === 0 ? (
                  <p className="text-xs text-[#A8998A]">No brands</p>
                ) : (
                  <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                    {brands.map(brand => (
                      <label
                        key={brand._id}
                        className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-orange-50 cursor-pointer transition-colors group"
                      >
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes(brand.name)}
                          onChange={() => toggleBrand(brand.name)}
                          className="w-4 h-4 accent-orange-600 cursor-pointer"
                        />
                        <span className="flex-1 text-sm text-[#3D1A00] group-hover:text-orange-600 truncate">
                          {brand.name}
                        </span>
                        <span className="text-xs text-[#A8998A] font-semibold">
                          ({brand.productCount || 0})
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </aside>

          <div className="flex-1 min-w-0">

            {filteredProducts.length > 0 && (
              <p className="text-sm text-[#7A6A5A] mb-3">
                Showing <span className="font-semibold text-[#3D1A00]">{indexOfFirstItem + 1}–{Math.min(indexOfLastItem, filteredProducts.length)}</span> of <span className="font-semibold text-[#3D1A00]">{filteredProducts.length}</span> products
              </p>
            )}

            {currentProducts.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-orange-100">
                <Package className="w-16 h-16 text-orange-200 mx-auto mb-3" strokeWidth={1.5} />
                <p className="text-[#3D1A00] font-semibold text-lg mb-2">No products found</p>
                <p className="text-[#7A6A5A] mb-4 text-sm">Try adjusting your filters or search</p>
                {hasActiveFilters && (
                  <button
                    onClick={clearAllFilters}
                    className="bg-orange-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-orange-700 transition-colors text-sm"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                  {currentProducts.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-10 flex justify-center">
                    <nav className="flex items-center gap-2 flex-wrap justify-center">
                      <button
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`px-4 py-2 rounded-full transition-colors font-semibold text-sm ${currentPage === 1
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
                                    className={`w-10 h-10 rounded-full font-semibold text-sm transition-colors ${currentPage === pageNum
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
                                className={`w-10 h-10 rounded-full font-semibold text-sm transition-colors ${currentPage === pageNum
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
                        className={`px-4 py-2 rounded-full transition-colors font-semibold text-sm ${currentPage === totalPages
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
      </div>

      {/* Mobile filter drawer */}
      {isMobileFilterOpen && (
        <div
          className="fixed inset-0 z-[100] lg:hidden"
          onClick={() => setIsMobileFilterOpen(false)}
        >
          <div className="absolute inset-0 bg-[#3D1A00]/50 backdrop-blur-sm" />

          <div
            className="absolute right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-orange-100 px-5 py-4 flex justify-between items-center z-10">
              <h3 className="text-lg font-bold text-[#3D1A00]">Filters</h3>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="w-9 h-9 rounded-full hover:bg-orange-50 flex items-center justify-center text-[#3D1A00]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">

              {hasActiveFilters && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold text-[#A8998A] uppercase tracking-widest">Active</p>
                    <button
                      onClick={clearAllFilters}
                      className="text-xs text-orange-600 hover:text-orange-700 font-semibold"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCategories.map(c => (
                      <button
                        key={c}
                        onClick={() => toggleCategory(c)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-50 text-orange-700 text-xs font-semibold rounded-full border border-orange-100"
                      >
                        {c}
                        <X className="w-3 h-3" />
                      </button>
                    ))}
                    {selectedBrands.map(b => (
                      <button
                        key={b}
                        onClick={() => toggleBrand(b)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-50 text-orange-700 text-xs font-semibold rounded-full border border-orange-100"
                      >
                        {b}
                        <X className="w-3 h-3" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="border-t border-orange-100 pt-4">
                <h4 className="text-sm font-bold text-[#3D1A00] mb-3">Category</h4>
                <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                  {categoriesWithCounts.map(cat => (
                    <label
                      key={cat.name}
                      className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-orange-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat.name)}
                        onChange={() => toggleCategory(cat.name)}
                        className="w-4 h-4 accent-orange-600"
                      />
                      <span className="flex-1 text-sm text-[#3D1A00] truncate">{cat.name}</span>
                      <span className="text-xs text-[#A8998A] font-semibold">({cat.count})</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="border-t border-orange-100 pt-4">
                <h4 className="text-sm font-bold text-[#3D1A00] mb-3">Brand</h4>
                <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                  {brands.map(brand => (
                    <label
                      key={brand._id}
                      className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-orange-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(brand.name)}
                        onChange={() => toggleBrand(brand.name)}
                        className="w-4 h-4 accent-orange-600"
                      />
                      <span className="flex-1 text-sm text-[#3D1A00] truncate">{brand.name}</span>
                      <span className="text-xs text-[#A8998A] font-semibold">({brand.productCount || 0})</span>
                    </label>
                  ))}
                </div>
              </div>

            </div>

            <div className="sticky bottom-0 bg-white border-t border-orange-100 p-5 flex gap-3">
              <button
                onClick={clearAllFilters}
                className="flex-1 py-3 bg-cream border border-orange-200 text-[#3D1A00] rounded-full font-bold text-sm hover:bg-orange-50"
              >
                Clear
              </button>
              <button
                onClick={() => setIsMobileFilterOpen(false)}
                className="flex-1 py-3 bg-orange-600 text-white rounded-full font-bold text-sm hover:bg-orange-700 shadow-lg shadow-orange-500/20"
              >
                Show {filteredProducts.length}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;