import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/Modal';
import { brandService } from '../../services/brandService';
import { Plus } from 'lucide-react';

const BrandsPage = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newBrandName, setNewBrandName] = useState('');
  const [editingBrand, setEditingBrand] = useState(null);
  const [editName, setEditName] = useState('');
  const { success, error } = useToast();

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState(null);

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const data = await brandService.getAllBrands();
      setBrands(data);
      setTotalPages(Math.ceil(data.length / itemsPerPage));
      setCurrentPage(1);
    } catch (err) {
      console.error('Fetch brands error:', err);
      error('Failed to load brands');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBrand = async () => {
    if (!newBrandName.trim()) {
      error('Please enter brand name');
      return;
    }

    try {
      await brandService.createBrand({
        name: newBrandName
      });

      success('Brand added successfully');
      setNewBrandName('');
      fetchBrands();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to add brand');
    }
  };

  const handleEditBrand = (brand) => {
    setEditingBrand(brand);
    setEditName(brand.name);
  };

  const handleUpdateBrand = async () => {
    if (!editName.trim()) {
      error('Brand name cannot be empty');
      return;
    }

    try {
      await brandService.updateBrand(editingBrand._id, {
        name: editName
      });

      success('Brand updated successfully');
      setEditingBrand(null);
      fetchBrands();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update brand');
    }
  };

  const handleCancelEdit = () => {
    setEditingBrand(null);
    setEditName('');
  };

  const openDeleteModal = (brand) => {
    setBrandToDelete(brand);
    setDeleteModalOpen(true);
  };

  const handleDeleteBrand = async () => {
    if (brandToDelete) {
      try {
        await brandService.deleteBrand(brandToDelete._id);
        success('Brand deleted successfully');
        setDeleteModalOpen(false);
        setBrandToDelete(null);
        fetchBrands();
      } catch (err) {
        error(err.response?.data?.message || 'Failed to delete brand');
      }
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBrands = brands.slice(indexOfFirstItem, indexOfLastItem);

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

      {/* Header + Add Brand */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex-shrink-0 text-center md:text-left">
          <p className="eyebrow mb-1 text-xs">Catalog</p>
          <h1 className="text-xl md:text-2xl font-bold text-[#3D1A00]">Brands</h1>
          <p className="text-xs text-[#7A6A5A] mt-0.5">Total: <span className="font-bold text-[#3D1A00]">{brands.length}</span> brands</p>
        </div>

        <div className="w-full md:w-auto flex flex-col sm:flex-row items-center gap-3 bg-white rounded-2xl p-3 border border-orange-100 shadow-soft">
          <div className="w-full sm:w-64 md:w-72 relative">
            <input
              type="text"
              value={newBrandName}
              onChange={(e) => setNewBrandName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddBrand()}
              placeholder="Enter brand name"
              className="w-full px-4 py-2 bg-cream border border-orange-100 rounded-full text-sm text-[#3D1A00] placeholder-[#A8998A] focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            />
          </div>

          <button
            onClick={handleAddBrand}
            className="flex-shrink-0 bg-orange-600 text-white px-5 py-2 rounded-full font-bold text-sm hover:bg-orange-700 transition-all duration-300 flex items-center gap-2 shadow-lg shadow-orange-500/20 whitespace-nowrap w-full sm:w-auto justify-center"
          >
            <Plus className="w-4 h-4" strokeWidth={2.5} />
            Add Brand
          </button>
        </div>
      </div>

      {/* Brands Table */}
      <div className="bg-white rounded-2xl shadow-soft overflow-hidden border border-orange-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-orange-100">
            <thead className="bg-[#FFF4E6]">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-orange-700 uppercase tracking-widest">Brand Name</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-orange-700 uppercase tracking-widest">Products</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-orange-700 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-orange-50">
              {currentBrands.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-6 py-12 text-center text-[#7A6A5A]">
                    <p className="font-semibold text-[#3D1A00]">No brands found</p>
                    <p className="text-sm mt-1">Click "Add Brand" to create your first brand</p>
                  </td>
                </tr>
              ) : (
                currentBrands.map((brand) => (
                  <tr key={brand._id} className="hover:bg-orange-50/50 transition-colors">
                    {editingBrand?._id === brand._id ? (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleUpdateBrand()}
                            className="px-3 py-2 bg-cream border border-orange-100 rounded-xl text-[#3D1A00] focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-[#7A6A5A]">{brand.productCount || 0}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={handleUpdateBrand}
                              className="text-green-600 hover:text-green-700 transition-colors p-2 rounded-full hover:bg-green-50"
                              title="Save"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="text-[#7A6A5A] hover:text-[#3D1A00] transition-colors p-2 rounded-full hover:bg-orange-50"
                              title="Cancel"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-semibold text-[#3D1A00]">{brand.name}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-50 text-orange-700 text-xs font-semibold rounded-full border border-orange-100">
                            {brand.productCount || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditBrand(brand)}
                              className="text-blue-600 hover:text-blue-700 transition-colors p-2 rounded-full hover:bg-blue-50"
                              title="Edit Brand"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => openDeleteModal(brand)}
                              className="text-red-500 hover:text-red-600 transition-colors p-2 rounded-full hover:bg-red-50"
                              title="Delete Brand"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </>
                    )}
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
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, brands.length)} of {brands.length} brands
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={goToPrevPage}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-full font-semibold text-sm transition-all duration-300 ${currentPage === 1
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
                    className={`w-10 h-10 rounded-full font-semibold transition-all duration-300 ${currentPage === pageNum
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
              className={`px-4 py-2 rounded-full font-semibold text-sm transition-all duration-300 ${currentPage === totalPages
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
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteBrand}
        title="Delete Brand"
        message={`Are you sure you want to delete "${brandToDelete?.name}" brand? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default BrandsPage;