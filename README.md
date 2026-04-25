# tanstack-start-poc-with-harness

`package.json` の `name` は **`tanstack-start-start`**（プライベート、ESM）です。

## 目次

- [クイックスタート](#クイックスタート)
- [構成](#構成)
- [ドキュメント](#ドキュメント)
- [DESIGN.md（UI 設計）](#designmdui-設計)
- [ブランチ管理](#ブランチ管理)
- [環境変数](#環境変数)
- [コマンド](#コマンド)
- [開発者ツール](#開発者ツール)
- [テスト](#テスト)

## クイックスタート

以下のコマンドでインストール・起動ができます。

> **注意**: このプロジェクトは Vite+ (`vp`) を通じてすべての操作を行います。`pnpm`・`npm`・`yarn` を直接実行しないでください。
> `vp`が未インストールの場合、 [Getting Started](https://viteplus.dev/guide/)を参考にし、インストールするか、以下のコマンドを実行してインストールしてください。
> macOS / Linux: curl -fsSL https://vite.plus | bash
> Windows: irm https://vite.plus/ps1 | iex

```bash
git clone <このリポジトリのURL>
cd tanstack-start-poc-with-harness
# .env を用意し VITE_INSTANT_APP_ID 等を設定（Instant を使う場合）
vp install
vp dev

# 既定は http://localhost:5173（起動ログを確認）
```

## 構成

主に以下のライブラリで開発しています（`dependencies` / `devDependencies` は [package.json](./package.json) を正とする）。

| カテゴリ               | 技術                                                                                                                                                                                                                                  |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| フレームワーク         | [TanStack Start](https://tanstack.com/start) / [React 19](https://react.dev) + [React Compiler](https://react.dev/learn/react-compiler)（[`babel-plugin-react-compiler`](https://www.npmjs.com/package/babel-plugin-react-compiler)） |
| ランタイム/ビルド      | [Vite+](https://viteplus.dev)（`vp` CLI、`vite` は `@voidzero-dev/vite-plus-core` 経由）                                                                                                                                              |
| ルーティング           | [TanStack Router](https://tanstack.com/router)（file-based）                                                                                                                                                                          |
| 永続化・クライアントDB | [InstantDB](https://www.instantdb.com)（[`@instantdb/react`](https://www.npmjs.com/package/@instantdb/react)）。スキーマ: `src/lib/instant-schema.ts`、初期化: `src/lib/instant.ts`                                                   |
| フォーム/アダプター    | [TanStack React Form](https://tanstack.com/form) + [@tanstack/valibot-adapter](https://tanstack.com/form/v1/docs/framework/react/guides/validation#valibot)                                                                           |
| UI / スタイル          | [Mantine 9](https://mantine.dev)（`@mantine/core` ほか）/ [Tailwind CSS v4](https://tailwindcss.com) + [`tailwind-preset-mantine`](https://github.com/Songkeys/tailwind-preset-mantine)                                               |
| 差分表示               | [`@pierre/diffs`](https://www.npmjs.com/package/@pierre/diffs)                                                                                                                                                                        |
| バリデーション         | [Valibot](https://valibot.dev)                                                                                                                                                                                                        |
| エラーハンドリング     | [better-result](https://github.com/dmmulroy/better-result)                                                                                                                                                                            |
| テスト                 | [Vitest](https://vitest.dev)（Vite+ バンドルに同梱されたランナー経由。`overrides` は `package.json` の `pnpm` を参照）                                                                                                                |
| 補助ツール（開発）     | [fallow](https://github.com/fallow-rs/fallow) / [react-doctor](https://github.com/millionco/react-doctor) / [react-grab](https://github.com/aidenybai/react-grab) ほか [package.json](./package.json) 参照                            |

`packageManager` は [Corepack](https://nodejs.org/api/corepack.html) 用に **`pnpm@10.32.1`**（`package.json` 記載）。Vite+ が pnpm を使う想定のため、依存操作は原則 **`vp install` / `vp add` / `vp remove`（経由: pnpm）** とし、**npm / yarn 直叩きはしない**方針です（[CLAUDE.md](./CLAUDE.md) と同趣旨）。

Mantine は v9 前提。フォームは Valibot との併用がコードベース上の定番です（`@mantine/form` の `schemaResolver` 等—必要に応じ [CODING_GUIDELINES.md](./CODING_GUIDELINES.md) 参照）。

### InstantDB 運用（要点）

- **App ID** は `VITE_INSTANT_APP_ID`（`.env` / デプロイ先のシークレット）で渡す。
- スキーマをクラウドに反映するとき: `npx instant-cli login` 後、**`vp run instant:push-schema`**（[package.json](./package.json) の `instant:push-schema`）。`INSTANT_SCHEMA_FILE_PATH=src/lib/instant-schema.ts` を付与しています。フィルタ/並び替えに使う属性はスキーマで **indexed** が必須です（[Instant ドキュメント](https://www.instantdb.com/docs/modeling-data.md)）。

### コーディング・コミット

- `vp check`（oxlint + oxfmt + 型チェック）をパスしてください。
- プロダクトのビルドが通る状態でコミットしてください（コミット時に staged フックで `vp check --fix` が自動実行されます）。
- 詳細なコーディング規約は [CODING_GUIDELINES.md](./CODING_GUIDELINES.md) を参照してください。

## ドキュメント

| ファイル                                       | 説明                                                          |
| ---------------------------------------------- | ------------------------------------------------------------- |
| [CODING_GUIDELINES.md](./CODING_GUIDELINES.md) | コーディング規約（命名規則、型定義、React パターン等）        |
| [CLAUDE.md](./CLAUDE.md)                       | AI アシスタント向けガイダンス（Vite+ 利用ルール、注意事項等） |

|

### Claude Code 用リソース

`.claude/` ディレクトリには AI アシスタント用のリソースが格納されています。

| パス                    | 説明                                                       |
| ----------------------- | ---------------------------------------------------------- |
| `.claude/rules/`        | 常時または条件付きで参照させるルール定義                   |
| `.claude/skills/`       | タスク単位で使うスキル定義                                 |
| `.claude/hooks/`        | `settings.json` から呼び出す補助スクリプト                 |
| `.claude/settings.json` | フック、推奨プラグイン設定、Claude Code のプロジェクト設定 |

### Claude Code スキル

`.claude/skills/` に格納されているスキルは、すべて **`gh skill install`** コマンドでインストールしたものです。

> **ルール: スキルの追加は `gh skill install` のみ使用すること**
>
> スキルファイルを手動でコピー・作成することは禁止します。`gh skill install` を使う理由は以下のとおりです（参考: [gh skill install でエージェントスキルを安全に管理する](https://zenn.dev/ubie_dev/articles/gh-skill-install-agent-skills)）。
>
> - **改ざん検知**: Tree SHA でインストール元のコミットを固定し、意図しない変更を検知できる
> - **バージョン固定**: `--pin <tag>` で自動更新を止め、意図しないプロンプト変更を防ぐ
> - **由来情報の記録**: `SKILL.md` の frontmatter に `github-repo` / `github-ref` / `github-tree-sha` が埋め込まれ、スキルの出所を追跡できる
> - **セキュリティ警告**: インストール時に「スキルは検証されていない」旨の警告が表示され、意図的な確認が促される
>
> スキルは「AI への命令書」であり、不正な改ざんや出所不明のファイルは大きなリスクになります。

#### インストール済みスキル一覧

| スキル名                    | インストールコマンド                         | 用途                                                        |
| --------------------------- | -------------------------------------------- | ----------------------------------------------------------- |
| `find-docs`                 | `gh skill install upstash/context7`          | ライブラリ・SDK の最新ドキュメント確認（Context7 MCP 連携） |
| `find-skills`               | `gh skill install vercel-labs/skills`        | 使えるスキルの探索と導入判断                                |
| `agent-browser`             | `gh skill install vercel-labs/agent-browser` | ブラウザ操作・スクリーンショット・Web UI 検証               |
| `composition-patterns`      | `gh skill install vercel-labs/agent-skills`  | Compound Components・boolean prop 削減・React 19 構成       |
| `web-design-guidelines`     | `gh skill install vercel-labs/agent-skills`  | UI レビュー・アクセシビリティ・UX ガイドライン              |
| `doc-coauthoring`           | `gh skill install anthropics/skills`         | 提案書・仕様書・技術文書の共著ワークフロー                  |
| `frontend-design`           | `gh skill install anthropics/skills`         | UI 実装・画面デザインの作り込み                             |
| `skill-creator`             | `gh skill install anthropics/skills`         | 新規スキルの作成・改善・評価                                |
| `webapp-testing`            | `gh skill install anthropics/skills`         | Playwright ベースのローカル Web アプリ検証                  |
| `better-result-adopt`       | `gh skill install dmmulroy/better-result`    | `try/catch` から `better-result` パターンへの移行           |
| `mantine-custom-components` | `gh skill install mantinedev/skills`         | Mantine Factory / Styles API 対応コンポーネント             |
| `mantine-form`              | `gh skill install mantinedev/skills`         | `@mantine/form` を使ったフォーム設計                        |
| `react-doctor`              | `gh skill install millionco/react-doctor`    | React 健全性診断とスコア回帰チェック                        |

> **補足: `find-docs` について**
>
> `find-docs`（`gh skill install upstash/context7`）は Context7 MCP と連携し、React・TanStack Query・TanStack Router・Mantine・Valibot など本プロジェクトで使用するライブラリの**最新ドキュメントをリアルタイムに取得**します。LLM の学習データは古くなりがちなため、API 構文・設定オプション・バージョン移行など「ドキュメントが必要な場面」では必ずこのスキルを経由して公式情報を参照させてください。

#### npm パッケージ同梱スキル（`@tanstack/intent`）

`gh skill install` でインストールするスキルとは別に、**npm パッケージに直接同梱されたスキル**も存在します。本プロジェクトでインストールしている `@tanstack/react-query`・`@tanstack/react-router` などの TanStack ライブラリは、[tanstack/intent](https://github.com/tanstack/intent) 規格に対応しており、ライブラリのベストプラクティスを AI エージェント向けスキルとして npm パッケージ内に含んでいます。

これらの npm 同梱スキルを確認するコマンドが `check:skills` として `package.json` に登録されています。

```bash
vp run check:skills
# 内部的に実行されるコマンド: npx @tanstack/intent@latest list
#
# 出力例:
# Found 3 intent-enabled packages
#
# PACKAGE                    VERSION   SKILLS
# @tanstack/react-query      5.x.x     3
# @tanstack/react-router     1.x.x     2
# @tanstack/valibot-adapter  1.x.x     1
```

**`gh skill install` との使い分け:**

| 種別             | 管理場所                     | 追加方法                               | 用途                               |
| ---------------- | ---------------------------- | -------------------------------------- | ---------------------------------- |
| リポジトリスキル | `.claude/skills/`            | `gh skill install <org>/<repo>`        | 特定ライブラリ・ツールの専門スキル |
| npm 同梱スキル   | `node_modules/<pkg>/skills/` | `vp install`（通常の依存インストール） | 使用ライブラリのベストプラクティス |

npm 同梱スキルは依存パッケージのアップデートと連動して自動的に更新されます。`vp run check:skills` を定期的に実行して、利用可能な新スキルがないか確認することを推奨します。

#### スキルの追加手順

新しいスキルを追加する場合は次の手順で行ってください。

```bash
# スキルをインストール（バージョン固定推奨）
gh skill install <org>/<repo>
# または特定バージョンに固定
gh skill install <org>/<repo> --pin <tag>

# スコープ選択が出た場合は Project を選択
# インストール先: .claude/skills/<skill-name>/
```

インストール後は `docs/claude-code-guide.md` の skills 一覧テーブルも更新してください。

### Claude Code プラグイン

`.claude/settings.json` にプロジェクト推奨プラグインが定義されています。プロジェクトを開いた際に Claude Code がインストールを促します。

| プラグイン ID                                   | 用途                                                          |
| ----------------------------------------------- | ------------------------------------------------------------- |
| `everything-claude-code@everything-claude-code` | エージェント・スキル・フック集（TDD, コードレビュー, E2E 等） |

> **注意**: プラグインは各開発者の環境（`~/.claude/`）にインストールが必要です。リポジトリをクローンしただけでは自動インストールされません。
> インストール時、Claude Code の UI が表示される場合は **`Project Scope`** を選択してください。

プロンプトが表示されない場合は、以下のコマンドで手動インストールしてください。

```bash
/plugin install everything-claude-code@everything-claude-code --project
/reload-plugin
```

## ブランチ管理

| ブランチ | 内容                  |
| -------- | --------------------- |
| main     | 本番環境              |
| develop  | 開発環境 （準備予定） |

## 環境変数

| 変数名                | 必須   | 説明                                                                                                                                                        |
| --------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `VITE_INSTANT_APP_ID` | 実運用 | [Instant](https://www.instantdb.com) の App ID。未設定の場合、クライアント初期化は [src/lib/instant.ts](./src/lib/instant.ts) どおり `appId` なしになり得る |

新規の環境変数を追加する際は、**`.env.example`（存在する場合）** と本セクション、および参照コードを同時に更新してください。

## コマンド

Vite+ (`vp`) を通じてすべての操作を行います。`pnpm`・`npm`・`yarn` を直接実行しないでください。

> **注意**: `vp` 組み込みコマンドと `package.json` の `scripts` が衝突する場合は `vp run <script>` で実行してください。

次表は、よく使う Vite+ コマンドと、**[package.json](./package.json) の `scripts` に定義してある**コマンドです。`vp` にないタスクは `vp run <script名>` です（`dev` など衝突時の公式回避）。

| コマンド                      | 内容                                                                                                                                  |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `vp install`                  | 依存インストール（`pnpm` 相当）                                                                                                       |
| `vp dev`                      | 開発サーバー起動                                                                                                                      |
| `vp build`                    | 本番ビルド（`package.json` の `build`）                                                                                               |
| `vp preview`                  | プレビュー（`package.json` の `preview`）                                                                                             |
| `vp check` / `vp check --fix` | リント + 整形 + 型（`package.json` の `check` / `fix`）                                                                               |
| `vp lint`                     | oxlint のみ                                                                                                                           |
| `vp test`                     | テスト（`package.json` の `test`）                                                                                                    |
| `vp run check:skills`         | `npx @tanstack/intent@latest list`（同梱スキル一覧。`package.json` の `check:skills`）                                                |
| `vp run instant:push-schema`  | `instant-cli` で Instant スキーマを push（`INSTANT_SCHEMA_FILE_PATH=src/lib/instant-schema.ts` 指定済み。要 `npx instant-cli login`） |
| `vp run fallow` ほか          | 未使用・監査等（`fallow:*` 系。`package.json` 参照）                                                                                  |
| `vp run doctor`               | `react-doctor`（`package.json` の `doctor`）                                                                                          |

## 開発者ツール

AI コーディングエージェント（Claude Code、Cursor、Copilot 等）との連携を高める開発補助ツールです。

### react-grab

[react-grab](https://github.com/aidenybai/react-grab) は、ブラウザ上の UI 要素を選択して、**ファイルパス・React コンポーネント名・HTML ソースコード**をワンショットでコピーできる開発者ツールです。

コーディングエージェントに正確なコンテキストを渡すことで、開発速度と精度を向上させます。

**使い方**

1. `vp dev` でローカルサーバーを起動
2. ブラウザでアプリを開き、調べたい UI 要素にカーソルを当てる
3. **⌘C**（Mac）または **Ctrl+C**（Windows/Linux）を押す
4. クリップボードにコピーされたコンテキスト（ファイル名・コンポーネント名・HTML）をエージェントにペーストする

セットアップは `src/routes/__root.tsx` に DEV 時のみ動的 import として組み込まれています（`import.meta.env.DEV` が `true` の場合のみ読み込まれます）。

MCP サーバーを追加してエージェントと連携する場合:

```bash
vp dlx grab@latest add mcp
```

詳しい使い方は、GitHubか以下の記事を参照
[ブラウザから要素を選択してエージェントにコンテキストを提供する React Grab を試してみた](https://azukiazusa.dev/blog/try-react-grab-for-agents/)

### react-doctor

[react-doctor](https://github.com/millionco/react-doctor) は、React プロジェクトのコード品質を診断するツールです。セキュリティ・パフォーマンス・アクセシビリティ・バンドルサイズなど 60 以上のルールでスキャンし、0〜100 のヘルススコアと改善提案を出力します。

| スコア  | 評価       |
| ------- | ---------- |
| 75 以上 | Great      |
| 50〜74  | Needs work |
| 50 未満 | Critical   |

プロジェクトルートで以下のコマンドを実行するだけで、フレームワーク・React バージョン・コンパイラ設定を自動検出してフルスキャンを開始します。

```bash
vp run doctor
```

## テスト

> **現状**: テストコードは未整備です。以下はテスト整備時の方針です。

### テスト戦略（Testing Trophy）

本プロジェクトでは [Testing Trophy](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications) 戦略を採用しています。

```
Integration (Vitest+MSW)  ▓▓▓▓▓▓░░░░  60%  ← 主軸
Unit (Vitest)             ▓▓▓░░░░░░░  25%
E2E                       ▓░░░░░░░░░  10%
Static (TS + oxlint)      ----------  ベースライン
```

Integration テストでは、各 feature で整備する MSW ハンドラ（`src/features/*/mocks/handlers.ts`）を Vitest から読み込みます。

#### Feature レイヤー別テスト方針

| レイヤー                                 | テスト種別                         | 優先度 |
| ---------------------------------------- | ---------------------------------- | ------ |
| `schemas/`                               | Unit（valibot safeParse）          | **P1** |
| `hooks/use-*-actions`（mutation フック） | Integration（MSW）                 | **P1** |
| `hooks/use-*`（query フック）            | Integration（MSW）                 | **P2** |
| `utils/`                                 | Unit                               | **P2** |
| `components/*-container`                 | Integration（render+MSW）          | **P2** |
| `components/*`（presentation）           | Unit（render+props）               | **P3** |
| `stores/`                                | Unit                               | **P3** |
| `api/`                                   | スキップ（hooks 経由でテスト済み） | --     |

#### テストファイルの配置（co-located）

テストファイルはソースファイルと同じディレクトリに配置します（`src/__tests__/` は使用しません）。`vp test`（Vitest）で実行します。

```
src/features/auth/
├── schemas/
│   ├── login-schema.ts
│   └── login-schema.test.ts      ← co-located
├── hooks/
│   ├── use-login.ts
│   └── use-login.test.ts          ← co-located
└── components/
    ├── login-form.tsx
    └── login-form.test.tsx        ← co-located
```
