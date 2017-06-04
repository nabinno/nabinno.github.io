---
layout: post
title: "連載 LYSE本を読む 6-11"
category: f
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

- 6-11章はは標準文法
    - 型変換の関数が `erlang:<type>_to_<type>` という形式をとっているため、型が追加されるたびに変換用関数を `BIF (built-in function)` に追加しなければいけない。
    - ただ再帰や無名関数は普通、Ruby, JSっぽい
    - ...

## 7. 再帰
- `lists` モジュール
    - `sort/1`
    - `join/2`
    - `last/1`
    - `flatten/1`
    - `all/1`
    - `reverse/1`
    - `map/2`
    - `filter/2`
- `gb_tree` モジュール
    - `lookup/2`
    - `map/2`

## 8.2. 無名関数
```erlang
> (fun() -> a end)().
a
> lists:filter(fun(X) -> X rem 2 == 0 end, lists:seq(1, 10)).
[2,4,6,8,10]
```
