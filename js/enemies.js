/**
 * OPERATION: STEAL THE ACORN - Enemy AI & Boss System
 * Features Snow Goblins, Ice Wolves, Snow Rollers, Guardians, and The Frost Guardian Boss.
 */

class Enemy {
  constructor(type, x, y, patrolDist = 180) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.startX = x;
    this.patrolDist = patrolDist;
    this.vx = 0;
    this.vy = 0;
    this.facing = 1;
    this.isAlive = true;
    this.isGrounded = false;
    this.invulnerableTimer = 0;

    // Type specifics
    this.initType(type);

    this.state = 'patrol'; // 'patrol', 'chase', 'attack', 'hurt', 'dead'
    this.attackTimer = 0;
    this.attackCooldown = 0;
    this.animTimer = 0;
  }

  initType(type) {
    switch (type) {
      case 'goblin':
        this.width = 36;
        this.height = 42;
        this.maxHealth = 60;
        this.damage = 16;
        this.speed = 2.6;
        this.detectionRange = 220;
        this.attackRange = 45;
        this.color = '#38bdf8';
        this.pointValue = 100;
        break;

      case 'wolf':
        this.width = 54;
        this.height = 36;
        this.maxHealth = 85;
        this.damage = 22;
        this.speed = 4.2;
        this.detectionRange = 320;
        this.attackRange = 55;
        this.color = '#e2e8f0';
        this.pointValue = 150;
        break;

      case 'roller':
        this.width = 44;
        this.height = 44;
        this.maxHealth = 110;
        this.damage = 26;
        this.speed = 4.8;
        this.detectionRange = 280;
        this.attackRange = 40;
        this.color = '#bae6fd';
        this.pointValue = 200;
        break;

      case 'guardian':
        this.width = 56;
        this.height = 70;
        this.maxHealth = 180;
        this.damage = 38;
        this.speed = 1.9;
        this.detectionRange = 260;
        this.attackRange = 65;
        this.color = '#0284c7';
        this.pointValue = 300;
        break;

      default:
        this.width = 40;
        this.height = 40;
        this.maxHealth = 60;
        this.damage = 15;
        this.speed = 2.5;
        this.pointValue = 100;
        this.detectionRange = 200;
        this.attackRange = 40;
        this.color = '#38bdf8';
    }
    this.health = this.maxHealth;
  }

  update(dt, players, platforms, combatSystem, renderer) {
    if (!this.isAlive) return;

    this.animTimer += dt;
    if (this.invulnerableTimer > 0) this.invulnerableTimer -= dt;
    if (this.attackCooldown > 0) this.attackCooldown -= dt;

    // Gravity
    this.vy += 0.55;
    if (this.vy > 14) this.vy = 14;

    // Friction
    this.vx *= 0.82;

    // AI Logic
    this.updateAI(dt, players, combatSystem, renderer);

    // Apply movement
    this.x += this.vx;
    this.y += this.vy;

    // Platform collisions
    this.resolvePlatformCollisions(platforms);
  }

  updateAI(dt, players, combatSystem, renderer) {
    // Find closest alive player
    let closestPlayer = null;
    let minDist = Infinity;

    for (const p of players) {
      if (!p.isAlive) continue;
      const dist = Math.hypot((p.x - this.x), (p.y - this.y));
      if (dist < minDist) {
        minDist = dist;
        closestPlayer = p;
      }
    }

    if (closestPlayer && minDist < this.detectionRange) {
      // In range! Chase or Attack
      this.facing = closestPlayer.x > this.x ? 1 : -1;

      if (minDist <= this.attackRange && this.attackCooldown <= 0) {
        // Execute Attack!
        this.state = 'attack';
        this.attackCooldown = 1.2;
        this.vx = this.facing * 4;

        combatSystem.createAttack(
          'enemy',
          this.facing === 1 ? this.x + this.width : this.x - 40,
          this.y,
          40,
          this.height,
          this.damage,
          this.facing * 6,
          -4,
          0.15,
          'slash'
        );

        if (renderer) renderer.addDustPuff(this.x + this.width / 2, this.y + this.height, 4);
      } else {
        // Chase player
        this.state = 'chase';
        this.vx += this.facing * (this.speed * 0.35);
      }
    } else {
      // Idle patrol between startX and startX + patrolDist
      this.state = 'patrol';
      if (this.x > this.startX + this.patrolDist) {
        this.facing = -1;
      } else if (this.x < this.startX) {
        this.facing = 1;
      }
      this.vx += this.facing * (this.speed * 0.18);
    }
  }

  takeDamage(amount, knockbackX = 0, knockbackY = 0) {
    if (!this.isAlive || this.invulnerableTimer > 0) return;

    this.health = Math.max(0, this.health - amount);
    this.invulnerableTimer = 0.2;
    this.vx = knockbackX;
    this.vy = knockbackY;

    if (this.health <= 0) {
      this.die();
    }
  }

  die() {
    this.isAlive = false;
    if (window.soundEngine) window.soundEngine.playEnemyDefeat();
    if (window.gameInstance) window.gameInstance.onEnemyKilled(this);
  }

  resolvePlatformCollisions(platforms) {
    let groundedThisFrame = false;
    for (const plat of platforms) {
      if (plat.broken) continue;
      if (this.x + this.width > plat.x && this.x < plat.x + plat.width) {
        if (this.vy >= 0 && (this.y + this.height) >= plat.y && (this.y + this.height) <= plat.y + 18) {
          this.y = plat.y - this.height;
          this.vy = 0;
          this.isGrounded = true;
          groundedThisFrame = true;
        }
      }
    }
    if (!groundedThisFrame) {
      this.isGrounded = false;
    }
  }
}

