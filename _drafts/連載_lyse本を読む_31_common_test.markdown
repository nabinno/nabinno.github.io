---
layout: post
title: "連載 LYSE本を読む 31 Common Test"
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

- 今回はシステムテストCommon Testについてかんがえる。システムテストとは結合テスト、Webテストとも言う。

## Common Testの特徴
**構成**
- `ct/` テストルート
    - `foo/` テストオブジェクトディレクトリ
        - `bar_SUITE_data/` テストデータディレクトリ
        - `bar_SUITE.erl` テストスイート、このファイルに個別のテストケースを書く
- `priv/` ログディレクトリ

**コマンド・関数**
- コマンド
    - `ct_run` - テスト起動
- 関数
    - `init_per_testcase/2` - setup
    - `end_per_testcase/2` - teardown
    - `ct:pal/1-2` - テストのデバッグ用出力
    - `groups/1`
        - プロパティオプション
            - 空リスト（オプションなし） - テストケースを順番に実行、失敗した場合は残りを実行
            - `shuffle` - テストケースを順不同に実行
            - `parallel` - テストケースを並列で実行
            - `sequence` - テストケースを順番に実行、失敗した場合は残りをとばす
            - `{repeat, Number}` - グループを指定した回数実行
            - `{repeat_until_any_fail, Number}` - どれか失敗するまで、あるいは指定した回数実行
            - `{repeat_until_all_fail, Number}` - すべて失敗するまで、あるいは指定した回数実行
            - `{repeat_until_any_succeed, Number}` - どれか成功するまで、あるいは指定した回数実行
            - `{repeat_until_all_succeed, Number}` - すべて成功するまで、あるいは指定した回数実行



-

以上 :construction_worker: :droplet:
