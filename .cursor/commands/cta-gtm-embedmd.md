あなたは Cursor の Agent です。以下の仕様に100%従って実行してください。
目的は「CTAが何回押されたか（総数）」の一括計測です。CTA別の識別は不要です。

---

# ゴール（必須）
- `mcv-trigger` は **Aタグ（<a>）のみに** 付与する（YES/NO分岐は禁止）
- CTAが <button> / role=button / div など **Aタグが無い実装**の場合は、  
  **先にAタグを生成（置換 or 安全に変換）してから** `mcv-trigger` を付与する
- 「子要素がクリックを吸収してGTMが反応しない」ケースを避けるため、  
  CTA内部のクリック対象が **必ずAタグに落ちる**ように調整する（後述：クリック吸収対策）
- クリック漏れ（子要素クリック）対策として、CTA配下の子要素に `pointer-events-none` を付与する
- GTM側は基本「クリックトリガー」で検知できる状態にする（推奨：Just Links）

---

# 絶対禁止
- Pass 1 の段階でコードを書き換えること（Pass 1 は抽出＆表示のみ）
- gtm-id / data-gtm-element-id / 設定ファイル / import を追加すること（総数計測のみなので不要）
- 破壊的なレイアウト変更（構造大改変・スタイル崩れが起こる置換）を勝手に行うこと
- 入れ子クリック構造の自動大修正（壊すリスクが高いものは WARNING のみ）
- 挙動が担保できないのに「submit系を無理にa化」すること（WARNINGしてスキップ）

---

