"use client"

import { useLocale } from 'next-intl'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/AppSidebar'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { GlobalSearch } from '@/components/GlobalSearch'

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const locale = useLocale()
  const sidebarSide = locale === 'ar' ? 'right' : 'left'

  return (
    <ProtectedRoute>
      <SidebarProvider>
        <AppSidebar side={sidebarSide} />
        <SidebarInset>
          {/* Mobile header with sidebar trigger */}
          <header className="md:hidden sticky top-0 z-10 flex items-center gap-2 bg-background border-b px-4 py-3">
            <SidebarTrigger />
            <span className="font-semibold text-sm">Pilatopia</span>
          </header>
          <main className="flex-1 p-6">
            {children}
          </main>
        </SidebarInset>
        <GlobalSearch />
      </SidebarProvider>
    </ProtectedRoute>
  )
}
