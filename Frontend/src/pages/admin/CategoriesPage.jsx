import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import Modal from '../../components/Modal';
import { categoryService } from '../../services/categoryService';

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [editName, setEditName] = useState('');
  const { success, error } = useToast();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getAllCategories();
      setCategories(data);
    } catch (err) {
      console.error('Fetch categories error:', err);
      error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      error('Please enter category name');
      return;
    }

    try {
      await categoryService.createCategory({
        name: newCategoryName
      });

      success('Category added successfully');
      setNewCategoryName('');
      fetchCategories();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to add category');
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setEditName(category.name);
  };

  const handleUpdateCategory = async () => {
    if (!editName.trim()) {
      error('Category name cannot be empty');
      return;
    }

    try {
      await categoryService.updateCategory(editingCategory._id, {
        name: editName
      });

      success('Category updated successfully');
      setEditingCategory(null);
      fetchCategories();
    } catch (err) {
      error(err.response?.data?.message || 'Failed to update category');
    }
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setEditName('');
  };

  const openDeleteModal = (category) => {
    setCategoryToDelete(category);
    setDeleteModalOpen(true);
  };

  const handleDeleteCategory = async () => {
    if (categoryToDelete) {
      try {
        await categoryService.deleteCategory(categoryToDelete._id);
        success('Category deleted successfully');
        setDeleteModalOpen(false);
        setCategoryToDelete(null);
        fetchCategories();
      } catch (err) {
        error(err.response?.data?.message || 'Failed to delete category');
      }
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

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <p className="eyebrow mb-1">Catalog</p>
          <h1 className="text-2xl md:text-3xl font-bold text-[#3D1A00]">Categories</h1>
          <p className="text-[#7A6A5A] mt-1 text-sm">Manage your product categories</p>
        </div>
        <div className="text-sm text-[#7A6A5A]">
          Total: <span className="text-[#3D1A00] font-bold">{categories.length}</span> categories
        </div>
      </div>

      {/* Add Category */}
      <div className="bg-white rounded-2xl shadow-soft p-6 border border-orange-100">
        <h2 className="text-lg font-bold text-[#3D1A00] mb-4">Add New Category</h2>
        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            placeholder="Enter category name"
            className="flex-1 px-4 py-3 bg-cream border border-orange-100 rounded-full text-[#3D1A00] placeholder-[#A8998A] focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
          />
          <button
            onClick={handleAddCategory}
            className="bg-orange-600 text-white px-6 py-3 rounded-full font-bold hover:bg-orange-700 transition-all duration-300 flex items-center gap-2 shadow-lg shadow-orange-500/20"
          >
            <span className="text-lg">+</span> Add Category
          </button>
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-white rounded-2xl shadow-soft overflow-hidden border border-orange-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-orange-100">
            <thead className="bg-[#FFF4E6]">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-orange-700 uppercase tracking-widest">Category Name</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-orange-700 uppercase tracking-widest">Products</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-orange-700 uppercase tracking-widest">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-orange-50">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan="3" className="px-6 py-12 text-center text-[#7A6A5A]">
                    <p className="font-semibold text-[#3D1A00]">No categories found</p>
                    <p className="text-sm mt-1">Click "Add Category" to create your first category</p>
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category._id} className="hover:bg-orange-50/50 transition-colors">
                    {editingCategory?._id === category._id ? (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="px-3 py-2 bg-cream border border-orange-100 rounded-xl text-[#3D1A00] focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-[#7A6A5A]">{category.productCount || 0}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={handleUpdateCategory}
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
                          <span className="font-semibold text-[#3D1A00]">{category.name}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-50 text-orange-700 text-xs font-semibold rounded-full border border-orange-100">
                            {category.productCount || 0}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEditCategory(category)}
                              className="text-blue-600 hover:text-blue-700 transition-colors p-2 rounded-full hover:bg-blue-50"
                              title="Edit Category"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => openDeleteModal(category)}
                              className="text-red-500 hover:text-red-600 transition-colors p-2 rounded-full hover:bg-red-50"
                              title="Delete Category"
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

      {/* Delete Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteCategory}
        title="Delete Category"
        message={`Are you sure you want to delete "${categoryToDelete?.name}" category? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default CategoriesPage;