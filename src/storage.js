const STORAGE_KEY = 'eidSheepChase_v2';

export function loadScores() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    return raw.map(e => ({ name: 'Player', ...e }));
  } catch(e) { return []; }
}

export function saveScore(scores, { name, score, coins, level }) {
  scores.push({ name, score, coins, level });
  scores.sort((a, b) => b.score - a.score);
  const top10 = scores.slice(0, 10);
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(top10)); } catch(e) {}
  return top10;
}
