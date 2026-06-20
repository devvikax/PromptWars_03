export interface LLMProvider {
  chat(messages: { role: string; content: string }[]): Promise<{
    reply: string
    usage: { promptTokens: number; completionTokens: number; totalTokens: number }
  }>
}

export class GenericOpenAiProvider implements LLMProvider {
  constructor(
    private apiUrl: string,
    private apiKey: string,
    private model: string
  ) {}

  async chat(messages: { role: string; content: string }[]): Promise<{
    reply: string
    usage: { promptTokens: number; completionTokens: number; totalTokens: number }
  }> {
    // Standardize url to point directly to chat completions
    const cleanUrl = this.apiUrl.endsWith("/chat/completions")
      ? this.apiUrl
      : `${this.apiUrl.replace(/\/$/, "")}/chat/completions`

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }
    if (this.apiKey) {
      headers["Authorization"] = `Bearer ${this.apiKey}`
    }

    const response = await fetch(cleanUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model: this.model,
        messages,
        temperature: 0.7,
        max_tokens: 300,
      }),
    })

    if (!response.ok) {
      throw new Error(`LLM provider request failed: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    const reply = data.choices?.[0]?.message?.content || ""
    const usage = data.usage || {}

    return {
      reply,
      usage: {
        promptTokens: usage.prompt_tokens || 0,
        completionTokens: usage.completion_tokens || 0,
        totalTokens: usage.total_tokens || 0,
      },
    }
  }
}

/**
 * Factory function to retrieve the configured LLM provider.
 * Reads environment variables: LLAMA_BASE_URL (or LLAMA_API_URL), LLAMA_MODEL, and LLAMA_API_KEY.
 */
export function getActiveProvider(): LLMProvider {
  const apiUrl =
    process.env.LLAMA_BASE_URL ||
    process.env.LLAMA_API_URL ||
    "https://api.groq.com/openai/v1"
  
  const apiKey = process.env.LLAMA_API_KEY || ""
  const model = process.env.LLAMA_MODEL || "llama-3.1-8b-instant"

  return new GenericOpenAiProvider(apiUrl, apiKey, model)
}
