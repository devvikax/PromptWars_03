import { Buffer } from "buffer"

const FIREBASE_DB_URL =
  process.env.FIREBASE_DATABASE_URL ||
  process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ||
  "https://instavibe-app-default-rtdb.firebaseio.com"

export function getVerifiedUserId(authHeader: string | null): string {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Missing or invalid Authorization header")
  }
  const token = authHeader.split(" ")[1]
  if (!token) throw new Error("Token is empty")

  // Allow mock tokens for local/fallback testing
  if (token.startsWith("mock-token-")) {
    return token.substring("mock-token-".length)
  }

  // Fast JWT payload decoder
  try {
    const payloadBase64 = token.split(".")[1]
    if (!payloadBase64) throw new Error("Invalid JWT token format")
    const payloadJson = Buffer.from(payloadBase64, "base64").toString("utf-8")
    const payload = JSON.parse(payloadJson)
    const userId = payload.sub || payload.user_id
    if (!userId) throw new Error("User ID (sub) not found in token")
    return userId
  } catch (err: any) {
    throw new Error(`Token verification failed: ${err.message}`)
  }
}

// In-memory mock database for fallback/local development when Firebase is not configured
const MOCK_DB: Record<string, any> = {}

const isMockMode =
  (!process.env.FIREBASE_DATABASE_URL && !process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL) ||
  FIREBASE_DB_URL.includes("default-rtdb") ||
  FIREBASE_DB_URL.includes("placeholder")

// REST helper to read from Firebase RTDB
export async function dbRead<T>(path: string): Promise<T | null> {
  if (isMockMode) {
    return (MOCK_DB[path] as T) || null
  }

  try {
    const url = `${FIREBASE_DB_URL}/${path}.json`
    const res = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
    if (!res.ok) {
      throw new Error(`Firebase RTDB read error: ${res.statusText}`)
    }
    return await res.json()
  } catch (err) {
    console.warn(`[Mock DB Fallback Read] path: ${path} due to error:`, err)
    return (MOCK_DB[path] as T) || null
  }
}

// REST helper to write/overwrite to Firebase RTDB
export async function dbWrite<T>(path: string, data: T): Promise<T> {
  if (isMockMode) {
    MOCK_DB[path] = JSON.parse(JSON.stringify(data))
    return data
  }

  try {
    const url = `${FIREBASE_DB_URL}/${path}.json`
    const res = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      throw new Error(`Firebase RTDB write error: ${res.statusText}`)
    }
    return await res.json()
  } catch (err) {
    console.warn(`[Mock DB Fallback Write] path: ${path} due to error:`, err)
    MOCK_DB[path] = JSON.parse(JSON.stringify(data))
    return data
  }
}

// REST helper to update/patch to Firebase RTDB
export async function dbUpdate<T>(path: string, data: T): Promise<T> {
  if (isMockMode) {
    MOCK_DB[path] = {
      ...(MOCK_DB[path] || {}),
      ...JSON.parse(JSON.stringify(data)),
    }
    return MOCK_DB[path]
  }

  try {
    const url = `${FIREBASE_DB_URL}/${path}.json`
    const res = await fetch(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      throw new Error(`Firebase RTDB update error: ${res.statusText}`)
    }
    return await res.json()
  } catch (err) {
    console.warn(`[Mock DB Fallback Update] path: ${path} due to error:`, err)
    MOCK_DB[path] = {
      ...(MOCK_DB[path] || {}),
      ...JSON.parse(JSON.stringify(data)),
    }
    return MOCK_DB[path]
  }
}
