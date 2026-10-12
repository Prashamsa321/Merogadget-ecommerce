import React, { useState, useEffect } from 'react';
import { X, Truck, Flame, Headphones, Sparkles, Star, Gift } from 'lucide-react';

const TopAnnouncementBar = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  const announcements = [
    { id: 1, message: "Free Shipping on Orders Over Rs. 5,000", icon: Truck },
    { id: 2, message: "Big Summer Sale — Up to 70% Off", icon: Flame },
    { id: 3, message: "24/7 Customer Support", icon: Headphones },
    { id: 4, message: "New Arrivals Available Now", icon: Sparkles },
    { id: 5, message: "Rated 4.9/5 by 10,000+ Customers", icon: Star },
    { id: 6, message: "Exclusive Offers for Members", icon: Gift }
  ];

  const handleClose = () => setIsVisible(false);

  if (!isVisible) return null;

  return (
    <div
      className="relative w-full bg-[#3D1A00] overflow-hidden group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="w-full py-2">
        <div className="relative overflow-hidden w-full">
          <div
            className="flex items-center gap-6 w-max"
            style={{
              animation: isPaused ? 'marquee-rtl 35s linear infinite paused' : 'marquee-rtl 35s linear infinite',
              animationPlayState: isPaused ? 'paused' : 'running'
            }}
          >
            {[...announcements, ...announcements, ...announcements].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={`${item.id}-${idx}`}
                  className="inline-flex items-center gap-2 px-3 shrink-0"
                >
                  <Icon className="w-3.5 h-3.5 text-orange-400 shrink-0" strokeWidth={2} />
                  <span className="text-[11px] sm:text-xs font-medium text-[#FDF6EC] whitespace-nowrap">
                    {item.message}
                  </span>
                  <span className="text-orange-400 text-base mx-1.5">•</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Left fade */}
        <div className="absolute inset-y-0 left-0 w-8 sm:w-12 bg-gradient-to-r from-[#3D1A00] via-[#3D1A00]/80 to-transparent pointer-events-none z-10" />

        {/* Right fade */}
        <div className="absolute inset-y-0 right-0 w-8 sm:w-12 bg-gradient-to-l from-[#3D1A00] via-[#3D1A00]/80 to-transparent pointer-events-none z-10" />
      </div>

      {/* Close button */}
      <button
        onClick={handleClose}
        className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/10 transition-all duration-200 z-20 opacity-60 hover:opacity-100"
        aria-label="Close announcement"
      >
        <X className="w-3.5 h-3.5 text-[#FDF6EC]/80 hover:text-white" />
      </button>

      <style>{`
        @keyframes marquee-rtl {
          0% {
            transform: translateX(-33.333%);
          }
          100% {
            transform: translateX(0%);
          }
        }
      `}</style>
    </div>
  );
};

export default TopAnnouncementBar;