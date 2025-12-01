"use client"

import { useTranslations } from 'next-intl'
import { useAuth } from '@/hooks/useAuth'
import { usePathname } from 'next/navigation'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { Link } from '@/i18n/routing'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

export function AppSidebar({ side = 'left' }: { side?: 'left' | 'right' }) {
  const t = useTranslations('Navigation')
  const { admin, logout } = useAuth()
  const pathname = usePathname()

  const isSuperAdmin = admin?.role === 'super_admin'

  const menuItems = [
    {
      title: t('home'),
      url: '/',
    },
    {
      title: t('members'),
      url: '/members',
    },
    {
      title: t('schedule'),
      url: '/schedule',
    },
    // Settings only visible to super_admin
    ...(isSuperAdmin ? [{
      title: t('settings'),
      url: '/settings',
    }] : []),
  ]

  // Check if path is active (handle locale prefix)
  const isActive = (url: string) => {
    const cleanPath = pathname.replace(/^\/(en|ar)/, '') || '/'
    return cleanPath === url || (url !== '/' && cleanPath.startsWith(url))
  }

  return (
    <Sidebar side={side} className="!border-r-0">
      <SidebarHeader>
        <div className="px-4 py-4">
          <h2 className="text-lg font-semibold">Pilatopia Console</h2>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-xs text-muted-foreground uppercase">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    className="px-4 py-2"
                  >
                    <Link href={item.url}>
                      {item.title}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {admin && (
          <SidebarGroup className="mt-auto">
            <SidebarGroupLabel className="px-4 text-xs text-muted-foreground uppercase">
              Account
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="px-4 py-2">
                <p className="text-sm font-medium">{admin.name}</p>
                <p className="text-xs text-muted-foreground">{admin.email}</p>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter className="gap-2">
        <div className="px-4 py-2">
          <LanguageSwitcher />
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={logout} className="px-4 py-2">
              {t('logout')}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
