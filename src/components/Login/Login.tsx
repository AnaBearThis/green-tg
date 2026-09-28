import { useState, type FormEvent } from 'react'
import { defaultApiUrl, getStateInstance, type Credentials } from '../../api'
import { config } from '../../config'
import { Alert, Button, Panel, TextField } from '../../shared/ui'
import s from './Login.module.css'

interface Props {
  onLogin: (creds: Credentials) => void
}

export function Login({ onLogin }: Props) {
  const defaults = config.loginDefaults
  const [idInstance, setIdInstance] = useState(defaults.idInstance)
  const [apiTokenInstance, setApiTokenInstance] = useState(defaults.apiTokenInstance)
  const [apiUrl, setApiUrl] = useState(defaults.apiUrl)
  const [apiUrlEdited, setApiUrlEdited] = useState(Boolean(defaults.apiUrl))
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const effectiveApiUrl = apiUrlEdited ? apiUrl : defaultApiUrl(idInstance)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const creds = { apiUrl: effectiveApiUrl, idInstance: idInstance.trim(), apiTokenInstance: apiTokenInstance.trim() }
    setError('')
    setLoading(true)
    try {
      const { stateInstance } = await getStateInstance(creds)
      if (stateInstance !== 'authorized') {
        setError(`Инстанс не авторизован (состояние: ${stateInstance}). Авторизуйте его в личном кабинете GREEN-API.`)
        return
      }
      onLogin(creds)
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={s.root}>
      <Panel as="form" padding="lg" className={s.card} onSubmit={submit}>
        <img className={s.logo} src="./favicon.svg" alt="" />
        <h1 className={s.title}>Telegram</h1>
        <p className={s.hint}>
          Введите данные инстанса из{' '}
          <a href={config.consoleUrl} target="_blank" rel="noreferrer">
            личного кабинета GREEN-API
          </a>
        </p>

        <TextField
          label="idInstance"
          value={idInstance}
          onChange={(e) => setIdInstance(e.target.value)}
          inputMode="numeric"
          autoComplete="username"
          required
          autoFocus
        />
        <TextField
          label="apiTokenInstance"
          type="password"
          value={apiTokenInstance}
          onChange={(e) => setApiTokenInstance(e.target.value)}
          autoComplete="current-password"
          required
        />
        <TextField
          label="apiUrl"
          type="url"
          value={effectiveApiUrl}
          onChange={(e) => {
            setApiUrl(e.target.value)
            setApiUrlEdited(true)
          }}
          required
        />

        {error && <Alert tone="error">{error}</Alert>}

        <Button type="submit" size="lg" fullWidth loading={loading}>
          {loading ? 'Проверка…' : 'Войти'}
        </Button>
      </Panel>
    </div>
  )
}
