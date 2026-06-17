import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-url.supabase.co"
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function getAuthHeader(): Promise<Record<string, string>> {
  const sessionRes = await supabase.auth.getSession()
  const token = sessionRes.data.session?.access_token
  if (token) {
    return { "Authorization": `Bearer ${token}` }
  }
  return {}
}
