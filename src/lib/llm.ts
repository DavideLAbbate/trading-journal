import axios from 'axios'

// Configuration for local LLM connection
// Supports Ollama, LM Studio, LocalAI, and similar local inference servers
const LLM_CONFIG = {
  // Default to Ollama's endpoint - change as needed
  baseUrl: import.meta.env.VITE_LLM_BASE_URL || 'http://localhost:11434',
  model: import.meta.env.VITE_LLM_MODEL || 'llama3.2',
  timeout: 120000, // 2 minutes for longer generations
}

export interface Message {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface ChatCompletionRequest {
  model?: string
  messages: Message[]
  stream?: boolean
  temperature?: number
  max_tokens?: number
}

export interface ChatCompletionResponse {
  model: string
  message: Message
  done: boolean
  total_duration?: number
}

// LLM client for local inference servers
export const llmClient = axios.create({
  baseURL: LLM_CONFIG.baseUrl,
  timeout: LLM_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Send a chat completion request to the local LLM
 * Works with Ollama API format (compatible with many local servers)
 */
export async function chatCompletion(
  request: ChatCompletionRequest
): Promise<ChatCompletionResponse> {
  const response = await llmClient.post<ChatCompletionResponse>('/api/chat', {
    model: request.model || LLM_CONFIG.model,
    messages: request.messages,
    stream: false,
    options: {
      temperature: request.temperature ?? 0.7,
      num_predict: request.max_tokens ?? 2048,
    },
  })
  return response.data
}

/**
 * Stream chat completion responses
 * Returns an async generator for streaming tokens
 */
export async function* streamChatCompletion(
  request: ChatCompletionRequest
): AsyncGenerator<string, void, unknown> {
  const response = await fetch(`${LLM_CONFIG.baseUrl}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: request.model || LLM_CONFIG.model,
      messages: request.messages,
      stream: true,
      options: {
        temperature: request.temperature ?? 0.7,
        num_predict: request.max_tokens ?? 2048,
      },
    }),
  })

  if (!response.ok) {
    throw new Error(`LLM request failed: ${response.statusText}`)
  }

  const reader = response.body?.getReader()
  if (!reader) throw new Error('No response body')

  const decoder = new TextDecoder()

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    const chunk = decoder.decode(value, { stream: true })
    const lines = chunk.split('\n').filter(Boolean)

    for (const line of lines) {
      try {
        const json = JSON.parse(line)
        if (json.message?.content) {
          yield json.message.content
        }
      } catch {
        // Skip invalid JSON lines
      }
    }
  }
}

/**
 * Simple helper for single-turn completions
 */
export async function complete(prompt: string): Promise<string> {
  const response = await chatCompletion({
    messages: [{ role: 'user', content: prompt }],
  })
  return response.message.content
}

/**
 * Check if the local LLM server is available
 */
export async function checkLLMHealth(): Promise<boolean> {
  try {
    await llmClient.get('/api/tags')
    return true
  } catch {
    return false
  }
}
