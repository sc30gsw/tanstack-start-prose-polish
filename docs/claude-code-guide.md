# `.claude` ディレクトリガイド

このドキュメントは、本プロジェクトの `.claude/` 配下にある **プロジェクトスコープの Claude Code 設定**を説明するためのガイドです。

`.claude/` は「AI アシスタントにどう振る舞ってほしいか」をプロジェクト側で定義する場所です。まず一覧で全体を掴み、その後で必要な箇所だけ詳細を読む前提で構成しています。

```text
.claude/
├── hooks/
├── rules/
│   ├── common/
│   ├── typescript/
│   └── web/
├── skills/
└── settings.json
```

## クイックリファレンス

### 役割の違い

| 項目                    | 役割                                     | このプロジェクトでの主用途                                             |
| ----------------------- | ---------------------------------------- | ---------------------------------------------------------------------- |
| `.claude/rules/`        | 常時または条件付きで読ませるガードレール | `vp` の利用、`~/` エイリアス、生成コードの扱い、React/TypeScript 規約  |
| `.claude/skills/`       | 特定タスクで使う手順書・専門知識         | ドキュメント作成、Mantine、フォーム、ブラウザ操作、設計支援            |
| `.claude/settings.json` | プロジェクト設定、フック、推奨プラグイン | 編集後フォーマット、`vp check`、静的なルール違反警告、プラグイン有効化 |

### 現在の `rules` 一覧

現在コミットされている rule は次の 11 件です。

| ファイル                                         | 概要                                                                     | 主な適用対象                                                    |
| ------------------------------------------------ | ------------------------------------------------------------------------ | --------------------------------------------------------------- |
| `.claude/rules/common/coding-style.md`           | 命名、イミュータブル更新、ファイルサイズ、`type`/`export` などの基本規約 | `**/*.{ts,tsx,js,jsx}`                                          |
| `.claude/rules/common/development-workflow.md`   | `vp` コマンド運用と PR 前チェック                                        | 明示適用                                                        |
| `.claude/rules/common/security.md`               | secret 管理、Valibot による境界バリデーション、XSS 安全性                | `**/*.{ts,tsx}`                                                 |
| `.claude/rules/common/testing.md`                | role/text ベースのテスト、`data-testid` 禁止、Vitest 方針                | `**/*.{test,spec}.{ts,tsx}`                                     |
| `.claude/rules/typescript/project-structure.md`  | Bulletproof React 構成、`features/*` 配置、`~/` alias                    | `src/**/*.{ts,tsx}`                                             |
| `.claude/rules/typescript/react-conventions.md`  | named export、関数宣言、`as const satisfies`、React 規約                 | `src/**/*.tsx`, `src/**/hooks/*.ts`                             |
| `.claude/rules/typescript/valibot-validation.md` | Valibot スキーマの配置、`InferOutput`、フォーム連携                      | `src/features/**/schemas/*.ts`, `*-form.tsx`                    |
| `.claude/rules/web/api-client-ky.md`             | `ky` クライアント責務、generated SDK のラップ方針                        | `src/lib/api/client.ts`, `src/features/**/api/*.ts`             |
| `.claude/rules/web/mantine-tailwind.md`          | Mantine 9 と Tailwind v4 の責務分離                                      | `src/**/*.tsx`, `src/lib/theme.ts`                              |
| `.claude/rules/web/msw-mocking.md`               | MSW handler の配置、型安全なモック応答                                   | `src/features/**/mocks/*.ts`, テストファイル                    |
| `.claude/rules/web/tanstack-query-jotai.md`      | TanStack Query と Jotai の責務境界                                       | `src/features/**/hooks/*.ts`, `stores/*.ts`, `src/routes/*.tsx` |

### 現在の `skills` 一覧

現在コミットされている主要な top-level skill は次のとおりです（外部由来・プロジェクト同梱を含む。一覧の詳細は [README.md](../README.md) の「インストール済みスキル一覧」を参照）。

