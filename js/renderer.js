/**
 * OPERATION: STEAL THE ACORN - High-Fidelity Canvas 2D Graphic Engine
 * Renders layered parallax Arctic vistas, animated heroes, enemies, boss, and particles.
 */

class GameRenderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    this.width = 1280;
    this.height = 720;
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    this.cameraX = 0;
    this.cameraY = 0;
    this.shakeAmount = 0;

    this.particles = [];
    this.snowflakes = [];
    this.confetti = [];
    this.initSnowflakes(80);
  }

  initSnowflakes(count) {
    this.snowflakes = [];
    for (let i = 0; i < count; i++) {
      this.snowflakes.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        radius: Math.random() * 2.5 + 1,
        speedY: Math.random() * 1.5 + 0.8,
        speedX: Math.random() * 1.0 - 0.3,
        alpha: Math.random() * 0.7 + 0.3
      });
    }
  }

  addScreenShake(intensity = 8) {
    this.shakeAmount = Math.max(this.shakeAmount, intensity);
  }

  addDustPuff(x, y, count = 5) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: x + (Math.random() * 16 - 8),
        y: y + (Math.random() * 4 - 2),
        vx: (Math.random() * 3 - 1.5),
        vy: -(Math.random() * 2 + 0.5),
        radius: Math.random() * 4 + 2,
        color: 'rgba(230, 245, 255, 0.8)',
        life: 1.0,
        decay: Math.random() * 0.04 + 0.03
      });
    }
  }

  addSparkles(x, y, count = 10, color = '#fbbf24') {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3 + 1;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: Math.random() * 3 + 1.5,
        color,
        life: 1.0,
        decay: Math.random() * 0.04 + 0.02
      });
    }
  }

  addIceShards(x, y, count = 8) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: x + (Math.random() * 30 - 15),
        y,
        vx: (Math.random() * 4 - 2),
        vy: -(Math.random() * 4 + 1),
        radius: Math.random() * 3 + 2,
        color: 'rgba(186, 230, 253, 0.9)',
        life: 1.0,
        decay: Math.random() * 0.03 + 0.02
      });
    }
  }

  addConfetti(count = 70) {
    const colors = ['#f59e0b', '#38bdf8', '#ec4899', '#10b981', '#fbbf24', '#a855f7'];
    for (let i = 0; i < count; i++) {
      this.confetti.push({
        x: Math.random() * this.width,
        y: -20 - Math.random() * 100,
        vx: (Math.random() * 4 - 2),
        vy: Math.random() * 3 + 2,
        w: Math.random() * 8 + 6,
        h: Math.random() * 5 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.15
      });
    }
  }

  updateParticles() {
    for (const s of this.snowflakes) {
      s.y += s.speedY;
      s.x += s.speedX;
      if (s.y > this.height) { s.y = -5; s.x = Math.random() * this.width; }
      if (s.x > this.width) s.x = 0;
      if (s.x < 0) s.x = this.width;
    }

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= p.decay;
      if (p.life <= 0) this.particles.splice(i, 1);
    }

    for (let i = this.confetti.length - 1; i >= 0; i--) {
      const c = this.confetti[i];
      c.x += c.vx;
      c.y += c.vy;
      c.rotation += c.vRot;
      if (c.y > this.height + 20) this.confetti.splice(i, 1);
    }

    if (this.shakeAmount > 0) {
      this.shakeAmount *= 0.88;
      if (this.shakeAmount < 0.2) this.shakeAmount = 0;
    }
  }

  // ==========================================
  // PARALLAX BACKGROUND
  // ==========================================

  renderBackground(levelWidth = 2400) {
    const ctx = this.ctx;

    // Sky gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, this.height);
    skyGrad.addColorStop(0, '#7dd3fc');
    skyGrad.addColorStop(0.4, '#bae6fd');
    skyGrad.addColorStop(0.85, '#e0f2fe');
    skyGrad.addColorStop(1, '#f8fafc');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, this.width, this.height);

    // Arctic Sun
    const sunGrad = ctx.createRadialGradient(240, 130, 10, 240, 130, 160);
    sunGrad.addColorStop(0, 'rgba(254, 243, 199, 0.85)');
    sunGrad.addColorStop(0.5, 'rgba(253, 230, 138, 0.3)');
    sunGrad.addColorStop(1, 'rgba(253, 230, 138, 0)');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(240, 130, 160, 0, Math.PI * 2);
    ctx.fill();

    // Far Jagged Mountains (Parallax Layer 1)
    ctx.save();
    const p1 = this.cameraX * 0.12;
    ctx.fillStyle = '#93c5fd';
    ctx.beginPath();
    ctx.moveTo(0, this.height);
    for (let x = -200; x < this.width + 300; x += 180) {
      const screenX = x - (p1 % 180);
      ctx.lineTo(screenX, 260 + Math.sin(x * 0.02) * 50);
      ctx.lineTo(screenX + 90, 180 + Math.cos(x * 0.015) * 60);
      ctx.lineTo(screenX + 180, 290);
    }
    ctx.lineTo(this.width, this.height);
    ctx.fill();

    // Snow caps
    ctx.fillStyle = '#ffffff';
    for (let x = -200; x < this.width + 300; x += 180) {
      const screenX = x - (p1 % 180);
      const peakY = 180 + Math.cos(x * 0.015) * 60;
      ctx.beginPath();
      ctx.moveTo(screenX + 90, peakY);
      ctx.lineTo(screenX + 60, peakY + 45);
      ctx.lineTo(screenX + 120, peakY + 45);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // Midground Glaciers (Parallax Layer 2)
    ctx.save();
    const p2 = this.cameraX * 0.28;
    ctx.fillStyle = '#67e8f9';
    ctx.beginPath();
    ctx.moveTo(0, this.height);
    for (let x = -150; x < this.width + 250; x += 140) {
      const screenX = x - (p2 % 140);
      ctx.lineTo(screenX, 390 + Math.sin(x * 0.03) * 35);
      ctx.lineTo(screenX + 70, 310 + Math.cos(x * 0.02) * 45);
      ctx.lineTo(screenX + 140, 420);
    }
    ctx.lineTo(this.width, this.height);
    ctx.fill();
    ctx.restore();
  }

  // ==========================================
  // PLATFORMS & PORTAL
  // ==========================================

  renderPlatforms(platforms) {
    const ctx = this.ctx;
    for (const plat of platforms) {
      ctx.save();

      if (plat.type === 'ice') {
        // Translucent blue glossy ice slab
        const iceGrad = ctx.createLinearGradient(plat.x, plat.y, plat.x, plat.y + plat.height);
        iceGrad.addColorStop(0, '#e0f2fe');
        iceGrad.addColorStop(0.2, '#7dd3fc');
        iceGrad.addColorStop(1, '#0284c7');
        ctx.fillStyle = iceGrad;
        ctx.strokeStyle = '#bae6fd';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(plat.x, plat.y, plat.width, plat.height, 6);
        ctx.fill();
        ctx.stroke();

        // Gloss highlight
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(plat.x + 8, plat.y + 4);
        ctx.lineTo(plat.x + plat.width - 8, plat.y + 4);
        ctx.stroke();
      } else if (plat.type === 'crack') {
        const crackGrad = ctx.createLinearGradient(plat.x, plat.y, plat.x, plat.y + plat.height);
        crackGrad.addColorStop(0, plat.steppedOn ? '#fecdd3' : '#bae6fd');
        crackGrad.addColorStop(1, plat.steppedOn ? '#fda4af' : '#38bdf8');
        ctx.fillStyle = crackGrad;
        ctx.strokeStyle = plat.steppedOn ? '#f43f5e' : '#0ea5e9';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(plat.x, plat.y, plat.width, plat.height, 4);
        ctx.fill();
        ctx.stroke();
      } else {
        // Snow rock
        const rockGrad = ctx.createLinearGradient(plat.x, plat.y, plat.x, plat.y + plat.height);
        rockGrad.addColorStop(0, '#475569');
        rockGrad.addColorStop(1, '#1e293b');
        ctx.fillStyle = rockGrad;
        ctx.beginPath();
        ctx.roundRect(plat.x, plat.y + 8, plat.width, plat.height - 8, [0, 0, 8, 8]);
        ctx.fill();

        // Snow top
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.roundRect(plat.x, plat.y, plat.width, 16, [8, 8, 4, 4]);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  renderExitPortal(portal) {
    if (!portal) return;
    const ctx = this.ctx;
    const time = Date.now() * 0.005;

    ctx.save();
    ctx.translate(portal.x + portal.width / 2, portal.y + portal.height / 2);

    // Glowing Arctic stone archway
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, portal.width / 2, 0, Math.PI * 2);
    ctx.stroke();

    // Swirling portal vortex
    const vortex = ctx.createRadialGradient(0, 0, 5, 0, 0, portal.width / 2);
    vortex.addColorStop(0, '#ffffff');
    vortex.addColorStop(0.5, '#38bdf8');
    vortex.addColorStop(1, 'rgba(2, 132, 199, 0)');
    ctx.fillStyle = vortex;
    ctx.beginPath();
    ctx.arc(0, 0, portal.width / 2 - 4, 0, Math.PI * 2);
    ctx.fill();

    // Portal Sign
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText("EXIT", 0, -portal.height / 2 - 8);

    ctx.restore();
  }

  // ==========================================
  // ACORNS
  // ==========================================

  renderAcorns(acorns) {
    const ctx = this.ctx;
    const time = Date.now() * 0.005;

    for (const a of acorns) {
      if (a.collected) continue;
      ctx.save();
      const bobY = a.y + Math.sin(time + a.x * 0.1) * 4;
      ctx.translate(a.x + 12, bobY + 14);

      // Acorn Nut
      const nutGrad = ctx.createLinearGradient(-10, -6, 10, 12);
      nutGrad.addColorStop(0, '#f59e0b');
      nutGrad.addColorStop(1, '#b45309');
      ctx.fillStyle = nutGrad;
      ctx.beginPath();
      ctx.moveTo(-9, -2);
      ctx.quadraticCurveTo(-11, 10, 0, 15);
      ctx.quadraticCurveTo(11, 10, 9, -2);
      ctx.closePath();
      ctx.fill();

      // Cap
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.ellipse(0, -4, 11, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Stem
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -8);
      ctx.lineTo(2, -14);
      ctx.stroke();

      ctx.restore();
    }
  }

  // ==========================================
  // HEROES (CHIKKU, BUMBO, FROST TIGER)
  // ==========================================

  renderPlayer(player) {
    if (!player.isAlive) return;
    const ctx = this.ctx;

    // Invulnerability blink
    if (player.invulnerableTimer > 0 && Math.floor(Date.now() / 80) % 2 === 0) {
      return;
    }

    ctx.save();
    ctx.translate(player.x + player.width / 2, player.y + player.height / 2);

    if (player.facing < 0) {
      ctx.scale(-1, 1);
    }

    // Player tag badge (P1 Blue, P2 Green)
    ctx.fillStyle = player.playerId === 1 ? '#38bdf8' : '#4ade80';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`P${player.playerId}`, 0, -player.height / 2 - 10);

    const animTime = Date.now() * 0.012;
    const bob = player.state === 'run' ? Math.sin(animTime * 1.5) * 3 : 0;
    ctx.translate(0, bob);

    if (player.charId === 'chikku') {
      this.drawChikku(ctx, player);
    } else if (player.charId === 'bumbo') {
      this.drawBumbo(ctx, player);
    } else if (player.charId === 'tiger') {
      this.drawTiger(ctx, player);
    }

    // Health bar over player
    const hpPct = Math.max(0, player.health / player.maxHealth);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(-22, -player.height / 2 - 6, 44, 5);
    ctx.fillStyle = hpPct > 0.4 ? '#22c55e' : '#ef4444';
    ctx.fillRect(-21, -player.height / 2 - 5, 42 * hpPct, 3);

    ctx.restore();
  }

  drawChikku(ctx, player) {
    // 1. Fluffy tail with blue ribbon/ring
    ctx.save();
    ctx.translate(-12, 2);
    ctx.rotate(Math.sin(Date.now() * 0.01) * 0.2);
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-26, -10, -26, -30);
    ctx.quadraticCurveTo(-26, -46, -10, -42);
    ctx.quadraticCurveTo(4, -36, -2, -16);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 2. Body
    ctx.fillStyle = '#f97316';
    ctx.beginPath();
    ctx.ellipse(0, 4, 13, 16, 0, 0, Math.PI * 2);
    ctx.fill();

    // Belly
    ctx.fillStyle = '#ffedd5';
    ctx.beginPath();
    ctx.ellipse(3, 6, 8, 10, 0.1, 0, Math.PI * 2);
    ctx.fill();

    // 3. Blue winter scarf
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.roundRect(-8, -12, 18, 7, 3);
    ctx.fill();
    ctx.fillRect(-10, -10, 6, 12); // Scarf tail

    // 4. Head & big eyes
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.arc(3, -16, 12, 0, Math.PI * 2);
    ctx.fill();

    // Eye
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(7, -18, 5, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(8, -18, 3, 0, Math.PI * 2);
    ctx.fill();

    // Ears
    ctx.fillStyle = '#c2410c';
    ctx.beginPath();
    ctx.moveTo(0, -25);
    ctx.lineTo(-3, -34);
    ctx.lineTo(5, -27);
    ctx.closePath();
    ctx.fill();
  }

  drawBumbo(ctx, player) {
    // 1. Giant mammoth woolly mound
    const wool = ctx.createRadialGradient(0, 0, 10, 0, 0, 36);
    wool.addColorStop(0, '#a16207');
    wool.addColorStop(1, '#451a03');
    ctx.fillStyle = wool;
    ctx.beginPath();
    ctx.ellipse(0, 4, 30, 24, 0, 0, Math.PI * 2);
    ctx.fill();

    // Armor Pauldron
    ctx.fillStyle = '#64748b';
    ctx.beginPath();
    ctx.roundRect(-8, -12, 16, 12, 4);
    ctx.fill();
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 2. Head & Curved Ivory Tusks
    ctx.fillStyle = '#713f12';
    ctx.beginPath();
    ctx.arc(16, -6, 18, 0, Math.PI * 2);
    ctx.fill();

    // Tusks
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(22, 0);
    ctx.quadraticCurveTo(42, 6, 38, -18);
    ctx.stroke();

    // Trunk
    ctx.strokeStyle = '#542d06';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(26, -2);
    ctx.quadraticCurveTo(34, 18, 26, 26);
    ctx.stroke();

    // Fierce Eye
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(18, -10, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(19, -10, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  drawTiger(ctx, player) {
    // 1. Sleek athletic tiger body
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.ellipse(0, 4, 22, 15, 0, 0, Math.PI * 2);
    ctx.fill();

    // White belly
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(0, 8, 16, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cyan ice stripes
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-6, -4); ctx.lineTo(-4, 6);
    ctx.moveTo(4, -5); ctx.lineTo(6, 5);
    ctx.moveTo(12, -4); ctx.lineTo(13, 4);
    ctx.stroke();

    // Tail
    ctx.strokeStyle = '#ea580c';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-20, 2);
    ctx.quadraticCurveTo(-34, -4, -30, -18);
    ctx.stroke();

    // 2. Head & Saber Fangs
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.arc(16, -6, 14, 0, Math.PI * 2);
    ctx.fill();

    // Long curved saber tooth
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(22, -2);
    ctx.lineTo(26, 12);
    ctx.lineTo(20, 2);
    ctx.closePath();
    ctx.fill();

    // Yellow predator eye
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(18, -8, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(19, -8, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  // ==========================================
  // ENEMIES & BOSS RENDERING
  // ==========================================

  renderEnemies(enemies) {
    const ctx = this.ctx;

    for (const e of enemies) {
      if (!e.isAlive) continue;
      ctx.save();
      ctx.translate(e.x + e.width / 2, e.y + e.height / 2);
      if (e.facing < 0) ctx.scale(-1, 1);

      if (e.type === 'goblin') {
        // Blue Snow Goblin
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.ellipse(0, 4, 14, 16, 0, 0, Math.PI * 2);
        ctx.fill();

        // Pointy ears
        ctx.beginPath();
        ctx.moveTo(-8, -12); ctx.lineTo(-20, -18); ctx.lineTo(-6, -4);
        ctx.fill();

        // Glowing yellow eye
        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.arc(6, -6, 4, 0, Math.PI * 2);
        ctx.fill();

        // Wooden Club
        ctx.fillStyle = '#78350f';
        ctx.fillRect(10, -14, 8, 22);

      } else if (e.type === 'wolf') {
        // White Arctic Wolf
        ctx.fillStyle = '#f1f5f9';
        ctx.beginPath();
        ctx.ellipse(0, 4, 24, 14, 0, 0, Math.PI * 2);
        ctx.fill();

        // Snout & Fangs
        ctx.fillStyle = '#e2e8f0';
        ctx.beginPath();
        ctx.arc(18, -4, 11, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ef4444'; // Red glowing eye
        ctx.beginPath();
        ctx.arc(18, -6, 3, 0, Math.PI * 2);
        ctx.fill();

      } else if (e.type === 'roller') {
        // Rolling Snow Creature
        ctx.fillStyle = '#bae6fd';
        ctx.beginPath();
        ctx.arc(0, 0, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        ctx.stroke();

      } else if (e.type === 'guardian') {
        // Armored Ice Guardian
        ctx.fillStyle = '#0369a1';
        ctx.fillRect(-22, -26, 44, 52);
        ctx.strokeStyle = '#67e8f9';
        ctx.lineWidth = 3;
        ctx.strokeRect(-22, -26, 44, 52);

        // Ice Horns
        ctx.fillStyle = '#67e8f9';
        ctx.beginPath();
        ctx.moveTo(-16, -26); ctx.lineTo(-24, -44); ctx.lineTo(-8, -26);
        ctx.moveTo(16, -26); ctx.lineTo(24, -44); ctx.lineTo(8, -26);
        ctx.fill();
      }

      // Health bar over enemy
      const hpPct = Math.max(0, e.health / e.maxHealth);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(-18, -e.height / 2 - 8, 36, 4);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-17, -e.height / 2 - 7, 34 * hpPct, 2);

      ctx.restore();
    }
  }

  renderBoss(boss) {
    if (!boss || !boss.isAlive) return;
    const ctx = this.ctx;

    ctx.save();
    ctx.translate(boss.x + boss.width / 2, boss.y + boss.height / 2);
    if (boss.facing < 0) ctx.scale(-1, 1);

    // 1. Crystal Wings / Back Spikes
    ctx.fillStyle = boss.phase === 3 ? '#f43f5e' : '#38bdf8';
    ctx.beginPath();
    ctx.moveTo(-40, 20); ctx.lineTo(-80, -60); ctx.lineTo(-20, -10);
    ctx.moveTo(-30, 40); ctx.lineTo(-90, -20); ctx.lineTo(-10, 10);
    ctx.fill();

    // 2. Colossal Horned Ice Golem Body
    const bodyGrad = ctx.createLinearGradient(-40, -50, 40, 50);
    bodyGrad.addColorStop(0, boss.phase === 3 ? '#fda4af' : '#bae6fd');
    bodyGrad.addColorStop(0.5, boss.phase === 3 ? '#e11d48' : '#0284c7');
    bodyGrad.addColorStop(1, '#0c4a6e');
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.roundRect(-45, -55, 90, 110, 16);
    ctx.fill();

    // Ice armor lines
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.strokeRect(-45, -55, 90, 110);

    // Glowing Elemental Core
    const coreGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, 22);
    coreGrad.addColorStop(0, '#ffffff');
    coreGrad.addColorStop(0.6, boss.phase === 3 ? '#f43f5e' : '#38bdf8');
    coreGrad.addColorStop(1, 'rgba(2, 132, 199, 0)');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 22, 0, Math.PI * 2);
    ctx.fill();

    // Giant Ice Horns
    ctx.fillStyle = '#e0f2fe';
    ctx.beginPath();
    ctx.moveTo(-25, -55); ctx.lineTo(-55, -95); ctx.lineTo(-10, -55);
    ctx.moveTo(25, -55); ctx.lineTo(55, -95); ctx.lineTo(10, -55);
    ctx.fill();

    // Fierce Eyes
    ctx.fillStyle = boss.phase === 3 ? '#ff0000' : '#fde047';
    ctx.beginPath();
    ctx.ellipse(-14, -30, 6, 8, 0.2, 0, Math.PI * 2);
    ctx.ellipse(14, -30, 6, 8, -0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // ==========================================
  // MAIN FRAME RENDERER
  // ==========================================

  render(gameState) {
    const ctx = this.ctx;
    this.updateParticles();
    ctx.clearRect(0, 0, this.width, this.height);

    let sX = 0, sY = 0;
    if (this.shakeAmount > 0) {
      sX = (Math.random() - 0.5) * this.shakeAmount * 2;
      sY = (Math.random() - 0.5) * this.shakeAmount * 2;
    }

    // 1. Parallax Background
    this.renderBackground(gameState.levelWidth || 2400);

    // 2. World Camera Transform
    ctx.save();
    ctx.translate(Math.floor(-this.cameraX + sX), Math.floor(-this.cameraY + sY));

    this.renderPlatforms(gameState.platforms);
    if (gameState.exitPortal) this.renderExitPortal(gameState.exitPortal);
    this.renderAcorns(gameState.acorns);

    // Enemies & Boss
    if (gameState.enemies) this.renderEnemies(gameState.enemies);
    if (gameState.boss) this.renderBoss(gameState.boss);

    // Players (P1 & P2)
    if (gameState.players) {
      for (const p of gameState.players) {
        this.renderPlayer(p);
      }
    }

    // Combat effects & projectiles
    if (window.combatSystem) {
      window.combatSystem.render(ctx, 0, 0); // already in world space
    }

    // World particles
    for (const p of this.particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();

    // 3. Screen-Space Snowflakes
    ctx.save();
    for (const s of this.snowflakes) {
      ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // 4. Confetti
    for (const c of this.confetti) {
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.rotate(c.rotation);
      ctx.fillStyle = c.color;
      ctx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
      ctx.restore();
    }
    ctx.restore();
  }
}

window.GameRenderer = GameRenderer;
