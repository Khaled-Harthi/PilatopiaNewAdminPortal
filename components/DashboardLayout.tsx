"use client"

import { useLocale } from 'next-intl'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
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
          <main className="flex-1 p-6">
            {children}
          </main>
        </SidebarInset>
        <GlobalSearch />
      </SidebarProvider>
    </ProtectedRoute>
  )
}
