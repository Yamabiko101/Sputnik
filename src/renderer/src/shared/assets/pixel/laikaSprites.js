export const LAIKA_SIZE = 24

export const LAIKA_PALETTE = {
  T: 'rgba(0, 0, 0, 0)',
  O: '#221c18',
  F: '#ead7b2',
  S: '#b58f68',
  P: '#d69ca1',
  R: '#c83a32',
  E: '#1c1816',
  H: '#fff2d8',
  C: '#d9e1dc',
  D: '#8bae66',
  V: 'rgba(176, 211, 218, 0.72)',
  A: '#9fd9c0',
  M: '#e7b7d6',
  G: '#f4b95e',
  W: '#f6e7c8'
}

const SKIN_ACCENTS = {
  classic: { scarf: 'R', body: 'F', trim: 'R' },
  cosmonaut: { scarf: 'D', body: 'C', trim: 'D' },
  aurora: { scarf: 'A', body: 'F', trim: 'M' },
  gold: { scarf: 'G', body: 'F', trim: 'G' },
  'gold-star': { scarf: 'G', body: 'F', trim: 'G' }
}

const MOOD_TIMINGS = {
  idle: 420,
  focus: 320,
  happy: 220,
  sleepy: 520,
  celebrating: 160,
  worried: 240
}

function emptyGrid() {
  return Array.from({ length: LAIKA_SIZE }, () => Array(LAIKA_SIZE).fill('T'))
}

function pixel(grid, x, y, token) {
  if (x < 0 || y < 0 || x >= LAIKA_SIZE || y >= LAIKA_SIZE) return
  grid[y][x] = token
}

function rect(grid, x, y, width, height, token) {
  for (let row = y; row < y + height; row += 1) {
    for (let col = x; col < x + width; col += 1) {
      pixel(grid, col, row, token)
    }
  }
}

function drawRows(grid, rows, offsetX, offsetY, token) {
  rows.forEach(([y, start, width]) => {
    rect(grid, offsetX + start, offsetY + y, width, 1, token)
  })
}

function drawBody(grid, skin, mood, frame) {
  const accent = getSkinAccent(skin)
  const y = mood === 'sleepy' ? 1 : mood === 'celebrating' && frame === 1 ? -1 : 0
  const body = mood === 'focus' && skin === 'cosmonaut' ? 'C' : accent.body

  drawRows(grid, [
    [0, 8, 8],
    [1, 7, 10],
    [2, 6, 12],
    [3, 6, 12],
    [4, 7, 10],
    [5, 8, 8],
    [6, 8, 3],
    [6, 14, 3],
    [7, 8, 3],
    [7, 14, 3],
    [8, 7, 4],
    [8, 14, 4]
  ], 0, 13 + y, 'O')
  drawRows(grid, [
    [1, 8, 8],
    [2, 7, 10],
    [3, 7, 10],
    [4, 8, 8],
    [5, 9, 6],
    [6, 9, 1],
    [6, 15, 1],
    [7, 9, 1],
    [7, 15, 1]
  ], 0, 13 + y, body)
  rect(grid, 8, 21 + y, 3, 1, 'S')
  rect(grid, 14, 21 + y, 3, 1, 'S')
  pixel(grid, 12, 18 + y, 'S')

  const tailUp = mood === 'happy' || mood === 'celebrating' || (mood === 'focus' && frame === 1)
  pixel(grid, 17, 15 + y, 'O')
  pixel(grid, 18, tailUp ? 14 + y : 16 + y, accent.trim)
  pixel(grid, 19, tailUp ? 13 + y : 16 + y, accent.trim)
  pixel(grid, 20, tailUp ? 13 + y : 17 + y, 'O')
  if (mood === 'happy' && frame === 1) pixel(grid, 20, 14 + y, 'O')
}

function drawEars(grid, mood, y) {
  const lowered = mood === 'sleepy' || mood === 'worried'
  const raised = mood === 'focus' || mood === 'celebrating'
  const leftX = lowered ? 6 : raised ? 7 : 6
  const rightX = lowered ? 16 : raised ? 15 : 16
  const tipY = y + (raised ? 1 : lowered ? 4 : 2)

  pixel(grid, leftX, tipY, 'O')
  rect(grid, leftX - 1, tipY + 1, 3, 1, 'O')
  rect(grid, leftX - 2, tipY + 2, 4, 1, 'O')
  rect(grid, leftX - 1, tipY + 2, 2, 1, 'P')
  pixel(grid, leftX + 1, tipY + 3, 'O')

  pixel(grid, rightX, tipY, 'O')
  rect(grid, rightX - 1, tipY + 1, 3, 1, 'O')
  rect(grid, rightX - 1, tipY + 2, 4, 1, 'O')
  rect(grid, rightX, tipY + 2, 2, 1, 'P')
  pixel(grid, rightX - 1, tipY + 3, 'O')
}

