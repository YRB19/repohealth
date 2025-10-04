export function SiteFooter() {
  return (
    <footer className="border-t border-border/50">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-10 md:flex-row">
        <p className="text-sm text-muted-foreground">&copy; {new Date().getFullYear()} RepoHealth</p>
        <nav className="flex gap-6 text-sm">
          <a className="text-muted-foreground hover:text-foreground" href="#">
            Docs
          </a>
          <a className="text-muted-foreground hover:text-foreground" href="#">
            API
          </a>
          <a className="text-muted-foreground hover:text-foreground" href="#">
            Community
          </a>
        </nav>
      </div>
    </footer>
  )
}
