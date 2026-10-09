import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { productService } from '../services/productService'
import { subscriberService } from '../services/subscriberService'
import { useToast } from '../context/ToastContext'
import ProductCard from '../components/products/ProductCard'
import {
  ArrowRight,
  Check,
  Truck,
  RotateCcw,
  ShieldCheck,
  Headphones
} from 'lucide-react'

const CATEGORY_IMAGES = {
  'Smartphones':      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80',
  'Laptops':          'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&q=80',
  'Headphones':       'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
  'Television':       'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&q=80',
  'Televisions':      'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&q=80',
  'Watch':            'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
  'Watches':          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
  'Cameras':          'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800&q=80',
  'Gaming':           'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&q=80',
  'Audio':            'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800&q=80',
  'Tablets':          'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800&q=80',
  'Drones':           'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=800&q=80',
  'Accessories':      'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&q=80',
  'Smart Home':       'https://images.unsplash.com/photo-1558002038-1055907df827?w=800&q=80',
  'Home Appliances':  'https://images.unsplash.com/photo-1558317374-687fb67de0a0?w=800&q=80',
  'Streaming':        'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&q=80',
  'Monitors':         'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80',
  'Fashion':          'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
};

const DEFAULT_CATEGORY_IMAGE = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80';

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [topCategories, setTopCategories] = useState([])
  const [loading, setLoading] = useState(true)

  const { success, error } = useToast()
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [subscribed, setSubscribed] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const products = await productService.getAllProducts()
        const productsArray = Array.isArray(products) ? products : []
        setFeaturedProducts(productsArray.slice(0, 4))

        const categoryMap = new Map()
        productsArray.forEach((p) => {
          if (p.category && !categoryMap.has(p.category)) {
            categoryMap.set(p.category, {
              name: p.category,
              image: p.images?.[0] || CATEGORY_IMAGES[p.category] || DEFAULT_CATEGORY_IMAGE,
            })
          }
        })

        const cats = Array.from(categoryMap.values())
          .map(cat => ({
            ...cat,
            image: CATEGORY_IMAGES[cat.name] || cat.image,
          }))
          .slice(0, 8)

        setTopCategories(cats)
      } catch (error) {
        console.error('Failed to fetch products:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleSubscribe = async (e) => {
    e.preventDefault()

    const trimmed = email.trim()
    if (!trimmed) {
      error('Please enter your email')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(trimmed)) {
      error('Please enter a valid email')
      return
    }

    setSubmitting(true)
    try {
      const res = await subscriberService.subscribe(trimmed)
      if (res.success) {
        success('Subscribed successfully!')
        setSubscribed(true)
        setEmail('')
      } else {
        error(res.message || 'Subscription failed')
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Subscription failed'
      error(msg)
    } finally {
      setSubmitting(false)
    }
  }

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

        <div className="container mx-auto pt-8 pb-12 lg:pt-10 lg:pb-16 relative z-10 max-w-7xl px-4 sm:px-6 lg:px-10 xl:px-16">
          <div className="grid md:grid-cols-2 gap-10 lg:gap-14 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-orange-200 rounded-full text-[#1F1A16] text-sm mb-5 shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                </span>
                <span className="font-semibold tracking-wide text-xs uppercase">New Collection Available</span>
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-[#1F1A16] mb-5 leading-[1.05] tracking-tight">
                Premium
                <br />
                <span className="bg-gradient-to-r from-orange-600 via-orange-500 to-orange-600 bg-clip-text text-transparent">
                  Electronics.
                </span>
              </h1>

              <p className="text-lg text-[#6B6258] mb-7 max-w-lg leading-relaxed">
                Cutting-edge gadgets and electronics. Experience the future of technology with our premium collection — delivered to your door.
              </p>

              <div className="flex flex-wrap gap-4 mb-8">
                <Link
                  to="/products"
                  className="bg-orange-600 text-white px-8 py-4 rounded-full font-semibold hover:bg-orange-700 hover:shadow-lg hover:shadow-orange-500/30 transition-all duration-300 active:scale-95 inline-flex items-center gap-2 group"
                >
                  Explore Products
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
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
                  <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center">
                    <Check className="w-5 h-5 text-green-600 stroke-[2.5]" />
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

      {/* ═══════════ SHOP BY CATEGORY ═══════════ */}
      <section className="py-16 bg-[#FFF4E6]">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 xl:px-16">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold text-orange-600 uppercase tracking-widest mb-2">Shop by category</p>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1F1A16] mb-3">Find your next favorite thing</h2>
            <p className="text-[#6B6258]">Handpicked collections, ready to browse</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-2xl overflow-hidden border border-orange-100 animate-pulse">
                  <div className="h-44 bg-orange-50"></div>
                  <div className="p-5 space-y-2">
                    <div className="h-3 bg-orange-100 rounded-full w-3/4"></div>
                    <div className="h-3 bg-orange-100 rounded-full w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {topCategories.map((category, index) => (
                <Link
                  key={index}
                  to={`/products?category=${encodeURIComponent(category.name)}`}
                  className="group bg-white rounded-2xl overflow-hidden border border-orange-100 hover:border-orange-500 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col"
                >
                  <div className="relative h-44 sm:h-48 bg-gradient-to-br from-orange-50 to-amber-50 overflow-hidden">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.src = DEFAULT_CATEGORY_IMAGE
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                    <h3 className="absolute bottom-3 left-4 right-4 text-white font-bold text-lg leading-tight drop-shadow-lg">
                      {category.name}
                    </h3>
                  </div>

                  <div className="p-5 flex flex-col flex-grow">
                    <span className="text-orange-600 text-sm font-semibold inline-flex items-center gap-1 group-hover:gap-2 transition-all mt-auto">
                      Shop Now
                      <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════ FEATURED PRODUCTS ═══════════ */}
      <section className="py-16 bg-white">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 xl:px-16">
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
                className="inline-flex items-center gap-2 bg-orange-600 text-white px-8 py-4 rounded-full font-semibold hover:bg-orange-700 transition-all duration-300 shadow-lg shadow-orange-500/20 active:scale-95 group"
              >
                View All Products
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ═══════════ FEATURES ═══════════ */}
      <section className="py-16 bg-[#FFF4E6]">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 xl:px-16">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold text-orange-600 uppercase tracking-widest mb-2">Why MeroGadget</p>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1F1A16] mb-3">Built for busy lives</h2>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: Truck, title: 'Free Shipping', desc: 'On orders over रु 5,000' },
              { icon: RotateCcw, title: '30-Day Returns', desc: 'Hassle-free returns' },
              { icon: ShieldCheck, title: 'Secure Payment', desc: '100% safe transactions' },
              { icon: Headphones, title: '24/7 Support', desc: 'Real humans, always here' }
            ].map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-6 text-center border border-orange-100 hover:border-orange-300 hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto mb-4 group-hover:bg-orange-600 group-hover:text-white group-hover:scale-110 transition-all duration-300 shadow-sm">
                    <Icon className="w-7 h-7" strokeWidth={1.8} />
                  </div>
                  <h3 className="text-[#1F1A16] font-semibold mb-2">{feature.title}</h3>
                  <p className="text-[#6B6258] text-sm">{feature.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ═══════════ NEWSLETTER ═══════════ */}
      <section className="py-20 bg-gradient-to-br from-[#FFF4E6] via-[#FFE4CC] to-[#FFF4E6]">
        <div className="container mx-auto text-center max-w-2xl px-4 sm:px-6 lg:px-10 xl:px-16">
          <p className="text-xs font-semibold text-orange-600 uppercase tracking-widest mb-3">Stay in the loop</p>
          <h2 className="text-3xl md:text-4xl font-bold text-[#1F1A16] mb-4">Never miss a delicious deal.</h2>
          <p className="text-[#6B6258] mb-8">
            Subscribe for weekly specials, new arrivals, and members-only discounts — straight to your inbox.
          </p>
          <form onSubmit={handleSubscribe} className="flex gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={submitting || subscribed}
              className="flex-1 px-6 py-4 bg-white border border-orange-200 rounded-full text-[#1F1A16] placeholder-[#A8998A] focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={submitting || subscribed}
              className="bg-orange-600 text-white px-8 py-4 rounded-full font-semibold hover:bg-orange-700 transition-all duration-300 shadow-lg shadow-orange-500/20 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
            >
              {subscribed ? (
                <>
                  <Check className="w-4 h-4" strokeWidth={2.5} />
                  Subscribed
                </>
              ) : submitting ? (
                'Subscribing...'
              ) : (
                'Subscribe'
              )}
            </button>
          </form>
          {subscribed && (
            <p className="text-green-600 text-sm mt-3 font-semibold">
              Thanks for subscribing! Check your inbox for updates.
            </p>
          )}
        </div>
      </section>
    </div>
  )
}

export default HomePage