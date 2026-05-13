# RepoHealth

> Instant analytics and health insights for your GitHub repositories.

**Live demo:** [repohealth.vercel.app](https://repohealth.vercel.app)

---

## What is RepoHealth?

RepoHealth is a web app that surfaces meaningful health signals for any GitHub repository — things like commit activity, issue trends, contributor patterns, and more — in a clean, readable dashboard. It's built for developers who want a quick read on a repo's vitality without digging through raw GitHub stats.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| UI Components | shadcn/ui (Radix UI) |
| Styling | Tailwind CSS v4 |
| Charts | Recharts |
| Data Fetching | SWR |
| AI Features | Vercel AI SDK |
| Deployment | Vercel |

---

## Features

- **Repository health dashboard** — at-a-glance metrics for any public GitHub repo
- **Visual analytics** — charts powered by Recharts for commit history, issue activity, and more
- **AI-assisted insights** — natural language summaries via the Vercel AI SDK
- **Responsive UI** — works on desktop and mobile
- **Themeable** — light/dark mode support via `next-themes`

---

## Project Structure

```
repohealth/
├── app/              # Next.js App Router — pages, layouts, API routes
├── components/       # Reusable UI components (shadcn/ui + custom)
├── lib/              # Utility functions, GitHub API helpers, data transforms
├── public/           # Static assets
├── styles/           # Global CSS and Tailwind config
├── next.config.mjs
├── tsconfig.json
└── package.json
```

---

## Getting Started

**Prerequisites:** Node.js 18+, pnpm (recommended)

```bash
# Clone the repo
git clone https://github.com/YRB19/repohealth.git
cd repohealth

# Install dependencies
pnpm install

# Start the dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

Create a `.env.local` file in the project root:

```env
# GitHub Personal Access Token (for higher API rate limits)
GITHUB_TOKEN=your_github_pat_here
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Run production build locally |
| `pnpm lint` | Lint with ESLint |

---

## Deployment

RepoHealth is deployed on [Vercel](https://vercel.com). To deploy your own instance:

1. Fork this repository
2. Import it into Vercel
3. Add any required environment variables in the Vercel dashboard
4. Deploy — Vercel handles the rest

---

## Contributing

Contributions are welcome! Here's how to get involved:

1. Fork the repo and create a feature branch (`git checkout -b feat/my-feature`)
2. Make your changes and commit them (`git commit -m 'feat: add my feature'`)
3. Push to your fork and open a Pull Request
4. Open an issue first for larger changes so we can discuss the approach

Please follow existing code style and keep PRs focused.

---

## License

Distributed under the [MIT License](LICENSE).

---

*Built with Next.js · Deployed on Vercel*
