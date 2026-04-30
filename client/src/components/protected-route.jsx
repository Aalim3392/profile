import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth-store.js';

function LoaderScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950">
      <div className="glass-panel rounded-3xl px-8 py-6 text-sm text-slate-200 shadow-glow">
        Checking your workspace access...
      </div>
    </div>
  );
}

export function ProtectedRoute({ children, role }) {
  const { user, token, loading } = useAuthStore();
  const location = useLocation();

  if (loading) {
    return <LoaderScreen />;
  }

  if (!token || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (role && user.role !== role) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/employee/dashboard'} replace />;
  }

  return children;
}