# 対象ファイル（優先して走査）
- app/**/*.(tsx|jsx)
- src/**/*.(tsx|jsx)
- pages/**/*.(tsx|jsx)
- components/**/*.(tsx|jsx)
- **/*.html

---

# Pass 1：CTA候補の抽出（変更禁止・ここで必ず止まる）

## CTA候補（総合判定でOK）
A) 既に <a href="..."> なCTA（主要導線っぽいもの）
B) Next.js の <Link ...>（next/link）※最終的に <a> を出力するので「A相当」
C) AタグではないがCTAっぽいもの（要Aタグ生成候補）
   - <button>（type=submit含む）
   - role="button"
   - 見た目がボタンっぽい（rounded/bg/gradient/shadow/w-full/h-12等）
   - 画像CTAなど

## 基本除外（ただし明らかに主要導線なら候補に入れてよい）
- ヘッダー/フッターの小リンク列（主要CTAなら例外）
- 規約/プライバシー/会社概要などの弱い導線
- 明らかに主要アクションではないテキストリンク群

---

## Pass 1 の出力（表形式・人間用の位置説明つき）
各候補に C1, C2… のIDを振り、以下を必ず出す：

- ID（C1, C2...）

- 【人間用】位置の説明（必須）
  - フォーマット：
    `{セクション名}セクションのCTA / ボタン「{CTA文言}」 / 目印「{周辺テキスト}」`
  - 例：
    `採用セクションのCTA / ボタン「応募する」 / 目印「まずは仕事内容をご確認ください」`
    `料金プランセクションのCTA / ボタン「無料で相談」 / 目印「月額9,800円〜」`
  - 目印が取れない場合：
    `... / 目印「（周辺テキスト取得不可）」`

- セクション名（推定根拠も添える）
- CTA文言（推定根拠も添える）
- 目印（周辺テキスト）（推定根拠も添える・必須）
- page/route 推定（可能なら）

- file path
- 代表行（近い行番号）
- 種別（a / Link(a相当) / 非a）
- destination（href / Link href / router.push等の推定URL / 不明）

- 既に `mcv-trigger` が付いているか
- 付与方針（
  - A: 既存aに付与
  - B: Linkに付与（a相当）
  - C: Aタグ生成が必要（button→a変換候補）
  - D: Aタグ生成不可（挙動不明・submit特殊など）
 ）

- 【重要】クリック吸収リスク（必須：Low/Med/High）＋理由
  - Low：子要素にクリック吸収要因が見当たらない
  - Med：子要素クリックでAに届かない可能性（span/img/svg等が主。pointer-events-noneで解決可能）
  - High：以下のいずれかを含む（GTM取りこぼしの実害が出やすい）
    - Aタグの内側に `button` / `input` / `label` / `select` / `textarea` / `[role="button"]` / `[tabindex]` がある
    - 子要素に `onClick` / `onMouseDown` / `onPointerDown` / `onTouchStart` がある（特に stopPropagation / preventDefault が含まれる）
    - 絶対配置オーバーレイ等がクリック対象を奪う可能性がある
    - 入れ子 a があり、外側aの計測が取れない可能性がある（内側aが優先される）

- 推奨対応（必須：次のどれか複数）
  - PE：子要素に pointer-events-none を付与（Medの基本解）
  - PE+TAB：吸収し得る子要素（疑似ボタン等）に pointer-events-none + tabIndex=-1（Highの安全策）
  - MOVE：子要素のイベント（onClick等）を親aへ移す（Highで、子が stopPropagation する場合の対処）
  - SPLIT：内側aもCTA候補として別IDで扱う（内側aクリックの取りこぼし回避）
  - WARN：自動対応不可（フォームsubmit等）

- WARNING（入れ子a/button、classNameが複雑、URL推定不可、文言/見出し/目印が取れない等）

---

## セクション名の推定ルール（必須）
優先順位：
1) 同一ブロック（section/div等）内の **直前のh1〜h6** テキスト
2) 親/近傍の `section/div` の `id` / `aria-label` / `data-*` を人間向けに整形
3) 近傍コメント（例：`// recruit` `/* 採用 */`）があればそれ
4) それでも無理なら `（セクション不明：{コンポーネント名 or ファイル名}）`

※ “ヘッダー/フッター” と推定できる場合はセクション名に `ヘッダー` / `フッター` と明示する

---

## CTA文言の抽出ルール（必須）
優先順位：
1) a要素の子（span等含む）の **表示テキストを連結**
2) `aria-label` / `title`
3) 画像CTAなら `alt`
4) それでも無ければ `（テキストなし：icon-only）` と明示

---

## 目印（周辺テキスト）の抽出ルール（必須）
目的：人間が「ページのどの辺？」を想像できる“ランドマーク”を出す。

抽出対象：
- CTA自身のテキストは除外（＝CTA文言と被らないものを優先）
- できるだけ「CTAの近くに表示されている短い文」を拾う

優先順位：
1) CTAの**直前**にあるテキスト（同一親要素内の sibling / 近傍のp・span・div など）
2) CTAの**直後**にあるテキスト（同条件）
3) 同じセクション内の「リード文」「価格」「箇条書きの1行」など、CTA近傍の短文
4) 直前の見出し（h2/h3）直下の説明文（見出しだけでは弱い時）
5) それでも無理なら `（周辺テキスト取得不可）`

整形ルール：
- 改行や連続空白を詰める
- 20〜40文字程度に短縮（長ければ末尾を `…`）
- 個人情報っぽいものは伏せる（例：メール形式 → `[email]`、電話/連番の数字4桁以上 → `****`）
- 目印が “クリックして変化するUI文言” しか取れない場合は WARNING（信頼度低）

---

## Pass 1 の最後（ここで停止）
必ず次を質問して停止する（この時点では変更ゼロ）：
「どれに適用しますか？ A / S / E / N / R」
- A) 全部（ただし方針Dは除外してWARNING）
- S) 指定（例：C1,C3,C8）
- E) 除外（例：全適用だがC2,C5は除外）
- N) 何もしない
- R) 再抽出（基準を少し変えて再提示）

---

# Pass 2：承認された候補だけ編集（Aタグのみ mcv-trigger）
ユーザーが A/S/E を返したら、その対象だけ編集する。

---

## 2-1 既存の <a> / <Link>（a相当）に `mcv-trigger` を付与（必須）
- <a>（または next/link の <Link>）の class/className に `mcv-trigger` を追加
- 既に含まれている場合は何もしない
- 子要素には付けない（原則）

安全な className 追記ルール（壊さない優先）：
- className が文字列リテラル → 末尾に `mcv-trigger` を追加
- cn(...) / clsx(...) / classnames(...) → 引数に `"mcv-trigger"` を追加
- それ以外の複雑式 → 自動改変はしない。WARNINGに出してスキップ（手動対応対象）

Next.js Link の注意：
- <Link className="..."> 形式 → className に追記でOK
- <Link><a className="...">...</a></Link> 形式 → 内側の <a> に追記する
- どちらか一方のみ（重複付与しない）

---

## 2-2 Aタグが無いCTAは「Aタグを生成」してから付与（必須）
対象：<button> / role=button / div など（Pass1で方針Cになったもの）

方針（優先順）：
1) **URLが明確**（href相当が取れる）なら
   - 対象要素を **<a href="..."> に置換**（入れ子回避のため “wrap” は原則しない）
   - 既存の class/className を a に移す（見た目維持）
   - 既存の onClick がある場合は a に移す（必要なら e.preventDefault も移植）
2) **URLが不明**だがCTAとして計測したい場合（総数計測を優先）
   - a を生成し、href はユニークなハッシュにする：例 `href="#mcv-cta-C12"`
   - 既存の onClick を a に移す（ハッシュ遷移を避けるなら `e.preventDefault()` を入れる）
3) **type="submit" 等で挙動が壊れそう**な場合
   - 原則：WARNINGしてスキップ（ユーザー判断）
   - どうしてもAタグ化する場合のみ提案：
     - a の onClick で `closest('form')?.requestSubmit?.()` を呼ぶ等の代替案を提示
     - 自動変更は「提案→承認→実行」の順（勝手にやらない）

※入れ子クリック（aの中にbutton等）になりそうなら、WARNINGのみで自動修正しない。

---

## 2-3 子要素クリック漏れ対策：`pointer-events-none` を付与（必須）
目的：ユーザーが子要素（span/img/svg等）を押しても、クリックがAタグに落ちるようにする。

基本ルール：
- `a.mcv-trigger` 配下の「非インタラクティブ」要素に `pointer-events-none` を追加
  - 対象例：img / svg / span / div / p / strong / em / h1-h6 等
  - 背景オーバーレイ（absolute divなど）も対象
- 付与対象が既に `pointer-events-none` を含む場合は追加しない

---

## 2-4 【重要】クリック吸収対策（GTM取りこぼし防止・必須）
背景：
- 子要素が `onClick` 等で `stopPropagation()` している/疑似ボタンがクリック対象になる等で、
  GTMのクリックリスナーが拾えず「計測されない」事例がある。
- そのため、CTA内部では「最終的にAタグがクリック対象」になることを保証する。

### 2-4-1 高リスク要素の検知（必須）
`a.mcv-trigger` の子孫に以下がある場合は High とみなし、対策を必ず適用する：
- `<button>` / `<input>` / `<label>` / `<select>` / `<textarea>`
- `[role="button"]` / `tabIndex`（0以上） を持つ要素
- 子要素に `onClick` / `onMouseDown` / `onPointerDown` / `onTouchStart` が存在
  - 特にハンドラ内に `stopPropagation` / `preventDefault` が含まれる場合

### 2-4-2 原則対応（レイアウトを崩さず吸収を防ぐ）
- CTA内部の「疑似ボタン・クリック吸収し得る子要素」は、**クリック不能にしてAに落とす**
  - 対象：上記の高リスク要素のうち、CTAの見た目のために入っていると判断できるもの
  - 実装：
    - class/className に `pointer-events-none` を追加（見た目はそのまま）
    - 可能なら `tabIndex=-1`（JSXなら `tabIndex={-1}`）も追加してフォーカス吸収を避ける
    - 可能なら `aria-hidden="true"` を追加（ボタンが二重に読まれないように）
- これにより、クリックは親aに落ち、GTMの取りこぼしを防ぐ

### 2-4-3 子要素ハンドラが stopPropagation している場合（必須）
- 子要素のイベント内に `stopPropagation()` がある場合、GTMが拾えない可能性が高い。
- 次の順で対応する：
  1) 子要素が「装飾目的」なら：
     - `pointer-events-none (+tabIndex=-1)` を付け、子の onClick が実行されない状態にする
     - 必要なら子の onClick を削除（ただし挙動が変わりそうなら WARNING）
  2) 子要素の onClick が「ナビゲーション目的（router.push/location.href/リンク遷移）」なら：
     - **そのロジックを親aへ移す**（MOVE）
     - 子側は `pointer-events-none (+tabIndex=-1)` にして吸収を止める
     - `stopPropagation` は削除（親へ移した時点で不要）
  3) 子要素の onClick が「モーダル/フォーム送信など別挙動」で、親aと衝突しそうなら：
     - 自動修正しない（WARN）
     - Pass2ログに「このCTAは計測漏れの可能性あり」と明記し、手動方針を提案する

### 2-4-4 入れ子aがある場合（取りこぼし回避）
- `a.mcv-trigger` の内部に別の `<a>` がある場合、
  クリックは内側aが優先され、外側aのクラス条件では拾えないことがある。
- 対応：
  - 内側aも「CTA候補」として扱い、必要なら内側aにも `mcv-trigger` を付与する（SPLIT）
  - ただし二重カウントにならないよう、同一クリックでイベントが2回飛ぶ構造（JS発火等）がある場合は WARNING

---

# 実行後ログ（必須）
Pass 2 実行後に必ず出す：
- 変更したファイル一覧
- 追加した `mcv-trigger` の総数（Aタグのみ）
- 生成/置換した Aタグの総数（内訳：URL明確置換 / #mcv-cta- 生成）
- 追加した `pointer-events-none` の総数
- `tabIndex=-1` / `aria-hidden` を追加した件数（クリック吸収対策）
- クリック吸収リスク High だったものの対応結果（PE / PE+TAB / MOVE / SPLIT / WARN）
- WARNING一覧（要手動対応の理由付き）
- Pass1の「人間用 位置の説明」一覧（最終版）を再掲（確認用）

---

# GTM設定（推奨：リンククリックで検知）
【推奨：名称も固定】
- Trigger name: TR - CTA Link Click (mcv-trigger)
- Tag name: TAG - GA4 Event - cta_click

1) GTM → 変数 → 組み込み変数
   - Click Classes, Click URL, Click Text を ON（Textは任意）

2) GTM → トリガー → 新規 → クリック → Just Links → Some Link Clicks
   - 条件①：Click Classes contains `mcv-trigger`
   - （任意）条件②：Click URL contains `#mcv-cta-`（URL不明CTAだけに絞る）
   - （任意）条件③：Click URL contains `/contact` など（特定導線だけ見たい時）

※クリック吸収が疑われるプロジェクトでは、
  上の 2-4（クリック吸収対策）を適用することで Just Links で拾える状態を作る。

3) GTM → タグ → 新規（例：GA4 Event）
   - Event name：`cta_click`
   - Trigger：上記トリガー

※遷移で取りこぼす場合は、トリガー側で「Wait for Tags（例: 2000ms）」も検討

---

# 最後に（必須の振る舞い）
- Pass 1 のみ実行→一覧提示→質問→停止
- 承認後に Pass 2 実行→ログ出力→GTM設定を再掲して終了