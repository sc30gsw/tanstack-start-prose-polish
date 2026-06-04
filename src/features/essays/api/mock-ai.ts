import { clamp, range, sample, sampleSize } from "es-toolkit";

import type { AiCorrectedBody } from "~/features/essays/schemas/ai-schema";
import type {
  EssayAiContext,
  EssayBodyInput,
} from "~/features/essays/schemas/essay-ai-input-schema";
import type { DiffCommentInput, Score } from "~/features/essays/schemas/essay-schema";
import { normalizeCorrectedBody } from "~/features/essays/utils/correction-comment-resolution";
import { topicPrompt } from "~/features/essays/utils/topic-prompt";

const TOPICS = [
  "Should artificial intelligence have legal rights? Discuss your perspective with specific examples.",
  "How has social media changed the way people form their identities? Use evidence to support your argument.",
  "What would the world look like if all countries adopted a four-day work week? Explore the potential benefits and challenges.",
] as const satisfies readonly string[];

const DIVERSE_MODE_SAMPLE_QUESTIONS = [
  "If you could eliminate one human emotion permanently from the world, which would you choose and why? Consider both personal and societal implications.",
  "Imagine you discovered a way to live forever, but only in your current physical form. Would you choose immortality, and what would be the consequences for humanity?",
  "If you could design the perfect educational system from scratch, what core principles would guide it, and how would it differ from today's schools?",
] as const satisfies readonly string[];

const MOCK_CORRECTIONS = [
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
] as const satisfies readonly Pick<DiffCommentInput, "body" | "suggestion">[];

export type EssayOpts = Pick<EssayAiContext, "mode" | "prompt">;

export function mockTopics() {
  return [...TOPICS];
}

export function mockDiverseQuestion() {
  return sample(DIVERSE_MODE_SAMPLE_QUESTIONS);
}

export function mockScore(text: string, opts?: EssayOpts): Score {
  const charCount = text.trim().length;
  const baseScore = clamp(40 + Math.floor(charCount / 200), 30, 95);
  const topic = topicPrompt(opts?.mode, opts?.prompt);

  return {
    cefr: scoreToCefr(baseScore),
    score: baseScore,
    scoreFeedback: buildScoreFeedback(baseScore),
    toeicMax: scoreToToeicMax(baseScore),
    toeicMin: scoreToToeicMin(baseScore),
    ...(topic != null
      ? {
          topicFeedback: `お題「${truncateTopic(topic, 40)}」におおむね沿った内容です。`,
          topicRelevance: "on_topic" as const,
        }
      : {}),
  } satisfies Score;
}

export function mockCorrectBody(text: string, _opts?: EssayOpts): { correctedBody: string } {
  const correctedLines = text.split("\n").map((line) => applySimpleCorrection(line));
  return { correctedBody: normalizeCorrectedBody(correctedLines.join("\n"), text) };
}

export function mockGenerateComments(
  _text: EssayBodyInput["text"],
  correctedBody: AiCorrectedBody["correctedBody"],
  opts?: EssayOpts,
) {
  return {
    comments: generateMockComments(correctedBody.split("\n"), opts),
  };
}

//? テーマ適合は topicFeedback の別軸評価。scoreFeedback には混入させない
function buildScoreFeedback(score: Score["score"]) {
  if (score >= 80) {
    return "語彙の多様性が高く、文章構造も安定しています。接続詞の使い方にやや改善の余地があります。";
  }

  if (score >= 60) {
    return "基本的な文法は押さえられています。より複雑な構文を取り入れることで表現力が向上するでしょう。";
  }

  return "基礎的な文法の見直しと、段落構成の整理をお勧めします。";
}

function truncateTopic(topic: string, maxChars: number) {
  return `${topic.slice(0, maxChars)}${topic.length > maxChars ? "…" : ""}`;
}

function scoreToCefr(score: Score["score"]) {
  if (score >= 90) {
    return "C2";
  }

  if (score >= 80) {
    return "C1";
  }

  if (score >= 68) {
    return "B2";
  }

  if (score >= 54) {
    return "B1";
  }

  return "A2";
}

function scoreToToeicMin(score: Score["score"]) {
  return Math.max(300, score * 9 - 20);
}

function scoreToToeicMax(score: Score["score"]) {
  return Math.min(990, score * 9 + 70);
}

function applySimpleCorrection(line: AiCorrectedBody["correctedBody"]) {
  return line
    .replace(/\b(i)\b(?=[^'])/g, "I")
    .replace(/\s{2,}/g, " ")
    .replace(/ ,/g, ",")
    .replace(/ \./g, ".")
    .trim();
}

function generateMockComments(lines: string[], opts?: EssayOpts) {
  const comments: Array<Pick<DiffCommentInput, "body" | "lineNumber" | "side" | "suggestion">> = [];

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
  const topic = topicPrompt(opts?.mode, opts?.prompt);

  if (topic != null && lines.length > 0) {
    const topicLine = Math.max(1, Math.floor(lines.length / 2));
    if (!usedLines.has(topicLine)) {
      comments.unshift({
        body: `Topic relevance check: Make sure your essay directly addresses the given topic — "${truncateTopic(topic, 60)}"`,
        lineNumber: topicLine,
        side: "additions",
        suggestion:
          "Add a clear thesis statement in your opening paragraph that explicitly references the topic.",
      });
    }
  }

  return comments;
}
