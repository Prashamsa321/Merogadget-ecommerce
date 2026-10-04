import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const TopAnnouncementBar = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  const announcements = [
    { id: 1, message: "🚚 Free Shipping on Orders Over Rs. 5,000", icon: "🚚" },
    { id: 2, message: "🔥 Big Summer Sale — Up to 70% Off", icon: "🔥" },
    { id: 3, message: "💬 24/7 Customer Support", icon: "💬" },
    { id: 4, message: "✨ New Arrivals Available Now", icon: "✨" },
    { id: 5, message: "⭐ Rated 4.9/5 by 10,000+ Customers", icon: "⭐" },
    { id: 6, message: "🎁 Exclusive Offers for Members", icon: "🎁" }
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
      <div className="container mx-auto px-4 py-2.5">
        <div className="relative overflow-hidden">
          <div
            className="flex items-center justify-center gap-8"
            style={{
              animation: isPaused ? 'none' : 'marquee 25s linear infinite',
              whiteSpace: 'nowrap'
            }}
          >
            {[...announcements, ...announcements].map((item, idx) => (
              <div
                key={`${item.id}-${idx}`}
                className="inline-flex items-center gap-2 px-4"
              >
                <span className="text-base">{item.icon}</span>
                <span className="text-sm font-medium text-[#FDF6EC]">
                  {item.message}
                </span>
                <span className="text-orange-400 text-lg mx-2">•</span>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-[#3D1A00] to-transparent pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-[#3D1A00] to-transparent pointer-events-none" />
      </div>

      <button
        onClick={handleClose}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/10 transition-all duration-200 z-10 opacity-0 group-hover:opacity-100"
        aria-label="Close announcement"
      >
        <X className="w-4 h-4 text-[#FDF6EC]/70 hover:text-white" />
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