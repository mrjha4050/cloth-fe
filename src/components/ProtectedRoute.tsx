import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    if (location.pathname !== '/auth') {
        toast.error('Please login to access this page');
    }
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return children;
}
