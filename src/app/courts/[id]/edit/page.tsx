import ClientEditCourt from './ClientEditCourt';
import { notFound } from 'next/navigation';
import { api } from '@/utils/api';

export async function generateStaticParams() {
  const courts = await api.getCourts();
  return (courts as any[]).map((court: any) => ({ id: court.id }));
}

interface EditCourtPageProps {
  params: { id: string };
}

export default function EditCourtPage({ params }: EditCourtPageProps) {
  const courtId = params.id;
  if (!courtId) return notFound();
  return <ClientEditCourt courtId={courtId} />;
}