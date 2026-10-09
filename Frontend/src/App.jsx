import { useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import AdminLayout from './components/layout/AdminLayout';
import PrivateRoute from './components/common/PrivateRoute';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import CartPage from './pages/CartPage';
import Login from './pages/LoginPage';
import Register from './pages/Register';
import ProfilePage from './pages/ProfilePage';
import ContactPage from './pages/ContactPage';
import ForgotPassword from './pages/ForgotPassword';
import AboutPage from './pages/AboutPage';
import PaymentSuccess from './pages/paymentsuccess';
import CheckoutPage from './pages/CheckoutPage';
import ProductDetailPage from './pages/ProductDetailPage';

// Admin pages
import AdminContacts from './pages/admin/AdminContacts';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';
import CategoriesPage from './pages/admin/CategoriesPage';
import CreateProductPage from './pages/admin/CreateProductPage';
import AdminProfile from './pages/admin/AdminProfile';
import AdminSettings from './pages/admin/AdminSettings';
import AdminReports from './pages/admin/AdminReports';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import Footer from './components/layout/Footer';
import OrdersPage from './pages/OrdersPage';

// ✅ Scrolls to top of page on every route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  return null;
}

function App() {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const isAdminRoute = location.pathname.startsWith('/admin');

  // If admin is trying to access non-admin routes, redirect to admin panel
  if (user?.role === 'admin' && !isAdminRoute && isAuthenticated &&
    location.pathname !== '/login' && location.pathname !== '/register') {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div>
      {/* ✅ Scrolls to top on every page navigation */}
      <ScrollToTop />

      {/* Only show Navbar if NOT on admin routes */}
      {!isAdminRoute && <Navbar />}

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/paymentsuccess" element={<PaymentSuccess />} />

        <Route path="/checkout" element={
          <PrivateRoute>
            <CheckoutPage />
          </PrivateRoute>
        } />

        <Route path="/orders" element={
          <PrivateRoute>
            <OrdersPage />
          </PrivateRoute>
        } />

        <Route path="/profile" element={<ProfilePage />} />

        {/* Admin Routes - For admin only */}
        <Route path="/admin" element={
          <PrivateRoute adminOnly={true}>
            <AdminLayout />
          </PrivateRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/create" element={<CreateProductPage />} />
          <Route path="products/:id/edit" element={<CreateProductPage />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="profile" element={<AdminProfile />} />
          <Route path="contacts" element={<AdminContacts />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="analytics" element={<AdminAnalytics />} />
        </Route>
      </Routes>

      {!isAdminRoute && <Footer />}
    </div>
  );
}

export default App;