# 英語作文添削アプリ ProsePolish 要件定義書

## 1. 概要

### 1.1 目的

英語学習者が作成した英文エッセイを AI に添削してもらい、スコア・CEFR レベル・TOEIC スコア推定・具体的な改善点を得られる Web アプリケーションを提供する。添削前後の変化を視覚的に確認できる diff 機能と、音声読み上げ機能を組み合わせることで、包括的な英語学習体験を実現する。

### 1.2 スコープ（対象範囲）

| 項目         | 内容                                                      |
| ------------ | --------------------------------------------------------- |
| 対象         | UI のみの POC（Proof of Concept）                         |
| AI 連携      | モック（実際の AI API には接続しない）                    |
| データ永続化 | InstantDB によるリアルタイム同期                          |
| 認証         | なし（単一ユーザ想定）                                    |
| 対応環境     | モダンブラウザ（Chrome / Firefox / Safari / Edge 最新版） |

### 1.3 非スコープ（対象外）

- 本物の AI API への接続（OpenAI / Claude 等）
- マルチユーザ対応・認証・認可
- バックエンドサーバの実装（InstantDB のみ）
- モバイルアプリ
- ユーザ設定・プロファイル管理

---

## 2. 想定ユーザーとシナリオ

### 2.1 想定ユーザー

英語学習中の日本語ネイティブスピーカー。TOEIC スコア向上・CEFR レベルアップを目指しており、英作文の練習と添削を定期的に行いたいと考えている。

### 2.2 代表的なユーザーフロー

1. アプリを開くと、これまでの学習履歴一覧が表示される
2. 「新しい作文を始める」をクリックし、モードを選択する
   - A. **自由作文**：テーマは自由
   - B. **トピック選択**：AI が提示する 3 つのトピックから 1 つを選ぶ
   - C. **多様なお題**：仮定・文化・意見など、AI が提示する幅広い問いに英文で答える
3. テキストエリアに英文を記述し、「送信して添削する」を押す
4. 採点中画面で、スコアが順次ストリーミング表示される
5. 添削が完了したら「添削結果を確認」ボタンを押す
6. diff 画面で添削前後の差分を確認し、AI の指摘にコメントを付けることができる
7. 「添削後の文章を読む」で整形された添削後の文章と音声を確認する
8. 「履歴一覧に戻る」で最初の画面に戻り、新しいエントリが追加されている

---

## 3. 機能要件

### 3.1 履歴一覧画面（初期画面）

- 過去の作文エントリをカード形式で一覧表示する
- 各カードには以下を表示する：
  - 作文のモード（自由 / トピック / 多様なお題）
  - 作成日時
  - CEFR レベル（採点済みの場合）
  - TOEIC スコア推定幅（採点済みの場合）
  - ステータス（下書き / 採点中 / 添削済み）
- 0 件のときは「まだ作文がありません。最初の作文を書いてみましょう。」の空状態を表示する
- 「新しい作文を始める」CTA ボタンを常に表示する
- カードをクリックすると、そのエントリの履歴詳細画面に遷移する
- 最新順（`createdAt` 降順）で表示する

### 3.2 作文作成画面

#### 3.2.1 モード選択

作文画面に入ると最初にモードを選択するステップを表示する。

| モード          | 説明                                                                                                                  |
| --------------- | --------------------------------------------------------------------------------------------------------------------- |
| A. 自由作文     | テーマの制限なし                                                                                                      |
| B. トピック選択 | モック AI が 3 つのトピックを生成し、ユーザが 1 つを選択する                                                          |
| C. 多様なお題   | モック AI が仮定・文化・意見など幅広い問い（例：条件付きの想像、文化の説明、意見の表明）を 1 つ提示し、英文で回答する |

B・C はモード選択後にモック AI の呼び出し（setTimeout によるデモ）を行い、トピック / 質問を表示する。

#### 3.2.2 エディタ

- Mantine `Textarea` コンポーネントを使用したリッチテキストエリア
- **最大 10,000 文字**の制限（JavaScript の `String#length`、Valibot `maxLength` と一致。超過時は送信不可、バリデーションエラーを表示）
- 現在の文字数をリアルタイム表示（入力都度 `value` から集計。`form.Subscribe` により再レンダーで表示が止まるのを防ぐ）
- 文字数の色分け：0〜8,000 文字 → 緑 / 8,001〜9,500 文字 → 橙 / 9,501〜10,000 文字 → 赤
- 「送信して添削する」ボタン：文字数が 0 またはバリデーション違反の場合は disabled
- フォームライブラリは **TanStack Form + Valibot** を使用

