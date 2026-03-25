import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Trophy, Heart, TrendingUp,
  Settings, LogOut, X, ChevronRight, CreditCard, Users,
  Dice6, Star, Award
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const userNavItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/scores', icon: TrendingUp, label: 'My Scores' },
  { to: '/draws', icon: Dice6, label: 'Draws' },
  { to: '/winnings', icon: Trophy, label: 'My Winnings' },
  { to: '/charities', icon: Heart, label: 'Charities' },
  { to: '/subscription', icon: CreditCard, label: 'Subscription' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

const adminNavItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Overview', exact: true },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/draws', icon: Dice6, label: 'Draw Management' },
  { to: '/admin/charities', icon: Heart, label: 'Charities' },
  { to: '/admin/winners', icon: Award, label: 'Winners' },
]

const Sidebar = ({ isOpen, onClose }) => {
  const { profile, signOut, isAdmin } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    toast.success('Signed out!')
    navigate('/')
    onClose?.()
  }

  const navItems = isAdmin ? adminNavItems : userNavItems

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-dark-800 border-r border-dark-500/50 z-50
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:top-16 lg:h-[calc(100vh-4rem)]
        flex flex-col
      `}>
        {/* Mobile close + profile */}
        <div className="flex items-center justify-between p-4 border-b border-dark-500/50 lg:hidden">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center font-bold text-sm">
              {profile?.full_name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <p className="text-sm font-semibold">{profile?.full_name || 'User'}</p>
              <p className="text-xs text-gray-400">{isAdmin ? 'Administrator' : 'Member'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-dark-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Admin Badge */}
        {isAdmin && (
          <div className="mx-4 mt-4 px-3 py-2 bg-violet-500/10 border border-violet-500/30 rounded-xl">
            <div className="flex items-center gap-2">
              <Star size={14} className="text-violet-400" />
              <span className="text-xs font-semibold text-violet-400">Admin Mode</span>
            </div>
          </div>
        )}

        {/* Nav Items */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto mt-2">
          {navItems.map(({ to, icon: Icon, label, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              onClick={onClose}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-200 group
                ${isActive
                  ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
                  : 'text-gray-400 hover:bg-dark-600 hover:text-white'
                }
              `}
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} className={isActive ? 'text-primary-400' : 'text-gray-500 group-hover:text-gray-300'} />
                  <span className="flex-1">{label}</span>
                  {isActive && <ChevronRight size={14} className="text-primary-400" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Subscription Status */}
        {!isAdmin && (
          <div className="p-4 border-t border-dark-500/50">
            <div className={`px-3 py-3 rounded-xl ${
              profile?.subscription_status === 'active'
                ? 'bg-emerald-500/10 border border-emerald-500/30'
                : 'bg-amber-500/10 border border-amber-500/30'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-300">Subscription</p>
                  <p className={`text-xs mt-0.5 capitalize ${
                    profile?.subscription_status === 'active' ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {profile?.subscription_status || 'Inactive'} • {profile?.plan_type || '—'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sign Out */}
        <div className="p-4 border-t border-dark-500/50">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                       text-gray-400 hover:bg-red-500/10 hover:text-red-400 w-full
                       transition-all duration-200"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
