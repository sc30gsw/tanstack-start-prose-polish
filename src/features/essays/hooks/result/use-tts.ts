import type { InstaQLEntity } from "@instantdb/react";
import { useEffect, useRef, useState } from "react";

import type { AppSchema } from "~/db/instant-schema";
import type { EssayResultSearchParams } from "~/features/essays/schemas/search-params/essay-result-search-params";

type TtsPlaybackState = "idle" | "paused" | "playing";

const ACCENT_VOICE_NAMES = {
  "american-female": [
    "Samantha",
    "Microsoft Zira - English (United States)",
    "Microsoft Aria Online (Natural) - English (United States)",
  ],
  //! Daniel は macOS デフォルト en-GB 男性音声（標準インストール済み）
  "british-male": [
    "Daniel",
    "Arthur",
    "Oliver",
    "Google UK English Male",
    "Microsoft George - English (United Kingdom)",
    "Microsoft Ryan Online (Natural) - English (United Kingdom)",
  ],
} as const satisfies Record<EssayResultSearchParams["accent"], readonly string[]>;

const ACCENT_LANG = {
  "american-female": "en-US",
  "british-male": "en-GB",
} as const satisfies Record<EssayResultSearchParams["accent"], string>;

const DEFAULT_SPEECH_UTTERANCE = {
  pitch: 1,
  rate: 0.85,
  volume: 1,
} as const satisfies Pick<SpeechSynthesisUtterance, "pitch" | "rate" | "volume">;

function getVoiceForAccent(accent: EssayResultSearchParams["accent"]) {
  const voices = window.speechSynthesis.getVoices();

  for (const name of ACCENT_VOICE_NAMES[accent]) {
    const found = voices.find((v) => v.name === name);

    if (found) {
      return found;
    }
  }

  const lang = ACCENT_LANG[accent];
  return (
    voices.find((v) => v.lang === lang && v.localService) ??
    voices.find((v) => v.lang === lang) ??
    voices.find((v) => v.lang.startsWith(lang.split("-")[0] ?? lang)) ??
    null
  );
}

type AttachUtteranceHandlersProps = {
  onIdle: () => void;
  setCurrentWordIndex: (i: number) => void;
  userInitiatedPauseRef: { current: boolean };
};

function attachUtteranceHandlers(
  utterance: SpeechSynthesisUtterance,
  text: NonNullable<InstaQLEntity<AppSchema, "essays">["bodyAfter"]>,
  { onIdle, setCurrentWordIndex, userInitiatedPauseRef }: AttachUtteranceHandlersProps,
) {
  utterance.onstart = () => {
    setCurrentWordIndex(0);
  };

  //? Arc Browser など一部の Chromium 系ブラウザは onstart 直後に自動で pause する。
  //? その場合だけ即 resume する。ユーザーが押した一時停止では resume しない。
  utterance.onpause = () => {
    if (userInitiatedPauseRef.current) {
      return;
    }

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

  //? cancel() 後に発火する "canceled"/"interrupted" は無視する。
  //? cancel() → beginSpeakingFromStart() の連続呼び出し時に onerror が新規 utterance の状態を上書きするのを防ぐ。
  utterance.onerror = (event) => {
    if (event.error === "canceled" || event.error === "interrupted") return;
    onIdle();
    setCurrentWordIndex(-1);
  };
}

type UseTtsProps = {
  accent: EssayResultSearchParams["accent"];
  text: NonNullable<InstaQLEntity<AppSchema, "essays">["bodyAfter"]>;
};

export function useTts({ accent, text }: UseTtsProps) {
  const [playbackState, setPlaybackState] = useState<TtsPlaybackState>("idle");
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [isSupported, setIsSupported] = useState(false);
  const userInitiatedPauseRef = useRef(false);

  function setIdle() {
    userInitiatedPauseRef.current = false;
    setPlaybackState("idle");
  }

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

  function beginSpeakingFromStart() {
    if (!isSupported) return;
    if (!text.trim()) {
      setIdle();
      return;
    }

    //? 毎回呼ぶ（Web Speech の音声一覧は遅延ロードされうる）
    void window.speechSynthesis.getVoices();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = ACCENT_LANG[accent];
    utterance.rate = DEFAULT_SPEECH_UTTERANCE.rate;
    utterance.pitch = DEFAULT_SPEECH_UTTERANCE.pitch;
    utterance.volume = DEFAULT_SPEECH_UTTERANCE.volume;

    const voice = getVoiceForAccent(accent);

    if (voice) {
      utterance.voice = voice;
    }

    userInitiatedPauseRef.current = false;

    attachUtteranceHandlers(utterance, text, {
      onIdle: setIdle,
      setCurrentWordIndex,
      userInitiatedPauseRef,
    });

    setPlaybackState("playing");
    window.speechSynthesis.speak(utterance);
  }

  function play() {
    if (!isSupported) {
      return;
    }

    if (window.speechSynthesis.paused) {
      userInitiatedPauseRef.current = false;
      window.speechSynthesis.resume();
      setPlaybackState("playing");
      return;
    }

    //? speaking が true のまま固まるケースや、内部状態と React の desync を cancel で解消する
    window.speechSynthesis.cancel();
    beginSpeakingFromStart();
  }

  function playFromStart() {
    if (!isSupported) {
      return;
    }

    window.speechSynthesis.cancel();
    setCurrentWordIndex(-1);
    beginSpeakingFromStart();
  }

  function pause() {
    if (!isSupported) {
      return;
    }

    if (window.speechSynthesis.speaking) {
      userInitiatedPauseRef.current = true;
      window.speechSynthesis.pause();
      setPlaybackState("paused");
    }
  }

  function resetPlayback() {
    if (!isSupported) {
      return;
    }

    userInitiatedPauseRef.current = false;
    window.speechSynthesis.cancel();
    setPlaybackState("idle");
    setCurrentWordIndex(-1);
  }

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

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
  } as const;
}
