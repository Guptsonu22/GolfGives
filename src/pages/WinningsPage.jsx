import React from 'react'
import { format } from 'date-fns'
import { Trophy, Upload, Eye, Clock, CheckCircle2, XCircle, AlertCircle, ArrowRight } from 'lucide-react'
import { useWinnings } from '../hooks/useData'
import { useRef, useState } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

const statusConfig = {
  pending: { label: 'Pending', icon: Clock, color: 'badge-pending' },
  verified: { label: 'Verified', icon: CheckCircle2, color: 'badge-active' },
  paid: { label: 'Paid', icon: CheckCircle2, color: 'badge-paid' },
  rejected: { label: 'Rejected', icon: XCircle, color: 'badge-rejected' },
}

const WinningsPage = () => {
  const { winnings, loading, uploadProof } = useWinnings()
  const fileInputRef = useRef({})
  const [uploading, setUploading] = useState({})

  const totalPaid = winnings
    .filter(w => w.status === 'paid')
    .reduce((sum, w) => sum + parseFloat(w.amount || 0), 0)

  const totalPending = winnings
    .filter(w => w.status === 'pending' || w.status === 'verified')
    .reduce((sum, w) => sum + parseFloat(w.amount || 0), 0)

  const handleProofUpload = async (winningId, file) => {
    if (!file) return
    setUploading(prev => ({ ...prev, [winningId]: true }))
    const { error } = await uploadProof(winningId, file)
    setUploading(prev => ({ ...prev, [winningId]: false }))
    if (error) toast.error('Upload failed: ' + error)
    else toast.success('Proof uploaded! Awaiting admin review.')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-3xl text-white">My Winnings</h1>
        <p className="text-gray-400 mt-1">Track your prize history and payment status</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="stat-card card">
          <Trophy size={20} className="text-amber-400" />
          <div>
            <p className="stat-number text-amber-400">£{totalPaid.toFixed(0)}</p>
            <p className="stat-label">Total Paid Out</p>
          </div>
        </div>
        <div className="stat-card card">
          <Clock size={20} className="text-amber-400" />
          <div>
            <p className="stat-number">£{totalPending.toFixed(0)}</p>
            <p className="stat-label">Pending</p>
          </div>
        </div>
        <div className="stat-card card">
          <CheckCircle2 size={20} className="text-emerald-400" />
          <div>
            <p className="stat-number">{winnings.length}</p>
            <p className="stat-label">Total Wins</p>
          </div>
        </div>
      </div>

      {/* Verification Info */}
      {winnings.some(w => w.status === 'pending' && !w.proof_url) && (
        <div className="flex items-start gap-3 p-4 bg-primary-500/10 border border-primary-500/20 rounded-xl">
          <AlertCircle size={16} className="text-primary-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-primary-300 font-semibold text-sm">Action Required</p>
            <p className="text-primary-400/80 text-xs mt-0.5">
              Upload a screenshot of your scores from the platform to verify your win. 
              Admin will review and approve your payout.
            </p>
          </div>
        </div>
      )}

      {/* Winnings List */}
      {loading ? (
        <div className="card p-12 text-center">
          <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto" />
        </div>
      ) : winnings.length === 0 ? (
        <div className="card p-12 text-center">
          <Trophy size={48} className="text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 font-medium text-lg">No winnings yet</p>
          <p className="text-gray-500 text-sm mt-2">
            Participate in monthly draws by adding your scores and staying subscribed.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {winnings.map(winning => {
            const status = statusConfig[winning.status] || statusConfig.pending
            const StatusIcon = status.icon
            const matchType = winning.match_type
            const matchEmoji = matchType === '5-match' ? '🏆' : matchType === '4-match' ? '🥈' : '🥉'

            return (
              <div key={winning.id} className={`card p-5 transition-all ${
                winning.status === 'paid' ? 'border-emerald-500/30' :
                winning.status === 'pending' ? 'border-amber-500/20' : ''
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  {/* Match info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{matchEmoji}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-display font-bold text-white capitalize">
                            {matchType.replace('-', ' ')}
                          </h3>
                          <span className={status.color}>
                            <StatusIcon size={12} />
                            {status.label}
                          </span>
                        </div>
                        {winning.draws && (
                          <p className="text-xs text-gray-400">
                            {winning.draws.draw_name} • {format(new Date(winning.draws.draw_date), 'dd MMM yyyy')}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Draw numbers */}
                    {winning.draws?.draw_numbers && (
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs text-gray-500">Draw:</span>
                        <div className="flex gap-1">
                          {winning.draws.draw_numbers.map(n => (
                            <span
                              key={n}
                              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                                winning.matched_numbers?.includes(n)
                                  ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500'
                                  : 'bg-dark-600 text-gray-500'
                              }`}
                            >
                              {n}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {winning.admin_notes && (
                      <p className="text-xs text-gray-400 mt-1">📝 {winning.admin_notes}</p>
                    )}
                  </div>

                  {/* Amount + Actions */}
                  <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3">
                    <p className="text-2xl font-display font-bold text-white">
                      £{parseFloat(winning.amount).toFixed(0)}
                    </p>
                    
                    {/* Upload proof button for pending wins */}
                    {winning.status === 'pending' && !winning.proof_url && (
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          ref={el => fileInputRef.current[winning.id] = el}
                          onChange={e => handleProofUpload(winning.id, e.target.files[0])}
                        />
                        <button
                          onClick={() => fileInputRef.current[winning.id]?.click()}
                          className="btn-primary btn-sm text-xs"
                          disabled={uploading[winning.id]}
                        >
                          {uploading[winning.id] ? (
                            <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <Upload size={12} />
                          )}
                          Upload Proof
                        </button>
                      </div>
                    )}

                    {winning.proof_url && (
                      <a
                        href={winning.proof_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary btn-sm text-xs"
                      >
                        <Eye size={12} />
                        View Proof
                      </a>
                    )}

                    {winning.status === 'paid' && winning.paid_at && (
                      <p className="text-xs text-emerald-400">
                        Paid {format(new Date(winning.paid_at), 'dd MMM')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default WinningsPage
