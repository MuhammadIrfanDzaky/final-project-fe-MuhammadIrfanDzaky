import EditCourt from './EditCourt';

export default async function EditCourtPage({ params }: { params: Promise<{ id: string }> }) {
    const courtId = Number((await params).id);
  return <EditCourt courtId={courtId} />;
}