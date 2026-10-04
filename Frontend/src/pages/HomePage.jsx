import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { productService } from '../services/productService'
import ProductCard from '../components/products/ProductCard'

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const products = await productService.getAllProducts()
        const productsArray = Array.isArray(products) ? products : []
        setFeaturedProducts(productsArray.slice(0, 4))
      } catch (error) {
        console.error('Failed to fetch products:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const categoriesData = [
    { name: 'Refrigerator', icon: '🧊', gradient: 'from-blue-50 to-cyan-50' },
    { name: 'Television', icon: '📺', gradient: 'from-purple-50 to-pink-50' },
    { name: 'Air Conditioner', icon: '❄️', gradient: 'from-cyan-50 to-blue-50' },
    { name: 'Watch', icon: '⌚', gradient: 'from-orange-50 to-red-50' }
  ]

  return (
    <div className="bg-[#FFFAF3]">
      {/* ═══════════ HERO ═══════════ */}
      <section className="relative overflow-hidden bg-gradient-to-b from-orange-50 via-orange-50/40 to-[#FFFAF3]">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(#FF6200 1px, transparent 1px), linear-gradient(90deg, #FF6200 1px, transparent 1px)',
            backgroundSize: '48px 48px'
          }}
        ></div>

        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-orange-200 rounded-full filter blur-[180px] opacity-30"></div>
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-amber-100 rounded-full filter blur-[180px] opacity-50"></div>

        <div className="container mx-auto py-20 lg:py-28 relative z-10 max-w-7xl">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-orange-200 rounded-full text-[#1F1A16] text-sm mb-6 shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                </span>
                <span className="font-semibold tracking-wide text-xs uppercase">New Collection Available</span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-[#1F1A16] mb-6 leading-[1.05] tracking-tight">
                Premium
                <br />
                <span className="bg-gradient-to-r from-orange-600 via-orange-500 to-orange-600 bg-clip-text text-transparent">
                  Electronics.
                </span>
              </h1>

              <p className="text-lg text-[#6B6258] mb-8 max-w-lg leading-relaxed">
                Cutting-edge gadgets and electronics. Experience the future of technology with our premium collection — delivered to your door.
              </p>

              <div className="flex flex-wrap gap-4 mb-14">
                <Link
                  to="/products"
                  className="bg-orange-600 text-white px-8 py-4 rounded-full font-semibold hover:bg-orange-700 hover:shadow-lg hover:shadow-orange-500/30 transition-all duration-300 active:scale-95 inline-flex items-center gap-2"
                >
                  Explore Products
                  <span>→</span>
                </Link>
                <Link
                  to="/about"
                  className="border-2 border-[#1F1A16] text-[#1F1A16] px-8 py-4 rounded-full font-semibold hover:bg-[#1F1A16] hover:text-white transition-all duration-300 active:scale-95"
                >
                  How it works
                </Link>
              </div>

          
            </div>

            <div className="relative hidden md:block">
              <div className="absolute -inset-4 bg-gradient-to-tr from-orange-100 via-white to-amber-100 rounded-[2.5rem] -rotate-2"></div>
              <div className="relative bg-white rounded-[2rem] p-4 shadow-[0_20px_60px_-15px_rgba(255,98,0,0.15)] border border-orange-100">
                <img
                  src="./home appliance.png"
                  alt="Premium electronics collection"
                  className="w-full h-auto rounded-[1.5rem] object-cover"
                />
                
                <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl px-5 py-3 flex items-center gap-3 border border-orange-100">
                  <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-xl">
                    ✓
                  </div>
                  <div>
                    <p className="text-xs text-[#6B6258]">Trusted by</p>
                    <p className="text-sm font-semibold text-[#1F1A16]">10,000+ buyers</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ CATEGORIES ═══════════ */}
      <section className="py-16 bg-[#FFF4E6]">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold text-orange-600 uppercase tracking-widest mb-2">Shop by category</p>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1F1A16] mb-3">Find your next favorite thing</h2>
            <p className="text-[#6B6258]">Handpicked collections, ready to browse</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categoriesData.map((category, index) => (
              <Link
                key={index}
                to={`/products?category=${category.name.toLowerCase()}`}
                className={`bg-white rounded-2xl p-8 text-center hover:scale-105 transition-all duration-300 border border-orange-100 hover:border-orange-500 hover:shadow-lg group`}
              >
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {category.icon}
                </div>
                <h3 className="text-[#1F1A16] font-semibold">{category.name}</h3>
                <p className="text-blue-600 text-sm mt-2 group-hover:text-orange-600 transition">
                  Shop Now →
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURED PRODUCTS ═══════════ */}
      <section className="py-16 bg-white">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold text-orange-600 uppercase tracking-widest mb-2">Featured</p>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1F1A16] mb-3">Trending right now</h2>
            <p className="text-[#6B6258]">Hand-picked just for you</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl p-4 animate-pulse border border-orange-100">
                  <div className="h-48 bg-orange-50 rounded-xl mb-4"></div>
                  <div className="h-4 bg-orange-100 rounded-full mb-2 w-3/4"></div>
                  <div className="h-4 bg-orange-100 rounded-full w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}

          {!loading && featuredProducts.length > 0 && (
            <div className="text-center mt-12">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 bg-orange-600 text-white px-8 py-4 rounded-full font-semibold hover:bg-orange-700 transition-all duration-300 shadow-lg shadow-orange-500/20 active:scale-95"
              >
                View All Products
                <span>→</span>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ═══════════ FEATURES ═══════════ */}
      <section className="py-16 bg-[#FFF4E6]">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold text-orange-600 uppercase tracking-widest mb-2">Why MeroGadget</p>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1F1A16] mb-3">Built for busy lives</h2>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: '🚚', title: 'Free Shipping', desc: 'On orders over रु 5,000' },
              { icon: '🔄', title: '30-Day Returns', desc: 'Hassle-free returns' },
              { icon: '💳', title: 'Secure Payment', desc: '100% safe transactions' },
              { icon: '💬', title: '24/7 Support', desc: 'Real humans, always here' }
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 text-center border border-orange-100 hover:border-orange-300 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-[#1F1A16] font-semibold mb-2">{feature.title}</h3>
                <p className="text-[#6B6258] text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ NEWSLETTER ═══════════ */}
      <section className="py-20 bg-gradient-to-br from-[#FFF4E6] via-[#FFE4CC] to-[#FFF4E6]">
        <div className="container mx-auto text-center max-w-2xl">
          <p className="text-xs font-semibold text-orange-600 uppercase tracking-widest mb-3">Stay in the loop</p>
          <h2 className="text-3xl md:text-4xl font-bold text-[#1F1A16] mb-4">Never miss a delicious deal.</h2>
          <p className="text-[#6B6258] mb-8">
            Subscribe for weekly specials, new arrivals, and members-only discounts — straight to your inbox.
          </p>
          <form className="flex gap-3">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-6 py-4 bg-white border border-orange-200 rounded-full text-[#1F1A16] placeholder-[#A8998A] focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            />
            <button
              type="submit"
              className="bg-orange-600 text-white px-8 py-4 rounded-full font-semibold hover:bg-orange-700 transition-all duration-300 shadow-lg shadow-orange-500/20 active:scale-95"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  )
}

export default HomePage