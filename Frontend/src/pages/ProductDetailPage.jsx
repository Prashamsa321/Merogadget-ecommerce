import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { productService } from '../services/productService'
import { useCart } from '../hooks/useCart'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import toast from 'react-hot-toast'
import ProductCard from '../components/products/ProductCard'
import { Truck, ShieldCheck, RotateCcw } from 'lucide-react'

const ProductDetailPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [qty, setQty] = useState(1)
  const [isAdding, setIsAdding] = useState(false)
  const [activeTab, setActiveTab] = useState('description')
  const { addToCart } = useCart()
  const { user } = useAuth()
  const { success, error, info } = useToast()
  const isAdmin = user?.role === 'admin'

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const data = await productService.getProductById(id)
        setProduct(data)
        const all = await productService.getAllProducts()
        const related = all.filter(p => p.category === data.category && p._id !== data._id).slice(0, 4)
        setRelatedProducts(related)
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
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-orange-500 border-t-transparent"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-4 py-12">
        <div className="text-center bg-white rounded-2xl p-6 border border-orange-100 shadow-soft max-w-sm w-full">
          <p className="text-[#3D1A00] text-base font-bold mb-3">Product not found</p>
          <button
            onClick={() => navigate('/products')}
            className="px-4 py-2 bg-orange-600 text-white rounded-full font-semibold hover:bg-orange-700 transition-all text-sm"
          >
            Back to Products
          </button>
        </div>
      </div>
    )
  }

  const stockQty = product.stock ?? product.countInStock ?? 0
  const inStock = stockQty > 0
  const productImage = product.images?.[0] || product.image || 'https://via.placeholder.com/600'

  return (
    <div className="min-h-screen bg-cream py-4 px-4 sm:px-6 lg:px-10 xl:px-16">
      <div className="container mx-auto max-w-5xl">

        {/* Breadcrumb */}
        <div className="mb-3 flex items-center gap-1.5 text-[11px] flex-wrap">
          <button
            onClick={() => navigate('/')}
            className="text-[#7A6A5A] hover:text-orange-600 transition-colors"
          >
            Home
          </button>
          <span className="text-[#A8998A]">/</span>
          <button
            onClick={() => navigate('/products')}
            className="text-[#7A6A5A] hover:text-orange-600 transition-colors"
          >
            Products
          </button>
          <span className="text-[#A8998A]">/</span>
          <span className="text-[#3D1A00] font-semibold truncate">{product.name}</span>
        </div>

        {/* ─── Main card ─── */}
        <div className="bg-white rounded-xl overflow-hidden border border-orange-100 shadow-soft">

          <div className="grid grid-cols-1 md:grid-cols-[minmax(0,320px)_1fr] gap-0">

            {/* ─── LEFT: Image ─── */}
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 border-b md:border-b-0 md:border-r border-orange-100">
              <div className="aspect-square w-full overflow-hidden group">
                <img
                  src={productImage}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>

            {/* ─── RIGHT: Details ─── */}
            <div className="p-5 md:p-6 flex flex-col">

              {/* Category + Brand line */}
              {product.category && (
                <p className="text-[10px] font-bold uppercase tracking-widest text-orange-600 mb-1.5">
                  {product.category}
                  {product.brand && <span className="text-[#A8998A]"> · {product.brand}</span>}
                </p>
              )}

              {/* Title */}
              <h1 className="text-lg md:text-xl font-bold text-[#3D1A00] mb-2.5 leading-snug">
                {product.name}
              </h1>

              {/* Price box */}
              <div className="bg-orange-50/60 border border-orange-100 rounded-lg px-3.5 py-3 mb-3">
                <div className="flex items-baseline gap-2.5 flex-wrap">
                  <span className="text-2xl font-bold text-orange-600">
                    रु {product.price?.toLocaleString()}
                  </span>
                  {product.originalPrice && (
                    <span className="text-sm text-[#A8998A] line-through">
                      रु {product.originalPrice?.toLocaleString()}
                    </span>
                  )}
                </div>
                {product.originalPrice && product.originalPrice > product.price && (
                  <p className="text-[11px] text-green-700 font-semibold mt-0.5">
                    You save रु {(product.originalPrice - product.price).toLocaleString()}
                  </p>
                )}

                <div className="mt-2">
                  {inStock ? (
                    <span className="inline-flex items-center gap-1.5 text-[10px] text-green-700 bg-green-50 px-2 py-0.5 rounded-full font-semibold border border-green-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
                      In Stock
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-[10px] text-red-700 bg-red-50 px-2 py-0.5 rounded-full font-semibold border border-red-100">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span>
                      Out of Stock
                    </span>
                  )}
                </div>
              </div>

              {/* Quantity */}
              {inStock && (
                <div className="mb-4">
                  <label className="text-[#3D1A00] font-bold text-[10px] uppercase tracking-widest mb-1.5 block">
                    Quantity
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setQty(Math.max(1, qty - 1))}
                      disabled={qty <= 1}
                      className="w-8 h-8 rounded-full bg-white border border-orange-200 text-[#3D1A00] hover:bg-orange-600 hover:text-white hover:border-orange-600 transition-all duration-200 flex items-center justify-center text-base font-bold disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-[#3D1A00] disabled:hover:border-orange-200"
                    >
                      −
                    </button>
                    <div className="w-10 text-center font-bold text-sm text-[#3D1A00] border border-orange-200 rounded-full py-1.5 bg-white">
                      {qty}
                    </div>
                    <button
                      onClick={() => setQty(Math.min(stockQty, qty + 1))}
                      disabled={qty >= stockQty}
                      className="w-8 h-8 rounded-full bg-white border border-orange-200 text-[#3D1A00] hover:bg-orange-600 hover:text-white hover:border-orange-600 transition-all duration-200 flex items-center justify-center text-base font-bold disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-[#3D1A00] disabled:hover:border-orange-200"
                    >
                      +
                    </button>
                    <span className="text-[#7A6A5A] text-[11px] ml-0.5">
                      {stockQty} available
                    </span>
                  </div>
                </div>
              )}

              {/* Add to Cart */}
              <div className="flex flex-col gap-2 mt-auto">
                <button
                  onClick={handleAddToCart}
                  disabled={!inStock || isAdding}
                  className={`w-full py-3 rounded-full font-bold transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2 text-sm
                    ${!inStock || isAdding
                      ? 'bg-orange-300 text-white cursor-not-allowed'
                      : 'bg-orange-600 text-white hover:bg-orange-700 shadow-md shadow-orange-500/20'
                    }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  {!inStock ? 'Out of Stock' : (isAdding ? 'Adding...' : 'Add to Cart')}
                </button>

                <button
                  onClick={() => navigate('/products')}
                  className="w-full bg-cream border border-orange-200 text-[#3D1A00] py-2.5 rounded-full font-semibold hover:bg-orange-50 transition-all duration-300 flex items-center justify-center gap-2 group text-[13px]"
                >
                  <svg className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Continue Shopping
                </button>
              </div>

            </div>
          </div>

          {/* ─── Description tabs ─── */}
          <div className="border-t border-orange-100">

            <div className="flex border-b border-orange-100">
              {[
                { key: 'description', label: 'Description' },
                { key: 'details', label: 'Details' }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-5 py-3 text-[13px] font-semibold whitespace-nowrap transition-all border-b-2 ${
                    activeTab === tab.key
                      ? 'text-orange-600 border-orange-600 bg-orange-50/40'
                      : 'text-[#7A6A5A] border-transparent hover:text-[#3D1A00] hover:bg-orange-50/20'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-5 md:p-6">
              {activeTab === 'description' && (
                <div>
                  {product.description ? (
                    <p className="text-[13px] text-[#5C4B3A] leading-relaxed whitespace-pre-wrap">
                      {product.description}
                    </p>
                  ) : (
                    <p className="text-[#A8998A] text-xs italic">No description available.</p>
                  )}
                </div>
              )}

              {activeTab === 'details' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                  {[
                    { label: 'Category', value: product.category || '—' },
                    { label: 'Brand', value: product.brand || '—' },
                    { label: 'Price', value: `रु ${product.price?.toLocaleString()}` },
                    { label: 'Availability', value: inStock ? `In Stock (${stockQty})` : 'Out of Stock', color: inStock ? 'text-green-600' : 'text-red-600' }
                  ].map((item, i) => (
                    <div key={i} className="flex items-baseline gap-3 py-1.5 border-b border-orange-100/60">
                      <span className="text-[10px] text-[#A8998A] uppercase tracking-widest font-semibold w-24 shrink-0">
                        {item.label}
                      </span>
                      <span className={`text-[13px] font-semibold ${item.color || 'text-[#3D1A00]'}`}>
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ─── Trust badges ─── */}
          <div className="border-t border-orange-100 bg-[#FFF4E6]/40">
            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-orange-100">
              <div className="flex items-center gap-2.5 p-3.5 justify-center">
                <div className="w-8 h-8 rounded-full bg-white border border-orange-100 flex items-center justify-center shrink-0">
                  <Truck className="w-4 h-4 text-orange-600" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-[12px] font-bold text-[#3D1A00]">Free Delivery</p>
                  <p className="text-[10px] text-[#7A6A5A]">Orders over रु 5,000</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-3.5 justify-center">
                <div className="w-8 h-8 rounded-full bg-white border border-orange-100 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4 text-orange-600" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-[12px] font-bold text-[#3D1A00]">Secure Payment</p>
                  <p className="text-[10px] text-[#7A6A5A]">100% safe checkout</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5 p-3.5 justify-center">
                <div className="w-8 h-8 rounded-full bg-white border border-orange-100 flex items-center justify-center shrink-0">
                  <RotateCcw className="w-4 h-4 text-orange-600" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-[12px] font-bold text-[#3D1A00]">Easy Returns</p>
                  <p className="text-[10px] text-[#7A6A5A]">7-day replacement</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════ RELATED PRODUCTS ═══════ */}
        {relatedProducts.length > 0 && (
          <div className="mt-8">
            <div className="mb-4">
              <p className="text-[10px] font-semibold text-orange-600 uppercase tracking-widest mb-0.5">You may also like</p>
              <h2 className="text-lg md:text-xl font-bold text-[#3D1A00]">Related Products</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {relatedProducts.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>

            <div className="text-center mt-6">
              <Link
                to={`/products?category=${encodeURIComponent(product.category)}`}
                className="inline-flex items-center gap-2 border border-orange-600 text-orange-600 px-5 py-2.5 rounded-full font-semibold hover:bg-orange-600 hover:text-white transition-all duration-300 text-xs"
              >
                View all {product.category}
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default ProductDetailPage