| ディレクトリ                                | skill 名                      | 主用途                                                                  |
| ------------------------------------------- | ----------------------------- | ----------------------------------------------------------------------- |
| `.claude/skills/agent-browser/`             | `agent-browser`               | ブラウザ操作、自動入力、スクリーンショット、Web UI 検証                 |
| `.claude/skills/better-result-adopt/`       | `better-result-adopt`         | `try/catch` から `better-result` への移行                               |
| `.claude/skills/composition-patterns/`      | `vercel-composition-patterns` | compound components、boolean prop 削減、React 19 構成                   |
| `.claude/skills/doc-coauthoring/`           | `doc-coauthoring`             | 提案書・仕様書・技術文書の共著ワークフロー                              |
| `.claude/skills/find-docs/`                 | `find-docs`                   | ライブラリや SDK の最新ドキュメント確認                                 |
| `.claude/skills/find-skills/`               | `find-skills`                 | 使える skill の探索と導入判断                                           |
| `.claude/skills/frontend-design/`           | `frontend-design`             | UI 実装、見た目の作り込み、画面デザイン                                 |
| `.claude/skills/git-pr/`                    | `git-pr`                      | PR 本文・ドラフト PR・レビュー負荷スコア・Mermaid                       |
| `.claude/skills/grill-me/`                  | `grill-me`                    | 計画・設計の徹底ヒアリング                                              |
| `.claude/skills/grill-with-docs/`           | `grill-with-docs`             | ドメイン文書と照らした計画のストレステスト                              |
| `.claude/skills/mantine-custom-components/` | `mantine-custom-components`   | Mantine Factory / Styles API 対応コンポーネント                         |
| `.claude/skills/mantine-form/`              | `mantine-form`                | `@mantine/form` を使ったフォーム設計                                    |
| `.claude/skills/react-doctor/`              | `react-doctor`                | React 健全性診断とスコア回帰チェック                                    |
| `.claude/skills/sdd-design/` ほか `sdd-*`   | `sdd-steering` 〜 `sdd-pr`    | Spec-Driven Development（[SDD ガイド](./sdd-workflow/sdd-workflow.md)） |
| `.claude/skills/skill-creator/`             | `skill-creator`               | 新規 skill 作成、改善、評価                                             |
| `.claude/skills/web-design-guidelines/`     | `web-design-guidelines`       | UI レビュー、アクセシビリティ・UX ガイドライン確認                      |
| `.claude/skills/webapp-testing/`            | `webapp-testing`              | Playwright ベースのローカル Web アプリ検証                              |

### 現在の `hooks` 一覧

現在の `.claude/settings.json` にある hook は次の 7 件です。

| Event         | Matcher       | Description                                                  | 実際の動作                                                               |
| ------------- | ------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------ |
| `PostToolUse` | `Edit\|Write` | Auto-format edited files with `vp fmt (oxfmt)`               | `.ts/.tsx/.js/.jsx/.json/.css` 編集後に `vp fmt` を実行                  |
| `PostToolUse` | `Edit\|Write` | Run `vp check` (oxlint + tsc) after editing `.ts/.tsx` files | TypeScript ファイル編集後に `vp check` を実行                            |
| `PostToolUse` | `Edit\|Write` | Warn on relative imports                                     | `~/` alias ではない相対 import を警告                                    |
| `PostToolUse` | `Edit\|Write` | Warn on `interface` keyword                                  | `interface` 使用を検知して `type` 利用を促す                             |
| `PostToolUse` | `Edit\|Write` | Warn on `export default` outside `src/routes/`               | routes 外での default export を警告                                      |
| `PostToolUse` | `Edit\|Write` | Warn on `try-catch`                                          | テスト以外での `try-catch` を検知し `better-result` を促す               |
| `Stop`        | なし          | Run claude-doctor continuously                               | `.claude/hooks/claude-doctor-continuous.sh` を非同期実行してレポート生成 |

## 詳細ガイド

### `.claude/rules/`

`.claude/rules/` は、Claude Code に読ませるプロジェクトローカルのルール集です。コーディング規約や設計上の制約を、ファイル種別や対象パスごとに適用できます。

#### ディレクトリ構成

