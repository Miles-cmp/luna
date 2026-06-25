import { X, Sun, Moon, Check, Pencil, Eclipse } from 'lucide-react'
import { useTheme, ACCENTS } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { textOnColor } from '../utils/color'
import { useState } from 'react'
import './AppearanceModal.css'

interface Props { onClose: () => void }

export default function AppearanceModal({ onClose }: Props) {
  const { theme, accent, setTheme, setAccent } = useTheme()
  const { usuario } = useAuth()
  const [customColor, setCustomColor] = useState('#6366f1')
  const [showCustom, setShowCustom]   = useState(false)

  const inicial = usuario?.nombre?.[0]?.toUpperCase() ?? '?'

  return (
    <div className="ap-overlay" onClick={onClose}>
      <div className="ap-modal" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="ap-header">
          <div className="ap-header-icon">
            <Sun size={20}/>
          </div>
          <div>
            <p className="ap-header-title">Personalización</p>
            <p className="ap-header-sub">Ajustes de la pantalla</p>
          </div>
          <button className="ap-close" onClick={onClose}><X size={18}/></button>
        </div>

        {/* User info */}
        <div className="ap-user">
          <div className="ap-avatar" style={{ background: accent }}>{inicial}</div>
          <div>
            <p className="ap-user-name">{usuario?.nombre}</p>
            <p className="ap-user-role">{usuario?.rol}</p>
          </div>
        </div>

        <div className="ap-body">

          {/* Tema */}
          <section className="ap-section">
            <p className="ap-section-title">Tema de la Aplicación</p>
            <div className="ap-themes">
              <button
                className={`ap-theme-btn ${theme === 'light' ? 'selected' : ''}`}
                onClick={() => setTheme('light')}
              >
                <Sun size={22}/>
                <span>Light</span>
              </button>
              <button
                className={`ap-theme-btn ${theme === 'dark' ? 'selected' : ''}`}
                onClick={() => setTheme('dark')}
              >
                <Moon size={22}/>
                <span>Dark</span>
              </button>
              <button
                className={`ap-theme-btn ${theme === 'black' ? 'selected' : ''}`}
                onClick={() => setTheme('black')}
              >
                <Eclipse size={22}/>
                <span>Negro</span>
              </button>
            </div>
          </section>

          {/* Color principal */}
          <section className="ap-section">
            <p className="ap-section-title">Color Principal</p>
            <div className="ap-colors">
              {ACCENTS.map(c => (
                <button
                  key={c}
                  className={`ap-color-swatch ${accent === c ? 'selected' : ''}`}
                  style={{ background: c }}
                  onClick={() => { setAccent(c); setShowCustom(false) }}
                >
                  {accent === c && <Check size={14} color={textOnColor(c)}/>}
                </button>
              ))}
              <button
                className={`ap-color-swatch custom-trigger ${showCustom ? 'selected' : ''}`}
                onClick={() => setShowCustom(v => !v)}
                title="Color personalizado"
              >
                <Pencil size={13}/>
              </button>
            </div>
            {showCustom && (
              <div className="ap-custom-color">
                <input
                  type="color"
                  value={customColor}
                  onChange={e => setCustomColor(e.target.value)}
                />
                <span className="ap-custom-label">{customColor}</span>
                {/* text-on-accent computed from customColor, not from applied accent */}
                <button
                  className="ap-custom-apply"
                  style={{ background: customColor, color: textOnColor(customColor) }}
                  onClick={() => { setAccent(customColor); setShowCustom(false) }}
                >
                  <Check size={14}/> Aplicar
                </button>
              </div>
            )}
          </section>

          {/* Preview — uses applied accent */}
          <div className="ap-preview" style={{ background: accent + '22', borderColor: accent + '55' }}>
            <span style={{ color: 'var(--text)', fontWeight: 600, fontSize: 13 }}>
              Vista previa —{' '}
              <span style={{ color: accent, fontWeight: 700 }}>color</span>
            </span>
            <div
              className="ap-preview-btn"
              style={{ background: accent, color: textOnColor(accent) }}
            >
              Botón
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
