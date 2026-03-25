import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff, Trophy, Mail, Lock, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

const LoginPage = () => {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'

  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { error } = await signIn(form.email, form.password)
    setLoading(false)

    if (error) {
      setError(error.message)
    } else {
      toast.success('Welcome back!')
      navigate(from, { replace: true })
    }
  }

  // Demo credentials hint
  const fillDemo = (type) => {
    if (type === 'user') {
      setForm({ email: 'demo@golfgives.com', password: 'DemoPass123!' })
    } else {
      setForm({ email: 'admin@golfgives.com', password: 'AdminPass123!' })
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left: Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center">
              <Trophy size={20} className="text-white" />
            </div>
            <span className="font-display font-bold text-2xl">
              Golf<span className="text-primary-400">Gives</span>
            </span>
          </div>

          <h1 className="font-display font-bold text-3xl text-white mb-2">Welcome back</h1>
          <p className="text-gray-400 mb-8">Sign in to your account to continue</p>

          {/* Demo credentials */}
          <div className="mb-6 p-4 bg-dark-600/50 border border-dark-400/50 rounded-xl">
            <p className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wider">Demo Access</p>
            <div className="flex gap-2">
              <button
                onClick={() => fillDemo('user')}
                className="flex-1 text-xs py-1.5 px-3 bg-primary-500/20 border border-primary-500/30 rounded-lg text-primary-400 hover:bg-primary-500/30 transition-colors"
              >
                User Demo
              </button>
              <button
                onClick={() => fillDemo('admin')}
                className="flex-1 text-xs py-1.5 px-3 bg-violet-500/20 border border-violet-500/30 rounded-lg text-violet-400 hover:bg-violet-500/30 transition-colors"
              >
                Admin Demo
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm mb-6 animate-slide-up">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="form-label">Email Address</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  id="login-email"
                  type="email"
                  className="form-input pl-10"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="form-label mb-0">Password</label>
                <Link to="/forgot-password" className="text-xs text-primary-400 hover:text-primary-300">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  className="form-input pl-10 pr-10"
                  placeholder="Your password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              id="login-submit"
              className="btn-primary w-full justify-center py-3.5"
              disabled={loading}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <p className="text-center text-gray-400 text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-400 hover:text-primary-300 font-medium">
              Create one free
            </Link>
          </p>
        </div>
      </div>

      {/* Right: Visual */}
      <div className="hidden lg:flex flex-1 items-center justify-center bg-gradient-to-br from-primary-900/30 to-violet-900/30 border-l border-dark-500/50 p-12">
        <div className="max-w-md text-center">
          <div className="text-7xl mb-6">🏌️‍♂️</div>
          <h2 className="font-display font-bold text-3xl text-white mb-4">
            Turn Every Round into Impact
          </h2>
          <p className="text-gray-400 leading-relaxed mb-8">
            Your golf scores power monthly prize draws. Your subscription funds life-changing charities. 
            Play the sport you love and give back effortlessly.
          </p>
          {[
            'Monthly prize draws with real cash prizes',
            'At least 10% of every subscription to charity',
            'Rolling 5-score system — always competitive',
          ].map(f => (
            <div key={f} className="flex items-center gap-3 text-left mb-3">
              <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
              <span className="text-gray-300 text-sm">{f}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default LoginPage
