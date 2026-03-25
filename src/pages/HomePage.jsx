import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight, Heart, Trophy, TrendingUp, Shield, Zap,
  Star, ChevronRight, Globe, Target, Users, CheckCircle2,
  Dice6, CreditCard
} from 'lucide-react'
import { useCharities } from '../hooks/useData'

// Animated counter component
const AnimatedCounter = ({ end, suffix = '', prefix = '' }) => {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !started) setStarted(true) },
      { threshold: 0.5 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [started])

  useEffect(() => {
    if (!started) return
    let current = 0
    const step = end / 60
    const timer = setInterval(() => {
      current += step
      if (current >= end) { setCount(end); clearInterval(timer) }
      else setCount(Math.floor(current))
    }, 20)
    return () => clearInterval(timer)
  }, [started, end])

  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>
}

const CHARITIES_FEATURED = [
  { name: 'Cancer Research UK', category: 'Health', raised: '£2.4M', color: 'from-rose-500 to-pink-600' },
  { name: 'Save the Children', category: 'Children', raised: '£1.8M', color: 'from-amber-500 to-orange-600' },
  { name: 'British Heart Foundation', category: 'Health', raised: '£3.1M', color: 'from-red-500 to-rose-600' },
]

const HOW_IT_WORKS = [
  {
    step: '01',
    icon: CreditCard,
    title: 'Subscribe',
    desc: 'Choose a monthly or yearly plan. A portion of every payment goes directly to your chosen charity.',
    color: 'from-primary-500 to-primary-600'
  },
  {
    step: '02',
    icon: TrendingUp,
    title: 'Enter Your Scores',
    desc: 'Log your last 5 golf scores in Stableford format. These become your draw numbers for the month.',
    color: 'from-violet-500 to-violet-600'
  },
  {
    step: '03',
    icon: Dice6,
    title: 'Monthly Draw',
    desc: 'Each month, 5 numbers are drawn. Match 3, 4, or all 5 to win your tier of the prize pool.',
    color: 'from-emerald-500 to-emerald-600'
  },
  {
    step: '04',
    icon: Heart,
    title: 'Give Back',
    desc: 'Win or not, your subscription funds life-changing charity work every single month.',
    color: 'from-rose-500 to-rose-600'
  }
]

