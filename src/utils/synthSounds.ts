/**
 * Synthesised game sounds generated programmatically via the Web Audio API.
 * No audio files are used — total audio asset size is 0 bytes.
 */

let sharedCtx: AudioContext | null = null;

/** Returns the shared AudioContext, creating it lazily on demand. */
export function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!sharedCtx) {
    try {
      sharedCtx = new AudioContext();
    } catch {
      return null;
    }
  }
  return sharedCtx;
}

function scheduleEnvelopedTone(
  ctx: AudioContext,
  frequency: number,
  type: OscillatorType,
  startTime: number,
  duration: number,
  peakGain: number,
  attackTime = 0.01,
): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.type = type;
  osc.frequency.setValueAtTime(frequency, startTime);

  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(peakGain, startTime + attackTime);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  osc.start(startTime);
  osc.stop(startTime + duration + 0.01);
}

/** Short 880 Hz chirp — plays on FEED GLORP click. */
export function synthClick(ctx: AudioContext): void {
  const t = ctx.currentTime;
  scheduleEnvelopedTone(ctx, 880, "sine", t, 0.08, 0.4, 0.005);
}

/** Ascending two-note chime — plays on any purchase. */
export function synthPurchase(ctx: AudioContext): void {
  const t = ctx.currentTime;
  scheduleEnvelopedTone(ctx, 440, "sine", t, 0.12, 0.35, 0.01);
  scheduleEnvelopedTone(ctx, 554.37, "sine", t + 0.1, 0.15, 0.35, 0.01);
}

/** Ascending C-major arpeggio — plays on evolution stage transition. */
export function synthEvolution(ctx: AudioContext): void {
  const t = ctx.currentTime;
  const notes = [261.63, 329.63, 392.0, 523.25]; // C4 E4 G4 C5
  for (let i = 0; i < notes.length; i++) {
    scheduleEnvelopedTone(ctx, notes[i], "sine", t + i * 0.12, 0.18, 0.3, 0.01);
  }
}

/** Warm four-note jingle — plays on offline-progress return. */
export function synthWelcomeBack(ctx: AudioContext): void {
  const t = ctx.currentTime;
  const notes = [523.25, 440.0, 349.23, 523.25]; // C5 A4 F4 C5
  for (let i = 0; i < notes.length; i++) {
    scheduleEnvelopedTone(ctx, notes[i], "sine", t + i * 0.15, 0.2, 0.28, 0.01);
  }
}

/** Triumphant two-note chime — plays when an achievement unlocks. */
export function synthAchievement(ctx: AudioContext): void {
  const t = ctx.currentTime;
  // G5 → C6: ascending perfect fourth with triangle wave for a badge feel
  scheduleEnvelopedTone(ctx, 783.99, "triangle", t, 0.15, 0.3, 0.01);
  scheduleEnvelopedTone(ctx, 1046.5, "triangle", t + 0.12, 0.25, 0.35, 0.01);
}

/** Bright ascending sparkle — plays when a Data Burst orb appears. */
export function synthBurst(ctx: AudioContext): void {
  const t = ctx.currentTime;
  // E5 G5 B5 — bright ascending triad with triangle wave for sparkle
  const notes = [659.25, 783.99, 987.77];
  for (let i = 0; i < notes.length; i++) {
    scheduleEnvelopedTone(
      ctx,
      notes[i],
      "triangle",
      t + i * 0.08,
      0.15,
      0.32,
      0.005,
    );
  }
}
