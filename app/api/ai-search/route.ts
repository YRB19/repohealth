import { NextResponse } from "next/server"
// import { generateText } from "ai"

function dateFromTimeframe(tf?: string) {
  const now = new Date()
  if (tf === "week") now.setDate(now.getDate() - 7)
  else if (tf === "month") now.setMonth(now.getMonth() - 1)
  else if (tf === "year") now.setFullYear(now.getFullYear() - 1)
  else return undefined
  return now.toISOString().slice(0, 10)
}

function extractJsonArray(text: string): any[] {
  try {
    return JSON.parse(text)
  } catch {
    const start = text.indexOf("[")
    const end = text.lastIndexOf("]")
    if (start !== -1 && end !== -1 && end > start) {
      const slice = text.slice(start, end + 1)
      try {
        return JSON.parse(slice)
      } catch {
        return []
      }
    }
    return []
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const aiPrompt = (url.searchParams.get("aiPrompt") || "").trim()
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
  const perPage = Math.min(Number.parseInt(url.searchParams.get("perPage") || "20", 10), 20)

  // Build GitHub search query using filters + any provided keywords (query) + AI prompt as keywords
  const qualifiers: string[] = []
  const qTerms = [query, aiPrompt].filter(Boolean).join(" ").trim()

  if (language && language !== "any") qualifiers.push(`language:${language}`)
  if (license && license !== "any") qualifiers.push(`license:${license}`)
  if (starsMin) qualifiers.push(`stars:>=${starsMin}`)

  const pushedSince = dateFromTimeframe(timeframe)
  if (pushedSince) qualifiers.push(`pushed:>=${pushedSince}`)

  qualifiers.push("archived:false")
  for (const t of topics) qualifiers.push(`topic:${t}`)

  const builtQuery = [qTerms, ...qualifiers].filter(Boolean).join(" ").trim()

  const params = new URLSearchParams()
  params.set("q", builtQuery || "stars:>1")
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
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`

  try {
    // 1) Get real repositories from GitHub
    const res = await fetch(ghUrl, { headers, cache: "no-store" })
    const data = await res.json()
    if (!res.ok) {
      return NextResponse.json(
        { error: data?.message || "GitHub API error", status: res.status },
        { status: res.status || 500 },
      )
    }

    const items = Array.isArray(data.items) ? data.items : []
    const repos = items.map((r: any) => ({
      id: r.id,
      name: r.name,
      owner: r.owner?.login,
      fullName: r.full_name,
      htmlUrl: r.html_url,
      description: r.description || "",
      stars: r.stargazers_count,
      language: r.language || "",
      license: r.license?.spdx_id || r.license?.key || null,
      updatedAt: r.updated_at,
      forks: r.forks_count,
      watchers: r.watchers_count,
      openIssues: r.open_issues_count,
    }))

    // Fast exit if no repos
    if (repos.length === 0) {
      return NextResponse.json({ totalCount: 0, items: [] })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      // graceful fallback if key not present
      return NextResponse.json(
        {
          error: "Missing GEMINI_API_KEY. AI summaries are unavailable.",
          items: repos,
          totalCount: data.total_count || repos.length,
        },
        { status: 200 },
      )
    }

    const prompt = `
You are a helpful technical writer. Given the following GitHub repository metadata, write a concise professional paragraph for each repo that:
- Explains what the project does and why it's useful
- Highlights main technologies or unique features
- Sounds like a human-written tech overview
- Avoids bullet points and marketing fluff

Return ONLY a JSON array. Each item MUST be:
{
  "fullName": string,
  "summary": string
}

Here is the data:
${JSON.stringify(
  repos.map((r) => ({
    fullName: r.fullName,
    description: r.description,
    stars: r.stars,
    language: r.language,
  })),
)}
    `.trim()

    // Gemini v1beta REST: generateContent
    const geminiRes = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + apiKey,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 800,
            responseMimeType: "application/json",
          },
        }),
      },
    )

    if (!geminiRes.ok) {
      const body = await geminiRes.json().catch(() => ({}))
      // Return GitHub results without AI summaries on failure
      return NextResponse.json(
        {
          error: body?.error?.message || "Gemini request failed",
          totalCount: data.total_count || repos.length,
          items: repos,
        },
        { status: 200 },
      )
    }

    const geminiJson = await geminiRes.json()
    // Response shape: candidates[0].content.parts[0].text
    const text =
      geminiJson?.candidates?.[0]?.content?.parts?.[0]?.text ??
      geminiJson?.candidates?.[0]?.output ?? // safety fallback
      ""

    const parsed = extractJsonArray(text)
    const summaryMap = new Map<string, string>()
    for (const row of parsed) {
      if (row && typeof row.fullName === "string" && typeof row.summary === "string") {
        summaryMap.set(row.fullName, row.summary.trim())
      }
    }

    const enriched = repos.map((r) => ({
      ...r,
      aiSummary: summaryMap.get(r.fullName) || "",
    }))

    return NextResponse.json({
      totalCount: data.total_count || enriched.length,
      items: enriched,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unexpected error" }, { status: 500 })
  }
}