const HomePage = () => {
  const { charities } = useCharities()

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* ===== HERO ===== */}
      <section className="relative min-h-screen flex items-center px-4 pt-20">
        {/* Background gradients */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-emerald-500/8 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text */}
            <div className="relative z-10 animate-fade-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/10 border border-primary-500/30 rounded-full text-primary-400 text-sm font-semibold mb-6">
                <Zap size={14} />
                Where Golf Meets Giving
              </div>
              
              <h1 className="font-display font-black text-5xl md:text-6xl xl:text-7xl text-white leading-tight mb-6">
                Play Golf.{' '}
                <span className="gradient-text">Win Big.</span>{' '}
                <span className="block">Give Back.</span>
              </h1>

              <p className="text-xl text-gray-300 leading-relaxed mb-8 max-w-lg">
                GolfGives combines competitive score tracking with monthly prize draws — 
                and guarantees charitable impact with every subscription.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-10">
                <Link to="/register" className="btn-primary text-base px-8 py-4">
                  Start Your Journey
                  <ArrowRight size={18} />
                </Link>
                <Link to="/charities" className="btn-secondary text-base px-8 py-4">
                  <Heart size={18} />
                  Our Charities
                </Link>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <Shield size={16} className="text-emerald-400" />
                  <span>Secure & PCI Compliant</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-primary-400" />
                  <span>Cancel Anytime</span>
                </div>
                <div className="flex items-center gap-2">
                  <Heart size={16} className="text-rose-400" />
                  <span>Min 10% to Charity</span>
                </div>
              </div>
            </div>

            {/* Right: Interactive card stack */}
            <div className="relative hidden lg:flex justify-center items-center">
              {/* Main Card */}
              <div className="relative z-10 card p-6 w-80 animate-float">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-gray-400">June Draw</p>
                    <p className="font-display font-bold text-lg text-white">Prize Pool</p>
                  </div>
                  <div className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full">
                    <span className="text-emerald-400 text-sm font-bold">LIVE</span>
                  </div>
                </div>
                <div className="text-4xl font-display font-black gradient-text mb-4">£18,400</div>
                
                {/* Draw numbers */}
                <div className="flex gap-2 justify-center mb-4">
                  {[7, 14, 22, 31, 38].map(n => (
                    <div key={n} className="draw-ball w-12 h-12 text-base">
                      {n}
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-dark-600/50 rounded-lg p-2">
                    <p className="text-xs text-gray-400">Jackpot</p>
                    <p className="text-sm font-bold text-primary-400">40%</p>
                  </div>
                  <div className="bg-dark-600/50 rounded-lg p-2">
                    <p className="text-xs text-gray-400">4-match</p>
                    <p className="text-sm font-bold text-violet-400">35%</p>
                  </div>
                  <div className="bg-dark-600/50 rounded-lg p-2">
                    <p className="text-xs text-gray-400">3-match</p>
                    <p className="text-sm font-bold text-emerald-400">25%</p>
                  </div>
                </div>
              </div>

              {/* Floating: charity card */}
              <div className="absolute -bottom-4 -left-8 card p-4 w-56 animate-float" style={{ animationDelay: '1s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center">
                    <Heart size={18} className="text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">This Month</p>
                    <p className="text-sm font-bold text-white">£4,200 raised</p>
                  </div>
                </div>
              </div>

              {/* Floating: scores card */}
              <div className="absolute -top-4 -right-8 card p-4 w-56 animate-float" style={{ animationDelay: '2s' }}>
                <p className="text-xs text-gray-400 mb-2">Your Scores</p>
                <div className="flex gap-1.5">
                  {[31, 22, 28, 35, 19].map((s, i) => (
                    <div key={i} className={`
                      w-9 h-9 rounded-lg flex items-center justify-center text-xs font-bold
                      ${i === 0 ? 'bg-primary-500/30 text-primary-300 border border-primary-500/50' : 'bg-dark-600 text-gray-400'}
                    `}>
                      {s}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="py-16 border-y border-dark-500/50 bg-dark-800/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { val: 12400, suffix: '+', label: 'Active Members', icon: Users, color: 'text-primary-400' },
              { val: 284, prefix: '£', suffix: 'K', label: 'Total Raised', icon: Heart, color: 'text-rose-400' },
              { val: 156, label: 'Monthly Winners', icon: Trophy, color: 'text-amber-400' },
              { val: 8, label: 'Partner Charities', icon: Globe, color: 'text-emerald-400' },
            ].map(({ val, suffix, prefix, label, icon: Icon, color }) => (
              <div key={label} className="text-center">
                <Icon size={24} className={`${color} mx-auto mb-2`} />
                <p className={`font-display font-black text-4xl ${color}`}>
                  <AnimatedCounter end={val} suffix={suffix || ''} prefix={prefix || ''} />
                </p>
                <p className="text-gray-400 text-sm mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-primary-400 font-semibold text-sm uppercase tracking-wider mb-3">Simple by Design</p>
            <h2 className="section-title">How GolfGives Works</h2>
            <p className="section-subtitle mx-auto">
              Four simple steps to compete for prizes while making a real difference.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map(({ step, icon: Icon, title, desc, color }) => (
              <div key={step} className="card-hover p-6 group">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={24} className="text-white" />
                </div>
                <div className="text-6xl font-display font-black text-dark-500 mb-3 select-none">{step}</div>
                <h3 className="font-display font-bold text-xl text-white mb-2">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PRIZE POOL ===== */}
      <section className="py-24 px-4 bg-dark-800/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-violet-400 font-semibold text-sm uppercase tracking-wider mb-3">Monthly Draws</p>
              <h2 className="section-title mb-4">Three Ways to Win</h2>
              <p className="text-gray-400 mb-8 leading-relaxed">
                Every subscriber's scores become their draw entries. 
                Match 3, 4, or all 5 numbers from the monthly draw to claim your prize.
                The jackpot rolls over if unclaimed.
              </p>

              {[
                { type: '5 Numbers Matched', pool: '40% of pool', label: 'Jackpot', icon: '🏆', color: 'from-amber-500 to-orange-500', rollover: true },
                { type: '4 Numbers Matched', pool: '35% of pool', label: 'Runner Up', icon: '🥈', color: 'from-primary-500 to-primary-600', rollover: false },
                { type: '3 Numbers Matched', pool: '25% of pool', label: 'Third Tier', icon: '🥉', color: 'from-emerald-500 to-emerald-600', rollover: false },
              ].map(({ type, pool, label, icon, color, rollover }) => (
                <div key={type} className="flex items-center gap-4 p-4 card mb-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-xl flex-shrink-0`}>
                    {icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-white">{type}</p>
                      {rollover && (
                        <span className="text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full px-2 py-0.5">
                          Jackpot Rollover
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400">{label}</p>
                  </div>
                  <div className={`text-lg font-display font-bold bg-gradient-to-br ${color} bg-clip-text text-transparent`}>
                    {pool}
                  </div>
                </div>
              ))}
            </div>

            {/* Prize Visual */}
            <div className="relative">
              <div className="card p-8 text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500/10 border border-violet-500/30 rounded-full text-violet-400 text-sm font-semibold mb-6">
                  <Target size={14} />
                  Example Draw
                </div>
                <p className="text-gray-400 text-sm mb-4">This Month's Numbers</p>
                <div className="flex justify-center gap-3 mb-8">
                  {[7, 14, 22, 31, 38].map(n => (
                    <div key={n} className="draw-ball">{n}</div>
                  ))}
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                      <span className="text-sm font-medium text-emerald-300">Your scores: 22, 14, 31 → 3 Matches!</span>
                    </div>
                    <span className="text-emerald-400 font-bold text-sm">Winner!</span>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-500 text-sm">Prize Pool Breakdown</p>
                    <div className="flex justify-center gap-6 mt-3">
                      <div>
                        <p className="text-2xl font-display font-bold text-amber-400">£7,360</p>
                        <p className="text-xs text-gray-500">Jackpot (40%)</p>
                      </div>
                      <div>
                        <p className="text-2xl font-display font-bold text-primary-400">£6,440</p>
                        <p className="text-xs text-gray-500">4-Match (35%)</p>
                      </div>
                      <div>
                        <p className="text-2xl font-display font-bold text-emerald-400">£4,600</p>
                        <p className="text-xs text-gray-500">3-Match (25%)</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CHARITIES ===== */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-emerald-400 font-semibold text-sm uppercase tracking-wider mb-3">Our Partners</p>
            <h2 className="section-title">Charities Making a Difference</h2>
            <p className="section-subtitle mx-auto">
              Choose the cause closest to your heart. Every subscription guarantees a minimum 10% donation.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {CHARITIES_FEATURED.map(({ name, category, raised, color }) => (
              <div key={name} className="card-hover p-6 group">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4`}>
                  <Heart size={20} className="text-white" />
                </div>
                <h3 className="font-display font-bold text-lg text-white mb-1">{name}</h3>
                <p className="text-sm text-gray-400 mb-4">{category}</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Total Raised</p>
                    <p className="font-bold text-emerald-400">{raised}</p>
                  </div>
                  <ChevronRight size={18} className="text-gray-500 group-hover:text-primary-400 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link to="/charities" className="btn-secondary">
              View All Charities
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== PRICING ===== */}
      <section className="py-24 px-4 bg-dark-800/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-primary-400 font-semibold text-sm uppercase tracking-wider mb-3">Simple Pricing</p>
            <h2 className="section-title">Choose Your Plan</h2>
            <p className="section-subtitle mx-auto">
              Both plans include full access to draws, score tracking, and charity contributions.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Monthly */}
            <div className="card p-8">
              <div className="mb-6">
                <p className="text-gray-400 font-medium mb-2">Monthly</p>
                <div className="flex items-baseline gap-1">
                  <span className="font-display font-black text-5xl text-white">£9</span>
                  <span className="text-gray-400">/month</span>
                </div>
              </div>
              
              {[
                'Monthly prize draw entry',
                'Score tracking (5 scores)',
                'Charity of your choice',
                '10% min charity contribution',
                'Winner dashboard',
              ].map(f => (
                <div key={f} className="flex items-center gap-3 py-2">
                  <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
                  <span className="text-sm text-gray-300">{f}</span>
                </div>
              ))}

              <Link to="/register" className="btn-secondary w-full justify-center mt-6">
                Get Started
              </Link>
            </div>

            {/* Yearly - highlight */}
            <div className="card p-8 border-primary-500/50 relative overflow-hidden">
              <div className="absolute top-4 right-4 px-3 py-1 bg-gradient-to-r from-primary-500 to-violet-600 rounded-full text-xs font-bold text-white">
                Save 30%
              </div>
              <div className="mb-6">
                <p className="gradient-text font-display font-bold mb-2">Yearly</p>
                <div className="flex items-baseline gap-1">
                  <span className="font-display font-black text-5xl text-white">£75</span>
                  <span className="text-gray-400">/year</span>
                </div>
                <p className="text-primary-400 text-sm mt-1">Just £6.25/month</p>
              </div>
              
              {[
                'Everything in Monthly',
                '2 months free',
                'Priority draw processing',
                'Larger prize pool share',
                'Exclusive yearly badge',
              ].map(f => (
                <div key={f} className="flex items-center gap-3 py-2">
                  <CheckCircle2 size={16} className="text-primary-400 flex-shrink-0" />
                  <span className="text-sm text-gray-300">{f}</span>
                </div>
              ))}

              <Link to="/register" className="btn-primary w-full justify-center mt-6">
                Best Value
                <Star size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="card p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-violet-600/5" />
            <div className="relative">
              <div className="text-5xl mb-4">🏌️</div>
              <h2 className="section-title mb-4">Ready to Play. Win. Give?</h2>
              <p className="text-gray-400 text-lg mb-8">
                Join thousands of golfers who turn their passion into positive change.
              </p>
              <Link to="/register" className="btn-primary text-lg px-10 py-4 inline-flex">
                Start Your Free Month
                <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-dark-500/50 py-12 px-4 bg-dark-800/30">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center">
                  <Trophy size={16} className="text-white" />
                </div>
                <span className="font-display font-bold text-lg">Golf<span className="text-primary-400">Gives</span></span>
              </div>
              <p className="text-gray-400 text-sm">Where golf performance meets charitable giving.</p>
            </div>
            {[
              { title: 'Platform', links: ['Dashboard', 'Scores', 'Draws', 'Winnings'] },
              { title: 'Charities', links: ['Browse Charities', 'How We Give', 'Impact Reports'] },
              { title: 'Support', links: ['Help Centre', 'Contact Us', 'Privacy Policy', 'Terms'] },
            ].map(({ title, links }) => (
              <div key={title}>
                <h4 className="font-semibold text-white mb-3 text-sm uppercase tracking-wider">{title}</h4>
                <ul className="space-y-2">
                  {links.map(l => (
                    <li key={l}>
                      <Link to="#" className="text-gray-400 text-sm hover:text-white transition-colors">{l}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-dark-500/50 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">© 2026 GolfGives. All rights reserved.</p>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Shield size={14} />
              PCI-DSS Compliant · Stripe Secured · GDPR Ready
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage
