// Supabase credentials are injected via Vite environment variables.
// Local dev:  create .env.local with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
// Production: add those variables in the Vercel project dashboard.
export const SUPABASE_URL      = import.meta.env.VITE_SUPABASE_URL      ?? '';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';
