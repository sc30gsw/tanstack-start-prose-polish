# 実装計画: AI 連携（3.2.1 B/C・3.3.1 採点・添削）

mock を実 AI（Vercel AI Gateway）に置換する。`/grill-me` で確定した 18 + 細部決定に基づく。

## 確定事項

| #    | 決定                                                                                   |
| ---- | -------------------------------------------------------------------------------------- |
| Q1   | プロバイダ = Vercel AI Gateway（単一キー・model string）                               |
| Q2   | 採点 = `streamText` + `Output.object` で 3 段階維持（`useObject` 互換ストリーム）      |
| Q3   | 添削 = スニペット照合（サーバが行番号算出, `side:'additions'`）                        |
| Q4   | キー未設定 = mock 退避（`mock-ai.ts` 残す）                                            |
| Q5   | 単一モデル・定数化 = `anthropic/claude-haiku-4.5`                                      |
| Q6/7 | B+C 両方 日次キャッシュ（InstantDB, key=userId+日付+mode）                             |
| Q8   | クライアント主導（server fn=AI のみ／書込はクライアント）                              |
| Q9   | `experimental_useObject`（`@ai-sdk/react`）                                            |
| Q10  | 出力言語 現状維持（採点FB=日／添削=英／お題=英）                                       |
| Q11  | requirement.md 該当箇所を実 AI 仕様に更新                                              |
| Q12  | テスト = §8 の 2 本維持、AI 経路未テスト                                               |
| Q13  | 失敗時 = エラー Alert＋再試行（status 据置で復帰）                                     |
| Q14  | 段階駆動 = 到着駆動のみ（onFinish で全確定・プロンプトで順指示）                       |
| Q15  | 重複ガード = 生成中 ref ロック＋クエリ確定後生成、採点は既存 score 有無で抑止          |
| Q16  | 単一 `dailyPrompts` + `i.json()` payload、dateKey=JST `YYYY-MM-DD`（クライアント算出） |
| Q17  | 添削 = フル添削文出力（`maxOutputTokens` 確保）                                        |
| Q18  | 採点 = system prompt に簡易ルーブリック（CEFR 要約＋TOEIC 目安＋観点）                 |

### 細部ロック

- snippet 照合: 複数一致→最初の行／未一致→skip／AI へ「snippet は 1 行以内でコピー」指示。
- AI コメント `userId` = owner の `auth.id`（現 mock の random UUID を是正）、`kind:'ai'`。
- `correctedBody === bodyBefore` ガード維持（diff hunk 0 回避）。
- `dailyPrompts` perms: `create/view = auth.id != null && auth.id == data.userId`、`update/delete=false`。
- env = `AI_GATEWAY_API_KEY`（`VITE_` 接頭辞なし＝サーバ専用）。

## 追加パッケージ / env

- `ai` / `@ai-sdk/react` / `@ai-sdk/valibot`
- `.env.local`: `AI_GATEWAY_API_KEY=...`（任意。未設定なら mock 退避）

## ファイル変更マップ

### 新規

- `src/lib/ai/model.ts` — `AI_MODEL` 定数、`isAiEnabled()`（server: `process.env.AI_GATEWAY_API_KEY`）。
- `src/features/essays/schemas/ai-schema.ts` — トピック/お題/添削の AI 出力 Valibot スキーマ。
- `src/features/essays/api/generate-topics.ts` — `createServerFn` + `generateObject`、キー無→mock。
- `src/features/essays/api/ask-diverse.ts` — 同上。
- `src/features/essays/api/correct-essay.ts` — `generateObject`、snippet→lineNumber 変換、キー無→mock。
- `src/routes/api/essays/score.ts` — server route POST、`streamObject(scoreSchema).toTextStreamResponse()`、キー無→mock 相当の擬似ストリーム。
- `src/features/essays/hooks/use-daily-prompt.ts` — dailyPrompts の useQuery＋生成＋transact＋ロック＋retry を集約。

### 改修

- `src/db/instant-schema.ts` — `dailyPrompts` entity 追加。
- `src/db/instant.perms.ts` — `dailyPrompts` perms 追加。
- `src/features/essays/schemas/essay-schema.ts` — `scoreSchema` を export。
- `src/features/essays/components/new/topic-picker.tsx` — `use-daily-prompt` 利用、error/retry。
- `src/features/essays/components/new/diverse-prompt.tsx` — 同上。
- `src/features/essays/hooks/scoring/use-scoring-stream.ts` — `experimental_useObject` ラッパに。
- `src/routes/_authenticated/essays/$essayId/scoring.tsx` — signal 撤去、error Alert＋再採点。
- `src/features/essays/components/new/essay-new-form.tsx` — `correctEssay` → `correctEssayServer`。
- `docs/requirement.md` — §1.2 / §3.2.1 / §3.3.1 / §6 / §7 / §9 を実 AI 仕様に更新。

### 維持

- `src/features/essays/api/mock-ai.ts` — フォールバック実体として残置。

## 各機能フロー

- **B/C（お題）**: picker → `useDailyPrompt(mode)` → `db.useQuery(dailyPrompts where userId,dateKey,mode)`。ヒット→payload 表示。ミス（ロード済・空）→ ref ロック → server fn(`generateObject`) → 成功時 `db.transact(dailyPrompts)` 保存＋表示。失敗→Alert＋再生成。
- **採点（3.3.1）**: scoring page → `useScoringStream.start` → `experimental_useObject('/api/essays/score')`。route が `streamObject(scoreSchema)` をルーブリック付きで実行。partial 到着で stage 遷移、`onFinish` で全確定＋`db.transact(scores)`。既存 score あれば `hydrate`。失敗→Alert＋再採点。
- **添削**: `essay-new-form` onSubmit で `correctEssayServer`（並行起動）→ `{correctedBody, comments[{snippet,...}]}`。サーバが snippet を `correctedBody` 行に照合し `lineNumber`/`side:'additions'` 付与した plain `aiComments` を返す → クライアントが `db.transact`（essays.bodyAfter/status + diffComments）。失敗→Alert。

## 検証

1. `vp check` — typecheck + lint。
2. `vp test` — 既存 smoke 2 本。
3. キー未設定で `vp dev` 起動 → mock 退避で全画面動作（手動）。
   </content>
