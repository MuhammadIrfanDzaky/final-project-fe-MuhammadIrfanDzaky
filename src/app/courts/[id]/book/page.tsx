import React from 'react';
import { mockApi } from '@/utils/mockApi';
import ClientBookCourt from './ClientBookCourt';

export async function generateStaticParams() {
  try {
    const courts = await mockApi.courts.getAll();
    return courts.map((court) => ({ id: court.id }));
  } catch {
    return [];
  }
}

export default function BookCourtPage({ params }: { params: { id: string } }) {
  return <ClientBookCourt courtId={params.id} />;
}