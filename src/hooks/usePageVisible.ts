import { useSyncExternalStore } from 'react'

const subscribe = (onChange: () => void) => {
  document.addEventListener('visibilitychange', onChange)
  return () => document.removeEventListener('visibilitychange', onChange)
}

/** true, пока вкладка видна пользователю */
export function usePageVisible() {
  return useSyncExternalStore(subscribe, () => document.visibilityState === 'visible')
}
