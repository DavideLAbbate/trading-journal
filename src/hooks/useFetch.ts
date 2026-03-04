import useSWR, { SWRConfiguration } from 'swr'
import useSWRMutation from 'swr/mutation'
import { apiClient, fetcher } from '../lib/api'

/**
 * Generic hook for GET requests with SWR
 */
export function useFetch<T>(
  url: string | null,
  options?: SWRConfiguration
) {
  return useSWR<T>(url, fetcher, {
    revalidateOnFocus: false,
    ...options,
  })
}

/**
 * Hook for POST requests with SWR mutation
 */
export function usePost<T, P = unknown>(url: string) {
  return useSWRMutation(
    url,
    async (key: string, { arg }: { arg: P }) => {
      const response = await apiClient.post<T>(key, arg)
      return response.data
    }
  )
}

/**
 * Hook for PUT requests with SWR mutation
 */
export function usePut<T, P = unknown>(url: string) {
  return useSWRMutation(
    url,
    async (key: string, { arg }: { arg: P }) => {
      const response = await apiClient.put<T>(key, arg)
      return response.data
    }
  )
}

/**
 * Hook for DELETE requests with SWR mutation
 */
export function useDelete<T>(url: string) {
  return useSWRMutation(
    url,
    async (key: string) => {
      const response = await apiClient.delete<T>(key)
      return response.data
    }
  )
}
