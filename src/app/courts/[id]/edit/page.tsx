import ClientEditCourt from './ClientEditCourt';
import { notFound } from 'next/navigation';

export default function EditCourtPage({ params }: { params: { id: string } }) {
  const courtId = params.id;
  if (!courtId) return notFound();
  return <ClientEditCourt courtId={courtId} />;
}