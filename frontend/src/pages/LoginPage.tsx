import { useState, type FormEvent } from 'react'
import { Moon, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import './LoginPage.css'

export default function LoginPage() {
  const { login } = useAuth()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email || !password) { setError('Completa todos los campos'); return }
    setLoading(true); setError('')
    try {
      await login(email, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <Moon size={28} className="login-logo-icon" />
          <span>Luna</span>
        </div>
        <h1 className="login-title">Bienvenido de vuelta</h1>
        <p className="login-sub">Ingresa tus credenciales para continuar</p>

        <form className="login-form" onSubmit={submit}>
          <div className="login-field">
            <label>Correo electrónico</label>
            <input
              className="login-input"
              type="email"
              placeholder="correo@empresa.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
              autoFocus
            />
          </div>

          <div className="login-field">
            <label>Contraseña</label>
            <div className="login-pw-wrap">
              <input
                className="login-input"
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="login-pw-toggle"
                onClick={() => setShowPw(v => !v)}
              >
                {showPw ? <EyeOff size={16}/> : <Eye size={16}/>}
              </button>
            </div>
          </div>

          {error && <p className="login-error">{error}</p>}

          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>
      </div>
    </div>
  )
}
