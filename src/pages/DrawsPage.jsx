import React, { useState } from 'react'
import { format } from 'date-fns'
import { Dice6, Info, Trophy, Calendar, Users, TrendingUp } from 'lucide-react'
import { useDraws } from '../hooks/useData'
import { useScores } from '../hooks/useData'

const DrawsPage = () => {
  const { draws, loading, calculateMatches } = useDraws()
  const { scores } = useScores()

  const [demoActive, setDemoActive] = useState(false)
  const [demoDraw, setDemoDraw] = useState(null)
  
  const [demoLoading, setDemoLoading] = useState(false)
  
  const handleRunDemo = () => {
    if (scores.length < 5) {
      return alert('You need 5 scores to run the demo!')
    }
    setDemoLoading(true)
    setTimeout(() => {
      const numbers = new Set()
      while (numbers.size < 5) {
        numbers.add(Math.floor(Math.random() * 45) + 1)
      }
      const generated = Array.from(numbers).sort((a, b) => a - b)
      const { matchCount } = calculateMatches(generated, scores)
      
      setDemoDraw({
        draw_numbers: generated,
        matchCount,
        hasWon: matchCount >= 3,
        matchType: matchCount === 5 ? 'Jackpot!' : matchCount === 4 ? '4-Match' : matchCount === 3 ? '3-Match' : null
      })
      setDemoLoading(false)
      setDemoActive(true)
    }, 800)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl text-white">Monthly Draws</h1>
          <p className="text-gray-400 mt-1">Check draw results and see how your scores matched</p>
        </div>
        <button onClick={handleRunDemo} className="btn-emerald font-semibold px-4 py-2" disabled={demoLoading}>
          {demoLoading ? (
            <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Running...</>
          ) : (
            <><Dice6 size={18} /> Run Demo Draw</>
          )}
        </button>
      </div>

      {/* Demo Result Modal */}
      {demoActive && demoDraw && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="card w-full max-w-md p-8 animate-slide-up text-center relative border-2 border-emerald-500/50">
            <h2 className="font-display font-bold text-3xl text-white mb-2">Demo Draw Result</h2>
            <p className="text-gray-400 mb-6">See how your current 5 scores performed!</p>
            
            <div className="mb-6">
              <p className="text-sm text-gray-400 uppercase tracking-widest mb-3">Draw Numbers</p>
              <div className="flex justify-center gap-3">
                {demoDraw.draw_numbers.map((n, i) => {
                  const isMatch = scores.some(s => s.score === n)
                  return (
                    <div key={i} className={`w-12 h-12 rounded-full border-2 flex items-center justify-center text-lg font-bold shadow-[0_0_15px_rgba(var(--color-primary-500),0.3)] transition-colors ${
                      isMatch ? 'bg-emerald-500 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'bg-dark-600 border-primary-500/30 text-white'
                    }`}>
                      {n}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-dark-800/80 border border-dark-500 mb-6">
              {demoDraw.matchCount > 0 ? (
                <div>
                  <div className="text-5xl mb-3">{demoDraw.hasWon ? '🎉' : '👍'}</div>
                  <h3 className={`font-display font-bold text-2xl mb-1 ${demoDraw.hasWon ? 'text-emerald-400' : 'text-primary-400'}`}>
                    {demoDraw.matchCount} Matches!
                  </h3>
                  {demoDraw.hasWon ? (
                    <p className="text-emerald-300">You hit a {demoDraw.matchType} Winner!</p>
                  ) : (
                    <p className="text-gray-400">Not quite enough to win (Need 3). Keep playing!</p>
                  )}
                </div>
              ) : (
                <div>
                  <div className="text-4xl mb-3">😢</div>
                  <h3 className="font-display font-bold text-xl text-gray-300 mb-1">You matched 0 numbers</h3>
                  <p className="text-gray-500 text-sm">Better luck next time!</p>
                </div>
              )}
            </div>

            <button onClick={() => setDemoActive(false)} className="btn-secondary w-full justify-center">
              Close Demo
            </button>
          </div>
        </div>
      )}

      {/* How it works */}
      <div className="flex items-start gap-3 p-4 bg-primary-500/10 border border-primary-500/20 rounded-xl">
        <Info size={16} className="text-primary-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-primary-300 font-semibold text-sm">How Draws Work</p>
          <p className="text-primary-400/80 text-xs mt-0.5">
            Each month, 5 numbers are drawn from 1–45. Your golf scores are your entry numbers. 
            Match 3 to win 25%, 4 to win 35%, all 5 to win 40% of the prize pool (jackpot).
          </p>
        </div>
      </div>

      {/* Draws */}
      {loading ? (
        <div className="card p-12 text-center">
          <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto" />
        </div>
      ) : draws.length === 0 ? (
        <div className="card p-12 text-center">
          <Dice6 size={48} className="text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 font-medium text-lg">No draws yet.</p>
          <p className="text-gray-500 text-sm mt-2">Click "Run Demo Draw" to simulate this month's results.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {draws.map(draw => {
            const { matchCount, matchedNumbers } = calculateMatches(draw.draw_numbers, scores)
            const hasWon = matchCount >= 3
            const matchType = matchCount === 5 ? 'Jackpot!' : matchCount === 4 ? '4-Match' : matchCount === 3 ? '3-Match' : null

            return (
              <div key={draw.id} className={`card p-6 ${hasWon ? 'border-emerald-500/40 bg-emerald-500/5' : ''}`}>
                <div className="flex flex-col sm:flex-row sm:items-start gap-6">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-display font-bold text-xl text-white">{draw.draw_name}</h3>
                      {hasWon && (
                        <span className="badge badge-active">
                          <Trophy size={10} />
                          {matchType} Winner!
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-400 mb-4">
                      <span className="flex items-center gap-1">
                        <Calendar size={13} />
                        {format(new Date(draw.draw_date), 'dd MMMM yyyy')}
                      </span>
                      {draw.total_pool && (
                        <span className="flex items-center gap-1">
                          <TrendingUp size={13} />
                          Pool: £{parseFloat(draw.total_pool).toLocaleString()}
                        </span>
                      )}
                    </div>

                    {/* Draw numbers */}
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Winning Numbers</p>
                      <div className="flex flex-wrap gap-2">
                        {draw.draw_numbers?.map(n => (
                          <div
                            key={n}
                            className={matchedNumbers.includes(n) ? 'draw-ball-matched' : 'draw-ball'}
                            title={matchedNumbers.includes(n) ? 'Matched!' : 'Draw number'}
                          >
                            {n}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Your scores matching */}
                    {scores.length > 0 && (
                      <div>
                        <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider">Your Scores vs Draw</p>
                        <div className="flex flex-wrap gap-2">
                          {scores.slice(0, 5).map(s => {
                            const isMatch = draw.draw_numbers?.includes(s.score)
                            return (
                              <div
                                key={s.id}
                                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
                                  isMatch
                                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                                    : 'bg-dark-600 border-dark-400/50 text-gray-400'
                                }`}
                                title={isMatch ? 'Match!' : 'No match'}
                              >
                                {s.score}
                              </div>
                            )
                          })}
                        </div>
                        {matchCount > 0 && (
                          <p className="text-emerald-400 text-sm mt-2 font-semibold">
                            🎯 {matchCount} match{matchCount !== 1 ? 'es' : ''}! 
                            {matchCount < 3 && ' — Need at least 3 to win'}
                          </p>
                        )}
                        {matchCount === 0 && (
                          <p className="text-gray-500 text-xs mt-2">No matches this draw — keep playing!</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Prize breakdown */}
                  <div className="sm:w-48 space-y-2">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Prize Pool</p>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-dark-600/50">
                      <span className="text-xs text-gray-400">🏆 Jackpot (5)</span>
                      <span className="text-xs font-bold text-amber-400">
                        £{parseFloat(draw.jackpot_pool || (draw.total_pool * 0.4)).toFixed(0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-dark-600/50">
                      <span className="text-xs text-gray-400">🥈 4-Match</span>
                      <span className="text-xs font-bold text-primary-400">
                        £{parseFloat(draw.four_match_pool || (draw.total_pool * 0.35)).toFixed(0)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded-lg bg-dark-600/50">
                      <span className="text-xs text-gray-400">🥉 3-Match</span>
                      <span className="text-xs font-bold text-emerald-400">
                        £{parseFloat(draw.three_match_pool || (draw.total_pool * 0.25)).toFixed(0)}
                      </span>
                    </div>
                    {draw.jackpot_rollover && (
                      <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                        <p className="text-xs text-amber-400 text-center font-semibold">
                          🔄 Jackpot Rolls Over!
                        </p>
                      </div>
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

export default DrawsPage
