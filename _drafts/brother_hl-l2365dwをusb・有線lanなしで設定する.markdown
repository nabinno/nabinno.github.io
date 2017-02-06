---
layout: post
title: "Brother HL-L2365DWを無線LANで設定する"
category: personal
tags:
cover: false
cover-image:
---

# PROBLEM

- モノクロレーザープリンター売れ筋1位のBrother HL-L2365DWを購入したが、日本語のセットアップソフトだと設定方法がUSBあるいは有線LANしかない
- 当該製品にはプリンター用USBは同梱されていない
- 有線LANは手元にあるが、複数台設定するのはめんどう
- ちなみにOSの基本言語を英語（US）にした状態で日本語セットアップソフトでBrother Utilitiesインストールすると文字化けする

...

# SOLUTION

というわけで、
[英語（US）のセットアップソフト](http://support.brother.com/g/b/downloadtop.aspx?c=us&lang=en&prod=hll2360dw_us)
をつかったら、無線LANからセットアップできた。

## 手順

1. HL-L2360DWのセットアップソフトをダウンロード
2. セットアップソフトを起動
3. 言語をEnglish
4. Connection TypeをWireless Network Connectionに選択
5. このあとはデフォルトのままで選択していく
10. しばらくすると、Wireless SetupウィザードになるのでAOSSなどプリンタ本機とルーターをつなげる（すでにされている場合はウィザードは出てこない）
11. （成功すると）Brother machine you want to installリストに当該機器が表示されるので選択
12. あとはデフォルトのまま選択クリックして終了
