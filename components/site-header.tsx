import Link from "next/link"
import { Button } from "@/components/ui/button"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-border/50 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="font-semibold tracking-tight text-lg">
          <span className="rounded-md bg-primary/20 px-2 py-1 text-primary">Repo</span>
          <span className="ml-1">Health</span>
          <span className="sr-only">RepoHealth Home</span>
        </Link>

        <nav className="hidden gap-6 text-sm md:flex">
          <Link href="/explorer" className="text-muted-foreground hover:text-foreground">
            Search
          </Link>
          <Link href="#" className="text-muted-foreground hover:text-foreground">
            Collections
          </Link>
          <Link href="#" className="text-muted-foreground hover:text-foreground">
            Methodology
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="hidden md:inline-flex">
            Sign in
          </Button>
          <Button size="sm" className="bg-primary text-primary-foreground hover:opacity-90">
            Get Started
          </Button>
        </div>
      </div>
    </header>
  )
}
