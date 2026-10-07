import React, { useEffect } from 'react';

interface AdminAuthGuardProps {
  isLoading: boolean;
  isAuthenticated: boolean;
  onRedirectToLogin: () => void;
  children: React.ReactNode;
}

/**
 * AdminAuthGuard
 * Explicitly guards administrator routes against unauthenticated access.
 * Handles three distinct states:
 * 1. loading auth session -> renders dedicated verification loader
 * 2. no authenticated session -> redirects to /admin/login
 * 3. authenticated session -> renders Admin Dashboard
 */
export const AdminAuthGuard: React.FC<AdminAuthGuardProps> = ({
  isLoading,
  isAuthenticated,
  onRedirectToLogin,
  children,
}) => {
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      onRedirectToLogin();
    }
  }, [isLoading, isAuthenticated, onRedirectToLogin]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4 py-12">
        <div className="w-9 h-9 rounded-full border-2 border-slate-700 border-t-green-500 animate-spin" />
        <p className="mt-4 text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
          Verifying Administrator Session...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4 py-12">
        <div className="w-9 h-9 rounded-full border-2 border-slate-700 border-t-amber-500 animate-spin" />
        <p className="mt-4 text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
          Access Restricted • Redirecting to Admin Login...
        </p>
      </div>
    );
  }

  return <>{children}</>;
};
