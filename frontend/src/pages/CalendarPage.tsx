import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, MapPin, Clock, Users } from 'lucide-react'
import { useApp } from '../context/AppContext'
import type { Tarea } from '../context/AppContext'
import TaskModal from '../components/TaskModal'
import './CalendarPage.css'

const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

function getDias(year: number, month: number) {
  const first = new Date(year, month, 1).getDay()
  const total = new Date(year, month + 1, 0).getDate()
  const dias: (number | null)[] = Array(first).fill(null)
  for (let d = 1; d <= total; d++) dias.push(d)
  while (dias.length % 7 !== 0) dias.push(null)
  return dias
}

function fmt(y: number, m: number, d: number) {
  return `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`
}

export default function CalendarPage() {
  const { tareas, categorias } = useApp()
  const hoy = new Date()
  const [year, setYear]     = useState(hoy.getFullYear())
  const [month, setMonth]   = useState(hoy.getMonth())
  const [selected, setSelected] = useState<string | null>(null)
  const [modalOpen, setModalOpen]   = useState(false)
  const [editTarea, setEditTarea]   = useState<Tarea | null>(null)
  const [modalFecha, setModalFecha] = useState<string | undefined>()

  const dias = getDias(year, month)
  const todayStr = fmt(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())

  const prev = () => month === 0 ? (setYear(y=>y-1), setMonth(11)) : setMonth(m=>m-1)
  const next = () => month === 11 ? (setYear(y=>y+1), setMonth(0)) : setMonth(m=>m+1)

  const getCat = (id: number) => categorias.find(c => c.id === id)

  const tareasDelDia = (day: number) => {
    const d = fmt(year, month, day)
    return tareas.filter(t => t.fecha_inicio.slice(0,10) === d || t.fecha_fin.slice(0,10) === d)
  }

  const selectedTareas = selected
    ? tareas.filter(t => t.fecha_inicio.slice(0,10) === selected || t.fecha_fin.slice(0,10) === selected)
    : tareas.slice().sort((a,b) => a.fecha_inicio.localeCompare(b.fecha_inicio)).slice(0,8)

  const openNew = (fecha?: string) => {
    setEditTarea(null)
    setModalFecha(fecha)
    setModalOpen(true)
  }

  const openEdit = (t: Tarea) => {
    setEditTarea(t)
    setModalFecha(undefined)
    setModalOpen(true)
  }

  return (
    <main className="cal-page">
      <header className="cal-header">
        <div>
          <h1 className="page-title">Calendario</h1>
          <p className="page-sub">{MESES[month]} {year}</p>
        </div>
        <div className="cal-header-right">
          <div className="cal-nav">
            <button className="cal-nav-btn" onClick={prev}><ChevronLeft size={16}/></button>
            <button className="cal-nav-btn" onClick={() => { setYear(hoy.getFullYear()); setMonth(hoy.getMonth()) }}>Hoy</button>
            <button className="cal-nav-btn" onClick={next}><ChevronRight size={16}/></button>
          </div>
          <button className="btn-primary" onClick={() => openNew()}><Plus size={16}/> Nueva tarea</button>
        </div>
      </header>

      <div className="cal-body">
        <div className="cal-grid-wrap">
          <div className="cal-weekdays">
            {DIAS_SEMANA.map(d => <div key={d} className="cal-weekday">{d}</div>)}
          </div>
          <div className="cal-grid">
            {dias.map((day, i) => {
              if (day === null) return <div key={`e-${i}`} className="cal-cell empty"/>
              const dateStr = fmt(year, month, day)
              const evs     = tareasDelDia(day)
              const isToday = dateStr === todayStr
              const isSel   = dateStr === selected
              return (
                <div
                  key={dateStr}
                  className={`cal-cell${isToday?' today':''}${isSel?' selected':''}`}
                  onClick={() => setSelected(isSel ? null : dateStr)}
                  onDoubleClick={() => openNew(dateStr)}
                >
                  <span className="cal-day-num">{day}</span>
                  <div className="cal-events">
                    {evs.slice(0,3).map(ev => {
                      const cat = getCat(ev.categoria_id)
                      return (
                        <div
                          key={ev.id}
                          className="cal-ev-pill"
                          style={{ background: (cat?.color ?? '#6366f1')+'33', color: cat?.color ?? '#6366f1' }}
                          onClick={e => { e.stopPropagation(); openEdit(ev) }}
                        >
                          {ev.titulo}
                        </div>
                      )
                    })}
                    {evs.length > 3 && <div className="cal-ev-more">+{evs.length-3} más</div>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Panel lateral */}
        <aside className="cal-panel">
          <div className="cal-panel-top">
            <h2 className="cal-panel-title">
              {selected
                ? new Date(selected+'T12:00').toLocaleDateString('es-PE',{weekday:'long',day:'numeric',month:'long'})
                : 'Próximas tareas'}
            </h2>
            {selected && (
              <button className="cal-panel-add" onClick={() => openNew(selected)}>
                <Plus size={14}/>
              </button>
            )}
          </div>

          <div className="cal-panel-list">
            {selectedTareas.length === 0 && <p className="cal-empty">Sin tareas este día</p>}
            {selectedTareas.map(t => {
              const cat = getCat(t.categoria_id)
              return (
                <div key={t.id} className="cal-panel-item" onClick={() => openEdit(t)}>
                  <div className="cal-panel-dot" style={{ background: cat?.color ?? '#6366f1' }}/>
                  <div className="cal-panel-info">
                    <p className="cal-panel-ev-title">{t.titulo}</p>
                    <p className="cal-panel-ev-time">
                      {t.todo_el_dia
                        ? 'Todo el día'
                        : `${t.fecha_inicio.slice(11,16)} → ${t.fecha_fin.slice(11,16)}`}
                      {!selected && ` · ${new Date(t.fecha_inicio+'').toLocaleDateString('es-PE',{day:'numeric',month:'short'})}`}
                    </p>
                    {t.lugar && (
                      <p className="cal-panel-meta"><MapPin size={10}/>{t.lugar}</p>
                    )}
                    {t.integrantes.length > 0 && (
                      <p className="cal-panel-meta"><Users size={10}/>{t.integrantes.length} integrante{t.integrantes.length > 1 ? 's' : ''}</p>
                    )}
                    {t.recordatorio_min && (
                      <p className="cal-panel-meta"><Clock size={10}/>Recordatorio: {t.recordatorio_min} min</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </aside>
      </div>

      <TaskModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        defaultFecha={modalFecha}
        tarea={editTarea}
      />
    </main>
  )
}
