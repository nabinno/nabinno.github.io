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

- 今回はシステムテストCommon Testについてかんがえる。システムテストとは結合テスト、Webテストのことを指す。Common Testではリモートノードを対象にした分散テスト、EUnitを取り込んだテスト、各プロトコル（SSH `ct_ssh`、Telnet `ct_telnet`、SNMP `ct_telnet`、FTP `ct_ftp`）を対象としたテストも可能。

## Common Testの特徴
**構成**
- `ct/` テストルート
    - `foo/` テストオブジェクトディレクトリ
        - `bar_SUITE_data/` テストデータディレクトリ
        - `bar_SUITE.erl` テストスイートファイル
            - テストグループ
                - テストケース
- `priv/` ログディレクトリ

**CLI**
- `ct_run FileName` - テストスイートを指定してテスト起動
- `ct_run -spec ct/spec.config` - スペックを指定してテスト起動

**関数**
- `ct:run_test/1` あるいは `ct_run:run_test/1` - テスト起動
    - プロパティ
        - `suite` - テストスイートを指定してテスト起動
        - `spec` - スペックを指定してテスト起動
- `init_per_testcase/2` - テストケースのsetup
- `end_per_testcase/2` - テストケースのteardown
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
- `init_per_group/2` - テストグループのsetup
- `end_per_group/2` - テストグループのteardown

**テストスペック**
- プロパティ
    - `{include, includeDirectories}`
    - `{logdir, LoggingDirectory}`
    - `{suites, Directory, Suites}`
    - `{skip_suites, Directory, Suites, Comment}`
    - `{groups, Directory, Suite, Groups}`
    - `{groups, Directory, Suite, Groups, {cases, Cases}}`
    - `{skip_groups, Directory, Suite, Groups, Comment}`
    - `{skip_groups, Directory, Suite, Groups, {cases, Cases}, Comment}`
    - `{cases, Directory, Suite, Cases}`
    - `{skip_cases, Directory, Suite, Cases, Comment}`
    - `{alias, Alias, Directory}`
    - `{node, NodeAlias, NodeName}` - 分散テストのためのエイリアス指定
    - `{init, NodeAlias, Options}` - 分散テストのためのノード起動用オプション
        - オプション種類
            - `{startup_functions, {M, F, A}}`
            - `{erl_flags, String}`
            - `{monitor_master, Boolean}`
            - `{kill_if_fail, Boolean}`
            - SSH
                - `{username, UserName}`
                - `{password, Password}`
            - リモートノード起動時の待ち時間
                - `{boot_timeout, Seconds}`
                - `{init_timeout, Seconds}`
                - `{startup_timeout, Seconds}`

**EUnitをCommon Testに統合する**
```erlang
run_eunit(_Config) ->
    ok = eunit:test(TestsToRun).
```

-

以上 :construction_worker: :droplet:
