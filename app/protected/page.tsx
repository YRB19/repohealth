import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function ProtectedPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-6 p-6">
      <h1 className="text-xl font-semibold">You’re signed in</h1>
      <pre className="text-xs bg-muted/30 rounded p-4 overflow-auto">{JSON.stringify(data.user, null, 2)}</pre>
    </div>
  )
}
