// Lantern Lane scenes: three original pictures, each drawn twice by the same code.
// The left panel always draws the base picture; the right panel draws it again with the
// level's difference ids switched on, so a difference is exactly one drawing change at a
// known point. Scene space is 580 x 460 for every level; the renderer scales it to fit.

export const SCENE_W = 580;
export const SCENE_H = 460;

function circle(c, x, y, r, fill) {
  c.fillStyle = fill;
  c.beginPath();
  c.arc(x, y, r, 0, Math.PI * 2);
  c.fill();
}

function ellipse(c, x, y, rx, ry, fill) {
  c.fillStyle = fill;
  c.beginPath();
  c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  c.fill();
}

function rect(c, x, y, w, h, fill) {
  c.fillStyle = fill;
  c.fillRect(x, y, w, h);
}

function roundRect(c, x, y, w, h, r, fill) {
  c.fillStyle = fill;
  c.beginPath();
  c.roundRect(x, y, w, h, r);
  c.fill();
}

function line(c, x1, y1, x2, y2, width, stroke) {
  c.strokeStyle = stroke;
  c.lineWidth = width;
  c.lineCap = 'round';
  c.beginPath();
  c.moveTo(x1, y1);
  c.lineTo(x2, y2);
  c.stroke();
}

function gradient(c, y0, y1, stops) {
  const g = c.createLinearGradient(0, y0, 0, y1);
  for (const [at, colour] of stops) g.addColorStop(at, colour);
  return g;
}

function cloud(c, x, y, s, fill) {
  ellipse(c, x, y, 44 * s, 20 * s, fill);
  ellipse(c, x - 30 * s, y + 6 * s, 30 * s, 15 * s, fill);
  ellipse(c, x + 32 * s, y + 6 * s, 32 * s, 16 * s, fill);
  ellipse(c, x + 2 * s, y - 12 * s, 28 * s, 17 * s, fill);
}

function tree(c, x, y, s, leaf, trunk) {
  rect(c, x - 7 * s, y, 14 * s, 52 * s, trunk);
  circle(c, x, y - 34 * s, 40 * s, leaf);
  circle(c, x - 30 * s, y - 12 * s, 27 * s, leaf);
  circle(c, x + 30 * s, y - 12 * s, 27 * s, leaf);
  circle(c, x, y - 62 * s, 26 * s, leaf);
}

function flower(c, x, y, petal) {
  line(c, x, y + 16, x, y + 2, 3, '#2e7d32');
  for (let i = 0; i < 5; i += 1) {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
    circle(c, x + Math.cos(a) * 7, y + Math.sin(a) * 7, 5.5, petal);
  }
  circle(c, x, y, 4, '#ffd54a');
}

function bird(c, x, y, colour) {
  c.strokeStyle = colour;
  c.lineWidth = 3;
  c.lineCap = 'round';
  c.beginPath();
  c.arc(x - 9, y, 9, Math.PI * 1.15, Math.PI * 1.85);
  c.arc(x + 9, y, 9, Math.PI * 1.15, Math.PI * 1.85);
  c.stroke();
}

