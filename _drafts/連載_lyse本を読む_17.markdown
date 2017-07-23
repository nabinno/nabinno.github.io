---
layout: post
title: "連載 LYSE本を読む 17"
category: F
tags: erlang
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

今回はよくつかわれるビヘイビア `gen_server` 。
この汎用化によって、メンテナンス、コードの単純化、テストの簡易化へとつながる。
下記に `gen_server` のコールバックの概要を記す。

## 17. クライアントとサーバ
- gen_server
    - init/1
        - Return
          - {ok, State}
          - {ok, State, TimeOut}
          - {ok, State, hibernate}
          - {stop, Reason}
          - ignore
    - handle_call/3
        - Params
            - Request, From, State
        - Return
            - {reply, Reply, NewState}
            - {reply, Reply, NewState, Timeout}
            - {reply, Reply, NewState, hibernate}
            - {noreply, NewState}
            - {noreply, NewState, Timeout}
            - {noreply, NewState, hibernate}
            - {stop, Reason, Reply, NewState}
            - {stop, Reason, NewState}
    - handle_cast/2
        - Params
            - Message, State
        - Return
            - {noreply, NewState}
            - {noreply, NewState, Timeout}
            - {noreply, NewState, hibernate}
            - {stop, Reason, NewState}
    - handle_info/2
        - Callback case
            - bang operator (!)
            - TimeOut
            - モニター通知
            - 'EXIT' シグナル
        - Params
            - Message, State
        - Return
            - {noreply, NewState}
            - {noreply, NewState, Timeout}
            - {noreply, NewState, hibernate}
            - {stop, Reason, NewState}
    - terminate/2
        - Callback case
            - handle_* 関数の返値
                - {stop, Reason, NewState}
                - {stop, Reason, Reply, NewState}
            - 親が死んで、gen_serverが終了を補足していた場合
        - Params
            - Reason, State
        - Return
            - `init/1` の反対
            - VMがETS (erlang term storage) を削除
    - code_change/3
        - Params
            - PreviousVersion
                - {down, Version}
            - State
                - {ok, NewState}
            - Extra

-

以上 :construction_worker:
