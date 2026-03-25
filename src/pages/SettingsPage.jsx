import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useCharities } from '../hooks/useData'
import { User, Mail, Heart, CreditCard, Bell, Save, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'

const SettingsPage = () => {
  const { profile, updateProfile, user } = useAuth()
  const { charities } = useCharities()

  const [profileForm, setProfileForm] = useState({
    full_name: profile?.full_name || '',
  })
  const [charityForm, setCharityForm] = useState({
    charity_id: profile?.charity_id || '',
    charity_percentage: profile?.charity_percentage || 10,
  })
  const [saving, setSaving] = useState({ profile: false, charity: false })
  const [saved, setSaved] = useState({ profile: false, charity: false })

  const saveProfile = async (e) => {
    e.preventDefault()
    setSaving(prev => ({ ...prev, profile: true }))
    const { error } = await updateProfile(profileForm)
    setSaving(prev => ({ ...prev, profile: false }))
    if (error) toast.error(error.message || 'Failed to update profile')
    else {
      toast.success('Profile updated!')
      setSaved(prev => ({ ...prev, profile: true }))
      setTimeout(() => setSaved(prev => ({ ...prev, profile: false })), 2000)
    }
  }

  const saveCharity = async (e) => {
    e.preventDefault()
    setSaving(prev => ({ ...prev, charity: true }))
    const { error } = await updateProfile(charityForm)
    setSaving(prev => ({ ...prev, charity: false }))
    if (error) toast.error(error.message || 'Failed to update charity settings')
    else {
      toast.success('Charity settings updated!')
      setSaved(prev => ({ ...prev, charity: true }))
      setTimeout(() => setSaved(prev => ({ ...prev, charity: false })), 2000)
    }
  }

  return (
    <div className="max-w-2xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-3xl text-white">Settings</h1>
        <p className="text-gray-400 mt-1">Manage your profile and preferences</p>
      </div>

      {/* Profile Section */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-primary-500/20 flex items-center justify-center">
            <User size={20} className="text-primary-400" />
          </div>
          <div>
            <h2 className="font-display font-semibold text-lg text-white">Profile</h2>
            <p className="text-xs text-gray-400">Update your personal info</p>
          </div>
        </div>

        <form onSubmit={saveProfile} className="space-y-4">
          <div>
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-input"
              value={profileForm.full_name}
              onChange={e => setProfileForm({ ...profileForm, full_name: e.target.value })}
            />
          </div>
          <div>
            <label className="form-label flex items-center gap-1">
              <Mail size={13} />
              Email Address
            </label>
            <input
              type="email"
              className="form-input opacity-60 cursor-not-allowed"
              value={user?.email || ''}
              disabled
            />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>
          <button
            type="submit"
            className="btn-primary"
            disabled={saving.profile}
          >
            {saving.profile ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving Changes...</>
            ) : saved.profile ? (
              <><CheckCircle2 size={15} /> Saved!</>
            ) : (
              <><Save size={15} /> Save Changes</>
            )}
          </button>
        </form>
      </div>

      {/* Charity Section */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-rose-500/20 flex items-center justify-center">
            <Heart size={20} className="text-rose-400" />
          </div>
          <div>
            <h2 className="font-display font-semibold text-lg text-white">Charity Preferences</h2>
            <p className="text-xs text-gray-400">Choose where your contribution goes</p>
          </div>
        </div>

        <form onSubmit={saveCharity} className="space-y-4">
          <div>
            <label className="form-label">Selected Charity</label>
            <select
              className="form-input"
              value={charityForm.charity_id}
              onChange={e => setCharityForm({ ...charityForm, charity_id: e.target.value })}
            >
              <option value="">-- Select a charity --</option>
              {charities.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="form-label mb-0">Contribution Percentage</label>
              <span className="text-2xl font-display font-bold text-rose-400">{charityForm.charity_percentage}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="50"
              step="5"
              value={charityForm.charity_percentage}
              onChange={e => setCharityForm({ ...charityForm, charity_percentage: parseInt(e.target.value) })}
              className="w-full accent-rose-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Min 10%</span>
              <span>Max 50%</span>
            </div>
          </div>

          {charityForm.charity_id && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl">
              <p className="text-xs text-rose-300">
                <span className="font-semibold">Impact preview:</span> On a £9/month plan, 
                you'll contribute £{((9 * charityForm.charity_percentage) / 100).toFixed(2)}/month to your charity.
              </p>
            </div>
          )}

          <button type="submit" className="btn-emerald" disabled={saving.charity}>
            {saving.charity ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving Changes...</>
            ) : saved.charity ? (
              <><CheckCircle2 size={15} /> Saved!</>
            ) : (
              <><Save size={15} /> Save Charity Settings</>
            )}
          </button>
        </form>
      </div>

      {/* Account Info */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-xl bg-dark-600 flex items-center justify-center">
            <CreditCard size={20} className="text-gray-400" />
          </div>
          <div>
            <h2 className="font-display font-semibold text-lg text-white">Account Info</h2>
            <p className="text-xs text-gray-400">Member since {new Date(user?.created_at || Date.now()).toLocaleDateString()}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="p-3 bg-dark-600/50 rounded-xl">
            <p className="text-gray-400 text-xs">Status</p>
            <p className={`font-semibold mt-0.5 capitalize ${profile?.subscription_status === 'active' ? 'text-emerald-400' : 'text-gray-300'}`}>
              {profile?.subscription_status || 'Inactive'}
            </p>
          </div>
          <div className="p-3 bg-dark-600/50 rounded-xl">
            <p className="text-gray-400 text-xs">Plan</p>
            <p className="font-semibold mt-0.5 text-white capitalize">{profile?.plan_type || '—'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
