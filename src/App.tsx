import { useState } from 'react'
import type { Credentials } from './api'
import { Login, Messenger } from './components'
import { loadCredentials, saveCredentials } from './storage'

export default function App() {
  const [creds, setCreds] = useState<Credentials | null>(loadCredentials)

  const login = (next: Credentials) => {
    saveCredentials(next)
    setCreds(next)
  }

  const logout = () => {
    saveCredentials(null)
    setCreds(null)
  }

  return creds ? <Messenger key={creds.idInstance} creds={creds} onLogout={logout} /> : <Login onLogin={login} />
}