function drawHead(grid, skin, mood, frame) {
  const y = mood === 'sleepy' ? 1 : mood === 'celebrating' && frame === 1 ? -1 : 0
  const focus = mood === 'focus'

  if (skin === 'cosmonaut') {
    drawHelmet(grid, mood, frame, y)
  } else {
    drawEars(grid, mood, y)
  }

  drawRows(grid, [
    [0, 8, 8],
    [1, 6, 12],
    [2, 5, 14],
    [3, 4, 16],
    [4, 4, 16],
    [5, 4, 16],
    [6, 4, 16],
    [7, 5, 14],
    [8, 6, 12],
    [9, 8, 8]
  ], 0, 5 + y, 'O')
  drawRows(grid, [
    [1, 7, 10],
    [2, 6, 12],
    [3, 5, 14],
    [4, 5, 14],
    [5, 5, 14],
    [6, 5, 14],
    [7, 6, 12],
    [8, 7, 10]
  ], 0, 5 + y, 'F')

  rect(grid, 9, 12 + y, 6, 3, 'H')
  rect(grid, 10, 11 + y, 4, 1, 'H')
  pixel(grid, 11, 13 + y, 'S')
  pixel(grid, 12, 14 + y, 'S')
  pixel(grid, 13, 13 + y, 'S')
  pixel(grid, 12, 12 + y, 'E')
  pixel(grid, 7, 13 + y, 'S')
  pixel(grid, 17, 13 + y, 'S')

  if (mood === 'sleepy') {
    rect(grid, 8, 10 + y, 3, 1, 'E')
    rect(grid, 15, 10 + y, 3, 1, 'E')
  } else if (mood === 'idle' && frame === 2) {
    pixel(grid, 9, 10 + y, 'E')
    pixel(grid, 17, 10 + y, 'E')
  } else {
    rect(grid, 8, 10 + y, focus ? 2 : 1, focus ? 2 : 1, 'E')
    rect(grid, focus ? 16 : 17, 10 + y, focus ? 2 : 1, focus ? 2 : 1, 'E')
    if (focus) {
      pixel(grid, 9, 10 + y, 'H')
      pixel(grid, 17, 10 + y, 'H')
    }
  }

  if (mood === 'happy' || mood === 'celebrating') {
    pixel(grid, 11, 15 + y, 'E')
    pixel(grid, 12, 16 + y, 'E')
    pixel(grid, 13, 15 + y, 'E')
  } else {
    rect(grid, 11, 15 + y, 3, 1, 'E')
  }
}

function drawHelmet(grid, mood, frame, y) {
  const glow = mood === 'focus'

  drawRows(grid, [
    [0, 9, 6],
    [1, 7, 10],
    [2, 5, 14],
    [3, 4, 16],
    [4, 3, 18],
    [5, 3, 18],
    [6, 3, 18],
    [7, 4, 16],
    [8, 5, 14],
    [9, 7, 10],
    [10, 9, 6]
  ], 0, 3 + y, 'C')
  drawRows(grid, [
    [2, 7, 10],
    [3, 5, 14],
    [4, 4, 16],
    [5, 4, 16],
    [6, 4, 16],
    [7, 5, 14],
    [8, 7, 10]
  ], 0, 3 + y, 'V')
  rect(grid, 7, 5 + y, 2, 1, 'H')
  pixel(grid, 6, 6 + y, 'H')
  rect(grid, 16, 13 + y, 3, 1, 'D')
  if (glow) {
    rect(grid, 6, 7 + y, 2 + frame, 1, 'H')
    rect(grid, 16 - frame, 7 + y, 2, 1, 'H')
  }
}

function drawAccessories(grid, skin, mood, frame) {
  const accent = getSkinAccent(skin)
  const y = mood === 'sleepy' ? 1 : mood === 'celebrating' && frame === 1 ? -1 : 0

  rect(grid, 8, 15 + y, 8, 1, 'O')
  rect(grid, 9, 15 + y, 6, 1, accent.scarf)
  pixel(grid, mood === 'focus' ? 15 : 16, 16 + y, accent.scarf)
  pixel(grid, mood === 'focus' ? 14 : 15, 16 + y, 'O')

  if (skin === 'aurora') {
    pixel(grid, 6, 8 + y, 'A')
    pixel(grid, 18, 9 + y, 'M')
    pixel(grid, 15, 7 + y, 'A')
    if (mood === 'focus') pixel(grid, 12, 5 + y, frame === 0 ? 'A' : 'M')
  }

  if (skin === 'gold' || skin === 'gold-star') {
    pixel(grid, 12, 4 + y, 'G')
    pixel(grid, 11, 5 + y, 'G')
    pixel(grid, 13, 5 + y, 'G')
    pixel(grid, 12, 6 + y, 'G')
    if (mood === 'focus') pixel(grid, 12, 3 + y, frame === 0 ? 'H' : 'G')
  }

  if (mood === 'worried') {
    pixel(grid, 19, 7 + y, 'G')
    pixel(grid, 19, 8 + y, 'G')
    pixel(grid, 19, 10 + y, 'G')
  }
}

function getSkinAccent(skin = 'classic') {
  return SKIN_ACCENTS[skin] ?? SKIN_ACCENTS.classic
}

function drawFrame(skin, mood, frame) {
  const grid = emptyGrid()
  drawBody(grid, skin, mood, frame)
  drawHead(grid, skin, mood, frame)
  drawAccessories(grid, skin, mood, frame)
  return grid
}

function createFrames(skin, mood, count) {
  return Array.from({ length: count }, (_, index) => drawFrame(skin, mood, index))
}

function normalizeMood(mood) {
  if (mood === 'ready') return 'idle'
  if (mood === 'running') return 'focus'
  if (mood === 'paused') return 'sleepy'
  if (mood === 'completed') return 'celebrating'
  return MOOD_TIMINGS[mood] ? mood : 'idle'
}

export function getLaikaSpriteSet({ skin = 'classic', mood = 'idle' } = {}) {
  const normalizedMood = normalizeMood(mood)
  const skinKey = skin === 'gold-star' ? 'gold' : skin
  const frameCounts = {
    idle: 3,
    focus: 2,
    happy: 2,
    sleepy: 2,
    celebrating: 3,
    worried: 2
  }

  return {
    frames: createFrames(skinKey, normalizedMood, frameCounts[normalizedMood] ?? 3),
    frameDuration: MOOD_TIMINGS[normalizedMood] ?? MOOD_TIMINGS.idle,
    mood: normalizedMood
  }
}
