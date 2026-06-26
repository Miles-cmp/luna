import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

export interface Usuario {
  id: number
  nombre: string
  email: string
  rol: 'admin' | 'usuario'
  puede_crear_usuarios: boolean
}

interface AuthContextType {
  usuario: Usuario | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isAdmin: boolean
  puedeCrearUsuarios: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3001/api'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null)
  const [token, setToken]     = useState<string | null>(null)

  useEffect(() => {
    const t = localStorage.getItem('luna_token')
    const u = localStorage.getItem('luna_usuario')
    if (t && u) {
      setToken(t)
      setUsuario(JSON.parse(u) as Usuario)
    }
  }, [])

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json() as { token?: string; usuario?: Usuario; error?: string }
    if (!res.ok) throw new Error(data.error ?? 'Error al iniciar sesión')
    localStorage.setItem('luna_token', data.token!)
    localStorage.setItem('luna_usuario', JSON.stringify(data.usuario!))
    setToken(data.token!)
    setUsuario(data.usuario!)
  }

  const logout = () => {
    localStorage.removeItem('luna_token')
    localStorage.removeItem('luna_usuario')
    setToken(null)
    setUsuario(null)
  }

  return (
    <AuthContext.Provider value={{ usuario, token, login, logout, isAdmin: usuario?.rol === 'admin', puedeCrearUsuarios: usuario?.puede_crear_usuarios ?? false }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
