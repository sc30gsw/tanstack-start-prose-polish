import type { InstaQLEntity } from "@instantdb/react";
import type { MantineColor } from "@mantine/core";

import type { AppSchema } from "~/db/instant-schema";

export const ESSAY_MODE = ["free", "topic", "diverse"] as const satisfies readonly string[];
export const ESSAY_STATUS = ["draft", "scoring", "reviewed"] as const satisfies readonly string[];
export const MAX_ESSAY_BODY_CHARS = 10_000;
export const SCORE_CEFR = ["A1", "A2", "B1", "B2", "C1", "C2"] as const satisfies readonly string[];
export const DIFF_COMMENT_KIND = ["ai", "user"] as const satisfies readonly string[];

type ScoreCefr = (typeof SCORE_CEFR)[number];

/** 出典メタデータ。UI と CEFR_TOEIC_BANDS の citedAt を同期させる */
export const CEFR_TOEIC_BAND_SOURCE = {
  citedAt: "2026-04-27",
  publisher: "IIBC",
  testForm: "TOEIC Listening & Reading",
  url: "https://www.iibc-global.org/toeic/official_data.html",
} as const satisfies {
  citedAt: `${number}-${number}-${number}`;
  publisher: "IIBC";
  testForm: "TOEIC Listening & Reading";
  url: `https://www.${string}/${string}.html`;
};

/**
 * CEFR × TOEIC L&R 対応表
 *
 * 出典: IIBC 公開データ「TOEIC ProgramとCEFRの関係」
 * URL : https://www.iibc-global.org/toeic/official_data.html
 * 参照: 2026-04-27（CEFR_TOEIC_BAND_SOURCE.citedAt と同期）
 *
 * 算出方法: 各CEFRレベルのListening最低点 + Reading最低点 を合算スコアの下限とした。
 *   A1: 60+60=120, A2: 110+115=225, B1: 275+275=550, B2: 400+385=785, C1: 490+455=945
 *
 * 注意:
 *   - C2 は TOEIC L&R に公式マッピングなし。プロジェクト便宜上 990 単点。
 *   - IIBC 公開データは年度ごとに更新される可能性あり。
 */
export const CEFR_TOEIC_BANDS = {
  A1: { color: "gray.6", label: "A1 / 入門", toeicMax: 224, toeicMin: 120 },
  A2: { color: "cyan.6", label: "A2 / 初級", toeicMax: 549, toeicMin: 225 },
  B1: { color: "teal.6", label: "B1 / 中級", toeicMax: 784, toeicMin: 550 },
  B2: { color: "lime.7", label: "B2 / 中上級", toeicMax: 944, toeicMin: 785 },
  C1: { color: "orange.7", label: "C1 / 上級", toeicMax: 990, toeicMin: 945 },
  C2: { color: "red.7", label: "C2 / 最上級*", toeicMax: 990, toeicMin: 990 },
} as const satisfies Record<
  ScoreCefr,
  {
    color: MantineColor;
    label: string;
  } & Pick<InstaQLEntity<AppSchema, "scores">, "toeicMax" | "toeicMin">
>;
