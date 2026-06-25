import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { AppProvider } from './context/AppContext'
import Sidebar from './components/Sidebar'
import LoginPage from './pages/LoginPage'
import KanbanPage from './pages/KanbanPage'
import CalendarPage from './pages/CalendarPage'
import CategoriasPage from './pages/CategoriasPage'
import UsuariosPage from './pages/UsuariosPage'

function AppShell() {
  const { usuario, puedeCrearUsuarios } = useAuth()

  if (!usuario) return <LoginPage />

  return (
    <AppProvider>
      <BrowserRouter>
        <Sidebar />
        <Routes>
          <Route path="/"            element={<Navigate to="/kanban" replace />} />
          <Route path="/kanban"      element={<KanbanPage />} />
          <Route path="/calendario"  element={<CalendarPage />} />
          <Route path="/categorias"  element={<CategoriasPage />} />
          {puedeCrearUsuarios && <Route path="/usuarios" element={<UsuariosPage />} />}
          <Route path="*"            element={<Navigate to="/kanban" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </ThemeProvider>
  )
}
