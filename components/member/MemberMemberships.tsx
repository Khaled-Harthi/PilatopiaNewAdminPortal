'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, MoreVertical } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { AddMembershipSheet } from './AddMembershipSheet';
import apiClient from '@/lib/axios';

interface Transaction {
  id: string;
  startDate: string;
  classCount: number;
  pricePaid: number;
  usedBalance: number;
  remainingBalance: number;
  expiryDate: string;
  membershipId: number;
}

interface TransactionsResponse {
  transactions: Transaction[];
}

export function MemberMemberships({ memberId, onUpdate }: { memberId: string; onUpdate: () => void }) {
  const t = useTranslations('MemberProfile.Memberships');
  const tCommon = useTranslations('Common');

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const loadTransactions = async () => {
    setIsLoading(true);
    try {
      const response = await apiClient.get<TransactionsResponse>(`/admin/members/${memberId}/transactions`);
      setTransactions(response.data.transactions || []);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [memberId]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getDaysUntil = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusText = (transaction: Transaction) => {
    const now = new Date();
    const startDate = new Date(transaction.startDate);
    const expiryDate = new Date(transaction.expiryDate);

    // Not started yet
    if (startDate > now) {
      const daysUntilStart = getDaysUntil(transaction.startDate);
      if (daysUntilStart === 0) return { text: t('status.startsToday'), variant: 'default' as const };
      return { text: t('status.startsInDays', { days: daysUntilStart }), variant: 'secondary' as const };
    }

    // All balance used
    if (transaction.remainingBalance === 0) {
      return { text: t('status.expired'), variant: 'destructive' as const };
    }

    // Active but will expire
    if (expiryDate > now) {
      const daysUntilExpiry = getDaysUntil(transaction.expiryDate);
      if (daysUntilExpiry === 0) return { text: t('status.expiresToday'), variant: 'destructive' as const };
      return { text: t('status.expiresInDays', { days: daysUntilExpiry }), variant: 'default' as const };
    }

    // Expired
    return { text: t('status.expired'), variant: 'destructive' as const };
  };

  const isActive = (transaction: Transaction) => {
    const now = new Date();
    const startDate = new Date(transaction.startDate);
    const expiryDate = new Date(transaction.expiryDate);

    return startDate <= now && expiryDate > now && transaction.remainingBalance > 0;
  };

  const handleAddMembership = () => {
    setIsDialogOpen(true);
  };

  const handleSuccess = () => {
    loadTransactions();
    onUpdate();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">{t('title')}</h3>
        <Button onClick={handleAddMembership}>
          <Plus className="h-4 w-4 mr-2" />
          {t('addMembership')}
        </Button>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">{t('loading')}</p>
          </CardContent>
        </Card>
      ) : transactions.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">
              {t('noMembershipsFound')}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('tableHeaders.planName')}</TableHead>
                  <TableHead>{t('tableHeaders.startDate')}</TableHead>
                  <TableHead>{t('tableHeaders.usage')}</TableHead>
                  <TableHead>{t('tableHeaders.remaining')}</TableHead>
                  <TableHead>{t('tableHeaders.pricePaid')}</TableHead>
                  <TableHead>{t('tableHeaders.status')}</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction, index) => {
                  const status = getStatusText(transaction);
                  const active = isActive(transaction);

                  return (
                    <TableRow key={`${transaction.id}-${index}`}>
                      <TableCell className="font-medium">
                        {t('membershipNumber', { id: transaction.membershipId })}
                      </TableCell>
                      <TableCell>{formatDate(transaction.startDate)}</TableCell>
                      <TableCell>
                        {transaction.usedBalance} / {transaction.classCount}
                      </TableCell>
                      <TableCell>{transaction.remainingBalance}</TableCell>
                      <TableCell>${typeof transaction.pricePaid === 'number' ? transaction.pricePaid.toFixed(2) : transaction.pricePaid}</TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.text}</Badge>
                      </TableCell>
                      <TableCell>
                        {active && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>{t('actions.extend')}</DropdownMenuItem>
                              <DropdownMenuItem>{t('actions.addClass')}</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Add Membership Sheet */}
      <AddMembershipSheet
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        memberId={memberId}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
