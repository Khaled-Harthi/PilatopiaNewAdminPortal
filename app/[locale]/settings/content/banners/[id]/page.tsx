'use client';

import { use } from 'react';
import { BannerForm } from '@/components/settings/banner-form';

export default function EditBannerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const bannerId = parseInt(id, 10);

  return <BannerForm bannerId={bannerId} />;
}
