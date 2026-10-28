/**
 * OPERATION: STEAL THE ACORN - Storage Manager
 * Persistent state handling using localStorage with in-memory fallbacks.
 */

class StorageManager {
  constructor() {
    this.memoryStore = {};
    this.isAvailable = this.checkAvailability();
  }

  checkAvailability() {
    try {
      const testKey = '__test__';
      window.localStorage.setItem(testKey, testKey);
      window.localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  }

  get(key, defaultValue = null) {
    if (this.isAvailable) {
      const val = window.localStorage.getItem(key);
      if (val === null) return defaultValue;
      try {
        return JSON.parse(val);
      } catch (e) {
        return val;
      }
    }
    return this.memoryStore[key] ?? defaultValue;
  }

  set(key, value) {
    const serialized = typeof value === 'object' ? JSON.stringify(value) : String(value);
    if (this.isAvailable) {
      window.localStorage.setItem(key, serialized);
    }
    this.memoryStore[key] = value;
  }

  // Acorn Currency
  getTotalAcorns() {
    return parseInt(this.get('acorn_total_currency', 0), 10);
  }

  addAcorns(amount) {
    const current = this.getTotalAcorns();
    const updated = Math.max(0, current + amount);
    this.set('acorn_total_currency', updated);
    return updated;
  }

  spendAcorns(amount) {
    const current = this.getTotalAcorns();
    if (current >= amount) {
      this.set('acorn_total_currency', current - amount);
      return true;
    }
    return false;
  }

  // Level Progression (1 to 5)
  getUnlockedLevels() {
    return this.get('acorn_unlocked_levels', [1]);
  }

  unlockLevel(levelId) {
    const unlocked = this.getUnlockedLevels();
    if (!unlocked.includes(levelId)) {
      unlocked.push(levelId);
      this.set('acorn_unlocked_levels', unlocked);
    }
    return unlocked;
  }

  getLevelStats() {
    return this.get('acorn_level_stats', {});
  }

  saveLevelResult(levelId, score, stars) {
    const stats = this.getLevelStats();
    const existing = stats[levelId] || { score: 0, stars: 0 };
    stats[levelId] = {
      score: Math.max(existing.score, score),
      stars: Math.max(existing.stars, stars)
    };
    this.set('acorn_level_stats', stats);
    // Auto unlock next level
    if (levelId < 5) {
      this.unlockLevel(levelId + 1);
    }
  }

  // Selected Characters
  getSelectedCharacter(player = 1) {
    return this.get(player === 1 ? 'acorn_p1_char' : 'acorn_p2_char', player === 1 ? 'chikku' : 'tiger');
  }

  setSelectedCharacter(charId, player = 1) {
    this.set(player === 1 ? 'acorn_p1_char' : 'acorn_p2_char', charId);
  }

  // Settings
  getSettings() {
    return this.get('acorn_game_settings', {
      musicVolume: 0.6,
      sfxVolume: 0.8,
      muted: false,
      quality: 'high'
    });
  }

  saveSettings(newSettings) {
    const current = this.getSettings();
    this.set('acorn_game_settings', { ...current, ...newSettings });
  }

  // Session Intro
  hasSeenIntro() {
    return sessionStorage.getItem('acorn_intro_seen') === 'true';
  }

  markIntroSeen() {
    try {
      sessionStorage.setItem('acorn_intro_seen', 'true');
    } catch (e) {}
  }

  resetProgress() {
    if (this.isAvailable) {
      window.localStorage.removeItem('acorn_total_currency');
      window.localStorage.removeItem('acorn_unlocked_levels');
      window.localStorage.removeItem('acorn_level_stats');
      window.localStorage.removeItem('acorn_p1_char');
      window.localStorage.removeItem('acorn_p2_char');
    }
    this.memoryStore = {};
  }
}

window.storageManager = new StorageManager();
