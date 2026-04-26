import { type MutableRefObject, useCallback, useEffect, useRef, useState } from "react";

/** 音読＝前後の単語を区別、シャドーイング＝未発音だけ隠し発音済みは残す */
export type TtsDisplayMode = "aloud" | "shadowing";

/** idle=未開始または終了、playing=再生中、paused=一時停止 */
export type TtsPlaybackState = "idle" | "paused" | "playing";

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

function attachUtteranceHandlers(
  utterance: SpeechSynthesisUtterance,
  text: string,
  {
    onPlaying,
    onIdle,
    setCurrentWordIndex,
    userInitiatedPauseRef,
  }: {
    onIdle: () => void;
    onPlaying: () => void;
    setCurrentWordIndex: (i: number) => void;
    userInitiatedPauseRef: MutableRefObject<boolean>;
  },
) {
  utterance.onstart = () => {
    onPlaying();
    // boundary 発火前に先頭単語を示す（対応引擎のみ）
    setCurrentWordIndex(0);
  };

  //? Arc Browser など一部の Chromium 系ブラウザは onstart 直後に自動で pause する。
  //? その場合だけ即 resume する。ユーザーが押した一時停止では resume しない。
  utterance.onpause = () => {
    if (userInitiatedPauseRef.current) return;
    window.speechSynthesis.resume();
  };

  utterance.onboundary = (event) => {
    if (event.name === "word") {
      const upToChar = text.slice(0, event.charIndex);
      const wordIdx = upToChar.split(/\s+/).length - 1;
      setCurrentWordIndex(wordIdx);
    }
  };

  utterance.onend = () => {
    onIdle();
    setCurrentWordIndex(-1);
  };

  utterance.onerror = () => {
    onIdle();
    setCurrentWordIndex(-1);
  };
}

export function useTts(text: string) {
  const [playbackState, setPlaybackState] = useState<TtsPlaybackState>("idle");
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [isSupported, setIsSupported] = useState(false);
  /** ユーザーが UI で一時停止したとき true。Arc 等の意図しない auto-pause だけ resume する判別に使う */
  const userInitiatedPauseRef = useRef(false);

  const setIdle = useCallback(() => {
    userInitiatedPauseRef.current = false;
    setPlaybackState("idle");
  }, []);

  const setPlaying = useCallback(() => {
    setPlaybackState("playing");
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    setIsSupported(true);

    // Chromium: 初回は空配列のことがあり、getVoices を触ると voiceschanged が安定しやすい
    void window.speechSynthesis.getVoices();
    const onVoicesChanged = () => {
      void window.speechSynthesis.getVoices();
    };
    window.speechSynthesis.addEventListener("voiceschanged", onVoicesChanged);

    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", onVoicesChanged);
    };
  }, []);

  const beginSpeakingFromStart = useCallback(() => {
    if (!isSupported) return;
    if (!text.trim()) {
      setIdle();
      return;
    }

    // 毎回呼ぶ（Web Speech の音声一覧は遅延ロードされうる）
    void window.speechSynthesis.getVoices();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.85;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    const voice = getBestEnglishVoice();
    if (voice) utterance.voice = voice;

    userInitiatedPauseRef.current = false;

    attachUtteranceHandlers(utterance, text, {
      onIdle: setIdle,
      onPlaying: setPlaying,
      setCurrentWordIndex,
      userInitiatedPauseRef,
    });

    setPlaybackState("playing");
    window.speechSynthesis.speak(utterance);
  }, [isSupported, setIdle, setPlaying, text]);

  const play = useCallback(() => {
    if (!isSupported) return;

    if (window.speechSynthesis.paused) {
      userInitiatedPauseRef.current = false;
      window.speechSynthesis.resume();
      setPlaybackState("playing");
      return;
    }

    // speaking が true のまま固まるケースや、内部状態と React の desync を cancel で解消する
    window.speechSynthesis.cancel();
    beginSpeakingFromStart();
  }, [beginSpeakingFromStart, isSupported]);

  const playFromStart = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setCurrentWordIndex(-1);
    beginSpeakingFromStart();
  }, [beginSpeakingFromStart, isSupported]);

  const pause = useCallback(() => {
    if (!isSupported) return;
    if (window.speechSynthesis.speaking) {
      userInitiatedPauseRef.current = true;
      window.speechSynthesis.pause();
      setPlaybackState("paused");
    }
  }, [isSupported]);

  /** 再生を止め先頭に戻す（表示モード切替など）。読み上げは自動では再開しない */
  const resetPlayback = useCallback(() => {
    if (!isSupported) return;
    userInitiatedPauseRef.current = false;
    window.speechSynthesis.cancel();
    setPlaybackState("idle");
    setCurrentWordIndex(-1);
  }, [isSupported]);

  useEffect(() => {
    return () => {
      if (isSupported) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isSupported]);

  const isPlaybackActive = playbackState !== "idle";

  return {
    currentWordIndex,
    isPlaybackActive,
    isSupported,
    pause,
    play,
    playbackState,
    playFromStart,
    resetPlayback,
  };
}
