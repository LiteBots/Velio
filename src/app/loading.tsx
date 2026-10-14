export default function Loading() {
  return (
    <section className="container-v pb-24 pt-14" aria-busy="true" aria-label="Wczytywanie">
      <div className="skeleton h-4 w-40" />
      <div className="skeleton mt-8 h-16 w-full max-w-2xl" />
      <div className="skeleton mt-4 h-16 w-2/3 max-w-xl" />
      <div className="skeleton mt-8 h-5 w-full max-w-lg" />
      <div className="mt-14 grid gap-4 md:grid-cols-3">
        <div className="skeleton h-48" />
        <div className="skeleton h-48" />
        <div className="skeleton h-48" />
      </div>
    </section>
  );
}
