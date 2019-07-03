---
layout: post
title: "WSL2のDocker開発スタイル"
category: F
tags: wsl, ubuntu
cover: false
cover-image:
---

# PROBLEM
- あたらしくでたWSL2が[以前書いた記事](https://nabinno.github.io/f/2017/12/10/wsl-windows_subsystem_for_linux-でdockerをつかう.html)からだいぶ状況が変わった
    - 主な変更点
	    - WSLのアーキテクチャが2種類になり、WSLはその2つのアーキテクチャを管理する機能に変わった
            - WSL1 Windows Subsystem for Linux上のLinux (LXCore/Lxss)
            - WSL2 軽量Hyper-V上のLinux (Linux Kernel)
        - /procや/sysなどの特殊ファイルもふくめた共有プロトコル「9P」が実装された
            - Win32側の9Pクライアント `9prdr.sys`
    	    - WSL側の9Pクライアント `/init`

-

# SOLUTION
というわけで、前記事で掲げていた目標「WSLでDockerをつかったWebアプリケーション開発ができるかどうか」について再確認します。

## 対象環境
- Windows 10 Pro Version 1903 OS Build 18922.1000
    - Windows Terminal (Preview) Version 0.2.1715.0
    - WSL2
	    - Ubuntu Version 1804.2019.5210 (Linux 4.19.43-microsoft-standard)
        - Docker version 19.03.0-rc3, build 27fcb77
    - WSL1
	    - Ubuntu 18.04 LTS Version 1804.2019.522.0 (Linux 4.4.0-18922-Microsoft)

## Windowsの開発環境を構築する
まず、Windowsの開発環境の構築ですが、既知の情報をふまえつつTIPSを順次紹介します。

### WSLのインストール
- [WSL2を使ってみる (InsiderPreview)](https://qiita.com/namoshika/items/53a9ac2df7eace656870)

WSLのパッケージ管理は下記2つを押さえておけば問題ないでしょう。
1. [asdf](https://github.com/asdf-vm/asdf)/[anyenv](https://github.com/riywo/anyenv)
    - プログラミング言語をバージョンごとにわけて使いたい場合はこちらをつかいましょう
    - 関数言語界隈ではasdfが主流になってきてるようです。
2. [nix](https://nixos.org/nix/)
    - Haskellのようにasdf/anyenvでインストールできない、あるいは、扱われいないパッケージはnixをつかいましょう
    - また、aptのバージョンが古すぎるパッケージもnixが最適です

### ターミナルのインストール
WSLttyはWSL2に対応しておらずConEmuは描画がくずれやすいため、デフォルトのターミナルか、[Windows Terminal](https://www.microsoft.com/en-us/p/windows-terminal-preview/9n0dx20hk701?WT.mc_id=-blog-scottha&wa=wsignin1.0&activetab=pivot:overviewtab)が選択肢となります。

**Windows TerminalとConEmuとの比較**

| -                | Windows Terminal    | ConEmu         |
| ---              | ---                 | ---            |
| 透過対象         | backgroundImage     | ConEmu自体     |
| キーバインド制約 | Alt+Shiftが効かない | 特になし       |
| WSL2の描画       | 特になし            | くずれる       |
| 管理者権限で実行 | 初回のみ            | タスク実行ごと |


### Dockerのインストール
WSL1ではDockerデーモンがつかえないのでWSL2でつかうようにしましょう。

// TODO

どうしてもWSL1でということであれば、Win32 (WSL1からみるとdrvfs) 側で[Docker For Windows](https://www.docker.com/docker-windows)を用意します。インストールはDockerのダウンロードページから手順通りおこないます。
構成等は[前回の記事](https://nabinno.github.io/f/2017/12/10/wsl-windows_subsystem_for_linux-でdockerをつかう.html#docker-for-windowsのインストール)を参照ください。

## さて、WSL2からDockerはどの程度つかえるのか


    - 抱えている課題
        - パフォーマンス
            - WSL
            - WSL -> Win32
            - Win32
            - Win32 -> WSL
        - デバイスへのアクセス
        - 
        - 

WSL2は軽量Hyper-V上にLinuxコンテナを動かしているので、基本Hyper-Vと同様にDockerをつかうことができます。

ただし、WSL1と違いlocalhostにIPアドレスがバインドされていません // TODO: 書き直す

また、WSL1同様にWin32<->WSL間でのファイルの読み書きにパフォーマンスの差が大きく出ています。


ひとつずつ解決方法を見ていきましょう。


### 1. WSL1と違いlocalhostにIPアドレスがバインドされていません // TODO: 書き直す

### 2. WSL1同様にWin32<->WSL間でのファイルの読み書きにパフォーマンスの差が大きく出ています


// 4. WSL上のnpm/yarnによるJSビルドをNTFS (drvfs)上でおこなうとエラーになります => 解決


### 1. Docker for WindowsはNTFS (WSLからみるとdrvfs `/mnt/`) 上のファイルしかVolumeマウントできません
開発用ディレクトリをNTFS上につくりましょう。普段からWindowsで開発されている方はCドライブ直下につくっているとおもいます。

### 2. WSLはLinux形式のパスしか扱えません、ドライブ名にコロンをつけたURIスキーマは扱えません
NTFSからのパス参照とWSLからのパス参照を共通化するために、WSLに各ドライブのシンボリックリンクをはりましょう。

```bash
$ ln -s /mnt/c /C

# 開発ディレクトリはこんな感じで参照できます
$ ls -al /C/Dev
total 0
drwxrwxrwx 0 root root 512 Oct 27 00:54 .
drwxrwxrwx 0 root root 512 Dec  8 07:49 ..
drwxrwxrwx 0 root root 512 Jul 14 03:06 app-test-1
drwxrwxrwx 0 root root 512 Oct 25 00:38 app-test-2
```

### 3. WSL上のdocker-composeはパスを絶対参照しかできません、相対参照できません
各OS間での違いを吸収するため、プロジェクトに `PRJ_ROOT` のような環境変数を用意しましょう。

```yaml
services:
  app-front:
    image: 561534604247952616898.dkr.ecr.amazonaws.com/test/front
    volumes:
      - ${PRJ_ROOT}/front:/var/www/front
```

### 4. WSL上のnpm/yarnによるJSビルドをNTFS (drvfs)上でおこなうとエラーになります
こちらはFall Creators Updateのデグレですが、更新プログラム (KB4051963) でこの問題が修正されました :tada:

もし更新プログラムが適用できない場合は、シンボリックリンクでNTFS上のnode_modulesディレクトリをWSLに移しましょう。

```bash
$ mkdir /home/foo/tmp/app-test-1/front/node_modules
$ ln -s /home/foo/tmp/app-test-1/front/node_modules /C/Dev/app-test-1/front/node_modules
```

-

# WRAPUP
まだ未検証な部分はのこっていますが、ひととおりmacOSとWindowsによるWebアプリケーション開発は共有できるところまできている、と言えそうです。

随時、気になる課題が出てきたら追記します。

-

以上 :santa:

-
