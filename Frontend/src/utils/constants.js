// src/utils/constants.js
export const API_ENDPOINTS = {
    AUTH: {
      REGISTER: '/auth/register',
      LOGIN: '/auth/login',
      LOGOUT: '/auth/logout',
    },
    PRODUCTS: {
      BASE: '/products',
      GET_ALL: '/products/getproduct',
      CREATE: '/products/createproduct',
      UPDATE: (id) => `/products/update/${id}`,
      DELETE: (id) => `/products/delete/${id}`,
    },
    CART: {
      BASE: '/cart',
      GET: '/cart/getcart',
      ADD: '/cart/addtocart',
      INCREASE: '/cart/increase',
      DECREASE: '/cart/decrease',
      REMOVE: (id) => `/cart/remove/${id}`,
    },
  }
  
  export const STORAGE_KEYS = {
    USER: 'user',
    CART: 'cart',
  }
  
  export const ROUTES = {
    HOME: '/',
    LOGIN: '/login',
    REGISTER: '/register',
    PRODUCTS: '/products',
    PRODUCT_DETAIL: (id) => `/products/${id}`,
    CART: '/cart',
    PROFILE: '/profile',
    ADMIN: {
      DASHBOARD: '/admin',
      PRODUCTS: '/admin/products',
      CREATE_PRODUCT: '/admin/products/create',
      EDIT_PRODUCT: (id) => `/admin/products/${id}/edit`,
    },
  }