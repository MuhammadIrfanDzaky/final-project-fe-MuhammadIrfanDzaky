import ClientBookCourt from './ClientBookCourt';

export default function BookCourtPage({ params }: { params: { id: string } }) {
  return <ClientBookCourt courtId={params.id} />;
}