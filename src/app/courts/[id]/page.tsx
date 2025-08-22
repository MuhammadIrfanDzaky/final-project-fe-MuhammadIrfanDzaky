import { use } from 'react';
import ClientCourtDetails from './ClientCourtDetails';

export default function CourtDetailsPage({ params }: { params: Promise<{ id: number }> }) {
  const courtId = use(params).id;
  return <ClientCourtDetails courtId={courtId} />;
}