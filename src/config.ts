// Настройки из .env (пример — .env.example). Значения по умолчанию совпадают с .env,
// чтобы приложение работало и без него.
const env = import.meta.env

const positiveNumber = (value: string | undefined, fallback: number) => {
  const n = Number(value)
  return Number.isFinite(n) && n > 0 ? n : fallback
}

export const config = {
  apiUrlTemplate: env.VITE_API_URL_TEMPLATE || 'https://{prefix}.api.green-api.com',
  apiUrlFallback: env.VITE_API_URL_FALLBACK || 'https://api.green-api.com',
  consoleUrl: env.VITE_CONSOLE_URL || 'https://console.green-api.com',
  pollRetryMs: positiveNumber(env.VITE_POLL_RETRY_MS, 5000),
  storagePrefix: env.VITE_STORAGE_PREFIX || 'green-tg',
  /** Автозаполнение формы входа для локальной разработки */
  loginDefaults: {
    idInstance: env.VITE_ID_INSTANCE ?? '',
    apiTokenInstance: env.VITE_API_TOKEN_INSTANCE ?? '',
    apiUrl: env.VITE_API_URL ?? '',
  },
} as const
