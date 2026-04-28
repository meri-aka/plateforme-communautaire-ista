import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import UserLayout from './layout/UserLayout';

export default function UserProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/" replace />;

  return (
    <UserLayout>
      <Outlet />
    </UserLayout>
  );
}
