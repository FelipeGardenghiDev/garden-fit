export function playTimerCompletionAlert(): void {
  try {
    // 1. Tocar sinal sonoro via Web Audio API
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // Nota Lá (A5)
      osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.15); // Sobe para Lá (A6)

      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    }

    // 2. Feedback háptico no celular Android
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200, 100, 300]);
    }
  } catch (e) {
    console.warn('Erro ao tocar alerta do timer:', e);
  }
}
