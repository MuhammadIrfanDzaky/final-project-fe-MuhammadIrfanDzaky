import { use } from 'react';
import ClientBookCourt from './ClientBookCourt';

export default function BookCourtPage({ params }: { params: Promise<{ id: number }> }) {
  const courtId = use(params).id;
  return <ClientBookCourt courtId={courtId} />;
}