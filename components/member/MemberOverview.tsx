'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Gift } from 'lucide-react';

interface MemberProfile {
  id: string;
  name: string;
  phoneNumber: string;
  birthDate: string;
  joiningDate: string;
  membershipStatus: 'active' | 'expired' | 'no membership';
  points: number;
}

export function MemberOverview({ profile }: { profile: MemberProfile }) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Birth Date</span>
            <span className="font-medium">{formatDate(profile.birthDate)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Joining Date</span>
            <span className="font-medium">{formatDate(profile.joiningDate)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Phone</span>
            <span className="font-medium">{profile.phoneNumber}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Loyalty Points
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="text-4xl font-bold text-primary">{profile.points}</div>
            <p className="text-sm text-muted-foreground mt-2">Points Available</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
