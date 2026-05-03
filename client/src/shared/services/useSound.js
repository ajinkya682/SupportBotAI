import { useCallback, useRef, useState, useEffect } from 'react';

/**
 * useSound Hook
 * Generates professional, non-intrusive notification sounds using Web Audio API.
 * Includes a global mute state saved in localStorage.
 */
export default function useSound() {
  const [isMuted, setIsMuted] = useState(() => localStorage.getItem('ag_muted') === 'true');
  const audioCtxRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('ag_muted', isMuted);
  }, [isMuted]);

  const toggleMute = () => setIsMuted(prev => !prev);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const playTone = useCallback((type) => {
    if (isMuted) return;
    initAudio();
    const ctx = audioCtxRef.current;
    
    const play = (freq, type = 'sine', duration = 0.1, volume = 0.1, delay = 0) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
      
      gain.gain.setValueAtTime(volume, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + delay + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + duration);
    };

    switch (type) {
      case 'new_ticket': // ding-dong
        play(523.25, 'triangle', 0.5, 0.1); // C5
        play(392.00, 'triangle', 0.5, 0.1, 0.2); // G4
        break;
      case 'high_intent': // alert chime
        play(880, 'sine', 0.2, 0.1);
        play(880, 'sine', 0.2, 0.1, 0.15);
        break;
      case 'pop': // message pop
        play(600, 'sine', 0.1, 0.05);
        break;
      case 'whoosh': // agent join
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(200, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
        break;
      case 'success': // resolved
        play(523.25, 'sine', 0.2, 0.1);
        play(659.25, 'sine', 0.2, 0.1, 0.1);
        play(783.99, 'sine', 0.4, 0.1, 0.2);
        break;
      default:
        play(440, 'sine', 0.1, 0.1);
    }
  }, [isMuted]);

  return { isMuted, toggleMute, playSound: playTone };
}
