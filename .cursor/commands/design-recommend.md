# デザイン推奨コマンド

デザインストックからリファレンスコンポーネントを検索し、ターゲットに統合するワークフローを実行します。

## 使用方法

```
/design-recommend [ターゲットコンポーネント]
```

## 使用例

```
/design-recommend HomeHero
/design-recommend app/components/home/HomeFeatures.tsx
/design-recommend AboutMission
/design-recommend ContactForm
```

## ワークフロー

1. **ワークフローファイル読み込み**: `memories/design_recommend_workflow.yaml`
2. **インデックス取得**: `curl -o scripts/_index.json "https://gist.githubusercontent.com/propagate1/5567ced2819730057503417bd35ee7cc/raw/_index.json"`
3. **ターゲット分析**: ターゲットコンポーネントを読み込み、構造を把握
4. **候補選出**: インデックスから5-6件のマッチするコンポーネントを選出
5. **ユーザー対話**: 上位2件を提示し、適用時プレビューをAIが提案。`npm run preview:fetch` で取得後、/preview/{id} で実際のプレビューを確認可能。質問を通じて最終1件を決定
6. **リファレンス取得**: `npx shadcn@latest add "https://gist.githubusercontent.com/propagate1/5567ced2819730057503417bd35ee7cc/raw/{id}.json"` ※idは小文字（例: about3000, feature100）
7. **統合実装**: **必ず `.cursor/rules/19-design-apply.mdc` を参照し、そのルールに従って** リファレンスデザインをターゲットに適用する

## 重要なルール

- 必ず最初に `memories/design_recommend_workflow.yaml` を読み込む
- ユーザー対話（Step 5）を省略しない
- **Step 7（統合実装）では必ず `.cursor/rules/19-design-apply.mdc` を読み、保持（Preserve）・採用（Adopt）・適応（Adapt）・禁止事項はすべてそのルールに従う**
