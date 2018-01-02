---
layout: post
title: "連載 LYSE本を読む 32 Mnesia"
category: F
tags: erlang, elixir
cover: false
cover-image:
---

# PROBLEM
- Elixirをさわりはじめてしばらく経つけどふかく理解した気になれない
- Phoenixやほかのフレームワークに頼られないケースが出てきたとき自由な発想ができるようになっておきたい
- 巷でいわれているSLA 99.9999999% などの実際がどうなのか腹落ちしてない

-

# SOLUTION
というわけで、LYSE本を読むことにした。Elixirに関係ありそうな箇所を選定している。

- 今回はCPシステムでNoSQLデータベース「Mnesia」についてかんがえる。

## Mnesiaの特徴
- Pros
    - CPシステム（NoSQL）
        - トランザクション機能 (ACID)
        - ネットワーク分断につよい
            - ただし、10ノード前後が実用上の限界と考えられている
- Cons
    - 各テーブルにつき2Gの容量制限
        - Table Frangmentation機能で回避可能
    - 厳密なシステム要求に応答することはむずかしい
    - 数テラバイトの大きなデータをあつかうのに向いていない
    - 組込型制限がない

**適切なユースケース**
- 下記条件をみたした場合
    - ノード数、データ量双方を見積もることが可能
    - ETS/DETS（タプル）形式でアクセス可能

**テーブルオプション**
- 保存方法
    - `ram_copies` - データをETS（メモリ）にのみ保存、32ビットマシンで4Gの容量制限
    - `disc_only_copies` - データをDETSにのみ保存、2Gの容量制限
    - `disc_copies` - データをETSとDETS双方に保存、DETSの2G容量制限はない、通常はこちらはつかう
- テーブル種類
    - `set`
    - `bag`
    - `ordered_set`

**CLI**
- `erl -name LongName -mnesia dir path/to/db` - `dir` 変数でスキーマ保存場所を指定

**関数**
- `mnesia`
    - `create_schema(ListOfNodes)`
    - `create_table(TableName, Option)`
        - オプション
            - `{attributes, List}` - テーブルのカラム名
            - `{disc_copies, NodeList}` `{disc_only_copies, NodeList}` `{ram_copies, NodeList}` - テーブルの保存場所
            - `{index, ListOfIntegers}` - インデックスをはる
            - `{record_name, Atom}` - テーブルの別名（非推奨）
            - `{type, Type}` - テーブル種類 (`set`, `ordered_set`, `bag`)
            - `{local_content, Boolean}` - デフォルト `false`。`true` にすると、多数のノード上に共有されない固有のローカルテーブルを作成する
    - `wait_for_tables` - テーブル読込完了まで待機
    - `activity(AccessContext, Fun[, Args])` - クエリの実行方法を指定
        - AccessContextの種類
            - `transaction` - 非同期トランザクション、トランザクションの完了を待つわけではないので正確ではない
            - `sync_transaction` - 同期トランザクション
            - `async_dirty` - 非同期のロックなし処理
            - `sync_dirty` - 同期のロックなし処理
            - `ets` - MnesiaをつかわずETSテーブルで処理
    - `write`
    - `delete`
    - `read`
    - `match_object`
    - `select`
- `application`
    - `set_env(mnesia, dir, "path/to/db")` - スキーマ保存場所を指定

**クエリリスト内包表記**
- `qlc`
    - `q(Fun, Generator)` - クエリハンドル
    - `eval(QueryHandle)` - 評価
    - `fold(Fun, Dict, QueryHandle)`

-

以上 :construction_worker::droplet:
