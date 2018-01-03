---
layout: post
title: "連載 LYSE本を読む 33 Dialyzer"
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

- 今回は静的型チェッカーDialyzerについてかんがえる。

## Dialyzerの特徴
**CLI**
- PLT (Persistent Lookup Table 永続的探索表)
    - `dialyzer --build_plt --apps erts kernel stdlib mnesia sasl common_test eunit` - PLT作成
    - `dialyzer --add_to_plt --apps reltool` - PLT追加
- 型チェック
    - `dialyzer foo/src/bar.erl` - ファイルを解析
    - `dialyzer -r foo/src bar/src --src` - ディレクトリ指定してerlファイルを解析

**Erlangの型**
- シングルトン型 - それ自体が型を示すオブジェクト
    - `'some atom` - アトム
    - `42` - 整数
    - `[]` - 空リスト
    - `{}` - 空タプル
    - `<<>>` - 空バイナリ
- BIF型
    - `any()`
    - `none()`
    - `pid()`
    - `port()`
    - `reference()`
    - `atom()`
    - `atom()`
    - `binary()`
    - `<<_:Integer>>` - 特定サイズのバイナリ
    - `<<_:*Integer>>` - 特定のユニットサイズで長さは指定されていないバイナリ
    - `<<_:Integer, _:_*OtherInteger>>` - 上記2つの組み合わせ、バイナリの最小の長さを指定する形式
    - `integer()`
    - `N..M` - 整数の範囲
    - `non_neg_integer()`
    - `pos_integer()` - ゼロより大きい自然数
    - `neg_integer()` - 負の整数
    - `float()`
    - `fun()` - あらゆる種類の関数
    - `fun((...) -> Type)` - 引数のアリティが決まっていない、特定の肩を返す無名関数
    - `fun(() -> Type)`
    - `fun((Type1, Type2, ..., TypeN) -> Type)`
    - `[Type()]` - 特定の型を持つリスト
    - `[Type(), ...]` - 特定の型を持つリスト、またリストが空でないことを示す
    - `tuple()`
    - `{Type1, Type2, ..., TypeN}` - 全要素の型とサイズがわかっているタプル
- エイリアス型
    - `term()`
    - `boolean()` - `'true' | 'false'`
    - `byte()` - `0..255`
    - `char()` - `0..16#10ffff`
    - `number()` - `integer() | float()`
    - `maybe_improper_list()` - `maybe_improper_list(any(), any())`
    - `maybe_improper_list(T)` - `maybe_improper_list(T, any())`
    - `string()` - `[char()]`
    - `iolist()` - `maybe_improper_list(char() | binary() | iolist(), binary() | [])`
    - `module()` - `atom()`
    - `timeout()` - `non_neg_integer()`
    - `node()` - アトム
    - `no_return()` - `none()`

**判定できない例と対策**
```erlang
-module(cards).
-export([kind/1, main/0]).

-type suit() :: spades | clubs | hearts | diamonds.
-type value() :: 1..10 | j | q | k.
-type card() :: {suit(), value()}.

-spec kind(card()) -> 'face' | 'number'. % 注釈をくわえることでdialyzerに警告させる
kind({_, A}) when A >= 1, A =< 10 ->
    number;
kind(_) ->
    face.

main() ->
    number = kind({spades, 7}),
    face = kind({hearts, k}),
    number = kind({rubies, 4}), % タプルの中の型が違う
    face = kind({clubs, q}).
```

```erlang
-module(convert).
-export([main/0]).

%% 注釈をつけないとdialyzerは下記のように判定する
% -spec convert(list() | tuple()) -> list() | tuple().
- spec convert(tuple()) -> list();
              (list()) -> tuple().
main() ->
    [_, _] = convert({a, b}),
    {_, _} = convert([a, b]),
    [_, _] = convert([a, b]),
    {_, _} = convert({a, b}).

%% private
convert(Tup) when is_tuple(Tup) ->
    tuple_to_list(Tup);
convert(L=[_|_]) ->
    list_to_tuple(L).
```


-

以上 :construction_worker::droplet:
