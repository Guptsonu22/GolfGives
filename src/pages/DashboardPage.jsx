import React from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import {
  Trophy, TrendingUp, Heart, CreditCard, Dice6,
  ChevronRight, ArrowRight, AlertCircle, Star, Target
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useScores, useWinnings } from '../hooks/useData'

const StatCard = ({ icon: Icon, label, value, sub, color, to }) => (
  <Link to={to || '#'} className="stat-card card-hover group cursor-pointer">
    <div className="flex items-start justify-between">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
      <ChevronRight size={16} className="text-gray-500 group-hover:text-primary-400 group-hover:translate-x-1 transition-all" />
    </div>
    <div>
      <p className="stat-number">{value}</p>
      <p className="stat-label">{label}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  </Link>
)

const DashboardPage = () => {
  const { user, profile } = useAuth()
  const { scores, loading: scoresLoading } = useScores()
  const { winnings } = useWinnings()

  const totalWon = winnings
    .filter(w => w.status === 'paid')
    .reduce((sum, w) => sum + parseFloat(w.amount || 0), 0)

  const pendingWinnings = winnings.filter(w => w.status === 'pending' || w.status === 'verified')

  const subscriptionActive = profile?.subscription_status === 'active'
  const charityName = profile?.charities?.name || 'Not selected'

  const now = new Date()
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-3xl text-white">
            {greeting}, {profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Player'} 👋
          </h1>
          <p className="text-gray-400 mt-1">Here's your GolfGives overview</p>
        </div>
        <div className="flex gap-3">
          <Link to="/scores" className="btn-secondary btn-sm">
            <TrendingUp size={15} />
            Add Score
          </Link>
          {!subscriptionActive && (
            <Link to="/subscription" className="btn-primary btn-sm">
              <Star size={15} />
              Subscribe
            </Link>
          )}
        </div>
      </div>

      {/* Subscription Alert */}
      {!subscriptionActive && (
        <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
          <AlertCircle size={18} className="text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-amber-300 font-semibold text-sm">Subscription Inactive</p>
            <p className="text-amber-400/80 text-xs mt-0.5">
              Subscribe to participate in monthly draws and support your chosen charity.
            </p>
          </div>
          <Link to="/subscription" className="btn-primary btn-sm text-xs shrink-0">
            Subscribe Now
          </Link>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={CreditCard}
          label="Subscription"
          value={subscriptionActive ? 'Active' : 'Inactive'}
          sub={profile?.plan_type === 'monthly' ? 'Monthly' : profile?.plan_type === 'yearly' ? 'Yearly' : '—'}
          color={subscriptionActive ? 'bg-emerald-500' : 'bg-gray-600'}
          to="/subscription"
        />
        <StatCard
          icon={TrendingUp}
          label="Scores Logged"
          value={scores.length}
          sub={`of 5 max`}
          color="bg-primary-500"
          to="/scores"
        />
        <StatCard
          icon={Trophy}
          label="Total Won"
          value={`£${totalWon.toFixed(0)}`}
          sub={`${winnings.length} draws entered`}
          color="bg-amber-500"
          to="/winnings"
        />
        <StatCard
          icon={Heart}
          label="Charity"
          value={profile?.charity_percentage || 10}
          sub={`% → ${charityName}`}
          color="bg-rose-500"
          to="/settings"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Score Panel */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-display font-bold text-lg text-white">Your Draw Numbers</h2>
              <p className="text-xs text-gray-400 mt-0.5">Latest 5 scores become your monthly entries</p>
            </div>
            <Link to="/scores" className="text-primary-400 text-sm hover:text-primary-300 flex items-center gap-1">
              Manage <ArrowRight size={14} />
            </Link>
          </div>

          {scoresLoading ? (
            <div className="flex gap-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-14 h-14 rounded-full bg-dark-600 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {/* Filled scores */}
              {scores.slice(0, 5).map((s, i) => (
                <div key={s.id} className="text-center">
                  <div className={`score-ball-active ${i === 0 ? 'ring-2 ring-primary-500/50' : ''}`}>
                    {s.score}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {format(new Date(s.score_date), 'MMM d')}
                  </p>
                </div>
              ))}
              {/* Empty slots */}
              {[...Array(Math.max(0, 5 - scores.length))].map((_, i) => (
                <div key={`empty-${i}`} className="text-center">
                  <div className="score-ball-empty">
                    <span className="text-gray-600 text-xs">+</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">Empty</p>
                </div>
              ))}
            </div>
          )}

          {scores.length === 0 && !scoresLoading && (
            <div className="mt-4 p-4 bg-dark-600/50 rounded-xl text-center">
              <Target size={24} className="text-gray-500 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No scores yet. Add your first golf score!</p>
              <Link to="/scores" className="btn-primary btn-sm mt-3">
                Add Score <ArrowRight size={14} />
              </Link>
            </div>
          )}

          {scores.length > 0 && (
            <div className="mt-4 p-3 bg-primary-500/10 border border-primary-500/20 rounded-xl">
              <p className="text-xs text-primary-300">
                <span className="font-semibold">Draw tip:</span> Your scores are valid for this month's draw if you're subscribed. 
                Adding a new score replaces the oldest one.
              </p>
            </div>
          )}
        </div>

        {/* Charity & Winnings */}
        <div className="space-y-4">
          {/* Charity card */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Heart size={16} className="text-rose-400" />
              <h3 className="font-semibold text-white text-sm">Charity Impact</h3>
            </div>
            <div className="text-center py-2">
              <p className="text-3xl font-display font-black text-rose-400">
                {profile?.charity_percentage || 10}%
              </p>
              <p className="text-sm text-gray-400 mt-1">of your subscription</p>
              <p className="text-sm font-medium text-white mt-2">{charityName}</p>
            </div>
            {!profile?.charity_id && (
              <Link to="/settings" className="btn-secondary w-full justify-center text-sm mt-3">
                Select Charity
              </Link>
            )}
          </div>

          {/* Pending winnings */}
          {pendingWinnings.length > 0 && (
            <div className="card p-5 border-amber-500/30 bg-amber-500/5">
              <div className="flex items-center gap-2 mb-3">
                <Trophy size={16} className="text-amber-400" />
                <h3 className="font-semibold text-white text-sm">Pending Winnings</h3>
              </div>
              {pendingWinnings.slice(0, 3).map(w => (
                <div key={w.id} className="flex items-center justify-between py-2 border-b border-dark-500/50 last:border-0">
                  <div>
                    <p className="text-sm text-white capitalize">{w.match_type}</p>
                    <p className="text-xs text-gray-400">Awaiting verification</p>
                  </div>
                  <span className="font-bold text-amber-400">£{parseFloat(w.amount).toFixed(0)}</span>
                </div>
              ))}
              <Link to="/winnings" className="text-amber-400 text-xs hover:text-amber-300 mt-2 flex items-center gap-1">
                View All <ArrowRight size={12} />
              </Link>
            </div>
          )}

          {/* Next draw */}
          <div className="card p-5 bg-gradient-to-br from-primary-500/5 to-violet-600/5">
            <div className="flex items-center gap-2 mb-2">
              <Dice6 size={16} className="text-primary-400" />
              <h3 className="font-semibold text-white text-sm">Next Draw</h3>
            </div>
            <p className="text-2xl font-display font-bold text-white">
              {format(new Date(now.getFullYear(), now.getMonth() + 1, 1), 'MMM 1, yyyy')}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {subscriptionActive
                ? `You're entered with ${scores.length} score${scores.length !== 1 ? 's' : ''}`
                : 'Subscribe to enter'
              }
            </p>
            <Link to="/draws" className="text-primary-400 text-xs hover:text-primary-300 mt-2 flex items-center gap-1">
              View past draws <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
