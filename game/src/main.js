// Lantern Lane — Spot the Difference. Boot, game state, input and rendering.
//
// Two panels show the same scene; the right one carries a handful of changes. Clicking a
// change in either panel rings it in both. Find them all before the lantern timer runs
// out: a wrong click costs time, three wrong clicks end the level, and a hint (3 per
// level) briefly rings one unfound difference. Three levels, 5 / 6 / 7 differences.
//
// ?shot=start|play|end stages a fixed scene for screenshots and sets window.__shotReady.

import { LEVELS, SCENE_W, SCENE_H, changedSet } from './scenes.js';
import { sfxFound, sfxHint, sfxLose, sfxMiss, sfxWin } from './audio.js';

const VIEW_W = 1280;
const VIEW_H = 720;
const PANEL_Y = 96;
const PANEL_W = 580;
const PANEL_H = 460;
const LEFT_X = 36;
const RIGHT_X = VIEW_W - PANEL_W - 36;
const MAX_MISTAKES = 3;
const MISS_PENALTY = 5;
const HINTS_PER_LEVEL = 3;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const ctx = canvas.getContext('2d');

const offLeft = document.createElement('canvas');
offLeft.width = SCENE_W;
offLeft.height = SCENE_H;
const offRight = document.createElement('canvas');
offRight.width = SCENE_W;
offRight.height = SCENE_H;

let screen = 'title'; // title | play | paused | leveldone | win | lose
let levelIndex = 0;
let found = new Set();
let mistakes = 0;
let hintsLeft = HINTS_PER_LEVEL;
let hintId = null;
let hintUntil = 0;
let timeLeft = 0;
let score = 0;
let levelScore = 0;
let message = '';
let messageUntil = 0;
let shakeUntil = 0;
let lastTick = 0;
const marks = []; // {x, y, at} expanding rings for fresh finds

function announce(text) {
  status.textContent = text;
}

function renderPanels() {
  const level = LEVELS[levelIndex];
  const lc = offLeft.getContext('2d');
  lc.clearRect(0, 0, SCENE_W, SCENE_H);
  level.draw(lc, new Set());
  const rc = offRight.getContext('2d');
  rc.clearRect(0, 0, SCENE_W, SCENE_H);
  level.draw(rc, changedSet(level));
}

function startLevel(index) {
  levelIndex = index;
  const level = LEVELS[index];
  found = new Set();
  mistakes = 0;
  hintsLeft = HINTS_PER_LEVEL;
  hintId = null;
  levelScore = 0;
  timeLeft = level.seconds;
  marks.length = 0;
  renderPanels();
  screen = 'play';
  lastTick = performance.now();
  announce(`${level.name}. Find ${level.diffs.length} differences.`);
}

function startGame() {
  score = 0;
  startLevel(0);
}

function remaining() {
  return LEVELS[levelIndex].diffs.length - found.size;
}

function finishLevel() {
  const bonus = Math.round(timeLeft) * 5;
  levelScore = found.size * 100 + bonus;
  score += levelScore;
  if (levelIndex === LEVELS.length - 1) {
    screen = 'win';
    sfxWin();
    announce(`You win! Final score ${score}.`);
  } else {
    screen = 'leveldone';
    sfxWin();
    announce(`Level complete. Score ${score}. Press Enter for the next level.`);
  }
}

function failLevel(reason) {
  screen = 'lose';
  sfxLose();
  announce(`${reason} Score ${score}. Press Enter to try again.`);
}

function useHint(now) {
  if (screen !== 'play' || hintsLeft <= 0) return;
  const next = LEVELS[levelIndex].diffs.find((d) => !found.has(d.id));
  if (!next) return;
  hintsLeft -= 1;
  hintId = next.id;
  hintUntil = now + 1600;
  timeLeft = Math.max(0, timeLeft - 10);
  sfxHint();
  message = 'A lantern flickers near one difference… (−10s)';
  messageUntil = now + 2200;
}

