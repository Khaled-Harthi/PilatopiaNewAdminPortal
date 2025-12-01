import { redirect } from 'next/navigation';

export default function LoyaltyPage() {
  redirect('/settings/config/loyalty/tiers');
}
