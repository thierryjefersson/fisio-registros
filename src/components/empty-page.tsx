export function EmptyPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section aria-labelledby="page-title">
      <h1 className="text-2xl font-semibold tracking-tight" id="page-title">
        {title}
      </h1>
      <div className="mt-6 rounded-xl border border-dashed border-border bg-card px-6 py-12 text-center">
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </section>
  );
}
