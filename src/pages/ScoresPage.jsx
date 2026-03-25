import React, { useState } from 'react'
import { format } from 'date-fns'
import { Plus, Trash2, TrendingUp, Info, AlertCircle, CheckCircle2, Calendar, FileText } from 'lucide-react'
import { useScores } from '../hooks/useData'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const ScoresPage = () => {
  const { profile } = useAuth()
  const { scores, loading, addScore, deleteScore } = useScores()

  const [form, setForm] = useState({
    score: '',
    scoreDate: format(new Date(), 'yyyy-MM-dd'),
    notes: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.score || form.score < 1 || form.score > 45) {
      return toast.error('Score must be between 1 and 45 (Stableford format)')
    }
    if (scores.some(s => s.score === parseInt(form.score))) {
      return toast.error('Duplicate scores not allowed. Please enter a unique score.')
    }
    setSubmitting(true)
    const { error } = await addScore(form.score, form.scoreDate, form.notes)
    setSubmitting(false)
    if (error) {
      toast.error(error)
    } else {
      toast.success('Score added! 🏌️')
      setForm({ score: '', scoreDate: format(new Date(), 'yyyy-MM-dd'), notes: '' })
      setShowForm(false)
    }
  }

  const handleDelete = async (id) => {
    const loadingToast = toast.loading('Removing score...')
    const { error } = await deleteScore(id)
    toast.dismiss(loadingToast)
    
    if (error) {
      toast.error('Failed to delete score')
    } else {
      toast.success('Score removed')
    }
  }

  const avgScore = scores.length > 0
    ? (scores.reduce((sum, s) => sum + s.score, 0) / scores.length).toFixed(1)
    : '—'
  const highScore = scores.length > 0 ? Math.max(...scores.map(s => s.score)) : '—'
  const isSubscribed = profile?.subscription_status === 'active'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl text-white">My Scores</h1>
          <p className="text-gray-400 mt-1">Track your Stableford scores (1–45)</p>
        </div>
        <button
          id="add-score-btn"
          onClick={() => setShowForm(!showForm)}
          className="btn-primary"
        >
          <Plus size={16} />
          Add Score
        </button>
      </div>

      {/* Rolling Logic Explainer */}
      <div className="flex items-start gap-3 p-4 bg-primary-500/10 border border-primary-500/20 rounded-xl">
        <Info size={16} className="text-primary-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-primary-300 font-semibold text-sm">Rolling 5-Score System</p>
          <p className="text-primary-400/80 text-xs mt-0.5">
            Only your latest 5 scores are kept. When you add a 6th score, the oldest is automatically removed.
            These 5 scores are your draw entries for the current month.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card p-4 text-center">
          <p className="text-2xl font-display font-bold text-primary-400">{scores.length}/5</p>
          <p className="text-xs text-gray-400 mt-1">Scores Logged</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-display font-bold text-emerald-400">{avgScore}</p>
          <p className="text-xs text-gray-400 mt-1">Average Score</p>
        </div>
        <div className="card p-4 text-center">
          <p className="text-2xl font-display font-bold text-amber-400">{highScore}</p>
          <p className="text-xs text-gray-400 mt-1">Best Score</p>
        </div>
      </div>

      {/* Score Entry Form */}
      {showForm && (
        <div className="card p-6 border-primary-500/30 animate-slide-up">
          <h2 className="font-display font-semibold text-lg text-white mb-4 flex items-center gap-2">
            <Plus size={18} className="text-primary-400" />
            Add New Score
          </h2>
          {scores.length >= 5 && (
            <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl mb-4">
              <AlertCircle size={14} className="text-amber-400 mt-0.5 flex-shrink-0" />
              <p className="text-amber-400 text-xs">
                You have 5 scores. Adding this will automatically remove your oldest score ({format(new Date(scores[scores.length - 1]?.score_date || new Date()), 'MMM d, yyyy')}).
              </p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="form-label">
                  Stableford Score (1–45)
                </label>
                <input
                  id="score-input"
                  type="number"
                  min="1"
                  max="45"
                  className="form-input"
                  placeholder="e.g. 32"
                  value={form.score}
                  onChange={e => setForm({ ...form, score: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="form-label flex items-center gap-1">
                  <Calendar size={13} />
                  Date Played
                </label>
                <input
                  id="score-date"
                  type="date"
                  className="form-input"
                  value={form.scoreDate}
                  max={format(new Date(), 'yyyy-MM-dd')}
                  onChange={e => setForm({ ...form, scoreDate: e.target.value })}
                  required
                />
              </div>
            </div>
            <div>
              <label className="form-label flex items-center gap-1">
                <FileText size={13} />
                Notes (optional)
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Windy day at Royal Lytham..."
                value={form.notes}
                onChange={e => setForm({ ...form, notes: e.target.value })}
              />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn-secondary flex-1 justify-center"
              >
                Cancel
              </button>
              <button
                type="submit"
                id="score-submit"
                className="btn-primary flex-1 justify-center"
                disabled={submitting}
              >
                {submitting ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                ) : (
                  <>
                    <CheckCircle2 size={15} />
                    Save Score
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Score Balls Visual */}
      <div className="card p-6">
        <h2 className="font-display font-semibold text-lg text-white mb-4">Draw Entries</h2>
        <p className="text-sm text-gray-400 mb-4">These scores are your current draw numbers</p>
        <div className="flex flex-wrap gap-4">
          {scores.slice(0, 5).map((s, i) => (
            <div key={s.id} className="flex flex-col items-center gap-1">
              <div className={`score-ball-active w-16 h-16 text-lg relative ${i === 0 ? 'ring-2 ring-primary-400/50' : ''}`}>
                {s.score}
                {i === 0 && (
                  <span className="absolute -top-2 -right-2 text-xs bg-primary-500 text-white rounded-full px-1 font-bold">
                    New
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400">{format(new Date(s.score_date), 'MMM d')}</p>
            </div>
          ))}
          {[...Array(Math.max(0, 5 - scores.length))].map((_, i) => (
            <div key={`empty-${i}`} className="flex flex-col items-center gap-1">
              <div className="score-ball-empty w-16 h-16 text-lg">
                <span className="text-xs">Empty</span>
              </div>
              <p className="text-xs text-gray-600">Slot {scores.length + i + 1}</p>
            </div>
          ))}
        </div>

        {!isSubscribed && (
          <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-400">
            ⚠️ You need an active subscription to participate in draws
          </div>
        )}
      </div>

      {/* Scores List */}
      <div className="card overflow-hidden">
        <div className="p-5 border-b border-dark-500/50 flex items-center justify-between">
          <h2 className="font-display font-semibold text-lg text-white flex items-center gap-2">
            <TrendingUp size={18} className="text-primary-400" />
            Score History
          </h2>
          <span className="text-xs text-gray-500">{scores.length} total</span>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto" />
          </div>
        ) : scores.length === 0 ? (
          <div className="p-12 text-center">
            <TrendingUp size={40} className="text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 font-medium">No scores yet</p>
            <p className="text-gray-500 text-sm mt-1">Add your first Stableford score to get started</p>
            <button onClick={() => setShowForm(true)} className="btn-primary btn-sm mt-4">
              <Plus size={14} />
              Add First Score
            </button>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Score</th>
                <th>Date Played</th>
                <th>Notes</th>
                <th>Added</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {scores.map((s, i) => (
                <tr key={s.id} className={i === 0 ? 'bg-primary-500/5' : ''}>
                  <td>
                    <span className="w-6 h-6 rounded-full bg-dark-600 flex items-center justify-center text-xs text-gray-400">
                      {i + 1}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <span className={`font-display font-bold text-xl ${
                        s.score >= 35 ? 'text-emerald-400' : s.score >= 25 ? 'text-primary-400' : 'text-gray-300'
                      }`}>{s.score}</span>
                      <span className="text-xs text-gray-500">pts</span>
                      {i === 0 && <span className="badge badge-active">Latest</span>}
                    </div>
                  </td>
                  <td>
                    <span className="text-sm text-gray-300">
                      {format(new Date(s.score_date), 'dd MMM yyyy')}
                    </span>
                  </td>
                  <td>
                    <span className="text-sm text-gray-400 max-w-xs truncate">
                      {s.notes || '—'}
                    </span>
                  </td>
                  <td>
                    <span className="text-xs text-gray-500">
                      {format(new Date(s.created_at), 'MMM d')}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="p-1.5 rounded-lg hover:bg-red-500/10 hover:text-red-400 text-gray-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default ScoresPage
