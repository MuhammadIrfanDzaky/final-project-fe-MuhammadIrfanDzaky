import React from 'react';
import { mockApi } from '@/utils/mockApi';
import ClientCourtDetails from './ClientCourtDetails';

export async function generateStaticParams() {
  try {
    const courts = await mockApi.courts.getAll();
    return courts.map((court) => ({ id: court.id }));
  } catch {
    return [];
  }
}

export default function CourtDetailsPage({ params }: { params: { id: string } }) {
  return <ClientCourtDetails courtId={params.id} />;
}