import { useCallback, useEffect, useState } from "react";

import {
  TTS_VOICE_STORAGE_KEY,
  type TtsLangCode,
  inferAccentFromVoice,
  pickCuratedTtsVoices,
  utteranceLangForTts,
  utteranceRateForTts,
} from "~/features/essay-feedback/utils/tts-voice";

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
  }: {
    onIdle: () => void;
    onPlaying: () => void;
    setCurrentWordIndex: (i: number) => void;
  },
) {
  utterance.onstart = () => {
    onPlaying();
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
  const [voicesReady, setVoicesReady] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceLabelJaByUri, setVoiceLabelJaByUri] = useState<Record<string, string>>({});
  const [voiceSlotAccentByUri, setVoiceSlotAccentByUri] = useState<Record<string, TtsLangCode>>({});
  const [selectedVoiceURI, setSelectedVoiceURIState] = useState<string | null>(null);

  const setIdle = useCallback(() => {
    setPlaybackState("idle");
  }, []);

  const setPlaying = useCallback(() => {
    setPlaybackState("playing");
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    setIsSupported(true);

    let initialized = false;

    const initVoices = () => {
      const picks = pickCuratedTtsVoices(window.speechSynthesis.getVoices());
      const flatVoices = picks.map((p) => p.voice);
      setVoices(flatVoices);
      setVoiceLabelJaByUri(
        Object.fromEntries(picks.map((p) => [p.voice.voiceURI, p.curatedLabelJa])),
      );
      setVoiceSlotAccentByUri(
        Object.fromEntries(picks.map((p) => [p.voice.voiceURI, p.slotAccent])),
      );
      setVoicesReady(true);

      if (!initialized && flatVoices.length > 0) {
        initialized = true;
        const stored = window.localStorage.getItem(TTS_VOICE_STORAGE_KEY);
        const uris = new Set(flatVoices.map((v) => v.voiceURI));
        if (stored && uris.has(stored)) {
          setSelectedVoiceURIState(stored);
        } else {
          setSelectedVoiceURIState(flatVoices[0]?.voiceURI ?? null);
        }
      }
    };

    window.speechSynthesis.addEventListener("voiceschanged", initVoices);

    if (window.speechSynthesis.getVoices().length > 0) {
      initVoices();
    }

    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", initVoices);
    };
  }, []);

  const setSelectedVoiceURI = useCallback((uri: string | null) => {
    setSelectedVoiceURIState(uri);
    if (uri) {
      window.localStorage.setItem(TTS_VOICE_STORAGE_KEY, uri);
    } else {
      window.localStorage.removeItem(TTS_VOICE_STORAGE_KEY);
    }
  }, []);

  const beginSpeakingFromStart = useCallback(() => {
    if (!isSupported) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    if (voicesReady) {
      const picked =
        (selectedVoiceURI ? voices.find((v) => v.voiceURI === selectedVoiceURI) : null) ??
        getBestEnglishVoice();
      if (picked) {
        utterance.voice = picked;
        const accentForSynth =
          (selectedVoiceURI ? voiceSlotAccentByUri[selectedVoiceURI] : undefined) ??
          inferAccentFromVoice(picked);
        utterance.lang = utteranceLangForTts(picked, accentForSynth);
        utterance.rate = utteranceRateForTts(accentForSynth);
      } else {
        utterance.lang = "en-US";
        utterance.rate = utteranceRateForTts(undefined);
      }
    } else {
      utterance.lang = "en-US";
      utterance.rate = utteranceRateForTts(undefined);
    }

    attachUtteranceHandlers(utterance, text, {
      onIdle: setIdle,
      onPlaying: setPlaying,
      setCurrentWordIndex,
    });

    setPlaybackState("playing");
    window.speechSynthesis.speak(utterance);
  }, [
    isSupported,
    selectedVoiceURI,
    setIdle,
    setPlaying,
    text,
    voiceSlotAccentByUri,
    voices,
    voicesReady,
  ]);

  const play = useCallback(() => {
    if (!isSupported) return;

    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setPlaybackState("playing");
      return;
    }

    if (window.speechSynthesis.speaking) {
      return;
    }

    window.speechSynthesis.cancel();
    queueMicrotask(() => {
      beginSpeakingFromStart();
    });
  }, [beginSpeakingFromStart, isSupported]);

  const playFromStart = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setCurrentWordIndex(-1);
    queueMicrotask(() => {
      beginSpeakingFromStart();
    });
  }, [beginSpeakingFromStart, isSupported]);

  const pause = useCallback(() => {
    if (!isSupported) return;
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      setPlaybackState("paused");
    }
  }, [isSupported]);

  /** 再生を止め先頭に戻す（表示モード切替など）。読み上げは自動では再開しない */
  const resetPlayback = useCallback(() => {
    if (!isSupported) return;
    //? pause 状態のまま cancel() すると Chromium 系で paused フラグが残り、
    //? 次回 play() が resume() 経路に入って空キューを再開してしまうため、先に解除する
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
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
    selectedVoiceURI,
    setSelectedVoiceURI,
    voiceLabelJaByUri,
    voiceSlotAccentByUri,
    voices,
  };
}
