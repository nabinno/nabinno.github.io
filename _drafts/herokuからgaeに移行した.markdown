---
layout: post
title: "RailsアプリをHerokuからGAEに移行した"
category: google-app-engine
tags: heroku,google-app-engine
cover: false
cover-image:
---

[GAE](https://cloud.google.com/appengine/docs/flexible/)がRubyと東京リー
ジョンをサポートしたので、[Utagaki](https://utagaki.com)をHerokuから移
行した。料金的にはSSL適用分で若干高くなった。パフォーマンスはリージョ
ンが近くなったので満足してる。

*やったこと*
- PostgreSQLをAWSからGCPへ移行
- Redis Cloudを東京リージョンに変更
- GAEにRuby用のインスタンスを作成
- GAEへのデプロイCIを作成
- ドメインの向き先を変更（SSLも含む）
- その他

# PostgreSQLをAWSからGCPへ移行
まずは、ダンプしてローカルで確認。

``` shell
heroku pg:backups:download -o ~/db/foo.dump_
pg_restore -U postgres -d bar -c ~/db/foo.dump
```

次に、GCPでPostgreSQL用インスタンスを作成。
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
置。GAEのサービスは
Heroku（[Foreman](https://github.com/ddollar/foreman)）のアプリケーショ
ンにあたる。
[GAEはインスタンス数で料金が決まる](https://cloud.google.com/appengine/pricing)
ので、サービスを細かくするとインスタンス数がふくらむ。最初はサービス
`app.yml`だけでいいかもしれない。

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
   max_num_instances`は`1`に設定。リソースは価格的にクリティカルではな
   いが、`resources > memory_gb`を最低の`0.51`に設定しておくとはじめは
   安心。
2. entrypointはHerokuにならって`foreman`でデーモン化。ワーカーを同じサー
   ビスに混ぜる場合は`./Procfile`を「`web: bundle exec unicorn -p
   $PORT -c ./config/unicorn.rb && bundle exec sidekiq -C
   ./config/sidekiq.yml`」 という感じでよしなに設定。
3. CIでWerckerをつかうと、`./.wercker`内のファイルがデプロイ時にコンフ
   リクトを起こすので、`app.yml`にskip_filesを追加している。
4. GAEの環境変数は`app.yml`内のenv_variablesで管理している。
   `app.yml`にべた書きすると気持ち悪さがあるので、CIデプロイ処理で環境
   変数を差し込むのが望ましい。

最後に、デプロイコマンド`gcloud app deploy`で挙動を確認。

# GAEへのデプロイCIを作成
CIはWerckerを使用。

Werckerの特徴として
- ローカル環境もふくめ（`wercker-cli`）、Dockerで環境
をつくれる
- 異なるサービス間のネットワークもWerckerが生成する
環境変数で対応可能

下記 `wercker.yml`。

``` yaml
box: ruby:2.3.1
services:
  - postgres:9.6.1
  - redis:3.0.3

dev:
  steps:
    - bundle-install
    - script:
        name: Install ImageMagick
        code: |
          apt-get update
          apt-get install -y nodejs imagemagick
    - script:
        name: Setup database
        code: |
          RAILS_ENV=test bundle exec rake db:create db:migrate
    - internal/watch:
        name: Run rspec
        code: |
          RAILS_ENV=test bundle exec rake spec
        reload: true

build:
  steps:
    - bundle-install
    - script:
        name: Install ImageMagick
        code: |
          apt-get update
          apt-get install -y nodejs imagemagick
    - script:
        name: Echo Ruby information
        code: |
          env
          echo "ruby version $(ruby --version) running!"
          echo "from location $(which ruby)"
          echo -p "gem list: $(gem list)"
    - script:
        name: Setup database
        code: |
          RAILS_ENV=test bundle exec rake db:create db:migrate
    - script:
        name: Run rspec
        code: |
          RAILS_ENV=test bundle exec rake spec

deploy:
  steps:
    - bundle-install
    - script:
        name: Install ImageMagick
        code: |
          apt-get update
          apt-get install -y nodejs imagemagick
    - script:
        name: Echo Ruby information
        code: |
          env
          echo "ruby version $(ruby --version) running!"
          echo "from location $(which ruby)"
          echo -p "gem list: $(gem list)"
    - script:
        name: Assets Precompile
        code: |
          RAILS_ENV=production \
            S3_ACCESS_KEY_ID=${S3_ACCESS_KEY_ID} \
            S3_SECRET_ACCESS_KEY=${S3_SECRET_ACCESS_KEY} \
            S3_BUCKET=${S3_BUCKET} \
            S3_REGION=${S3_REGION} \
            bundle exec rake assets:precompile --trace
    - script:
        name: DB Migrate
        code: |
          RAILS_ENV=production \
            DATABASE_URL=${DATABASE_URL} \
            bundle exec rake db:create db:migrate --trace
    - script:
        name: Install gcloud
        code: |
          curl https://sdk.cloud.google.com | bash
          source ~/.bashrc
    - script:
        name: Authenticate gcloud
        code: |
          gcloud config set project utagaki-v2
          openssl aes-256-cbc -k ${DECRYPT_KEY} -d -in ./gcloud.json.encrypted -out ./gcloud.json
          gcloud auth activate-service-account --key-file ./gcloud.json
    - script:
        name: Deploy app to Google App Engine
        code: |
          gcloud app deploy ./app.yaml --promote
    - add-to-known_hosts:
        hostname: github.com
        fingerprint: f2:dd:ed:fb:91:f3:e2:e2:25:20:7b:e4:09:4a:4f:32
    - add-ssh-key:
        host: github.com
        keyname: ${GITHUB_PRIVATE}
    - script:
        name: Add git-tag
        code: |
          git tag $(date +%Y-%m-%d-%H-%M-%S) master
          git push origin --tags
  after-steps:
    - wantedly/pretty-slack-notify:
        webhook_url: ${SLACK_WEBHOOK_URL}
        channel: general
```



# ドメインの向き先を変更（SSLも含む）

# その他
S3のリージョンを東京に変更した。GCSへの移行はまた今度。


