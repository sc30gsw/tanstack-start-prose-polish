import { useCallback, useEffect, useState } from "react";

/** 音読＝前後の単語を区別、シャドーイング＝未発音だけ隠し発音済みは残す */
export type TtsDisplayMode = "aloud" | "shadowing";

const PREFERRED_VOICE_NAMES = [
  "Google US English",
  "Microsoft Zira - English (United States)",
  "Microsoft David - English (United States)",
  "Samantha",
  "Alex",
  "Karen",
  "Daniel",
];

function getBestEnglishVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  for (const name of PREFERRED_VOICE_NAMES) {
    const found = voices.find((v) => v.name === name);
    if (found) return found;
  }
  return (
    voices.find((v) => v.lang === "en-US" && v.localService) ??
    voices.find((v) => v.lang === "en-US") ??
    voices.find((v) => v.lang.startsWith("en")) ??
    null
  );
}

export function useTts(text: string) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [isSupported, setIsSupported] = useState(false);
  const [voicesReady, setVoicesReady] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    setIsSupported(true);

    const onVoicesChanged = () => setVoicesReady(true);
    window.speechSynthesis.addEventListener("voiceschanged", onVoicesChanged);

    if (window.speechSynthesis.getVoices().length > 0) {
      setVoicesReady(true);
    }

    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", onVoicesChanged);
    };
  }, []);

  const play = useCallback(() => {
    if (!isSupported) return;

    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPlaying(true);
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.85;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    if (voicesReady) {
      const voice = getBestEnglishVoice();
      if (voice) utterance.voice = voice;
    }

    utterance.onstart = () => {
      // boundary 発火前に先頭単語を示す（対応引擎のみ）
      setCurrentWordIndex(0);
    };

    utterance.onboundary = (event) => {
      if (event.name === "word") {
        const upToChar = text.slice(0, event.charIndex);
        const wordIdx = upToChar.split(/\s+/).length - 1;
        setCurrentWordIndex(wordIdx);
      }
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setCurrentWordIndex(-1);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
      setCurrentWordIndex(-1);
    };

    setIsPlaying(true);
    window.speechSynthesis.speak(utterance);
  }, [text, isSupported, voicesReady]);

  const stop = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setCurrentWordIndex(-1);
  }, [isSupported]);

  useEffect(() => {
    return () => {
      if (isSupported) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isSupported]);

  return { currentWordIndex, isPlaying, isSupported, play, stop };
}
