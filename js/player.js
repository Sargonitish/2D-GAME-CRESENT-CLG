/**
 * OPERATION: STEAL THE ACORN - Player Entity
 * Handles input translation, physics, character-specific moves, combat, and local multiplayer.
 */

class Player {
  constructor(playerId = 1, charId = 'chikku', spawnX = 100, spawnY = 500) {
    this.playerId = playerId;
    this.charId = charId;
    this.charData = window.CHARACTERS[charId] || window.CHARACTERS.chikku;

    this.width = this.charData.width;
    this.height = this.charData.height;
    this.x = spawnX;
    this.y = spawnY;
    this.vx = 0;
    this.vy = 0;
    this.facing = 1; // 1 right, -1 left

    // Health & Lives
    this.maxHealth = this.charData.stats.health;
    this.health = this.maxHealth;
    this.lives = 3;
    this.isAlive = true;
    this.invulnerableTimer = 0;

    // Movement & Jump
    this.isGrounded = false;
    this.canDoubleJump = this.charData.stats.canDoubleJump;
    this.hasDoubleJumped = false;
    this.currentGroundType = 'snow';

    // Combat & Cooldowns
    this.attackCooldown = 0;
    this.specialCooldown = 0;
    this.isAttacking = false;
    this.attackTimer = 0;
    this.isDashing = false;
    this.dashTimer = 0;

    // Animation state
    this.state = 'idle'; // 'idle', 'run', 'jump', 'fall', 'attack', 'special', 'hurt'
    this.animTimer = 0;
    this.spawnPoint = { x: spawnX, y: spawnY };
  }

  setSpawn(x, y) {
    this.spawnPoint = { x, y };
  }

  update(dt, platforms, combatSystem, renderer, enemies) {
    if (!this.isAlive) return;

    this.animTimer += dt;

    // Cooldown decrements
    if (this.attackCooldown > 0) this.attackCooldown -= dt;
    if (this.specialCooldown > 0) this.specialCooldown -= dt;
    if (this.invulnerableTimer > 0) this.invulnerableTimer -= dt;

    // Attack state timer
    if (this.isAttacking) {
      this.attackTimer -= dt;
      if (this.attackTimer <= 0) {
        this.isAttacking = false;
      }
    }

    // Special dash state timer (Chikku / Tiger)
    if (this.isDashing) {
      this.dashTimer -= dt;
      this.vy = 0; // suspend gravity during dash
      if (renderer) renderer.addSparkles(this.x + this.width / 2, this.y + this.height / 2, 4, this.charData.accentColor);
      if (this.dashTimer <= 0) {
        this.isDashing = false;
      }
    } else {
      // Realistic jump gravity with apex hang-time
      const gravity = Math.abs(this.vy) < 2.0 ? 0.38 : 0.62;
      this.vy += gravity;
      if (this.vy > 14) this.vy = 14;
    }

    // Determine friction based on ground type
    const isIce = this.currentGroundType === 'ice';
    const friction = isIce ? 0.985 : 0.82;
    this.vx *= friction;

    // Apply movement
    this.x += this.vx;
    this.y += this.vy;

    // Platform collisions
    this.resolvePlatformCollisions(platforms, renderer);

    // Update animation state string
    if (this.isDashing || (this.isAttacking && this.charId === 'tiger')) {
      this.state = 'special';
    } else if (this.isAttacking) {
      this.state = 'attack';
    } else if (!this.isGrounded) {
      this.state = this.vy < 0 ? 'jump' : 'fall';
    } else if (Math.abs(this.vx) > 0.8) {
      this.state = 'run';
    } else {
      this.state = 'idle';
    }
  }

  switchCharacter(newCharId, renderer) {
    if (!this.isAlive || this.charId === newCharId) return;
    const hpRatio = this.health / this.maxHealth;

    this.charId = newCharId;
    this.charData = window.CHARACTERS[newCharId] || window.CHARACTERS.chikku;
    this.width = this.charData.width;
    this.height = this.charData.height;
    this.maxHealth = this.charData.stats.health;
    this.health = Math.max(1, Math.round(this.maxHealth * hpRatio));
    this.canDoubleJump = this.charData.stats.canDoubleJump;

    if (window.soundEngine) window.soundEngine.playCharacterSelect();
    if (renderer) {
      renderer.addSparkles(this.x + this.width / 2, this.y + this.height / 2, 16, this.charData.accentColor);
      renderer.addDustPuff(this.x + this.width / 2, this.y + this.height, 8);
    }
  }

  cycleCharacter(renderer) {
    const roster = ['chikku', 'bumbo', 'tiger'];
    const currentIdx = roster.indexOf(this.charId);
    const nextIdx = (currentIdx + 1) % roster.length;
    this.switchCharacter(roster[nextIdx], renderer);
  }

  moveLeft() {
    if (!this.isAlive || this.isDashing) return;
    const accel = this.currentGroundType === 'ice' ? 0.38 : 0.95;
    this.vx -= accel;
    this.facing = -1;
    const maxSpeed = this.charData.stats.speed;
    if (this.vx < -maxSpeed) this.vx = -maxSpeed;
  }

  moveRight() {
    if (!this.isAlive || this.isDashing) return;
    const accel = this.currentGroundType === 'ice' ? 0.38 : 0.95;
    this.vx += accel;
    this.facing = 1;
    const maxSpeed = this.charData.stats.speed;
    if (this.vx > maxSpeed) this.vx = maxSpeed;
  }

  jump(renderer) {
    if (!this.isAlive || this.isDashing) return;

    if (this.isGrounded) {
      this.vy = this.charData.stats.jumpForce;
      this.isGrounded = false;
      this.hasDoubleJumped = false;
      if (window.soundEngine) window.soundEngine.playJump();
      if (renderer) renderer.addDustPuff(this.x + this.width / 2, this.y + this.height, 5);
    } else if (this.canDoubleJump && !this.hasDoubleJumped) {
      // Chikku double jump!
      this.vy = this.charData.stats.jumpForce * 0.9;
      this.hasDoubleJumped = true;
      if (window.soundEngine) window.soundEngine.playJump();
      if (renderer) renderer.addSparkles(this.x + this.width / 2, this.y + this.height, 8, '#f59e0b');
    }
  }

  attack(combatSystem, renderer) {
    if (!this.isAlive || this.attackCooldown > 0 || this.isDashing) return;

    this.isAttacking = true;
    this.attackTimer = 0.24;
    this.attackCooldown = 0.28;

    // Realistic attack forward step/lunge
    this.vx += this.facing * (this.charId === 'tiger' ? 4.5 : 3.0);

    // Wide, generous 90px attack arc so hitting enemies is intuitive and effortless
    const atkWidth = this.charId === 'bumbo' ? 100 : 90;
    const atkHeight = this.height + 15;
    const atkX = this.facing === 1 ? this.x + 10 : this.x - atkWidth + 10;
    const atkY = this.y - 8;

    combatSystem.createAttack(
      `player${this.playerId}`,
      atkX,
      atkY,
      atkWidth,
      atkHeight,
      this.charData.stats.attackDamage,
      this.facing * 7,
      -3.5,
      0.18,
      'melee'
    );

    if (window.soundEngine) window.soundEngine.playAttackSlash();
    if (renderer) renderer.addDustPuff(this.x + this.width / 2, this.y + this.height, 4);
  }

  specialAbility(combatSystem, renderer, enemies) {
    if (!this.isAlive || this.specialCooldown > 0) return;

    const spec = this.charData.special;
    this.specialCooldown = spec.cooldown;

    if (this.charId === 'chikku') {
      // ACORN DASH: forward burst with high speed and damage
      this.isDashing = true;
      this.dashTimer = spec.duration;
      this.vx = this.facing * 16;
      this.invulnerableTimer = spec.duration;

      combatSystem.createAttack(
        `player${this.playerId}`,
        this.x,
        this.y,
        this.width + 40,
        this.height,
        spec.damage,
        this.facing * 8,
        -4,
        spec.duration,
        'special'
      );

      if (window.soundEngine) window.soundEngine.playAcornDash();
      if (renderer) renderer.addScreenShake(6);

    } else if (this.charId === 'bumbo') {
      // FROST PULL: Vacuum enemies within 280px + massive slam
      this.isAttacking = true;
      this.attackTimer = spec.duration;

      if (enemies) {
        for (const enemy of enemies) {
          if (!enemy.isAlive) continue;
          const dist = Math.hypot((enemy.x - this.x), (enemy.y - this.y));
          if (dist < 280) {
            // Pull toward mammoth
            const pullDir = enemy.x > this.x ? -1 : 1;
            enemy.vx += pullDir * 9;
            enemy.vy = -4;
          }
        }
      }

      // Ground slam earthquake hitbox
      combatSystem.createAttack(
        `player${this.playerId}`,
        this.x - 70,
        this.y + 10,
        this.width + 140,
        this.height,
        spec.damage,
        this.facing * 9,
        -6,
        0.25,
        'slam'
      );

      if (window.soundEngine) window.soundEngine.playGroundSlam();
      if (renderer) {
        renderer.addScreenShake(12);
        renderer.addIceShards(this.x + this.width / 2, this.y + this.height, 12);
      }

    } else if (this.charId === 'tiger') {
      // ICE FURY: Multi-hit leaping claw flurry
      this.isDashing = true;
      this.dashTimer = spec.duration;
      this.vx = this.facing * 12;

      combatSystem.createAttack(
        `player${this.playerId}`,
        this.facing === 1 ? this.x : this.x - 60,
        this.y - 10,
        this.width + 60,
        this.height + 20,
        spec.damage,
        this.facing * 7,
        -4,
        spec.duration,
        'fury'
      );

      if (window.soundEngine) window.soundEngine.playIceFury();
      if (renderer) renderer.addScreenShake(7);
    }
  }

  takeDamage(amount, knockbackX = 0, knockbackY = 0) {
    if (!this.isAlive || this.invulnerableTimer > 0) return;

    const reducedAmount = Math.floor(amount * this.charData.stats.defense);
    this.health = Math.max(0, this.health - reducedAmount);
    this.invulnerableTimer = 1.2; // 1.2s i-frames
    this.vx = knockbackX;
    this.vy = knockbackY;

    if (window.soundEngine) window.soundEngine.playEnemyHit();

    if (this.health <= 0) {
      this.die();
    }
  }

  die() {
    this.isAlive = false;
    this.lives = Math.max(0, this.lives - 1);
    if (window.soundEngine) window.soundEngine.playDefeat();

    // Auto respawn if lives remain
    setTimeout(() => {
      if (this.lives > 0) {
        this.respawn();
      }
    }, 1200);
  }

  respawn() {
    this.x = this.spawnPoint.x;
    this.y = this.spawnPoint.y;
    this.vx = 0;
    this.vy = 0;
    this.health = this.maxHealth;
    this.isAlive = true;
    this.invulnerableTimer = 2.0;
  }

  resolvePlatformCollisions(platforms, renderer) {
    let groundedThisFrame = false;
    this.currentGroundType = 'snow';

    for (const plat of platforms) {
      if (plat.broken) continue;

      if (this.x + this.width > plat.x && this.x < plat.x + plat.width) {
        // Landing on top
        if (this.vy >= 0 && (this.y + this.height) >= plat.y && (this.y + this.height) <= plat.y + 18) {
          this.y = plat.y - this.height;
          this.vy = 0;
          this.isGrounded = true;
          this.hasDoubleJumped = false;
          groundedThisFrame = true;
          this.currentGroundType = plat.type;

          // Cracking ice platform
          if (plat.type === 'crack') {
            if (!plat.steppedOn) {
              plat.steppedOn = true;
              if (window.soundEngine) window.soundEngine.playFootstep('ice');
              if (renderer) renderer.addIceShards(this.x + this.width / 2, plat.y, 6);
            }
          }
        }
      }
    }

    if (!groundedThisFrame) {
      this.isGrounded = false;
    }
  }
}

window.Player = Player;
