import { Navigate, useLocation } from 'react-router-dom';

export const AuthGuard = ({ children }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export const PublicGuard = ({ children }) => {
  const token = localStorage.getItem('token');
  const location = useLocation();
  const isAuthPage = ['/login', '/register', '/recover-password', '/verification-code', '/change-password'].includes(location.pathname);

  if (token && isAuthPage) {
    return <Navigate to="/" replace />;
  }

  return children;
};