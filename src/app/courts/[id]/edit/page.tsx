import ClientEditCourt from './ClientEditCourt';
import { notFound } from 'next/navigation';
import { use } from 'react';

export default function EditCourtPage({ params }: { params: Promise<{ id: string }> }) {
  const courtId = use(params).id;
  if (!courtId) return notFound();
  return <ClientEditCourt courtId={courtId} />;
}