import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

interface ThemeContextType {
  theme: 'dark' | 'light' | 'black'
  accent: string
  setTheme: (t: 'dark' | 'light' | 'black') => void
  setAccent: (c: string) => void
}

const ThemeContext = createContext<ThemeContextType | null>(null)

const ACCENTS = ['#6366f1','#22c55e','#f59e0b','#ef4444','#3b82f6','#a855f7']

export { ACCENTS }

const DEFAULT_ACCENT = '#6366f1'
const VALID_THEMES = ['dark', 'light', 'black'] as const

function isValidHex(c: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(c)
}

// Perceived brightness 0–255
function brightness(hex: string): number {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return r * 0.299 + g * 0.587 + b * 0.114
}

// Returns the best readable text color on top of the given accent
function textOnAccent(hex: string): string {
  if (!isValidHex(hex)) return '#ffffff'
  return brightness(hex) > 160 ? '#1a1a2e' : '#ffffff'
}

function safeAccent(): string {
  const stored = localStorage.getItem('luna_accent')
  if (stored && isValidHex(stored)) return stored
  localStorage.setItem('luna_accent', DEFAULT_ACCENT)
  return DEFAULT_ACCENT
}

function safeTheme(): 'dark'|'light'|'black' {
  const stored = localStorage.getItem('luna_theme') as 'dark'|'light'|'black'
  if (VALID_THEMES.includes(stored)) return stored
  localStorage.setItem('luna_theme', 'dark')
  return 'dark'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme,  setThemeState]  = useState<'dark'|'light'|'black'>(safeTheme)
  const [accent, setAccentState] = useState<string>(safeAccent)

  const apply = (t: 'dark'|'light'|'black', a: string) => {
    const root = document.documentElement
    root.setAttribute('data-theme', t)
    root.style.setProperty('--accent', a)
    root.style.setProperty('--accent2', a + 'cc')
    root.style.setProperty('--text-on-accent', textOnAccent(a))
    root.style.colorScheme = t === 'light' ? 'light' : 'dark'
  }

  useEffect(() => { apply(theme, accent) }, [theme, accent])

  const setTheme = (t: 'dark'|'light'|'black') => {
    localStorage.setItem('luna_theme', t)
    setThemeState(t)
  }

  const setAccent = (c: string) => {
    const safe = isValidHex(c) ? c : DEFAULT_ACCENT
    localStorage.setItem('luna_accent', safe)
    setAccentState(safe)
  }

  return (
    <ThemeContext.Provider value={{ theme, accent, setTheme, setAccent }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be inside ThemeProvider')
  return ctx
}
