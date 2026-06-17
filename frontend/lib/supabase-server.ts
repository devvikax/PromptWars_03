import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase env variables are missing in supabase-server helper!")
}

export function getSupabaseServerClient(authHeader?: string | null) {
  const token = authHeader?.replace("Bearer ", "").trim()

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase is unconfigured on the server side.")
  }

  if (token) {
    return createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      auth: {
        persistSession: false,
      },
    })
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
    },
  })
}

/**
 * Extracts and validates user claims from the server client to check permissions.
 */
export async function getVerifiedUserId(authHeader?: string | null): Promise<string> {
  if (!authHeader) {
    throw new Error("Authorization header is missing.")
  }

  const client = getSupabaseServerClient(authHeader)
  const { data: { user }, error } = await client.auth.getUser()

  if (error || !user) {
    throw new Error("Invalid or expired session token.")
  }

  return user.id;
}
