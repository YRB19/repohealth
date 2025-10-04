import { NextResponse } from "next/server"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const owner = searchParams.get("owner")
    const repo = searchParams.get("repo")
    if (!owner || !repo) {
      return NextResponse.json({ error: "owner and repo are required" }, { status: 400 })
    }

    const headers: Record<string, string> = { Accept: "application/vnd.github.raw" }
    if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`

    // Get README raw markdown
    const readmeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, { headers })
    const readme = readmeRes.ok ? await readmeRes.text() : ""

    // Repo details for open issues, stars, language, updated_at
    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: { ...headers, Accept: "application/vnd.github+json" },
    })
    const repoJson = repoRes.ok ? await repoRes.json() : {}

    // Count good first issues (limit to 1 page for speed; use total_count via search API)
    const gfiRes = await fetch(
      `https://api.github.com/search/issues?q=repo:${owner}/${repo}+label:"good first issue"+state:open&per_page=1`,
      { headers: { ...headers, Accept: "application/vnd.github+json" } },
    )
    const gfiJson = gfiRes.ok ? await gfiRes.json() : { total_count: 0 }

    return NextResponse.json({
      readme,
      stats: {
        open_issues: repoJson?.open_issues_count ?? 0,
        stargazers: repoJson?.stargazers_count ?? 0,
        watchers: repoJson?.subscribers_count ?? 0,
        forks: repoJson?.forks_count ?? 0,
        language: repoJson?.language ?? null,
        updated_at: repoJson?.updated_at ?? null,
        good_first_issues: gfiJson?.total_count ?? 0,
      },
    })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "failed" }, { status: 500 })
  }
}
