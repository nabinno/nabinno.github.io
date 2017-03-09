---
layout: post
title: "Network AdapterがWi-FiのVMとVisual Stduio Emulator for AndroidのVMを同時に使用する"
category: F
tags: android,smartphone,visual-studio-emulator-for-android,surface-book,android-emulator
cover: false
cover-image:
---

# PROBLEM

- 普段の開発環境CentOS/Hyper-Vを変更することなく、Xamarinをつかいたい。
  - CentOS/Hyper-V上にAPIサーバーをたてて、XamarinアプリからAPIをたたく構成。
- VirtualBoxなどホスト型HypervisorだとVMがよくクラッシュしてつらい。
- Android EmulatorはIntel HAXM＋ホスト型Hypervisor前提のものが多い。

# SOLUTION
というわけで、Hyper-Vでイメージ管理するVisual Studio Emulator for Android（VS Emulator）をつかうことにした。

**注意点**

- VS EmulatorはHyper-VのNetwork AdapterをEthernet（有線LAN）しか使用できない。Wi-Fi（無線LAN）は使用できない。
- VS Emulatorの各デバイスを初回起動させる際に、有線LANと無線LAN双方からネットワークにつなげていると失敗する。

##
Network AdapterがWi-FiのVMとVisual Stduio Emulator for AndroidのVMを同時に使用する
