import React from 'react';
import { api } from '@/utils/api';
import ClientBookCourt from './ClientBookCourt';

export async function generateStaticParams() {
  try {
  const courts = await api.getCourts();
  return (courts as any[]).map((court: any) => ({ id: court.id }));
  } catch {
    return [];
  }
}

export default function BookCourtPage({ params }: { params: { id: string } }) {
  return <ClientBookCourt courtId={params.id} />;
}