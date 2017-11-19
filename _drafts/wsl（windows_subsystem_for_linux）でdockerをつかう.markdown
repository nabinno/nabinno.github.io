---
layout: post
title: "WSL（Windows Subsystem for Linux）でDockerをつかう"
category: F
tags: wsl, docker, ubuntu
cover: false
cover-image:
---

<table><tr><td>当該記事はDocker Advent Calendar 2017用に準備したものです。</td></tr></table>

# TLDR


-

# PROBLEM
- macOSとWindowsでWebアプリケーション開発をする際に
    - 環境が異なって管理しづらい
        - それならDockerで
            - と思ったが、macOSはBashでWindowsはPowerShellなのか
                - せめてPowerShellではなくBash...
                    - となると、いまWindowsでLinux環境をつかうならWSLか
                        - ただ、実際どこまで開発ができるかわからんしなあ

-

# SOLUTION
というわけで、この記事ではmacOSとWindowsによるWebアプリケーション開発について、どこまで共有できるか書いていきます。

前提条件として、当該WebアプリケーションはmacOSというより、Bash/Ubuntu14.04~のLinux環境で動くことを想定しています。macOSはHFS+やAPFSのUnicode正規化以外はおおよそLinux環境に適応できているという判断によります。

## 対象環境
- Windows 10 Pro 1709 16299.64
    - Hyper-V 10.0.16299.15
    - Docker for Windows 17.09.0-ce-win33
    - Ubuntu 16.04 (Linux 4.4.0-43-Microsoft)
        - Docker Client 1.12.6

## Windowsの開発環境を構築する
まず、Windowsの開発環境の構築ですが、既知の情報をふまえつつTIPSを順次紹介します。

### WSLのインストール
- [Windows Subsystem for Linuxをインストールしてみよう！](https://qiita.com/Aruneko/items/c79810b0b015bebf30bb)

WSLのパッケージ管理は下記3つを押さえておけば問題ないでしょう。
- apt
    - WSLではデーモンがつかえないのでDockerクライアントを入れましょう、Dockerデーモンの詳細は後ほど言及します
- [anyenv](https://github.com/riywo/anyenv)
    - プログラミング言語をバージョンごとにわけて使いたい場合はこちらをつかいましょう
    - exenvがビルドで失敗するためElixirインストールできないほかは、各言語問題なくビルドできました
- [nix](https://nixos.org/nix/)
    - ElixirやHaskellのようにanyenvでインストールできない、あるいは、扱われいないパッケージはnixをつかいましょう
    - また、aptのバージョンが古すぎるパッケージもnixが最適です

### ConEmuのインストール
- [ConEmu - Handy Windows Terminal](https://conemu.github.io/)

WSL上で日本語を表示するため、また、WSLのLinux環境とWindows環境でターミナルをわけるため、ConEmuをつかいましょう。ConEmuをスマートにしたCmderはWSLとの相性がわるいのでおすすめしません。

ConEmuの「Startup-Tasks」では、WSL用にパラメータ、コマンドを下記のように設定しています。WSLは `chsh` がつかえないのでログイン時につかいたいシェルを指定します。もし、 `screen` をつかいたい場合は `/run/screen` ディレクトリを作成してからコマンド指定します。

```bash
# task parameters
/icon "C:\Program Files\WindowsApps\CanonicalGroupLimited.UbuntuonWindows_1604.2017.922.0_x64__79rhkp1fndgsc\images\icon.ico"

# task command
bash -c 'sudo mkdir /run/screen && sudo chmod 775 $_ && sudo chown root:utmp $_ && SHELL=/usr/bin/zsh screen' -new_console:d:%USERPROFILE%
```

### Docker for Windowsのインストール
- [Docker For Windows](https://www.docker.com/docker-windows)

WSLではDockerデーモンがつかえないのでNTFS (WSLからみるとdrvfs) 側で用意します。インストールはDockerのダウンロードページから手順通りおこないます。

構成は下記のようになります。

![](images/171119_wsl-docker.png)

DockerクライアントからDockerデーモンにつなぐには、セキュリティリスクはありますが、 `DOCKER_HOST` をつかうのが簡易的です。Docker for WindowsとDockerクライアント、各々設定します。
1. Docker for WindowsよりDockerデーモンを「Expose daemon on tcp://localhost:2375 without TLS」として設定
2. WSL上のDockerクライアントに `DOCKER_HOST=tcp://0.0.0.0:2375` を設定

WSLには下記のようなaliasを用意しておくといいでしょう。

```bash
export DOCKER_HOST=tcp://0.0.0.0:2375
alias docker="DOCKER_HOST=${DOCKER_HOST} docker"
alias docker-compose="docker-compose -H ${DOCKER_HOST}"
```

## さて、WSLからDocker for Windowsはどの程度つかえるのか
WSLがlxfs、Docker for WindowsがNTFS (drvfs) 上で動いていることからわかるように、ファイルシステム上の制約があります。具体的には下記4点です。

1. Docker for WindowsはNTFS (WSLからみるとdrvfs `/mnt/`) 上のファイルしかVolumeマウントできません
2. WSLはLinux形式のパスしか扱えません、`C:\Dev` のようなドライブ名にコロンをつけたURIスキーマは扱えません
3. WSL上のdocker-composeはパスを絶対参照しかできません、相対参照できません ([URL](https://github.com/docker/compose/issues/4039#issuecomment-269558432))
4. WSL上のnpm/yarnによるJSビルドをNTFS (drvfs)上でおこなうとエラーになります

ひとつずつ解決方法を見ていきましょう。

### 1. Docker for WindowsはNTFS (WSLからみるとdrvfs `/mnt/`) 上のファイルしかVolumeマウントできません
開発用のディレクトをNTFS上につくりましょう。

### 2. WSLはLinux形式のパスしか扱えません、ドライブ名にコロンをつけたURIスキーマは扱えません
NTFSからのパス参照とWSLからのパス参照を共通化するために、WSLに各ドライブのシンボリックリンクをはりましょう。

```bash
ln -s /mnt/c /C
```

### 3. WSL上のdocker-composeはパスを絶対参照しかできません、相対参照できません
各OS間での違いを吸収するため、プロジェクトに `PRJ_ROOT` のような環境変数を用意しましょう。

### 4. WSL上のnpm/yarnによるJSビルドをNTFS (drvfs)上でおこなうとエラーになります
TODO: 動作検証


## まとめ


-

以上 :construction_worker:
