import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export type TTSState = 'idle' | 'loading' | 'playing' | 'paused';
export type TTSProvider = 'browser' | 'openai';

export function useTTS(text: string) {
  const [state, setState] = useState<TTSState>('idle');
  const [progress, setProgress] = useState(0);
  const [rate, setRate] = useState(1);
  const [provider, setProvider] = useState<TTSProvider>('browser');

  // Browser TTS refs
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const charIndexRef = useRef(0);
  const totalCharsRef = useRef(text.length || 1);

  // OpenAI audio refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioBlobUrlRef = useRef<string | null>(null);

  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  // Load provider preference from site_settings
  useEffect(() => {
    supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'tts_provider')
      .maybeSingle()
      .then(({ data }) => {
        if (data?.value === 'openai') setProvider('openai');
        else setProvider('browser');
      });
  }, []);

  useEffect(() => {
    totalCharsRef.current = text.length || 1;
  }, [text]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (supported) window.speechSynthesis.cancel();
      if (audioBlobUrlRef.current) URL.revokeObjectURL(audioBlobUrlRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // ── Browser TTS ──────────────────────────────────────────────

  const buildUtterance = useCallback((fromChar = 0) => {
    const slice = text.slice(fromChar);
    const utt = new SpeechSynthesisUtterance(slice);
    utt.lang = 'tr-TR';
    utt.rate = rate;
    utt.onboundary = (e) => {
      if (e.name === 'word') {
        charIndexRef.current = fromChar + e.charIndex;
        setProgress(Math.min(100, Math.round(((fromChar + e.charIndex) / totalCharsRef.current) * 100)));
      }
    };
    utt.onend = () => { charIndexRef.current = 0; setProgress(100); setState('idle'); };
    utt.onerror = () => setState('idle');
    utteranceRef.current = utt;
    return utt;
  }, [text, rate]);

  const playBrowser = useCallback(() => {
    if (!supported) return;
    if (state === 'paused') {
      window.speechSynthesis.resume();
      setState('playing');
      return;
    }
    window.speechSynthesis.cancel();
    charIndexRef.current = 0;
    setProgress(0);
    window.speechSynthesis.speak(buildUtterance(0));
    setState('playing');
  }, [supported, state, buildUtterance]);

  const pauseBrowser = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.pause();
    setState('paused');
  }, [supported]);

  const stopBrowser = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
    charIndexRef.current = 0;
    setProgress(0);
    setState('idle');
  }, [supported]);

  const changeRateBrowser = useCallback((newRate: number) => {
    setRate(newRate);
    if (state === 'playing') {
      const fromChar = charIndexRef.current;
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(text.slice(fromChar));
      utt.lang = 'tr-TR';
      utt.rate = newRate;
      utt.onboundary = (e) => {
        if (e.name === 'word') {
          charIndexRef.current = fromChar + e.charIndex;
          setProgress(Math.min(100, Math.round(((fromChar + e.charIndex) / totalCharsRef.current) * 100)));
        }
      };
      utt.onend = () => { charIndexRef.current = 0; setProgress(100); setState('idle'); };
      utt.onerror = () => setState('idle');
      utteranceRef.current = utt;
      window.speechSynthesis.speak(utt);
    }
  }, [state, text]);

  // ── OpenAI TTS ───────────────────────────────────────────────

  const playOpenAI = useCallback(async () => {
    if (state === 'paused' && audioRef.current) {
      audioRef.current.playbackRate = rate;
      audioRef.current.play();
      setState('playing');
      return;
    }

    // Stop any existing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (audioBlobUrlRef.current) {
      URL.revokeObjectURL(audioBlobUrlRef.current);
      audioBlobUrlRef.current = null;
    }

    setState('loading');
    setProgress(0);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const res = await fetch(`${supabaseUrl}/functions/v1/generate-tts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token ?? anonKey}`,
          'Apikey': anonKey,
        },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        setState('idle');
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      audioBlobUrlRef.current = url;

      const audio = new Audio(url);
      audioRef.current = audio;
      audio.playbackRate = rate;

      audio.ontimeupdate = () => {
        if (audio.duration) {
          setProgress(Math.round((audio.currentTime / audio.duration) * 100));
        }
      };
      audio.onended = () => { setProgress(100); setState('idle'); };
      audio.onerror = () => setState('idle');

      await audio.play();
      setState('playing');
    } catch {
      setState('idle');
    }
  }, [state, text, rate]);

  const pauseOpenAI = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setState('paused');
    }
  }, []);

  const stopOpenAI = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    if (audioBlobUrlRef.current) {
      URL.revokeObjectURL(audioBlobUrlRef.current);
      audioBlobUrlRef.current = null;
    }
    setProgress(0);
    setState('idle');
  }, []);

  const changeRateOpenAI = useCallback((newRate: number) => {
    setRate(newRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = newRate;
    }
  }, []);

  // ── Unified API ──────────────────────────────────────────────

  const play = useCallback(() => {
    if (provider === 'openai') return playOpenAI();
    return playBrowser();
  }, [provider, playOpenAI, playBrowser]);

  const pause = useCallback(() => {
    if (provider === 'openai') return pauseOpenAI();
    return pauseBrowser();
  }, [provider, pauseOpenAI, pauseBrowser]);

  const stop = useCallback(() => {
    if (provider === 'openai') return stopOpenAI();
    return stopBrowser();
  }, [provider, stopOpenAI, stopBrowser]);

  const changeRate = useCallback((newRate: number) => {
    if (provider === 'openai') return changeRateOpenAI(newRate);
    return changeRateBrowser(newRate);
  }, [provider, changeRateOpenAI, changeRateBrowser]);

  return { state, progress, rate, provider, supported, play, pause, stop, changeRate };
}