// ---------------------------------------------------------------- Level 1: garden
function drawGarden(c, changed) {
  rect(c, 0, 0, SCENE_W, SCENE_H, gradient(c, 0, 340, [[0, '#8ed4f2'], [1, '#d8f3fd']]));
  // Sun: the changed picture has lost its rays.
  if (!changed.has('sun')) {
    c.strokeStyle = '#ffb300';
    c.lineWidth = 5;
    c.lineCap = 'round';
    for (let i = 0; i < 8; i += 1) {
      const a = (i / 8) * Math.PI * 2;
      c.beginPath();
      c.moveTo(88 + Math.cos(a) * 40, 68 + Math.sin(a) * 40);
      c.lineTo(88 + Math.cos(a) * 54, 68 + Math.sin(a) * 54);
      c.stroke();
    }
  }
  circle(c, 88, 68, 34, '#ffca28');
  circle(c, 88, 68, 27, '#ffd94d');
  cloud(c, 300, 58, 1, '#ffffff');
  cloud(c, 470, 96, 0.75, '#f4fbff');
  bird(c, 218, 108, '#37474f');
  bird(c, 252, 88, '#37474f');
  // Rolling hills and lawn.
  ellipse(c, 120, 470, 340, 130, '#9ccc65');
  ellipse(c, 520, 480, 320, 140, '#7cb342');
  rect(c, 0, 372, SCENE_W, 88, '#8bc34a');
  ellipse(c, 290, 372, 300, 26, '#8bc34a');
  // Cottage on the right.
  rect(c, 356, 232, 168, 128, '#ffe0b2');
  rect(c, 356, 232, 168, 10, '#ef6c00');
  c.fillStyle = '#c62828';
  c.beginPath();
  c.moveTo(338, 236);
  c.lineTo(440, 168);
  c.lineTo(542, 236);
  c.closePath();
  c.fill();
  rect(c, 424, 292, 34, 68, '#6d4c41');
  circle(c, 450, 328, 3.5, '#ffd54a');
  roundRect(c, 374, 258, 40, 40, 4, '#b3e5fc');
  rect(c, 392, 258, 4, 40, '#ffffff');
  rect(c, 374, 276, 40, 4, '#ffffff');
  // Curtain: blue in the base picture, red in the changed one.
  rect(c, 466, 258, 40, 40, '#b3e5fc');
  rect(c, 466, 258, 12, 40, changed.has('curtain') ? '#e53935' : '#1e88e5');
  rect(c, 494, 258, 12, 40, changed.has('curtain') ? '#e53935' : '#1e88e5');
  rect(c, 484, 258, 4, 40, '#ffffff');
  rect(c, 466, 276, 40, 4, '#ffffff');
  rect(c, 470, 196, 18, 34, '#8d6e63');
  ellipse(c, 479, 190, 16, 7, 'rgba(120,120,120,0.55)');
  ellipse(c, 486, 176, 12, 6, 'rgba(120,120,120,0.4)');
  // Tree, fence and path.
  tree(c, 110, 268, 1.15, '#43a047', '#5d4037');
  circle(c, 92, 226, 7, '#e53935');
  circle(c, 128, 240, 7, '#e53935');
  circle(c, 112, 204, 7, '#e53935');
  for (let i = 0; i < 5; i += 1) rect(c, 196 + i * 26, 330, 8, 34, '#a1887f');
  rect(c, 190, 338, 138, 6, '#a1887f');
  rect(c, 190, 352, 138, 6, '#a1887f');
  c.fillStyle = '#d7ccc8';
  c.beginPath();
  c.moveTo(268, 460);
  c.lineTo(318, 360);
  c.lineTo(352, 360);
  c.lineTo(428, 460);
  c.closePath();
  c.fill();
  ellipse(c, 316, 402, 20, 7, '#bcaaa4');
  // Stepping stone: present in the base picture, gone in the changed one.
  if (!changed.has('stone')) ellipse(c, 338, 428, 24, 8, '#bcaaa4');
  // Butterfly: present in the base picture, gone in the changed one.
  if (!changed.has('butterfly')) {
    ellipse(c, 438, 138, 11, 7, '#ab47bc');
    ellipse(c, 460, 138, 11, 7, '#ab47bc');
    ellipse(c, 449, 148, 4, 9, '#4a148c');
    line(c, 449, 140, 443, 132, 2, '#4a148c');
    line(c, 449, 140, 455, 132, 2, '#4a148c');
  }
  // Flower bed along the bottom.
  rect(c, 0, 424, SCENE_W, 36, '#5d4037');
  const petals = ['#ef5350', '#ab47bc', '#42a5f5', '#ff7043', '#ec407a', '#7e57c2'];
  for (let i = 0; i < 14; i += 1) {
    const x = 24 + i * 40;
    // One flower changes colour: red in the base picture, yellow in the changed one.
    const colour = i === 3 && changed.has('flower') ? '#ffee58' : petals[i % petals.length];
    flower(c, x, 424, colour);
  }
  for (let i = 0; i < 22; i += 1) line(c, 12 + i * 26, 460, 16 + i * 26, 446, 3, '#33691e');
}

// ---------------------------------------------------------------- Level 2: harbour
function drawHarbour(c, changed) {
  rect(c, 0, 0, SCENE_W, SCENE_H, gradient(c, 0, 300, [[0, '#1a2350'], [0.7, '#5c3a6e'], [1, '#c65d3b']]));
  // Stars; one of them is missing in the changed picture.
  const stars = [[40, 40], [120, 84], [200, 30], [262, 66], [410, 36], [520, 110], [556, 44]];
  for (const [sx, sy] of stars) {
    if (changed.has('star') && sx === 262 && sy === 66) continue;
    circle(c, sx, sy, 2.4, '#fff8e1');
  }
  circle(c, 150, 150, 2, '#fff8e1');
  circle(c, 340, 120, 2, '#fff8e1');
  // Moon: a crescent in the base picture, full in the changed one.
  circle(c, 486, 72, 30, '#fff3c4');
  if (!changed.has('moon')) {
    circle(c, 472, 62, 26, '#46305e');
  }
  cloud(c, 180, 92, 0.9, 'rgba(38,32,74,0.9)');
  cloud(c, 380, 130, 0.7, 'rgba(38,32,74,0.85)');
  // Sea.
  rect(c, 0, 292, SCENE_W, 168, gradient(c, 292, 460, [[0, '#274b7a'], [1, '#12263f']]));
  for (let i = 0; i < 9; i += 1) {
    c.strokeStyle = 'rgba(160,210,255,0.35)';
    c.lineWidth = 3;
    c.beginPath();
    c.arc(40 + i * 62, 330 + (i % 3) * 38, 16, Math.PI * 1.1, Math.PI * 1.6);
    c.stroke();
  }
  ellipse(c, 486, 310, 44, 8, 'rgba(255,243,196,0.35)');
  // Rocky shore and lighthouse on the left.
  c.fillStyle = '#263238';
  c.beginPath();
  c.moveTo(0, 460);
  c.lineTo(0, 330);
  c.lineTo(70, 300);
  c.lineTo(150, 330);
  c.lineTo(170, 460);
  c.closePath();
  c.fill();
  c.fillStyle = '#eceff1';
  c.beginPath();
  c.moveTo(64, 306);
  c.lineTo(78, 168);
  c.lineTo(118, 168);
  c.lineTo(132, 306);
  c.closePath();
  c.fill();
  // Lighthouse band: red in the base picture, blue in the changed one.
  c.fillStyle = changed.has('stripe') ? '#1e6fd9' : '#d32f2f';
  c.beginPath();
  c.moveTo(71, 252);
  c.lineTo(76, 208);
  c.lineTo(120, 208);
  c.lineTo(125, 252);
  c.closePath();
  c.fill();
  rect(c, 72, 150, 52, 18, '#37474f');
  // Lamp room: lit in the base picture, dark in the changed one.
  roundRect(c, 84, 118, 28, 32, 4, changed.has('lamp') ? '#37474f' : '#ffd54a');
  rect(c, 80, 112, 36, 7, '#263238');
  if (!changed.has('lamp')) {
    c.fillStyle = 'rgba(255,213,74,0.28)';
    c.beginPath();
    c.moveTo(112, 134);
    c.lineTo(300, 104);
    c.lineTo(300, 168);
    c.closePath();
    c.fill();
  }
  roundRect(c, 90, 262, 16, 24, 6, '#455a64');
  // Sailboat: the changed picture has lost its sail.
  ellipse(c, 356, 336, 62, 13, '#5d4037');
  rect(c, 300, 326, 112, 12, '#795548');
  line(c, 356, 326, 356, 238, 5, '#4e342e');
  if (!changed.has('sail')) {
    c.fillStyle = '#fff8e1';
    c.beginPath();
    c.moveTo(362, 244);
    c.lineTo(362, 322);
    c.lineTo(404, 322);
    c.closePath();
    c.fill();
    c.fillStyle = '#ffe082';
    c.beginPath();
    c.moveTo(350, 252);
    c.lineTo(350, 322);
    c.lineTo(318, 322);
    c.closePath();
    c.fill();
  }
  circle(c, 392, 330, 5, '#ffd54a');
  // Small rowboat on the right.
  ellipse(c, 492, 392, 44, 10, '#00695c');
  rect(c, 452, 384, 80, 9, '#00897b');
  line(c, 486, 384, 462, 356, 4, '#4e342e');
  circle(c, 492, 368, 9, '#ffccbc');
  rect(c, 486, 376, 12, 10, '#37474f');
  // Jumping fish: present in the base picture, gone in the changed one.
  if (!changed.has('fish')) {
    ellipse(c, 222, 372, 20, 9, '#80cbc4');
    c.fillStyle = '#80cbc4';
    c.beginPath();
    c.moveTo(240, 372);
    c.lineTo(254, 360);
    c.lineTo(254, 384);
    c.closePath();
    c.fill();
    circle(c, 212, 370, 2.5, '#12263f');
    c.strokeStyle = 'rgba(160,210,255,0.6)';
    c.lineWidth = 2.5;
    c.beginPath();
    c.arc(222, 392, 16, Math.PI * 1.15, Math.PI * 1.85);
    c.stroke();
  }
  // Buoy.
  c.fillStyle = '#e53935';
  c.beginPath();
  c.moveTo(150, 416);
  c.lineTo(162, 392);
  c.lineTo(174, 416);
  c.closePath();
  c.fill();
  rect(c, 158, 402, 8, 4, '#ffffff');
}