| ディレクトリ                | 役割                          | 例                                                                        |
| --------------------------- | ----------------------------- | ------------------------------------------------------------------------- |
| `.claude/rules/common/`     | 言語横断の共通ルール          | `coding-style.md`, `testing.md`, `security.md`, `development-workflow.md` |
| `.claude/rules/typescript/` | TypeScript / React 周辺の規約 | `react-conventions.md`, `project-structure.md`, `valibot-validation.md`   |
| `.claude/rules/web/`        | Web フロントエンド固有ルール  | `api-client-ky.md`, `mantine-tailwind.md`, `tanstack-query-jotai.md`      |

#### ルールファイルの基本形

各ルールは先頭に frontmatter を持ちます。

```md
---
description: Core coding style — naming, comments, import order, file size, immutability
globs: ["**/*.{ts,tsx,js,jsx}"]
alwaysApply: true
---
```

| 項目          | 意味                         |
| ------------- | ---------------------------- |
| `description` | そのルールが何を扱うかの要約 |
| `globs`       | 適用対象ファイルのパターン   |
| `alwaysApply` | 常時参照させるかどうか       |

#### このプロジェクトでの使い方

- 共通原則は `common/` に置く
- 言語やライブラリに依存するものは `typescript/` や `web/` に分ける
- 詳細な規約は `CODING_GUIDELINES.md` に集約し、rules では「特に重要なもの」と「AI が判断を誤りやすいもの」を強調する

たとえば、[`coding-style.md`](../.claude/rules/common/coding-style.md) では `type` 優先、相対 import 禁止、`export default` 制限などを要点だけ抜き出しています。[`api-client-ky.md`](../.claude/rules/web/api-client-ky.md) では generated SDK を直接触らず feature API でラップする方針を定義しています。

#### 追加・更新の判断基準

- 何度も同じ指摘が発生する
- 対象ファイルが明確に決まっている
- 「推奨」より「原則」に近い
- スキルではなく、通常の実装中に常に効いてほしい

### `.claude/skills/`

`.claude/skills/` は、Claude Code が特定の依頼で使うスキル集です。ルールよりも大きな単位の手順や専門知識を持たせる用途に向いています。

#### ディレクトリ構成

各スキルは 1 ディレクトリ単位です。

```text
.claude/skills/<skill-name>/
├── SKILL.md
├── references/   # 任意
├── scripts/      # 任意
├── assets/       # 任意
└── LICENSE.txt   # 任意
```

#### `SKILL.md` の基本形

スキル本体は `SKILL.md` です。先頭の frontmatter でトリガー条件の中心となる情報を持ちます。

```md
---
name: find-docs
description: Retrieves up-to-date documentation, API references, and code examples...
---
```

- `name`: スキル識別子
- `description`: いつ使うべきかを含む説明。トリガー品質に直結する
- 本文: 実行手順、判断基準、出力形式、必要なら参考ファイルへの導線

#### このプロジェクトでの使い方

現在の `.claude/skills/` には、外部由来の汎用スキルと、プロジェクトで使いやすくするための補助スキルが混在しています。

| 例                                          | 用途                                     |
| ------------------------------------------- | ---------------------------------------- |
| `.claude/skills/find-docs/`                 | ライブラリや API の最新ドキュメント確認  |
| `.claude/skills/doc-coauthoring/`           | 仕様書や提案書などのドキュメント共著     |
| `.claude/skills/mantine-form/`              | Mantine Form の設計・実装パターン        |
| `.claude/skills/mantine-custom-components/` | Mantine カスタムコンポーネントの実装補助 |
| `.claude/skills/react-doctor/`              | React 健全性診断の活用                   |

#### 追加・更新の判断基準

- 手順が複数ステップに分かれる
- 特定タスクでのみ必要になる
- 参考資料やスクリプトを同梱したい
- 「何を守るか」ではなく「どう進めるか」を教えたい

たとえば「Valibot の基本原則」は rule 向きですが、「新しい skill を評価付きで作る手順」は skill 向きです。

補足:

- ディレクトリ名と skill 名が一致しないものがあります。例: `composition-patterns` → `vercel-composition-patterns`
- 詳しい trigger 条件は各 `SKILL.md` の frontmatter `description` を基準に確認する

### `.claude/settings.json`

`.claude/settings.json` は、このプロジェクトにおける Claude Code の実行設定です。
