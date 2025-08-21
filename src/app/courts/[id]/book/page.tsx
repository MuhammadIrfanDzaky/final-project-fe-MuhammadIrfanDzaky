import { use } from 'react';
import ClientBookCourt from './ClientBookCourt';

export default function BookCourtPage({ params }: { params: Promise<{ id: string }> }) {
  const courtId = use(params).id;
  return <ClientBookCourt courtId={courtId} />;
}