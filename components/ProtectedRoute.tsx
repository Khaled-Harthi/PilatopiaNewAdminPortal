'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useAuth } from '@/hooks/useAuth';
import type { AdminRole } from '@/lib/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: AdminRole[];
}

export function ProtectedRoute({ children, requiredRoles }: ProtectedRouteProps) {
  const { admin, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();

  useEffect(() => {
    if (isLoading) return;

    // Not logged in - redirect to login
    if (!admin) {
      router.push('/login');
      return;
    }

    // Check role-based access
    if (requiredRoles && !requiredRoles.includes(admin.role)) {
      // Redirect to appropriate dashboard based on role
      if (admin.role === 'instructor') {
        router.push(`/${locale}/instructor/schedule`);
      } else {
        router.push(`/${locale}`);
      }
      return;
    }

    // Auto-redirect logic based on current path and role
    const isInstructorPath = pathname.includes('/instructor/');
    const isAdminPath = !isInstructorPath && pathname !== `/${locale}/login`;

    // Instructor trying to access admin pages
    if (admin.role === 'instructor' && isAdminPath && pathname !== `/${locale}/instructor/schedule`) {
      router.push(`/${locale}/instructor/schedule`);
      return;
    }

    // Admin/staff trying to access instructor pages
    if ((admin.role === 'super_admin' || admin.role === 'staff') && isInstructorPath) {
      router.push(`/${locale}`);
      return;
    }
  }, [admin, isLoading, router, pathname, locale, requiredRoles]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!admin) {
    return null;
  }

  // Check if user has required role
  if (requiredRoles && !requiredRoles.includes(admin.role)) {
    return null;
  }

  return <>{children}</>;
}