### 3.3 採点中画面

送信後に遷移し、モック AI の採点をストリーミング表示する。

#### 3.3.1 スコアストリーミング表示

3 段階で順次表示される（各ステップはモックで約 350ms。ストリーミング感を保ちつつ待ちを短くする）：

1. **ステップ 1**：点数（0〜100 点）
2. **ステップ 2**：CEFR レベル（A1 / A2 / B1 / B2 / C1 / C2）
3. **ステップ 3**：TOEIC スコア推定幅（例：730〜860 点）

全ステップの上部に進捗バー（Mantine `Progress`）を表示する。

各ステップには評価コメントを付与する（例：「語彙の多様性が高く、文章構造も安定しています。接続詞の使い方にやや改善の余地があります。」）。

#### 3.3.2 添削の並行処理

採点ストリーミングと同時に、添削（diff 生成 + AI コメント付与）のモック処理を並行して実行する。添削が完了したとき（ステップ 3 完了後かつ添削完了後）に「添削結果を確認」ボタンが活性化される。

### 3.4 Diff 確認画面

添削前後の差分を **diffs.com 風の split view** で表示する。

#### 3.4.1 Diff 表示

- ライブラリ：`@pierre/diffs` の `FileDiff` コンポーネントを使用
- デフォルト表示：split（左=添削前 / 右=添削後）
- `SegmentedControl` で split / unified を切替可能（URL `?view=split|unified` に同期）
- 差分は行単位で色分け（削除=赤 / 追加=緑）、単語レベルのハイライトあり
- イメージはGitHub
- diff差分ありの箇所（行）をホバーで指摘や改善点が見れる
- diff差分ありの箇所（行）をホバーでクリックでModal表示（Mantineのmodals.open()を使用）

#### 3.4.2 AI インライン指摘（固定表示）

添削後に AI が付与したコメントは各行に自動で表示される：

- 表示位置：該当行の直下
- 内容：指摘内容 + 改善提案（英語）
- デザイン：Mantine `Alert` コンポーネント（青系ハイライト）

#### 3.4.3 ユーザーコメントの追加

行をホバーすると行番号付近に ＋ ボタンが出現し、クリックするとコメント入力 UI が表示される：

- 入力フォーム：Mantine `Textarea` + 「追加」ボタン（TanStack Form）
- 送信時：InstantDB に保存
- リロード後も保持される

### 3.5 添削後結果画面

#### 3.5.1 テキスト表示

- 添削後の全文をパラグラフ単位で整形表示する
- AI 指摘があった箇所にはハイライト（`<mark>` 要素）

#### 3.5.2 音声再生（TTS）

- ブラウザ標準の `Web Speech API`（`speechSynthesis`）を使用
- 「音声を再生」ボタンで添削後の文章を読み上げる
- 再生中は現在発話中の単語がハイライト（`onboundary` イベント利用）
- 「停止」ボタンで停止
- 未対応ブラウザでは「このブラウザは TTS に対応していません」を表示しボタン disabled
- SSR 時は `ClientOnly` コンポーネントでラップ

### 3.6 履歴詳細画面

過去のエントリを 3 タブで閲覧できる：

| タブ      | 内容                                               |
| --------- | -------------------------------------------------- |
| 添削前    | 元の英文を表示                                     |
| Diff 指摘 | 3.4 と同じ diff 確認画面（既存コメントは参照のみ） |
| 添削後    | 添削後文章 + TTS 再生ボタン                        |

アクティブなタブは URL `?tab=before|diff|after` に同期。

---

## 4. 非機能要件

### 4.1 アクセシビリティ

- すべての操作要素に `role` または意味のある `aria-label` を付与する
- `data-testid` は使用しない
- キーボードナビゲーション対応（Mantine コンポーネントの標準動作に依拠）

### 4.2 SSR 対応

