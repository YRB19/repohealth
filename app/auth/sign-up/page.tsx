import Link from "next/link"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

async function signUpAction(formData: FormData) {
  const email = String(formData.get("email") || "")
  const password = String(formData.get("password") || "")

  if (!email || !password) {
    redirect("/auth/sign-up?error=" + encodeURIComponent("Email and password are required"))
  }

  try {
    const supabase = createServerClient()
    const origin = headers().get("origin") || ""
    const emailRedirectTo =
      process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL || (origin ? `${origin}/protected` : undefined)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo },
    })
    if (error) {
      redirect("/auth/sign-up?error=" + encodeURIComponent(error.message))
    }
    redirect("/auth/login?message=" + encodeURIComponent("Check your email to confirm your account."))
  } catch (e: any) {
    redirect("/auth/sign-up?error=" + encodeURIComponent(e?.message || "Failed to sign up"))
  }
}

export default function Page({
  searchParams,
}: {
  searchParams?: { message?: string; error?: string }
}) {
  const message = searchParams?.message
  const error = searchParams?.error

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Create your account</CardTitle>
              <CardDescription>Use email and a strong password</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="grid gap-3" action={signUpAction}>
                <Input type="email" name="email" placeholder="you@example.com" required />
                <Input type="password" name="password" placeholder="Password (min 6 chars)" minLength={6} required />
                {error ? <p className="text-sm text-red-500">{error}</p> : null}
                {message ? <p className="text-sm text-emerald-500">{message}</p> : null}
                <Button type="submit" className="w-full">
                  Sign up
                </Button>
              </form>
              <p className="mt-3 text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link className="text-primary underline underline-offset-2" href="/auth/login">
                  Sign in
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
