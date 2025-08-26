import BookCourt from "./BookCourt";

export default async function BookCourtPage({ params }: { params: Promise<{ id: string }> }) {
  const courtId = Number((await params).id);
  return <BookCourt courtId={courtId} />;
}