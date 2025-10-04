import { SiteHeader } from "@/components/site-header"
import { ExplorerPageClient } from "@/components/explorer/explorer-page-client"
import { Suspense } from "react"

export default function ExplorerPage() {
  return (
    <main className="min-h-dvh bg-background text-foreground">
      <SiteHeader />
      <section className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-2xl font-semibold md:text-3xl">Explore Repositories</h1>
        <p className="mt-2 text-muted-foreground">
          Filter by language, license, stars, and recent activity to find healthy OSS faster.
        </p>
      </section>
      <Suspense fallback={null}>
        <ExplorerPageClient />
      </Suspense>
      <div className="pb-8" />
    </main>
  )
}
