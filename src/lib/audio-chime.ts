// Zero-dependency browser Web Audio API notification chime
// Produces a soft, clean, dual-harmonic notification sound (E5 -> B5 sparkle)

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  try {
    if (!audioContext || audioContext.state === "closed") {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (AudioContextClass) {
        audioContext = new AudioContextClass();
      }
    }
    if (audioContext && audioContext.state === "suspended") {
      void audioContext.resume();
    }
    return audioContext;
  } catch {
    return null;
  }
}

/**
 * Plays an elegant in-app notification chime.
 * Safe to call repeatedly; throttles overlapping bursts.
 */
let lastChimeTime = 0;

export function playNotificationChime(): void {
  if (typeof window === "undefined") return;

  const nowMs = Date.now();
  if (nowMs - lastChimeTime < 1000) {
    // Avoid repetitive overlapping chimes in quick succession
    return;
  }
  lastChimeTime = nowMs;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const startTime = ctx.currentTime + 0.02;

    // Primary Tone: E5 (659.25 Hz) - warm sine
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(659.25, startTime);
    gain1.gain.setValueAtTime(0.001, startTime);
    gain1.gain.linearRampToValueAtTime(0.12, startTime + 0.04);
    gain1.gain.exponentialRampToValueAtTime(0.001, startTime + 0.38);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(startTime);
    osc1.stop(startTime + 0.4);

    // Accent Sparkle Tone: B5 (987.77 Hz) - slight delay for melodious chime
    const sparkleStart = startTime + 0.09;
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(987.77, sparkleStart);
    gain2.gain.setValueAtTime(0.001, sparkleStart);
    gain2.gain.linearRampToValueAtTime(0.14, sparkleStart + 0.03);
    gain2.gain.exponentialRampToValueAtTime(0.001, sparkleStart + 0.45);

    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(sparkleStart);
    osc2.stop(sparkleStart + 0.48);
  } catch {
    // AudioContext blocked or user hasn't interacted yet; fail silently
  }
}
