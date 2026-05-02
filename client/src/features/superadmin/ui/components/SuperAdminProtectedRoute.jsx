import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

const SuperAdminProtectedRoute = () => {
  const { user } = useSelector((state) => state.auth);
  
  if (!user || user.role !== 'superadmin') {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default SuperAdminProtectedRoute;
