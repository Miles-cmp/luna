import { useState, useRef, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { Kanban, CalendarDays, Moon, Tags, Users, LogOut, Palette, ChevronDown } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import AppearanceModal from './AppearanceModal'
import './Sidebar.css'

export default function Sidebar() {
  const { usuario, logout, puedeCrearUsuarios } = useAuth()
  const { accent } = useTheme()
  const [menuOpen,    setMenuOpen]    = useState(false)
  const [apariencia,  setApariencia]  = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const links = [
    { to: '/kanban',     icon: Kanban,       label: 'Kanban'      },
    { to: '/calendario', icon: CalendarDays,  label: 'Calendario'  },
    { to: '/categorias', icon: Tags,          label: 'Categorías'  },
    ...(puedeCrearUsuarios ? [{ to: '/usuarios', icon: Users, label: 'Usuarios' }] : []),
  ]

  const inicial = usuario?.nombre?.[0]?.toUpperCase() ?? '?'

  return (
    <>
      <aside className="sidebar">
        <div className="sidebar-logo">
          <Moon size={22} className="sidebar-logo-icon" />
          <span>Luna</span>
        </div>

        <nav className="sidebar-nav">
          {links.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => 'sidebar-link' + (isActive ? ' active' : '')}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="sidebar-footer" ref={menuRef}>
          <button className="sidebar-user-btn" onClick={() => setMenuOpen(v => !v)}>
            <div className="sidebar-avatar" style={{ background: accent }}>{inicial}</div>
            <div className="sidebar-user">
              <p className="sidebar-user-name">{usuario?.nombre}</p>
              <p className="sidebar-user-role">{usuario?.rol}</p>
            </div>
            <ChevronDown size={14} className={`sidebar-chevron ${menuOpen ? 'open' : ''}`}/>
          </button>

          {menuOpen && (
            <div className="sidebar-menu">
              <div className="sidebar-menu-user">
                <div className="sidebar-menu-avatar" style={{ background: accent }}>{inicial}</div>
                <div>
                  <p className="sidebar-menu-name">{usuario?.nombre}</p>
                  <p className="sidebar-menu-email">{usuario?.email}</p>
                </div>
              </div>
              <div className="sidebar-menu-divider"/>
              <button className="sidebar-menu-item" onClick={() => { setApariencia(true); setMenuOpen(false) }}>
                <Palette size={15}/> Apariencia
              </button>
              <div className="sidebar-menu-divider"/>
              <button className="sidebar-menu-item danger" onClick={logout}>
                <LogOut size={15}/> Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </aside>

      {apariencia && <AppearanceModal onClose={() => setApariencia(false)}/>}
    </>
  )
}