- TanStack Start の SSR モードで動作すること
- `window` / `speechSynthesis` 依存のコードは `ClientOnly` コンポーネントでラップ
- InstantDB クエリはクライアントサイドでのみ発行（SSR 時はスケルトン表示）

### 4.3 パフォーマンス

- Textarea への 10,000 文字入力時でも入力遅延が 50ms 以下であること
  - uncontrolled input（`useRef`）+ `onBlur` コミット方式で実現
- 初期画面（履歴一覧）の表示は LCP 2.5 秒以内を目安とする

### 4.4 データ容量

- 1 エントリあたりの最大サイズ：約 80KB 目安（10,000 文字前後の本文 × 2 + AI コメント。UTF-8 可変）
- InstantDB の無料プランの範囲で動作する前提

---

## 5. 画面遷移と URL 設計

### 5.1 画面一覧

| No  | 画面名               | URL                                                |
| --- | -------------------- | -------------------------------------------------- |
| 1   | 履歴一覧（初期画面） | `/`                                                |
| 2   | 作文作成             | `/essays/new?mode=free\|topic\|diverse`            |
| 3   | 採点中               | `/essays/$essayId/scoring`                         |
| 4   | Diff 確認            | `/essays/$essayId/diff?view=split\|unified`        |
| 5   | 添削後結果           | `/essays/$essayId/result`                          |
| 6   | 履歴詳細             | `/essays/$essayId/history?tab=before\|diff\|after` |

### 5.2 画面遷移図

```mermaid
flowchart TD
    A[/ 履歴一覧 /] -->|新しい作文を始める| B[/essays/new?mode=free]
    A -->|カードをクリック| F[/essays/:id/history?tab=before]
    B -->|モード選択| B2[/essays/new?mode=topic]
    B -->|モード選択| B3[/essays/new?mode=diverse]
    B -->|送信| C[/essays/:id/scoring]
    B2 -->|送信| C
    B3 -->|送信| C
    C -->|添削完了| D[/essays/:id/diff?view=split]
    D -->|次へ| E[/essays/:id/result]
    D -->|履歴一覧に戻る| A
    E -->|履歴一覧に戻る| A
    E -->|次へ| F
    F -->|タブ切替| F2[?tab=diff]
    F2 -->|タブ切替| F3[?tab=after]
    F3 -->|タブ切替| F
    F -->|履歴一覧に戻る| A
```

---

## 6. データモデル

### 6.1 InstantDB スキーマ

**entities.essays**

| フィールド      | 型                                   | 説明                             |
| --------------- | ------------------------------------ | -------------------------------- |
| `id`            | string（自動）                       | 一意 ID                          |
| `mode`          | `'free' \| 'topic' \| 'diverse'`     | 作文モード                       |
| `prompt`        | string（optional）                   | 選んだトピック or 多様なお題の文 |
| `bodyBefore`    | string                               | 送信した元の英文                 |
| `bodyAfter`     | string（optional）                   | 添削後の英文                     |
| `score`         | number（optional）                   | 点数 0〜100                      |
| `cefr`          | string（optional）                   | CEFR レベル                      |
| `toeicMin`      | number（optional）                   | TOEIC 推定下限                   |
| `toeicMax`      | number（optional）                   | TOEIC 推定上限                   |
| `scoreFeedback` | string（optional）                   | 採点コメント                     |
| `status`        | `'draft' \| 'scoring' \| 'reviewed'` | 進捗ステータス                   |
| `createdAt`     | Date                                 | 作成日時                         |
| `updatedAt`     | Date                                 | 更新日時                         |

**entities.diffComments**

| フィールド   | 型                           | 説明                |
| ------------ | ---------------------------- | ------------------- |
| `id`         | string（自動）               | 一意 ID             |
| `side`       | `'deletions' \| 'additions'` | 左右どちらの行か    |
| `lineNumber` | number                       | 行番号（1 始まり）  |
| `author`     | `'ai' \| 'user'`             | コメント作者        |
| `body`       | string                       | コメント本文        |
| `suggestion` | string（optional）           | 改善提案（AI のみ） |
| `createdAt`  | Date                         | 作成日時            |

**links.essayComments**

`essays` → `diffComments` の 1 対多リレーション。

### 6.2 Valibot スキーマ

