import { Navigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export function ProtectedRoute({ children }) {
  const location = useLocation();
  const { isAuthenticated } = useApp();

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  return children;
}

export function GuestRoute({ children }) {
  const { isAuthenticated } = useApp();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}