/**
 * OPERATION: STEAL THE ACORN - Combat System
 * Handles hitboxes, attacks, damage calculations, knockback physics, and damage text.
 */

class CombatSystem {
  constructor() {
    this.activeAttacks = [];
    this.damageNumbers = [];
    this.projectiles = [];
  }

  reset() {
    this.activeAttacks = [];
    this.damageNumbers = [];
    this.projectiles = [];
  }

  // Register a melee swing or area damage
  createAttack(source, x, y, width, height, damage, knockbackX, knockbackY, duration = 0.12, type = 'melee') {
    this.activeAttacks.push({
      source, // 'player1', 'player2', 'enemy', 'boss'
      x,
      y,
      width,
      height,
      damage,
      knockbackX,
      knockbackY,
      duration,
      life: duration,
      type,
      hitTargets: new Set()
    });
  }

  // Spawn a projectile (ice shards, snowballs)
  spawnProjectile(source, x, y, vx, vy, radius, damage, color = '#38bdf8', maxDistance = 600) {
    this.projectiles.push({
      source,
      x,
      y,
      vx,
      vy,
      radius,
      damage,
      color,
      distanceTraveled: 0,
      maxDistance,
      active: true
    });
  }

  // Floating cartoon damage number
  addDamageText(x, y, amount, isCritical = false, isPlayerHurt = false) {
    this.damageNumbers.push({
      x,
      y: y - 10,
      text: isPlayerHurt ? `-${amount}` : (isCritical ? `${amount} CRIT!` : `${amount}`),
      color: isPlayerHurt ? '#ef4444' : (isCritical ? '#fde047' : '#ffffff'),
      size: isCritical ? 20 : 16,
      vx: (Math.random() - 0.5) * 1.5,
      vy: -2.5,
      life: 1.0,
      decay: 0.025
    });
  }

  update(dt, players, enemies, platforms, renderer) {
    // 1. Update melee attack lifespans & resolve collisions
    for (let i = this.activeAttacks.length - 1; i >= 0; i--) {
      const atk = this.activeAttacks[i];
      atk.life -= dt;

      // Check hits
      if (atk.source.startsWith('player')) {
        // Player hitting enemies
        for (const enemy of enemies) {
          if (!enemy.isAlive || atk.hitTargets.has(enemy)) continue;
          if (this.checkAABB(atk, enemy)) {
            atk.hitTargets.add(enemy);
            const isCrit = Math.random() < 0.2;
            const finalDmg = isCrit ? Math.floor(atk.damage * 1.4) : atk.damage;
            enemy.takeDamage(finalDmg, atk.knockbackX, atk.knockbackY);
            this.addDamageText(enemy.x + enemy.width / 2, enemy.y, finalDmg, isCrit, false);
            if (renderer) {
              renderer.addSparkles(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, 8, isCrit ? '#fde047' : '#38bdf8');
              renderer.addScreenShake(isCrit ? 6 : 3);
            }
            if (window.soundEngine) window.soundEngine.playEnemyHit();
          }
        }
      } else {
        // Enemy hitting players
        for (const p of players) {
          if (!p.isAlive || p.invulnerableTimer > 0 || atk.hitTargets.has(p)) continue;
          if (this.checkAABB(atk, p)) {
            atk.hitTargets.add(p);
            p.takeDamage(atk.damage, atk.knockbackX, atk.knockbackY);
            this.addDamageText(p.x + p.width / 2, p.y, atk.damage, false, true);
            if (renderer) {
              renderer.addSparkles(p.x + p.width / 2, p.y + p.height / 2, 8, '#ef4444');
              renderer.addScreenShake(7);
            }
          }
        }
      }

      if (atk.life <= 0) {
        this.activeAttacks.splice(i, 1);
      }
    }

    // 2. Update projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      proj.x += proj.vx;
      proj.y += proj.vy;
      proj.distanceTraveled += Math.hypot(proj.vx, proj.vy);

      // Hit check against players
      if (proj.source === 'enemy' || proj.source === 'boss') {
        for (const p of players) {
          if (!p.isAlive || p.invulnerableTimer > 0) continue;
          const dx = (p.x + p.width / 2) - proj.x;
          const dy = (p.y + p.height / 2) - proj.y;
          if (Math.hypot(dx, dy) < (proj.radius + 18)) {
            p.takeDamage(proj.damage, proj.vx > 0 ? 5 : -5, -4);
            this.addDamageText(p.x + p.width / 2, p.y, proj.damage, false, true);
            proj.active = false;
            if (renderer) renderer.addIceShards(proj.x, proj.y, 6);
            break;
          }
        }
      }

      // Check collision with solid platforms
      for (const plat of platforms) {
        if (proj.x > plat.x && proj.x < plat.x + plat.width &&
            proj.y > plat.y && proj.y < plat.y + plat.height) {
          proj.active = false;
          if (renderer) renderer.addIceShards(proj.x, proj.y, 5);
          break;
        }
      }

      if (!proj.active || proj.distanceTraveled > proj.maxDistance) {
        this.projectiles.splice(i, 1);
      }
    }

    // 3. Update floating damage numbers
    for (let i = this.damageNumbers.length - 1; i >= 0; i--) {
      const d = this.damageNumbers[i];
      d.x += d.vx;
      d.y += d.vy;
      d.life -= d.decay;
      if (d.life <= 0) {
        this.damageNumbers.splice(i, 1);
      }
    }
  }

  checkAABB(r1, r2) {
    return (
      r1.x < r2.x + r2.width &&
      r1.x + r1.width > r2.x &&
      r1.y < r2.y + r2.height &&
      r1.y + r1.height > r2.y
    );
  }

  render(ctx, cameraX, cameraY) {
    ctx.save();
    ctx.translate(Math.floor(-cameraX), Math.floor(-cameraY));

    // Render Projectiles
    for (const proj of this.projectiles) {
      ctx.fillStyle = proj.color;
      ctx.beginPath();
      ctx.arc(proj.x, proj.y, proj.radius, 0, Math.PI * 2);
      ctx.fill();

      // Outer glow
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Render Floating Damage Numbers
    for (const d of this.damageNumbers) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, d.life);
      ctx.font = `bold ${d.size}px sans-serif`;
      ctx.fillStyle = d.color;
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.textAlign = 'center';
      ctx.strokeText(d.text, d.x, d.y);
      ctx.fillText(d.text, d.x, d.y);
      ctx.restore();
    }

    ctx.restore();
  }
}

window.combatSystem = new CombatSystem();
