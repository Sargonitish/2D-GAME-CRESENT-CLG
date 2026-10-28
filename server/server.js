/**
 * TEAM MARVELZ - OPERATION: STEAL THE ACORN
 * Online Co-op WebSocket Server
 * Handles room matchmaking and peer-to-peer packet broadcasting.
 */

const WebSocket = require('ws');

const PORT = process.env.PORT || 3000;
const wss = new WebSocket.Server({ port: PORT });

// Active game rooms: roomCode -> { players: [ws1, ws2], createdAt: timestamp }
const rooms = new Map();

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `ACORN-${code}`;
}

wss.on('connection', (ws) => {
  ws.roomCode = null;
  ws.playerIndex = null;

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);

      if (data.type === 'CREATE_ROOM') {
        const roomCode = generateRoomCode();
        rooms.set(roomCode, { players: [ws], charIdP1: data.charId });
        ws.roomCode = roomCode;
        ws.playerIndex = 1;

        ws.send(JSON.stringify({
          type: 'ROOM_CREATED',
          roomCode: roomCode,
          playerIndex: 1
        }));
        console.log(`[Room Created] ${roomCode} by Player 1`);

      } else if (data.type === 'JOIN_ROOM') {
        const room = rooms.get(data.roomCode);
        if (!room) {
          ws.send(JSON.stringify({ type: 'ERROR', message: 'Room not found.' }));
          return;
        }

        if (room.players.length >= 2) {
          ws.send(JSON.stringify({ type: 'ERROR', message: 'Room is already full.' }));
          return;
        }

        room.players.push(ws);
        room.charIdP2 = data.charId;
        ws.roomCode = data.roomCode;
        ws.playerIndex = 2;

        // Notify joiner
        ws.send(JSON.stringify({
          type: 'ROOM_JOINED',
          roomCode: data.roomCode,
          playerIndex: 2,
          charIdP1: room.charIdP1
        }));

        // Notify host
        room.players[0].send(JSON.stringify({
          type: 'PLAYER_JOINED',
          charIdP2: data.charId
        }));
        console.log(`[Player 2 Joined] Room ${data.roomCode}`);

      } else if (data.type === 'PLAYER_SYNC') {
        const room = rooms.get(data.roomCode);
        if (room) {
          // Broadcast position/combat to the other player in the room
          for (const peer of room.players) {
            if (peer !== ws && peer.readyState === WebSocket.OPEN) {
              peer.send(message);
            }
          }
        }
      }
    } catch (err) {
      console.error('Packet parsing error:', err);
    }
  });

  ws.on('close', () => {
    if (ws.roomCode && rooms.has(ws.roomCode)) {
      const room = rooms.get(ws.roomCode);
      room.players = room.players.filter(p => p !== ws);

      // Notify remaining player
      if (room.players.length > 0) {
        room.players[0].send(JSON.stringify({ type: 'PLAYER_LEFT', message: 'Teammate disconnected.' }));
      } else {
        rooms.delete(ws.roomCode);
        console.log(`[Room Destroyed] ${ws.roomCode}`);
      }
    }
  });
});

console.log(`===============================================`);
console.log(` TEAM MARVELZ - OPERATION: STEAL THE ACORN`);
console.log(` WebSocket Multiplayer Server running on port ${PORT}`);
console.log(`===============================================`);
