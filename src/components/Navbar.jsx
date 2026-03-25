import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, X, Bell, LogOut, User, Settings, LayoutDashboard, ChevronDown, Trophy } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const Navbar = ({ onMenuToggle }) => {
  const { user, profile, signOut, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    toast.success('Signed out successfully')
    navigate('/')
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-800/80 backdrop-blur-lg border-b border-dark-500/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            {user && (
              <button
                onClick={onMenuToggle}
                className="p-2 rounded-lg hover:bg-dark-600 transition-colors lg:hidden"
              >
                <Menu size={20} />
              </button>
            )}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center">
                <Trophy size={16} className="text-white" />
              </div>
              <span className="font-display font-bold text-xl text-white">
                Golf<span className="text-primary-400">Gives</span>
              </span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/charities" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">
              Charities
            </Link>
            <Link to="/draws" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">
              Draws
            </Link>
            {!user && (
              <>
                <Link to="/pricing" className="text-gray-400 hover:text-white transition-colors text-sm font-medium">
                  Pricing
                </Link>
              </>
            )}
          </div>

          {/* Auth Actions */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <button className="p-2 rounded-lg hover:bg-dark-600 transition-colors relative">
                  <Bell size={18} className="text-gray-400" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-primary-500 rounded-full" />
                </button>

                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-dark-600 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center text-sm font-bold">
                      {profile?.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-medium text-white leading-tight">
                        {profile?.full_name || 'User'}
                      </p>
                      <p className="text-xs text-gray-400 capitalize">
                        {isAdmin ? '⚡ Admin' : profile?.subscription_status === 'active' ? '✓ Active' : 'Free'}
                      </p>
                    </div>
                    <ChevronDown size={14} className="text-gray-400" />
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-52 card py-1 shadow-xl animate-slide-up z-50">
                      <div className="px-4 py-2 border-b border-dark-500">
                        <p className="text-sm font-medium text-white">{profile?.full_name || 'User'}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                      <Link
                        to="/dashboard"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-dark-600 transition-colors text-sm"
                      >
                        <LayoutDashboard size={15} className="text-gray-400" />
                        Dashboard
                      </Link>
                      <Link
                        to="/settings"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-dark-600 transition-colors text-sm"
                      >
                        <Settings size={15} className="text-gray-400" />
                        Settings
                      </Link>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-dark-600 transition-colors text-sm text-violet-400"
                        >
                          <User size={15} />
                          Admin Panel
                        </Link>
                      )}
                      <div className="border-t border-dark-500 mt-1">
                        <button
                          onClick={handleSignOut}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-dark-600 transition-colors text-sm text-red-400 w-full"
                        >
                          <LogOut size={15} />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="btn-secondary btn-sm">Sign In</Link>
                <Link to="/register" className="btn-primary btn-sm">Get Started</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
