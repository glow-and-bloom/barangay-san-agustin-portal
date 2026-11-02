import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://egvyofdgpwkbtmvrcrdd.supabase.co'
const SUPABASE_ANON_KEY = 'sb_publishable_5aCK0ziJh6isv-vF1u8mvw_P_YITFcR'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)