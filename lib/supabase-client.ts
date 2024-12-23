import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://kybatwzvpdoavztjvtvp.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5YmF0d3p2cGRvYXZ6dGp2dHZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ3ODI0OTEsImV4cCI6MjA1MDM1ODQ5MX0.Wl9cX24yH32dIHgooZZg8wA3LpXCgYQ1r-BmoEtM7Lo'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Using fallback values.')
}

