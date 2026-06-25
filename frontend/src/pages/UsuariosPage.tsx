import { useState, useEffect, useCallback } from 'react'
import { Plus, X, Eye, EyeOff, Check, Pencil } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import './UsuariosPage.css'

interface UsuarioRow {
  id: number
  nombre: string
  email: string
  rol: string
  puede_crear_usuarios: number
  creado: string
}

const API = 'http://localhost:3001/api'

export default function UsuariosPage() {
  const { token } = useAuth()
  const [usuarios, setUsuarios] = useState<UsuarioRow[]>([])
  const [loading,  setLoading]  = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [success,  setSuccess]  = useState('')
  const [error,    setError]    = useState('')

  // form nuevo usuario
  const [nombre,   setNombre]   = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [rol,      setRol]      = useState<'admin'|'usuario'>('usuario')
  const [showPw,   setShowPw]   = useState(false)
  const [saving,   setSaving]   = useState(false)
  const [formErr,  setFormErr]  = useState('')

  // edición de nombre
  const [editId,    setEditId]    = useState<number | null>(null)
  const [editNombre, setEditNombre] = useState('')
  const [editSaving, setEditSaving] = useState(false)

  const cargar = useCallback(async () => {
    setLoading(true)
    try {
      const res  = await fetch(`${API}/auth/usuarios`, { headers: { Authorization: `Bearer ${token}` } })
      const data = await res.json() as UsuarioRow[]
      setUsuarios(data)
    } catch {
      setError('No se pudo conectar al servidor')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => { void cargar() }, [cargar])

  const flash = (msg: string) => { setSuccess(msg); setTimeout(() => setSuccess(''), 4000) }

  const crear = async () => {
    if (!nombre.trim() || !email.trim() || !password.trim()) { setFormErr('Todos los campos son obligatorios'); return }
    setSaving(true); setFormErr('')
    try {
      const res  = await fetch(`${API}/auth/registro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ nombre, email, password, rol }),
      })
      const data = await res.json() as { error?: string }
      if (!res.ok) { setFormErr(data.error ?? 'Error al crear usuario'); return }
      flash(`Usuario "${nombre}" creado`)
      setShowForm(false); setNombre(''); setEmail(''); setPassword(''); setRol('usuario')
      void cargar()
    } catch {
      setFormErr('No se pudo conectar al servidor')
    } finally {
      setSaving(false)
    }
  }

  const startEdit = (u: UsuarioRow) => {
    setEditId(u.id)
    setEditNombre(u.nombre)
  }

  const cancelEdit = () => { setEditId(null); setEditNombre('') }

  const guardarNombre = async (id: number) => {
    if (!editNombre.trim()) return
    setEditSaving(true)
    try {
      const res = await fetch(`${API}/auth/usuarios/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ nombre: editNombre }),
      })
      if (res.ok) {
        setUsuarios(prev => prev.map(u => u.id === id ? { ...u, nombre: editNombre } : u))
        flash('Nombre actualizado')
        cancelEdit()
      }
    } finally {
      setEditSaving(false)
    }
  }

  return (
    <main className="users-page">
      <header className="users-header">
        <div>
          <h1 className="page-title">Usuarios</h1>
          <p className="page-sub">{usuarios.length} usuarios registrados</p>
        </div>
        <button className="btn-primary" onClick={() => { setShowForm(v => !v); setFormErr('') }}>
          {showForm ? <><X size={16}/> Cancelar</> : <><Plus size={16}/> Nuevo usuario</>}
        </button>
      </header>

      {success && <div className="alert-success"><Check size={15}/> {success}</div>}
      {error   && <div className="alert-error">{error}</div>}

      {showForm && (
        <div className="user-form">
          <h2 className="form-title">Crear nuevo usuario</h2>
          <div className="form-grid">
            <div className="uf">
              <label>Nombre completo</label>
              <input className="u-input" placeholder="Ej: María García" value={nombre} onChange={e => setNombre(e.target.value)} autoFocus/>
            </div>
            <div className="uf">
              <label>Correo electrónico</label>
              <input className="u-input" type="email" placeholder="usuario@empresa.com" value={email} onChange={e => setEmail(e.target.value)}/>
            </div>
            <div className="uf">
              <label>Contraseña</label>
              <div className="u-pw-wrap">
                <input className="u-input" type={showPw ? 'text' : 'password'} placeholder="Mínimo 6 caracteres" value={password} onChange={e => setPassword(e.target.value)}/>
                <button type="button" className="u-pw-toggle" onClick={() => setShowPw(v => !v)}>
                  {showPw ? <EyeOff size={14}/> : <Eye size={14}/>}
                </button>
              </div>
            </div>
            <div className="uf">
              <label>Rol</label>
              <div className="rol-group">
                {(['usuario', 'admin'] as const).map(r => (
                  <button key={r} type="button" className={`rol-btn ${rol === r ? 'selected' : ''}`} onClick={() => setRol(r)}>
                    {r === 'admin' ? 'Administrador' : 'Usuario'}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {formErr && <p className="form-err">{formErr}</p>}
          <div className="form-actions">
            <button className="btn-save-u" onClick={crear} disabled={saving}>
              {saving ? 'Creando...' : 'Crear usuario'}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="u-loading">Cargando...</p>
      ) : (
        <div className="users-table-wrap">
          <table className="users-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Registrado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map(u => (
                <tr key={u.id}>
                  <td className="u-id">{u.id}</td>
                  <td className="u-nombre">
                    {editId === u.id ? (
                      <div className="edit-nombre-row">
                        <input
                          className="u-input-inline"
                          value={editNombre}
                          onChange={e => setEditNombre(e.target.value)}
                          onKeyDown={e => {
                            if (e.key === 'Enter') void guardarNombre(u.id)
                            if (e.key === 'Escape') cancelEdit()
                          }}
                          autoFocus
                        />
                        <button className="edit-btn save" onClick={() => void guardarNombre(u.id)} disabled={editSaving}>
                          <Check size={13}/>
                        </button>
                        <button className="edit-btn cancel" onClick={cancelEdit}>
                          <X size={13}/>
                        </button>
                      </div>
                    ) : (
                      u.nombre
                    )}
                  </td>
                  <td className="u-email">{u.email}</td>
                  <td>
                    <span className={`u-rol ${u.rol}`}>{u.rol}</span>
                  </td>
                  <td className="u-fecha">
                    {new Date(u.creado).toLocaleDateString('es-PE',{day:'2-digit',month:'short',year:'numeric'})}
                  </td>
                  <td>
                    {editId !== u.id && (
                      <button className="edit-btn neutral" title="Editar nombre" onClick={() => startEdit(u)}>
                        <Pencil size={13}/>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}
