"use client"

import * as React from "react"
import useSWR from "swr"
import ReactMarkdown from "react-markdown"
import { HealthScore } from "./health-score"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

type RepoLite = {
  full_name: string // owner/name
  name: string
  description?: string
  healthScore?: number
}

type Props = {
  open: boolean
  onOpenChange: (v: boolean) => void
  repo: RepoLite | null
}

export function RepoDetailsModal({ open, onOpenChange, repo }: Props) {
  const [owner, name] = React.useMemo(() => (repo?.full_name || "").split("/"), [repo?.full_name])
  const { data, isLoading } = useSWR(
    repo ? `/api/readme?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(name)}` : null,
    fetcher,
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl w-[95vw]">
        <DialogHeader>
          <DialogTitle className="text-pretty">{repo?.name}</DialogTitle>
          <DialogDescription className="text-pretty">{repo?.description}</DialogDescription>
        </DialogHeader>

        <div className="flex items-start gap-6">
          <HealthScore score={repo?.healthScore ?? 0} size={96} className="shrink-0" />
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Card className="bg-card">
              <CardContent className="p-3">
                <div className="text-muted-foreground">Open issues</div>
                <div className="font-medium">{data?.stats?.open_issues ?? "—"}</div>
              </CardContent>
            </Card>
            <Card className="bg-card">
              <CardContent className="p-3">
                <div className="text-muted-foreground">Good first issues</div>
                <div className="font-medium">{data?.stats?.good_first_issues ?? "—"}</div>
              </CardContent>
            </Card>
            <Card className="bg-card">
              <CardContent className="p-3">
                <div className="text-muted-foreground">Stars</div>
                <div className="font-medium">{data?.stats?.stargazers ?? "—"}</div>
              </CardContent>
            </Card>
            <Card className="bg-card">
              <CardContent className="p-3">
                <div className="text-muted-foreground">Primary language</div>
                <div className="font-medium">{data?.stats?.language ?? "—"}</div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="prose prose-invert max-w-none text-pretty">
          {isLoading ? (
            <div className="text-muted-foreground">Loading README…</div>
          ) : data?.readme ? (
            <ReactMarkdown>{data.readme}</ReactMarkdown>
          ) : (
            <div className="text-muted-foreground">README not available.</div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {repo?.full_name && (
            <a className="inline-block" href={`https://github.com/${repo.full_name}`} target="_blank" rel="noreferrer">
              <Button>View on GitHub</Button>
            </a>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
