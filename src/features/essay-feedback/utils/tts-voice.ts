import type { MantineColor } from "@mantine/core";

export type TtsLangCode = "en-AU" | "en-GB" | "en-US";

const TTS_LANG_META = {
  "en-AU": { color: "green", flag: "🇦🇺", label: "Australian" },
  "en-GB": { color: "red", flag: "🇬🇧", label: "British" },
  "en-US": { color: "blue", flag: "🇺🇸", label: "American" },
} as const satisfies Record<
  TtsLangCode,
  Record<"color", MantineColor> & Record<"flag" | "label", string>
>;

/** UI 表示順: アメリカ → イギリス → オーストラリア。各言語で女性→男性 */
export const TTS_ACCENT_ORDER = [
  "en-US",
  "en-GB",
  "en-AU",
] as const satisfies readonly TtsLangCode[];

const ACCENT_LABEL_JA = {
  "en-US": "アメリカ英語",
  "en-GB": "イギリス英語",
  "en-AU": "オーストラリア英語",
} as const satisfies Record<TtsLangCode, string>;

const TTS_LANG_CODES = Object.keys(TTS_LANG_META);

export const TTS_VOICE_STORAGE_KEY = "essay-feedback:tts-voice-uri";

/** 環境ごとの名前に合わせた優先キーワード（先頭ほど優先） */
const CURATED_NAME_SUBSTRINGS = {
  "en-US": {
    female: ["zira", "samantha", "ava", "jenny", "aria", "michelle"],
    male: ["david", "mark", "fred", "guy", "davis", "jason"],
  },
  "en-GB": {
    female: [
      "english (united kingdom",
      "united kingdom",
      "google uk english female",
      "united kingdom) - female",
      "great britain) - female",
      "british english female",
      "sonia",
      "libby",
      "maisie",
      "kate",
      "martha",
      "serena",
      "hazel",
      "susan",
      "amy",
      "emma",
      "megan",
      "flo",
      "tessa",
    ],
    male: [
      "english (united kingdom",
      "united kingdom",
      "google uk english male",
      "united kingdom) - male",
      "great britain) - male",
      "british english male",
      "george",
      "ryan",
      "thomas",
      "ollie",
      "alfie",
      "oliver",
      "arthur",
      "daniel",
      "brian",
      "malcolm",
    ],
  },
  "en-AU": {
    female: [
      "english (australia",
      "australia",
      "siri",
      "karen",
      "catherine",
      "nicole",
      "matilda",
      "australian english female",
    ],
    male: [
      "english (australia",
      "william",
      "australia",
      "australian english male",
      "english (australia) - male",
      "australia) - male",
      "lee",
      "russell",
      "aaron",
      "gordon",
      "darren",
      "simon",
      "james",
    ],
  },
} as const satisfies Record<TtsLangCode, Record<"female" | "male", string[]>>;

/** キーワードに無い環境向け: 音声名に含まれる性別の目安（先頭ほど優先） */
const FEMALE_NAME_FRAGMENTS = [
  "female",
  "woman",
  "zira",
  "heather",
  "hazel",
  "susan",
  "linda",
  "karen",
  "martha",
  "serena",
  "jenny",
  "aria",
  "samantha",
  "kimberly",
  "joanna",
  "amy",
  "emma",
  "sarah",
  "victoria",
  "nicole",
  "catherine",
  "florence",
] as const satisfies readonly string[];

const MALE_NAME_FRAGMENTS = [
  "male",
  "man",
  "david",
  "mark",
  "george",
  "ryan",
  "daniel",
  "guy",
  "fred",
  "james",
  "liam",
  "arthur",
  "thomas",
  "oliver",
  "brian",
  "aaron",
  "russell",
  "gordon",
  "wayne",
  "richard",
  "marcus",
  "jason",
  "davis",
  "lee",
] as const satisfies readonly string[];

export type CuratedTtsVoicePick = {
  curatedLabelJa: string;
  /** UI の国旗・色は枠のアクセントに合わせる（バックフィルで実声が米英語でもずれないように） */
  slotAccent: TtsLangCode;
  voice: SpeechSynthesisVoice;
};

type AnnotatedVoice = {
  accent: TtsLangCode;
  isDiscouraged: boolean;
  nameLower: string;
  qualityScore: number;
  voice: SpeechSynthesisVoice;
};

export function isTtsLang(lang: string): lang is TtsLangCode {
  const n = normalizeVoiceLang(lang);
  return TTS_LANG_CODES.includes(n);
}

/** BCP 47 相当（例: en-gb → en-GB）で揃え、lang 比較を環境差に強くする */
export function normalizeVoiceLang(lang: string): string {
  const s = lang.replaceAll("_", "-").trim();
  const i = s.indexOf("-");
  if (i === -1) return s.toLowerCase();
  return `${s.slice(0, i).toLowerCase()}-${s.slice(i + 1).toUpperCase()}`;
}

