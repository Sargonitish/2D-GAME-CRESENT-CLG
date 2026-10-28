# OPERATION: STEAL THE ACORN 🌰❄️
## Presented by TEAM MARVELZ
### 2D Arctic Action Combat & Multiplayer Adventure Game

A complete, polished, playable browser game built with HTML5, CSS3, and vanilla JavaScript. Runs locally on macOS / MacBook using VS Code and Live Server with zero external frontend dependencies.

---

## 🎮 Game Concept & Story
The player ventures into the frozen Arctic wilderness of **The Frozen Frontier**! Dangerous enemies roam the snow-covered mountains, ancient ice caves hide rare golden acorns, and atop **The Acorn Fortress** lies the colossal **Frost Guardian** boss guarding the legendary Giant Acorn.

Choose your hero, fight through 5 action-packed levels in Single Player or **Local 2-Player Co-op**, defeat enemy waves, unleash character superpowers, and take down the final boss!

---

## 🐾 Playable Heroes & Abilities

| Hero | Role | Stats | Signature Superpower |
| :--- | :--- | :--- | :--- |
| **CHIKKU** (Squirrel) | Agile Explorer | Speed: High, Jump: Double Jump, HP: 100 | **ACORN DASH**: Ultra-fast invulnerable burst forward that damages enemies in your path. |
| **BUMBO** (Mammoth) | Heavy Tank | Armor: -25% Dmg, HP: 200, Speed: Slow | **FROST PULL**: Draws nearby enemies toward the mammoth, followed by a massive ground slam earthquake. |
| **FROST TIGER** (Saber-Tooth) | Fast Attacker | Speed: Ultra-fast, HP: 130, Damage: High | **ICE FURY**: Multi-hit forward leaping claw combo that shreds through enemy defenses. |

---

## 🕹️ Controls Guide

### Single Player & Player 1 (Local Co-op)
- **Move Left / Right**: `A` / `D` *(Realistic acceleration & weighted friction deceleration)*
- **Jump**: `W` or `▲ Up Arrow` *(Includes jump apex hang-time! Chikku can double-jump)*
- **Attack (Primary Melee Strike)**: `SPACEBAR` *(Lunges forward with a wide 90px hit arc to easily strike enemies)*
- **Swap Hero (Mid-Game Hot-Swap)**: `C` *(Instant dynamic cycling: Chikku ➔ Bumbo ➔ Frost Tiger with proportional health preservation)*
- **Special Ability**: `K` *(Unleashes character signature superpower: Dash / Slam / Frost Fury)*
- **Pause / Resume**: `Escape`

### Player 2 (Local 2-Player Co-op on Same Keyboard)
- **Move Left / Right**: `◀` / `▶` Arrow Keys
- **Jump**: `▲` Up Arrow
- **Normal Attack**: `Right Shift` or `Numpad 1`
- **Special Ability**: `Enter` or `Numpad 2`

---

## 🎯 Scoring & Kill-Based Acorn System
- Static ground acorn pickups have been removed in favor of high-energy combat rewards!
- Defeating enemies directly drops acorns, adds to your score, and displays floating hit text:
  - **Snow Goblin**: +100 PTS + 1 Acorn
  - **Ice Wolf**: +150 PTS + 2 Acorns
  - **Ice Roller**: +200 PTS + 2 Acorns
  - **Frost Guardian Brute**: +300 PTS + 3 Acorns
  - **The Frost Guardian Boss**: +2,000 PTS + 10 Acorns!

---

## 🗺️ The Frozen Frontier — 5 Action Stages
1. **Stage 1: Snowflake Forest** — Master movement, combat attacks, and defeat the Snow Goblins.
2. **Stage 2: Slippery Ice Valley** — Navigate low-friction ice slabs, cracking ice bridges, and Ice Wolves.
3. **Stage 3: Frozen Crystal Caves** — Dark cavern filled with glowing crystals, hanging stalactites, and Frozen Guardians.
4. **Stage 4: Mammoth Mountain** — Steep snowy inclines and elite guardian brutes.
5. **Stage 5: The Acorn Fortress** — The final stronghold! Battle through enemy waves to face **THE FROST GUARDIAN** final boss.

---

## 👥 Multiplayer System

### Mode A: Local 2-Player Co-op (Immediate / No Server Required)
1. On the Home Page, click **MULTIPLAYER**.
2. Click **START LOCAL 2P**.
3. Player 1 selects a character, then Player 2 selects a character.
4. Both players spawn together in the levels, fight cooperatively, share camera tracking, and defeat enemies side-by-side!

### Mode B: Online Multiplayer (Node.js WebSocket Server)
1. Open a terminal in the `server/` directory:
   ```bash
   cd server
   npm install
   node server.js
   ```
2. The server will start on port `3000`.
3. In the game's Multiplayer Lobby, click **CREATE ONLINE ROOM** to generate a 4-character room code (e.g., `ACORN-X92F`).
4. On another computer or browser window, enter the room code and click **JOIN**.

---

## 🚀 How to Run the Game in VS Code on macOS (MacBook)

### Option 1: Using VS Code Live Server (Recommended)
1. Open **VS Code** on your MacBook.
2. Go to **File > Open Folder...** and select `game`.
3. Install the **Live Server** extension (by Ritwick Dey) if not already installed.
4. Right-click `index.html` in the explorer and select **"Open with Live Server"**.
5. The game will automatically open in your default browser at `http://127.0.0.1:5500`.

### Option 2: Using Built-in Python Server
1. Open Terminal in macOS or in VS Code (``Ctrl + ` ``).
2. Run:
   ```bash
   python3 -m http.server 8000
   ```
3. Open `http://localhost:8000` in Safari or Google Chrome.

### Option 3: Direct Browser Launch
Because the game uses Canvas 2D and Web Audio API synthesis, you can also double-click `index.html` directly to play immediately offline!

---

## 📁 Project Structure
```
game/
├── index.html              # Main HTML5 game container and all UI screen layers
├── style.css               # Frosted Arctic UI, character cards, HUD, and responsive styling
├── js/
│   ├── storage.js          # Persistent progression and settings storage
│   ├── audio.js            # Procedural Web Audio API OST and combat SFX
│   ├── characters.js       # Chikku, Bumbo, and Frost Tiger stats & abilities
│   ├── combat.js           # Hitbox collision, damage calculations, and floating text
│   ├── player.js           # Player physics, movement, and ability controller
│   ├── enemies.js          # Enemy AI (Goblins, Wolves, Rollers, Guardians) & Final Boss
│   ├── levels.js           # Layouts and spawns for all 5 Arctic stages
│   ├── map.js              # "The Frozen Frontier" interactive world map
│   ├── renderer.js         # Canvas 2D engine with 3-layer parallax and vector sprites
│   ├── multiplayer.js      # Local 2P keyboard routing & WebSocket sync client
│   ├── ui.js               # Screen manager, character selection, and HUD bars
│   ├── game.js             # Core game loop and collision resolution
│   └── main.js             # Application bootstrapper and intro sequencer
├── assets/
│   └── images/
│       ├── menu_background.jpg     # Home page visual reference art
│       └── characters_combat.jpg   # Action combat and characters reference art
├── server/
│   ├── package.json        # WebSocket server dependencies (ws)
│   └── server.js           # Standalone online room server
└── README.md               # Beginner-friendly setup guide
```
