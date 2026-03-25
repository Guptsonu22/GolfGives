import React, { useState } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import { ProtectedRoute, AdminRoute, PublicRoute } from './components/ProtectedRoute'
import { useAuth } from './context/AuthContext'

// Pages
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import ScoresPage from './pages/ScoresPage'
import WinningsPage from './pages/WinningsPage'
import DrawsPage from './pages/DrawsPage'
import CharitiesPage from './pages/CharitiesPage'
import SettingsPage from './pages/SettingsPage'
import SubscriptionPage from './pages/SubscriptionPage'
import AdminPage from './pages/AdminPage'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const { user } = useAuth()

  // App Layout wrapper handles navbar spacing and sidebar layout
  const AppLayout = ({ children }) => {
    // If not authenticated, or if viewing the homepage/auth pages while not logged in
    if (!user && ['/', '/login', '/register', '/charities'].includes(location.pathname)) {
      return (
        <div className="min-h-screen flex flex-col pt-16">
          <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
          <main className="flex-1">{children}</main>
        </div>
      )
    }

    // Authenticated layout with Sidebar
    return (
      <div className="min-h-screen flex flex-col pt-16">
        <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1 lg:pl-64 transition-all duration-300 ease-in-out p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    )
  }

  return (
    <>
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            background: '#1e2a45',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          },
          success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
        }}
      />
      
      <AppLayout>
        <Routes>
          {/* Public / Unauthenticated */}
          <Route path="/" element={<PublicRoute><HomePage /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
          <Route path="/charities" element={<CharitiesPage />} />
          <Route path="/draws" element={<DrawsPage />} />

          {/* Protected / Subscriber Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/scores" element={<ProtectedRoute><ScoresPage /></ProtectedRoute>} />
          <Route path="/winnings" element={<ProtectedRoute><WinningsPage /></ProtectedRoute>} />
          <Route path="/subscription" element={<ProtectedRoute><SubscriptionPage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

          {/* Admin Routes */}
          <Route path="/admin/*" element={<AdminRoute><AdminPage /></AdminRoute>} />
        </Routes>
      </AppLayout>
    </>
  )
}

export default App