function handleClick(px, py, now) {
  if (screen === 'title' || screen === 'win' || screen === 'lose') {
    if (py > 596 && py < 664 && px > 490 && px < 790) {
      if (screen === 'lose') startLevel(levelIndex);
      else startGame();
    }
    return;
  }
  if (screen === 'leveldone') {
    if (py > 596 && py < 664 && px > 490 && px < 790) startLevel(levelIndex + 1);
    return;
  }
  if (screen !== 'play') return;
  // Hint button in the footer.
  if (px > 1052 && px < 1244 && py > 592 && py < 652) {
    useHint(now);
    return;
  }
  let panelX = null;
  if (px >= LEFT_X && px < LEFT_X + PANEL_W && py >= PANEL_Y && py < PANEL_Y + PANEL_H) panelX = LEFT_X;
  if (px >= RIGHT_X && px < RIGHT_X + PANEL_W && py >= PANEL_Y && py < PANEL_Y + PANEL_H) panelX = RIGHT_X;
  if (panelX === null) return;
  const sx = px - panelX;
  const sy = py - PANEL_Y;
  const level = LEVELS[levelIndex];
  for (const d of level.diffs) {
    if (found.has(d.id)) continue;
    const dist = Math.hypot(sx - d.x, sy - d.y);
    if (dist <= Math.max(d.r, 26)) {
      found.add(d.id);
      marks.push({ id: d.id, at: now });
      sfxFound();
      message = `Found: ${d.label}!`;
      messageUntil = now + 2200;
      announce(`Found ${found.size} of ${level.diffs.length}: ${d.label}.`);
      if (remaining() === 0) finishLevel();
      return;
    }
  }
  // A click on an already-found difference is free; anything else is a mistake.
  for (const d of level.diffs) {
    if (Math.hypot(sx - d.x, sy - d.y) <= Math.max(d.r, 26)) return;
  }
  mistakes += 1;
  timeLeft = Math.max(0, timeLeft - MISS_PENALTY);
  shakeUntil = now + 260;
  sfxMiss();
  message = `Not there — ${MISS_PENALTY}s lost. ${MAX_MISTAKES - mistakes} strikes left.`;
  messageUntil = now + 2200;
  announce(`Miss. ${mistakes} of ${MAX_MISTAKES} strikes used.`);
  if (mistakes >= MAX_MISTAKES) failLevel('Three strikes — the lantern went out.');
  else if (timeLeft <= 0) failLevel('Time up — the lantern went out.');
}

// ------------------------------------------------------------ drawing helpers
function text(value, x, y, size, colour, align = 'center', weight = 600) {
  ctx.font = `${weight} ${size}px "Trebuchet MS", "Segoe UI", system-ui, sans-serif`;
  ctx.fillStyle = colour;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(value, x, y);
}

function panel(x, y, w, h, fill) {
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 14);
  ctx.fill();
}

function ring(x, y, r, colour, width) {
  ctx.strokeStyle = colour;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
}

function drawPanelImage(off, x, label) {
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, PANEL_Y, PANEL_W, PANEL_H, 10);
  ctx.clip();
  ctx.drawImage(off, x, PANEL_Y);
  ctx.restore();
  ctx.strokeStyle = 'rgba(255,255,255,0.65)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(x, PANEL_Y, PANEL_W, PANEL_H, 10);
  ctx.stroke();
  panel(x + PANEL_W / 2 - 74, PANEL_Y + PANEL_H - 34, 148, 26, 'rgba(10,8,24,0.62)');
  text(label, x + PANEL_W / 2, PANEL_Y + PANEL_H - 20, 15, '#ffe9b0', 'center', 700);
}

function drawMarkers(now) {
  const level = LEVELS[levelIndex];
  for (const d of level.diffs) {
    if (!found.has(d.id)) continue;
    for (const baseX of [LEFT_X, RIGHT_X]) {
      const pulse = 3 + Math.sin(now / 300) * 1.2;
      ring(baseX + d.x, PANEL_Y + d.y, d.r + 4 + pulse, 'rgba(255,213,74,0.95)', 5);
      ring(baseX + d.x, PANEL_Y + d.y, d.r + 4 + pulse, 'rgba(183,28,28,0.85)', 2);
    }
  }
  for (const m of marks) {
    const age = (now - m.at) / 600;
    if (age >= 1) continue;
    const d = LEVELS[levelIndex].diffs.find((v) => v.id === m.id);
    if (!d) continue;
    for (const baseX of [LEFT_X, RIGHT_X]) {
      ring(baseX + d.x, PANEL_Y + d.y, d.r + 6 + age * 26, `rgba(255,255,255,${0.8 * (1 - age)})`, 4);
    }
  }
  if (hintId && now < hintUntil && !found.has(hintId)) {
    const d = LEVELS[levelIndex].diffs.find((v) => v.id === hintId);
    if (d) {
      const blink = Math.floor(now / 200) % 2 === 0;
      for (const baseX of [LEFT_X, RIGHT_X]) {
        ring(baseX + d.x, PANEL_Y + d.y, d.r + 10, blink ? '#80d8ff' : '#ffffff', 4);
      }
    }
  }
}

function drawHud(now) {
  const level = LEVELS[levelIndex];
  text('🏮 Lantern Lane', 36, 34, 30, '#ffd54a', 'left', 800);
  text(level.name, 36, 68, 17, '#cfc4ec', 'left', 600);
  // Differences counter: found pips plus the number still to find.
  const total = level.diffs.length;
  for (let i = 0; i < total; i += 1) {
    const cx = 640 - ((total - 1) * 34) / 2 + i * 34;
    ctx.beginPath();
    ctx.arc(cx, 36, 12, 0, Math.PI * 2);
    if (i < found.size) {
      ctx.fillStyle = '#ffd54a';
      ctx.fill();
      text('✓', cx, 37, 15, '#4a2c00', 'center', 900);
    } else {
      ctx.strokeStyle = 'rgba(255,255,255,0.55)';
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }
  }
  text(`${remaining()} to find`, 640, 68, 18, '#ffffff', 'center', 700);
  // Timer bar.
  const frac = Math.max(0, timeLeft / level.seconds);
  panel(1010, 20, 234, 16, 'rgba(255,255,255,0.16)');
  if (frac > 0) {
    ctx.fillStyle = frac < 0.2 ? '#ef5350' : '#ffb300';
    ctx.beginPath();
    ctx.roundRect(1010, 20, 234 * frac, 16, 8);
    ctx.fill();
  }
  text(`${Math.ceil(timeLeft)}s`, 1127, 54, 19, frac < 0.2 ? '#ef9a9a' : '#ffffff', 'center', 700);
  const shownScore = screen === 'play' || screen === 'paused' ? score + found.size * 100 : score;
  text(`Score ${shownScore}`, 1244, 54, 17, '#cfc4ec', 'right', 600);
  // Footer: strikes, message, hint button.
  text(`Strikes ${'✕'.repeat(mistakes)}${'·'.repeat(MAX_MISTAKES - mistakes)}`, 36, 622, 19, mistakes ? '#ef9a9a' : '#cfc4ec', 'left', 700);
  if (now < messageUntil) text(message, 520, 622, 19, '#ffe9b0', 'center', 600);
  const hintReady = screen === 'play' && hintsLeft > 0;
  panel(1052, 592, 192, 60, hintReady ? '#ffb300' : 'rgba(255,255,255,0.14)');
  text(`💡 Hint (${hintsLeft})`, 1148, 622, 20, hintReady ? '#3a2400' : '#9d94b8', 'center', 800);
  text('Click a difference in either picture · H hint · P pause', 640, 686, 15, '#8d84ad', 'center', 500);
}

function drawBanner(title, lines, button) {
  panel(340, 196, 600, 264, 'rgba(16,12,34,0.9)');
  ctx.strokeStyle = 'rgba(255,213,74,0.7)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(340, 196, 600, 264, 14);
  ctx.stroke();
  text(title, 640, 248, 38, '#ffd54a', 'center', 800);
  lines.forEach((ln, i) => text(ln, 640, 302 + i * 32, 20, '#e8e2f7', 'center', 500));
  panel(490, 596, 300, 68, '#ffb300');
  text(button, 640, 630, 24, '#3a2400', 'center', 800);
}

