import { NextResponse } from "next/server"

function dateFromTimeframe(tf?: string) {
  const now = new Date()
  if (tf === "week") {
    now.setDate(now.getDate() - 7)
  } else if (tf === "month") {
    now.setMonth(now.getMonth() - 1)
  } else if (tf === "year") {
    now.setFullYear(now.getFullYear() - 1)
  } else {
    return undefined
  }
  return now.toISOString().slice(0, 10)
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const query = (url.searchParams.get("query") || "").trim()
  const language = url.searchParams.get("language") || ""
  const license = url.searchParams.get("license") || ""
  const starsMin = url.searchParams.get("starsMin") || ""
  const timeframe = url.searchParams.get("timeframe") || "any"
  const sort = url.searchParams.get("sort") || "best-match"
  const topics = (url.searchParams.get("topics") || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
  const page = Number.parseInt(url.searchParams.get("page") || "1", 10)
  const perPage = Math.min(Number.parseInt(url.searchParams.get("perPage") || "20", 10), 50)

  const qualifiers: string[] = []

  // apply text query in name/description/readme by default
  let q = query ? `${query}` : ""

  if (language && language !== "any") qualifiers.push(`language:${language}`)
  if (license && license !== "any") qualifiers.push(`license:${license}`)
  if (starsMin) qualifiers.push(`stars:>=${starsMin}`)

  const pushedSince = dateFromTimeframe(timeframe)
  if (pushedSince) qualifiers.push(`pushed:>=${pushedSince}`)

  // avoid archived by default
  qualifiers.push("archived:false")

  // topics
  for (const t of topics) {
    qualifiers.push(`topic:${t}`)
  }

  if (qualifiers.length) {
    q = q ? `${q} ${qualifiers.join(" ")}` : qualifiers.join(" ")
  }

  const params = new URLSearchParams()
  params.set("q", q || "stars:>1")
  // sort mapping
  if (sort === "stars" || sort === "updated") {
    params.set("sort", sort)
    params.set("order", "desc")
  }
  params.set("per_page", String(perPage))
  params.set("page", String(page))

  const ghUrl = `https://api.github.com/search/repositories?${params.toString()}`

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "repohealth-preview",
  }
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
  }

  try {
    const res = await fetch(ghUrl, { headers, cache: "no-store" })
    const data = await res.json()

    if (!res.ok) {
      return NextResponse.json(
        { error: data?.message || "GitHub API error", status: res.status },
        { status: res.status || 500 },
      )
    }

    const items = Array.isArray(data.items) ? data.items : []
    // normalize shape
    const results = items.map((r: any) => ({
      id: r.id,
      name: r.name,
      owner: r.owner?.login,
      fullName: r.full_name,
      htmlUrl: r.html_url,
      description: r.description,
      stars: r.stargazers_count,
      language: r.language,
      license: r.license?.spdx_id || r.license?.key || null,
      updatedAt: r.updated_at,
      forks: r.forks_count,
      watchers: r.watchers_count,
      openIssues: r.open_issues_count,
    }))

    return NextResponse.json({
      totalCount: data.total_count || 0,
      items: results,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unexpected error" }, { status: 500 })
  }
}
