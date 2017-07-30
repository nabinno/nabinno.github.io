---
layout: post
title: "連載 LYSE本を読む 18"
category: F
tags: erlang,finite-state-machine
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

今回は有限ステートマシン (finite state machine)。ビヘイビア `gen_fsm` をとりあげる。このビヘイビアは `gen_server` に基本似た挙動をするが、呼び出しやメッセージ投入をあつかうのではなく同期や非同期のイベントをあつう。

## 18.1. 有限ステートマシン
- 状態遷移図 (state diagram) による記述
- シーケンス図による記述
- gen_fsm
    - init/1
        - Return
            - {ok, StateName, Data}
            - {ok, StateName, Data, Timeout}
            - {ok, StateName, Data, hibernate}
            - {stop, Reason}
    - StateName/2
        - 非同期イベント
        - Params
            - Event, StateData
        - Return
            - {next_state, NextStateName, NewData}
            - {next_state, NextStateName, NewData, Timeout}
            - {next_state, NextStateName, hibernate}
            - {stop, Reason, Data}
    - StateName/3
        - 同期イベント
        - Params
            - Event, From, StateData
        - Return
            - {reply, Reply, NextStateName, NewStateData}
            - {reply, Reply, NextStateName, NewStateData, Timeout}
            - {reply, Reply, NextStateName, NewStateData, hibernate}
            - {next_state, NextStateName, NewStateData}
            - {next_state, NextStateName, NewStateData, Timeout}
            - {next_state, NextStateName, NewStateData, hibernate}
            - {stop, Reason, Reply, NewStateData}
            - {stop, Reason, NewStateData}
    - handle_event/3
        - 非同期イベント、グローバルイベント
        - Params
            - Event, StateData
        - Return
            - {next_state, NextStateName, NewData}
            - {next_state, NextStateName, NewData, Timeout}
            - {next_state, NextStateName, hibernate}
            - {stop, Reason, Data}
    - handle_sync_event/4
        - 同期イベント、グローバルイベント
        - Params
            - Event, From, StateData
        - Return
            - {reply, Reply, NextStateName, NewStateData}
            - {reply, Reply, NextStateName, NewStateData, Timeout}
            - {reply, Reply, NextStateName, NewStateData, hibernate}
            - {next_state, NextStateName, NewStateData}
            - {next_state, NextStateName, NewStateData, Timeout}
            - {next_state, NextStateName, NewStateData, hibernate}
            - {stop, Reason, Reply, NewStateData}
            - {stop, Reason, NewStateData}
    - code_change/4
        - Params
            - OldVersion, StateName, Data, Extra
        - Return
            - {ok, NextStateName, NewStateData}
    - terminate/3
        - init/1 と逆の挙動をする
- イベント送信関数
    - ローカル
        - send_event/2
        - sync_send_event/2-3
    - グローバル
        - send_all_state_event/2-3
        - sync_send_event/2-3

## 18.2. ユーザー同士の取引システム例

-

以上 :construction_worker:
