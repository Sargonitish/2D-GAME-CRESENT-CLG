/**
 * OPERATION: STEAL THE ACORN - World Map Engine
 * "THE FROZEN FRONTIER" Interactive Arctic Map System.
 */

class WorldMap {
  constructor(onSelectLevel, onReturnHome) {
    this.onSelectLevel = onSelectLevel;
    this.onReturnHome = onReturnHome;
    this.selectedLevelIndex = 0;
  }

  render(container) {
    if (!container) return;
    const unlocked = window.storageManager.getUnlockedLevels();
    const stats = window.storageManager.getLevelStats();

    container.innerHTML = `
      <div class="map-modal">
        <div class="map-header">
          <h2 class="map-title">🗺️ THE FROZEN FRONTIER</h2>
          <div class="map-subtitle">Select your Arctic destination and conquer the fortress!</div>
        </div>

        <div class="map-destinations-grid">
          ${window.LEVELS.map((lvl, idx) => {
            const isUnlocked = unlocked.includes(lvl.id);
            const lvlStat = stats[lvl.id] || { score: 0, stars: 0 };
            const isSelected = idx === this.selectedLevelIndex;

            return `
              <div class="map-node ${isUnlocked ? 'unlocked' : 'locked'} ${isSelected ? 'selected' : ''}" data-idx="${idx}">
                <div class="map-node-badge">${isUnlocked ? `STAGE ${lvl.id}` : '🔒 LOCKED'}</div>
                <div class="map-node-name">${lvl.name}</div>
                <div class="map-node-desc">${lvl.subtitle}</div>
                <div class="map-node-stars">${'⭐'.repeat(lvlStat.stars)}${'☆'.repeat(3 - lvlStat.stars)}</div>
                <div class="map-node-score">${isUnlocked ? `High Score: ${lvlStat.score}` : 'Complete earlier stage'}</div>
              </div>
            `;
          }).join('')}
        </div>

        <div class="map-selected-details">
          <div id="mapDetailContent"></div>
        </div>

        <div class="btn-group">
          <button id="btnLaunchStage" class="btn-cartoon btn-large">🚀 LAUNCH MISSION</button>
          <button id="btnMapHome" class="btn-cartoon btn-secondary">🏠 MAIN MENU</button>
        </div>
      </div>
    `;

    // Bind destination card clicks
    const cards = container.querySelectorAll('.map-node');
    cards.forEach(card => {
      card.addEventListener('click', () => {
        const idx = parseInt(card.dataset.idx, 10);
        if (unlocked.includes(window.LEVELS[idx].id)) {
          this.selectedLevelIndex = idx;
          if (window.soundEngine) window.soundEngine.playButtonClick();
          this.render(container);
        }
      });
    });

    // Update details panel
    this.updateDetailPanel(container);

    // Bind action buttons
    const btnLaunch = container.querySelector('#btnLaunchStage');
    if (btnLaunch) {
      btnLaunch.addEventListener('click', () => {
        if (window.soundEngine) window.soundEngine.playButtonClick();
        if (this.onSelectLevel) this.onSelectLevel(this.selectedLevelIndex);
      });
    }

    const btnHome = container.querySelector('#btnMapHome');
    if (btnHome) {
      btnHome.addEventListener('click', () => {
        if (window.soundEngine) window.soundEngine.playButtonClick();
        if (this.onReturnHome) this.onReturnHome();
      });
    }
  }

  updateDetailPanel(container) {
    const detailEl = container.querySelector('#mapDetailContent');
    if (!detailEl) return;
    const lvl = window.LEVELS[this.selectedLevelIndex];

    detailEl.innerHTML = `
      <div class="detail-row">
        <strong>Mission:</strong> <span>${lvl.name} — ${lvl.subtitle}</span>
      </div>
      <div class="detail-row">
        <strong>Enemies:</strong> <span>${lvl.hasBoss ? '⚠️ BOSS: THE FROST GUARDIAN!' : lvl.enemies.map(e => e.type.toUpperCase()).join(', ')}</span>
      </div>
      <div class="detail-row">
        <strong>Acorns to Harvest:</strong> <span>${lvl.acorns.length} 🌰</span>
      </div>
    `;
  }
}

window.WorldMap = WorldMap;
