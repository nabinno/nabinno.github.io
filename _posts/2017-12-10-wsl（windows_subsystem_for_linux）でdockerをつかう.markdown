---
layout: post
title: "WSL（Windows Subsystem for Linux）でDockerをつかったWebアプリケーション開発をおこなう際の注意点"
category: F
tags: wsl, docker, ubuntu
cover: false
cover-image:
---

![](https://github.com/nabinno/nabinno.github.io/raw/master/_posts/images/171119_christmas-meiji-ya.jpg)
これは無宗教ななびの :construction_worker: が書く[Docker Advent Calendar 2017](https://qiita.com/advent-calendar/2017/docker)用記事です。前日はinductorさんの「[Docker Meetupの中身まとめ](https://mohikanz.kibe.la/shared/entries/c170117c-b876-49da-931a-9788a473164e)」でした :whale: （写真は[クリスマスを日本にひろめた明治屋](https://ja.wikipedia.org/wiki/%E3%82%AF%E3%83%AA%E3%82%B9%E3%83%9E%E3%82%B9#%E6%98%8E%E6%B2%BB%E6%99%82%E4%BB%A3) :christmas_tree:）

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

要は、WSLでDockerをつかったWebアプリケーション開発ができるかどうかという点に焦点をしぼります。

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
1. apt
    - WSLではデーモンがつかえないのでDockerクライアントを入れましょう、Dockerデーモンの詳細は後ほど言及します
2. [anyenv](https://github.com/riywo/anyenv)
    - プログラミング言語をバージョンごとにわけて使いたい場合はこちらをつかいましょう
    - exenvがビルドで失敗するためElixirインストールできないほかは、各言語問題なくビルドできます
3. [nix](https://nixos.org/nix/)
    - ElixirやHaskellのようにanyenvでインストールできない、あるいは、扱われいないパッケージはnixをつかいましょう
    - また、aptのバージョンが古すぎるパッケージもnixが最適です

### ConEmuのインストール
- [ConEmu - Handy Windows Terminal](https://conemu.github.io/)

WSL上で日本語を表示するため、また、WSLのLinux環境とWindows環境でターミナルをわけるため、ConEmuをつかいましょう。ConEmuをスマートにしたCmderはWSLとの相性がわるい[^1]のでおすすめしません。

[^1]: [https://github.com/cmderdev/cmder/issues/901](https://github.com/cmderdev/cmder/issues/901)

ConEmuの設定「Startup-Tasks」では、WSL用にパラメータ、コマンドを下記のように指定しています。WSLは `chsh` がつかえないのでログイン時につかいたいシェルを指定します。もし、 `screen` をつかいたい場合は `/run/screen` ディレクトリを作成してからコマンド指定します。

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

![](https://github.com/nabinno/nabinno.github.io/raw/master/_posts/images/171119_wsl-docker.png)

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
3. WSL上のdocker-composeはパスを絶対参照しかできません、相対参照できません[^2]
4. WSL上のnpm/yarnによるJSビルドをNTFS (drvfs)上でおこなうとエラーになります[^3]

[^2]: [https://github.com/docker/compose/issues/4039#issuecomment-269558432](https://github.com/docker/compose/issues/4039#issuecomment-269558432)
[^3]: [https://github.com/Microsoft/WSL/issues/2448](https://github.com/Microsoft/WSL/issues/2448)

ひとつずつ解決方法を見ていきましょう。

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
    image: 561534604247952616898.dkr.ecr.amazonaws.com/test/app
    volumes:
      - ${PRJ_ROOT}/wizpra/survey:/var/www/app
```

### 4. WSL上のnpm/yarnによるJSビルドをNTFS (drvfs)上でおこなうとエラーになります
こちらはFall Creators Updateのデグレですが、更新プログラム (KB4051963) でこの問題が修正されました :tada:

もし更新プログラムが適用できない場合は、シンボリックリンクでNTFS上のnode_modulesディレクトリをWSLに移しましょう。

```bash
$ mkdir /home/foo/tmp/app-test-1/node_modules
$ ln -s /home/foo/tmp/app-test-1/node_modules /C/Dev/app-test-1/node_modules
```

-

# WRAPUP
まだ未検証な部分はのこっていますが、ひととおりmacOSとWindowsによるWebアプリケーション開発は共有できるところまできている、と言えそうです。

随時、気になる課題が出てきたら追記します。

そうそう、この記事はもちろんWSLをつかって書いてますよ。

```sh
$ uname -r
4.4.0-43-Microsoft
```

-

以上 :construction_worker: :santa:

-
