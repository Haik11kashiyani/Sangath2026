import { createClient } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './runtime.js'

export const hasSupabase = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)

export const supabase = hasSupabase
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: false,
        detectSessionInUrl: false,
      },
    })
  : null
