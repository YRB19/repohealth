"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { InputGroup, InputGroupText } from "@/components/ui/input-group"

function setParam(url: URL, key: string, val: string | null) {
  if (val === null || val === "" || val === "any") {
    url.searchParams.delete(key)
  } else {
    url.searchParams.set(key, val)
  }
}

export function FilterBar() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [qInput, setQInput] = useState(searchParams.get("query") || "")
  const [stars, setStars] = useState<number>(Number.parseInt(searchParams.get("starsMin") || "0", 10))

  // Track last applied stars to avoid redundant URL updates
  const lastAppliedStarsRef = useRef<number>(Number.parseInt(searchParams.get("starsMin") || "0", 10))

  useEffect(() => {
    setQInput(searchParams.get("query") || "")
    setStars(Number.parseInt(searchParams.get("starsMin") || "0", 10))
    // keep ref in sync when URL changes externally
    lastAppliedStarsRef.current = Number.parseInt(searchParams.get("starsMin") || "0", 10)
  }, [searchParams])

  const onApply = useCallback(() => {
    const url = new URL(window.location.href)
    setParam(url, "query", qInput)
    setParam(url, "language", searchParams.get("language"))
    setParam(url, "license", searchParams.get("license"))
    setParam(url, "timeframe", searchParams.get("timeframe"))
    setParam(url, "sort", searchParams.get("sort"))
    setParam(url, "topics", searchParams.get("topics"))
    setParam(url, "starsMin", String(stars))
    setParam(url, "page", "1") // reset page on apply
    router.replace(`${pathname}?${url.searchParams.toString()}`)
  }, [qInput, stars, pathname, router, searchParams])

  const setURLParam = useCallback(
    (key: string, value: string) => {
      const url = new URL(window.location.href)
      setParam(url, key, value)
      if (key !== "page") setParam(url, "page", "1")
      router.replace(`${pathname}?${url.searchParams.toString()}`)
    },
    [pathname, router],
  )

  // Debounce stars changes so the slider feels responsive and URL updates trigger SWR reliably.
  useEffect(() => {
    if (stars === lastAppliedStarsRef.current) return
    const t = setTimeout(() => {
      setURLParam("starsMin", String(stars))
      lastAppliedStarsRef.current = stars
    }, 300)
    return () => clearTimeout(t)
  }, [stars, setURLParam])

  const language = searchParams.get("language") || "any"
  const license = searchParams.get("license") || "any"
  const timeframe = searchParams.get("timeframe") || "any"
  const sort = searchParams.get("sort") || "best-match"
  const topics = searchParams.get("topics") || ""

  const languages = useMemo(
    () => ["any", "TypeScript", "JavaScript", "Python", "Go", "Rust", "Java", "C++", "C#", "Ruby"],
    [],
  )
  const licenses = useMemo(() => ["any", "mit", "apache-2.0", "gpl-3.0", "mpl-2.0", "bsd-3-clause", "unlicense"], [])
  const timeframes = useMemo(() => ["any", "week", "month", "year"], [])

  return (
    <div className="mb-6 rounded-xl border border-border/50 bg-secondary p-4">
      <div className="grid gap-4 md:grid-cols-4">
        <div className="md:col-span-2">
          <InputGroup>
            <Input
              placeholder="Search repositories"
              value={qInput}
              onChange={(e) => setQInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onApply()
              }}
            />
            <InputGroupText className="cursor-pointer" onClick={onApply}>
              Apply
            </InputGroupText>
          </InputGroup>
          <p className="mt-1 text-xs text-muted-foreground">Press Enter or click Apply to update results.</p>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs text-muted-foreground">Language</label>
          <Select value={language} onValueChange={(v) => setURLParam("language", v)}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              {languages.map((l) => (
                <SelectItem key={l} value={l}>
                  {l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs text-muted-foreground">License</label>
          <Select value={license} onValueChange={(v) => setURLParam("license", v)}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Any" />
            </SelectTrigger>
            <SelectContent>
              {licenses.map((l) => (
                <SelectItem key={l} value={l}>
                  {l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-4">
        <div className="flex flex-col gap-2">
          <label className="text-xs text-muted-foreground">Min Stars: {stars.toLocaleString()}</label>
          <Slider min={0} max={50000} step={500} value={[stars]} onValueChange={(vals) => setStars(vals[0] ?? 0)} />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs text-muted-foreground">Updated</label>
          <Select value={timeframe} onValueChange={(v) => setURLParam("timeframe", v)}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Any time" />
            </SelectTrigger>
            <SelectContent>
              {timeframes.map((t) => (
                <SelectItem key={t} value={t}>
                  {t === "any" ? "Any time" : `Last ${t}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs text-muted-foreground">Sort</label>
          <Select value={sort} onValueChange={(v) => setURLParam("sort", v)}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Best match" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="best-match">Best match</SelectItem>
              <SelectItem value="stars">Stars</SelectItem>
              <SelectItem value="updated">Recently updated</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs text-muted-foreground">Topics (comma separated)</label>
          <Input placeholder="react, nextjs" value={topics} onChange={(e) => setURLParam("topics", e.target.value)} />
        </div>
      </div>
    </div>
  )
}
