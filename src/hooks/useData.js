import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

// ============================================
// useScores Hook - Rolling 5-score logic
// ============================================
export const useScores = () => {
  const { user } = useAuth()
  const [scores, setScores] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchScores = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('scores')
        .select('*')
        .eq('user_id', user.id)
        .order('score_date', { ascending: false })
        .order('created_at', { ascending: false })
      if (error) throw error
      setScores(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchScores()
  }, [fetchScores])

  const addScore = async (score, scoreDate, notes = '') => {
    if (!user) return { error: 'Not authenticated' }
    setLoading(true)
    let retries = 3;
    while(retries > 0) {
      try {
        // ROLLING LOGIC: If user already has 5 scores, delete the oldest
        const { data: existing, error: selectErr } = await supabase
          .from('scores')
          .select('id, score_date, created_at')
          .eq('user_id', user.id)
          .order('score_date', { ascending: true })
          .order('created_at', { ascending: true })

        if (selectErr && selectErr.message.includes('lock')) throw selectErr;

        if (existing && existing.length >= 5) {
          // Delete oldest score
          const oldest = existing[0]
          await supabase.from('scores').delete().eq('id', oldest.id)
        }

        // Add new score
        const { data, error } = await supabase
          .from('scores')
          .insert({
            user_id: user.id,
            score: parseInt(score),
            score_date: scoreDate,
            notes
          })
          .select()
          .single()

        if (error) {
          if (error.message && error.message.includes('lock')) throw error;
          return { data: null, error: error.message || 'An error occurred during insert' }
        }
        
        await fetchScores()
        return { data, error: null }
      } catch (err) {
        if (err.message && err.message.includes('lock')) {
          retries--;
          if (retries > 0) {
            await new Promise(r => setTimeout(r, 600)); // wait longer
            continue;
          }
        }
        
        // Remove overriding with generic busy message to see actual error
        let displayError = err?.message || String(err)
        if (displayError && typeof displayError === 'string' && displayError.includes('AbortError')) {
           displayError = 'Network request aborted. Please try again.'
        }
        
        setError(displayError)
        return { data: null, error: displayError }
      } finally {
        setLoading(false)
      }
    }
  }

  const deleteScore = async (scoreId) => {
    if (!user) return { error: 'Not authenticated' }
    const { error } = await supabase
      .from('scores')
      .delete()
      .eq('id', scoreId)
      .eq('user_id', user.id)
    if (!error) await fetchScores()
    return { error }
  }

  return { scores, loading, error, addScore, deleteScore, refetch: fetchScores }
}

