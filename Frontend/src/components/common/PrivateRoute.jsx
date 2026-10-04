import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PrivateRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If route is admin-only and user is not admin, redirect to admin panel
  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  // If user is admin trying to access user pages, redirect to admin panel
  if (!adminOnly && user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return children;
};

export default PrivateRoute;