import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, CreditCard, Star, ArrowRight, Shield, Zap } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const SubscriptionPage = () => {
  const { profile, updateProfile } = useAuth()
  const [selectedPlan, setSelectedPlan] = useState(profile?.plan_type || 'monthly')
  const [loading, setLoading] = useState(false)
  const isActive = profile?.subscription_status === 'active'

  const handleSubscribe = async () => {
    setLoading(true)
    // In a real scenario, this would redirect to Stripe Checkout
    // For demo purposes, we'll simulate activation
    const { error } = await updateProfile({
      subscription_status: 'active',
      plan_type: selectedPlan,
      subscription_start: new Date().toISOString(),
      subscription_end: selectedPlan === 'yearly'
        ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    })
    setLoading(false)
    if (error) toast.error('Failed to activate subscription')
    else toast.success('Subscription activated! 🎉 (Demo mode)')
  }

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your subscription?')) return
    setLoading(true)
    const { error } = await updateProfile({ subscription_status: 'cancelled' })
    setLoading(false)
    if (error) toast.error('Failed to cancel')
    else toast.success('Subscription cancelled')
  }

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="font-display font-bold text-3xl text-white">Subscription</h1>
        <p className="text-gray-400 mt-1">Manage your GolfGives membership</p>
      </div>

      {/* Current Status */}
      {isActive && (
        <div className="p-5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 size={20} className="text-emerald-400" />
              </div>
              <div>
                <p className="font-semibold text-emerald-300">Active Subscription</p>
                <p className="text-sm text-emerald-400/80 capitalize mt-0.5">
                  {profile?.plan_type} plan • Renews {profile?.subscription_end ? new Date(profile.subscription_end).toLocaleDateString() : 'monthly'}
                </p>
              </div>
            </div>
            <button onClick={handleCancel} className="btn-danger text-xs" disabled={loading}>
              Cancel Plan
            </button>
          </div>
        </div>
      )}

      {/* Plan Selection */}
      <div>
        <h2 className="font-display font-semibold text-xl text-white mb-4">
          {isActive ? 'Change Plan' : 'Choose a Plan'}
        </h2>
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          {[
            {
              id: 'monthly',
              name: 'Monthly',
              price: '£9',
              period: '/month',
              badge: null,
              features: ['Monthly draw entry', '5-score tracking', 'Charity contribution', 'Winner dashboard']
            },
            {
              id: 'yearly',
              name: 'Yearly',
              price: '£75',
              period: '/year',
              badge: 'Save 30%',
              note: 'Just £6.25/month',
              features: ['Everything in Monthly', '2 months free', 'Priority processing', 'Exclusive yearly badge']
            }
          ].map(plan => (
            <button
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`p-6 rounded-2xl border text-left transition-all ${
                selectedPlan === plan.id
                  ? 'border-primary-500 bg-primary-500/10 shadow-glow'
                  : 'border-dark-400/50 bg-dark-700/50 hover:border-primary-500/50'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-display font-bold text-lg text-white">{plan.name}</span>
                    {plan.badge && (
                      <span className="text-xs bg-gradient-to-r from-primary-500 to-violet-600 text-white rounded-full px-2 py-0.5">
                        {plan.badge}
                      </span>
                    )}
                  </div>
                  {plan.note && <p className="text-xs text-primary-400">{plan.note}</p>}
                </div>
                <div className="text-right">
                  <span className="font-display font-black text-3xl text-white">{plan.price}</span>
                  <span className="text-gray-400 text-sm">{plan.period}</span>
                </div>
              </div>
              <div className="space-y-2">
                {plan.features.map(f => (
                  <div key={f} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 size={14} className="text-primary-400 flex-shrink-0" />
                    <span className="text-gray-300">{f}</span>
                  </div>
                ))}
              </div>
            </button>
          ))}
        </div>

        {/* Stripe Note */}
        <div className="p-4 bg-dark-600/50 border border-dark-400/50 rounded-xl flex items-start gap-3 mb-6">
          <Shield size={16} className="text-primary-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-white">Secure Payment via Stripe</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Real Stripe integration requires your API keys in the environment variables. 
              Click below to activate in demo mode, or configure <code className="text-primary-400">VITE_STRIPE_PUBLIC_KEY</code>.
            </p>
          </div>
        </div>

        <button
          id="subscribe-btn"
          onClick={handleSubscribe}
          className="btn-primary w-full justify-center py-4 text-base"
          disabled={loading || (isActive && selectedPlan === profile?.plan_type)}
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <CreditCard size={18} />
              {isActive ? `Switch to ${selectedPlan} plan` : `Subscribe — ${selectedPlan === 'monthly' ? '£9/month' : '£75/year'}`}
            </>
          )}
        </button>
      </div>

      {/* FAQ */}
      <div className="card p-6">
        <h3 className="font-display font-semibold text-lg text-white mb-4">Subscription FAQ</h3>
        <div className="space-y-4">
          {[
            { q: 'Can I cancel anytime?', a: 'Yes, cancel any time and keep access until the end of your billing period.' },
            { q: 'How does charity contribution work?', a: 'At least 10% of your subscription goes directly to your chosen charity, automatically, every month.' },
            { q: 'What happens if I miss a month?', a: 'Your subscription auto-renews. If payment fails, your access will be paused until resolved.' },
            { q: 'Can I change my charity?', a: 'Yes, you can update your charity selection at any time in Settings.' },
          ].map(({ q, a }) => (
            <div key={q} className="border-b border-dark-500/50 pb-4 last:border-0 last:pb-0">
              <p className="font-medium text-white text-sm mb-1">{q}</p>
              <p className="text-gray-400 text-sm">{a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SubscriptionPage
