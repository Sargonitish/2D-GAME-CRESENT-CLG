/**
 * OPERATION: STEAL THE ACORN - Multiplayer Engine
 * Mode A: Local 2-Player Same-Keyboard Co-op.
 * Mode B: Online WebSocket Synchronization Client.
 */

class MultiplayerEngine {
  constructor() {
    this.mode = 'single'; // 'single', 'local', 'online'
    this.socket = null;
    this.roomCode = null;
    this.isHost = false;
    this.connected = false;

    // Local 2-Player Key States
    this.keysP1 = { left: false, right: false, jump: false, attack: false, special: false, switchChar: false };
    this.keysP2 = { left: false, right: false, jump: false, attack: false, special: false, switchChar: false };

    this.bindKeyboard();
  }

  bindKeyboard() {
    window.addEventListener('keydown', (e) => {
      // Prevent browser scrolling on arrow keys and space
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }

      // Player 1 Keys:
      // Jump: W (or ArrowUp in single player)
      // Attack: SPACEBAR (or J)
      // Special: K
      // Switch Hero: C
      if (e.code === 'KeyA') this.keysP1.left = true;
      if (e.code === 'KeyD') this.keysP1.right = true;
      if (e.code === 'KeyW' || (this.mode === 'single' && e.code === 'ArrowUp')) this.keysP1.jump = true;
      if (e.code === 'Space' || e.code === 'KeyJ') this.keysP1.attack = true;
      if (e.code === 'KeyK') this.keysP1.special = true;
      if (e.code === 'KeyC') this.keysP1.switchChar = true;

      // Player 2 Keys (Local 2P Co-op):
      if (e.code === 'ArrowLeft') this.keysP2.left = true;
      if (e.code === 'ArrowRight') this.keysP2.right = true;
      if (e.code === 'ArrowUp') this.keysP2.jump = true;
      if (e.code === 'ShiftRight' || e.code === 'Numpad0' || e.code === 'Numpad1') this.keysP2.attack = true;
      if (e.code === 'Enter' || e.code === 'Numpad2') this.keysP2.special = true;
      if (e.code === 'Slash' || e.code === 'Numpad3') this.keysP2.switchChar = true;
    });

    window.addEventListener('keyup', (e) => {
      // Player 1
      if (e.code === 'KeyA') this.keysP1.left = false;
      if (e.code === 'KeyD') this.keysP1.right = false;
      if (e.code === 'KeyW' || (this.mode === 'single' && e.code === 'ArrowUp')) this.keysP1.jump = false;
      if (e.code === 'Space' || e.code === 'KeyJ') this.keysP1.attack = false;
      if (e.code === 'KeyK') this.keysP1.special = false;
      if (e.code === 'KeyC') this.keysP1.switchChar = false;

      // Player 2
      if (e.code === 'ArrowLeft') this.keysP2.left = false;
      if (e.code === 'ArrowRight') this.keysP2.right = false;
      if (e.code === 'ArrowUp') this.keysP2.jump = false;
      if (e.code === 'ShiftRight' || e.code === 'Numpad0' || e.code === 'Numpad1') this.keysP2.attack = false;
      if (e.code === 'Enter' || e.code === 'Numpad2') this.keysP2.special = false;
      if (e.code === 'Slash' || e.code === 'Numpad3') this.keysP2.switchChar = false;
    });
  }

  // Update players from keyboard states in gameplay
  updateInputs(players, combatSystem, renderer, enemies) {
    if (!players || players.length === 0) return;

    // Player 1
    const p1 = players[0];
    if (p1 && p1.isAlive) {
      if (this.keysP1.left) p1.moveLeft();
      if (this.keysP1.right) p1.moveRight();
      if (this.keysP1.jump) p1.jump(renderer);
      if (this.keysP1.attack) { p1.attack(combatSystem, renderer); this.keysP1.attack = false; }
      if (this.keysP1.special) { p1.specialAbility(combatSystem, renderer, enemies); this.keysP1.special = false; }
      if (this.keysP1.switchChar) {
        p1.cycleCharacter(renderer);
        this.keysP1.switchChar = false;
      }
    }

    // Player 2 (Local Co-op)
    if (this.mode === 'local' && players.length > 1) {
      const p2 = players[1];
      if (p2 && p2.isAlive) {
        if (this.keysP2.left) p2.moveLeft();
        if (this.keysP2.right) p2.moveRight();
        if (this.keysP2.jump) p2.jump(renderer);
        if (this.keysP2.attack) { p2.attack(combatSystem, renderer); this.keysP2.attack = false; }
        if (this.keysP2.special) { p2.specialAbility(combatSystem, renderer, enemies); this.keysP2.special = false; }
        if (this.keysP2.switchChar) {
          p2.cycleCharacter(renderer);
          this.keysP2.switchChar = false;
        }
      }
    }
  }

  // ==========================================
  // ONLINE WEBSOCKET CO-OP CLIENT
  // ==========================================

  connectOnline(serverUrl = 'ws://localhost:3000', onStatus) {
    try {
      this.socket = new WebSocket(serverUrl);

      this.socket.onopen = () => {
        this.connected = true;
        if (onStatus) onStatus({ status: 'connected', msg: 'Connected to Team Marvelz server!' });
      };

      this.socket.onerror = () => {
        this.connected = false;
        if (onStatus) onStatus({
          status: 'error',
          msg: 'Node.js server not running. (Run: "node server/server.js" or play Local Co-op!)'
        });
      };

      this.socket.onclose = () => {
        this.connected = false;
        if (onStatus) onStatus({ status: 'closed', msg: 'Disconnected from server.' });
      };

      this.socket.onmessage = (event) => {
        try {
          const packet = JSON.parse(event.data);
          this.handlePacket(packet);
        } catch (e) {}
      };
    } catch (e) {
      if (onStatus) onStatus({ status: 'error', msg: 'WebSocket unavailable.' });
    }
  }

  createRoom(charId) {
    if (!this.socket || !this.connected) return;
    this.socket.send(JSON.stringify({ type: 'CREATE_ROOM', charId }));
  }

  joinRoom(roomCode, charId) {
    if (!this.socket || !this.connected) return;
    this.socket.send(JSON.stringify({ type: 'JOIN_ROOM', roomCode, charId }));
  }

  sendPlayerState(player) {
    if (!this.socket || !this.connected || !this.roomCode) return;
    this.socket.send(JSON.stringify({
      type: 'PLAYER_SYNC',
      roomCode: this.roomCode,
      x: Math.round(player.x),
      y: Math.round(player.y),
      vx: Math.round(player.vx),
      vy: Math.round(player.vy),
      facing: player.facing,
      health: player.health,
      state: player.state
    }));
  }

  handlePacket(packet) {
    if (packet.type === 'ROOM_CREATED') {
      this.roomCode = packet.roomCode;
      this.isHost = true;
    } else if (packet.type === 'ROOM_JOINED') {
      this.roomCode = packet.roomCode;
      this.isHost = false;
    }
  }
}

window.multiplayerEngine = new MultiplayerEngine();