型は `src/features/essay-feedback/schemas/essay-schema.ts` で定義し、`src/features/essay-feedback/types/essay.ts` で `v.InferOutput<typeof XxxSchema>` として export する。

---

## 7. 技術選定

### 7.1 フレームワーク・ライブラリ

| 用途               | ライブラリ                                | 選定理由                                             |
| ------------------ | ----------------------------------------- | ---------------------------------------------------- |
| フレームワーク     | TanStack Start（Vinxi + TanStack Router） | プロジェクト指定                                     |
| UI                 | Mantine v9 + Tailwind v4                  | プロジェクト指定・既インストール                     |
| フォーム           | **@tanstack/react-form**                  | `@tanstack/valibot-adapter` との統合が既存・シンプル |
| 永続化             | **@instantdb/react**                      | リアルタイム同期・サーバ不要・スキーマ型安全         |
| Diff 表示          | **@pierre/diffs**                         | diffs.com 公式・行コメント API・React 19 対応済み    |
| TTS                | Web Speech API                            | 外部依存ゼロ・ブラウザ標準                           |
| バリデーション     | Valibot                                   | プロジェクト指定・既インストール                     |
| エラーハンドリング | better-result                             | プロジェクト指定・`Result.tryPromise` + `match`      |

### 7.2 状態管理方針

| 状態の種類                                               | 管理方法                                |
| -------------------------------------------------------- | --------------------------------------- |
| 永続化データ（履歴・コメント）                           | InstantDB `db.useQuery` / `db.transact` |
| フォーム入力状態                                         | TanStack Form 内部状態                  |
| 一時 UI 状態（採点 stage / TTS 再生位置 / popover 開閉） | React `useState`                        |
| URL 共有 UI 状態（モード / タブ / split-unified）        | TanStack Router search params           |

### 7.3 @pierre/diffs の使い方

```ts
import { parseDiffFromFile } from '@pierre/diffs'
import { FileDiff } from '@pierre/diffs/react'

const fileDiff = parseDiffFromFile(
  { name: 'essay.txt', contents: bodyBefore },
  { name: 'essay.txt', contents: bodyAfter },
)

// lineAnnotations に AI コメントとユーザコメントを渡す
<FileDiff
  fileDiff={fileDiff}
  options={{ diffStyle: 'split' }}
  lineAnnotations={annotations}
  renderAnnotation={({ metadata }) => <CommentBadge {...metadata} />}
  renderGutterUtility={(getHoveredLine) => <AddCommentButton ... />}
/>
```

---

## 8. テスト方針（POC 最小）

- テストフレームワーク：Vitest（`vite-plus/test` から import）
- クエリ方針：`getByRole` / `getByText` を優先。`data-testid` は禁止
- 最低限の smoke テスト 2 本：
  1. `history-flow.test.tsx`：履歴一覧 → 作文作成への遷移確認
  2. `diff-comment.test.tsx`：DiffView でコメント追加の動作確認

---

## 9. リスク

| リスク                           | 内容                                                        | 対応策                                                        |
| -------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------- |
| `@instantdb/react` の SSR 非対応 | InstantDB はクライアント前提の SDK                          | `typeof window` ガード + `<ClientOnly>` ラップ                |
| Web Speech API の非対応ブラウザ  | Safari iOS 等で `speechSynthesis` が undefined になる可能性 | `Result.tryPromise` でラップ、失敗時は disabled 表示          |
| @pierre/diffs の Worker Pool     | Vite + SSR 環境でWebWorkerが動作するか未確認                | `disableWorkerPool={true}` で回避可能                         |
| 10,000 文字の入力 UX             | 制御コンポーネントでは再レンダが多発する                    | 文字数は `form.Subscribe` 経由で表示し、追従性を担保          |
| InstantDB App ID 未設定          | `.env.local` 未投入時にアプリが壊れる                       | 未設定時は「設定が必要」の告知 Alert を表示しデモモードで動作 |

---

## 10. 今後の拡張予定（非スコープ）

- 実際の AI API（Claude / OpenAI）との接続
- ユーザ認証・プロファイル管理
- 音声録音 → テキスト変換（Speech to Text）
- 多言語対応（英語以外の添削）
- 進捗グラフ・スコア推移の可視化
- 添削履歴のエクスポート（PDF / CSV）
