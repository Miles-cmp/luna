import { useState, useEffect } from 'react'
import { X, MapPin, Clock, Users, Tag, AlignLeft, Calendar } from 'lucide-react'
import { useApp, type Tarea } from '../context/AppContext'
import { textOnColor } from '../utils/color'
import './TaskModal.css'

interface Props {
  open: boolean
  onClose: () => void
  defaultFecha?: string   // YYYY-MM-DD
  tarea?: Tarea | null    // edición
}

const empty = (fecha: string): Omit<Tarea, 'id'> => ({
  titulo: '', descripcion: '', lugar: '',
  fecha_inicio: fecha + 'T09:00',
  fecha_fin:    fecha + 'T18:00',
  todo_el_dia: false, categoria_id: 0,
  columna_kanban: 'pendiente',
  recordatorio_min: null, integrantes: [],
})

export default function TaskModal({ open, onClose, defaultFecha, tarea }: Props) {
  const { categorias, addTarea, updateTarea } = useApp()
  const hoy = new Date().toISOString().slice(0, 10)
  const [form, setForm] = useState<Omit<Tarea, 'id'>>(empty(defaultFecha ?? hoy))
  const [integranteInput, setIntegranteInput] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (tarea) {
      const { id: _, ...rest } = tarea
      setForm(rest)
    } else {
      setForm(empty(defaultFecha ?? hoy))
    }
    setError('')
    setIntegranteInput('')
  }, [open, tarea, defaultFecha])

  if (!open) return null

  const set = <K extends keyof typeof form>(k: K, v: typeof form[K]) =>
    setForm(f => ({ ...f, [k]: v }))

  const addIntegrante = () => {
    const email = integranteInput.trim()
    if (!email || form.integrantes.includes(email)) return
    set('integrantes', [...form.integrantes, email])
    setIntegranteInput('')
  }

  const removeIntegrante = (email: string) =>
    set('integrantes', form.integrantes.filter(e => e !== email))

  const submit = () => {
    if (!form.titulo.trim()) { setError('El título es obligatorio'); return }
    if (!form.categoria_id)  { setError('Selecciona una categoría'); return }
    if (tarea) updateTarea({ ...form, id: tarea.id })
    else       addTarea(form)
    onClose()
  }

  const activeCats = categorias.filter(c => c.estado === 'activo')

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{tarea ? 'Editar tarea' : 'Nueva tarea'}</h2>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="modal-body">
          {/* Título */}
          <div className="field">
            <label>Título *</label>
            <input
              className="input"
              placeholder="Nombre de la tarea"
              value={form.titulo}
              onChange={e => set('titulo', e.target.value)}
            />
          </div>

          {/* Descripción */}
          <div className="field">
            <label><AlignLeft size={13} /> Descripción</label>
            <textarea
              className="input"
              rows={2}
              placeholder="Detalle opcional..."
              value={form.descripcion}
              onChange={e => set('descripcion', e.target.value)}
            />
          </div>

          {/* Todo el día toggle */}
          <div className="field-row">
            <label className="toggle-label">
              <Calendar size={13} />
              Todo el día
              <span
                className={`toggle ${form.todo_el_dia ? 'on' : ''}`}
                onClick={() => set('todo_el_dia', !form.todo_el_dia)}
              />
            </label>
          </div>

          {/* Fechas */}
          <div className="field-cols">
            <div className="field">
              <label>Fecha inicio *</label>
              <input
                className="input"
                type={form.todo_el_dia ? 'date' : 'datetime-local'}
                value={form.todo_el_dia ? form.fecha_inicio.slice(0,10) : form.fecha_inicio}
                onChange={e => set('fecha_inicio', form.todo_el_dia ? e.target.value + 'T00:00' : e.target.value)}
              />
            </div>
            <div className="field">
              <label>Fecha fin *</label>
              <input
                className="input"
                type={form.todo_el_dia ? 'date' : 'datetime-local'}
                value={form.todo_el_dia ? form.fecha_fin.slice(0,10) : form.fecha_fin}
                onChange={e => set('fecha_fin', form.todo_el_dia ? e.target.value + 'T23:59' : e.target.value)}
              />
            </div>
          </div>

          {/* Categoría */}
          <div className="field">
            <label><Tag size={13} /> Categoría *</label>
            <div className="cat-chips">
              {activeCats.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  className={`cat-chip ${form.categoria_id === cat.id ? 'selected' : ''}`}
                  style={form.categoria_id === cat.id
                    ? { background: cat.color, color: textOnColor(cat.color), borderColor: cat.color }
                    : { borderColor: cat.color, color: cat.color }}
                  onClick={() => set('categoria_id', cat.id)}
                >
                  {cat.nombre}
                </button>
              ))}
            </div>
          </div>

          {/* Columna kanban */}
          <div className="field">
            <label>Estado en Kanban</label>
            <select
              className="input"
              value={form.columna_kanban}
              onChange={e => set('columna_kanban', e.target.value as Tarea['columna_kanban'])}
            >
              <option value="pendiente">Pendiente</option>
              <option value="en_progreso">En progreso</option>
              <option value="en_revision">En revisión</option>
              <option value="finalizado">Finalizado</option>
            </select>
          </div>

          {/* Lugar */}
          <div className="field">
            <label><MapPin size={13} /> Lugar</label>
            <input
              className="input"
              placeholder="Oficina, remoto, dirección..."
              value={form.lugar}
              onChange={e => set('lugar', e.target.value)}
            />
          </div>

          {/* Integrantes */}
          <div className="field">
            <label><Users size={13} /> Integrantes</label>
            <div className="integrante-row">
              <input
                className="input"
                placeholder="email@ejemplo.com"
                value={integranteInput}
                onChange={e => setIntegranteInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addIntegrante())}
              />
              <button type="button" className="btn-add-int" onClick={addIntegrante}>+</button>
            </div>
            {form.integrantes.length > 0 && (
              <div className="integrantes-list">
                {form.integrantes.map(em => (
                  <span key={em} className="integrante-chip">
                    {em}
                    <button onClick={() => removeIntegrante(em)}><X size={10} /></button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Recordatorio */}
          <div className="field">
            <label><Clock size={13} /> Recordatorio (minutos antes)</label>
            <select
              className="input"
              value={form.recordatorio_min ?? ''}
              onChange={e => set('recordatorio_min', e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">Sin recordatorio</option>
              <option value="5">5 min</option>
              <option value="10">10 min</option>
              <option value="15">15 min</option>
              <option value="30">30 min</option>
              <option value="60">1 hora</option>
              <option value="120">2 horas</option>
              <option value="1440">1 día</option>
            </select>
          </div>

          {error && <p className="modal-error">{error}</p>}
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose}>Cancelar</button>
          <button className="btn-save" onClick={submit}>
            {tarea ? 'Guardar cambios' : 'Crear tarea'}
          </button>
        </div>
      </div>
    </div>
  )
}
