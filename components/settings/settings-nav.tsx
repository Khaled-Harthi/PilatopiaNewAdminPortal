'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Layers,
  DoorOpen,
  Tags,
  Users,
  Bell,
  HelpCircle,
  CreditCard,
  Trophy,
  Shield,
  Menu,
  ChevronRight,
  Image,
  LayoutGrid,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

interface NavItem {
  title: string;
  titleAr: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavGroup {
  label: string;
  labelAr: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: 'Content',
    labelAr: 'المحتوى',
    items: [
      { title: 'Class Types', titleAr: 'أنواع الحصص', href: '/settings/content/class-types', icon: Layers },
      { title: 'Rooms', titleAr: 'الغرف', href: '/settings/content/rooms', icon: DoorOpen },
      { title: 'Tags', titleAr: 'الوسوم', href: '/settings/content/tags', icon: Tags },
      { title: 'Instructors', titleAr: 'المدربين', href: '/settings/content/instructors', icon: Users },
      { title: 'Banners', titleAr: 'البانرات', href: '/settings/content/banners', icon: Image },
      { title: 'Home Layouts', titleAr: 'تخطيطات الرئيسية', href: '/settings/content/home-layouts', icon: LayoutGrid },
      { title: 'Notifications', titleAr: 'الإشعارات', href: '/settings/content/notifications', icon: Bell },
      { title: 'FAQ', titleAr: 'الأسئلة الشائعة', href: '/settings/content/faq', icon: HelpCircle },
    ],
  },
  {
    label: 'Configuration',
    labelAr: 'الإعدادات',
    items: [
      { title: 'Membership Plans', titleAr: 'خطط العضوية', href: '/settings/config/plans', icon: CreditCard },
      { title: 'Loyalty Program', titleAr: 'برنامج الولاء', href: '/settings/config/loyalty', icon: Trophy },
    ],
  },
  {
    label: 'Administration',
    labelAr: 'الإدارة',
    items: [
      { title: 'Admin Users', titleAr: 'المسؤولين', href: '/settings/admins', icon: Shield },
    ],
  },
];

function NavContent({ onLinkClick }: { onLinkClick?: () => void }) {
  const pathname = usePathname();
  const locale = useLocale();
  const isRTL = locale === 'ar';

  const isActive = (href: string) => {
    const cleanPath = pathname.replace(/^\/(en|ar)/, '') || '/';
    return cleanPath === href || cleanPath.startsWith(href + '/');
  };

  return (
    <div className="space-y-6">
      {navGroups.map((group) => (
        <div key={group.label}>
          <h3 className="px-2 mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {isRTL ? group.labelAr : group.label}
          </h3>
          <ul className="space-y-1">
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onLinkClick}
                    className={cn(
                      'flex items-center gap-2 px-2 py-2 rounded-md text-sm transition-colors',
                      active
                        ? 'bg-background text-foreground font-medium shadow-sm'
                        : 'text-muted-foreground hover:bg-background/50 hover:text-foreground'
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{isRTL ? item.titleAr : item.title}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}

function getCurrentPageTitle(pathname: string, isRTL: boolean): string {
  const cleanPath = pathname.replace(/^\/(en|ar)/, '') || '/';

  for (const group of navGroups) {
    for (const item of group.items) {
      if (cleanPath === item.href || cleanPath.startsWith(item.href + '/')) {
        return isRTL ? item.titleAr : item.title;
      }
    }
  }

  return isRTL ? 'الإعدادات' : 'Settings';
}

function getCurrentPageIcon(pathname: string): React.ComponentType<{ className?: string }> | null {
  const cleanPath = pathname.replace(/^\/(en|ar)/, '') || '/';

  for (const group of navGroups) {
    for (const item of group.items) {
      if (cleanPath === item.href || cleanPath.startsWith(item.href + '/')) {
        return item.icon;
      }
    }
  }

  return null;
}

export function SettingsNav() {
  const isMobile = useIsMobile();
  const [sheetOpen, setSheetOpen] = useState(false);
  const pathname = usePathname();
  const locale = useLocale();
  const isRTL = locale === 'ar';

  // Desktop: Show full sidebar
  if (!isMobile) {
    return (
      <nav className="w-56 shrink-0 border-e bg-muted/30 p-4 overflow-y-auto">
        <NavContent />
      </nav>
    );
  }

  // Mobile: Show menu button that opens a sheet
  const CurrentIcon = getCurrentPageIcon(pathname);
  const currentTitle = getCurrentPageTitle(pathname, isRTL);

  return (
    <>
      <div className="flex items-center gap-2 px-4 py-3 border-b bg-muted/30">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSheetOpen(true)}
          className="shrink-0"
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">{isRTL ? 'القائمة' : 'Menu'}</span>
        </Button>
        <div className="flex items-center gap-2 min-w-0">
          {CurrentIcon && <CurrentIcon className="h-4 w-4 shrink-0 text-muted-foreground" />}
          <span className="font-medium truncate">{currentTitle}</span>
        </div>
        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground ms-auto rtl:rotate-180" />
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side={isRTL ? 'right' : 'left'} className="w-72 p-0">
          <SheetHeader className="border-b px-4 py-3">
            <SheetTitle>{isRTL ? 'الإعدادات' : 'Settings'}</SheetTitle>
          </SheetHeader>
          <div className="p-4 overflow-y-auto max-h-[calc(100vh-60px)]">
            <NavContent onLinkClick={() => setSheetOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
