---
layout: post
title: "Hyper-VモードでLinux OSとAndroid OSを同時使用する"
category: F
tags: android,smartphone,visual-studio-emulator-for-android,surface-book,android-emulator
cover: false
cover-image:
---

# PROBLEM

- 普段の開発環境CentOS/Hyper-Vを変更することなく、Xamarinをつかいたい。
  - CentOS/Hyper-V上にAPIサーバーをたてて、XamarinアプリからAPIをたたく構成。
- Android EmulatorはIntel HAXM＋ホスト型Hypervisor前提のものが多い。
  - VirtualBoxなどホスト型HypervisorだとVMがよくクラッシュしてつらい。
    - なので、APIサーバーはHyper-Vでたてている。
    - また、オフィス移動が多いのでネットワーク環境はおもにWi-Fi（無線LAN）を使用している。

# SOLUTION
というわけで、Hyper-Vでイメージ管理するVisual Studio Emulator for Android（VS Emulator）をつかうことにした。

**注意点**

- VS EmulatorはHyper-VのNetwork AdapterをEthernet（有線LAN）しか使用できない。Wi-Fi（無線LAN）は使用できない。
- VS Emulatorの各デバイス(Android VM）を初回起動させる際に、有線LANと無線LAN双方からネットワークにつなげていると失敗する。

## Hyper-VモードでLinux OS（VM）とAndroid OS（VM）を同時使用する方法

1. 現在稼働しているLinux VMを停止する。 `Stop-VM CentOS`
2. 無線LANの接続を停止し、有線LANのみの接続にする。 `Disable-NetAdapter Wi-Fi`
3. VS EmulatorからAndroid VMを初回起動する。そうすると有線LAN用のvEthernetが作成される。
4. 無線LAN、有線LAN、双方を接続する。 `Enable-NetAdapter Wi-Fi`
5. Linux VMを起動する。 `Start-VM CentOS`

-

以上:construction_worker:
