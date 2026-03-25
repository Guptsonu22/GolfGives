import React, { useState } from 'react'
import { Heart, Search, Star, ExternalLink, Globe } from 'lucide-react'
import { useCharities } from '../hooks/useData'

const CATEGORY_COLORS = {
  Health: 'from-rose-500 to-rose-600',
  Children: 'from-amber-500 to-orange-500',
  'Mental Health': 'from-violet-500 to-violet-600',
  Environment: 'from-emerald-500 to-emerald-600',
  Housing: 'from-blue-500 to-blue-600',
  'Elderly Care': 'from-purple-500 to-purple-600',
  General: 'from-gray-500 to-gray-600',
}

const CharitiesPage = () => {
  const { charities, loading } = useCharities()
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  const categories = ['All', ...new Set(charities.map(c => c.category).filter(Boolean))]

  const filtered = charities.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase())
    const matchCategory = selectedCategory === 'All' || c.category === selectedCategory
    return matchSearch && matchCategory
  })

  const featured = filtered.filter(c => c.is_featured)
  const rest = filtered.filter(c => !c.is_featured)

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-10">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400 text-sm font-semibold mb-4">
          <Heart size={14} />
          Our Partner Charities
        </div>
        <h1 className="section-title mb-4">Making a Real Difference</h1>
        <p className="section-subtitle mx-auto">
          Choose the cause closest to your heart. A minimum 10% of every 
          GolfGives subscription is donated directly to your chosen charity.
        </p>
      </div>

      {/* Impact Stats */}
      <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
        {[
          { val: '£284K', label: 'Total Donated', color: 'text-emerald-400' },
          { val: '8', label: 'Partner Charities', color: 'text-primary-400' },
          { val: '10%+', label: 'Guaranteed', color: 'text-violet-400' },
        ].map(({ val, label, color }) => (
          <div key={label} className="card p-4 text-center">
            <p className={`font-display font-black text-2xl ${color}`}>{val}</p>
            <p className="text-xs text-gray-400 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search charities..."
            className="form-input pl-10"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-primary-500 text-white'
                  : 'bg-dark-700 border border-dark-500 text-gray-400 hover:border-primary-500/50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto" />
        </div>
      ) : (
        <>
          {/* Featured */}
          {featured.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Star size={16} className="text-amber-400" />
                <h2 className="font-display font-semibold text-lg text-white">Featured Charities</h2>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {featured.map(charity => (
                  <CharityCard key={charity.id} charity={charity} />
                ))}
              </div>
            </div>
          )}

          {/* Rest */}
          {rest.length > 0 && (
            <div>
              {featured.length > 0 && (
                <h2 className="font-display font-semibold text-lg text-white mb-4">All Charities</h2>
              )}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {rest.map(charity => (
                  <CharityCard key={charity.id} charity={charity} />
                ))}
              </div>
            </div>
          )}

          {filtered.length === 0 && (
            <div className="text-center py-12">
              <Heart size={40} className="text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No charities found. Try a different search.</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

const CharityCard = ({ charity }) => {
  const color = CATEGORY_COLORS[charity.category] || CATEGORY_COLORS.General

  return (
    <div className="card-hover p-6 group">
      {/* Top row */}
      <div className="flex items-start justify-between mb-4">
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
          <Heart size={24} className="text-white" />
        </div>
        <div className="flex flex-col items-end gap-1">
          {charity.is_featured && (
            <span className="badge bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Star size={10} />
              Featured
            </span>
          )}
          {charity.category && (
            <span className="badge bg-dark-600 text-gray-400 border border-dark-400/50">
              {charity.category}
            </span>
          )}
        </div>
      </div>

      <h3 className="font-display font-bold text-lg text-white mb-2">{charity.name}</h3>
      
      {charity.description && (
        <p className="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-3">
          {charity.description}
        </p>
      )}

      <div className="flex items-center justify-between pt-3 border-t border-dark-500/50">
        {charity.total_raised > 0 ? (
          <div>
            <p className="text-xs text-gray-500">Total Raised</p>
            <p className="text-sm font-bold text-emerald-400">£{parseFloat(charity.total_raised).toLocaleString()}</p>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Globe size={12} />
            <span>New Partner</span>
          </div>
        )}
        
        <div className="flex items-center gap-3">
          <a
            href={charity.website || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold px-3 py-1.5 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-lg transition-colors flex items-center gap-1"
          >
            Direct Donate <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </div>
  )
}

export default CharitiesPage
