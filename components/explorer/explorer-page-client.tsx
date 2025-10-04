"use client"

import useSWR from "swr"
import { useSearchParams } from "next/navigation"
import { FilterBar } from "./filter-bar"
import { ResultsList } from "./results-list"
import { Spinner } from "@/components/ui/spinner"
import { Empty } from "@/components/ui/empty"

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error || `Request failed: ${res.status}`)
  }
  return res.json()
}

export function ExplorerPageClient() {
  const searchParams = useSearchParams()

  const query = searchParams.get("query") || ""
  const language = searchParams.get("language") || "any"
  const license = searchParams.get("license") || "any"
  const healthMin = searchParams.get("healthMin") || "0"
  const timeframe = searchParams.get("timeframe") || "any"
  const sort = searchParams.get("sort") || "best-match"
  const page = searchParams.get("page") || "1"
  const perPage = searchParams.get("perPage") || "20"
  const topics = searchParams.get("topics") || ""
  const mode = searchParams.get("mode") || "normal"
  const aiPrompt = searchParams.get("aiPrompt") || ""

  const qs = new URLSearchParams({
    query,
    language,
    license,
    healthMin,
    timeframe,
    sort,
    page,
    perPage,
    topics,
    mode,
    aiPrompt,
  })

  const endpoint = mode === "ai" ? "/api/ai-search" : "/api/search"
  const { data, error, isLoading } = useSWR(`${endpoint}?${qs.toString()}`, fetcher, { revalidateOnFocus: false })

  return (
    <section className="mx-auto max-w-6xl px-4">
      <FilterBar />
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Spinner />
        </div>
      ) : error ? (
        <div className="py-10">
          <Empty
            title="Something went wrong"
            description={error.message || "Please try adjusting your filters or try again later."}
          />
        </div>
      ) : (data?.items?.length ?? 0) === 0 ? (
        <div className="py-10">
          <Empty title="No repositories found" description="Try broadening your filters." />
        </div>
      ) : (
        <ResultsList items={data.items} totalCount={data.totalCount} />
      )}
    </section>
  )
}
