// Tiny WebAudio sound effects, synthesised in code: no audio files, nothing to load.
// Sounds only start after a player gesture (the first click creates the context).

let context = null;

function ensure() {
  if (context === null) {
    try {
      context = new (window.AudioContext || window.webkitAudioContext)();
    } catch {
      context = false;
    }
  }
  if (context && context.state === 'suspended') context.resume();
  return context || null;
}

function tone(freq, at, dur, type, gain) {
  const ac = ensure();
  if (!ac) return;
  const osc = ac.createOscillator();
  const amp = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const start = ac.currentTime + at;
  amp.gain.setValueAtTime(0.0001, start);
  amp.gain.exponentialRampToValueAtTime(gain, start + 0.02);
  amp.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  osc.connect(amp).connect(ac.destination);
  osc.start(start);
  osc.stop(start + dur + 0.05);
}

export function sfxFound() {
  tone(660, 0, 0.14, 'sine', 0.16);
  tone(880, 0.09, 0.2, 'sine', 0.16);
}

export function sfxMiss() {
  tone(150, 0, 0.18, 'square', 0.07);
}

export function sfxHint() {
  tone(520, 0, 0.12, 'triangle', 0.12);
  tone(520, 0.16, 0.12, 'triangle', 0.12);
}

export function sfxWin() {
  tone(523, 0, 0.16, 'sine', 0.16);
  tone(659, 0.13, 0.16, 'sine', 0.16);
  tone(784, 0.26, 0.16, 'sine', 0.16);
  tone(1047, 0.39, 0.3, 'sine', 0.18);
}

export function sfxLose() {
  tone(392, 0, 0.2, 'sine', 0.14);
  tone(330, 0.18, 0.2, 'sine', 0.14);
  tone(262, 0.36, 0.34, 'sine', 0.14);
}
