/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CESIUM_TOKEN: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_LLM_BASE_URL: string
  readonly VITE_LLM_MODEL: string
  readonly VITE_NEWS_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
