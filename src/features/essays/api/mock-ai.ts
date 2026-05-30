import { clamp, range, sample, sampleSize } from "es-toolkit";

import type { Score } from "~/features/essays/schemas/essay-schema";

const TOPICS = [
  "Should artificial intelligence have legal rights? Discuss your perspective with specific examples.",
  "How has social media changed the way people form their identities? Use evidence to support your argument.",
  "What would the world look like if all countries adopted a four-day work week? Explore the potential benefits and challenges.",
];

/** 「多様なお題」モード用サンプル（仮定・文化・意見など幅広い英文プロンプト） */
const DIVERSE_MODE_SAMPLE_QUESTIONS = [
  "If you could eliminate one human emotion permanently from the world, which would you choose and why? Consider both personal and societal implications.",
  "Imagine you discovered a way to live forever, but only in your current physical form. Would you choose immortality, and what would be the consequences for humanity?",
  "If you could design the perfect educational system from scratch, what core principles would guide it, and how would it differ from today's schools?",
];

const MOCK_CORRECTIONS: Array<{ body: string; suggestion: string }> = [
  {
    body: "Passive voice weakens the impact here. Consider using an active construction.",
    suggestion: "Put the doer of the action before the verb so the sentence reads more directly.",
  },
  {
    body: "This transition is abrupt. The reader needs a bridge between these ideas.",
    suggestion: 'Add a transitional phrase such as "Furthermore" or "Building on this idea".',
  },
  {
    body: 'Vague pronoun reference — it\'s unclear what "it" refers to.',
    suggestion: 'Replace "it" with the specific noun it represents.',
  },
  {
    body: "Subject-verb agreement error detected.",
    suggestion: 'The subject is plural, so the verb should be "are" rather than "is".',
  },
  {
    body: "This word choice is informal for academic writing.",
    suggestion: 'Consider replacing "a lot of" with "numerous" or "a significant number of".',
  },
];

export type EssayOpts = { mode?: string; prompt?: string };

export type CorrectionComment = {
  body: string;
  lineNumber: number;
  side: "additions" | "deletions";
  suggestion?: string;
};

export type CorrectionResult = {
  comments: CorrectionComment[];
  correctedBody: string;
};

export function mockTopics(): string[] {
  return [...TOPICS];
}

export function mockDiverseQuestion(): string {
  return sample(DIVERSE_MODE_SAMPLE_QUESTIONS) as string;
}

export function mockScore(text: string, opts?: EssayOpts): Score {
  const charCount = text.trim().length;
  const baseScore = clamp(40 + Math.floor(charCount / 200), 30, 95);

  return {
    cefr: scoreToCefr(baseScore),
    score: baseScore,
    scoreFeedback: buildScoreFeedback(baseScore, opts),
    toeicMax: scoreToToeicMax(baseScore),
    toeicMin: scoreToToeicMin(baseScore),
  } satisfies Score;
}

export function mockCorrect(text: string, opts?: EssayOpts): CorrectionResult {
  const lines = text.split("\n");
  const correctedLines = lines.map((line) => applySimpleCorrection(line));
  let correctedBody = correctedLines.join("\n");
  // @pierre/diffs / parseDiffFromFile は前後が完全一致だと hunk が 0 になり、本文が一切描画されない
  if (correctedBody === text) {
    correctedBody = `${text}\n`;
  }

  return { comments: generateMockComments(lines, opts), correctedBody };
}

function buildScoreFeedback(score: number, opts?: EssayOpts): string {
  const topicNote =
    opts?.mode === "topic" && opts.prompt != null
      ? ` お題「${opts.prompt.slice(0, 40)}${opts.prompt.length > 40 ? "…" : ""}」との内容合致度も評価に含まれています。`
      : "";

  if (score >= 80)
    return `語彙の多様性が高く、文章構造も安定しています。接続詞の使い方にやや改善の余地があります。${topicNote}`;
  if (score >= 60)
    return `基本的な文法は押さえられています。より複雑な構文を取り入れることで表現力が向上するでしょう。${topicNote}`;
  return `基礎的な文法の見直しと、段落構成の整理をお勧めします。${topicNote}`;
}

function scoreToCefr(score: number): Score["cefr"] {
  if (score >= 90) return "C2";
  if (score >= 80) return "C1";
  if (score >= 68) return "B2";
  if (score >= 54) return "B1";
  if (score >= 40) return "A2";
  return "A1";
}

function scoreToToeicMin(score: number): number {
  return Math.max(300, score * 9 - 20);
}

function scoreToToeicMax(score: number): number {
  return Math.min(990, score * 9 + 70);
}

function applySimpleCorrection(line: string): string {
  return line
    .replace(/\b(i)\b(?=[^'])/g, "I")
    .replace(/\s{2,}/g, " ")
    .replace(/ ,/g, ",")
    .replace(/ \./g, ".")
    .trim();
}

function generateMockComments(lines: string[], opts?: EssayOpts): CorrectionComment[] {
  const comments: CorrectionComment[] = [];

  const targetCount = Math.min(MOCK_CORRECTIONS.length, Math.floor(lines.length / 3) + 1);
  const lineNumbers = sampleSize(range(1, lines.length + 1), Math.min(targetCount, lines.length));

  for (let i = 0; i < lineNumbers.length; i++) {
    const lineNumber = lineNumbers[i]!;
    const correction = MOCK_CORRECTIONS[i % MOCK_CORRECTIONS.length];
    if (correction == null) continue;

    comments.push({
      body: correction.body,
      lineNumber,
      side: "additions",
      suggestion: correction.suggestion,
    });
  }

  const usedLines = new Set(lineNumbers);

  if (opts?.mode === "topic" && opts.prompt != null && lines.length > 0) {
    const topicLine = Math.max(1, Math.floor(lines.length / 2));
    if (!usedLines.has(topicLine)) {
      comments.unshift({
        body: `Topic relevance check: Make sure your essay directly addresses the given topic — "${opts.prompt.slice(0, 60)}${opts.prompt.length > 60 ? "…" : ""}"`,
        lineNumber: topicLine,
        side: "additions",
        suggestion:
          "Add a clear thesis statement in your opening paragraph that explicitly references the topic.",
      });
    }
  }

  return comments;
}
