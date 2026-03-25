import React, { useState } from 'react'
import { format } from 'date-fns'
import { Dice6, Plus, Play, Info, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useDraws } from '../../hooks/useData'
import toast from 'react-hot-toast'

const AdminDraws = () => {
  const { draws, loading, createDraw, publishDraw, generateDrawNumbers, calculatePrizes } = useDraws()
  const [showModal, setShowModal] = useState(false)
  const [publishing, setPublishing] = useState(null)
  const [form, setForm] = useState({
    draw_name: `Draw ${format(new Date(), 'MMMM yyyy')}`,
    draw_date: format(new Date(), 'yyyy-MM-dd'),
    total_pool: 10000,
    status: 'scheduled',
    draw_numbers: [],
  })

  // Start creating a draw
  const [logicType, setLogicType] = useState('random')
  const handleGenerate = async () => {
    const nums = await generateDrawNumbers(logicType)
    setForm(prev => ({ ...prev, draw_numbers: nums }))
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (form.draw_numbers.length !== 5) {
      return toast.error('Please generate 5 draw numbers first')
    }
    
    // Calculate pools
    const { jackpotPool, fourMatchPool, threeMatchPool } = calculatePrizes(form.total_pool)
    
    const { error } = await createDraw({
      ...form,
      jackpot_pool: jackpotPool,
      four_match_pool: fourMatchPool,
      three_match_pool: threeMatchPool,
    })

    if (error) {
      toast.error('Failed to create draw')
    } else {
      toast.success('Draw created successfully')
      setShowModal(false)
      // Reset form
      setForm({
        draw_name: `Draw ${format(new Date(), 'MMMM yyyy')}`,
        draw_date: format(new Date(), 'yyyy-MM-dd'),
        total_pool: 10000,
        status: 'scheduled',
        draw_numbers: [],
      })
    }
  }

  const handlePublish = async (id) => {
    if (!confirm('Publishing will process all active users, calculate winners, and make results public. Proceed?')) return
    
    setPublishing(id)
    const { winnersCount, error } = await publishDraw(id)
    setPublishing(null)
    
    if (error) {
      toast.error('Failed to publish: ' + error)
    } else {
      toast.success(`Draw published! ${winnersCount} winners found.`)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl text-white">Draw Management</h1>
          <p className="text-gray-400 mt-1">Create, simulate, and publish monthly draws</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          <Plus size={16} />
          Create Draw
        </button>
      </div>

      <div className="flex items-start gap-3 p-4 bg-primary-500/10 border border-primary-500/20 rounded-xl">
        <Info size={16} className="text-primary-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-primary-300 font-semibold text-sm">Draw Publishing Engine</p>
          <p className="text-primary-400/80 text-xs mt-0.5 max-w-3xl">
            When you publish a draw, the system automatically checks every active subscriber's last 5 scores against the draw numbers. 
            Winners are calculated, prize pools are divided equally among tier winners, and the jackpot rolls over if there's no 5-match.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="card p-12 text-center">
          <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto" />
        </div>
      ) : draws.length === 0 ? (
        <div className="card p-12 text-center">
          <Dice6 size={48} className="text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 font-medium text-lg">No draws created</p>
          <button onClick={() => setShowModal(true)} className="btn-primary btn-sm mt-4">
            <Plus size={14} /> Create First Draw
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {draws.map(draw => (
            <div key={draw.id} className="card p-6">
              <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                
                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-display font-bold text-xl text-white">{draw.draw_name}</h3>
                    <span className={`badge ${
                      draw.status === 'published' ? 'badge-active' :
                      draw.status === 'simulated' ? 'badge-pending' : 'bg-dark-600 text-gray-400 border border-dark-400/50'
                    }`}>
                      {draw.status}
                    </span>
                  </div>
                  <div className="flex gap-4 text-sm text-gray-400">
                    <span>Date: {format(new Date(draw.draw_date), 'dd MMM yyyy')}</span>
                    <span>Total Pool: £{parseFloat(draw.total_pool).toLocaleString()}</span>
                  </div>
                  
                  <div className="mt-4">
                    <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Draw Numbers</p>
                    <div className="flex gap-2">
                      {draw.draw_numbers?.map(n => (
                        <div key={n} className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold bg-dark-600 border border-dark-400/50 text-gray-300">
                          {n}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Prize Breakdown */}
                <div className="w-full lg:w-48 space-y-2 bg-dark-800/50 p-3 rounded-xl border border-dark-500/50">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Pool Dist</p>
                  <div className="flex justify-between text-xs">
                    <span className="text-amber-400">Jackpot (40%)</span>
                    <span className="font-bold text-white">£{parseFloat(draw.jackpot_pool).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-primary-400">4-Match (35%)</span>
                    <span className="font-bold text-white">£{parseFloat(draw.four_match_pool).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-emerald-400">3-Match (25%)</span>
                    <span className="font-bold text-white">£{parseFloat(draw.three_match_pool).toLocaleString()}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex lg:flex-col justify-end gap-2 shrink-0">
                  {draw.status !== 'published' ? (
                    <>
                      <button
                        onClick={() => handlePublish(draw.id)}
                        className="btn-emerald flex-1 lg:flex-none justify-center"
                        disabled={publishing === draw.id}
                      >
                        {publishing === draw.id ? (
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <Play size={16} className="fill-current" />
                            Publish & Process
                          </>
                        )}
                      </button>
                      <button className="btn-secondary flex-1 lg:flex-none justify-center text-sm">
                        Simulate
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 px-4 py-3 rounded-xl border border-emerald-500/30">
                      <CheckCircle2 size={18} />
                      <span className="font-semibold text-sm">Processed & Live</span>
                    </div>
                  )}
                </div>

              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-lg p-6 animate-slide-up">
            <h2 className="font-display font-bold text-2xl text-white mb-6">Create New Draw</h2>
            
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Draw Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={form.draw_name}
                    onChange={e => setForm({ ...form, draw_name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={form.draw_date}
                    onChange={e => setForm({ ...form, draw_date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Total Prize Pool (£)</label>
                <input
                  type="number"
                  className="form-input font-display font-bold text-lg text-primary-400"
                  value={form.total_pool}
                  onChange={e => setForm({ ...form, total_pool: e.target.value })}
                  min="0"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Usually calculated from (Active Subs * Monthly Plan Rate) * 0.9
                </p>
              </div>

              <div className="p-4 bg-dark-800/50 border border-dark-500/50 rounded-xl">
                <div className="flex items-center justify-between mb-3 border-b border-dark-500/50 pb-3">
                  <div className="flex items-center gap-2">
                    <label className="form-label mb-0">Draw Logic</label>
                    <select className="form-input py-1 text-sm bg-dark-700" value={logicType} onChange={e => setLogicType(e.target.value)}>
                      <option value="random">Random Generation</option>
                      <option value="algorithmic">Algorithmic (Most Frequent)</option>
                    </select>
                  </div>
                  <button type="button" onClick={handleGenerate} className="text-primary-400 text-sm hover:text-primary-300 font-semibold flex items-center gap-1">
                    <Dice6 size={14} /> Generate
                  </button>
                </div>
                
                <div className="flex items-center justify-between mb-3">
                  <label className="form-label mb-0">Draw Numbers (1-45)</label>
                </div>
                
                {form.draw_numbers.length > 0 ? (
                  <div className="flex gap-3 justify-center">
                    {form.draw_numbers.map((n, i) => (
                      <div key={i} className="draw-ball w-12 h-12 text-sm">{n}</div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 border border-dashed border-dark-400 rounded-lg">
                    <p className="text-gray-500 text-sm">Click generate to pick 5 numbers</p>
                  </div>
                )}
              </div>

              {form.draw_numbers.length === 5 && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2">
                  <AlertCircle size={16} className="text-emerald-400" />
                  <p className="text-xs text-emerald-300">
                    Ready to schedule. This will not process winners until published.
                  </p>
                </div>
              )}

              <div className="flex gap-3 mt-8">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1 justify-center">
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1 justify-center" disabled={form.draw_numbers.length !== 5}>
                  Save Draft
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDraws
