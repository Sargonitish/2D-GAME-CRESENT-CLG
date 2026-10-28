/**
 * OPERATION: STEAL THE ACORN - Character Roster & Definitions
 * Contains stats, abilities, and balance profiles for Chikku, Bumbo, and Frost Tiger.
 */

const CHARACTERS = {
  chikku: {
    id: 'chikku',
    name: 'CHIKKU',
    title: 'The Arctic Squirrel',
    role: 'Agile Explorer',
    description: 'Small, nimble, and fearless! Equipped with high jumps, double jumping, and high-speed escape dashes.',
    portrait: '🐿️',
    color: '#f97316',
    accentColor: '#38bdf8', // Blue winter scarf
    width: 32,
    height: 44,
    stats: {
      health: 100,
      speed: 6.5,
      jumpForce: -13.2,
      canDoubleJump: true,
      attackDamage: 28,
      defense: 1.0 // Normal damage multiplier
    },
    special: {
      name: 'ACORN DASH',
      description: 'Dash forward with extreme speed, crossing gaps and damaging enemies in your path.',
      cooldown: 3.5, // seconds
      duration: 0.3,
      damage: 55,
      sound: 'playAcornDash'
    }
  },

  bumbo: {
    id: 'bumbo',
    name: 'BUMBO',
    title: 'The Woolly Mammoth',
    role: 'Heavy Tank',
    description: 'A colossal powerhouse with immense health and armor. Can suck enemies closer before crushing them!',
    portrait: '🦣',
    color: '#854d0e',
    accentColor: '#fef08a', // Ivory tusks
    width: 66,
    height: 60,
    stats: {
      health: 200,
      speed: 4.2,
      jumpForce: -10.5,
      canDoubleJump: false,
      attackDamage: 48,
      defense: 0.75 // 25% damage reduction
    },
    special: {
      name: 'FROST PULL',
      description: 'Draw nearby ordinary enemies into your position, then unleash a massive ground slam shockwave!',
      cooldown: 5.5,
      duration: 0.5,
      damage: 85,
      sound: 'playGroundSlam'
    }
  },

  tiger: {
    id: 'tiger',
    name: 'FROST TIGER',
    title: 'Saber-Toothed Tiger',
    role: 'Fast Attacker',
    description: 'A ferocious Arctic predator featuring razor claws, explosive sprint speed, and rapid combo strikes.',
    portrait: '🐅',
    color: '#ea580c',
    accentColor: '#ffffff', // White underbelly & ice stripes
    width: 48,
    height: 46,
    stats: {
      health: 130,
      speed: 7.2,
      jumpForce: -12.0,
      canDoubleJump: false,
      attackDamage: 38,
      defense: 0.9
    },
    special: {
      name: 'ICE FURY',
      description: 'Leap forward in a multi-hit fury, clawing through enemy lines with icy precision.',
      cooldown: 4.5,
      duration: 0.45,
      damage: 90,
      sound: 'playIceFury'
    }
  }
};

window.CHARACTERS = CHARACTERS;
