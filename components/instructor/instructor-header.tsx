'use client';

import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

interface InstructorHeaderProps {
  locale: string;
}

export function InstructorHeader({ locale }: InstructorHeaderProps) {
  const { admin, logout } = useAuth();
  const isRTL = locale === 'ar';

  // Get first name only for mobile
  const firstName = admin?.name?.split(' ')[0] || '';

  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <span className="text-lg sm:text-xl font-semibold">Pilatopia</span>
        </div>

        {/* User info + Logout */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Full name on desktop, first name on mobile */}
          <span className="text-sm text-muted-foreground hidden sm:inline">
            {admin?.name}
          </span>
          <span className="text-sm text-muted-foreground sm:hidden">
            {firstName}
          </span>

          {/* Icon-only button on mobile, with text on desktop */}
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="px-2 sm:px-3"
          >
            <LogOut className="h-4 w-4" />
            <span className={`hidden sm:inline ${isRTL ? 'mr-2' : 'ml-2'}`}>
              {isRTL ? 'تسجيل الخروج' : 'Logout'}
            </span>
          </Button>
        </div>
      </div>
    </header>
  );
}
