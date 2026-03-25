import React, { useState } from 'react'
import { Trophy, CheckCircle2, XCircle, Search, ExternalLink, Clock, Image as ImageIcon } from 'lucide-react'
import { format } from 'date-fns'
import { useWinnings } from '../../hooks/useData'
import toast from 'react-hot-toast'

const AdminWinners = () => {
  const { winnings, loading, updateWinningStatus, fetchWinnings } = useWinnings('all') // custom hook accepts 'all' for admin mode
  const [filter, setFilter] = useState('pending') // pending | verified | paid | rejected | all
  const [search, setSearch] = useState('')
  const [processing, setProcessing] = useState(null)

  const filtered = winnings.filter(w => {
    const matchStatus = filter === 'all' || 
                        (filter === 'pending' && (w.status === 'pending' || w.status === 'verified')) ||
                        w.status === filter
    const matchSearch = w.users?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
                        w.users?.email?.toLowerCase().includes(search.toLowerCase())
    return matchStatus && matchSearch
  })

  const handleStatusChange = async (id, newStatus, currentStatus) => {
    let note = ''
    if (newStatus === 'rejected') {
      note = prompt('Reason for rejection?')
      if (note === null) return
    }
    
    if (newStatus === 'paid' && currentStatus !== 'verified') {
      if (!confirm('Warning: This winning has not been verified yet. Mark as paid anyway?')) return
    }

    setProcessing(id)
    const { error } = await updateWinningStatus(id, newStatus, note)
    setProcessing(null)

    if (error) toast.error('Failed to update status')
    else toast.success(`Winning marked as ${newStatus}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl text-white">Winner Verification</h1>
          <p className="text-gray-400 mt-1">Verify proofs and manage prize payouts</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search by name or email..."
            className="form-input pl-10"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
          {[
            { id: 'pending', label: 'Action Needed' },
            { id: 'paid', label: 'Paid Out' },
            { id: 'all', label: 'All Records' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                filter === f.id
                  ? 'bg-primary-500 text-white'
                  : 'bg-dark-600 text-gray-400 hover:bg-dark-500 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Trophy size={48} className="text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No winnings found</p>
            <p className="text-gray-500 text-sm mt-1">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Winner</th>
                  <th>Draw Details</th>
                  <th>Match</th>
                  <th>Prize (£)</th>
                  <th>Proof</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(w => (
                  <tr key={w.id} className={w.status === 'pending' && w.proof_url ? 'bg-primary-500/5' : ''}>
                    <td>
                      <p className="font-medium text-white text-sm">{w.users?.full_name}</p>
                      <p className="text-xs text-gray-400">{w.users?.email}</p>
                    </td>
                    <td>
                      <p className="text-sm font-medium text-gray-300">{w.draws?.draw_name}</p>
                      <p className="text-xs text-gray-500">{format(new Date(w.draws?.draw_date), 'dd MMM yyyy')}</p>
                    </td>
                    <td>
                      <span className={`badge ${
                        w.match_type === '5-match' ? 'bg-amber-500/20 text-amber-400' :
                        w.match_type === '4-match' ? 'bg-primary-500/20 text-primary-400' :
                        'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {w.match_type}
                      </span>
                    </td>
                    <td>
                      <span className="font-display font-bold text-white">
                        £{parseFloat(w.amount).toFixed(2)}
                      </span>
                    </td>
                    <td>
                      {w.proof_url ? (
                        <a
                          href={w.proof_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-dark-600 hover:bg-primary-500/20 text-primary-400 rounded-lg text-xs font-medium transition-colors"
                        >
                          <ImageIcon size={14} /> View
                        </a>
                      ) : (
                        <span className="text-xs text-gray-500 italic">Pending upload</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${
                        w.status === 'verified' ? 'badge-active' :
                        w.status === 'paid' ? 'badge-paid' :
                        w.status === 'rejected' ? 'badge-rejected' :
                        'badge-pending'
                      }`}>
                        {w.status}
                      </span>
                    </td>
                    <td>
                      <div className="flex flex-col gap-1.5 min-w-[120px]">
                        {/* If pending/uploaded, admin can Verify or Reject */}
                        {w.status === 'pending' && (
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => handleStatusChange(w.id, 'verified', w.status)}
                              className="btn-sm flex-1 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                              disabled={processing === w.id || !w.proof_url}
                              title={!w.proof_url ? "User hasn't uploaded proof yet" : "Verify Proof"}
                            >
                              Verify
                            </button>
                            <button
                              onClick={() => handleStatusChange(w.id, 'rejected', w.status)}
                              className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20"
                              disabled={processing === w.id}
                            >
                              <XCircle size={16} />
                            </button>
                          </div>
                        )}
                        
                        {/* If verified (or forced pending), admin can Mark Paid */}
                        {(w.status === 'verified' || w.status === 'pending') && (
                          <button
                            onClick={() => handleStatusChange(w.id, 'paid', w.status)}
                            className="btn-sm bg-primary-500/20 text-primary-400 hover:bg-primary-500/30 w-full"
                            disabled={processing === w.id}
                          >
                            Mark Paid
                          </button>
                        )}

                        {w.status === 'paid' && (
                          <span className="text-xs text-gray-500 text-center flex items-center justify-center gap-1">
                            <CheckCircle2 size={12} className="text-emerald-500" /> Settled
                          </span>
                        )}
                      </div>
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

export default AdminWinners
