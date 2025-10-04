export function KpiStrip() {
  const items = [
    { k: "20 days", s: "saved per release" },
    { k: "98%", s: "active maintainers" },
    { k: "300%", s: "search visibility" },
    { k: "6×", s: "faster to evaluate" },
  ]
  return (
    <section className="border-b border-border/40">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 px-4 py-8 sm:grid-cols-2 md:grid-cols-4">
        {items.map((i) => (
          <div key={i.k} className="rounded-xl border border-border/50 bg-secondary p-5">
            <p className="text-xl font-semibold">{i.k}</p>
            <p className="text-sm text-muted-foreground">{i.s}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
