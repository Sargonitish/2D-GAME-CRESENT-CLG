/**
 * OPERATION: STEAL THE ACORN - Core Game Engine
 * Orchestrates level loading, physics updates, combat loops, camera tracking, and win/loss states.
 */

class Game {
  constructor() {
    this.canvas = document.getElementById('gameCanvas');
    this.renderer = new window.GameRenderer(this.canvas);
    this.combat = window.combatSystem;
    this.audio = window.soundEngine;
    this.ui = window.uiManager;
    this.multiplayer = window.multiplayerEngine;
    this.storage = window.storageManager;

    this.currentLevelIndex = 0;
    this.currentLevel = null;
    this.players = [];
    this.enemies = [];
    this.boss = null;
    this.platforms = [];
    this.acorns = [];
    this.exitPortal = null;
    this.totalAcornsCollectedInLevel = 0;
    this.levelTimeElapsed = 0;

    this.state = 'intro'; // 'intro', 'home', 'charselect', 'multiplayer', 'map', 'playing', 'paused', 'victory', 'defeat'
    this.lastFrameTime = performance.now();
    this.worldMap = new window.WorldMap(
      (levelIdx) => this.startLevel(levelIdx),
      () => this.goToHome()
    );

    this.init();
  }

  init() {
    // Start main animation loop
    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
  }

  startLevel(levelIndex) {
    this.currentLevelIndex = levelIndex;
    const lvl = window.LEVELS[levelIndex];
    this.currentLevel = lvl;

    this.combat.reset();
    this.totalAcornsCollectedInLevel = 0;
    this.levelTimeElapsed = 0;

    // Deep clone platforms and acorns
    this.platforms = JSON.parse(JSON.stringify(lvl.platforms));
    this.acorns = JSON.parse(JSON.stringify(lvl.acorns));
    this.exitPortal = lvl.exitPortal ? JSON.parse(JSON.stringify(lvl.exitPortal)) : null;

    // Instantiate Player 1
    const p1CharId = this.storage.getSelectedCharacter(1);
    const p1 = new window.Player(1, p1CharId, lvl.spawnP1.x, lvl.spawnP1.y);
    this.players = [p1];

    // Instantiate Player 2 if Multiplayer Co-op
    if (this.multiplayer.mode !== 'single') {
      const p2CharId = this.storage.getSelectedCharacter(2);
      const p2 = new window.Player(2, p2CharId, lvl.spawnP2.x, lvl.spawnP2.y);
      this.players.push(p2);
    }

    // Instantiate Enemies
    this.enemies = lvl.enemies.map(e => new window.Enemy(e.type, e.x, e.y, e.patrolDist));

    // Instantiate Final Boss on Level 5
    if (lvl.hasBoss) {
      this.boss = new window.FrostGuardianBoss(lvl.bossSpawn.x, lvl.bossSpawn.y);
      this.audio.playMusic('boss');
    } else {
      this.boss = null;
      this.audio.playMusic('combat');
    }

    this.state = 'playing';
    this.ui.showScreen('screenGameplay');
  }

  restartLevel() {
    this.startLevel(this.currentLevelIndex);
  }

  pauseGame() {
    if (this.state !== 'playing') return;
    this.state = 'paused';
    this.audio.playButtonClick();
    this.ui.showScreen('screenPause');
  }

  resumeGame() {
    if (this.state !== 'paused') return;
    this.state = 'playing';
    this.audio.playButtonClick();
    this.ui.showScreen('screenGameplay');
  }

  goToMap() {
    this.state = 'map';
    this.audio.playMusic('home');
    this.ui.showScreen('screenWorldMap');
    this.worldMap.render(document.getElementById('screenWorldMap'));
  }

  goToHome() {
    this.state = 'home';
    this.audio.playMusic('home');
    this.ui.showScreen('screenHome');
  }

  // ==========================================
  // MAIN UPDATE TICK
  // ==========================================

  update(dt) {
    if (this.state !== 'playing') return;

    this.levelTimeElapsed += dt;

    // 1. Process player inputs from Multiplayer Engine
    this.multiplayer.updateInputs(this.players, this.combat, this.renderer, this.enemies);

    // 2. Update players
    let anyPlayerAlive = false;
    for (const p of this.players) {
      p.update(dt, this.platforms, this.combat, this.renderer, this.enemies);
      if (p.isAlive) anyPlayerAlive = true;
    }

    // 3. Update enemies
    for (const e of this.enemies) {
      e.update(dt, this.players, this.platforms, this.combat, this.renderer);
    }

    // 4. Update Boss if active
    if (this.boss && this.boss.isAlive) {
      this.boss.update(dt, this.players, this.platforms, this.combat, this.renderer, this.enemies);
    }

    // 5. Update combat system (melee attacks, projectiles, damage numbers)
    this.combat.update(dt, this.players, this.enemies, this.platforms, this.renderer);

    // 6. Check acorn collection
    for (const a of this.acorns) {
      if (a.collected) continue;
      for (const p of this.players) {
        if (!p.isAlive) continue;
        const dx = (p.x + p.width / 2) - (a.x + 12);
        const dy = (p.y + p.height / 2) - (a.y + 14);
        if (Math.hypot(dx, dy) < 32) {
          a.collected = true;
          this.totalAcornsCollectedInLevel++;
          this.storage.addAcorns(1);
          this.audio.playAcornCollect();
          this.renderer.addSparkles(a.x + 12, a.y + 14, 8, '#fbbf24');
          break;
        }
      }
    }

    // 7. Check level completion
    this.checkWinLoss(anyPlayerAlive);

    // 8. Update Camera to track players
    this.updateCamera();

    // 9. Update UI HUD
    this.ui.updateHUD(this.currentLevel, this.players, this.boss, this.totalAcornsCollectedInLevel);
  }

