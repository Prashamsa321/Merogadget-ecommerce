import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { productService } from '../services/productService';

const ProductContext = createContext(null);

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within ProductProvider');
  }
  return context;
};

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastFetched, setLastFetched] = useState(null);

  const fetchProducts = useCallback(async (force = false) => {
    // Cache for 5 minutes unless forced
    const CACHE_TTL = 5 * 60 * 1000;
    if (
      !force &&
      lastFetched &&
      Date.now() - lastFetched < CACHE_TTL &&
      products.length > 0
    ) {
      return products;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await productService.getAllProducts();
      const productsArray = Array.isArray(data) ? data : [];
      setProducts(productsArray);
      setLastFetched(Date.now());
      return productsArray;
    } catch (err) {
      console.error('Failed to fetch products:', err);
      setError(err.message || 'Failed to load products');
      return [];
    } finally {
      setLoading(false);
    }
  }, [lastFetched, products.length]);

  // Fetch once on app mount
  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = {
    products,
    loading,
    error,
    fetchProducts, // call with force=true after admin creates/edits a product
    setProducts,
    lastFetched
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};

export default ProductContext;