import React, { useState, useEffect } from 'react';
import { X, Truck, Flame, Headphones, Sparkles, Star, Gift } from 'lucide-react';

const TopAnnouncementBar = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
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

  useEffect(() => {
    let interval;
    if (!isPaused && isVisible) {
      interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % announcements.length);
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [isPaused, isVisible, announcements.length]);

  const handleClose = () => setIsVisible(false);

  if (!isVisible) return null;

  return (
    <div
      className="relative w-full bg-[#3D1A00] overflow-hidden group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-10 xl:px-16 py-1.5">
        <div className="relative overflow-hidden">
          <div
            className="flex items-center justify-center gap-6"
            style={{
              animation: isPaused ? 'none' : 'marquee 25s linear infinite',
              whiteSpace: 'nowrap'
            }}
          >
            {[...announcements, ...announcements].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={`${item.id}-${idx}`}
                  className="inline-flex items-center gap-1.5 px-3"
                >
                  <Icon className="w-3.5 h-3.5 text-orange-400 shrink-0" strokeWidth={2} />
                  <span className="text-xs font-medium text-[#FDF6EC]">
                    {item.message}
                  </span>
                  <span className="text-orange-400 text-base mx-1.5">•</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-[#3D1A00] to-transparent pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-[#3D1A00] to-transparent pointer-events-none" />
      </div>

      <button
        onClick={handleClose}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/10 transition-all duration-200 z-10 opacity-0 group-hover:opacity-100"
        aria-label="Close announcement"
      >
        <X className="w-3.5 h-3.5 text-[#FDF6EC]/70 hover:text-white" />
      </button>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
};

export default TopAnnouncementBar;