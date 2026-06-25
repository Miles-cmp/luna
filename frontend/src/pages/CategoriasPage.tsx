import { useState } from 'react'
import { Plus, Pencil, Check, X, Circle } from 'lucide-react'
import { useApp } from '../context/AppContext'
import './CategoriasPage.css'

const COLORES_PRESET = [
  '#6366f1','#8b5cf6','#ec4899','#ef4444',
  '#f59e0b','#22c55e','#14b8a6','#3b82f6',
  '#64748b','#f97316','#a855f7','#06b6d4',
]

function CatForm({ initial, onSave, onCancel }: {
  initial?: { nombre?: string; color?: string }
  onSave: (nombre: string, color: string) => void
  onCancel: () => void
}) {
  const [nombre, setNombre] = useState(initial?.nombre ?? '')
  const [color,  setColor]  = useState(initial?.color  ?? '#6366f1')
  const [err,    setErr]    = useState('')

  const submit = () => {
    if (!nombre.trim()) { setErr('El nombre es obligatorio'); return }
    onSave(nombre.trim(), color)
  }

  return (
    <div className="cat-form">
      <div className="cat-form-row">
        <input className="cat-input" placeholder="Nombre de la categoría" value={nombre}
          onChange={e => { setNombre(e.target.value); setErr('') }}
          onKeyDown={e => e.key === 'Enter' && submit()} autoFocus/>
        <div className="color-preview" style={{ background: color }}/>
      </div>
      <div className="color-grid">
        {COLORES_PRESET.map(c => (
          <button key={c} className={`color-swatch ${color === c ? 'selected' : ''}`}
            style={{ background: c }} onClick={() => setColor(c)}>
            {color === c && <Check size={12} color="#fff"/>}
          </button>
        ))}
        <input type="color" className="color-custom" value={color}
          onChange={e => setColor(e.target.value)} title="Color personalizado"/>
      </div>
      {err && <p className="cat-err">{err}</p>}
      <div className="cat-form-actions">
        <button className="btn-cancel-sm" onClick={onCancel}><X size={14}/> Cancelar</button>
        <button className="btn-save-sm" onClick={submit}><Check size={14}/> Guardar</button>
      </div>
    </div>
  )
}

export default function CategoriasPage() {
  const { categorias, tareas, addCategoria, updateCategoria } = useApp()
  const [adding,  setAdding]  = useState(false)
  const [editing, setEditing] = useState<number | null>(null)

  const handleAdd = async (nombre: string, color: string) => {
    await addCategoria(nombre, color)
    setAdding(false)
  }

  const handleUpdate = async (id: number, nombre: string, color: string) => {
    await updateCategoria(id, { nombre, color })
    setEditing(null)
  }

  const handleToggle = async (id: number, estado: 'activo' | 'inactivo') => {
    await updateCategoria(id, { estado: estado === 'activo' ? 'inactivo' : 'activo' })
  }

  const tareasEnCat = (id: number) => tareas.filter(t => t.categoria_id === id).length

  return (
    <main className="cats-page">
      <header className="cats-header">
        <div>
          <h1 className="page-title">Categorías</h1>
          <p className="page-sub">{categorias.length} categorías · {categorias.filter(c=>c.estado==='activo').length} activas</p>
        </div>
        <button className="btn-primary" onClick={() => { setAdding(true); setEditing(null) }}>
          <Plus size={16}/> Nueva categoría
        </button>
      </header>

      {adding && <CatForm onSave={handleAdd} onCancel={() => setAdding(false)}/>}

      <div className="cats-grid">
        {categorias.map(cat => (
          <div key={cat.id} className={`cat-card ${cat.estado === 'inactivo' ? 'inactive' : ''}`}>
            {editing === cat.id ? (
              <CatForm initial={cat} onSave={(n,c) => handleUpdate(cat.id,n,c)} onCancel={() => setEditing(null)}/>
            ) : (
              <>
                <div className="cat-card-top">
                  <div className="cat-color-bar" style={{ background: cat.color }}/>
                  <div className="cat-info">
                    <p className="cat-nombre">{cat.nombre}</p>
                    <p className="cat-meta">{tareasEnCat(cat.id)} tarea{tareasEnCat(cat.id) !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="cat-actions">
                    <button className="cat-btn" title="Editar" onClick={() => { setEditing(cat.id); setAdding(false) }}>
                      <Pencil size={14}/>
                    </button>
                    <button className={`cat-btn toggle-btn ${cat.estado}`} title={cat.estado === 'activo' ? 'Desactivar' : 'Activar'}
                      onClick={() => handleToggle(cat.id, cat.estado)}>
                      <Circle size={14}/>
                    </button>
                  </div>
                </div>
                <div className="cat-badge" style={{ background: cat.color+'22', color: cat.color }}>
                  {cat.estado === 'activo' ? 'Activo' : 'Inactivo'}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </main>
  )
}
