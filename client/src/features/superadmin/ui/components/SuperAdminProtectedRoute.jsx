import { Navigate, Outlet } from 'react-router-dom';

const SuperAdminProtectedRoute = () => {
  const token = localStorage.getItem('superAdminToken');
  
  if (!token) {
    return <Navigate to="/super-admin/login" replace />;
  }
  
  return <Outlet />;
};

export default SuperAdminProtectedRoute;
