import React from 'react';
import { api } from '@/utils/api';
import ClientCourtDetails from './ClientCourtDetails';

export async function generateStaticParams() {
  try {
  const courts = await api.getCourts();
  return (courts as any[]).map((court: any) => ({ id: court.id }));
  } catch {
    return [];
  }
}

export default function CourtDetailsPage({ params }: { params: { id: string } }) {
  return <ClientCourtDetails courtId={params.id} />;
}