/**
 * BCP47 の lang が en-US に丸められていても、音声名に UK / Australia 等があればそちらを優先する。
 * 枠「3アクセント×男女」を揃えるための分類に使う。
 */
export function inferAccentFromVoice(voice: SpeechSynthesisVoice): TtsLangCode {
  const n = voice.name.toLowerCase();
  const langNorm = normalizeVoiceLang(voice.lang);

  // 「English (United Kingdom)」など括弧付き（環境によって lang が en-US のままのことがある）
  if (n.includes("english (united kingdom") || n.includes("english(united kingdom")) {
    return "en-GB";
  }
  if (n.includes("english (australia") || n.includes("english(australia")) {
    return "en-AU";
  }
  if (n.includes("english (united states") || n.includes("english (america")) {
    return "en-US";
  }

  if (
    n.includes("united kingdom") ||
    n.includes("great britain") ||
    n.includes("british") ||
    n.includes("(uk)") ||
    n.includes(" uk ") ||
    n.includes(" uk,") ||
    n.includes("uk english") ||
    n.includes("kingdom)") ||
    n.includes("en-gb")
  ) {
    return "en-GB";
  }
  if (n.includes("australia") || n.includes("australian") || n.includes("en-au")) {
    return "en-AU";
  }

  if (langNorm === "en-GB" || langNorm === "en-AU" || langNorm === "en-US") {
    return langNorm as TtsLangCode;
  }
  return "en-US";
}

export function getVoiceMeta(voice: SpeechSynthesisVoice): (typeof TTS_LANG_META)[TtsLangCode] {
  return TTS_LANG_META[inferAccentFromVoice(voice)];
}

/** ピッカー枠に対応する国旗・ラベル（キュレーションの slotAccent 用） */
export function getSlotAccentMeta(accent: TtsLangCode): (typeof TTS_LANG_META)[TtsLangCode] {
  return TTS_LANG_META[accent];
}

function voiceQualityScoreFromName(n: string): number {
  let s = 0;
  if (n.includes("enhanced")) s += 120;
  if (n.includes("generative")) s += 110;
  if (n.includes("premium")) s += 100;
  if (n.includes("neural")) s += 100;
  if (n.includes("wavenet")) s += 100;
  if (n.includes("online")) s += 60;
  if (n.includes("natural")) s += 50;
  if (n.includes("siri")) s += 40;
  if (n.includes("microsoft")) s += 25;
  if (n.includes("google")) s += 25;
  if (n.includes("compact")) s -= 80;
  if (n.includes("embeddable")) s -= 70;
  if (n.includes("downgraded")) s -= 60;
  if (n.includes("legacy")) s -= 40;
  if (n.includes("standard") && !n.includes("enhanced")) s -= 25;
  return s;
}

function isDiscouragedFromName(n: string): boolean {
  return n.includes("compact") || n.includes("embeddable") || n.includes("downgraded");
}

const ACCENT_UTTERANCE_LANG = {
  "en-US": "en-US",
  "en-GB": "en-GB",
  "en-AU": "en-AU",
} as const satisfies Record<TtsLangCode, string>;

/**
 * SpeechSynthesisUtterance.lang に渡す値。声のアクセントと一致させないと AU などで濁りやすい。
 */
export function utteranceLangForTts(
  voice: SpeechSynthesisVoice,
  slotAccent: TtsLangCode | undefined,
): string {
  if (slotAccent) return ACCENT_UTTERANCE_LANG[slotAccent];
  const n = normalizeVoiceLang(voice.lang);
  if (n.length >= 2 && n.slice(0, 2).toLowerCase() === "en") return n;
  return "en-US";
}

/** en-US 以外は rate を下げると環境によって母音が潰れて聞き取りづらい */
export function utteranceRateForTts(slotAccent: TtsLangCode | undefined): number {
  if (slotAccent === undefined || slotAccent === "en-US") return 0.85;
  return 1;
}

type ScoredVoicePick = { d: boolean; q: number; spec: number; v: SpeechSynthesisVoice };

function pickVoiceForSlot(
  annotated: readonly AnnotatedVoice[],
  accent: TtsLangCode,
  gender: "female" | "male",
  nameSubstrings: readonly string[],
  usedUris: Set<string>,
): SpeechSynthesisVoice | null {
  const scored: ScoredVoicePick[] = [];

  const pushMatches = (specBase: number, key: string) => {
    for (const a of annotated) {
      if (usedUris.has(a.voice.voiceURI)) continue;
      if (a.accent !== accent) continue;
      if (!a.nameLower.includes(key)) continue;
      scored.push({ d: a.isDiscouraged, q: a.qualityScore, spec: specBase, v: a.voice });
    }
  };

  for (let i = 0; i < nameSubstrings.length; i++) {
    const sub = nameSubstrings[i];
    if (sub === undefined) continue;
    pushMatches(i, sub);
  }

  const broad = gender === "female" ? FEMALE_NAME_FRAGMENTS : MALE_NAME_FRAGMENTS;
  for (let i = 0; i < broad.length; i++) {
    const frag = broad[i];
    if (frag === undefined) continue;
    pushMatches(1000 + i, frag);
  }

  if (scored.length === 0) return null;

  const byUri = new Map<string, ScoredVoicePick>();
  for (const s of scored) {
    const prev = byUri.get(s.v.voiceURI);
    if (!prev || s.spec < prev.spec || (s.spec === prev.spec && s.q > prev.q)) {
      byUri.set(s.v.voiceURI, s);
    }
  }

  let finalists = [...byUri.values()];
  const withoutDiscouraged = finalists.filter((s) => !s.d);
  if (withoutDiscouraged.length > 0) finalists = withoutDiscouraged;

  finalists.sort((a, b) => b.q - a.q || a.spec - b.spec);
  return finalists[0]?.v ?? null;
}

const CURATION_SLOTS = TTS_ACCENT_ORDER.flatMap((accent) =>
  (["female", "male"] as const).map((gender) => ({ accent, gender })),
);

function isLikelyEnglishTtsVoice(v: SpeechSynthesisVoice): boolean {
  const lang = normalizeVoiceLang(v.lang);
  if (lang.length >= 2 && lang.slice(0, 2).toLowerCase() === "en") return true;
  return /\benglish\b/i.test(v.name);
}

/**
 * 3アクセント × 男女の6枠。アクセント一致で埋まらない枠は、未使用の英語声を順に割り当てる（一覧は常に6件に近づける）。
 */
export function pickCuratedTtsVoices(voices: SpeechSynthesisVoice[]): CuratedTtsVoicePick[] {
  const annotated: AnnotatedVoice[] = voices.map((voice) => {
    const nameLower = voice.name.toLowerCase();
    return {
      accent: inferAccentFromVoice(voice),
      isDiscouraged: isDiscouragedFromName(nameLower),
      nameLower,
      qualityScore: voiceQualityScoreFromName(nameLower),
      voice,
    };
  });

  const usedUris = new Set<string>();
  const picks = Array.from(
    { length: CURATION_SLOTS.length },
    (): CuratedTtsVoicePick | null => null,
  );

  for (let i = 0; i < CURATION_SLOTS.length; i++) {
    const slot = CURATION_SLOTS[i];
    if (slot === undefined) continue;
    const { accent, gender } = slot;
    const subs = CURATED_NAME_SUBSTRINGS[accent][gender];
    const picked = pickVoiceForSlot(annotated, accent, gender, subs, usedUris);
    if (picked) {
      usedUris.add(picked.voiceURI);
      picks[i] = {
        curatedLabelJa: `${ACCENT_LABEL_JA[accent]}・${gender === "female" ? "女性" : "男性"}`,
        slotAccent: accent,
        voice: picked,
      };
    }
  }

  const englishUnused = annotated
    .filter((a) => !usedUris.has(a.voice.voiceURI) && isLikelyEnglishTtsVoice(a.voice))
    .sort((a, b) => {
      const q = b.qualityScore - a.qualityScore;
      if (q !== 0) return q;
      return a.voice.voiceURI.localeCompare(b.voice.voiceURI);
    });

  const pool = [...englishUnused];
  for (let i = 0; i < picks.length; i++) {
    if (picks[i] !== null) continue;
    const slot = CURATION_SLOTS[i];
    if (slot === undefined) continue;
    const { accent, gender } = slot;

    const accentIdx = pool.findIndex((a) => a.accent === accent);
    let entry: AnnotatedVoice | undefined =
      accentIdx === -1 ? undefined : pool.splice(accentIdx, 1)[0];
    if (entry === undefined) entry = pool.shift();
    if (entry === undefined) break;

    usedUris.add(entry.voice.voiceURI);
    picks[i] = {
      curatedLabelJa: `${ACCENT_LABEL_JA[accent]}・${gender === "female" ? "女性" : "男性"}`,
      slotAccent: accent,
      voice: entry.voice,
    };
  }

  return picks.filter((p): p is CuratedTtsVoicePick => p !== null);
}

export function getVoiceInitial(name: SpeechSynthesisVoice["name"]) {
  const match = name.match(/[A-Za-z]/);
  return match ? match[0].toUpperCase() : "?";
}

export function getVoiceAvatarUrl(voice: SpeechSynthesisVoice) {
  return `https://api.dicebear.com/9.x/bottts/svg?seed=${encodeURIComponent(voice.voiceURI)}`;
}
