---
layout: post
title: "連載 LYSE本を読む 4-5"
category: F
tags: erlang,elixir
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

4-5章からIDEがないとreplなどに時間がとられるので整備しておこう。Emacsなら[erlang.el](http://erlang.org/doc/man/erlang.el.html)がある。インデント、フィルコメント、コメントアウト、OTPなどのscafold、Eshell、コンパイル等ひととおりそろっている。


## 5.5. 関数呼び出しによるパターンマッチガードはcase文よりも優れているのか？

まず、パフォーマンス上かわらない。

つぎに、引数が複数あるときは関数をつかう。

```erlang
beach(Temperature) ->
    case Temperature of
        {celsius, N} when N > 20 andalso N =< 45 ->
            'favorable';
        {kelvin, N} when N >= 293 andalso N =< 318 ->
            'scientifically favorable';
        {fahrenheit, N} when N >= 68 andalso N =< 113 ->
            'favorable in the US';
        _ ->
            'avoid beach'
    end.
```

上記のようだと可読性がさがる、冗長的。以下のように関数でまとめる。

```erlang
beachf({celsius, N}) when N >= 20 andalso N =< 45 ->
    'favorable';
beachf({kelvin, N}) when N >=293 andalso N =< 318 ->
    'scientifically favorable';
beachf({fahrenheit, N}) when N >= 68 andalso N =< 113 ->
    'favorable in the US';
beachf(_) ->
    'avoid beach'.
```

ただし、引数が評価関数の対象の場合はcase文が向いている。

```erlang
prepend(X, []) ->
    [X];
prepend(X, Set) ->
    case lists:member(X, Set) of
        true  -> Set;
        false -> [X | Set]
    end.
```

-

以上 :construction_worker:
