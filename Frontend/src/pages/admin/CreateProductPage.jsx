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

  // ✅ For file uploads
  const [imageMode, setImageMode] = useState('url'); // 'url' | 'upload'

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

      // If existing image is base64 data URL → set upload mode
      if (product.images?.[0]?.startsWith('data:')) {
        setImageMode('upload');
      }
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

  // ✅ Handle file upload → convert to base64
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      error('Image must be less than 2MB');
      return;
    }

    // Check type
    if (!file.type.startsWith('image/')) {
      error('File must be an image');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      // reader.result = "data:image/jpeg;base64,...."
      setFormData(prev => ({
        ...prev,
        images: [reader.result]
      }));
    };
    reader.readAsDataURL(file);
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
                  {category.name}
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

        {/* ═══ Product Image — URL or Upload ═══ */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-bold text-[#3D1A00]">
              Product Image
            </label>

            {/* Mode toggle */}
            <div className="inline-flex rounded-full bg-cream border border-orange-100 p-0.5">
              <button
                type="button"
                onClick={() => setImageMode('url')}
                className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                  imageMode === 'url'
                    ? 'bg-orange-600 text-white shadow-sm'
                    : 'text-[#7A6A5A] hover:text-[#3D1A00]'
                }`}
              >
                Image URL
              </button>
              <button
                type="button"
                onClick={() => setImageMode('upload')}
                className={`px-3 py-1 text-xs font-semibold rounded-full transition-all ${
                  imageMode === 'upload'
                    ? 'bg-orange-600 text-white shadow-sm'
                    : 'text-[#7A6A5A] hover:text-[#3D1A00]'
                }`}
              >
                Upload from Device
              </button>
            </div>
          </div>

          {/* URL mode — multiple URLs */}
          {imageMode === 'url' && (
            <div>
              {formData.images.map((image, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="url"
                    value={image.startsWith('data:') ? '' : image}
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
                className="mt-1 text-sm text-orange-600 hover:text-orange-700 transition-colors font-semibold"
              >
                + Add Another Image URL
              </button>
              <p className="text-xs text-[#A8998A] mt-2">
                Enter image URLs (e.g., https://example.com/image.jpg)
              </p>
            </div>
          )}

          {/* Upload mode — single file */}
          {imageMode === 'upload' && (
            <div>
              <label
                htmlFor="image-upload"
                className="flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-orange-200 rounded-2xl bg-cream hover:bg-orange-50 hover:border-orange-400 transition-all cursor-pointer group"
              >
                <div className="w-14 h-14 rounded-full bg-orange-100 group-hover:bg-orange-200 flex items-center justify-center transition-all">
                  <svg className="w-7 h-7 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-[#3D1A00]">
                    Click to upload image
                  </p>
                  <p className="text-xs text-[#7A6A5A] mt-1">
                    PNG, JPG, WEBP — max 2MB
                  </p>
                </div>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <p className="text-xs text-[#A8998A] mt-2">
                Image will be stored as base64 in the database
              </p>
            </div>
          )}

          {/* Preview — works for both URL and upload */}
          {formData.images[0] && (
            <div className="mt-4 flex items-start gap-4 p-3 bg-cream rounded-2xl border border-orange-100">
              <img
                src={formData.images[0]}
                alt="Preview"
                className="w-24 h-24 object-cover rounded-xl border border-orange-100"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs text-[#A8998A] uppercase tracking-widest font-semibold mb-1">
                  Preview
                </p>
                <p className="text-sm text-[#3D1A00] font-medium">
                  {imageMode === 'upload' ? 'Uploaded image' : 'Image from URL'}
                </p>
                {formData.images[0].startsWith('data:') && (
                  <span className="inline-block mt-2 text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
                    Base64 · {(formData.images[0].length / 1024).toFixed(0)} KB
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, images: [''] }))}
                className="text-red-500 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors"
                title="Remove image"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          )}
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