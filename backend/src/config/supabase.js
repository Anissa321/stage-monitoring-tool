import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

// Validatie: crash meteen als keys ontbreken (beter dan stille fouten later)
const { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY } = process.env

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_KEY) {
  throw new Error('Supabase environment variabelen ontbreken in .env')
}

// Client voor gewone operaties (login, namens gebruiker handelen)
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// Admin client voor backend operaties (JWT verifiëren, profielen opzoeken)
export const supabaseAdmin = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

