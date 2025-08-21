import ClientCourtDetails from './ClientCourtDetails';

export default function CourtDetailsPage({ params }: { params: { id: string } }) {
  return <ClientCourtDetails courtId={params.id} />;
}