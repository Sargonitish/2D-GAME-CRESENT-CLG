/**
 * OPERATION: STEAL THE ACORN - Level Data & Layouts
 * 5 Rich Arctic stages complete with platforms, enemy spawns, acorns, and boss arenas.
 */

const LEVELS = [
  {
    id: 1,
    name: "Snowflake Forest",
    subtitle: "Learn combat, collect acorns, and clear out the Snow Goblins.",
    width: 2400,
    height: 720,
    spawnP1: { x: 80, y: 520 },
    spawnP2: { x: 140, y: 520 },
    exitPortal: { x: 2200, y: 500, width: 80, height: 100 },
    platforms: [
      { x: 0, y: 600, width: 2400, height: 120, type: 'snow' },
      { x: 320, y: 470, width: 190, height: 26, type: 'snow' },
      { x: 600, y: 390, width: 210, height: 26, type: 'ice' },
      { x: 900, y: 460, width: 180, height: 26, type: 'snow' },
      { x: 1180, y: 380, width: 240, height: 26, type: 'ice' },
      { x: 1520, y: 470, width: 200, height: 26, type: 'snow' },
      { x: 1820, y: 390, width: 190, height: 26, type: 'ice' }
    ],
    enemies: [
      { type: 'goblin', x: 650, y: 340, patrolDist: 120 },
      { type: 'goblin', x: 950, y: 410, patrolDist: 100 },
      { type: 'goblin', x: 1250, y: 330, patrolDist: 150 },
      { type: 'wolf', x: 1600, y: 550, patrolDist: 200 }
    ],
    acorns: [],
    hasBoss: false
  },

  {
    id: 2,
    name: "Slippery Ice Valley",
    subtitle: "Navigate low-friction ice slabs, cracking ice bridges, and Ice Wolves.",
    width: 2600,
    height: 720,
    spawnP1: { x: 80, y: 520 },
    spawnP2: { x: 140, y: 520 },
    exitPortal: { x: 2420, y: 500, width: 80, height: 100 },
    platforms: [
      { x: 0, y: 600, width: 500, height: 120, type: 'snow' },
      { x: 550, y: 600, width: 650, height: 120, type: 'ice' },
      { x: 1250, y: 600, width: 300, height: 120, type: 'crack', breakTimer: 0, broken: false },
      { x: 1600, y: 600, width: 1000, height: 120, type: 'snow' },
      { x: 280, y: 470, width: 180, height: 26, type: 'snow' },
      { x: 540, y: 390, width: 220, height: 26, type: 'ice' },
      { x: 840, y: 310, width: 180, height: 26, type: 'crack', breakTimer: 0, broken: false },
      { x: 1100, y: 420, width: 200, height: 26, type: 'ice' },
      { x: 1380, y: 340, width: 190, height: 26, type: 'snow' },
      { x: 1700, y: 460, width: 210, height: 26, type: 'ice' },
      { x: 2020, y: 380, width: 220, height: 26, type: 'snow' }
    ],
    enemies: [
      { type: 'wolf', x: 620, y: 550, patrolDist: 250 },
      { type: 'wolf', x: 1150, y: 370, patrolDist: 120 },
      { type: 'roller', x: 1750, y: 550, patrolDist: 220 },
      { type: 'goblin', x: 2080, y: 330, patrolDist: 140 }
    ],
    acorns: [],
    hasBoss: false
  },

  {
    id: 3,
    name: "Frozen Crystal Caves",
    subtitle: "Dark caverns with glowing cyan crystals, fragile bridges, and Guardians.",
    width: 2800,
    height: 720,
    spawnP1: { x: 80, y: 520 },
    spawnP2: { x: 140, y: 520 },
    exitPortal: { x: 2600, y: 500, width: 80, height: 100 },
    platforms: [
      { x: 0, y: 600, width: 2800, height: 120, type: 'snow' },
      { x: 260, y: 480, width: 170, height: 26, type: 'ice' },
      { x: 500, y: 390, width: 200, height: 26, type: 'snow' },
      { x: 760, y: 310, width: 220, height: 26, type: 'crack', breakTimer: 0, broken: false },
      { x: 1060, y: 420, width: 190, height: 26, type: 'ice' },
      { x: 1320, y: 330, width: 200, height: 26, type: 'snow' },
      { x: 1600, y: 440, width: 180, height: 26, type: 'crack', breakTimer: 0, broken: false },
      { x: 1860, y: 350, width: 220, height: 26, type: 'ice' },
      { x: 2160, y: 450, width: 200, height: 26, type: 'snow' }
    ],
    enemies: [
      { type: 'goblin', x: 550, y: 340, patrolDist: 110 },
      { type: 'roller', x: 1100, y: 370, patrolDist: 140 },
      { type: 'guardian', x: 1400, y: 530, patrolDist: 180 },
      { type: 'wolf', x: 1900, y: 300, patrolDist: 150 },
      { type: 'guardian', x: 2200, y: 530, patrolDist: 160 }
    ],
    acorns: [],
    hasBoss: false
  },

  {
    id: 4,
    name: "Mammoth Mountain",
    subtitle: "Climb the steep glacial peaks and defeat the elite mountain guardians.",
    width: 3000,
    height: 720,
    spawnP1: { x: 80, y: 520 },
    spawnP2: { x: 140, y: 520 },
    exitPortal: { x: 2800, y: 500, width: 80, height: 100 },
    platforms: [
      { x: 0, y: 600, width: 3000, height: 120, type: 'snow' },
      { x: 300, y: 470, width: 190, height: 26, type: 'ice' },
      { x: 580, y: 390, width: 210, height: 26, type: 'snow' },
      { x: 880, y: 320, width: 220, height: 26, type: 'ice' },
      { x: 1180, y: 430, width: 180, height: 26, type: 'crack', breakTimer: 0, broken: false },
      { x: 1450, y: 340, width: 210, height: 26, type: 'ice' },
      { x: 1740, y: 450, width: 190, height: 26, type: 'snow' },
      { x: 2020, y: 360, width: 220, height: 26, type: 'ice' },
      { x: 2340, y: 460, width: 200, height: 26, type: 'snow' }
    ],
    enemies: [
      { type: 'wolf', x: 620, y: 340, patrolDist: 140 },
      { type: 'guardian', x: 930, y: 250, patrolDist: 130 },
      { type: 'roller', x: 1500, y: 290, patrolDist: 150 },
      { type: 'guardian', x: 1800, y: 530, patrolDist: 180 },
      { type: 'wolf', x: 2100, y: 310, patrolDist: 160 },
      { type: 'guardian', x: 2400, y: 530, patrolDist: 180 }
    ],
    acorns: [],
    hasBoss: false
  },

  {
    id: 5,
    name: "The Acorn Fortress",
    subtitle: "Infiltrate the final chamber and defeat THE FROST GUARDIAN!",
    width: 3200,
    height: 720,
    spawnP1: { x: 80, y: 520 },
    spawnP2: { x: 140, y: 520 },
    exitPortal: null, // Victory triggers on defeating Boss
    platforms: [
      { x: 0, y: 600, width: 3200, height: 120, type: 'snow' },
      { x: 260, y: 470, width: 180, height: 26, type: 'snow' },
      { x: 520, y: 390, width: 200, height: 26, type: 'ice' },
      { x: 800, y: 310, width: 190, height: 26, type: 'crack', breakTimer: 0, broken: false },
      { x: 1080, y: 420, width: 220, height: 26, type: 'ice' },
      { x: 1380, y: 330, width: 200, height: 26, type: 'snow' },
      // Boss arena elevated battlements
      { x: 1750, y: 480, width: 180, height: 26, type: 'snow' },
      { x: 2020, y: 390, width: 220, height: 26, type: 'ice' },
      { x: 2320, y: 480, width: 180, height: 26, type: 'snow' },
      { x: 2600, y: 410, width: 240, height: 26, type: 'ice' }
    ],
    enemies: [
      { type: 'goblin', x: 560, y: 340, patrolDist: 120 },
      { type: 'wolf', x: 1120, y: 370, patrolDist: 140 },
      { type: 'guardian', x: 1420, y: 530, patrolDist: 160 }
    ],
    acorns: [],
    hasBoss: true,
    bossSpawn: { x: 2450, y: 460 },
    giantAcorn: { x: 2850, y: 540, width: 50, height: 60 }
  }
];

window.LEVELS = LEVELS;
