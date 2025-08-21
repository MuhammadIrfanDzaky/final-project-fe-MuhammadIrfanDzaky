import { use } from 'react';
import ClientCourtDetails from './ClientCourtDetails';

export default function CourtDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const courtId = use(params).id;
  return <ClientCourtDetails courtId={courtId} />;
}