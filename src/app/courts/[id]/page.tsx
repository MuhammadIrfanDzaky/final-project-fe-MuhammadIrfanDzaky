import CourtDetails from './CourtDetails';

export default async function CourtDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const courtId = Number((await params).id);
  return <CourtDetails courtId={courtId} />;
}