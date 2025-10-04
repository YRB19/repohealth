import { SiteHeader } from "@/components/site-header"
import { Hero } from "@/components/hero"
import { KpiStrip } from "@/components/kpi-strip"
import { Bento } from "@/components/bento"
import { Button } from "@/components/ui/button"

export default function Page() {
  return (
    <main className="min-h-dvh bg-background text-foreground">
      <SiteHeader />
      <Hero />
      <KpiStrip />
      <Bento />

      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="rounded-2xl border border-border/50 bg-secondary p-8 text-center md:p-12">
          <h3 className="text-2xl font-semibold">Ready to explore healthy repositories?</h3>
          <p className="mt-2 text-muted-foreground">Use our health score to choose dependable OSS in minutes.</p>
          <div className="mt-6 flex justify-center">
            <Button className="bg-primary text-primary-foreground hover:opacity-90">Open Explorer</Button>
          </div>
        </div>
      </section>

      <div className="pb-8" />
    </main>
  )
}
