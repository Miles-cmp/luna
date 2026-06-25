import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { useAuth } from './AuthContext'

export interface Categoria {
  id: number
  nombre: string
  color: string
  estado: 'activo' | 'inactivo'
}

export interface Tarea {
  id: number
  titulo: string
  descripcion: string
  lugar: string
  fecha_inicio: string
  fecha_fin: string
  todo_el_dia: boolean
  categoria_id: number
  columna_kanban: 'pendiente' | 'en_progreso' | 'en_revision' | 'finalizado'
  recordatorio_min: number | null
  integrantes: string[]
}

interface AppContextType {
  categorias: Categoria[]
  tareas: Tarea[]
  loading: boolean
  addTarea: (t: Omit<Tarea, 'id'>) => Promise<void>
  updateTarea: (t: Tarea) => Promise<void>
  moverTarea: (id: number, columna: Tarea['columna_kanban']) => Promise<void>
  addCategoria: (nombre: string, color: string) => Promise<void>
  updateCategoria: (id: number, data: Partial<Omit<Categoria,'id'>>) => Promise<void>
  reload: () => Promise<void>
}

const AppContext = createContext<AppContextType | null>(null)
const API = 'http://localhost:3001/api'

export function AppProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth()
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [tareas,     setTareas]     = useState<Tarea[]>([])
  const [loading,    setLoading]    = useState(true)

  const headers = useCallback(() => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token ?? ''}`,
  }), [token])

  const parseTarea = (raw: Record<string, unknown>): Tarea => ({
    id:               raw.id as number,
    titulo:           raw.titulo as string,
    descripcion:      (raw.descripcion as string) ?? '',
    lugar:            (raw.lugar as string) ?? '',
    fecha_inicio:     raw.fecha_inicio as string,
    fecha_fin:        raw.fecha_fin as string,
    todo_el_dia:      Boolean(raw.todo_el_dia),
    categoria_id:     (raw.categoria_id as number) ?? 0,
    columna_kanban:   (raw.columna_kanban as Tarea['columna_kanban']) ?? 'pendiente',
    recordatorio_min: (raw.recordatorio_min as number | null) ?? null,
    integrantes:      (() => {
      try { return JSON.parse((raw.integrantes as string) ?? '[]') as string[] }
      catch { return [] }
    })(),
  })

  const cargar = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const [rC, rT] = await Promise.all([
        fetch(`${API}/categorias`, { headers: headers() }),
        fetch(`${API}/tareas`,     { headers: headers() }),
      ])
      setCategorias(await rC.json() as Categoria[])
      const rawTareas = await rT.json() as Record<string, unknown>[]
      setTareas(rawTareas.map(parseTarea))
    } finally {
      setLoading(false)
    }
  }, [token, headers])

  useEffect(() => { void cargar() }, [cargar])

  const addTarea = async (t: Omit<Tarea, 'id'>) => {
    const res = await fetch(`${API}/tareas`, { method: 'POST', headers: headers(), body: JSON.stringify(t) })
    const { id } = await res.json() as { id: number }
    setTareas(prev => [...prev, { ...t, id }])
  }

  const updateTarea = async (t: Tarea) => {
    await fetch(`${API}/tareas/${t.id}`, { method: 'PUT', headers: headers(), body: JSON.stringify(t) })
    setTareas(prev => prev.map(x => x.id === t.id ? t : x))
  }

  const moverTarea = async (id: number, columna: Tarea['columna_kanban']) => {
    await fetch(`${API}/tareas/${id}/mover`, { method: 'PATCH', headers: headers(), body: JSON.stringify({ columna_kanban: columna }) })
    setTareas(prev => prev.map(x => x.id === id ? { ...x, columna_kanban: columna } : x))
  }

  const addCategoria = async (nombre: string, color: string) => {
    const res = await fetch(`${API}/categorias`, { method: 'POST', headers: headers(), body: JSON.stringify({ nombre, color }) })
    const cat = await res.json() as Categoria
    setCategorias(prev => [...prev, cat])
  }

  const updateCategoria = async (id: number, data: Partial<Omit<Categoria,'id'>>) => {
    await fetch(`${API}/categorias/${id}`, { method: 'PUT', headers: headers(), body: JSON.stringify(data) })
    setCategorias(prev => prev.map(c => c.id === id ? { ...c, ...data } : c))
  }

  return (
    <AppContext.Provider value={{ categorias, tareas, loading, addTarea, updateTarea, moverTarea, addCategoria, updateCategoria, reload: cargar }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be inside AppProvider')
  return ctx
}
