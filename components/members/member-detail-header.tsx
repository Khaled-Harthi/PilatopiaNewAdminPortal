'use client';

import { ArrowLeft, ArrowRight, Pencil, Plus } from 'lucide-react';
import { useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/routing';

interface MemberDetailHeaderProps {
  memberId: string;
  onBookClass?: () => void;
}

export function MemberDetailHeader({ memberId, onBookClass }: MemberDetailHeaderProps) {
  const locale = useLocale();
  const BackArrow = locale === 'ar' ? ArrowRight : ArrowLeft;

  return (
    <header className="bg-card border-b">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/members">
            <Button variant="ghost" size="sm" className="gap-2">
              <BackArrow className="h-4 w-4" />
              Members
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            {onBookClass && (
              <Button size="sm" onClick={onBookClass} className="gap-2">
                <Plus className="h-4 w-4" />
                Book Class
              </Button>
            )}
            <Link href={`/members/${memberId}/edit`}>
              <Button variant="ghost" size="sm" className="gap-2">
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
