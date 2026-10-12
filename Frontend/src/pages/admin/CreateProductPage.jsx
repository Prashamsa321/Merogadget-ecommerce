import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import { brandService } from '../../services/brandService';
import { uploadService } from '../../services/uploadService';

const CreateProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { success, error } = useToast();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [uploading, setUploading] = useState(false);
  const isEditMode = !!id;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    brand: '',
    stock: '',
    images: ['']
  });

  const [imageMode, setImageMode] = useState('url');

  useEffect(() => {
    fetchCategories();
    fetchBrands();
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

  const fetchBrands = async () => {
    try {
      setLoadingBrands(true);
      const data = await brandService.getAllBrands();
      setBrands(data);
    } catch (err) {
      console.error('Error fetching brands:', err);
      error('Failed to load brands');
    } finally {
      setLoadingBrands(false);
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
        brand: product.brand || '',
        stock: product.stock || '',
        images: product.images && product.images.length > 0 ? product.images : ['']
      });

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

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      error('Image must be less than 10MB');
      e.target.value = '';
      return;
    }

    if (!file.type.startsWith('image/')) {
      error('File must be an image');
      e.target.value = '';
      return;
    }

    try {
      setUploading(true);
      const result = await uploadService.uploadImage(file, 'merogadget/products');
      setFormData(prev => ({
        ...prev,
        images: [result.url]
      }));
      success('Image uploaded successfully');
    } catch (err) {
      console.error('Upload error:', err);
      error(err.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
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
        brand: formData.brand,
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

  if (fetching || loadingCategories || loadingBrands) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-orange-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">

      {/* Header */}
      <div className="mb-6 flex items-start gap-3">
        <button
          type="button"
          onClick={() => navigate('/admin/products')}
          className="px-3 py-1.5 rounded-full bg-white border border-orange-200 text-[#3D1A00] hover:bg-orange-50 transition-colors text-sm font-semibold"
          title="Back to products"
        >
          ← Back
        </button>
        <div className="flex-1">
          <p className="eyebrow mb-1 text-xs">
            {isEditMode ? 'Edit mode' : 'New product'}
          </p>
          <h1 className="text-xl md:text-2xl font-bold text-[#3D1A00]">
            {isEditMode ? 'Edit Product' : 'Create New Product'}
          </h1>
          <p className="text-[#7A6A5A] mt-0.5 text-xs">
            {isEditMode ? 'Update your product information' : 'Add a new product to your store'}
          </p>
        </div>
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
            className="w-full px-4 py-3 bg-cream border border-orange-100 rounded-2xl text-[#3D1A00] placeholder-[#A8998A] focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
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
            className="w-full px-4 py-3 bg-cream border border-orange-100 rounded-2xl text-[#3D1A00] placeholder-[#A8998A] focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none transition-all"
            placeholder="Enter product description"
            required
          />
        </div>

        {/* Price and Stock */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-[#3D1A00] mb-2">
              Price <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-600 font-bold text-sm">रु</span>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                step="1"
                min="0"
                className="w-full pl-10 pr-4 py-3 bg-cream border border-orange-100 rounded-2xl text-[#3D1A00] placeholder-[#A8998A] focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
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
              className="w-full px-4 py-3 bg-cream border border-orange-100 rounded-2xl text-[#3D1A00] placeholder-[#A8998A] focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
              placeholder="0"
            />
          </div>
        </div>

        {/* Category + Brand */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Category */}
          <div>
            <label className="block text-sm font-bold text-[#3D1A00] mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-cream border border-orange-100 rounded-2xl text-[#3D1A00] focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent cursor-pointer transition-all"
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

          {/* Brand */}
          <div>
            <label className="block text-sm font-bold text-[#3D1A00] mb-2">
              Brand
            </label>
            <select
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-cream border border-orange-100 rounded-2xl text-[#3D1A00] focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent cursor-pointer transition-all"
            >
              <option value="">Select a brand (optional)</option>
              {brands.map((brand) => (
                <option key={brand._id} value={brand.name}>
                  {brand.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-[#A8998A] mt-2">
              Leave empty if the brand isn't listed. Add brands in the Brands page.
            </p>
          </div>
        </div>

        {/* Product Image */}
        <div>
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <label className="block text-sm font-bold text-[#3D1A00]">
              Product Image
            </label>

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
                Upload
              </button>
            </div>
          </div>

          {imageMode === 'url' && (
            <div>
              {formData.images.map((image, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <input
                    type="url"
                    value={image.startsWith('data:') ? '' : image}
                    onChange={(e) => handleImageChange(index, e.target.value)}
                    className="flex-1 px-4 py-3 bg-cream border border-orange-100 rounded-2xl text-[#3D1A00] placeholder-[#A8998A] focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                    placeholder={`Image URL ${index + 1}`}
                  />
                  {formData.images.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeImageField(index)}
                      className="px-4 py-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition-colors font-semibold text-sm"
                      title="Remove"
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
                + Add Another Image URL
              </button>
              <p className="text-xs text-[#A8998A] mt-2">
                Enter image URLs (e.g., https://example.com/image.jpg)
              </p>
            </div>
          )}

          {imageMode === 'upload' && (
            <div>
              <label
                htmlFor="image-upload"
                className={`flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed border-orange-200 rounded-2xl bg-cream transition-all cursor-pointer group ${
                  uploading ? 'opacity-60 cursor-wait' : 'hover:bg-orange-50 hover:border-orange-400'
                }`}
              >
                <div className="w-14 h-14 rounded-full bg-orange-100 group-hover:bg-orange-200 flex items-center justify-center transition-all text-orange-600 text-2xl font-bold">
                  {uploading ? (
                    <div className="w-6 h-6 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    '↑'
                  )}
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-[#3D1A00]">
                    {uploading ? 'Uploading to Cloudinary...' : 'Click to upload image'}
                  </p>
                  <p className="text-xs text-[#7A6A5A] mt-1">
                    PNG, JPG, WEBP — max 10MB
                  </p>
                </div>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>

              <p className="text-xs text-[#A8998A] mt-2">
                Image will be uploaded to Cloudinary CDN
              </p>
            </div>
          )}

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
                {formData.images[0].includes('cloudinary.com') && (
                  <span className="inline-block mt-2 text-[10px] bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-semibold">
                    Cloudinary CDN
                  </span>
                )}
                {formData.images[0].startsWith('data:') && (
                  <span className="inline-block mt-2 text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-semibold">
                    Base64 · {(formData.images[0].length / 1024).toFixed(0)} KB
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, images: [''] }))}
                className="text-red-500 hover:text-red-600 px-3 py-2 rounded-full hover:bg-red-50 transition-colors text-xs font-semibold"
                title="Remove image"
              >
                Remove
              </button>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-orange-100">
          <button
            type="submit"
            disabled={loading || categories.length === 0 || uploading}
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