import { supabase, isConfigured } from './supabase.js';
import { loadScores } from './storage.js';

const TABLE = 'high_scores';

// Convert the existing localStorage format to the leaderboard entry shape
// so the UI always receives a consistent structure.
export function localScoresToEntries(scores) {
  return scores.map(s => ({
    player_name: s.name || 'Player',
    score:       s.score,
    level:       s.level,
    coins:       s.coins,
    created_at:  null,
  }));
}

// ---- Submit a score to Supabase --------------------------------

export async function submitScore({ player_name, score, level, coins }) {
  // Validate name: required, max 20 chars, trimmed
  const name = (player_name ?? '').trim().slice(0, 20);
  if (!name) return { success: false, error: 'Player name is required' };

  if (!isConfigured) {
    return { success: false, error: 'Supabase not configured — score saved locally only' };
  }

  try {
    const { error } = await supabase
      .from(TABLE)
      .insert({ player_name: name, score, level, coins });

    if (error) throw error;
    return { success: true };
  } catch (err) {
    const msg = err?.message ?? String(err);
    console.warn('[Leaderboard] Submit failed:', msg);
    return { success: false, error: msg };
  }
}

// ---- Fetch top 10 scores from Supabase -------------------------

export async function fetchTopScores() {
  // Not configured — return local scores without attempting a network request
  if (!isConfigured) {
    return { data: localScoresToEntries(loadScores()), source: 'local', error: null };
  }

  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select('player_name, score, level, coins, created_at')
      .order('score',      { ascending: false })
      .order('created_at', { ascending: true })   // tie-break: earliest wins
      .limit(10);

    if (error) throw error;
    return { data: data ?? [], source: 'supabase', error: null };
  } catch (err) {
    const msg = err?.message ?? String(err);
    console.warn('[Leaderboard] Fetch failed, falling back to local scores:', msg);
    return { data: localScoresToEntries(loadScores()), source: 'local', error: msg };
  }
}
