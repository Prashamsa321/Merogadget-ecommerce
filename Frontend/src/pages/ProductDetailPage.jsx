import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { productService } from '../services/productService'
import { useCart } from '../hooks/useCart'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const ProductDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)
  const { addToCart } = useCart()
  const { user } = useAuth()

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await productService.getProductById(id)
        setProduct(data)
      } catch (error) {
        toast.error('Product not found')
        navigate('/products')
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [id, navigate])

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Please login to add items to cart')
      navigate('/login')
      return
    }
    await addToCart(product._id, qty)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-orange-500 border-t-transparent"></div>
          <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-amber-300 border-t-transparent animate-pulse opacity-50"></div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-3xl p-10 border border-orange-100 shadow-soft max-w-md w-full">
          <div className="w-20 h-20 mx-auto mb-5 bg-red-50 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-[#3D1A00] text-xl font-bold mb-4">Product not found</p>
          <button
            onClick={() => navigate('/products')}
            className="px-6 py-3 bg-orange-600 text-white rounded-full font-semibold hover:bg-orange-700 transition-all"
          >
            Back to Products
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream py-10">
      <div className="container mx-auto max-w-6xl">

        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm flex-wrap">
          <button
            onClick={() => navigate('/')}
            className="text-[#7A6A5A] hover:text-orange-600 transition-colors font-medium"
          >
            Home
          </button>
          <svg className="w-4 h-4 text-[#A8998A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
          <button
            onClick={() => navigate('/products')}
            className="text-[#7A6A5A] hover:text-orange-600 transition-colors font-medium"
          >
            Products
          </button>
          <svg className="w-4 h-4 text-[#A8998A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-[#3D1A00] font-semibold truncate">{product.name}</span>
        </div>

        {/* Product Card */}
        <div className="bg-white rounded-3xl overflow-hidden border border-orange-100 shadow-soft hover:shadow-hover transition-all duration-500">
          <div className="md:flex">

            {/* Product Image */}
            <div className="md:w-1/2 bg-[#FFF4E6] p-8 flex items-center justify-center border-b md:border-b-0 md:border-r border-orange-100">
              <div className="relative group w-full">
                <img
                  src={product.image || 'https://via.placeholder.com/600'}
                  alt={product.name}
                  className="w-full max-w-md mx-auto object-cover rounded-2xl shadow-card group-hover:scale-105 transition-transform duration-500"
                />
                {/* Stock Badge */}
                {product.countInStock > 0 ? (
                  <div className="absolute top-4 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                    In Stock
                  </div>
                ) : (
                  <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                    Out of Stock
                  </div>
                )}
              </div>
            </div>

            {/* Product Details */}
            <div className="p-8 md:w-1/2">

              {/* Category Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-50 border border-orange-100 rounded-full mb-4">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                </span>
                <span className="text-orange-600 text-xs font-bold uppercase tracking-widest">
                  {product.category}
                </span>
              </div>

              {/* Name */}
              <h1 className="text-3xl md:text-4xl font-bold text-[#3D1A00] mb-4 leading-tight">
                {product.name}
              </h1>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-4xl md:text-5xl font-bold text-orange-600">
                  रु{product.price}
                </span>
                {product.originalPrice && (
                  <span className="text-lg text-[#A8998A] line-through">
                    रु{product.originalPrice}
                  </span>
                )}
                {product.discount && (
                  <span className="bg-green-50 text-green-700 text-sm font-bold px-2.5 py-1 rounded-full border border-green-100">
                    {product.discount}% OFF
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-[#3D1A00] font-bold mb-3 text-sm uppercase tracking-widest flex items-center gap-2">
                  Product Description
                </h3>
                <p className="text-[#5C4B3A] leading-relaxed">{product.description}</p>
              </div>

              {/* Stock Info */}
              <div className="mb-6 p-4 bg-[#FFF4E6] rounded-2xl border border-orange-100">
                <div className="flex items-center justify-between">
                  <span className="text-[#7A6A5A] text-sm font-medium">Availability:</span>
                  {product.countInStock > 0 ? (
                    <span className="text-green-700 font-bold text-sm flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      {product.countInStock} units in stock
                    </span>
                  ) : (
                    <span className="text-red-600 font-bold text-sm">Out of Stock</span>
                  )}
                </div>
              </div>

              {/* Quantity */}
              {product.countInStock > 0 && (
                <div className="mb-6">
                  <label className="text-[#3D1A00] font-bold text-sm uppercase tracking-widest mb-3 block">
                    Quantity
                  </label>
                  <div className="flex items-center gap-3 flex-wrap">
                    <button
                      onClick={() => setQty(Math.max(1, qty - 1))}
                      className="w-11 h-11 rounded-full bg-cream border border-orange-200 text-[#3D1A00] hover:bg-orange-600 hover:text-white hover:border-orange-600 transition-all duration-300 flex items-center justify-center text-xl font-bold"
                    >
                      −
                    </button>
                    <div className="relative">
                      <select
                        value={qty}
                        onChange={(e) => setQty(Number(e.target.value))}
                        className="px-6 py-3 bg-cream text-[#3D1A00] rounded-full border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent cursor-pointer appearance-none pr-10 font-semibold"
                      >
                        {[...Array(Math.min(product.countInStock, 10))].map((_, i) => (
                          <option key={i + 1} value={i + 1}>{i + 1}</option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg className="w-4 h-4 text-[#7A6A5A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    <button
                      onClick={() => setQty(Math.min(product.countInStock, qty + 1))}
                      className="w-11 h-11 rounded-full bg-cream border border-orange-200 text-[#3D1A00] hover:bg-orange-600 hover:text-white hover:border-orange-600 transition-all duration-300 flex items-center justify-center text-xl font-bold"
                    >
                      +
                    </button>
                    <span className="text-[#7A6A5A] text-sm ml-1">
                      Max {Math.min(product.countInStock, 10)}
                    </span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={handleAddToCart}
                  disabled={product.countInStock === 0}
                  className="w-full bg-orange-600 text-white py-4 rounded-full font-bold hover:bg-orange-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  {product.countInStock === 0 ? 'Out of Stock' : 'Add to Cart'}
                </button>

                <button
                  onClick={() => navigate('/products')}
                  className="w-full bg-cream border border-orange-200 text-[#3D1A00] py-3.5 rounded-full font-bold hover:bg-orange-50 transition-all duration-300 flex items-center justify-center gap-2 group"
                >
                  <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Continue Shopping
                </button>
              </div>

              {/* Features */}
              <div className="mt-8 pt-6 border-t border-orange-100">
                <h3 className="text-[#3D1A00] font-bold text-sm uppercase tracking-widest mb-4 flex items-center gap-2">
                  Why choose this product?
                </h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-[#5C4B3A]">
                    <span className="text-green-600 font-bold">✓</span> Premium Quality
                  </div>
                  <div className="flex items-center gap-2 text-[#5C4B3A]">
                    <span className="text-green-600 font-bold">✓</span> 1 Year Warranty
                  </div>
                  <div className="flex items-center gap-2 text-[#5C4B3A]">
                    <span className="text-green-600 font-bold">✓</span> Free Shipping
                  </div>
                  <div className="flex items-center gap-2 text-[#5C4B3A]">
                    <span className="text-green-600 font-bold">✓</span> Secure Payment
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetailPage