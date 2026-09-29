import { isAbortError } from './errors'

/**
 * Выполняет task только в одной вкладке браузера среди всех, запросивших блокировку с тем же именем
 * (Web Locks API). Остальные вкладки ждут своей очереди и подхватывают задачу, когда владелец закрывается.
 * Блокировка держится, пока task не завершится; task должна сама выйти по signal.
 * Без поддержки Web Locks задача выполняется сразу в каждой вкладке.
 */
export function runInSingleTab(name: string, signal: AbortSignal, task: (signal: AbortSignal) => Promise<void>) {
  if (!('locks' in navigator)) {
    void task(signal)
    return
  }
  navigator.locks.request(name, { signal }, () => task(signal)).catch((e) => {
    if (!isAbortError(e)) throw e
  })
}

/** Канал для обмена сообщениями между вкладками; без поддержки BroadcastChannel — заглушка. */
export function openTabChannel<T>(name: string, onMessage: (message: T) => void) {
  if (typeof BroadcastChannel === 'undefined') return { post: () => {}, close: () => {} }
  const channel = new BroadcastChannel(name)
  channel.onmessage = (e: MessageEvent<T>) => onMessage(e.data)
  return {
    post: (message: T) => channel.postMessage(message),
    close: () => channel.close(),
  }
}
