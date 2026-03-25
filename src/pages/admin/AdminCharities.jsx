import React, { useState } from 'react'
import { Plus, Edit2, Trash2, Heart, ExternalLink, Activity, Image as ImageIcon } from 'lucide-react'
import { useCharities } from '../../hooks/useData'
import toast from 'react-hot-toast'

const AdminCharities = () => {
  const { charities, loading, createCharity, updateCharity, deleteCharity } = useCharities()
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  
  const initialForm = {
    name: '',
    description: '',
    category: 'General',
    website: '',
    is_featured: false,
    is_active: true,
  }
  
  const [form, setForm] = useState(initialForm)
  const [saving, setSaving] = useState(false)

  const handleEdit = (charity) => {
    setEditingId(charity.id)
    setForm({
      name: charity.name,
      description: charity.description || '',
      category: charity.category || 'General',
      website: charity.website || '',
      is_featured: charity.is_featured,
      is_active: charity.is_active,
    })
    setShowModal(true)
  }

  const handleCreate = () => {
    setEditingId(null)
    setForm(initialForm)
    setShowModal(true)
  }

  const handleDelete = async (id, name) => {
    if (!confirm(`Permanently delete ${name}? This cannot be undone.`)) return
    const { error } = await deleteCharity(id)
    if (error) toast.error('Failed to delete: ' + error)
    else toast.success('Charity deleted')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    
    let result
    if (editingId) {
      result = await updateCharity(editingId, form)
    } else {
      result = await createCharity(form)
    }
    
    setSaving(false)
    
    if (result.error) {
      toast.error('Failed to save: ' + result.error)
    } else {
      toast.success(`Charity ${editingId ? 'updated' : 'created'}!`)
      setShowModal(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl text-white">Charity Management</h1>
          <p className="text-gray-400 mt-1">{charities.length} total charities listed</p>
        </div>
        <button onClick={handleCreate} className="btn-primary">
          <Plus size={16} />
          Add Charity
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center">
            <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto" />
          </div>
        ) : charities.map(charity => (
          <div key={charity.id} className={`card p-5 ${!charity.is_active ? 'opacity-50' : ''}`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  charity.is_featured ? 'bg-amber-500/20 text-amber-400' : 'bg-rose-500/20 text-rose-400'
                }`}>
                  <Heart size={20} />
                </div>
                <div>
                  <h3 className="font-display font-bold text-white text-lg leading-tight truncate w-32 md:w-40">{charity.name}</h3>
                  <p className="text-xs text-gray-400">{charity.category}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => handleEdit(charity)} className="p-1.5 rounded bg-dark-600 hover:bg-primary-500/20 text-gray-400 hover:text-primary-400">
                  <Edit2 size={14} />
                </button>
                <button onClick={() => handleDelete(charity.id, charity.name)} className="p-1.5 rounded bg-dark-600 hover:bg-red-500/20 text-gray-400 hover:text-red-400">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <p className="text-sm text-gray-400 line-clamp-2 min-h-[40px] mb-4">
              {charity.description || 'No description provided.'}
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-dark-500/50">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Total Raised</p>
                <p className="text-sm font-bold text-emerald-400">
                  £{parseFloat(charity.total_raised || 0).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {charity.is_featured && <span className="badge bg-amber-500/20 text-amber-400 border-amber-500/30">Star</span>}
                {!charity.is_active && <span className="badge badge-inactive">Paused</span>}
                {charity.website && (
                  <a href={charity.website} target="_blank" rel="noopener noreferrer" className="p-1 text-primary-400 hover:text-primary-300">
                    <ExternalLink size={16} />
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-lg p-6 animate-slide-up max-h-[90vh] overflow-y-auto">
            <h2 className="font-display font-bold text-2xl text-white mb-6">
              {editingId ? 'Edit Charity' : 'Add Charity'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="form-label">Charity Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="form-label">Category</label>
                <select
                  className="form-input"
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                >
                  {['Health', 'Children', 'Mental Health', 'Environment', 'Housing', 'Elderly Care', 'General'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Description</label>
                <textarea
                  className="form-input min-h-[100px] resize-y"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  rows="3"
                ></textarea>
              </div>

              <div>
                <label className="form-label">Website URL</label>
                <input
                  type="url"
                  className="form-input"
                  value={form.website}
                  onChange={e => setForm({ ...form, website: e.target.value })}
                  placeholder="https://"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <label className="flex items-center gap-3 p-3 bg-dark-600/50 rounded-xl cursor-pointer hover:bg-dark-600 border border-transparent hover:border-dark-500 transition-colors">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded text-primary-500 bg-dark-800 border-dark-400 focus:ring-primary-500 focus:ring-offset-dark-900"
                    checked={form.is_featured}
                    onChange={e => setForm({ ...form, is_featured: e.target.checked })}
                  />
                  <span className="text-sm font-medium text-white">Featured Status</span>
                </label>
                
                <label className="flex items-center gap-3 p-3 bg-dark-600/50 rounded-xl cursor-pointer hover:bg-dark-600 border border-transparent hover:border-dark-500 transition-colors">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded text-emerald-500 bg-dark-800 border-dark-400 focus:ring-emerald-500 focus:ring-offset-dark-900"
                    checked={form.is_active}
                    onChange={e => setForm({ ...form, is_active: e.target.checked })}
                  />
                  <span className="text-sm font-medium text-white">Active Listing</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-dark-500/50 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1 justify-center">
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1 justify-center" disabled={saving}>
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Save Charity'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminCharities
