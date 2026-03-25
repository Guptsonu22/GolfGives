import React, { useState } from 'react'
import { useAdminUsers } from '../../hooks/useData'
import { Search, Edit2, CheckCircle2, XCircle, Users } from 'lucide-react'
import toast from 'react-hot-toast'

const AdminUsers = () => {
  const { users, loading, updateUser } = useAdminUsers()
  const [search, setSearch] = useState('')
  const [editingUser, setEditingUser] = useState(null)
  const [editForm, setEditForm] = useState({})

  const filtered = users.filter(u =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  const startEdit = (user) => {
    setEditingUser(user.id)
    setEditForm({
      full_name: user.full_name || '',
      subscription_status: user.subscription_status || 'inactive',
      plan_type: user.plan_type || 'monthly',
      role: user.role || 'user',
    })
  }

  const saveEdit = async (userId) => {
    const { error } = await updateUser(userId, editForm)
    if (error) toast.error('Failed to update user')
    else {
      toast.success('User updated')
      setEditingUser(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl text-white">User Management</h1>
          <p className="text-gray-400 mt-1">{users.length} total users</p>
        </div>
        {/* Stats */}
        <div className="flex gap-4 text-sm">
          <div className="card px-4 py-2 text-center">
            <p className="font-bold text-emerald-400">{users.filter(u => u.subscription_status === 'active').length}</p>
            <p className="text-xs text-gray-400">Active</p>
          </div>
          <div className="card px-4 py-2 text-center">
            <p className="font-bold text-gray-400">{users.filter(u => u.subscription_status !== 'active').length}</p>
            <p className="text-xs text-gray-400">Inactive</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Search by name or email..."
          className="form-input pl-10"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Users size={40} className="text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Status</th>
                  <th>Plan</th>
                  <th>Role</th>
                  <th>Charity</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {user.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-white text-sm truncate">{user.full_name || 'No name'}</p>
                          <p className="text-xs text-gray-400 truncate">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      {editingUser === user.id ? (
                        <select
                          className="form-input py-1 text-xs"
                          value={editForm.subscription_status}
                          onChange={e => setEditForm({ ...editForm, subscription_status: e.target.value })}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="expired">Expired</option>
                        </select>
                      ) : (
                        <span className={user.subscription_status === 'active' ? 'badge-active' : 'badge-inactive'}>
                          {user.subscription_status || 'inactive'}
                        </span>
                      )}
                    </td>
                    <td>
                      {editingUser === user.id ? (
                        <select
                          className="form-input py-1 text-xs"
                          value={editForm.plan_type}
                          onChange={e => setEditForm({ ...editForm, plan_type: e.target.value })}
                        >
                          <option value="monthly">Monthly</option>
                          <option value="yearly">Yearly</option>
                        </select>
                      ) : (
                        <span className="text-sm capitalize text-gray-300">{user.plan_type || '—'}</span>
                      )}
                    </td>
                    <td>
                      {editingUser === user.id ? (
                        <select
                          className="form-input py-1 text-xs"
                          value={editForm.role}
                          onChange={e => setEditForm({ ...editForm, role: e.target.value })}
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      ) : (
                        <span className={`text-sm ${user.role === 'admin' ? 'text-violet-400 font-semibold' : 'text-gray-400'}`}>
                          {user.role || 'user'}
                        </span>
                      )}
                    </td>
                    <td>
                      <span className="text-xs text-gray-400">{user.charities?.name || '—'}</span>
                    </td>
                    <td>
                      <span className="text-xs text-gray-500">{new Date(user.created_at).toLocaleDateString()}</span>
                    </td>
                    <td>
                      {editingUser === user.id ? (
                        <div className="flex gap-1">
                          <button
                            onClick={() => saveEdit(user.id)}
                            className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400"
                          >
                            <CheckCircle2 size={14} />
                          </button>
                          <button
                            onClick={() => setEditingUser(null)}
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400"
                          >
                            <XCircle size={14} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEdit(user)}
                          className="p-1.5 rounded-lg hover:bg-dark-500 text-gray-400 hover:text-white transition-colors"
                        >
                          <Edit2 size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminUsers
