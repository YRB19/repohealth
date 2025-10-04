"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

type Repo = {
  id: number
  fullName: string
  name: string
  owner: string
  htmlUrl: string
  description: string
  stars: number
  language: string
  license: string | null
  updatedAt: string
  forks: number
  watchers: number
  openIssues: number
}

export function ResultsList({
  items,
  totalCount,
}: {
  items: Repo[]
  totalCount: number
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const page = Number.parseInt(searchParams.get("page") || "1", 10)
  const perPage = Number.parseInt(searchParams.get("perPage") || "20", 10)
  const totalPages = Math.max(1, Math.ceil(totalCount / perPage))

  const goToPage = (p: number) => {
    const url = new URL(window.location.href)
    url.searchParams.set("page", String(p))
    router.replace(`${pathname}?${url.searchParams.toString()}`)
  }

  return (
    <div className="pb-10">
      <p className="mb-3 text-sm text-muted-foreground">
        Showing {items.length.toLocaleString()} of {totalCount.toLocaleString()} repositories
      </p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {items.map((r) => (
          <Card key={r.id} className="bg-secondary">
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-3">
                <a href={r.htmlUrl} target="_blank" rel="noreferrer" className="hover:underline">
                  {r.fullName}
                </a>
                <div className="flex items-center gap-2">
                  {r.language ? <Badge variant="secondary">{r.language}</Badge> : null}
                  {r.license ? <Badge variant="outline">{r.license}</Badge> : null}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="text-pretty text-muted-foreground">{r.description || "No description."}</p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span>★ {r.stars.toLocaleString()}</span>
                <span>Forks {r.forks.toLocaleString()}</span>
                <span>Issues {r.openIssues.toLocaleString()}</span>
                <span>Updated {new Date(r.updatedAt).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => goToPage(page - 1)}>
          Previous
        </Button>
        <p className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </p>
        <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => goToPage(page + 1)}>
          Next
        </Button>
      </div>
    </div>
  )
}
