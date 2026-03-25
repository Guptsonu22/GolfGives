import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Trophy, Mail, Lock, User, AlertCircle, CheckCircle2, Heart } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCharities } from '../hooks/useData'
import toast from 'react-hot-toast'

const steps = ['Account', 'Charity', 'Plan']

const RegisterPage = () => {
  const { signUp, updateProfile } = useAuth()
  const { charities } = useCharities()
  const navigate = useNavigate()

  const [step, setStep] = useState(0)
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    charityId: '',
    charityPercentage: 10,
    plan: 'monthly'
  })

  const passwordStrength = (pass) => {
    if (!pass) return 0
    let score = 0
    if (pass.length >= 8) score++
    if (/[A-Z]/.test(pass)) score++
    if (/[0-9]/.test(pass)) score++
    if (/[^A-Za-z0-9]/.test(pass)) score++
    return score
  }

  const strength = passwordStrength(form.password)

  const handleNext = () => {
    if (step === 0) {
      if (!form.fullName || !form.email || !form.password) {
        return setError('Please fill all fields')
      }
      if (form.password.length < 8) {
        return setError('Password must be at least 8 characters')
      }
    }
    setError('')
    setStep(s => s + 1)
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    
    const { data, error } = await signUp(form.email, form.password, form.fullName)
    
    if (error) {
      setLoading(false)
      return setError(error.message)
    }

    // Update profile with charity and plan (after email confirmation, profile will be updated)
    if (data?.user) {
      await updateProfile({
        full_name: form.fullName,
        charity_id: form.charityId || null,
        charity_percentage: form.charityPercentage,
        plan_type: form.plan,
      })
    }

    setLoading(false)
    toast.success('Account created! Check your email to confirm.')
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen flex">
      {/* Left: Visual */}
      <div className="hidden lg:flex flex-1 items-center justify-center bg-gradient-to-br from-emerald-900/20 to-primary-900/20 border-r border-dark-500/50 p-12">
        <div className="max-w-md">
          <div className="text-7xl mb-6 text-center">💚</div>
          <h2 className="font-display font-bold text-3xl text-white mb-4 text-center">
            Make Every Round Count
          </h2>
          <p className="text-gray-400 text-center leading-relaxed mb-8">
            Join thousands of golfers who are winning prizes and funding charities they care about.
          </p>
          <div className="space-y-4">
            {[
              { icon: Trophy, label: 'Win real cash prizes monthly', color: 'text-amber-400' },
              { icon: Heart, label: 'Choose your favourite charity', color: 'text-rose-400' },
              { icon: CheckCircle2, label: 'Rolling 5-score draw system', color: 'text-emerald-400' },
            ].map(({ icon: Icon, label, color }) => (
              <div key={label} className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-dark-600 flex items-center justify-center flex-shrink-0`}>
                  <Icon size={18} className={color} />
                </div>
                <span className="text-gray-300">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center">
              <Trophy size={20} className="text-white" />
            </div>
            <span className="font-display font-bold text-2xl">
              Golf<span className="text-primary-400">Gives</span>
            </span>
          </Link>

          {/* Step progress */}
          <div className="flex items-center gap-2 mb-8">
            {steps.map((s, i) => (
              <React.Fragment key={s}>
                <div className={`flex items-center gap-2 ${i <= step ? 'text-white' : 'text-gray-500'}`}>
                  <div className={`
                    w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                    ${i < step ? 'bg-emerald-500 text-white' : i === step ? 'bg-primary-500 text-white' : 'bg-dark-600 text-gray-500'}
                  `}>
                    {i < step ? <CheckCircle2 size={14} /> : i + 1}
                  </div>
                  <span className="text-sm hidden sm:block">{s}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-px ${i < step ? 'bg-emerald-500' : 'bg-dark-500'}`} />
                )}
              </React.Fragment>
            ))}
          </div>

          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm mb-6">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {/* STEP 0: Account */}
          {step === 0 && (
            <div className="animate-slide-up">
              <h1 className="font-display font-bold text-2xl text-white mb-1">Create your account</h1>
              <p className="text-gray-400 text-sm mb-6">Fill in your details to get started</p>
              
              <div className="space-y-4">
                <div>
                  <label className="form-label">Full Name</label>
                  <div className="relative">
                    <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      id="reg-name"
                      type="text"
                      className="form-input pl-10"
                      placeholder="John Smith"
                      value={form.fullName}
                      onChange={e => setForm({ ...form, fullName: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">Email Address</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      id="reg-email"
                      type="email"
                      className="form-input pl-10"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">Password</label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      id="reg-password"
                      type={showPass ? 'text' : 'password'}
                      className="form-input pl-10 pr-10"
                      placeholder="Min. 8 characters"
                      value={form.password}
                      onChange={e => setForm({ ...form, password: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                    >
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {/* Password strength indicator */}
                  {form.password && (
                    <div className="mt-2">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${
                            i <= strength
                              ? strength <= 1 ? 'bg-red-500' : strength <= 2 ? 'bg-amber-500' : strength <= 3 ? 'bg-primary-500' : 'bg-emerald-500'
                              : 'bg-dark-500'
                          }`} />
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {strength <= 1 ? 'Weak' : strength <= 2 ? 'Fair' : strength <= 3 ? 'Good' : 'Strong'} password
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <button onClick={handleNext} id="reg-next-0" className="btn-primary w-full justify-center mt-6">
                Continue
              </button>
            </div>
          )}

          {/* STEP 1: Charity */}
          {step === 1 && (
            <div className="animate-slide-up">
              <h1 className="font-display font-bold text-2xl text-white mb-1">Choose your charity</h1>
              <p className="text-gray-400 text-sm mb-6">At least 10% of your subscription will go to them</p>

              <div className="space-y-3 max-h-72 overflow-y-auto pr-1 mb-4">
                {charities.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Heart size={32} className="mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No charities available yet</p>
                    <p className="text-xs mt-1">Connect your Supabase database to see charities</p>
                  </div>
                ) : (
                  charities.map(charity => (
                    <button
                      key={charity.id}
                      onClick={() => setForm({ ...form, charityId: charity.id })}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                        form.charityId === charity.id
                          ? 'border-primary-500 bg-primary-500/10'
                          : 'border-dark-400/50 bg-dark-700/50 hover:border-primary-500/50'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        form.charityId === charity.id ? 'bg-primary-500/30' : 'bg-dark-600'
                      }`}>
                        <Heart size={16} className={form.charityId === charity.id ? 'text-primary-400' : 'text-gray-500'} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{charity.name}</p>
                        <p className="text-xs text-gray-400">{charity.category}</p>
                      </div>
                      {charity.is_featured && (
                        <span className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/30 rounded-full px-2 py-0.5">
                          Featured
                        </span>
                      )}
                      {form.charityId === charity.id && (
                        <CheckCircle2 size={16} className="text-primary-400 flex-shrink-0" />
                      )}
                    </button>
                  ))
                )}
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="form-label mb-0 text-sm">Contribution: {form.charityPercentage}%</label>
                  <span className="text-xs text-gray-500">Min 10%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="50"
                  value={form.charityPercentage}
                  onChange={e => setForm({ ...form, charityPercentage: parseInt(e.target.value) })}
                  className="w-full accent-primary-500"
                />
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(0)} className="btn-secondary flex-1 justify-center">Back</button>
                <button onClick={handleNext} id="reg-next-1" className="btn-primary flex-1 justify-center">Continue</button>
              </div>
            </div>
          )}

          {/* STEP 2: Plan */}
          {step === 2 && (
            <div className="animate-slide-up">
              <h1 className="font-display font-bold text-2xl text-white mb-1">Pick your plan</h1>
              <p className="text-gray-400 text-sm mb-6">Both include full access to draws and tracking</p>

              <div className="space-y-3 mb-6">
                {[
                  { id: 'monthly', label: 'Monthly', price: '£9/month', badge: null, desc: 'Flexible, cancel anytime' },
                  { id: 'yearly', label: 'Yearly', price: '£75/year', badge: 'Save 30%', desc: 'Best value — 2 months free' },
                ].map(plan => (
                  <button
                    key={plan.id}
                    onClick={() => setForm({ ...form, plan: plan.id })}
                    className={`w-full p-4 rounded-xl border transition-all text-left ${
                      form.plan === plan.id
                        ? 'border-primary-500 bg-primary-500/10'
                        : 'border-dark-400/50 bg-dark-700/50 hover:border-primary-500/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-white">{plan.label}</p>
                          {plan.badge && (
                            <span className="text-xs bg-gradient-to-r from-primary-500 to-violet-600 text-white rounded-full px-2 py-0.5">
                              {plan.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{plan.desc}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-display font-bold text-white">{plan.price}</p>
                        {form.plan === plan.id && <CheckCircle2 size={16} className="text-primary-400 ml-auto mt-1" />}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="p-4 bg-dark-600/50 rounded-xl text-sm text-gray-400 mb-6">
                <p className="font-medium text-white mb-1">📌 Note on Payments</p>
                <p>Payment integration via Stripe will be activated after account setup. You'll receive an email with next steps.</p>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn-secondary flex-1 justify-center">Back</button>
                <button
                  id="reg-submit"
                  onClick={handleSubmit}
                  className="btn-primary flex-1 justify-center"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Create Account'
                  )}
                </button>
              </div>
            </div>
          )}

          <p className="text-center text-gray-400 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
