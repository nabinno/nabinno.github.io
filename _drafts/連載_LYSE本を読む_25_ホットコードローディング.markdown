---
layout: post
title: "連載 LYSE本を読む 25 ホットコードローディング"
category: F
tags: erlang, elixir
cover: false
cover-image:
---

# PROBLEM
- Elixirをさわりはじめてしばらく経つけどふかく理解した気になれない
- Phoenixやほかのフレームワークに頼られないケースが出てきたとき自由な発想ができるようになっておきたい
- 巷でいわれているSLA 99.999999% などの実際がどうなのか腹落ちしてない

-

# SOLUTION
というわけで、LYSE本を読むことにした。Elixirに関係ありそうな箇所を選定している。

- 今回はホットコードローディング（更新）についてかんがえる。
- ホットコードローディングはホットスワップの1種でElixir/Erlangの信頼性につながっている。
- ホットコードローディングは `systools` により複数の `appup` から `relup` として構成されている。

## リリースの更新
バージョンがあがるほどリリースの更新は煩雑になっていく。

- OTPアプリケーションを書く (ver. 1.0.0)
    - それらをリリースにする
- 1つ以上のOTPアプリケーションのバージョンを更新する (ver. 1.1.0)
    - そのアプリケーションの古いバージョンから新しいバージョンへの遷移を行うために、何を変更すべきかを説明した `appup` ファイルを作成する
- 新しいアプリケーションで新しいリリースを作る (ver. 1.2.0)
    - `appup` ファイルをこれらのリリースから生成する
    - 新しいアプリケーションを稼働しているErlangシェルにインストールする

リリース作業として以下の通り。`relup` 構成ツールとして、Erlangは `relx` 、Elixirは `distillery` がある。

- 巻き戻しできるようアップグレードとダウングレード双方を `appup` ファイルに記述
- モジュールによるリリース構成を `config` ファイルに記述
- `systools:make_relup` で `relup` を作成
- `release_hanlder` によって更新

```erlang:appup
%% {NewVersion,
%%  [{VersionUpgradingFrom, [Instructions]}]
%%  [{VersionDownGradingTo, [Instructions]}]}.
{"1.1.0",
 [{"1.0.0", [{add_module, pq_quest},
             {load_module, pq_enemy},
             {load_module, pq_events},
             {update, pq_player, {advanced, []}, [pq_quest, pq_events]}]}],
 [{"1.0.0", [{update, pq_player, {advanced, []}},
             {delete_module, pq_quest},
             {load_module, pq_enemy},
             {load_module, pq_events}]}]}.
{"1.0.1",
 [{"1.0.0", [{load_module, sockserv_serv}]}],
 [{"1.0.0", [{load_module, sockserv_serv}]}]}.
```

-

以上 :construction_worker:
