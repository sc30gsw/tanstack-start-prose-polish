import type { MantineColor } from "@mantine/core";

export type TtsLangCode = "en-AU" | "en-CA" | "en-GB" | "en-US";

const TTS_LANG_META = {
  "en-AU": { color: "green", flag: "🇦🇺", label: "Australian" },
  "en-CA": { color: "orange", flag: "🇨🇦", label: "Canadian" },
  "en-GB": { color: "red", flag: "🇬🇧", label: "British" },
  "en-US": { color: "blue", flag: "🇺🇸", label: "American" },
} as const satisfies Record<
  TtsLangCode,
  Record<"color", MantineColor> & Record<"flag" | "label", string>
>;

/** UI 表示順: アメリカ → イギリス → オーストラリア → カナダ。各言語で女性→男性 */
export const TTS_ACCENT_ORDER = [
  "en-US",
  "en-GB",
  "en-AU",
  "en-CA",
] as const satisfies readonly TtsLangCode[];

const ACCENT_LABEL_JA = {
  "en-US": "アメリカ英語",
  "en-GB": "イギリス英語",
  "en-AU": "オーストラリア英語",
  "en-CA": "カナダ英語",
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
      "martha",
      "libby",
      "maisie",
      "serena",
      "hazel",
      "susan",
      "amy",
      "emma",
      "megan",
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
      "karen",
      "catherine",
      "nicole",
      "matilda",
      "australian english female",
    ],
    male: [
      "english (australia",
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
  "en-CA": {
    female: [
      "english (canada",
      "canada",
      "google canada english female",
      "canada english female",
      "canadian english female",
      "english (canada) - female",
      "canada) - female",
      "heather",
      "linda",
      "clara",
      "susan",
      "melanie",
    ],
    male: [
      "english (canada",
      "canada",
      "google canada english male",
      "canada english male",
      "canadian english male",
      "english (canada) - male",
      "canada) - male",
      "liam",
      "wayne",
      "richard",
      "marcus",
      "jacques",
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
] as const satisfies readonly string[];

export type CuratedTtsVoicePick = {
  curatedLabelJa: string;
  /** UI の国旗・色は枠のアクセントに合わせる（バックフィルで実声が米英語でもずれないように） */
  slotAccent: TtsLangCode;
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
 * 枠「4アクセント×男女」を揃えるための分類に使う。
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
  if (n.includes("english (canada") || n.includes("english(canada")) {
    return "en-CA";
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
  if (n.includes("canada") || n.includes("canadian") || n.includes("en-ca")) {
    return "en-CA";
  }

  if (
    langNorm === "en-GB" ||
    langNorm === "en-AU" ||
    langNorm === "en-CA" ||
    langNorm === "en-US"
  ) {
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

function pickVoiceForSlot(
  voices: SpeechSynthesisVoice[],
  accent: TtsLangCode,
  gender: "female" | "male",
  nameSubstrings: string[],
  usedUris: Set<string>,
): SpeechSynthesisVoice | null {
  for (const sub of nameSubstrings) {
    const key = sub.toLowerCase();
    for (const v of voices) {
      if (usedUris.has(v.voiceURI)) continue;
      if (inferAccentFromVoice(v) !== accent) continue;
      if (!v.name.toLowerCase().includes(key)) continue;
      return v;
    }
  }

  const broad = gender === "female" ? FEMALE_NAME_FRAGMENTS : MALE_NAME_FRAGMENTS;
  for (const fragment of broad) {
    for (const v of voices) {
      if (usedUris.has(v.voiceURI)) continue;
      if (inferAccentFromVoice(v) !== accent) continue;
      if (!v.name.toLowerCase().includes(fragment)) continue;
      return v;
    }
  }

  for (const v of voices) {
    if (usedUris.has(v.voiceURI)) continue;
    if (inferAccentFromVoice(v) !== accent) continue;
    return v;
  }

  return null;
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
 * 4アクセント × 男女の8枠。アクセント一致で埋まらない枠は、未使用の英語声を順に割り当てる（一覧は常に8件に近づける）。
 */
export function pickCuratedTtsVoices(voices: SpeechSynthesisVoice[]): CuratedTtsVoicePick[] {
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
    const picked = pickVoiceForSlot(voices, accent, gender, subs, usedUris);
    if (picked) {
      usedUris.add(picked.voiceURI);
      picks[i] = {
        curatedLabelJa: `${ACCENT_LABEL_JA[accent]}・${gender === "female" ? "女性" : "男性"}`,
        slotAccent: accent,
        voice: picked,
      };
    }
  }

  const englishUnused = [...voices]
    .filter((v) => !usedUris.has(v.voiceURI) && isLikelyEnglishTtsVoice(v))
    .sort((a, b) => a.voiceURI.localeCompare(b.voiceURI));

  let bi = 0;
  for (let i = 0; i < picks.length; i++) {
    if (picks[i] !== null) continue;
    const v = englishUnused[bi];
    if (v === undefined) break;
    bi++;
    usedUris.add(v.voiceURI);
    const slot = CURATION_SLOTS[i];
    if (slot === undefined) continue;
    const { accent, gender } = slot;
    picks[i] = {
      curatedLabelJa: `${ACCENT_LABEL_JA[accent]}・${gender === "female" ? "女性" : "男性"}`,
      slotAccent: accent,
      voice: v,
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
