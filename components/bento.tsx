import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function Bento() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-semibold md:text-4xl">What our Health Score measures</h2>
        <p className="mt-3 text-muted-foreground">
          We evaluate signals that actually matter for picking dependable open-source software.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="bg-secondary">
          <CardHeader>
            <CardTitle>Activity Matters</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Commit frequency and recent releases show project momentum, not just vanity stars.
          </CardContent>
        </Card>

        <Card className="bg-secondary md:col-span-2">
          <CardHeader>
            <CardTitle>Community Health</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Healthy collaboration patterns: diverse contributors, responsive maintainers, and issue hygiene.
          </CardContent>
        </Card>

        <Card className="bg-secondary">
          <CardHeader>
            <CardTitle>Documentation Quality</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Checks for completeness, clarity, and onboarding ease so teams can ship faster.
          </CardContent>
        </Card>

        <Card className="bg-secondary md:col-span-2">
          <CardHeader>
            <CardTitle>Production Ready</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Versioning, compatibility, stability, and ecosystem signals that indicate reliability in production.
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