// ---------------------------------------------------------------- Level 3: library
function drawLibrary(c, changed) {
  rect(c, 0, 0, SCENE_W, SCENE_H, gradient(c, 0, 460, [[0, '#4e342e'], [1, '#3e2723']]));
  rect(c, 0, 0, SCENE_W, 356, '#6d4c41');
  rect(c, 0, 340, SCENE_W, 16, '#4e342e');
  rect(c, 0, 356, SCENE_W, 104, '#5d4037');
  for (let i = 0; i < 8; i += 1) rect(c, 20 + i * 72, 356, 3, 104, '#4e342e');
  // Wall picture: a star in the base picture, a moon in the changed one.
  roundRect(c, 44, 44, 92, 92, 6, '#3e2723');
  roundRect(c, 52, 52, 76, 76, 4, '#263238');
  if (changed.has('picture')) {
    circle(c, 90, 90, 17, '#fff3c4');
    circle(c, 82, 84, 14, '#263238');
  } else {
    c.fillStyle = '#ffd54a';
    c.beginPath();
    const cx = 90;
    const cy = 90;
    for (let i = 0; i < 10; i += 1) {
      const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
      const r = i % 2 === 0 ? 24 : 10;
      const px = cx + Math.cos(a) * r;
      const py = cy + Math.sin(a) * r;
      if (i === 0) c.moveTo(px, py); else c.lineTo(px, py);
    }
    c.closePath();
    c.fill();
  }
  // Clock: the hands tell a different time in the changed picture.
  circle(c, 292, 84, 42, '#efebe9');
  circle(c, 292, 84, 42, 'rgba(0,0,0,0)');
  c.strokeStyle = '#3e2723';
  c.lineWidth = 5;
  c.beginPath();
  c.arc(292, 84, 40, 0, Math.PI * 2);
  c.stroke();
  for (let i = 0; i < 12; i += 1) {
    const a = (i / 12) * Math.PI * 2;
    circle(c, 292 + Math.cos(a) * 32, 84 + Math.sin(a) * 32, 2, '#3e2723');
  }
  if (changed.has('clock')) {
    line(c, 292, 84, 292, 58, 5, '#3e2723');
    line(c, 292, 84, 316, 96, 4, '#3e2723');
  } else {
    line(c, 292, 84, 270, 70, 5, '#3e2723');
    line(c, 292, 84, 292, 112, 4, '#3e2723');
  }
  circle(c, 292, 84, 4, '#b71c1c');
  // Window with night sky on the right.
  roundRect(c, 420, 40, 120, 140, 6, '#3e2723');
  roundRect(c, 428, 48, 104, 124, 4, '#1a2350');
  circle(c, 500, 76, 15, '#fff3c4');
  circle(c, 494, 71, 12, '#1a2350');
  circle(c, 452, 66, 2.2, '#ffffff');
  circle(c, 470, 110, 2.2, '#ffffff');
  circle(c, 512, 128, 2.2, '#ffffff');
  rect(c, 476, 48, 5, 124, '#3e2723');
  rect(c, 428, 106, 104, 5, '#3e2723');
  rect(c, 420, 180, 120, 8, '#3e2723');
  // Bookshelf on the left.
  rect(c, 36, 168, 220, 172, '#3e2723');
  rect(c, 44, 176, 204, 72, '#2d1b12');
  rect(c, 44, 256, 204, 76, '#2d1b12');
  const shelfA = ['#c62828', '#1565c0', '#2e7d32', '#f9a825', '#6a1b9a', '#00838f', '#ad1457'];
  for (let i = 0; i < shelfA.length; i += 1) {
    // One book changes colour: green in the base picture, purple in the changed one.
    const colour = i === 2 && changed.has('book') ? '#8e24aa' : shelfA[i];
    rect(c, 54 + i * 27, 190 - (i % 3) * 4, 20, 58 + (i % 3) * 4, colour);
    rect(c, 54 + i * 27, 198 - (i % 3) * 4, 20, 5, 'rgba(255,255,255,0.35)');
  }
  const shelfB = ['#00838f', '#ad1457', '#f9a825', '#1565c0', '#2e7d32', '#c62828'];
  for (let i = 0; i < shelfB.length; i += 1) {
    rect(c, 54 + i * 30, 272, 22, 60, shelfB[i]);
    rect(c, 54 + i * 30, 280, 22, 5, 'rgba(255,255,255,0.35)');
  }
  roundRect(c, 196, 288, 44, 30, 4, '#ffd54a');
  rect(c, 204, 296, 28, 4, '#8d6e63');
  rect(c, 204, 304, 28, 4, '#8d6e63');
  // Desk in the middle.
  rect(c, 282, 292, 190, 14, '#4e342e');
  rect(c, 292, 306, 12, 52, '#3e2723');
  rect(c, 448, 306, 12, 52, '#3e2723');
  rect(c, 330, 268, 52, 24, '#90a4ae');
  rect(c, 336, 274, 40, 13, '#263238');
  rect(c, 322, 292, 68, 5, '#78909c');
  // Mug on the desk: red in the base picture, blue in the changed one.
  roundRect(c, 404, 268, 20, 24, 3, changed.has('mug') ? '#1e88e5' : '#e53935');
  c.strokeStyle = changed.has('mug') ? '#1e88e5' : '#e53935';
  c.lineWidth = 4;
  c.beginPath();
  c.arc(428, 280, 7, -Math.PI / 2, Math.PI / 2);
  c.stroke();
  ellipse(c, 414, 269, 9, 3, 'rgba(255,255,255,0.5)');
  // Floor lamp: glowing in the base picture, dark in the changed one.
  line(c, 516, 356, 516, 238, 6, '#263238');
  line(c, 516, 356, 498, 372, 6, '#263238');
  line(c, 516, 356, 534, 372, 6, '#263238');
  c.fillStyle = changed.has('lampglow') ? '#546e7a' : '#ffe082';
  c.beginPath();
  c.moveTo(492, 238);
  c.lineTo(540, 238);
  c.lineTo(528, 202);
  c.lineTo(504, 202);
  c.closePath();
  c.fill();
  if (!changed.has('lampglow')) ellipse(c, 516, 252, 52, 16, 'rgba(255,224,130,0.25)');
  // Plant by the shelf: present in the base picture, gone in the changed one.
  if (!changed.has('plant')) {
    roundRect(c, 52, 384, 36, 30, 4, '#b71c1c');
    ellipse(c, 70, 368, 10, 22, '#2e7d32');
    ellipse(c, 54, 376, 16, 10, '#388e3c');
    ellipse(c, 86, 376, 16, 10, '#43a047');
  }
  // Rug and the cat asleep on it: the cat is gone in the changed picture.
  ellipse(c, 330, 416, 170, 30, '#7b1fa2');
  ellipse(c, 330, 416, 130, 21, '#8e24aa');
  ellipse(c, 330, 416, 88, 13, '#ab47bc');
  if (!changed.has('cat')) {
    ellipse(c, 396, 404, 30, 13, '#fb8c00');
    circle(c, 424, 396, 13, '#fb8c00');
    ellipse(c, 418, 386, 5, 8, '#fb8c00');
    ellipse(c, 430, 386, 5, 8, '#fb8c00');
    ellipse(c, 370, 400, 12, 6, '#fb8c00');
    circle(c, 420, 394, 2, '#3e2723');
    line(c, 428, 400, 436, 398, 2, '#3e2723');
    c.strokeStyle = '#fb8c00';
    c.lineWidth = 6;
    c.beginPath();
    c.arc(362, 414, 12, Math.PI * 0.4, Math.PI * 1.3);
    c.stroke();
  }
  // Armchair on the left of the rug.
  roundRect(c, 120, 330, 84, 56, 12, '#00695c');
  roundRect(c, 132, 302, 60, 44, 12, '#00897b');
  roundRect(c, 108, 338, 22, 34, 9, '#00897b');
  roundRect(c, 194, 338, 22, 34, 9, '#00897b');
  roundRect(c, 138, 344, 48, 22, 6, '#ffd54a');
}