/**
 * THE FROST GUARDIAN - FINAL BOSS
 */
class FrostGuardianBoss {
  constructor(x = 2400, y = 420) {
    this.x = x;
    this.y = y;
    this.width = 110;
    this.height = 140;
    this.vx = 0;
    this.vy = 0;
    this.facing = -1;
    this.isAlive = true;
    this.maxHealth = 800;
    this.health = this.maxHealth;
    this.invulnerableTimer = 0;

    this.phase = 1; // 1, 2, or 3 (enraged)
    this.actionTimer = 3.0; // time between boss attacks
    this.slamTimer = 0;
    this.isSlamming = false;
    this.pointValue = 2000;
    this.state = 'idle'; // 'idle', 'slam', 'barrage', 'summon', 'enraged'
  }

  update(dt, players, platforms, combatSystem, renderer, enemies) {
    if (!this.isAlive) return;

    if (this.invulnerableTimer > 0) this.invulnerableTimer -= dt;
    this.actionTimer -= dt;

    // Check boss phase
    if (this.health < 320 && this.phase < 3) {
      this.phase = 3; // Enraged!
      if (window.soundEngine) window.soundEngine.playBossRoar();
      if (renderer) renderer.addScreenShake(15);
    } else if (this.health < 560 && this.phase < 2) {
      this.phase = 2;
    }

    // Facing player
    const targetPlayer = players[0] || null;
    if (targetPlayer) {
      this.facing = targetPlayer.x > this.x ? 1 : -1;
    }

    // Action attack cycles
    if (this.actionTimer <= 0) {
      const cooldown = this.phase === 3 ? 2.0 : 3.5;
      this.actionTimer = cooldown;
      this.chooseAttack(targetPlayer, combatSystem, renderer, enemies);
    }

    // Gravity & friction
    this.vy += 0.5;
    if (this.vy > 12) this.vy = 12;
    this.vx *= 0.85;

    this.x += this.vx;
    this.y += this.vy;

    // Platform collisions
    for (const plat of platforms) {
      if (plat.broken) continue;
      if (this.x + this.width > plat.x && this.x < plat.x + plat.width) {
        if (this.vy >= 0 && (this.y + this.height) >= plat.y && (this.y + this.height) <= plat.y + 24) {
          this.y = plat.y - this.height;
          this.vy = 0;
        }
      }
    }
  }

  chooseAttack(targetPlayer, combatSystem, renderer, enemies) {
    const attacks = ['slam', 'barrage'];
    if (this.phase >= 2) attacks.push('summon');
    const pick = attacks[Math.floor(Math.random() * attacks.length)];

    if (pick === 'slam') {
      this.state = 'slam';
      this.vy = -8; // Hop up before smashing down
      setTimeout(() => {
        if (!this.isAlive) return;
        this.vy = 16;
        combatSystem.createAttack(
          'boss',
          this.x - 120,
          this.y + this.height - 30,
          this.width + 240,
          40,
          45,
          this.facing * 10,
          -6,
          0.3,
          'slam'
        );
        if (window.soundEngine) window.soundEngine.playGroundSlam();
        if (renderer) {
          renderer.addScreenShake(14);
          renderer.addIceShards(this.x + this.width / 2, this.y + this.height, 20);
        }
      }, 400);

    } else if (pick === 'barrage') {
      this.state = 'barrage';
      if (window.soundEngine) window.soundEngine.playAttackSlash();
      // Shoot 3 ice shard projectiles in a spread
      const angles = [-0.25, 0, 0.25];
      angles.forEach(ang => {
        const speed = 7.5;
        const vx = this.facing * speed * Math.cos(ang);
        const vy = speed * Math.sin(ang);
        combatSystem.spawnProjectile(
          'boss',
          this.facing === 1 ? this.x + this.width : this.x,
          this.y + 40,
          vx,
          vy,
          10,
          25,
          '#67e8f9',
          800
        );
      });

    } else if (pick === 'summon' && enemies) {
      this.state = 'summon';
      if (window.soundEngine) window.soundEngine.playBossRoar();
      // Spawn 1 or 2 Snow Goblins
      if (enemies.length < 5) {
        enemies.push(new Enemy('goblin', this.x - 180, this.y, 140));
        if (renderer) renderer.addIceShards(this.x - 180, this.y, 10);
      }
    }
  }

  takeDamage(amount, knockbackX = 0, knockbackY = 0) {
    if (!this.isAlive || this.invulnerableTimer > 0) return;

    this.health = Math.max(0, this.health - amount);
    this.invulnerableTimer = 0.15;
    // Boss resists knockback heavily
    this.vx = knockbackX * 0.15;

    if (this.health <= 0) {
      this.die();
    }
  }

  die() {
    this.isAlive = false;
    if (window.soundEngine) window.soundEngine.playVictory();
    if (window.gameInstance) window.gameInstance.onEnemyKilled(this);
  }
}

window.Enemy = Enemy;
window.FrostGuardianBoss = FrostGuardianBoss;
