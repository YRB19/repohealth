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
  const healthMin = Number.parseInt(url.searchParams.get("healthMin") || "0", 10)
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

    // Helpers
    const clamp = (n: number, min = 0, max = 100) => Math.max(min, Math.min(max, n))
    const normalize = (arr: number[]) => {
      const min = Math.min(...arr)
      const max = Math.max(...arr)
      if (!isFinite(min) || !isFinite(max) || max === min) {
        // flat distribution → neutral 50
        return arr.map(() => 50)
      }
      return arr.map((v) => ((v - min) / (max - min)) * 100)
    }
    // Lower-is-better values (e.g., days since updated) → invert after normalizing
    const normalizeInverse = (arr: number[]) => normalize(arr).map((v) => 100 - v)

    // Prepare signals using available fields
    const now = Date.now()
    const forksArr = items.map((r: any) => Number(r.forks_count || 0))
    const watchersArr = items.map((r: any) => Number(r.watchers_count || 0))
    const issuesArr = items.map((r: any) => Number(r.open_issues_count || 0))
    const daysSinceUpdatedArr = items.map((r: any) => {
      const t = new Date(r.updated_at).getTime()
      const days = (now - t) / (1000 * 60 * 60 * 24)
      // cap at 2 years to bound the scale
      return Math.min(days, 730)
    })

    // Normalized 0–100 signals
    const activityNorm = normalize(forksArr) // activity proxy: forks
    const communityNorm = normalize(watchersArr) // community proxy: watchers
    const freshnessNorm = normalizeInverse(daysSinceUpdatedArr) // fresher → higher

    // Docs proxy: description length + license presence
    const docsNorm = items.map((r: any) => {
      const desc = (r.description || "").trim()
      const descScore = clamp((desc.length / 120) * 100) // ~120 chars → 100
      const licenseScore = r.license ? 100 : 50
      return clamp(0.7 * descScore + 0.3 * licenseScore)
    })

    // Compatibility proxy: language + license present
    const compatibilityNorm = items.map((r: any) => {
      const langScore = r.language ? 100 : 50
      const licenseScore = r.license ? 100 : 60
      return clamp(0.6 * langScore + 0.4 * licenseScore)
    })

    // Weights (sum to 1.0): Activity .30, Community .25, Docs .15, Freshness .15, Compatibility .15
    const WEIGHTS = { activity: 0.3, community: 0.25, docs: 0.15, freshness: 0.15, compatibility: 0.15 }

    // Attach scores to items
    const scored = items.map((r: any, i: number) => {
      const score =
        WEIGHTS.activity * activityNorm[i] +
        WEIGHTS.community * communityNorm[i] +
        WEIGHTS.docs * docsNorm[i] +
        WEIGHTS.freshness * freshnessNorm[i] +
        WEIGHTS.compatibility * compatibilityNorm[i]

      const healthScore = Number(score.toFixed(1))
      const healthLabel = healthScore >= 80 ? "Highly recommended" : healthScore >= 60 ? "Promising" : "Needs review"

      return { r, healthScore, healthLabel }
    })

    // Rank by health score (desc)
    scored.sort((a, b) => b.healthScore - a.healthScore)

    // Normalize shape, include health fields
    let results = scored.map(({ r, healthScore, healthLabel }) => ({
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
      // health fields (0–100)
      healthScore,
      healthLabel,
    }))

    if (Number.isFinite(healthMin) && healthMin > 0) {
      results = results.filter((r) => (r.healthScore ?? 0) >= healthMin)
    }

    return NextResponse.json({
      totalCount: results.length,
      items: results,
      ranking: "composite-health-score",
    })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unexpected error" }, { status: 500 })
  }
}
