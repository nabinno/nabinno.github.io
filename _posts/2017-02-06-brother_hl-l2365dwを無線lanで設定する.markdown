---
layout: post
title: "Brother HL-L2365DWを無線LANで設定する"
category: F
tags:
cover: false
cover-image:
---

# PROBLEM

- Amazonのモノクロレーザープリンター売れ筋1位の[Brother HL-L2365DW](https://www.amazon.co.jp/gp/product/B00NSFP1FS)を購入したが、日本語のセットアップソフトだと設定方法がUSBあるいは有線LANしかない
- 当該製品にはプリンター用USBは同梱されていない
- 有線LANは手元にあるが、複数台設定するのはめんどう
- ちなみにOSの基本言語を英語（US）にした状態で日本語のBrother Utilitiesをインストールすると文字化けする

-

# SOLUTION

というわけで、[英語（US）のセットアップソフト](http://support.brother.com/g/b/downloadtop.aspx?c=us&lang=en&prod=hll2360dw_us)をつかったら、無線LANからセットアップできた上、Brother Utilitiesの文字化けも解消した。

## 手順

1. HL-L2360DWのセットアップソフトをダウンロード
2. セットアップソフトを起動
3. 言語をEnglish
4. Connection TypeをWireless Network Connectionに選択
5. このあとはデフォルトのままで選択していく
10. しばらくすると、Wireless SetupウィザードになるのでAOSSなどプリンタ
    本機とルーターをつなげる（すでにされている場合はウィザードは出てこ
    ない）
11. （成功すると）Brother machine you want to installリストに当該機器
    が表示されるので選択
12. あとはデフォルトのまま選択クリックして終了

-

以上
