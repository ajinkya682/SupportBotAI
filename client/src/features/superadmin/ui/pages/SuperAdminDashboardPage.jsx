import { useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import SuperAdminLayout from '../layout/SuperAdminLayout';

const SuperAdminDashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('superAdminToken');
    if (!token) navigate('/super-admin/login');
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('superAdminToken');
    navigate('/super-admin/login');
  };

  return (
    <SuperAdminLayout handleLogout={handleLogout}>
      <Outlet />
    </SuperAdminLayout>
  );
};

export default SuperAdminDashboard;