export const LEVELS = [
  {
    name: 'Level 1 · Sunny Garden',
    sub: 'A cottage garden on a bright morning',
    seconds: 120,
    draw: drawGarden,
    diffs: [
      { id: 'sun', x: 88, y: 68, r: 44, label: 'the sun lost its rays' },
      { id: 'butterfly', x: 449, y: 140, r: 30, label: 'the butterfly flew away' },
      { id: 'curtain', x: 486, y: 278, r: 30, label: 'the curtains changed colour' },
      { id: 'stone', x: 338, y: 428, r: 30, label: 'a stepping stone vanished' },
      { id: 'flower', x: 144, y: 424, r: 28, label: 'one flower changed colour' },
    ],
  },
  {
    name: 'Level 2 · Harbour at Dusk',
    sub: 'A lighthouse watches over the bay',
    seconds: 150,
    draw: drawHarbour,
    diffs: [
      { id: 'star', x: 262, y: 66, r: 26, label: 'a star went out' },
      { id: 'moon', x: 486, y: 72, r: 36, label: 'the moon filled out' },
      { id: 'lamp', x: 98, y: 134, r: 32, label: 'the lighthouse lamp went dark' },
      { id: 'stripe', x: 98, y: 230, r: 32, label: 'the lighthouse band changed colour' },
      { id: 'sail', x: 362, y: 286, r: 40, label: 'the sailboat lost its sail' },
      { id: 'fish', x: 228, y: 374, r: 32, label: 'the jumping fish dived away' },
    ],
  },
  {
    name: 'Level 3 · The Cozy Library',
    sub: 'A quiet reading room after dark',
    seconds: 180,
    draw: drawLibrary,
    diffs: [
      { id: 'picture', x: 90, y: 90, r: 36, label: 'the picture changed from star to moon' },
      { id: 'clock', x: 292, y: 84, r: 42, label: 'the clock tells a different time' },
      { id: 'book', x: 114, y: 218, r: 28, label: 'one book changed colour' },
      { id: 'mug', x: 414, y: 280, r: 26, label: 'the mug changed colour' },
      { id: 'lampglow', x: 516, y: 224, r: 34, label: 'the floor lamp went out' },
      { id: 'plant', x: 70, y: 382, r: 32, label: 'the plant disappeared' },
      { id: 'cat', x: 402, y: 400, r: 38, label: 'the sleeping cat slipped away' },
    ],
  },
];

export function changedSet(level) {
  return new Set(level.diffs.map((d) => d.id));
}