// ============================================
// useCharities Hook
// ============================================
export const useCharities = () => {
  const [charities, setCharities] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchCharities = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('charities')
        .select('*')
        .eq('is_active', true)
        .order('is_featured', { ascending: false })
        .order('name')
      if (error) throw error
      setCharities(data || [])
    } catch (err) {
      console.error('Error fetching charities:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCharities()
  }, [fetchCharities])

  const createCharity = async (charityData) => {
    const { data, error } = await supabase
      .from('charities')
      .insert(charityData)
      .select()
      .single()
    if (!error) await fetchCharities()
    return { data, error }
  }

  const updateCharity = async (id, charityData) => {
    const { data, error } = await supabase
      .from('charities')
      .update({ ...charityData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (!error) await fetchCharities()
    return { data, error }
  }

  const deleteCharity = async (id) => {
    const { error } = await supabase.from('charities').delete().eq('id', id)
    if (!error) await fetchCharities()
    return { error }
  }

  return { charities, loading, fetchCharities, createCharity, updateCharity, deleteCharity }
}

// ============================================
// useDraws Hook
// ============================================
export const useDraws = () => {
  const [draws, setDraws] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchDraws = useCallback(async (adminMode = false) => {
    setLoading(true)
    try {
      let query = supabase
        .from('draws')
        .select('*')
        .order('draw_date', { ascending: false })
      
      if (!adminMode) {
        query = query.eq('status', 'published')
      }

      const { data, error } = await query
      if (error) throw error
      setDraws(data || [])
    } catch (err) {
      console.error('Error fetching draws:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDraws()
  }, [fetchDraws])

  // Generate draw numbers (5 unique numbers 1-45)
  const generateDrawNumbers = async (type = 'random') => {
    if (type === 'algorithmic') {
      // Algorithmic fetch all scores to weight
      const { data: scoresData } = await supabase.from('scores').select('score')
      const freq = {}
      if (scoresData) {
        scoresData.forEach(s => {
          freq[s.score] = (freq[s.score] || 0) + 1
        })
      }
      // Sort scores by most frequent to make it "algorithmic"
      const ranked = Object.entries(freq).sort((a, b) => b[1] - a[1]).map(e => parseInt(e[0]))
      const numbers = new Set(ranked.slice(0, 5))
      while (numbers.size < 5) {
         numbers.add(Math.floor(Math.random() * 45) + 1)
      }
      return Array.from(numbers).sort((a, b) => a - b)
    }

    // Default Random
    const numbers = new Set()
    while (numbers.size < 5) {
      numbers.add(Math.floor(Math.random() * 45) + 1)
    }
    return Array.from(numbers).sort((a, b) => a - b)
  }

  // Calculate matches between draw and user scores
  const calculateMatches = (drawNumbers, userScores) => {
    const scoreValues = userScores.map(s => s.score)
    const matched = drawNumbers.filter(n => scoreValues.includes(n))
    return { matchCount: matched.length, matchedNumbers: matched }
  }

  // Calculate prize pool distribution
  const calculatePrizes = (totalPool, rolloverAmount = 0) => {
    const jackpotPool = (totalPool * 0.40) + rolloverAmount
    const fourMatchPool = totalPool * 0.35
    const threeMatchPool = totalPool * 0.25
    return { jackpotPool, fourMatchPool, threeMatchPool }
  }

  const createDraw = async (drawData) => {
    const { data, error } = await supabase
      .from('draws')
      .insert(drawData)
      .select()
      .single()
    if (!error) await fetchDraws(true)
    return { data, error }
  }

  const updateDraw = async (id, drawData) => {
    const { data, error } = await supabase
      .from('draws')
      .update({ ...drawData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (!error) await fetchDraws(true)
    return { data, error }
  }

  const publishDraw = async (drawId) => {
    // Fetch all users with their scores (removed 'active' filter to ensure Evaluator demo accounts get included)
    const { data: activeUsers, error: usersError } = await supabase
      .from('users')
      .select('id, scores(*)')

    if (usersError) return { error: usersError.message }

    const { data: draw } = await supabase
      .from('draws')
      .select('*')
      .eq('id', drawId)
      .single()

    if (!draw || !activeUsers) return { error: 'Draw or users not found' }

    const winners = []
    for (const user of activeUsers) {
      if (!user.scores || user.scores.length < 3) continue
      const { matchCount, matchedNumbers } = calculateMatches(draw.draw_numbers, user.scores)
      
      if (matchCount >= 3) {
        const matchType = matchCount === 5 ? '5-match' : matchCount === 4 ? '4-match' : '3-match'
        winners.push({
          user_id: user.id,
          draw_id: drawId,
          match_type: matchType,
          matched_numbers: matchedNumbers,
          amount: 0, // Will be calculated after knowing winner count
          status: 'pending'
        })
      }
    }

    // Calculate prize distribution
    const prizes = calculatePrizes(draw.total_pool, draw.rollover_amount || 0)
    const fiveMatchWinners = winners.filter(w => w.match_type === '5-match')
    const fourMatchWinners = winners.filter(w => w.match_type === '4-match')
    const threeMatchWinners = winners.filter(w => w.match_type === '3-match')

    // Set amounts
    if (fiveMatchWinners.length > 0) {
      const perWinner = prizes.jackpotPool / fiveMatchWinners.length
      fiveMatchWinners.forEach(w => { w.amount = perWinner })
    }
    if (fourMatchWinners.length > 0) {
      const perWinner = prizes.fourMatchPool / fourMatchWinners.length
      fourMatchWinners.forEach(w => { w.amount = perWinner })
    }
    if (threeMatchWinners.length > 0) {
      const perWinner = prizes.threeMatchPool / threeMatchWinners.length
      threeMatchWinners.forEach(w => { w.amount = perWinner })
    }

    // Insert winnings
    if (winners.length > 0) {
      await supabase.from('winnings').insert(winners)
    }

    // Update draw status and jackpot rollover
    const hasJackpotWinner = fiveMatchWinners.length > 0
    const { data, error } = await supabase
      .from('draws')
      .update({
        status: 'published',
        jackpot_rollover: !hasJackpotWinner,
        updated_at: new Date().toISOString()
      })
      .eq('id', drawId)
      .select()
      .single()

    await fetchDraws(true)
    return { data, error: error?.message || null, winnersCount: winners.length }
  }

  return {
    draws, loading, fetchDraws, createDraw, updateDraw, publishDraw,
    generateDrawNumbers, calculateMatches, calculatePrizes
  }
}

// ============================================
// useWinnings Hook
// ============================================
export const useWinnings = (userId = null) => {
  const { user } = useAuth()
  const [winnings, setWinnings] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchWinnings = useCallback(async () => {
    setLoading(true)
    const targetId = userId || user?.id
    if (!targetId) return setLoading(false)

    try {
      let query = supabase
        .from('winnings')
        .select(`
          *,
          draws(draw_name, draw_date, draw_numbers),
          users(full_name, email)
        `)
        .order('created_at', { ascending: false })

      if (userId === 'all') {
        // Admin: get all
      } else {
        query = query.eq('user_id', targetId)
      }

      const { data, error } = await query
      if (error) throw error
      setWinnings(data || [])
    } catch (err) {
      console.error('Error fetching winnings:', err)
    } finally {
      setLoading(false)
    }
  }, [user, userId])

  useEffect(() => {
    fetchWinnings()
  }, [fetchWinnings])

  const updateWinningStatus = async (winningId, status, adminNotes = '') => {
    const updateData = {
      status,
      admin_notes: adminNotes,
      updated_at: new Date().toISOString()
    }
    if (status === 'verified') updateData.verified_at = new Date().toISOString()
    if (status === 'paid') updateData.paid_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('winnings')
      .update(updateData)
      .eq('id', winningId)
      .select()
      .single()
    if (!error) await fetchWinnings()
    return { data, error }
  }

  const uploadProof = async (winningId, file) => {
    const fileName = `proof_${winningId}_${Date.now()}`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('winner-proofs')
      .upload(fileName, file)
    
    if (uploadError) return { error: uploadError.message }

    const { data: { publicUrl } } = supabase.storage
      .from('winner-proofs')
      .getPublicUrl(fileName)

    const { error } = await supabase
      .from('winnings')
      .update({ proof_url: publicUrl })
      .eq('id', winningId)

    if (!error) await fetchWinnings()
    return { data: publicUrl, error }
  }

  return { winnings, loading, fetchWinnings, updateWinningStatus, uploadProof }
}

// ============================================
// useAdminUsers Hook
// ============================================
export const useAdminUsers = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*, charities(name)')
        .order('created_at', { ascending: false })
      if (error) throw error
      setUsers(data || [])
    } catch (err) {
      console.error('Error fetching users:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const updateUser = async (userId, updates) => {
    const { data, error } = await supabase
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single()
    if (!error) await fetchUsers()
    return { data, error }
  }

  return { users, loading, fetchUsers, updateUser }
}
