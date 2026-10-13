import React from 'react';
import { Link } from 'react-router-dom';

const CategoriesDropdown = () => {
  return (
    <Link
      to="/categories"
      className="px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 hover:scale-105 text-[#6B6258] hover:text-[#3D1A00] hover:bg-orange-50"
    >
      Categories
    </Link>
  );
};

export default CategoriesDropdown;