import React from 'react'
import { Users, Dice6, Heart, Trophy, TrendingUp, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAdminUsers } from '../../hooks/useData'
import { useDraws } from '../../hooks/useData'
import { useCharities } from '../../hooks/useData'

const AdminOverview = () => {
  const { users } = useAdminUsers()
  const { draws } = useDraws()
  const { charities } = useCharities()

  const activeUsers = users.filter(u => u.subscription_status === 'active').length
  const totalPool = users.reduce((sum, u) => {
    const amount = u.plan_type === 'yearly' ? 75 : 9
    return u.subscription_status === 'active' ? sum + amount : sum
  }, 0)
  const charityTotal = Math.round(totalPool * 0.10)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-bold text-3xl text-white">Admin Overview</h1>
        <p className="text-gray-400 mt-1">Platform health at a glance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: users.length, icon: Users, color: 'bg-primary-500', to: '/admin/users' },
          { label: 'Active Subscribers', value: activeUsers, icon: TrendingUp, color: 'bg-emerald-500', to: '/admin/users' },
          { label: 'Total Draws', value: draws.length, icon: Dice6, color: 'bg-violet-500', to: '/admin/draws' },
          { label: 'Charities', value: charities.length, icon: Heart, color: 'bg-rose-500', to: '/admin/charities' },
        ].map(({ label, value, icon: Icon, color, to }) => (
          <Link key={label} to={to} className="stat-card card-hover group">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}>
              <Icon size={20} className="text-white" />
            </div>
            <div>
              <p className="stat-number">{value}</p>
              <p className="stat-label">{label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Revenue & Charity */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="font-display font-semibold text-lg text-white mb-4">Monthly Revenue</h3>
          <p className="text-4xl font-display font-black text-white">£{totalPool.toLocaleString()}</p>
          <p className="text-gray-400 text-sm mt-1">Estimated from {activeUsers} active subscribers</p>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Prize pool (90%)</span>
              <span className="text-white font-semibold">£{Math.round(totalPool * 0.9)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Charity (≥10%)</span>
              <span className="text-emerald-400 font-semibold">£{charityTotal}</span>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="font-display font-semibold text-lg text-white mb-4">Quick Actions</h3>
          <div className="space-y-2">
            {[
              { label: 'Run New Draw', to: '/admin/draws', icon: Dice6 },
              { label: 'Manage Users', to: '/admin/users', icon: Users },
              { label: 'Review Winners', to: '/admin/winners', icon: Trophy },
              { label: 'Add Charity', to: '/admin/charities', icon: Heart },
            ].map(({ label, to, icon: Icon }) => (
              <Link
                key={label}
                to={to}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-dark-600 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <Icon size={16} className="text-gray-400 group-hover:text-primary-400 transition-colors" />
                  <span className="text-sm text-gray-300">{label}</span>
                </div>
                <ArrowRight size={14} className="text-gray-500 group-hover:text-primary-400 group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent users */}
      <div className="card overflow-hidden">
        <div className="p-5 border-b border-dark-500/50 flex items-center justify-between">
          <h3 className="font-display font-semibold text-lg text-white">Recent Users</h3>
          <Link to="/admin/users" className="text-primary-400 text-sm hover:text-primary-300">View All</Link>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th><th>Email</th><th>Status</th><th>Plan</th><th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.slice(0, 5).map(u => (
              <tr key={u.id}>
                <td className="font-medium text-white">{u.full_name || '—'}</td>
                <td className="text-gray-400">{u.email}</td>
                <td>
                  <span className={u.subscription_status === 'active' ? 'badge-active' : 'badge-inactive'}>
                    {u.subscription_status || 'inactive'}
                  </span>
                </td>
                <td className="capitalize text-gray-300">{u.plan_type || '—'}</td>
                <td className="text-gray-500 text-xs">{new Date(u.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AdminOverview
