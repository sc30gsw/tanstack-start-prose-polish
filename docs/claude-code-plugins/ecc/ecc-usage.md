# `everything-claude-code` — 呼び出し方ガイド

**ナビゲーション**: [インデックス](./ecc-index.md) | **呼び出し方** | [Agents](./ecc-agents.md) | [Commands](./ecc-commands.md) | [Skills](./ecc-skills.md)

スナップショット: 2026-05-22

---

## 種別ごとの呼び出し方

| 種別    | 呼び出し方                                 | 例                                         |
| ------- | ------------------------------------------ | ------------------------------------------ |
| Agent   | 自然言語で依頼、または subagent として指定 | `typescript-reviewer で差分をレビューして` |
| Command | チャットに `/command-name` と入力          | `/plan 新しい画面の実装計画を作って`       |
| Skill   | 自動発動、またはスキル名を明示             | `tdd-workflow スキルを使って進めて`        |

---

## Agent の使い方

Agent は Claude Code の `subagent_type` パラメータで指定するか、自然言語で「`〇〇 agent を使って`」と依頼する。

### 指定方法

```
# 自然言語での依頼
typescript-reviewer で最近変更したファイルをレビューして

# subagent としての明示指定
subagent_type: "everything-claude-code:typescript-reviewer" で差分をレビューする
```

### 命名規則

ECC のすべての Agent は `everything-claude-code:` プレフィックス付きで登録されている。例:

- `everything-claude-code:typescript-reviewer`
- `everything-claude-code:tdd-guide`
- `everything-claude-code:security-reviewer`

### いつ使うか

- 特定の専門知識が必要なレビューや調査タスク
- プロジェクト全体に影響するアーキテクチャ設計
- ビルドエラーや型エラーの修復
- E2E テスト / TDD の実施

→ 一覧は [ecc-agents.md](./ecc-agents.md) を参照。

---

## Command の使い方

Command はチャットで `/command-name` と入力して起動する。

### 指定方法

```
# 基本
/plan 新しいダッシュボード画面の設計を立案して

# 引数あり
/code-review 12345  （PR 番号を渡して GitHub PR をレビュー）

# 引数なし（インタラクティブ）
/hookify
```

### 命名規則

Command のスラッシュコマンド名は kebab-case。ID (`command-name` 部分) はファイル名から自動解決される。

### いつ使うか

- 実装計画の策定 (`/plan`, `/prp-plan`)
- コードレビューの起動 (`/code-review`, `/review-pr`)
- ビルド修復のワンショット起動 (`/build-fix`, `/rust-build`)
- テストカバレッジ改善 (`/test-coverage`, `/tdd`)
- セッションの保存・復元 (`/save-session`, `/resume-session`)

→ 一覧は [ecc-commands.md](./ecc-commands.md) を参照。

---

## Skill の使い方

Skill はタスク内容に応じて **自動発動** するか、明示的にスキル名を指定して使う。

### 指定方法

```
# スキル名を明示
tdd-workflow スキルを使って、この機能のテストを先に書いて

# トリガーワードによる自動発動（各スキルの TRIGGER 定義に従う）
"optimize prompt" → prompt-optimizer スキルが自動発動
"ユーザー認証の設計をしたい" → blueprint, product-capability などが候補に
```

### 命名規則

Skill のディレクトリ名 = スキル名。`~/.claude/skills/` または `.claude/skills/` 配下に配置する。MCP サーバーとして呼び出す場合は `mcp__plugin_everything-claude-code_*` 形式のツール名になる。

### スコープ

| スコープ     | 配置先              | 効果範囲           |
| ------------ | ------------------- | ------------------ |
| グローバル   | `~/.claude/skills/` | 全プロジェクト     |
| プロジェクト | `.claude/skills/`   | そのリポジトリのみ |

### いつ使うか

- フレームワーク固有のパターンが必要なとき (`nextjs-turbopack`, `frontend-patterns`)
- セキュリティ要件の確認 (`security-review`, `hipaa-compliance`)
- AI エージェントのオーケストレーション (`agentic-engineering`, `autonomous-loops`)
- ドキュメント生成・ナレッジ管理 (`codebase-onboarding`, `documentation-lookup`)

→ 一覧は [ecc-skills.md](./ecc-skills.md) を参照。

---

**ナビゲーション**: [インデックス](./ecc-index.md) | **呼び出し方** | [Agents](./ecc-agents.md) | [Commands](./ecc-commands.md) | [Skills](./ecc-skills.md)
