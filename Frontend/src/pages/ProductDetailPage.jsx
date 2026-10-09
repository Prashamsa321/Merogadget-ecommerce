import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { productService } from '../services/productService'
import { useCart } from '../hooks/useCart'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import toast from 'react-hot-toast'

const ProductDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const { addToCart } = useCart()
  const { user } = useAuth()
  const { success, error, info } = useToast()
  const isAdmin = user?.role === 'admin'

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
      error('Please login to add items to cart')
      navigate('/login')
      return
    }
    if (isAdmin) {
      error('Admin users cannot add items to cart')
      return
    }

    setIsAdding(true)
    const result = await addToCart(product._id, qty)
    setIsAdding(false)

    if (result.success) success(`${product.name} added to cart!`)
    else if (result.notAuthenticated) error(result.error || 'Please login to add items to cart')
    else if (result.alreadyInCart) info(result.message || `${product.name} is already in your cart!`)
    else if (result.error) error(result.error)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-4 py-12">
        <div className="text-center bg-white rounded-3xl p-8 border border-orange-100 shadow-soft max-w-md w-full">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-50 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-[#3D1A00] text-lg font-bold mb-4">Product not found</p>
          <button
            onClick={() => navigate('/products')}
            className="px-5 py-2.5 bg-orange-600 text-white rounded-full font-semibold hover:bg-orange-700 transition-all text-sm"
          >
            Back to Products
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream py-6 px-4 sm:px-6 lg:px-10 xl:px-16">
      <div className="container mx-auto max-w-5xl">

        {/* Breadcrumb */}
        <div className="mb-4 flex items-center gap-1.5 text-xs flex-wrap">
          <button
            onClick={() => navigate('/')}
            className="text-[#7A6A5A] hover:text-orange-600 transition-colors font-medium"
          >
            Home
          </button>
          <svg className="w-3 h-3 text-[#A8998A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
          <button
            onClick={() => navigate('/products')}
            className="text-[#7A6A5A] hover:text-orange-600 transition-colors font-medium"
          >
            Products
          </button>
          <svg className="w-3 h-3 text-[#A8998A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-[#3D1A00] font-semibold truncate">{product.name}</span>
        </div>

        {/* Main card */}
        <div className="bg-white rounded-2xl overflow-hidden border border-orange-100 shadow-soft">
          <div className="md:flex">

            {/* ─── Product Image (compact) ─── */}
            <div className="md:w-[45%] bg-gradient-to-br from-orange-50 to-amber-50 overflow-hidden border-b md:border-b-0 md:border-r border-orange-100 relative">
              <div className="relative group w-full h-full min-h-[280px] md:min-h-[400px]">
                <img
                  src={product.image || 'https://via.placeholder.com/600'}
                  alt={product.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              
              </div>
            </div>

            {/* ─── Product Details (compact) ─── */}
            <div className="p-5 md:w-[55%] flex flex-col">

              {/* Category Badge */}
              {product.category && (
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-orange-50 border border-orange-100 rounded-full mb-3 self-start">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-orange-500"></span>
                  </span>
                  <span className="text-orange-600 text-[10px] font-bold uppercase tracking-widest">
                    {product.category}
                  </span>
                </div>
              )}

              {/* Name */}
              <h1 className="text-xl md:text-2xl font-bold text-[#3D1A00] mb-2 leading-tight">
                {product.name}
              </h1>

              {/* Price */}
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-2xl md:text-3xl font-bold text-orange-600">
                  रु{product.price}
                </span>
                {product.originalPrice && (
                  <span className="text-sm text-[#A8998A] line-through">
                    रु{product.originalPrice}
                  </span>
                )}
                {product.discount && (
                  <span className="bg-green-50 text-green-700 text-[11px] font-bold px-2 py-0.5 rounded-full border border-green-100">
                    {product.discount}% OFF
                  </span>
                )}
              </div>

              {/* Description — scrollable */}
              <div className="mb-4">
                <h3 className="text-[#3D1A00] font-bold mb-2 text-[11px] uppercase tracking-widest">
                  Product Description
                </h3>
                <div className="h-[120px] overflow-y-auto pr-2 product-desc-scroll">
                  <p className="text-sm text-[#5C4B3A] leading-relaxed">
                    {product.description}
                  </p>
                </div>
              </div>

              {/* Quantity — compact */}
              {product.countInStock > 0 && (
                <div className="mb-4">
                  <label className="text-[#3D1A00] font-bold text-[11px] uppercase tracking-widest mb-2 block">
                    Quantity
                  </label>
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => setQty(Math.max(1, qty - 1))}
                      className="w-9 h-9 rounded-full bg-cream border border-orange-200 text-[#3D1A00] hover:bg-orange-600 hover:text-white hover:border-orange-600 transition-all duration-300 flex items-center justify-center text-lg font-bold"
                    >
                      −
                    </button>
                    <div className="relative">
                      <select
                        value={qty}
                        onChange={(e) => setQty(Number(e.target.value))}
                        className="px-4 py-2 bg-cream text-[#3D1A00] rounded-full border border-orange-200 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent cursor-pointer appearance-none pr-8 font-semibold text-sm"
                      >
                        {[...Array(Math.min(product.countInStock, 10))].map((_, i) => (
                          <option key={i + 1} value={i + 1}>{i + 1}</option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                        <svg className="w-3.5 h-3.5 text-[#7A6A5A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    <button
                      onClick={() => setQty(Math.min(product.countInStock, qty + 1))}
                      className="w-9 h-9 rounded-full bg-cream border border-orange-200 text-[#3D1A00] hover:bg-orange-600 hover:text-white hover:border-orange-600 transition-all duration-300 flex items-center justify-center text-lg font-bold"
                    >
                      +
                    </button>
                    <span className="text-[#7A6A5A] text-xs">
                      Max {Math.min(product.countInStock, 10)}
                    </span>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-2 mt-auto">
                <button
                  onClick={handleAddToCart}
                  disabled={product.countInStock === 0 || isAdding}
                  className={`flex-1 py-3 rounded-full font-bold transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 text-sm
                    ${product.countInStock === 0 || isAdding
                      ? 'bg-orange-300 text-white cursor-not-allowed'
                      : 'bg-orange-600 text-white hover:bg-orange-700 shadow-lg shadow-orange-500/20'
                    }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  {product.countInStock === 0 ? 'Out of Stock' : (isAdding ? 'Adding...' : 'Add to Cart')}
                </button>

                <button
                  onClick={() => navigate('/products')}
                  className="flex-1 bg-cream border border-orange-200 text-[#3D1A00] py-3 rounded-full font-bold hover:bg-orange-50 transition-all duration-300 flex items-center justify-center gap-2 group text-sm"
                >
                  <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Custom scrollbar for description */}
      <style>{`
        .product-desc-scroll {
          scrollbar-width: thin;
          scrollbar-color: #F15A29 #FFF4E6;
        }
        .product-desc-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .product-desc-scroll::-webkit-scrollbar-track {
          background: #FFF4E6;
          border-radius: 4px;
        }
        .product-desc-scroll::-webkit-scrollbar-thumb {
          background: #F15A29;
          border-radius: 4px;
        }
        .product-desc-scroll::-webkit-scrollbar-thumb:hover {
          background: #C2410C;
        }
      `}</style>
    </div>
  )
}

export default ProductDetailPage