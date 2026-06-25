import { useState } from 'react'
import { Plus, MoreHorizontal, Clock, Tag, MapPin } from 'lucide-react'
import { useApp } from '../context/AppContext'
import type { Tarea } from '../context/AppContext'
import TaskModal from '../components/TaskModal'
import './KanbanPage.css'

type Column = Tarea['columna_kanban']

const COLUMNAS: { id: Column; label: string; color: string }[] = [
  { id: 'pendiente',   label: 'Pendiente',   color: '#64748b' },
  { id: 'en_progreso', label: 'En progreso',  color: '#f59e0b' },
  { id: 'en_revision', label: 'En revisión',  color: '#6366f1' },
  { id: 'finalizado',  label: 'Finalizado',   color: '#22c55e' },
]

export default function KanbanPage() {
  const { tareas, moverTarea, categorias } = useApp()
  const [dragging, setDragging]   = useState<number | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarea, setEditTarea] = useState<Tarea | null>(null)
  const [defCol, setDefCol]       = useState<Column>('pendiente')

  const porColumna = (col: Column) => tareas.filter(t => t.columna_kanban === col)
  const getCat     = (id: number) => categorias.find(c => c.id === id)

  const onDrop = (col: Column) => {
    if (dragging !== null) moverTarea(dragging, col)
    setDragging(null)
  }

  const openNew = (col: Column) => {
    setEditTarea(null); setDefCol(col); setModalOpen(true)
  }

  const openEdit = (t: Tarea) => {
    setEditTarea(t); setModalOpen(true)
  }

  return (
    <main className="kanban-page">
      <header className="kanban-header">
        <div>
          <h1 className="page-title">Tablero Kanban</h1>
          <p className="page-sub">{tareas.length} tareas en total</p>
        </div>
        <button className="btn-primary" onClick={() => openNew('pendiente')}>
          <Plus size={16}/> Nueva tarea
        </button>
      </header>

      <div className="kanban-board">
        {COLUMNAS.map(col => {
          const items = porColumna(col.id)
          return (
            <div
              key={col.id}
              className="kanban-col"
              onDragOver={e => e.preventDefault()}
              onDrop={() => onDrop(col.id)}
            >
              <div className="col-header">
                <div className="col-title">
                  <span className="col-dot" style={{ background: col.color }}/>
                  <span>{col.label}</span>
                </div>
                <span className="col-count">{items.length}</span>
              </div>

              <div className="col-cards">
                {items.map(tarea => {
                  const cat = getCat(tarea.categoria_id)
                  return (
                    <div
                      key={tarea.id}
                      className="kanban-card"
                      draggable
                      onDragStart={() => setDragging(tarea.id)}
                      onDragEnd={() => setDragging(null)}
                    >
                      <div className="card-top">
                        <span
                          className="card-categoria"
                          style={{ background: (cat?.color ?? '#6366f1')+'22', color: cat?.color ?? '#6366f1' }}
                        >
                          <Tag size={10}/> {cat?.nombre ?? '—'}
                        </span>
                        <button className="card-menu" onClick={() => openEdit(tarea)}>
                          <MoreHorizontal size={14}/>
                        </button>
                      </div>

                      <p className="card-titulo">{tarea.titulo}</p>
                      {tarea.descripcion && <p className="card-desc">{tarea.descripcion}</p>}

                      <div className="card-footer">
                        {tarea.lugar && (
                          <span className="card-meta"><MapPin size={10}/>{tarea.lugar}</span>
                        )}
                        <span className="card-meta">
                          <Clock size={10}/>
                          {tarea.todo_el_dia
                            ? new Date(tarea.fecha_fin+'').toLocaleDateString('es-PE',{day:'2-digit',month:'short'})
                            : tarea.fecha_fin.slice(0,10)}
                        </span>
                        {tarea.integrantes.length > 0 && (
                          <div className="card-avatars">
                            {tarea.integrantes.slice(0,3).map(em => (
                              <span key={em} className="card-avatar" title={em}>
                                {em[0]?.toUpperCase()}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}

                <button className="col-add" onClick={() => openNew(col.id)}>
                  <Plus size={14}/> Agregar tarea
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <TaskModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        tarea={editTarea}
        defaultFecha={editTarea ? undefined : new Date().toISOString().slice(0,10)}
      />
    </main>
  )
}
