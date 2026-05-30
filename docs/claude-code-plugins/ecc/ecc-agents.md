# `everything-claude-code` — Agents 一覧

**ナビゲーション**: [インデックス](./ecc-index.md) | [呼び出し方](./ecc-usage.md) | **Agents** | [Commands](./ecc-commands.md) | [Skills](./ecc-skills.md)

スナップショット: 2026-05-28 | 合計: 61件 / 13カテゴリ

Agent は自然言語で依頼するか、Claude Code の subagent 指定で呼び出す。

---

### 計画/設計/アーキテクチャ（5）

実装前の計画、構造設計、ADR、プロダクト要求から設計への変換。

| Agent            | 説明                                                                                                                                                                                                                        | Source                                                                                         |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `a11y-architect` | Webおよびネイティブプラットフォーム向けのWCAG 2.2準拠を専門とするアクセシビリティアーキテクト。UIコンポーネントの設計、デザインシステムの構築、インクルーシブなユーザー体験のためのコード監査時に積極的に使用してください。 | [agents/a11y-architect.md](https://github.com/affaan-m/ECC/blob/main/agents/a11y-architect.md) |
| `architect`      | システム設計、スケーラビリティ、技術的意思決定を専門とするソフトウェアアーキテクチャスペシャリスト。新機能の計画、大規模システムのリファクタリング、アーキテクチャ上の意思決定を行う際に積極的に使用してください。          | [agents/architect.md](https://github.com/affaan-m/ECC/blob/main/agents/architect.md)           |
| `code-architect` | 既存コードベースのパターンと規約を分析し、具体的なファイル、インターフェース、データフロー、構築順序を含む実装設計図を提供して機能アーキテクチャを設計します。                                                              | [agents/code-architect.md](https://github.com/affaan-m/ECC/blob/main/agents/code-architect.md) |
| `code-explorer`  | 実行パスを追跡し、アーキテクチャレイヤーをマッピングし、依存関係を文書化することで既存コードベースの機能を深く分析し、新規開発に活用します。                                                                                | [agents/code-explorer.md](https://github.com/affaan-m/ECC/blob/main/agents/code-explorer.md)   |
| `planner`        | 複雑な機能とリファクタリングのための専門計画スペシャリスト。ユーザーが機能実装、アーキテクチャの変更、または複雑なリファクタリングを要求した際に積極的に使用します。計画タスク用に自動的に起動されます。                    | [agents/planner.md](https://github.com/affaan-m/ECC/blob/main/agents/planner.md)               |

### コード品質/レビュー/リファクタ（20）

コードレビュー、保守性、コメント、型設計、デッドコード整理。

| Agent                   | 説明                                                                                                                                                                                                                                                                                          | Source                                                                                                       |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `code-reviewer`         | 専門コードレビュースペシャリスト。品質、セキュリティ、保守性のためにコードを積極的にレビューします。コードの記述または変更直後に使用してください。すべてのコード変更に対して必須です。                                                                                                        | [agents/code-reviewer.md](https://github.com/affaan-m/ECC/blob/main/agents/code-reviewer.md)                 |
| `code-simplifier`       | 動作を維持しながら、明確さ、一貫性、保守性のためにコードを簡素化・洗練します。特に指示がない限り、最近変更されたコードに焦点を当てます。                                                                                                                                                      | [agents/code-simplifier.md](https://github.com/affaan-m/ECC/blob/main/agents/code-simplifier.md)             |
| `comment-analyzer`      | コードコメントの正確性、完全性、保守性、およびコメント劣化リスクを分析します。                                                                                                                                                                                                                | [agents/comment-analyzer.md](https://github.com/affaan-m/ECC/blob/main/agents/comment-analyzer.md)           |
| `cpp-reviewer`          | メモリ安全性、モダンC++イディオム、並行処理、パフォーマンスを専門とする専門C++コードレビュアー。すべてのC++コード変更に使用してください。C++ プロジェクトでは必須です。                                                                                                                       | [agents/cpp-reviewer.md](https://github.com/affaan-m/ECC/blob/main/agents/cpp-reviewer.md)                   |
| `csharp-reviewer`       | .NET規約、asyncパターン、セキュリティ、nullable参照型、パフォーマンスを専門とする専門C#コードレビュアー。すべてのC#コード変更に使用してください。C# プロジェクトでは必須です。                                                                                                                | [agents/csharp-reviewer.md](https://github.com/affaan-m/ECC/blob/main/agents/csharp-reviewer.md)             |
| `database-reviewer`     | クエリ最適化、スキーマ設計、セキュリティ、パフォーマンスのためのPostgreSQLデータベーススペシャリスト。SQL作成、マイグレーション作成、スキーマ設計、データベースパフォーマンスのトラブルシューティング時に積極的に使用してください。Supabaseのベストプラクティスを組み込んでいます。           | [agents/database-reviewer.md](https://github.com/affaan-m/ECC/blob/main/agents/database-reviewer.md)         |
| `django-reviewer`       | ORMの正確性、DRFパターン、マイグレーション安全性、セキュリティ設定ミス、本番レベルのDjangoプラクティスを専門とする専門Djangoコードレビュアー。すべてのDjangoコード変更に使用してください。Django プロジェクトでは必須です。                                                                   | [agents/django-reviewer.md](https://github.com/affaan-m/ECC/blob/main/agents/django-reviewer.md)             |
| `fastapi-reviewer`      | asyncの正確性、依存性注入、Pydanticスキーマ、セキュリティ、OpenAPI品質、テスト、本番稼働の準備についてFastAPIアプリケーションをレビューします。                                                                                                                                               | [agents/fastapi-reviewer.md](https://github.com/affaan-m/ECC/blob/main/agents/fastapi-reviewer.md)           |
| `flutter-reviewer`      | FlutterおよびDartコードレビュアー。ウィジェットのベストプラクティス、状態管理パターン、Dartイディオム、パフォーマンス上の落とし穴、アクセシビリティ、クリーンアーキテクチャ違反についてFlutterコードをレビューします。ライブラリ非依存 — あらゆる状態管理ソリューションとツールに対応します。 | [agents/flutter-reviewer.md](https://github.com/affaan-m/ECC/blob/main/agents/flutter-reviewer.md)           |
| `fsharp-reviewer`       | 関数型イディオム、型安全性、パターンマッチング、計算式、パフォーマンスを専門とする専門F#コードレビュアー。すべてのF#コード変更に使用してください。F# プロジェクトでは必須です。                                                                                                               | [agents/fsharp-reviewer.md](https://github.com/affaan-m/ECC/blob/main/agents/fsharp-reviewer.md)             |
| `go-reviewer`           | 慣用的なGo、並行処理パターン、エラー処理、パフォーマンスを専門とする専門Goコードレビュアー。すべてのGo                                                                                                                                                                                        | [agents/go-reviewer.md](https://github.com/affaan-m/ECC/blob/main/agents/go-reviewer.md)                     |
| `java-reviewer`         | Spring BootおよびQuarkusプロジェクト向けの専門Javaコードレビュアー。フレームワークを自動検出し、適切なレビュールールを適用します。レイヤードアーキテクチャ、JPA/Panache、MongoDB、セキュリティ、並行処理をカバーします。すべてのJavaコード変更に必須です。                                    | [agents/java-reviewer.md](https://github.com/affaan-m/ECC/blob/main/agents/java-reviewer.md)                 |
| `kotlin-reviewer`       | KotlinおよびAndroid/KMPコードレビュアー。慣用的なパターン、コルーチン安全性、Composeベストプラクティス、クリーンアーキテクチャ違反、一般的なAndroidの落とし穴についてKotlinコードをレビューします。                                                                                           | [agents/kotlin-reviewer.md](https://github.com/affaan-m/ECC/blob/main/agents/kotlin-reviewer.md)             |
| `python-reviewer`       | PEP 8準拠、Pythonイディオム、型ヒント、セキュリティ、パフォーマンスを専門とする専門Pythonコードレビュアー。すべてのPythonコード変更に使用してください。Pythonプロジェクトに必須です。                                                                                                         | [agents/python-reviewer.md](https://github.com/affaan-m/ECC/blob/main/agents/python-reviewer.md)             |
| `refactor-cleaner`      | デッドコードクリーンアップと統合スペシャリスト。未使用コード、重複の削除、リファクタリングに積極的に使用してください。分析ツール（knip、depcheck、ts-prune）を実行してデッドコードを特定し、安全に削除します。                                                                                | [agents/refactor-cleaner.md](https://github.com/affaan-m/ECC/blob/main/agents/refactor-cleaner.md)           |
| `rust-reviewer`         | 所有権、ライフタイム、エラー処理、unsafe使用、慣用的なパターンを専門とする専門Rustコードレビュアー。すべてのRustコード変更に使用してください。Rust プロジェクトでは必須です。                                                                                                                 | [agents/rust-reviewer.md](https://github.com/affaan-m/ECC/blob/main/agents/rust-reviewer.md)                 |
| `silent-failure-hunter` | サイレント障害、飲み込まれたエラー、不適切なフォールバック、欠落したエラー伝播についてコードをレビューします。                                                                                                                                                                                | [agents/silent-failure-hunter.md](https://github.com/affaan-m/ECC/blob/main/agents/silent-failure-hunter.md) |
| `swift-reviewer`        | プロトコル指向設計、値セマンティクス、ARCメモリ管理、Swift Concurrency、慣用的なパターンを専門とする専門Swiftコードレビュアー。すべてのSwiftコード変更に使用してください。Swift プロジェクトでは必須です。                                                                                    | [agents/swift-reviewer.md](https://github.com/affaan-m/ECC/blob/main/agents/swift-reviewer.md)               |
| `type-design-analyzer`  | カプセル化、不変条件の表現、有用性、強制力について型設計を分析します。                                                                                                                                                                                                                        | [agents/type-design-analyzer.md](https://github.com/affaan-m/ECC/blob/main/agents/type-design-analyzer.md)   |
| `typescript-reviewer`   | 型安全性、asyncの正確性、Node/webセキュリティ、慣用的なパターンを専門とする専門TypeScript/JavaScriptコードレビュアー。すべてのTypeScriptおよびJavaScriptコード変更に使用してください。TypeScript/JavaScript プロジェクトでは必須です。                                                        | [agents/typescript-reviewer.md](https://github.com/affaan-m/ECC/blob/main/agents/typescript-reviewer.md)     |

### ビルド復旧（10）

コンパイル、型チェック、依存関係、ビルド失敗の復旧。

| Agent                    | 説明                                                                                                                                                                                                                                                                            | Source                                                                                                         |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `cpp-build-resolver`     | C++ビルド、CMake、コンパイルエラー解決スペシャリスト。最小限の変更でビルドエラー、リンカー問題、テンプレートエラーを修正します。C++ビルドが失敗したときに使用してください。                                                                                                     | [agents/cpp-build-resolver.md](https://github.com/affaan-m/ECC/blob/main/agents/cpp-build-resolver.md)         |
| `dart-build-resolver`    | Dart/Flutterビルド、解析、依存関係エラー解決スペシャリスト。最小限の外科的変更で`dart analyze`エラー、Flutterコンパイル失敗、pub依存関係の競合、build_runner問題を修正します。Dart/Flutterビルドが失敗したときに使用してください。                                              | [agents/dart-build-resolver.md](https://github.com/affaan-m/ECC/blob/main/agents/dart-build-resolver.md)       |
| `django-build-resolver`  | Django/Pythonビルド、マイグレーション、依存関係エラー解決スペシャリスト。最小限の変更でpip/Poetryエラー、マイグレーション競合、インポートエラー、Django設定問題、collectstatic失敗を修正します。Djangoのセットアップまたは起動が失敗したときに使用してください。                | [agents/django-build-resolver.md](https://github.com/affaan-m/ECC/blob/main/agents/django-build-resolver.md)   |
| `go-build-resolver`      | Goビルド、vet、コンパイルエラー解決スペシャリスト。最小限の変更でビルドエラー、go vet問題、リンターの警告を修正します。Goビルドが失敗したときに使用してください。                                                                                                               | [agents/go-build-resolver.md](https://github.com/affaan-m/ECC/blob/main/agents/go-build-resolver.md)           |
| `harmonyos-app-resolver` | ArkTSおよびArkUIを専門とするHarmonyOSアプリケーション開発のエキスパート。V2状態管理の準拠、Navigationルーティングパターン、API使用、パフォーマンスのベストプラクティスについてコードをレビューします。HarmonyOS/OpenHarmonyプロジェクト向けに使用してください。                 | [agents/harmonyos-app-resolver.md](https://github.com/affaan-m/ECC/blob/main/agents/harmonyos-app-resolver.md) |
| `java-build-resolver`    | Java/Maven/Gradleビルド、コンパイル、依存関係エラー解決スペシャリスト。Spring BootまたはQuarkusを自動検出し、フレームワーク固有の修正を適用します。最小限の変更でビルドエラー、Javaコンパイラエラー、Maven/Gradle問題を修正します。Javaビルドが失敗したときに使用してください。 | [agents/java-build-resolver.md](https://github.com/affaan-m/ECC/blob/main/agents/java-build-resolver.md)       |
| `kotlin-build-resolver`  | Kotlin/Gradleビルド、コンパイル、依存関係エラー解決スペシャリスト。最小限の変更でビルドエラー、Kotlinコンパイラエラー、Gradle問題を修正します。Kotlinビルドが失敗したときに使用してください。                                                                                   | [agents/kotlin-build-resolver.md](https://github.com/affaan-m/ECC/blob/main/agents/kotlin-build-resolver.md)   |
| `pytorch-build-resolver` | PyTorchランタイム、CUDA、トレーニングエラー解決スペシャリスト。最小限の変更でテンソル形状の不一致、デバイスエラー、勾配問題、DataLoader問題、混合精度の失敗を修正します。PyTorchのトレーニングまたは推論がクラッシュしたときに使用してください。                                | [agents/pytorch-build-resolver.md](https://github.com/affaan-m/ECC/blob/main/agents/pytorch-build-resolver.md) |
| `rust-build-resolver`    | Rustビルド、コンパイル、依存関係エラー解決スペシャリスト。最小限の変更でcargo buildエラー、借用チェッカー問題、Cargo.toml問題を修正します。Rustビルドが失敗したときに使用してください。                                                                                         | [agents/rust-build-resolver.md](https://github.com/affaan-m/ECC/blob/main/agents/rust-build-resolver.md)       |
| `swift-build-resolver`   | Swift/Xcodeビルド、コンパイル、依存関係エラー解決スペシャリスト。最小限の変更でswift buildエラー、Xcodeビルド失敗、SPM依存関係問題、コード署名問題を修正します。Swiftビルドが失敗したときに使用してください。                                                                   | [agents/swift-build-resolver.md](https://github.com/affaan-m/ECC/blob/main/agents/swift-build-resolver.md)     |

### テスト/検証/品質ゲート（7）

TDD、E2E、カバレッジ、品質ゲート、リリース前検証。

| Agent              | 説明                                                                                                                                                                                                                                                                                                                                  | Source                                                                                             |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `e2e-runner`       | Vercel Agent Browser（推奨）とPlaywrightフォールバックを使用するエンドツーエンドテストスペシャリスト。E2Eテストの生成、メンテナンス、実行に積極的に使用してください。テストジャーニーの管理、不安定なテストの隔離、アーティファクト（スクリーンショット、ビデオ、トレース）のアップロード、重要なユーザーフローの動作確認を行います。 | [agents/e2e-runner.md](https://github.com/affaan-m/ECC/blob/main/agents/e2e-runner.md)             |
| `gan-evaluator`    | GAN Harness — Evaluatorエージェント。Playwrightで稼働中のアプリケーションをテストし、ルーブリックに基づいてスコアリングし、Generatorに実行可能なフィードバックを提供します。                                                                                                                                                          | [agents/gan-evaluator.md](https://github.com/affaan-m/ECC/blob/main/agents/gan-evaluator.md)       |
| `gan-generator`    | GAN Harness — Generatorエージェント。仕様に従って機能を実装し、Evaluatorのフィードバックを読み取り、品質閾値に達するまで反復します。                                                                                                                                                                                                  | [agents/gan-generator.md](https://github.com/affaan-m/ECC/blob/main/agents/gan-generator.md)       |
| `gan-planner`      | GAN Harness — Plannerエージェント。1行のプロンプトを機能、スプリント、評価基準、デザイン方針を含む完全な製品仕様に展開します。                                                                                                                                                                                                        | [agents/gan-planner.md](https://github.com/affaan-m/ECC/blob/main/agents/gan-planner.md)           |
| `loop-operator`    | 自律型エージェントループを操作し、進捗を監視し、ループが停止した際に安全に介入します。                                                                                                                                                                                                                                                | [agents/loop-operator.md](https://github.com/affaan-m/ECC/blob/main/agents/loop-operator.md)       |
| `pr-test-analyzer` | プルリクエストのテストカバレッジの品質と完全性をレビューします。振る舞いのカバレッジと実際のバグ防止に重点を置きます。                                                                                                                                                                                                                | [agents/pr-test-analyzer.md](https://github.com/affaan-m/ECC/blob/main/agents/pr-test-analyzer.md) |
| `tdd-guide`        | テスト駆動開発スペシャリストで、テストファースト方法論を強制します。新しい機能の記述、バグの修正、コードのリファクタリング時に積極的に使用してください。80%以上のテストカバレッジを確保します。                                                                                                                                       | [agents/tdd-guide.md](https://github.com/affaan-m/ECC/blob/main/agents/tdd-guide.md)               |

### フロントエンド/UI/デザイン（2）

UI 実装、アクセシビリティ、SEO、モーション、ブラウザ QA、フロントエンド系フレームワーク。

| Agent                   | 説明                                                                                                                                                                                                                                           | Source                                                                                                       |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `performance-optimizer` | パフォーマンス分析・最適化スペシャリスト。ボトルネックの特定、遅いコードの最適化、バンドルサイズの削減、ランタイムパフォーマンスの改善に積極的に使用してください。プロファイリング、メモリリーク、レンダー最適化、アルゴリズム改善を行います。 | [agents/performance-optimizer.md](https://github.com/affaan-m/ECC/blob/main/agents/performance-optimizer.md) |
| `seo-specialist`        | テクニカルSEO監査、オンページ最適化、構造化データ、Core Web Vitals、コンテンツ/キーワードマッピングを担当するSEOスペシャリスト。サイト監査、メタタグレビュー、スキーママークアップ、sitemapおよびrobotsの問題、SEO改善計画に使用してください。 | [agents/seo-specialist.md](https://github.com/affaan-m/ECC/blob/main/agents/seo-specialist.md)               |

### セキュリティ/コンプライアンス（3）

脆弱性、認証認可、秘密情報、PHI/HIPAA、規制・安全性。

| Agent                  | 説明                                                                                                                                                                                                                                                                                                    | Source                                                                                                     |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `healthcare-reviewer`  | 臨床安全性、CDSS精度、PHIコンプライアンス、医療データの完全性についてヘルスケアアプリケーションコードをレビューします。EMR/EHR、臨床意思決定支援、健康情報システムに特化しています。                                                                                                                    | [agents/healthcare-reviewer.md](https://github.com/affaan-m/ECC/blob/main/agents/healthcare-reviewer.md)   |
| `opensource-sanitizer` | 公開前にオープンソースフォークが完全にサニタイズされているか検証します。20以上の正規表現パターンで漏洩シークレット、PII、内部参照、危険なファイルをスキャンします。PASS/FAIL/PASS-WITH-WARNINGSレポートを生成します。opensource-pipelineスキルの第2段階です。公開リリース前に積極的に使用してください。 | [agents/opensource-sanitizer.md](https://github.com/affaan-m/ECC/blob/main/agents/opensource-sanitizer.md) |
| `security-reviewer`    | セキュリティ脆弱性検出および修復のスペシャリスト。ユーザー入力、認証、APIエンドポイント、機密データを扱うコードを書いた後に積極的に使用してください。シークレット、SSRF、インジェクション、安全でない暗号、OWASP Top 10の脆弱性を検出します。                                                           | [agents/security-reviewer.md](https://github.com/affaan-m/ECC/blob/main/agents/security-reviewer.md)       |

### DevOps/インフラ/ネットワーク（5）

Docker、デプロイ、ネットワーク、homelab、運用基盤。

| Agent                     | 説明                                                                                                                                                                                         | Source                                                                                                           |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `harness-optimizer`       | 信頼性、コスト、スループットのためのローカルエージェントハーネス設定を分析・改善します。                                                                                                     | [agents/harness-optimizer.md](https://github.com/affaan-m/ECC/blob/main/agents/harness-optimizer.md)             |
| `homelab-architect`       | ハードウェア構成、目標、運用者の経験レベルからホームおよび小規模ラボのネットワーク計画を設計します。安全な段階的変更とロールバックガイダンスを提供します。                                   | [agents/homelab-architect.md](https://github.com/affaan-m/ECC/blob/main/agents/homelab-architect.md)             |
| `network-architect`       | 要件からエンタープライズまたはマルチサイトのネットワークアーキテクチャを設計します。既存のネットワークスキルを活用し、ルーティング、検証、自動化、トラブルシューティングの詳細に対応します。 | [agents/network-architect.md](https://github.com/affaan-m/ECC/blob/main/agents/network-architect.md)             |
| `network-config-reviewer` | セキュリティ、正確性、古い参照、リスクの高い変更ウィンドウコマンド、欠落した運用ガードレールについてルーターおよびスイッチ設定をレビューします。                                             | [agents/network-config-reviewer.md](https://github.com/affaan-m/ECC/blob/main/agents/network-config-reviewer.md) |
| `network-troubleshooter`  | 読み取り専用のOSIレイヤーワークフローと根拠に基づく根本原因サマリーで、ネットワーク接続、ルーティング、DNS、インターフェース、ポリシーの症状を診断します。                                   | [agents/network-troubleshooter.md](https://github.com/affaan-m/ECC/blob/main/agents/network-troubleshooter.md)   |

### AIエージェント/自律化（1）

自律ループ、マルチエージェント、評価ハーネス、AI 実行基盤。

| Agent                   | 説明                                                                                                                       | Source                                                                                                       |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `conversation-analyzer` | 会話トランスクリプトを分析してフックで防止すべき振る舞いを見つける際に使用してください。引数なしの/hookifyで起動されます。 | [agents/conversation-analyzer.md](https://github.com/affaan-m/ECC/blob/main/agents/conversation-analyzer.md) |

### ドキュメント/ナレッジ/リサーチ（2）

ドキュメント更新、最新情報調査、ナレッジ管理、コードベース理解。

| Agent         | 説明                                                                                                                                                                                                                             | Source                                                                                   |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `doc-updater` | ドキュメントとコードマップのスペシャリスト。コードマップとドキュメントの更新に積極的に使用してください。/update-codemapsと/update-docsを実行し、docs/CODEMAPS/\*を生成し、READMEとガイドを更新します。                           | [agents/doc-updater.md](https://github.com/affaan-m/ECC/blob/main/agents/doc-updater.md) |
| `docs-lookup` | ユーザーがライブラリ、フレームワーク、APIの使い方を尋ねた場合、または最新のコード例が必要な場合、Context7 MCPで現行ドキュメントを取得し、例付きの回答を返します。ドキュメント/API/セットアップに関する質問で呼び出してください。 | [agents/docs-lookup.md](https://github.com/affaan-m/ECC/blob/main/agents/docs-lookup.md) |

### GitHub/プロジェクト運用/セッション（2）

PR、セッション保存、チェックポイント、プロジェクト運用。

| Agent                 | 説明                                                                                                                                                                                                                                                                              | Source                                                                                                   |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| `opensource-forker`   | オープンソース化のために任意のプロジェクトをフォークします。ファイルをコピーし、シークレットと認証情報を除去（20以上のパターン）、内部参照をプレースホルダーに置換し、.env.exampleを生成し、git履歴をクリーンアップします。opensource-pipelineスキルの第1段階です。               | [agents/opensource-forker.md](https://github.com/affaan-m/ECC/blob/main/agents/opensource-forker.md)     |
| `opensource-packager` | サニタイズ済みプロジェクト向けの完全なオープンソースパッケージングを生成します。CLAUDE.md、setup.sh、README.md、LICENSE、CONTRIBUTING.md、GitHub issueテンプレートを作成します。任意のリポジトリをClaude Codeですぐに使える状態にします。opensource-pipelineスキルの第3段階です。 | [agents/opensource-packager.md](https://github.com/affaan-m/ECC/blob/main/agents/opensource-packager.md) |

### ビジネス/オペレーション（2）

請求、物流、投資家対応、調達、メール、営業、業務運用、マーケティング。

| Agent             | 説明                                                                                                                                                                                                                                                                                                     | Source                                                                                           |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `chief-of-staff`  | メール、Slack、LINE、Messengerを仕分けする個人向けコミュニケーションchief of staff。メッセージを4段階（skip/info_only/meeting_info/action_required）に分類し、返信ドラフトを生成し、フックで送信後のフォロースルーを強制します。マルチチャネルコミュニケーションワークフローの管理時に使用してください。 | [agents/chief-of-staff.md](https://github.com/affaan-m/ECC/blob/main/agents/chief-of-staff.md)   |
| `marketing-agent` | マーケティング戦略・コピーライティング担当。キャンペーン計画、オーディエンス調査、ポジショニング、コピー作成、コンテンツレビュー。LP、メールシーケンス、SNS 投稿、広告コピー、短尺動画スクリプト、コンテンツカレンダー対応。製品ローンチやマーケティングキャンペーン計画・実行時に使用してください。     | [agents/marketing-agent.md](https://github.com/affaan-m/ECC/blob/main/agents/marketing-agent.md) |

### 科学/データ/ML（1）

機械学習、推薦、学術文献、特許、バイオ系データベース。

| Agent          | 説明                                                                                                                                                                                                                                                                             | Source                                                                                     |
| -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `mle-reviewer` | データ契約、フィーチャーパイプライン、トレーニング再現性、オフライン/オンライン評価、モデルサービング、監視、ロールバックを担当する本番機械学習エンジニアリングレビュアー。ML、MLOps、モデルトレーニング、推論、フィーチャーストア、または評価コードの変更時に使用してください。 | [agents/mle-reviewer.md](https://github.com/affaan-m/ECC/blob/main/agents/mle-reviewer.md) |

### その他/専門領域（1）

上記に明確に入らない専門用途。

| Agent                  | 説明                                                                                                                                                                                                                                                      | Source                                                                                                     |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `build-error-resolver` | ビルドおよびTypeScriptエラー解決のスペシャリスト。ビルドが失敗した際やタイプエラーが発生した際に積極的に使用してください。最小限の差分でビルド/タイプエラーのみを修正し、アーキテクチャの変更は行いません。ビルドを迅速に成功させることに焦点を当てます。 | [agents/build-error-resolver.md](https://github.com/affaan-m/ECC/blob/main/agents/build-error-resolver.md) |

---

**ナビゲーション**: [インデックス](./ecc-index.md) | [呼び出し方](./ecc-usage.md) | **Agents** | [Commands](./ecc-commands.md) | [Skills](./ecc-skills.md)
