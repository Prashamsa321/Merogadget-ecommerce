import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const exploreLinks = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products' },
    { name: 'Categories', path: '/products' },
    { name: 'Offers', path: '/products' }
  ];

  const companyLinks = [
    { name: 'About us', path: '/about' },
    { name: 'Contact', path: '/contact' },
    { name: 'Careers', path: '/about' }
  ];

  const supportLinks = [
    { name: 'Help center', path: '/contact' },
    { name: 'Track order', path: '/orders' },
    { name: 'Terms & privacy', path: '/about' }
  ];

  return (
    <footer className="bg-[#2B0F00] text-[#FDF6EC]">
      <div className="container mx-auto max-w-7xl pt-14 pb-8 px-4 sm:px-6 lg:px-10 xl:px-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30 overflow-hidden">
                <img
                  src="/Logo.png"
                  alt="MeroGadget icon"
                  className="w-full h-full object-contain"
                />
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Mero<span className="text-orange-400">Gadget</span>
              </h2>
            </div>
            <p className="text-[#D4C4B0] text-sm leading-relaxed mb-4">
              Premium electronics delivered to your door with care. Quality products, competitive prices, and exceptional service.
            </p>
            <a
              href="mailto:support@merogadget.com"
              className="text-orange-400 hover:text-orange-300 text-sm font-medium transition-colors"
            >
              support@merogadget.com
            </a>
          </div>

          {/* Explore */}
          <div>
            <h3 className="text-sm font-bold text-orange-400 uppercase tracking-widest mb-5">
              Explore
            </h3>
            <ul className="space-y-3">
              {exploreLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.path}
                    className="text-[#D4C4B0] hover:text-white text-sm font-medium transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-bold text-orange-400 uppercase tracking-widest mb-5">
              Company
            </h3>
            <ul className="space-y-3">
              {companyLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.path}
                    className="text-[#D4C4B0] hover:text-white text-sm font-medium transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-bold text-orange-400 uppercase tracking-widest mb-5">
              Support
            </h3>
            <ul className="space-y-3">
              {supportLinks.map((link, index) => (
                <li key={index}>
                  <Link
                    to={link.path}
                    className="text-[#D4C4B0] hover:text-white text-sm font-medium transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-[#4A2410] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[#A8998A] text-sm">
            © {currentYear} MeroGadget. All rights reserved.
          </p>
          <p className="text-[#A8998A] text-sm">
            Made for gadget lovers, delivered with care.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;