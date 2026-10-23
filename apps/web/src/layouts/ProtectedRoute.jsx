import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Skeleton } from '../components/common/EmptyState.jsx';

export function ProtectedRoute({ allowedRole }) {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[#FBFBF9]">
        <div className="space-y-4 w-72 text-center">
          <div className="w-10 h-10 border-4 border-indigo-900 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-medium text-neutral-600">Verifying BookLeaf session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    // If author tries to enter admin or vice-versa, redirect to their proper dashboard
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/author/dashboard'} replace />;
  }

  return <Outlet />;
}