  onEnemyKilled(enemy) {
    const pts = enemy.pointValue || 100;
    this.totalAcornsCollectedInLevel += pts;
    this.storage.addAcorns(Math.max(1, Math.floor(pts / 50)));

    // Floating text +PTS!
    this.combat.addDamageText(enemy.x + enemy.width / 2, enemy.y - 15, `+${pts} PTS!`, true, false);

    if (this.audio) this.audio.playAcornCollect();
    if (this.renderer) {
      this.renderer.addSparkles(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 14, '#fde047');
      this.renderer.addDustPuff(enemy.x + enemy.width / 2, enemy.y + enemy.height, 6);
    }
  }

  checkWinLoss(anyPlayerAlive) {
    // Loss check: all players out of lives
    const totalLives = this.players.reduce((sum, p) => sum + p.lives, 0);
    if (totalLives <= 0 && !anyPlayerAlive) {
      this.triggerDefeat();
      return;
    }

    // Win check on normal levels: reach Exit Portal
    if (this.exitPortal) {
      const p1 = this.players[0];
      if (p1 && p1.isAlive) {
        const ep = this.exitPortal;
        if (p1.x + p1.width > ep.x && p1.x < ep.x + ep.width &&
            p1.y + p1.height > ep.y && p1.y < ep.y + ep.height) {
          this.triggerVictory();
          return;
        }
      }
    }

    // Win check on Boss level (Level 5): Boss is defeated
    if (this.currentLevel && this.currentLevel.hasBoss && this.boss && !this.boss.isAlive) {
      this.triggerVictory();
    }
  }

  triggerVictory() {
    this.state = 'victory';
    this.audio.playVictory();
    this.renderer.addConfetti(120);

    const timeTaken = Math.floor(this.levelTimeElapsed);
    const score = 2000 + this.totalAcornsCollectedInLevel - timeTaken * 8;
    let stars = 1;
    if (this.totalAcornsCollectedInLevel >= 300) stars = 2;
    if (this.totalAcornsCollectedInLevel >= 600) stars = 3;

    this.storage.saveLevelResult(this.currentLevel.id, score, stars);

    // Populate Victory Screen elements
    document.getElementById('vicLevelName').textContent = this.currentLevel.name;
    document.getElementById('vicScore').textContent = Math.max(500, score);
    document.getElementById('vicAcorns').textContent = `${this.totalAcornsCollectedInLevel} PTS`;
    document.getElementById('vicTime').textContent = `${timeTaken}s`;
    document.getElementById('vicStars').textContent = '⭐'.repeat(stars);

    this.ui.showScreen('screenVictory');
  }

  triggerDefeat() {
    this.state = 'defeat';
    this.audio.playDefeat();
    document.getElementById('defeatLevelName').textContent = this.currentLevel.name;
    this.ui.showScreen('screenDefeat');
  }

  updateCamera() {
    if (this.players.length === 0) return;

    // Track midpoint between P1 and P2
    let targetX = this.players[0].x;
    if (this.players.length > 1 && this.players[1].isAlive) {
      targetX = (this.players[0].x + this.players[1].x) / 2;
    }

    const halfScreen = this.renderer.width / 2;
    const targetCamX = targetX - halfScreen;

    this.renderer.cameraX += (targetCamX - this.renderer.cameraX) * 0.1;
    const maxCamX = Math.max(0, (this.currentLevel ? this.currentLevel.width : 2400) - this.renderer.width);
    this.renderer.cameraX = Math.max(0, Math.min(maxCamX, this.renderer.cameraX));
  }

  // ==========================================
  // ANIMATION LOOP
  // ==========================================

  loop(timestamp) {
    const dt = Math.min((timestamp - this.lastFrameTime) / 1000, 0.1);
    this.lastFrameTime = timestamp;

    if (this.state === 'playing') {
      this.update(dt);
      this.renderer.render({
        levelWidth: this.currentLevel ? this.currentLevel.width : 2400,
        platforms: this.platforms,
        exitPortal: this.exitPortal,
        acorns: this.acorns,
        enemies: this.enemies,
        boss: this.boss,
        players: this.players
      });
    }

    requestAnimationFrame(this.loop);
  }
}

window.Game = Game;
