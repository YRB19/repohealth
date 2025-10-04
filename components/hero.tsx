"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { useState } from "react"

export function Hero() {
  const router = useRouter()
  const [q, setQ] = useState("")

  return (
    <section className="section-grid border-b border-border/40">
      <div className="mx-auto max-w-6xl px-4 py-20 md:py-28">
        <div className="grid gap-8 md:grid-cols-2 md:items-center">
          <div className="space-y-6">
            <h1 className="text-balance text-4xl font-semibold leading-tight md:text-6xl">
              Find healthy repos,
              <br className="hidden md:block" /> not just popular ones
            </h1>
            <p className="text-pretty text-muted-foreground md:text-lg">
              Discover active, well-maintained open-source projects using a comprehensive health score instead of
              relying solely on stars.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                placeholder="Search repositories, e.g., astro, remix, or nextjs"
                className="h-11 bg-secondary text-foreground placeholder:text-muted-foreground"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") router.push(`/explorer?query=${encodeURIComponent(q)}`)
                }}
              />
              <Button
                className="h-11 bg-primary text-primary-foreground hover:opacity-90"
                onClick={() => router.push(`/explorer?query=${encodeURIComponent(q)}`)}
              >
                Explore Repositories
              </Button>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="rounded-full border border-border/60 px-3 py-1">Active devs</span>
              <span className="rounded-full border border-border/60 px-3 py-1">Recent releases</span>
              <span className="rounded-full border border-border/60 px-3 py-1">Docs quality</span>
            </div>
          </div>

          <div className="rounded-xl border border-border/50 bg-secondary p-4 md:p-6">
            <div className="rounded-lg border border-border/50 bg-background p-4">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Repo Health Preview</p>
                <span className="rounded-md bg-accent/20 px-2 py-1 text-xs text-accent-foreground">Demo</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Activity", score: "92" },
                  { label: "Community", score: "88" },
                  { label: "Docs", score: "86" },
                  { label: "Prod Ready", score: "90" },
                ].map((k) => (
                  <div key={k.label} className="rounded-lg border border-border/50 bg-secondary p-4">
                    <p className="text-xs text-muted-foreground">{k.label}</p>
                    <p className="mt-1 text-2xl font-semibold">{k.score}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
