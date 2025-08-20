import ClientEditCourt from './ClientEditCourt';
import { notFound } from 'next/navigation';
import { mockApi } from '@/utils/mockApi';

export async function generateStaticParams() {
  const courts = await mockApi.courts.getAll();
  return courts.map((court) => ({ id: court.id }));
}

interface EditCourtPageProps {
  params: { id: string };
}

export default function EditCourtPage({ params }: EditCourtPageProps) {
  const courtId = params.id;
  if (!courtId) return notFound();
  return <ClientEditCourt courtId={courtId} />;
}