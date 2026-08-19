import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import PageSpinner from '../components/ui/PageSpinner';

export default function PrivateRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <PageSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}
