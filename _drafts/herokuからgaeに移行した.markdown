---
layout: post
title: "RailsアプリをHerokuからGAEに移行した"
category: google-app-engine
tags: heroku,google-app-engine
cover: false
cover-image:
---

GAEがRubyと東京リージョンをサポートしたので、
[Utagaki](https://utagaki.com)をHerokuから移行した。料金的にはSSL適用
分で若干高くなった。パフォーマンスはリージョンが近くなったので満足してる。

*やったこと*
- PostgreSQLをAWSからGCPへ移行
- Redis Cloudを東京リージョンに変更
- GAEにRuby用のインスタンスを作成
- GAEへのデプロイCIを作成
- ドメインの向き先を変更（SSLも含む）
- その他

# PostgreSQLをAWSからGCPへ移行

まずはダンプしてローカルで確認。

``` shell
heroku pg:backups:download -o ~/db/foo.dump_
pg_restore -U postgres -d bar -c ~/db/foo.dump
```

つぎに、GCPでPostgreSQL用インスタンスを作成。
[Cloud Launcher](https://cloud.google.com/launcher/)よりBitnami
PostgreSQLをえらぶのが手っ取り早い。スペックは最低限のものにした。
- asia-northeast1-b
- f1-micro
- SSD

外部IPを与えるのはどうかと思ったのだが、暫定適用。
[ユーザ作成](https://www.postgresql.org/docs/8.0/static/sql-createuser.html)
は好みで。

最後に、リストア。

``` shell
rake db:create db:migrate --trace RAILS_ENV=production DATABASE_URL=postgres://postgres:JEuZ4jUp104.198.88.109:5432/utagaki_production
pg_restore -h 104.198.88.109 -U postgres -d utagaki_production -c ~/db/utagaki_production.dump
```

# Redis Cloudを東京リージョンに変更
`asia-northeast`リージョンを選ぶ。

# GAEにRuby用のインスタンスを作成
まずは、プロジェクトを新規追加。

次に、サービスを`app.yml`と`worker.yml`に分けてをレポジトリルートに設
置。GAEのサービスはHeroku（Foreman）のアプリケーションにあたる。GAEは
インスタンス数で料金が決まるので、サービスを細かくするとインスタンス数
がふくらむ。最初はサービス`app.yml`だけでいいかもしれない。

下記、`app.yml`の例。

``` yaml
runtime: ruby
env: flex
entrypoint: bundle exec foreman start --formation "$FORMATION"

resources:
  cpu: .2
  memory_gb: .51
  disk_size_gb: 10

automatic_scaling:
  min_num_instances: 1
  max_num_instances: 1
  cool_down_period_sec: 60
  cpu_utilization:
    target_utilization: .5

skip_files:
- ^(.*/)?\.wercker$
- ^(.*/)?\Documentation$
``

注意点は4つ。
1. インスタンス数が値段がはねかえるので、`automatic_scaling >
   max_num_instances`は`1`に
2. entrypointはHerokuにならって`foreman`でデーモン化。ワーカーを同じサー
ビスに混ぜる場合は`./Procfile`を「`web: bundle exec unicorn -p $PORT
-c ./config/unicorn.rb && bundle exec sidekiq -C ./config/sidekiq.yml`」
という感じでよしなに設定。
3. GAEの環境変数は`app.yml`内のenv_variablesで管理している。
`app.yml`にべた書きすると気持ち悪さがあるので、CIデプロイ処理で環境変
数を差し込んでいる。ローカルで気軽に動作確認できなくなるのがつらいが仕
方ない。
4. CIでWerckerをつかうと、`./.wercker`内のファイルがデプロイ時にコンフ
リクトを起こすので、`app.yml`にskip_filesを追加している。

最後に、デプロイコマンド`gcloud app deploy`で挙動を確認。

# GAEへのデプロイCIを作成
GAEデプロイに box: google/cloud-sdk:latest - http://blog.youyo.info/post/2016/06/15/gae-go-deploy-wercker/

# ドメインの向き先を変更（SSLも含む）

# その他
S3のリージョンを東京に変更した。GCSへの移行はまた今度。

-------------------------------------------------------------------------------


