import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';

const CreateProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    images: ['']
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const data = await categoryService.getAllCategories();
      setCategories(data);
    } catch (err) {
      console.error('Error fetching categories:', err);
      error('Failed to load categories');
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    if (isEditMode) {
      fetchProductData();
    }
  }, [id]);

  const fetchProductData = async () => {
    try {
      setFetching(true);
      const product = await productService.getProductById(id);

      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        category: product.category || '',
        stock: product.stock || '',
        images: product.images && product.images.length > 0 ? product.images : ['']
      });
    } catch (err) {
      console.error('Error fetching product:', err);
      error('Failed to load product data');
      navigate('/admin/products');
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (index, value) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData(prev => ({
      ...prev,
      images: newImages
    }));
  };

  const addImageField = () => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, '']
    }));
  };

  const removeImageField = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      images: newImages
    }));
  };

  const formatPriceDisplay = (value) => {
    if (!value) return '';
    return `रु ${parseFloat(value).toLocaleString('en-IN')}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      error('Product name is required');
      return;
    }
    if (!formData.description.trim()) {
      error('Product description is required');
      return;
    }
    if (!formData.price || formData.price <= 0) {
      error('Valid product price is required');
      return;
    }
    if (!formData.category.trim()) {
      error('Product category is required');
      return;
    }

    setLoading(true);

    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        stock: parseInt(formData.stock) || 0,
        images: formData.images.filter(img => img.trim() !== '')
      };

      if (isEditMode) {
        await productService.updateProduct(id, productData);
        success('Product updated successfully!');
      } else {
        await productService.createProduct(productData);
        success('Product created successfully!');
      }

      navigate('/admin/products');
    } catch (err) {
      console.error('Save product error:', err);
      error(err.response?.data?.message || `Failed to ${isEditMode ? 'update' : 'create'} product`);
    } finally {
      setLoading(false);
    }
  };

  if (fetching || loadingCategories) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-orange-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <p className="eyebrow mb-1">
          {isEditMode ? 'Edit mode' : 'New product'}
        </p>
        <h1 className="text-2xl md:text-3xl font-bold text-[#3D1A00]">
          {isEditMode ? 'Edit Product' : 'Create New Product'}
        </h1>
        <p className="text-[#7A6A5A] mt-1 text-sm">
          {isEditMode ? 'Update your product information' : 'Add a new product to your store'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-soft p-6 md:p-8 space-y-6 border border-orange-100">

        {/* Product Name */}
        <div>
          <label className="block text-sm font-bold text-[#3D1A00] mb-2">
            Product Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-cream border border-orange-100 rounded-2xl text-[#3D1A00] placeholder-[#A8998A] focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            placeholder="Enter product name"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-bold text-[#3D1A00] mb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            className="w-full px-4 py-3 bg-cream border border-orange-100 rounded-2xl text-[#3D1A00] placeholder-[#A8998A] focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none"
            placeholder="Enter product description"
            required
          />
        </div>

        {/* Price and Stock */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-[#3D1A00] mb-2">
              Price <span className="text-red-500">*</span> (NPR)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-600 font-bold">रु</span>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                step="1"
                min="0"
                className="w-full pl-10 pr-4 py-3 bg-cream border border-orange-100 rounded-2xl text-[#3D1A00] placeholder-[#A8998A] focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                placeholder="0"
                required
              />
            </div>
            {formData.price && (
              <p className="text-xs text-green-700 mt-2 font-semibold">
                {formatPriceDisplay(formData.price)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-[#3D1A00] mb-2">
              Stock Quantity
            </label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              min="0"
              className="w-full px-4 py-3 bg-cream border border-orange-100 rounded-2xl text-[#3D1A00] placeholder-[#A8998A] focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
              placeholder="0"
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-bold text-[#3D1A00] mb-2">
            Category <span className="text-red-500">*</span>
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-cream border border-orange-100 rounded-2xl text-[#3D1A00] focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent cursor-pointer"
            required
          >
            <option value="">Select a category</option>
            {categories.length === 0 ? (
              <option value="" disabled>No categories available. Please add categories first.</option>
            ) : (
              categories.map((category) => (
                <option key={category._id} value={category.name}>
                  {category.icon || '📦'} {category.name}
                </option>
              ))
            )}
          </select>
          {categories.length === 0 && (
            <p className="text-xs text-red-500 mt-2 font-medium">
              No categories found. Please add categories in the Categories page first.
            </p>
          )}
        </div>

        {/* Product Images */}
        <div>
          <label className="block text-sm font-bold text-[#3D1A00] mb-2">
            Product Images (URLs)
          </label>
          {formData.images.map((image, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="url"
                value={image}
                onChange={(e) => handleImageChange(index, e.target.value)}
                className="flex-1 px-4 py-3 bg-cream border border-orange-100 rounded-2xl text-[#3D1A00] placeholder-[#A8998A] focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                placeholder={`Image URL ${index + 1}`}
              />
              {formData.images.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeImageField(index)}
                  className="px-4 py-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition-colors font-semibold text-sm"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addImageField}
            className="mt-2 text-sm text-orange-600 hover:text-orange-700 transition-colors font-semibold"
          >
            + Add Another Image
          </button>
          <p className="text-xs text-[#A8998A] mt-2">
            Enter image URLs (e.g., https://example.com/image.jpg)
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-orange-100">
          <button
            type="submit"
            disabled={loading || categories.length === 0}
            className="flex-1 bg-orange-600 text-white py-3.5 rounded-full font-bold hover:bg-orange-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-orange-500/20"
          >
            {loading ? (isEditMode ? 'Updating...' : 'Creating...') : (isEditMode ? 'Update Product' : 'Create Product')}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="flex-1 bg-cream border border-orange-200 text-[#3D1A00] py-3.5 rounded-full font-bold hover:bg-orange-50 transition-all duration-300"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateProductPage;