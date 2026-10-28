/**
 * OPERATION: STEAL THE ACORN - UI & Screen Manager
 * Manages all HUD overlays, screens, character selection cards, and modals.
 */

class UIManager {
  constructor() {
    this.currentScreen = 'intro';
  }

  showScreen(screenId) {
    this.currentScreen = screenId;
    const allScreens = document.querySelectorAll('.screen-layer');
    allScreens.forEach(s => s.classList.remove('active'));

    const target = document.getElementById(screenId);
    if (target) {
      target.classList.add('active');
    }

    // Toggle HUD visibility
    const hud = document.getElementById('gameplayHUD');
    if (hud) {
      if (screenId === 'screenGameplay') {
        hud.classList.add('visible');
      } else {
        hud.classList.remove('visible');
      }
    }
  }

  updateHUD(level, players, boss, totalAcornsCollected) {
    // Level title
    const lvlName = document.getElementById('hudLevelName');
    if (lvlName && level) lvlName.textContent = level.name;

    // Total acorns
    const acornEl = document.getElementById('hudAcornCount');
    if (acornEl) acornEl.textContent = totalAcornsCollected;

    // Player 1 HUD
    const p1 = players[0];
    if (p1) {
      const p1HpFill = document.getElementById('p1HealthFill');
      if (p1HpFill) {
        const pct = Math.max(0, Math.min(100, (p1.health / p1.maxHealth) * 100));
        p1HpFill.style.width = `${pct}%`;
      }
      const p1CdFill = document.getElementById('p1CooldownFill');
      if (p1CdFill) {
        const cdMax = p1.charData.special.cooldown;
        const cdRemain = Math.max(0, p1.specialCooldown);
        const cdPct = ((cdMax - cdRemain) / cdMax) * 100;
        p1CdFill.style.width = `${cdPct}%`;
      }
      const p1Lives = document.getElementById('p1Lives');
      if (p1Lives) p1Lives.textContent = '❤️'.repeat(p1.lives);
      const p1Portrait = document.getElementById('p1Portrait');
      if (p1Portrait) p1Portrait.textContent = p1.charData.portrait;
      const p1NameTag = document.getElementById('p1NameTag');
      if (p1NameTag) p1NameTag.textContent = `P1: ${p1.charData.name.toUpperCase()}`;
    }

    // Player 2 HUD (Multiplayer co-op)
    const p2Card = document.getElementById('p2HUDCard');
    if (players.length > 1 && window.multiplayerEngine.mode !== 'single') {
      if (p2Card) p2Card.style.display = 'flex';
      const p2 = players[1];
      if (p2) {
        const p2HpFill = document.getElementById('p2HealthFill');
        if (p2HpFill) {
          const pct = Math.max(0, Math.min(100, (p2.health / p2.maxHealth) * 100));
          p2HpFill.style.width = `${pct}%`;
        }
        const p2CdFill = document.getElementById('p2CooldownFill');
        if (p2CdFill) {
          const cdMax = p2.charData.special.cooldown;
          const cdRemain = Math.max(0, p2.specialCooldown);
          const cdPct = ((cdMax - cdRemain) / cdMax) * 100;
          p2CdFill.style.width = `${cdPct}%`;
        }
        const p2Lives = document.getElementById('p2Lives');
        if (p2Lives) p2Lives.textContent = '❤️'.repeat(p2.lives);
        const p2Portrait = document.getElementById('p2Portrait');
        if (p2Portrait) p2Portrait.textContent = p2.charData.portrait;
        const p2NameTag = document.getElementById('p2NameTag');
        if (p2NameTag) p2NameTag.textContent = `P2: ${p2.charData.name.toUpperCase()}`;
      }
    } else {
      if (p2Card) p2Card.style.display = 'none';
    }

    // Boss Health Bar
    const bossContainer = document.getElementById('bossHealthContainer');
    if (boss && boss.isAlive) {
      if (bossContainer) bossContainer.style.display = 'flex';
      const bossFill = document.getElementById('bossHealthFill');
      if (bossFill) {
        const pct = Math.max(0, (boss.health / boss.maxHealth) * 100);
        bossFill.style.width = `${pct}%`;
      }
    } else {
      if (bossContainer) bossContainer.style.display = 'none';
    }
  }

  // Character Selection Screen population
  renderCharacterSelection(targetPlayer = 1, onSelect) {
    const container = document.getElementById('charCardsContainer');
    if (!container) return;

    const chars = Object.values(window.CHARACTERS);
    const selectedCharId = window.storageManager.getSelectedCharacter(targetPlayer);

    container.innerHTML = chars.map(c => {
      const isSelected = c.id === selectedCharId;
      return `
        <div class="char-card ${isSelected ? 'selected' : ''}" data-char-id="${c.id}">
          <div class="char-portrait">${c.portrait}</div>
          <div class="char-name">${c.name}</div>
          <div class="char-role">${c.role}</div>
          <div class="char-desc">${c.description}</div>

          <div class="char-stats-list">
            <div class="stat-bar-row">
              <span>HP</span>
              <div class="bar-bg"><div class="bar-fill" style="width: ${(c.stats.health / 200) * 100}%; background: #ef4444;"></div></div>
            </div>
            <div class="stat-bar-row">
              <span>SPEED</span>
              <div class="bar-bg"><div class="bar-fill" style="width: ${(c.stats.speed / 8) * 100}%; background: #38bdf8;"></div></div>
            </div>
            <div class="stat-bar-row">
              <span>DAMAGE</span>
              <div class="bar-bg"><div class="bar-fill" style="width: ${(c.stats.attackDamage / 50) * 100}%; background: #f59e0b;"></div></div>
            </div>
          </div>

          <div class="char-special-badge">
            ⚡ <strong>${c.special.name}</strong>: ${c.special.description}
          </div>

          <button class="btn-cartoon btn-select-char" data-char-id="${c.id}">
            ${isSelected ? '✓ SELECTED' : 'SELECT'}
          </button>
        </div>
      `;
    }).join('');

    container.querySelectorAll('.btn-select-char').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.dataset.charId;
        window.storageManager.setSelectedCharacter(id, targetPlayer);
        if (window.soundEngine) window.soundEngine.playCharacterSelect();
        this.renderCharacterSelection(targetPlayer, onSelect);
        if (onSelect) onSelect(id);
      });
    });
  }
}

window.uiManager = new UIManager();
