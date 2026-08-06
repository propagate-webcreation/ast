# /design-feedback — デザインフィードバックコマンド

ポリッシュ後のサイトと修正前の差分から、CSS・色・画像配置など **デザインレベルの変更** を抽出し、材料用 MD（＋スクショ）を出力する。

送信先は **`propagate-webcreation/design-feedback-stock`**（ディレクターが皆アクセスできる org）。  
`webcreate-bot-v3` は後からこのストックを見て人手取り込みする（bot-v3 への直接 PR / clone は不要）。

サイトのコードは変更しない。差分の読み取りと MD 生成（＋任意のアップロード）のみ行う。

## 使用方法

```
/design-feedback
/design-feedback [base-ref]
/design-feedback [base-ref] --upload=repo --shots=auto
/design-feedback [base-ref] --upload=skip --shots=skip
```

## 使用例

```
/design-feedback
/design-feedback origin/main
/design-feedback origin/main --shots=skip
/design-feedback origin/main --upload=skip
```

## 引数

| 引数 | 省略時 | 説明 |
|------|--------|------|
| `base-ref` | `origin/main` | 差分の起点。無い場合は `main` → `master` → 最初のコミットの順でフォールバック |
| `output-path` | 下記「ローカル出力」 | 明示指定時のみそのパスを使う（通常は不要） |
| `--upload=` | **`repo`（既定）** | `repo` = design-feedback-stock へ PR / `skip` = ローカルのみ |
| `--shots=` | **`auto`（既定）** | `auto` = 対象を機械判定し after を可能な範囲で撮影 / `skip` = 撮影せず既存ファイルだけ使う |

### ローカル出力（サイトリポ側）

```
Site-Fix/output/{案件番号}-{案件名スラッグ}/
  design-diff-{案件番号}-{案件名スラッグ}-{YYYYMMDD}.md
  before/
  after/
```

### ストック送信先（`--upload=repo`）

