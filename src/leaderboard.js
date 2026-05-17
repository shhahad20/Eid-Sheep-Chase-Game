import { supabase, isConfigured } from './supabase.js';
import { loadScores } from './storage.js';

const TABLE = 'high_scores';

// Convert localStorage scores to the same structure used by Supabase.
export function localScoresToEntries(scores) {
  return scores.map((s) => ({
    player_name: s.name || 'Player',
    score: s.score ?? 0,
    level: s.level ?? 1,
    coins: s.coins ?? 0,
    created_at: null,
  }));
}

// Submit only the FINAL game result.
// Call this function once when the player loses, quits, or finishes the game.
export async function submitScore({ player_name, score, level, coins }) {
  const name = (player_name ?? '').trim().slice(0, 20);

  if (!name) {
    return { success: false, error: 'Player name is required' };
  }

  if (!isConfigured) {
    return {
      success: false,
      error: 'Supabase not configured — score saved locally only',
    };
  }

  const finalEntry = {
    player_name: name,
    score: Number(score) || 0,
    level: Number(level) || 1,
    coins: Number(coins) || 0,
  };

  try {
    const { data, error } = await supabase
      .from(TABLE)
      .insert(finalEntry)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data,
    };
  } catch (err) {
    const msg = err?.message ?? String(err);
    console.warn('[Leaderboard] Submit failed:', msg);

    return {
      success: false,
      error: msg,
    };
  }
}

// Fetch the top 10 scores.
export async function fetchTopScores() {
  if (!isConfigured) {
    return {
      data: localScoresToEntries(loadScores()),
      source: 'local',
      error: null,
    };
  }

  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select('player_name, score, level, coins, created_at')
      .order('score', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(10);

    if (error) throw error;

    return {
      data: data ?? [],
      source: 'supabase',
      error: null,
    };
  } catch (err) {
    const msg = err?.message ?? String(err);
    console.warn(
      '[Leaderboard] Fetch failed, falling back to local scores:',
      msg
    );

    return {
      data: localScoresToEntries(loadScores()),
      source: 'local',
      error: msg,
    };
  }
}