/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL_TEMPLATE?: string
  readonly VITE_API_URL_FALLBACK?: string
  readonly VITE_CONSOLE_URL?: string
  readonly VITE_POLL_RETRY_MS?: string
  readonly VITE_STORAGE_PREFIX?: string
  /** Только для локальной разработки (.env.local) */
  readonly VITE_ID_INSTANCE?: string
  readonly VITE_API_TOKEN_INSTANCE?: string
  readonly VITE_API_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
