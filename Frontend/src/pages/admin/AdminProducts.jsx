import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../../services/productService';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/Modal';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { success, error } = useToast();

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getAllProducts();
      const productsArray = Array.isArray(data) ? data : [];
      setProducts(productsArray);
      setTotalPages(Math.ceil(productsArray.length / itemsPerPage));
      setCurrentPage(1);
    } catch (err) {
      error('Failed to fetch products');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    setTotalPages(Math.ceil(filteredProducts.length / itemsPerPage));
    setCurrentPage(1);
  }, [searchTerm, filteredProducts.length]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const openDeleteModal = (product) => {
    setProductToDelete(product);
    setModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (productToDelete) {
      try {
        await productService.deleteProduct(productToDelete._id);
        success('Product deleted successfully');
        fetchProducts();
      } catch (err) {
        error('Failed to delete product');
      } finally {
        setModalOpen(false);
        setProductToDelete(null);
      }
    }
  };

  const handleCancelDelete = () => {
    setModalOpen(false);
    setProductToDelete(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-orange-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <p className="eyebrow mb-1">Catalog</p>
          <h1 className="text-2xl md:text-3xl font-bold text-[#3D1A00]">Products Management</h1>
          <p className="text-[#7A6A5A] mt-1 text-sm">Manage your product inventory</p>
        </div>
        <Link
          to="/admin/products/create"
          className="bg-orange-600 text-white px-5 py-3 rounded-full font-bold hover:bg-orange-700 transition-all duration-300 flex items-center gap-2 shadow-lg shadow-orange-500/20"
        >
          <span className="text-xl">+</span> Add New Product
        </Link>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl shadow-soft p-5 border border-orange-100">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search products by name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2.5 pl-10 bg-cream border border-orange-100 rounded-full text-[#3D1A00] placeholder-[#A8998A] focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            />
            <span className="absolute left-3.5 top-3 text-[#A8998A]">🔍</span>
          </div>
          <div className="text-sm text-[#7A6A5A] flex items-center">
            Total: <span className="text-[#3D1A00] font-bold ml-1 mr-1">{filteredProducts.length}</span> products
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-soft overflow-hidden border border-orange-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-orange-100">
            <thead className="bg-[#FFF4E6]">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-orange-700 uppercase tracking-widest">Product</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-orange-700 uppercase tracking-widest">Category</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-orange-700 uppercase tracking-widest">Price</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-orange-700 uppercase tracking-widest">Stock</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-orange-700 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-orange-50">
              {currentProducts.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-[#7A6A5A]">
                    <div className="text-5xl mb-2">📦</div>
                    <p>No products found</p>
                    {searchTerm && (
                      <button
                        onClick={() => setSearchTerm('')}
                        className="mt-2 text-orange-600 hover:text-orange-700 transition-colors font-semibold"
                      >
                        Clear search
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                currentProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-orange-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center overflow-hidden border border-orange-100">
                          {product.images?.[0] ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-orange-300 text-xl">📦</span>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#3D1A00]">
                            {product.name?.substring(0, 30)}
                          </p>
                          <p className="text-xs text-[#A8998A] truncate max-w-xs">
                            {product.description?.substring(0, 50)}...
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 text-xs font-semibold bg-orange-50 text-orange-700 rounded-full border border-orange-100">
                        {product.category || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-orange-600">
                        रु {product.price?.toLocaleString('en-IN') || '0'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.stock > 0 ? (
                        <span className="text-xs font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-100">
                          {product.stock} in stock
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-red-600 bg-red-50 px-2.5 py-1 rounded-full border border-red-100">
                          Out of stock
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/admin/products/${product._id}/edit`}
                          className="text-blue-600 hover:text-blue-700 transition-colors p-2 rounded-full hover:bg-blue-50"
                          title="Edit Product"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => openDeleteModal(product)}
                          className="text-red-500 hover:text-red-600 transition-colors p-2 rounded-full hover:bg-red-50"
                          title="Delete Product"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-[#7A6A5A]">
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredProducts.length)} of {filteredProducts.length} products
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={goToPrevPage}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-full font-semibold text-sm transition-all duration-300 ${
                currentPage === 1
                  ? 'bg-orange-50 text-[#A8998A] cursor-not-allowed'
                  : 'bg-white border border-orange-200 text-[#3D1A00] hover:bg-orange-50'
              }`}
            >
              Previous
            </button>

            <div className="flex gap-1.5">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    className={`w-10 h-10 rounded-full font-semibold transition-all duration-300 ${
                      currentPage === pageNum
                        ? 'bg-orange-600 text-white shadow-lg shadow-orange-500/30'
                        : 'bg-white border border-orange-200 text-[#3D1A00] hover:bg-orange-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              {totalPages > 5 && currentPage < totalPages - 2 && (
                <>
                  <span className="px-2 py-2 text-[#A8998A]">...</span>
                  <button
                    onClick={() => goToPage(totalPages)}
                    className="w-10 h-10 rounded-full font-semibold transition-all duration-300 bg-white border border-orange-200 text-[#3D1A00] hover:bg-orange-50"
                  >
                    {totalPages}
                  </button>
                </>
              )}
            </div>

            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-full font-semibold text-sm transition-all duration-300 ${
                currentPage === totalPages
                  ? 'bg-orange-50 text-[#A8998A] cursor-not-allowed'
                  : 'bg-white border border-orange-200 text-[#3D1A00] hover:bg-orange-50'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${productToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default AdminProducts;