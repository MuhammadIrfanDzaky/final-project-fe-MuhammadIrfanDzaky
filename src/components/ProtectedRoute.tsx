'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { canAccessRoute } from '@/utils/roleGuard';

interface ProtectedRouteProps {
  children: React.ReactNode;
  route: string;
}

export default function ProtectedRoute(props: ProtectedRouteProps) {
  const { children, route } = props;
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/auth/login');
        return;
      }

      if (!canAccessRoute(user, route)) {
        router.push('/dashboard');
        return;
      }
    }
  }, [user, loading, route, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user || !canAccessRoute(user, route)) {
    return null;
  }

  return <>{children}</>;
}