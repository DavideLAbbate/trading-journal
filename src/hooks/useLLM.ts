import { useState, useCallback } from 'react'
import {
  chatCompletion,
  streamChatCompletion,
  checkLLMHealth,
  type Message,
} from '../lib/llm'

interface UseLLMOptions {
  model?: string
  temperature?: number
  maxTokens?: number
}

interface UseLLMReturn {
  messages: Message[]
  isLoading: boolean
  isStreaming: boolean
  error: string | null
  isConnected: boolean
  sendMessage: (content: string) => Promise<void>
  streamMessage: (content: string) => Promise<void>
  clearMessages: () => void
  checkConnection: () => Promise<boolean>
}

/**
 * React hook for interacting with local LLM
 */
export function useLLM(options: UseLLMOptions = {}): UseLLMReturn {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  const checkConnection = useCallback(async () => {
    const connected = await checkLLMHealth()
    setIsConnected(connected)
    return connected
  }, [])

  const sendMessage = useCallback(
    async (content: string) => {
      setIsLoading(true)
      setError(null)

      const userMessage: Message = { role: 'user', content }
      const updatedMessages = [...messages, userMessage]
      setMessages(updatedMessages)

      try {
        const response = await chatCompletion({
          model: options.model,
          messages: updatedMessages,
          temperature: options.temperature,
          max_tokens: options.maxTokens,
        })

        setMessages([...updatedMessages, response.message])
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to get response'
        setError(errorMessage)
      } finally {
        setIsLoading(false)
      }
    },
    [messages, options.model, options.temperature, options.maxTokens]
  )

  const streamMessage = useCallback(
    async (content: string) => {
      setIsStreaming(true)
      setError(null)

      const userMessage: Message = { role: 'user', content }
      const updatedMessages = [...messages, userMessage]
      setMessages(updatedMessages)

      const assistantMessage: Message = { role: 'assistant', content: '' }
      setMessages([...updatedMessages, assistantMessage])

      try {
        const stream = streamChatCompletion({
          model: options.model,
          messages: updatedMessages,
          temperature: options.temperature,
          max_tokens: options.maxTokens,
        })

        let fullContent = ''
        for await (const token of stream) {
          fullContent += token
          setMessages([
            ...updatedMessages,
            { role: 'assistant', content: fullContent },
          ])
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Stream failed'
        setError(errorMessage)
      } finally {
        setIsStreaming(false)
      }
    },
    [messages, options.model, options.temperature, options.maxTokens]
  )

  const clearMessages = useCallback(() => {
    setMessages([])
    setError(null)
  }, [])

  return {
    messages,
    isLoading,
    isStreaming,
    error,
    isConnected,
    sendMessage,
    streamMessage,
    clearMessages,
    checkConnection,
  }
}
