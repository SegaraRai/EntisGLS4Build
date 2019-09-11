# EntisGLS4Build

[EntisGLS4](https://www.entis.jp/gls/)を最新のVisual Studio 2019でビルドするためのパッチ、ツール、プロジェクトファイル等を置いた非公式なリポジトリです。  

## オリジナルとの違い

個人的に都合が良い様にビルド方法をカスタマイズしているため、いくつか様式がオリジナルとは異なります。  
基本的にはEntisGLS4をフレームワークというよりライブラリとして用いる方向で作成しています。  

以下はオリジナルとの違いです。  

- 出力されるライブラリファイル名が異なる
  - よってlinkgls.hは使用できません
- MFCを用いるビルドは作成していない
  - 確認はしていませんがMFCを用いるものもビルドできるかもしれません
- 常に`DISABLE_ENTIS_GLS4_EXPORTS`を定義している
  - 適宜変更可能です
- sakuragl_startup_win.cppもsakuragl_startup_con.cppも含めていないため、ライブラリを使用するプロジェクト側にそれらを含めるか、自分で`main`関数を記述する必要がある

組み込み方の章も参照してください。  

## ビルド手順

WindowsとVisual Studio 2019での動作を前提としています。  
（それ以外でもビルドできる可能性はあります。）  

### 1. このリポジトリをクローンする

改行コードはLFで（gitconfigにて`core.autocrlf=input`にして）クローンしてください。  

### 2. EntisGLS4のソースを配置する

1. [EntisGLS site](https://www.entis.jp/gls/)からEntisGLS ver.4s.05（gls4s.05.2015.04.18.zip）をダウンロードし
2. リポジトリの直下にgls4s.05.2015.04.18ディレクトリを作成して
3. そのディレクトリ以下に（gls4s.05.2015.04.18/readme.txtが存在するように）展開してください

### 3. EntisGLS4にパッチを適用する

リポジトリのルートで以下のコマンドを実行し、EntisGLS4にパッチを適用してください。  

```text
git apply --ignore-whitespace --directory=gls4s.05.2015.04.18 gls4s.05.2015.04.18.patch
```

### 4. ビルドする

Visual Studio 2019でEntisGLS4.slnを開いてビルドします。  

EntisGLS4_woはx86とx64、EntisGLS4_woeはx86のみ対応しています。  

## 組み込み方

使用するプロジェクトにて行う必要がある設定は以下の通りです。  

- EntisGLS4_wo.libまたはEntisGLS4_woe.libのリンク
- include_wo（EntisGLS4_woの場合）またはinclude_woe（EntisGLS4_woeの場合）へのインクルードパスの追加
- ライブラリとプロジェクトでランタイムライブラリを合わせる
  - デフォルトではライブラリは`/MT`（Releaseの場合）と`/MTd`（Debugの場合）ですが、ライブラリの方を変更することも可能です
- `main`関数の記述、またはsakuragl_startup_win.cppないしsakuragl_startup_con.cppをプロジェクトに含める
  - ライブラリにはいずれも含めていないため
  - 自前でmain関数を記述する場合はsakuragl_startup_win.cppやsakuragl_startup_con.cppが参考になります
- Releaseビルドを用いる場合、プリプロセッサマクロに`NDEBUG`を定義する
  - ライブラリの方を変更することも可能です
- EntisGLS4_woeを用いる場合、`/permissive`（準拠モードの無効化）の設定
  - EntisGLS3のヘッダファイルに非準拠の記述が含まれるため
- 文字セットをマルチバイト文字セットを使用するに設定する（リンクエラーが生じる場合）

なお、使用するプロジェクトのソリューションにEntisGLS4_wo.vcxprojやEntisGLS4_woe.vcxprojを追加して依存関係を設定しておくと可搬性が高まります。  

## ライセンス

本リポジトリ内の私に著作権が帰属するものについては[CC0](https://creativecommons.org/publicdomain/zero/1.0/deed.ja)または[Unlicense](https://unlicense.org/)が適用されるものとします。  
利用者はいずれか好きな方のライセンスを選択できます。  

To the extent possible under law, SegaraRai has waived all copyright and related or neighboring rights to EntisGLS4Build. This work is published from: 日本.  

EntisGLS4については、[そのライセンス](https://www.entis.jp/gls/license.txt)が適用されます。  
