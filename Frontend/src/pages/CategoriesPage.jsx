import React, { useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useProducts } from '../context/ProductContext';
import { ArrowRight, Package, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

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
};

const DEFAULT_CATEGORY_IMAGE = 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80';

const CategoriesPage = () => {
  const { products, loading } = useProducts();

  const categories = useMemo(() => {
    if (!products || products.length === 0) return [];

    const map = new Map();

    products.forEach((p) => {
      const cat = p.category?.trim();
      if (!cat) return;

      if (!map.has(cat)) {
        map.set(cat, {
          name: cat,
          count: 0,
          previewImage: p.images?.[0] || CATEGORY_IMAGES[cat] || DEFAULT_CATEGORY_IMAGE,
        });
      }

      map.get(cat).count += 1;
    });

    return Array.from(map.values())
      .map(cat => ({
        ...cat,
        image: CATEGORY_IMAGES[cat.name] || cat.previewImage,
      }))
      .sort((a, b) => b.count - a.count);
  }, [products]);

  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 420;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">


      <section className="relative overflow-hidden bg-gradient-to-br from-[#3D1A00] via-[#4A2410] to-[#3D1A00] text-white">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-500/20 rounded-full blur-3xl -translate-y-1/3 translate-x-1/4 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-orange-400/10 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none"></div>

        <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-16 py-14 md:py-20 relative z-10">
          <div className="max-w-3xl mx-auto text-center">

            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur rounded-full border border-white/20 mb-5">
              <Sparkles className="w-3.5 h-3.5 text-orange-400" strokeWidth={2.5} />
              <span className="text-xs font-bold uppercase tracking-widest text-orange-200">
                Browse by category
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-5 leading-[1.05] tracking-tight text-white">
              Shop by{' '}
              <span className="text-orange-400">Category.</span>
            </h1>

            <p className="text-[#D4C4B0] text-base md:text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
              Explore our full range of product categories — from smartphones and laptops to cameras, audio gear, and smart home tech.
            </p>

            <div className="inline-flex items-center gap-6 md:gap-10 px-6 md:px-8 py-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-white">
                  {categories.length}
                </div>
                <div className="text-[11px] md:text-xs uppercase tracking-widest text-orange-300 font-semibold mt-0.5">
                  Categories
                </div>
              </div>
              <div className="w-px h-10 bg-white/15"></div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-white">
                  {products.length}
                </div>
                <div className="text-[11px] md:text-xs uppercase tracking-widest text-orange-300 font-semibold mt-0.5">
                  Products
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {categories.length === 0 ? (
        <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-16 py-20">
          <div className="text-center py-16 bg-white rounded-3xl border border-orange-100 max-w-3xl mx-auto">
            <Package className="w-16 h-16 text-orange-200 mx-auto mb-3" strokeWidth={1.5} />
            <p className="text-[#3D1A00] font-semibold text-lg mb-2">No categories found</p>
            <p className="text-[#7A6A5A] text-sm">Check back soon for new categories</p>
          </div>
        </div>
      ) : (
        <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-16 py-12 md:py-16">

          {/* Section heading */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8 md:mb-10">
            <div>
              <p className="text-xs font-semibold text-orange-600 uppercase tracking-widest mb-2">
                Explore all
              </p>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#3D1A00]">
                Featured Categories
              </h2>
            </div>

            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-semibold text-sm group self-start sm:self-auto"
            >
              Browse all products
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>

          {/* ─── Row with horizontal scroll ─── */}
          <div className="relative group/scroll">

            {/* Left arrow */}
            <button
              onClick={() => scroll('left')}
              className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 w-12 h-12 rounded-full bg-white shadow-xl border border-orange-100 items-center justify-center text-[#3D1A00] hover:bg-orange-600 hover:text-white hover:border-orange-600 transition-all duration-300 opacity-0 group-hover/scroll:opacity-100"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
            </button>

            {/* Scrollable container */}
            <div
              ref={scrollRef}
              className="flex gap-5 md:gap-6 overflow-x-auto pb-4 scroll-smooth category-scroll-x"
              style={{ scrollbarWidth: 'thin' }}
            >
              {categories.map((cat) => (
                <Link
                  key={cat.name}
                  to={`/products?category=${encodeURIComponent(cat.name)}`}
                  className="group relative flex-shrink-0 w-[320px] sm:w-[360px] md:w-[400px] rounded-3xl overflow-hidden border border-orange-100 hover:border-orange-300 hover:shadow-hover hover:-translate-y-1.5 transition-all duration-500 bg-white"
                >
                  {/* Image */}
                  <div className="relative aspect-[4/3] md:aspect-[16/11] overflow-hidden">
                    <img
                      src={cat.image}
                      alt={cat.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      onError={(e) => {
                        e.currentTarget.src = DEFAULT_CATEGORY_IMAGE;
                      }}
                    />

                    {/* Dark gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

                    {/* Count badge */}
                    <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-full px-3.5 py-1.5 shadow-md">
                      <span className="text-xs font-bold text-[#3D1A00]">
                        {cat.count} {cat.count === 1 ? 'Item' : 'Items'}
                      </span>
                    </div>

                    {/* Content overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 md:p-7 text-white">
                      <h3 className="text-2xl md:text-3xl font-bold mb-3 leading-tight tracking-tight text-white">
  {cat.name}
</h3>
                      <div className="flex items-center gap-2 text-orange-300 font-semibold text-sm opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                        Browse category
                        <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Right arrow */}
            <button
              onClick={() => scroll('right')}
              className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 w-12 h-12 rounded-full bg-white shadow-xl border border-orange-100 items-center justify-center text-[#3D1A00] hover:bg-orange-600 hover:text-white hover:border-orange-600 transition-all duration-300 opacity-0 group-hover/scroll:opacity-100"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5" strokeWidth={2.5} />
            </button>
          </div>

        </div>
      )}

      <style>{`
        .category-scroll-x::-webkit-scrollbar {
          height: 6px;
        }
        .category-scroll-x::-webkit-scrollbar-track {
          background: #F5EDE0;
          border-radius: 999px;
        }
        .category-scroll-x::-webkit-scrollbar-thumb {
          background: #F15A29;
          border-radius: 999px;
        }
        .category-scroll-x::-webkit-scrollbar-thumb:hover {
          background: #C2410C;
        }
      `}</style>
    </div>
  );
};

export default CategoriesPage;