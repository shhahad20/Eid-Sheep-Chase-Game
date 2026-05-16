import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './config.js';

// Only initialise the client when real credentials are present.
// With placeholder values all API calls will silently fall back to localStorage.
const isConfigured =
  SUPABASE_URL.length > 0 &&
  !SUPABASE_URL.includes(SUPABASE_URL) &&
  SUPABASE_ANON_KEY.length > 0 &&
  !SUPABASE_ANON_KEY.includes(SUPABASE_ANON_KEY);

export const supabase = isConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

export { isConfigured };
