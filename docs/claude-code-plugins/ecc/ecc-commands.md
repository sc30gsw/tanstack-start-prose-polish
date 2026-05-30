# `everything-claude-code` — Commands 一覧

**ナビゲーション**: [インデックス](./ecc-index.md) | [呼び出し方](./ecc-usage.md) | [Agents](./ecc-agents.md) | **Commands** | [Skills](./ecc-skills.md)

スナップショット: 2026-05-28

76件 / 10カテゴリ

---

## ECC/メタツール（11）

ECC 自体の案内、インストール、スキル棚卸し、hooks、instinct、コンテキストやコスト管理。

| Command          | ID              | 説明                                                                                         | Source                                                                                           |
| ---------------- | --------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `/auto-update`   | `auto-update`   | ECC リポジトリの最新変更を取得し、現在管理対象のターゲットを再インストールする。             | [commands/auto-update.md](https://github.com/affaan-m/ECC/blob/main/commands/auto-update.md)     |
| `/cost-report`   | `cost-report`   | cost-tracker SQLite データベースから Claude Code のローカルコストレポートを生成する。        | [commands/cost-report.md](https://github.com/affaan-m/ECC/blob/main/commands/cost-report.md)     |
| `/evolve`        | `evolve`        | 関連するinstinctsをスキル、コマンド、またはエージェントにクラスター化                        | [commands/evolve.md](https://github.com/affaan-m/ECC/blob/main/commands/evolve.md)               |
| `/harness-audit` | `harness-audit` | リポジトリのハーネス監査を決定的に実行し、優先順位付けされたスコアカードを返す。             | [commands/harness-audit.md](https://github.com/affaan-m/ECC/blob/main/commands/harness-audit.md) |
| `/hookify`       | `hookify`       | 会話分析または明示的な指示から、望ましくない動作を防止するフックを作成する。                 | [commands/hookify.md](https://github.com/affaan-m/ECC/blob/main/commands/hookify.md)             |
| `/learn`         | `learn`         | 現在のセッションから再利用可能なパターンを抽出し、候補スキルまたはガイダンスとして保存する。 | [commands/learn.md](https://github.com/affaan-m/ECC/blob/main/commands/learn.md)                 |
| `/model-route`   | `model-route`   | 複雑さ、リスク、予算に基づいて、現在のタスクに最適なモデルティアを推奨する。                 | [commands/model-route.md](https://github.com/affaan-m/ECC/blob/main/commands/model-route.md)     |
| `/projects`      | `projects`      | 既知のプロジェクトとその instinct 統計を一覧表示する。                                       | [commands/projects.md](https://github.com/affaan-m/ECC/blob/main/commands/projects.md)           |
| `/promote`       | `promote`       | プロジェクトスコープの instinct をグローバルスコープに昇格させる。                           | [commands/promote.md](https://github.com/affaan-m/ECC/blob/main/commands/promote.md)             |
| `/prune`         | `prune`         | 30日以上経過し、一度も昇格されなかった保留中の instinct を削除する。                         | [commands/prune.md](https://github.com/affaan-m/ECC/blob/main/commands/prune.md)                 |
| `/setup-pm`      | `setup-pm`      | 優先するパッケージマネージャーを設定（npm/pnpm/yarn/bun）                                    | [commands/setup-pm.md](https://github.com/affaan-m/ECC/blob/main/commands/setup-pm.md)           |

---

## 計画/設計/アーキテクチャ（5）

実装前の計画、構造設計、ADR、プロダクト要求から設計への変換。

| Command        | ID            | 説明                                                                                                      | Source                                                                                       |
| -------------- | ------------- | --------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `/feature-dev` | `feature-dev` | コードベースの理解とアーキテクチャに重点を置いた、ガイド付き機能開発。                                    | [commands/feature-dev.md](https://github.com/affaan-m/ECC/blob/main/commands/feature-dev.md) |
| `/plan`        | `plan`        | 要件を再確認し、リスクを評価し、段階的な実装計画を作成する。コードに触れる前にユーザーの CONFIRM を待つ。 | [commands/plan.md](https://github.com/affaan-m/ECC/blob/main/commands/plan.md)               |
| `/plan-prd`    | `plan-prd`    | シンプルで問題先行型の PRD を生成し、/plan に実装計画を引き渡す。                                         | [commands/plan-prd.md](https://github.com/affaan-m/ECC/blob/main/commands/plan-prd.md)       |
| `/prp-plan`    | `prp-plan`    | コードベース分析とパターン抽出を伴う包括的な機能実装計画を作成する。                                      | [commands/prp-plan.md](https://github.com/affaan-m/ECC/blob/main/commands/prp-plan.md)       |
| `/prp-prd`     | `prp-prd`     | インタラクティブな PRD ジェネレータ — 問題先行型、仮説駆動型の製品仕様を双方向の質問で作成する。          | [commands/prp-prd.md](https://github.com/affaan-m/ECC/blob/main/commands/prp-prd.md)         |

---

## コード品質/レビュー/リファクタ（10）

コードレビュー、保守性、コメント、型設計、デッドコード整理。

| Command           | ID               | 説明                                                                                                                                                                                     | Source                                                                                             |
| ----------------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `/code-review`    | `code-review`    | コードレビュー — ローカルの未コミット変更または GitHub PR（PR モードは PR 番号/URL を指定）                                                                                              | [commands/code-review.md](https://github.com/affaan-m/ECC/blob/main/commands/code-review.md)       |
| `/cpp-review`     | `cpp-review`     | メモリ安全性、モダン C++ 慣用句、並行処理、セキュリティに関する包括的な C++ コードレビュー。cpp-reviewer エージェントを呼び出す。                                                        | [commands/cpp-review.md](https://github.com/affaan-m/ECC/blob/main/commands/cpp-review.md)         |
| `/fastapi-review` | `fastapi-review` | FastAPI アプリケーションのアーキテクチャ、非同期処理の正確性、依存性注入、Pydantic スキーマ、セキュリティ、パフォーマンス、テスト容易性をレビューする。                                  | [commands/fastapi-review.md](https://github.com/affaan-m/ECC/blob/main/commands/fastapi-review.md) |
| `/flutter-review` | `flutter-review` | Flutter/Dart コードの慣用的パターン、ウィジェットのベストプラクティス、状態管理、パフォーマンス、アクセシビリティ、セキュリティをレビューする。flutter-reviewer エージェントを呼び出す。 | [commands/flutter-review.md](https://github.com/affaan-m/ECC/blob/main/commands/flutter-review.md) |
| `/go-review`      | `go-review`      | 慣用的なパターン、並行性の安全性、エラーハンドリング、セキュリティについての包括的なGoコードレビュー。go-reviewerエージェントを呼び出します。                                            | [commands/go-review.md](https://github.com/affaan-m/ECC/blob/main/commands/go-review.md)           |
| `/kotlin-review`  | `kotlin-review`  | 慣用的パターン、null 安全性、コルーチン安全性、セキュリティに関する包括的な Kotlin コードレビュー。kotlin-reviewer エージェントを呼び出す。                                              | [commands/kotlin-review.md](https://github.com/affaan-m/ECC/blob/main/commands/kotlin-review.md)   |
| `/python-review`  | `python-review`  | PEP 8準拠、型ヒント、セキュリティ、Pythonic慣用句についての包括的なPythonコードレビュー。python-reviewerエージェントを呼び出します。                                                     | [commands/python-review.md](https://github.com/affaan-m/ECC/blob/main/commands/python-review.md)   |
| `/refactor-clean` | `refactor-clean` | 各変更後に検証を行いながら、デッドコードを安全に特定して削除する。                                                                                                                       | [commands/refactor-clean.md](https://github.com/affaan-m/ECC/blob/main/commands/refactor-clean.md) |
| `/review-pr`      | `review-pr`      | 専門エージェントを使用した包括的な PR レビュー。                                                                                                                                         | [commands/review-pr.md](https://github.com/affaan-m/ECC/blob/main/commands/review-pr.md)           |
| `/rust-review`    | `rust-review`    | 所有権、ライフタイム、エラーハンドリング、unsafe 使用、慣用的パターンに関する包括的な Rust コードレビュー。rust-reviewer エージェントを呼び出す。                                        | [commands/rust-review.md](https://github.com/affaan-m/ECC/blob/main/commands/rust-review.md)       |

---

## ビルド復旧（7）

コンパイル、型チェック、依存関係、ビルド失敗の復旧。

| Command          | ID              | 説明                                                                                                                                                    | Source                                                                                           |
| ---------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `/build-fix`     | `build-fix`     | プロジェクトのビルドシステムを検出し、最小限の安全な変更でビルド/型エラーを段階的に修正する。                                                           | [commands/build-fix.md](https://github.com/affaan-m/ECC/blob/main/commands/build-fix.md)         |
| `/cpp-build`     | `cpp-build`     | C++ ビルドエラー、CMake 問題、リンカー問題を段階的に修正する。最小限の外科的修正のために cpp-build-resolver エージェントを呼び出す。                    | [commands/cpp-build.md](https://github.com/affaan-m/ECC/blob/main/commands/cpp-build.md)         |
| `/flutter-build` | `flutter-build` | Dart analyzer エラーと Flutter ビルド失敗を段階的に修正する。最小限の外科的修正のために dart-build-resolver エージェントを呼び出す。                    | [commands/flutter-build.md](https://github.com/affaan-m/ECC/blob/main/commands/flutter-build.md) |
| `/go-build`      | `go-build`      | Goビルドエラー、go vet警告、リンター問題を段階的に修正します。最小限の外科的修正のためにgo-build-resolverエージェントを呼び出します。                   | [commands/go-build.md](https://github.com/affaan-m/ECC/blob/main/commands/go-build.md)           |
| `/gradle-build`  | `gradle-build`  | Android および KMP プロジェクトの Gradle ビルドエラーを修正する。                                                                                       | [commands/gradle-build.md](https://github.com/affaan-m/ECC/blob/main/commands/gradle-build.md)   |
| `/kotlin-build`  | `kotlin-build`  | Kotlin/Gradle ビルドエラー、コンパイラ警告、依存関係の問題を段階的に修正する。最小限の外科的修正のために kotlin-build-resolver エージェントを呼び出す。 | [commands/kotlin-build.md](https://github.com/affaan-m/ECC/blob/main/commands/kotlin-build.md)   |
| `/rust-build`    | `rust-build`    | Rust ビルドエラー、借用チェッカー問題、依存関係の問題を段階的に修正する。最小限の外科的修正のために rust-build-resolver エージェントを呼び出す。        | [commands/rust-build.md](https://github.com/affaan-m/ECC/blob/main/commands/rust-build.md)       |

---

## テスト/検証/品質ゲート（8）

TDD、E2E、カバレッジ、品質ゲート、リリース前検証。

| Command          | ID              | 説明                                                                                                                                                   | Source                                                                                           |
| ---------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| `/checkpoint`    | `checkpoint`    | 検証チェック実行後に、ワークフローのチェックポイントを作成、検証、または一覧表示する。                                                                 | [commands/checkpoint.md](https://github.com/affaan-m/ECC/blob/main/commands/checkpoint.md)       |
| `/cpp-test`      | `cpp-test`      | C++ の TDD ワークフローを適用する。GoogleTest テストを先に記述し、その後実装する。gcov/lcov でカバレッジを確認する。                                   | [commands/cpp-test.md](https://github.com/affaan-m/ECC/blob/main/commands/cpp-test.md)           |
| `/flutter-test`  | `flutter-test`  | Flutter/Dart テストを実行し、失敗を報告し、テスト問題を段階的に修正する。ユニット、ウィジェット、ゴールデン、統合テストに対応。                        | [commands/flutter-test.md](https://github.com/affaan-m/ECC/blob/main/commands/flutter-test.md)   |
| `/go-test`       | `go-test`       | Goのテスト駆動開発(TDD)ワークフローを適用します。テーブル駆動テストを最初に記述し、その後実装します。go test -coverで80%以上のカバレッジを確認します。 | [commands/go-test.md](https://github.com/affaan-m/ECC/blob/main/commands/go-test.md)             |
| `/kotlin-test`   | `kotlin-test`   | Kotlin の TDD ワークフローを適用する。Kotest テストを先に記述し、その後実装する。Kover で 80% 以上のカバレッジを確認する。                             | [commands/kotlin-test.md](https://github.com/affaan-m/ECC/blob/main/commands/kotlin-test.md)     |
| `/quality-gate`  | `quality-gate`  | ファイルまたはプロジェクトスコープで ECC 品質パイプラインを実行し、修復手順を報告する。                                                                | [commands/quality-gate.md](https://github.com/affaan-m/ECC/blob/main/commands/quality-gate.md)   |
| `/rust-test`     | `rust-test`     | Rust の TDD ワークフローを適用する。テストを先に記述し、その後実装する。cargo-llvm-cov で 80% 以上のカバレッジを確認する。                             | [commands/rust-test.md](https://github.com/affaan-m/ECC/blob/main/commands/rust-test.md)         |
| `/test-coverage` | `test-coverage` | カバレッジを分析し、ギャップを特定し、目標閾値に向けて不足テストを生成する。                                                                           | [commands/test-coverage.md](https://github.com/affaan-m/ECC/blob/main/commands/test-coverage.md) |

---

## セキュリティ/コンプライアンス（1）

脆弱性、認証認可、秘密情報、PHI/HIPAA、規制・安全性。

| Command          | ID              | 説明                                                                               | Source                                                                                           |
| ---------------- | --------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `/security-scan` | `security-scan` | agent、hook、MCP、permission、secret 各サーフェスに対して AgentShield を実行する。 | [commands/security-scan.md](https://github.com/affaan-m/ECC/blob/main/commands/security-scan.md) |

---

## AIエージェント/自律化（10）

自律ループ、マルチエージェント、評価ハーネス、AI 実行基盤。

| Command           | ID               | 説明                                                                                                                        | Source                                                                                             |
| ----------------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `/gan-build`      | `gan-build`      | 実装タスク向けに、反復回数とスコアリング付きのジェネレータ/エバリュエータビルドループを実行する。                           | [commands/gan-build.md](https://github.com/affaan-m/ECC/blob/main/commands/gan-build.md)           |
| `/gan-design`     | `gan-design`     | フロントエンドまたはビジュアル作業向けに、反復回数とスコアリング付きのジェネレータ/エバリュエータデザインループを実行する。 | [commands/gan-design.md](https://github.com/affaan-m/ECC/blob/main/commands/gan-design.md)         |
| `/loop-start`     | `loop-start`     | 安全なデフォルト設定と明示的な停止条件付きで、管理された自律ループパターンを開始する。                                      | [commands/loop-start.md](https://github.com/affaan-m/ECC/blob/main/commands/loop-start.md)         |
| `/loop-status`    | `loop-status`    | アクティブなループの状態、進捗、失敗シグナル、推奨される介入を確認する。                                                    | [commands/loop-status.md](https://github.com/affaan-m/ECC/blob/main/commands/loop-status.md)       |
| `/multi-backend`  | `multi-backend`  | API、アルゴリズム、データ、ビジネスロジック向けのバックエンド特化マルチモデルワークフローを実行する。                       | [commands/multi-backend.md](https://github.com/affaan-m/ECC/blob/main/commands/multi-backend.md)   |
| `/multi-execute`  | `multi-execute`  | Claude を唯一のファイルシステム書き込み主体として維持しながら、マルチモデル実装計画を実行する。                             | [commands/multi-execute.md](https://github.com/affaan-m/ECC/blob/main/commands/multi-execute.md)   |
| `/multi-frontend` | `multi-frontend` | コンポーネント、レイアウト、アニメーション、UI 仕上げ向けのフロントエンド特化マルチモデルワークフローを実行する。           | [commands/multi-frontend.md](https://github.com/affaan-m/ECC/blob/main/commands/multi-frontend.md) |
| `/multi-plan`     | `multi-plan`     | 本番コードを変更せずに、マルチモデル実装計画を作成する。                                                                    | [commands/multi-plan.md](https://github.com/affaan-m/ECC/blob/main/commands/multi-plan.md)         |
| `/multi-workflow` | `multi-workflow` | 調査、計画、実行、最適化、レビューを含む完全なマルチモデル開発ワークフローを実行する。                                      | [commands/multi-workflow.md](https://github.com/affaan-m/ECC/blob/main/commands/multi-workflow.md) |
| `/santa-loop`     | `santa-loop`     | 敵対的デュアルレビュー収束ループ — 2つの独立したモデルレビュアーが両方とも承認するまでコードは出荷されない。                | [commands/santa-loop.md](https://github.com/affaan-m/ECC/blob/main/commands/santa-loop.md)         |

---

## ドキュメント/ナレッジ/リサーチ（3）

ドキュメント更新、最新情報調査、ナレッジ管理、コードベース理解。

| Command            | ID                | 説明                                                                                                                  | Source                                                                                               |
| ------------------ | ----------------- | --------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `/ecc-guide`       | `ecc-guide`       | ライブリポジトリから ECC の現在の agents、skills、commands、hooks、インストールプロファイル、ドキュメントを参照する。 | [commands/ecc-guide.md](https://github.com/affaan-m/ECC/blob/main/commands/ecc-guide.md)             |
| `/update-codemaps` | `update-codemaps` | プロジェクト構造をスキャンし、トークン効率の良いアーキテクチャ codemap を生成する。                                   | [commands/update-codemaps.md](https://github.com/affaan-m/ECC/blob/main/commands/update-codemaps.md) |
| `/update-docs`     | `update-docs`     | scripts、schemas、routes、exports などのソースオブトゥルースファイルからドキュメントを同期する。                      | [commands/update-docs.md](https://github.com/affaan-m/ECC/blob/main/commands/update-docs.md)         |

---

## GitHub/プロジェクト運用/セッション（11）

PR、セッション保存、チェックポイント、プロジェクト運用。

| Command           | ID               | 説明                                                                                                                                                | Source                                                                                             |
| ----------------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `/aside`          | `aside`          | 現在のタスクのコンテキストを中断または失うことなく、簡単なサイド質問に回答する。回答後に自動的に作業を再開する。                                    | [commands/aside.md](https://github.com/affaan-m/ECC/blob/main/commands/aside.md)                   |
| `/jira`           | `jira`           | Jira チケットを取得し、要件を分析し、ステータスを更新するかコメントを追加する。jira-integration skill と MCP または REST API を使用する。           | [commands/jira.md](https://github.com/affaan-m/ECC/blob/main/commands/jira.md)                     |
| `/pm2`            | `pm2`            | プロジェクトを分析し、検出されたフロントエンド、バックエンド、データベースサービス向けの PM2 サービスコマンドを生成する。                           | [commands/pm2.md](https://github.com/affaan-m/ECC/blob/main/commands/pm2.md)                       |
| `/pr`             | `pr`             | 未プッシュコミットを含む現在のブランチから GitHub PR を作成する — テンプレートを検出し、変更を分析し、プッシュする。                                | [commands/pr.md](https://github.com/affaan-m/ECC/blob/main/commands/pr.md)                         |
| `/project-init`   | `project-init`   | プロジェクトのスタックを検出し、リポジトリのインストールマニフェストとスタックマッピングを使用して ECC オンボーディング計画のドライランを作成する。 | [commands/project-init.md](https://github.com/affaan-m/ECC/blob/main/commands/project-init.md)     |
| `/prp-commit`     | `prp-commit`     | 自然言語によるファイル指定でクイックコミット — コミット対象を平易な英語で記述する。                                                                 | [commands/prp-commit.md](https://github.com/affaan-m/ECC/blob/main/commands/prp-commit.md)         |
| `/prp-implement`  | `prp-implement`  | 厳密な検証ループ付きで実装計画を実行する。                                                                                                          | [commands/prp-implement.md](https://github.com/affaan-m/ECC/blob/main/commands/prp-implement.md)   |
| `/prp-pr`         | `prp-pr`         | 未プッシュコミットを含む現在のブランチから GitHub PR を作成する — テンプレートを検出し、変更を分析し、プッシュする。                                | [commands/prp-pr.md](https://github.com/affaan-m/ECC/blob/main/commands/prp-pr.md)                 |
| `/resume-session` | `resume-session` | ~/.claude/session-data/ から最新のセッションファイルを読み込み、前回セッション終了地点の完全なコンテキストで作業を再開する。                        | [commands/resume-session.md](https://github.com/affaan-m/ECC/blob/main/commands/resume-session.md) |
| `/save-session`   | `save-session`   | 現在のセッション状態を ~/.claude/session-data/ に日付付きファイルとして保存し、将来のセッションで完全なコンテキストで作業を再開できるようにする。   | [commands/save-session.md](https://github.com/affaan-m/ECC/blob/main/commands/save-session.md)     |
| `/sessions`       | `sessions`       | Claude Code セッション履歴、エイリアス、セッションメタデータを管理する。                                                                            | [commands/sessions.md](https://github.com/affaan-m/ECC/blob/main/commands/sessions.md)             |

---

## その他/専門領域（10）

上記に明確に入らない専門用途。

| Command               | ID                   | 説明                                                                                                                                                                                                                                      | Source                                                                                                     |
| --------------------- | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `/hookify-configure`  | `hookify-configure`  | hookify ルールをインタラクティブに有効化または無効化する。                                                                                                                                                                                | [commands/hookify-configure.md](https://github.com/affaan-m/ECC/blob/main/commands/hookify-configure.md)   |
| `/marketing-campaign` | `marketing-campaign` | プロダクトブリーフを起点にエンドツーエンドのマーケティングキャンペーンを計画・実行する。ポジショニング、LP コピー、メールシーケンス、SNS 投稿、広告バリアント、動画スクリプト、コンテンツカレンダーを返す。既存コピーのレビューにも対応。 | [commands/marketing-campaign.md](https://github.com/affaan-m/ECC/blob/main/commands/marketing-campaign.md) |
| `/hookify-help`       | `hookify-help`       | hookify システムのヘルプを表示する。                                                                                                                                                                                                      | [commands/hookify-help.md](https://github.com/affaan-m/ECC/blob/main/commands/hookify-help.md)             |
| `/hookify-list`       | `hookify-list`       | 設定済みの hookify ルールをすべて一覧表示する。                                                                                                                                                                                           | [commands/hookify-list.md](https://github.com/affaan-m/ECC/blob/main/commands/hookify-list.md)             |
| `/instinct-export`    | `instinct-export`    | チームメイトや他のプロジェクトと共有するためにインスティンクトをエクスポート                                                                                                                                                              | [commands/instinct-export.md](https://github.com/affaan-m/ECC/blob/main/commands/instinct-export.md)       |
| `/instinct-import`    | `instinct-import`    | チームメイト、Skill Creator、その他のソースからインスティンクトをインポート                                                                                                                                                               | [commands/instinct-import.md](https://github.com/affaan-m/ECC/blob/main/commands/instinct-import.md)       |
| `/instinct-status`    | `instinct-status`    | すべての学習済みインスティンクトと信頼度レベルを表示                                                                                                                                                                                      | [commands/instinct-status.md](https://github.com/affaan-m/ECC/blob/main/commands/instinct-status.md)       |
| `/learn-eval`         | `learn-eval`         | セッションから再利用可能なパターンを抽出し、保存前に品質を自己評価し、適切な保存先（Global vs Project）を決定する。                                                                                                                       | [commands/learn-eval.md](https://github.com/affaan-m/ECC/blob/main/commands/learn-eval.md)                 |
| `/skill-create`       | `skill-create`       | ローカルのgit履歴を分析してコーディングパターンを抽出し、SKILL.mdファイルを生成します。Skill Creator GitHub Appのローカル版です。                                                                                                         | [commands/skill-create.md](https://github.com/affaan-m/ECC/blob/main/commands/skill-create.md)             |
| `/skill-health`       | `skill-health`       | チャートとアナリティクス付きのスキルポートフォリオヘルスダッシュボードを表示する。                                                                                                                                                        | [commands/skill-health.md](https://github.com/affaan-m/ECC/blob/main/commands/skill-health.md)             |

---

**ナビゲーション**: [インデックス](./ecc-index.md) | [呼び出し方](./ecc-usage.md) | [Agents](./ecc-agents.md) | **Commands** | [Skills](./ecc-skills.md)