function draw(now) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#171226';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const scale = Math.min(canvas.width / VIEW_W, canvas.height / VIEW_H);
  const ox = (canvas.width - VIEW_W * scale) / 2;
  const oy = (canvas.height - VIEW_H * scale) / 2;
  ctx.translate(ox, oy);
  ctx.scale(scale, scale);
  if (now < shakeUntil) ctx.translate(Math.sin(now * 0.09) * 4, 0);
  const bg = ctx.createLinearGradient(0, 0, 0, VIEW_H);
  bg.addColorStop(0, '#241a45');
  bg.addColorStop(1, '#171226');
  ctx.fillStyle = bg;
  ctx.fillRect(-ox / scale, -oy / scale, canvas.width / scale, canvas.height / scale);
  drawPanelImage(offLeft, LEFT_X, 'ORIGINAL');
  drawPanelImage(offRight, RIGHT_X, 'CHANGED');
  drawMarkers(now);
  drawHud(now);
  if (screen === 'title') {
    drawBanner('🏮 Lantern Lane', [
      'Spot the Difference — three hand-drawn scenes.',
      'The right picture hides a few changes.',
      'Click a change in either picture to ring it.',
      'Wrong clicks cost 5s. Three strikes end the level!',
    ], '▶  Start hunting');
  } else if (screen === 'paused') {
    drawBanner('Paused', ['The lantern waits for you.', 'Press P or Enter to keep looking.'], '▶  Keep looking');
  } else if (screen === 'leveldone') {
    drawBanner('Level complete! 🎉', [
      `You found all ${LEVELS[levelIndex].diffs.length} differences.`,
      `Level score ${levelScore} — total ${score}.`,
      `Next: ${LEVELS[levelIndex + 1].name}.`,
    ], '▶  Next level');
  } else if (screen === 'win') {
    drawBanner('You win! 🏆', [
      'Every difference in Lantern Lane, found.',
      `Final score ${score}.`,
      'Press Enter to play again.',
    ], '↻  Play again');
  } else if (screen === 'lose') {
    drawBanner('The lantern went out 🌙', [
      `You found ${found.size} of ${LEVELS[levelIndex].diffs.length} differences.`,
      `Score ${score}. The scene is reshuffled — try again!`,
      '',
    ], '↻  Try this level again');
  }
}

// ------------------------------------------------------------ input & loop
function toView(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const scale = Math.min(rect.width / VIEW_W, rect.height / VIEW_H);
  const ox = (rect.width - VIEW_W * scale) / 2;
  const oy = (rect.height - VIEW_H * scale) / 2;
  return [(clientX - rect.left - ox) / scale, (clientY - rect.top - oy) / scale];
}

canvas.addEventListener('pointerdown', (event) => {
  const [x, y] = toView(event.clientX, event.clientY);
  const now = performance.now();
  if (screen === 'paused') {
    screen = 'play';
    lastTick = now;
    return;
  }
  handleClick(x, y, now);
});

window.addEventListener('keydown', (event) => {
  const now = performance.now();
  if (event.key === 'Enter' || event.key === ' ') {
    if (screen === 'title' || screen === 'win') startGame();
    else if (screen === 'lose') startLevel(levelIndex);
    else if (screen === 'leveldone') startLevel(levelIndex + 1);
    else if (screen === 'paused') { screen = 'play'; lastTick = now; }
    event.preventDefault();
  } else if ((event.key === 'p' || event.key === 'P') && screen === 'play') {
    screen = 'paused';
    announce('Paused.');
  } else if ((event.key === 'h' || event.key === 'H') && screen === 'play') {
    useHint(now);
  } else if ((event.key === 'r' || event.key === 'R') && (screen === 'play' || screen === 'lose')) {
    startLevel(levelIndex);
  }
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden && screen === 'play') screen = 'paused';
});

function resize() {
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.round(window.innerWidth * ratio);
  canvas.height = Math.round(window.innerHeight * ratio);
}
window.addEventListener('resize', resize);
resize();

function frame(now) {
  if (screen === 'play') {
    const dt = Math.min((now - lastTick) / 1000, 0.25);
    lastTick = now;
    timeLeft -= dt;
    if (timeLeft <= 0) {
      timeLeft = 0;
      failLevel('Time up — the lantern went out.');
    }
  } else {
    lastTick = now;
  }
  draw(now);
  requestAnimationFrame(frame);
}

// ------------------------------------------------------------ screenshot staging
function stageShot(name) {
  startLevel(0);
  if (name === 'play' || name === 'end') {
    const level = LEVELS[0];
    const wanted = name === 'play' ? level.diffs.slice(0, 3) : level.diffs;
    for (const d of wanted) {
      found.add(d.id);
      marks.push({ id: d.id, at: performance.now() - 500 });
    }
    timeLeft = name === 'play' ? 74 : level.seconds;
    score = 0;
    if (name === 'end') {
      levelScore = wanted.length * 100 + Math.round(timeLeft) * 5;
      score = levelScore;
      screen = 'leveldone';
    } else {
      screen = 'play';
      message = 'Found: the butterfly flew away!';
      messageUntil = performance.now() + 100000;
    }
  } else {
    screen = 'title';
  }
  let painted = 0;
  function paint() {
    draw(performance.now());
    painted += 1;
    if (painted < 3) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

if (shot) stageShot(shot);
else {
  renderPanels();
  announce('Lantern Lane. Press Enter or click Start to play.');
  requestAnimationFrame(frame);
}