リポジトリ: [`propagate-webcreation/design-feedback-stock`](https://github.com/propagate-webcreation/design-feedback-stock)

```
{案件番号}-{案件名スラッグ}/
  design-diff-....md
  before/
  after/
```

bot-v3 本体への書き込みはしない。ルール自動マージもしない。

## 前提

- カレントディレクトリがサイトリポジトリのルートである
- git リポジトリである
- 修正が一通り終わっている（**main へ push する前**が安全。push 後は base-ref に修正前コミットを指定）
- `--upload=repo`（既定）: `gh` が **propagate-webcreation** で認証済み（サイト作業と同じアカウントで可）。**bot-v3 の clone / 権限は不要**
- `--shots=auto` で after 撮影するとき: **すでに** `npm run dev` が動いていること（コマンドは dev を新規起動しない）

## スコープ

**対象（デザイン差分）:**
- 色・CSS 変数・Tailwind カラークラス
- タイポ（フォント・サイズ・行間・字間）
- 余白・レイアウト（padding / gap / grid / flex / セクション構成の見た目）
- 画像の新規配置・差し替え・サイズ・object-fit / 配置クラス
- コンポーネントの見た目（ボタン・カード・ヘッダー等の class / style）
- アンチパターン除去（影・禁止装飾・AI slop 的見た目の修正）

**対象外（L0 — Diff 段階で落とす。Summary/Diff_Index にも載せない）:**
- 文言のみ・SEO meta・フォーム項目追加・計測タグ・事実訂正（非ビジュアル）
- lockfile / `.env` / 秘密情報 / 本コマンド以外の `*.md`
- ビルド・型・lint・未 import など単発バグ修正
- 依存追加だけで見た目に影響しない `package.json` 変更

**やらないこと:**
- bot-v3 の `quality_rubric.py` / `frontend-design/SKILL.md` への自動マージ
- 修正前コミットの checkout → 再ビルド → 全ページ撮影（遅すぎるため禁止）
- コマンド内で `npm run dev` / `npm run build` を新規起動する
- サイト修正そのもの
- Slack への手動添付を前提にした運用

---

## 実行ルール（記載契約）

1. サイトのソースコードを編集しない（MD 出力・`Site-Fix/output/` 作成・アップロードのみ）
2. **差分根拠必須** — カテゴリ / Before / After の各 bullet に `evidence`（Diff_Index の path）。path に無い変更は書かない
3. **Case_Specific 隔離** — hex・固有パス・具体 token 値は Case_Specific 以外禁止
4. **Generic は新規のみ** — 既存 Hard Gate/SKILL 同趣旨は必ず Rejected。両掲禁止
5. **First_Draft_Look は人手** — 自動推測禁止。未記入は `notes: PENDING_HUMAN`
6. **見出し順序固定** — `ひと目で分かる変更` → Meta → Summary → Shot 系 → First_Draft → Before → After → カテゴリ → Generic…
7. **抽象語禁止** — 「洗練/モダン/上質/プロフェッショナル/バランス良い」単体禁止。視線・役割・密度・判別の観測語で書く
8. **Summary は結果のみ** — 3〜5 行。class 列挙・hex 禁止
9. **Anti_Patterns_Fixed = 索引** — 既存禁止に当たる修正の短いリストのみ。新規ルールは書かない
10. **Shot_Map 機械生成** — 人手で紐づけない。未撮影を実在扱いしない
11. **空節は残す** — 該当なしは `- (なし)`（見出し省略禁止）
12. **1事実1回** — 同一 change の全文コピー禁止。`principle_ref` / First_Draft 番号で参照
13. **`## ひと目で分かる変更` は人間向け要約** — 下位の構造化節から要約するだけ。新規事実・hex・Rejected 一覧を書かない

---

## Phase 0 — 案件番号・案件名の解決

MD ファイル名と本文トップに使う。次の順で埋める（先に取れた値を優先）。

### 0-1. GitHub Description / リポジトリ名

```bash
gh repo view --json name,description,url 2>/dev/null || true
git remote get-url origin 2>/dev/null || true
basename "$(git rev-parse --show-toplevel)"
```

| フィールド | 取り方 |
|------------|--------|
| 案件番号 | Description 先頭の数字（例: `20328` / `20328_...`）。無ければ repo `name` 先頭の数字連番 |
| 案件名 | Description から番号を除いた残り（会社名・サイト名）。無ければ repo `name` から番号プレフィックスを除いた部分 |

### 0-2. フォールバック

どちらも取れなければ `(不明)` / ファイル名用 `unknown`。ユーザーに一言確認してから進めてよい。

### 0-3. スラッグ化

案件名をファイル名用に変換する（日本語はそのまま残してよいが、パス区切り・空白・`/` `\` `:` は `-` に置換）。

---

## Phase 1 — 差分収集

次を順番に実行し、結果を保持する。

### 1-1. リポジトリ状態

```bash
git rev-parse --show-toplevel
git status --short
git log -5 --oneline
git rev-parse --abbrev-ref HEAD
```

### 1-2. base-ref 解決

1. 引数の `base-ref`（省略時 `origin/main`）が存在するか確認:
   ```bash
   git rev-parse --verify <base-ref>
   ```
2. 無い場合のフォールバック順: `main` → `master` → `git rev-list --max-parents=0 HEAD`
3. いずれも解決できない場合は理由を表示して **停止**

### 1-3. 差分取得

```bash
# コミット済み差分
git diff <base-ref>...HEAD --stat
git diff <base-ref>...HEAD -- \
  ':(glob)**/*.{tsx,ts,css,scss}' \
  ':(glob)**/tailwind.config.*' \
  ':(glob)**/globals.css' \
  ':(glob)**/design-tokens.css' \
  ':(glob)**/reference-theme.css' \
  ':(glob)public/**' \
  ':(glob)assets/**' \
  ':(glob)**/public/**' \
  ':(glob)**/assets/**'

# 未コミット（staged + unstaged）
git diff --stat
git diff -- \
  ':(glob)**/*.{tsx,ts,css,scss}' \
  ':(glob)**/tailwind.config.*' \
  ':(glob)**/globals.css' \
  ':(glob)**/design-tokens.css' \
  ':(glob)**/reference-theme.css' \
  ':(glob)public/**' \
  ':(glob)assets/**'

git diff --cached --stat
git diff --cached -- \
  ':(glob)**/*.{tsx,ts,css,scss}' \
  ':(glob)**/tailwind.config.*' \
  ':(glob)**/globals.css' \
  ':(glob)**/design-tokens.css' \
  ':(glob)**/reference-theme.css' \
  ':(glob)public/**' \
  ':(glob)assets/**'

# 未追跡のデザイン関連ファイル
git ls-files --others --exclude-standard | rg '\.(tsx|ts|css|scss|webp|png|jpg|jpeg|svg|gif|avif)$|/(public|assets)/|tailwind\.config|globals\.css|design-tokens\.css|reference-theme\.css' || true
```

pathspec が環境で効かない場合は、全 diff を取ったあと Phase 2 のフィルタで絞る。

### 1-4. 差分ゼロ判定

コミット済み・未コミット・未追跡のいずれにもデザイン対象差分が無い場合:

```
デザイン差分がありません。base=<...> / HEAD=<...> を確認してください。
```

と表示して **停止**（空 MD を書かない）。

---

## Phase 2 — デザイン差分の選別

各ファイル / hunk について、次のいずれかに該当する変更だけ残す。

| シグナル | 例 |
|----------|-----|
| 色 | `#RRGGBB` / `rgb()` / `hsl()` / `bg-*` / `text-*` / `border-*` / CSS 変数 `--*` |
| タイポ | `font-*` / `text-[size]` / `leading-*` / `tracking-*` / `fontFamily` |
| 余白・レイアウト | `p-*` / `m-*` / `gap-*` / `grid` / `flex` / `aspect-*` / `max-w-*` / section 構造 |
| 画像 | `next/image` / `src=` / `public/` / `assets/` / `object-cover` / 新規画像ファイル |
| 見た目コンポーネント | button / card / header / CTA の className・style |
| トークン | `design-tokens.css` / `reference-theme.css` / `tailwind.config.*` |

**文言のみ判定:** hunk 内に上記シグナルが無く、文字列リテラルや JSX テキストだけが変わっている → 除外。

**除外ファイル:** `package-lock.json` / `pnpm-lock.yaml` / `yarn.lock` / `.env*` / `*.md`（出力先以外）

---

## Phase 3 — カテゴリ分類

選別した差分を次のバケツに分類する。1 変更が複数にまたがる場合は主カテゴリに置き、他へは相互参照のみ。

1. **Color** — パレット・CSS 変数・アクセント / CTA 色の**役割**（hex は Case_Specific）
2. **Typography** — フォント・サイズ階層・行間
3. **Spacing_Layout** — 余白・グリッド・セクション間の呼吸
4. **Image_Placement** — 新規画像・差し替え・配置・トリミング
5. **Component_Visual** — ボタン / カード / ナビ等の見た目
6. **Anti_Patterns_Fixed** — **既存禁止への索引のみ**（shadow 削除・装飾バー削除など）。新規原則は書かない

### カテゴリ bullet 必須フォーマット

```
- change: <観測可能な before → after。hex 直書き禁止>
  intent: <1文。視線 / 役割 / 密度 / 判別のいずれか>
  principle_ref: <After_Principles の原則文の要約 or none>
  evidence: <Diff_Index の path 1つ以上>
```

任意: 重要な 1〜2 件だけ `shot: after/home-desktop.png`

該当なしの節は `- (なし)` を残す。

---

## Phase 3.6 — スクショ対象の機械判定（必須・高速）

**LLM に「どこを撮るか」を考えさせない。** Diff_Index（Phase 2 で残したデザイン差分ファイル）だけから機械的に決める。

### 3.6-1. ファイル → ルート対応表（この順でマッチ）

| 変更ファイルのパターン | ルート | 備考 |
|------------------------|--------|------|
| `app/**/page.tsx` | そのディレクトリの URL（`app/page.tsx`→`/`、`app/about/page.tsx`→`/about`） | 最優先 |
| `app/components/home/**` / `**/Home*.tsx` | `/` | |
| `app/components/about/**` / `**/About*.tsx` | `/about` | |
| `app/components/service*/**` / `**/Service*.tsx` | `/services` が無ければ `/service`、どちらも無ければ `/` | 存在する page を優先 |
| `app/components/contact/**` / `**/Contact*.tsx` / `**/Form*.tsx` | `/contact` | |
| `app/components/shared/Header*` / `Footer*` / `Cta*` | `/` | 共通部品はトップ 1 枚に限定 |
| `**/globals.css` / `**/design-tokens.css` / `**/reference-theme.css` / `tailwind.config.*` | `/` | テーマ変更は代表 1 ページ |
| `public/**` / `assets/**`（画像） | 参照しているコンポーネントのルート。不明なら `/` | import/src を rg で機械検索（最大 5 ファイル） |

### 3.6-2. 上限（時間予算）

- ルートは **最大 3**。超える場合の優先: `/` → `/about` → `/services` or `/service` → `/contact` → その他アルファベット順
- ビューポート:
  - `/`（ホーム）: `desktop` (1280) + `mobile` (375) の 2 枚
  - それ以外: `desktop` のみ（時間短縮）
- ファイル名: `{routeSlug}-{viewport}.png`（`/` → `home`、`/about` → `about`）

### 3.6-3. MD に必ず書く `## Screenshot_Targets`

```
- route: /
  reason_files: app/components/home/HomeHero.tsx, ...
  viewports: desktop, mobile
- route: /about
  reason_files: ...
  viewports: desktop
```

対象 0 件はあり得ない（デザイン差分がある前提）。最低 `/` を 1 件入れる。

---

## Phase 3.7 — before / after スクショ収集（時間をかけない）

### 方針

| 種類 | やり方 | 禁止 |
|------|--------|------|
| **対象判定** | Phase 3.6 の機械ルールのみ | 目視でページを巡回して選ぶ |
| **after** | dev が既に生きていれば Playwright でターゲットだけ撮影 | `npm run dev` / build の新規起動、全ページ撮影 |
| **before** | 既存ファイルをコピーするだけ | base を checkout して再ビルド・再撮影 |

全体の撮影タイムバジェット: **60 秒**。超えたら残りは `pending_capture` にして続行（MD は止めない）。

### 3.7-1. before（コピーのみ）

次の順で探し、ヒットしたファイルを `before/{routeSlug}-{viewport}.png` にコピー:

1. `Site-Fix/input/before/{routeSlug}-{viewport}.png`（推奨の置き場）
2. `Site-Fix/input/before/` 内の別名（`fv-desktop.png` → `home-desktop.png` としてコピー可）
3. ユーザーが明示したパス

**無いターゲットは撮らない・作らない。** before が 0 枚でも続行可（その場合 First_Draft_Look の notes が必須）。

### 3.7-2. after（`--shots=auto` のときだけ）

1. `--shots=skip` なら撮影せず、既存の `Site-Fix/input/after/` があればコピーして終了
2. ヘルスチェック（2 秒以内）:
   ```bash
   curl -sf -o /dev/null --max-time 2 http://127.0.0.1:3000/ || true
   ```
   失敗 → after 撮影スキップ。`Meta.shots: skipped_no_dev`。既存 `Site-Fix/input/after/` があればコピー
3. 成功 → Playwright（またはプロジェクト既定のスクショ手段）で **Screenshot_Targets だけ** 撮影し `after/` へ保存
   - 待機は最小（`networkidle` 長待ち禁止。`domcontentloaded` + 短い固定 wait ≤ 1s）
   - 失敗したルートはスキップして次へ

### 3.7-3. First_Draft_Look（人手 notes・Before より先）

**Before_Problems より先に書く。** スクショがあっても notes は人手（自動推測禁止）。

- `source`: `screenshot` / `human` / `human+screenshot` / `pending_user`
- `before` / `after`: 相対パス一覧 or `(なし)` / `pending_capture`
- `notes`: 初稿の見え方 **3 点**を含む 1 段落。未記入なら必ず `PENDING_HUMAN`（創作で埋めない）

before が無く notes も空のときだけユーザーに聞く。

---

## Phase 3.75 — Before 問題ラベル / After 原則（必須）

**First_Draft_Look の後**に書く。初稿の見え方と差分から、何が悪く何の原則で直したかを固定する。

### Before_Problems（最低 2 件）

| ラベル | 意味 |
|--------|------|
| テンプレ感 | カード3列・無難配色・世界観が立たない |
| 主従不明 | 同階層要素過多で視線の入口がない |
| 余白不足 | 詰め込み・呼吸がない |
| FV支配感不足 | 3秒で業種・空気が伝わらない |
| CTA埋没 | ボタンがメイン色に同化 |
| 単調セクション反復 | 白/淡色や同一グリッドの横断反復 |
| 画像配置ミス | 切れ・使い回し・構図失敗 |
| タイポ意図なし | ジャンプ率不足・デフォルト感 |
| 装飾ノイズ | 疑似下線・過剰影・絵文字アイコン |

```
- label: <上記>
  evidence: <Diff_Index path および/または First_Draft_Look の (1)(2)(3) 参照。創作禁止>
```

### After_Principles（Before 全ラベルを resolves でカバー）

```
- principle: <再現可能。hex/固有パスなし>
  resolves: <Before ラベル>
  how: <差分で何をしたか 1 行>
```

---

## Phase 3.8 — Shot_Map（必須・機械生成）

MD 本文の修正カテゴリと before/after 画像の対応表。**人手で紐づけない。**

### 生成手順（各 Screenshot_Targets 行について）

1. `files` ← その行の `reason_files`
2. `before` / `after` ← Phase 3.7 で実際に存在する  
   `{before|after}/{routeSlug}-{viewport}.png` だけ列挙（無いものは書かない。全部無ければ `(なし)`）
3. `md_sections` ← Phase 3 でその `files` のいずれかを根拠に書いたカテゴリ名だけを列挙  
   候補: `Color` / `Typography` / `Spacing_Layout` / `Image_Placement` / `Component_Visual` / `Anti_Patterns_Fixed`  
   どのカテゴリにも入っていないファイルだけのルートなら `md_sections: (なし)` とし、Summary / Diff_Index 参照と注記

### MD 形式

```
## Shot_Map
- route: /
  files: app/components/home/HomeHero.tsx, app/styles/design-tokens.css
  before: before/home-desktop.png, before/home-mobile.png
  after: after/home-desktop.png, after/home-mobile.png
  md_sections: Color, Spacing_Layout, Image_Placement, Component_Visual
```

### 読み方（取り込み時）

1. カテゴリ節（例: Color）を読む
2. Shot_Map で `md_sections` にその名前を含む行の `before` / `after` を開く
3. 任意: 特に重要な 1〜2 bullet だけ `shot: after/home-desktop.png` を足してよい（必須ではない）

Screenshot_Targets と Shot_Map のルート集合は一致させる（撮影スキップで画像が空でも行は残す）。

---

## Phase 4 — 汎用ルール候補（取り入れ / 入れない）

`## Generic_Rule_Candidates` には **新規の汎用原則だけ**を書く。優先は「規約エコー」ではなく、テンプレ感を溶かす構成・リズム・構図・着手前チェック。

### 4-0. 除外チェックリスト（この順・必須）

```
1. デザインか？ → No → L0（書かない）
2. 既存 Hard Gate / SKILL 同趣旨か？ → Yes → L2 Rejected
3. 固有 hex/社名/パスが本文に必要か？ → Yes → 値は Case_Specific。原則化不能なら Generic 不採用
4. 別案件で同じ Before が起きうるか？ → No → L1（MD事実のみ、Generic 禁止）
5. 参考丸コピー指示か？ → Yes → L1 のみ
6. 数値・class の直写だけか？ → 抽象化できないなら Generic 不採用
7. Before ↔ After ↔ evidence が対応するか？ → No → 候補にしない
8. novelty を「既存の何が足りないか」1文で書けるか？ → No → L2 または不採用
9. 5軸（再現性/汎用性/新規性/検証可能性/初稿効き）をすべて満たすか？ → No → 不採用
10. 残ったものだけ Generic（0〜5件）
```

### 4-1. 既存規範の読み込み

1. 同一マシンに bot-v3 があれば `domain/quality_rubric.py`（任意。無くてよい）
2. 可能なら `.claude/skills/frontend-design/SKILL.md`
3. 読めない場合: 下記チェックリストのみ。`hard_gate_source: checklist-fallback`

### 4-2. 頻出エコー（必ず Rejected）

CTA 独立色 / shadow 禁止 / 見出し装飾線禁止 / FV PC・SP 二枚 / 横スクロール禁止 / ビルド・ページ数・事実リテラル / LINE 色固定 / カルーセル・marquee・Lenis 禁止 / カード角・フォーム規約の再掲

### 4-3. 取り入れ先（target）

| target | 入れるもの |
|--------|------------|
| `hard_gates` | 機械で一意判定できる禁止・必須のみ |
| `frontend-design SKILL` | 世界観・判断原則・アンチパターン |
| `site_developer prompt` | 手順・順序のみ（原則本体は SKILL） |

同一趣旨を2層に書かない。矛盾時は既存 Hard Gate 優先。

### 4-4. confidence

- `high` — 差分明確・非重複・検証1手順。スクショなしなら high 禁止
- `medium` — 例外業種あり / 部分重複の疑い → 即 Gate 化しない
- `low` — 1案件好み / 効きが弱い → 観察メモ。ルール本文に入れない想定

### 4-5. Generic フィールド（必須）

```
- rule: <新規原則。hexなし>
  target: frontend-design SKILL | hard_gates | site_developer prompt
  confidence: high | medium | low
  novelty: <既存と何が違うか>
  rationale: <evidence path or Before ラベル>
```

新規ゼロなら:

```
- (なし — 既存 Hard Gate / SKILL と重複のみ。Rejected_As_Duplicate を参照)
```

### 4-6. Rejected_As_Duplicate（必須）

```
- rule: <棄却した規範>
  duplicate_of: hard_gates | frontend-design SKILL | checklist:<テーマ>
  note: <一言>
```

棄却ゼロなら `- (なし)`。

---

## Phase 5 — MD 出力（＋ローカル before/ after/）

1. 案件フォルダ `Site-Fix/output/{案件番号}-{案件名スラッグ}/` を作成
2. Phase 3.7 の結果を `before/` `after/` に配置済みであることを確認
3. **先に** Meta 以降の構造化節（Summary〜Ingest）を書く
4. その内容だけを要約して **`## ひと目で分かる変更`** を案件・趣旨の直後に書く（新規事実を足さない）
5. Read で人間向け節 + Shot_Map + First_Draft + Rejected 等を確認
6. ユーザーに **案件番号 / ひと目の学び件数 / before・after 枚数 / 新規候補件数** を報告し Phase 6 へ

### `## ひと目で分かる変更` の書き方（人間向け・必須）

下位節からの要約のみ。レビュー・Slack 共有はここだけ読めば足りるようにする。

| 小見出し | 内容 | 禁止 |
|----------|------|------|
| 何がダメだったか | Before_Problems + First_Draft から **最大 3 行** | hex、path、抽象語だけ |
| 何をしたか | After_Principles / Summary から **最大 3 行** | class 列挙、Rejected の再掲 |
| 画像 | Shot_Map の各ルートで before/after を Markdown 画像として並べる。無ければ `(画像なし)` | 存在しないファイルを埋め込む |
| 今回の学び | **Generic_Rule_Candidates の rule だけ**を日本語 1 行ずつ。0 件なら「既存ルールの是正が中心（新規学びなし）」 | Rejected・Case_Specific・confidence 記号の羅列 |

画像の並べ方（ルートごと）:

```markdown
#### /
| before | after |
| --- | --- |
| ![before](before/home-desktop.png) | ![after](after/home-desktop.png) |
```

mobile があるホームは desktop の下に同様の表を足してよい（最大 2 表/ルート）。

### 出力テンプレート（必須）

冒頭の HTML コメントと `## 案件` / `## 趣旨` / `## ひと目で分かる変更` は必須。

```markdown
<!--
このファイルは /design-feedback の出力である。
シンプルなデザインでありながらテンプレっぽくない、高品質な初稿を作るためのフィードバック用 MD ファイルである。
どのサイトでも使えるような、再現性のあるデザインの修正内容を以下に報告する。
-->

# Design Diff Extract

## 案件
- 案件番号: <record>
- 案件名: <case_name>

## 趣旨
シンプルなデザインでありながらテンプレっぽくない、高品質な初稿を作るためのフィードバック用 MD である。どのサイトでも使える再現性のあるデザイン修正を報告する（案件固有の色コード・画像パスは Case_Specific_Examples に隔離する）。

## ひと目で分かる変更
### 何がダメだったか
- <最大 3 行>

### 何をしたか
- <最大 3 行>

### 画像
#### /
| before | after |
| --- | --- |
| ![before](before/home-desktop.png) | ![after](after/home-desktop.png) |

### 今回の学び
- <Generic の rule を日本語 1 行ずつ。0 件なら「既存ルールの是正が中心（新規学びなし）」>

---

## Meta
- repo: <remote or folder name>
- record: <案件番号>
- case_name: <案件名>
- base: <base-ref resolved>
- head: <HEAD sha short or working-tree>
- date: <YYYY-MM-DD>
- command: /design-feedback
- upload: <design-feedback-stock PR URL | skip | pending>
- shots: auto | skip | skipped_no_dev | partial
- hard_gate_source: <path or checklist-fallback>
- filename: <出力ファイル名>
- stock_dir: <案件フォルダ名>

## Summary
- <結果のみ 3〜5 行。class 列挙・hex・抽象語禁止>

## Screenshot_Targets
- route: /
  reason_files: <機械判定ファイル>
  viewports: desktop, mobile

## Shot_Map
- route: /
  files: <reason_files>
  before: <存在するパス or (なし)>
  after: <存在するパス or (なし)>
  md_sections: Color, Spacing_Layout, ...

## First_Draft_Look
- source: screenshot | human | human+screenshot | pending_user
- before: <一覧 or (なし)>
- after: <一覧 or (なし) or pending_capture>
- notes: <人手 3 点 1 段落。未記入は PENDING_HUMAN。自動推測禁止>

## Before_Problems
- label: <語彙から選択>
  evidence: <path および/または First_Draft (n)>
- (最低 2 件)

## After_Principles
- principle: <再現可能。hexなし>
  resolves: <Before ラベル>
  how: <差分で何をしたか>
- (Before 全ラベルをカバー)

## Color
- change: <before → after。hex は書かず役割語>
  intent: <視線/役割/密度/判別>
  principle_ref: <After_Principles or none>
  evidence: <Diff_Index path>
- (なし)

## Typography
- (なし)

## Spacing_Layout
- (なし)

## Image_Placement
- (なし)

## Component_Visual
- (なし)

## Anti_Patterns_Fixed
- <既存禁止への索引のみ。例: shadow 削除 → checklist:shadow>
- (なし)

## Generic_Rule_Candidates
- rule: <新規のみ>
  target: frontend-design SKILL | hard_gates | site_developer prompt
  confidence: high | medium | low
  novelty: <既存と何が違うか>
  rationale: <evidence or Before ラベル>
- (なし — 重複のみ。Rejected を参照)

## Rejected_As_Duplicate
- rule: <棄却>
  duplicate_of: hard_gates | frontend-design SKILL | checklist:<テーマ>
  note: <一言>
- (なし)

## Case_Specific_Examples
- <hex / 固有パス / 具体 token 値のみ>
- (なし)

## Diff_Index
- <デザイン差分として採用した path 一覧>

## bot-v3 Ingest Notes
- <新規候補の層・件数・自動マージ禁止。新しい原則をここに発明しない>
```

---

## Phase 6 — design-feedback-stock へアップロード（本線）

ローカル保存のあと、**既定で** `propagate-webcreation/design-feedback-stock` へ PR する。  
bot-v3 への直接書き込み・clone・権限は不要。bot-v3 は後からストックを見に来る。

### 6-1. モード決定

1. 引数 `--upload=` があればそれに従う
2. **省略時は `repo`**
3. 値:
   - `repo`（既定）— design-feedback-stock へ案件フォルダを PR
   - `skip` — ローカルのみ

### 6-2. ハード制約（誤 push 防止 — 必須）

過去に、stock clone 失敗で作業ディレクトリがサイトリポ内に残り、サイト `main` へ誤 push した事例がある。次を破ったら **即座に中止**する。

1. **サイトリポへの `git push` / `git commit` は Phase 6 で禁止**（サイト remote・サイト cwd どちらも）
2. stock の clone / 作業ディレクトリは **必ずサイトリポの外**  
   - 推奨: `TMP=$(mktemp -d)`（通常 `/var/folders/...` または `/tmp/...`）  
   - **禁止:** サイトリポ内の相対パス（例: `./design-feedback-stock`、`Site-Fix/tmp`、カレント直下の clone）
3. clone 前に絶対パスを確認する:  
   `pwd` / `$TMP` がサイトリポのルート（`package.json` と `app/` がある場所）の配下でないこと
4. `DESIGN_FEEDBACK_STOCK_LOCAL` を使う場合も、そのパスがサイトリポ配下なら使わず `mktemp -d` にフォールバック
5. push してよい remote は **design-feedback-stock の origin のみ**。push 前に必ず確認:  
   `git remote get-url origin` が `propagate-webcreation/design-feedback-stock` を含むこと
6. **`Meta.upload` の更新先**
   - **必須:** ローカル `Site-Fix/output/.../*.md` のみ（サイトリポ内ファイル編集。commit/push しない）
   - **任意:** 同じ PR ブランチ上の stock 側 MD を追加 commit（stock 作業ディレクトリ内だけで実施）
   - **禁止:** `Meta.upload` のためだけにサイトリポを commit / push すること

### 6-3. repo（本線）

| 項目 | 値 |
|------|-----|
| リポジトリ | `propagate-webcreation/design-feedback-stock` |
| パス | `{案件番号}-{案件名スラッグ}/`（リポジトリ直下） |
| 含めるもの | MD + `before/` + `after/`（取れた分） |
| 手段 | **main 直 push 禁止。** 作業ブランチ → commit → push → `gh pr create` |

#### 手順

1. **サイトリポの外**にストック用作業コピーを用意する（常設 clone 不要）:
   ```bash
   # サイトリポの cwd にいないことを確認してから実行すること
   SITE_ROOT="$(pwd)"   # 記録のみ。この配下に clone しない
   TMP=$(mktemp -d)
   case "$TMP" in
     "$SITE_ROOT"|"$SITE_ROOT"/*) echo "REFUSE: temp dir inside site"; exit 1 ;;
   esac
   gh repo clone propagate-webcreation/design-feedback-stock "$TMP/stock"
   cd "$TMP/stock"
   git remote get-url origin | grep -q 'design-feedback-stock' || { echo "REFUSE: wrong remote"; exit 1; }
   ```
   - `DESIGN_FEEDBACK_STOCK_LOCAL` があり、かつサイトリポ外ならそのパスを使ってよい
2. `main` を最新化: `git fetch && git checkout main && git pull`
3. ブランチ作成: `feedback/{案件番号}-{YYYYMMDD}`
4. 案件フォルダへコピー（コピー元はサイトリポの `Site-Fix/output/...`。**git 操作は stock 側だけ**）:
   ```text
   {案件番号}-{案件名スラッグ}/
     design-diff-....md
     before/
     after/
   ```
5. commit（例: `stock: {案件番号} {案件名}`）— **cwd が `$TMP/stock` であること**
6. `git push -u origin HEAD` — 直前に remote が design-feedback-stock であることを再確認
7. `gh pr create --repo propagate-webcreation/design-feedback-stock --base main`  
   （案件番号・案件名・新規候補件数・スクショ有無）
8. PR URL を報告する
9. **ローカルのみ** `Site-Fix/output/.../*.md` の `Meta.upload` を PR URL に更新する（**サイトリポは commit/push しない**）
10. 必要なら stock ブランチ上の同 MD にも `Meta.upload` を書いて追加 push（任意。サイト側には触らない）
11. `cd` でサイトリポに戻り、`$TMP` を削除してよい（`rm -rf "$TMP"`）

環境変数:

- `DESIGN_FEEDBACK_STOCK_REPO`（省略時 `propagate-webcreation/design-feedback-stock`）
- `DESIGN_FEEDBACK_STOCK_LOCAL`（任意。**サイトリポ外**の常設 clone 絶対パス）

**注意:** 顧客画面を含む。private org 前提。公開にしない。bot-v3 には触らない。サイトリポ remote には一切 push しない。

### 6-4. 失敗時

アップロード失敗しても **ローカルの案件フォルダは残す**。  
サイトリポを dirty にした／誤 commit した場合は **push せず**、変更を破棄してからやり直す。  
`gh auth status` で propagate-webcreation にログインしているか確認し、`--upload=repo` で再実行を案内する。

---


## 失敗時の挙動

| 状況 | 動作 |
|------|------|
| git リポジトリでない | エラー表示して停止 |
| base-ref 解決不能 | 試した ref を列挙して停止 |
| デザイン差分ゼロ | メッセージ表示して停止（空ファイルを作らない） |
| 出力パスに書けない | エラーを表示し、代替パスを 1 つ提案 |
| `gh` 未認証で upload | ローカルは成功扱い。認証手順を案内 |
| stock clone がサイトリポ内にできそう | **中止**。`mktemp -d` で外に作り直す |
| Phase 6 でサイト remote へ push しかけた | **中止**。push しない。必要なら revert |

---

## 完了チェック

- [ ] 出力ファイル名に案件番号と案件名スラッグが含まれる（または明示 `output-path`）
- [ ] 冒頭 HTML コメント（趣旨）がある
- [ ] `## 案件` に案件番号・案件名がある
- [ ] `## 趣旨` がある
- [ ] `## Before_Problems` が 2 件以上あり、空でない
- [ ] `## After_Principles` が Before の全ラベルを `resolves` でカバーしている
- [ ] `## ひと目で分かる変更` があり、下位節と矛盾する新規事実がない
- [ ] ひと目の「今回の学び」が Generic のみ（Rejected を並べていない）
- [ ] 見出し順: ひと目 → Meta → Summary → Shot 系 → First_Draft → Before → After → カテゴリ → Generic…
- [ ] カテゴリ bullet が `change/intent/principle_ref/evidence` 形式
- [ ] First_Draft notes が人手 or `PENDING_HUMAN`
- [ ] Generic が除外チェック通過（エコーは Rejected）
- [ ] Case_Specific 以外に hex/固有パスがない
- [ ] Shot_Map が Targets と同ルート
- [ ] L0 が Diff_Index に入っていない
- [ ] `--upload=repo` なら design-feedback-stock の PR URL を報告済み（bot-v3 には触っていない）
- [ ] Phase 6 でサイトリポへの commit/push をしていない
- [ ] stock 作業ディレクトリがサイトリポ外だった
- [ ] `Meta.upload` はローカル Site-Fix（と任意で stock ブランチ）のみ更新
