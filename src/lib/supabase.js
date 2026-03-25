import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storageKey: 'golfgives-auth-v5', // refresh buggy state
    lock: (name, timeout, acquireCallback) => acquireCallback() // Bypass navigator.locks entirely to prevent infinite hangs
  }
})

export default supabase
