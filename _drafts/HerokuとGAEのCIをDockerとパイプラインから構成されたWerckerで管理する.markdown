---
layout: post
title: "HerokuとGAEのCIをDockerとパイプラインから構成されたWerckerで管理する"
category: F
tags: wercker,docker,heroku,google-app-engine
cover: false
cover-image:
---

# Problem

- パフォーマンス改善のための開発環境の不備
- 別PaaSへ移行するための開発環境汎用化の不備

...

# Solution

というわけで、まずはCI上のDockerに載せてから次の手（GAEあたり）を考え
ることにした。CIはWerckerを使用。以前から使っていたのだが、今回はボッ
クスがDockerになったのでそちらに対応した。

Wercker3つの特徴
1. Dockerで環境を管理。今回は対応してないが、GAEのコンテナ
   （`gcr.io/google_appengine/ruby:xxx`）と共通化することもできる。た
   だし、HerokuのHobby Dynosはプロセス数に制限があるのでコンテナ運用は
   工夫が必要。
2. 異なるサービス間のネットワークをWerckerが生成する環境変数で管理。
   Dockerのネットワーク設定の煩雑さを解消。
3. タスクをワークフローとしてパイプラインで条件付け管理。パイプライン
   ごとにコンテナを立ち上げているので、同じDocker環境でもパイプライン
   ごとに環境変数を分けることが可能。Herokuのパイプラインでもいいが、
   今後別PaaSに移行する可能性を考えてCI管理にbetした。

下記 `wercker.yml`をパイプラインごとに記載する。

![Alt text](http://g.gravizo.com/g?
@startuml;
actor User;
participant "dev" as A;
participant "build" as B;
participant "deploy-stage" as C;
participant "deploy-prod-heroku" as D;
participant "deploy-prod-gae" as E;
participant "post-deploy" as F;
User -> A: wercker-dev;
activate A;
A -> B: git-push;
activate B;
B -> C: git-push feature;
activate C;
B -> D: git-push master;
activate D;
B -> E: git-push master;
activate E;
D --> F: %28released%29;
activate D;
F --> User: %28done%29;
deactivate F;
@enduml)

## dev
devパイプラインは`wercker dev`コマンドをローカルでたたく際につかう。下
記の例だとRspec走らせているだけなのでおまけ程度。ただ、ローカル開発で
Dockerつかうことになったらこういう提案もありかもしれない。プロジェクト
レポジトリすべてをDockerにしてローカル開発する辛み、所謂git-dockerバー
ジョン管理問題があるので代替案として。

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
```

## build
buildパイプラインもdevと同じDockerボックスつかってる。やっていることは
devパイプラインと変わらず。すべてのブランチで走る。

``` yaml
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
```

## deploy-stage
deploy-stageパイプラインはステージング環境用。他のPaaSに移ったとして
もしばらくHerokuで行う予定。

``` yaml
deploy-stage:
  steps:
    - heroku-deploy:
        key: $HEROKU_KEY
        user: $HEROKU_USER
        app-name: $HEROKU_APP_NAME
        install-toolbelt: true
    - script:
        name: Assets Precompile
        code: |
          heroku run rake assets:precompile --app $HEROKU_APP_NAME
    - script:
        name: DB Migrate
        code: |
          heroku run rake db:migrate --app $HEROKU_APP_NAME
  after-steps:
    - wantedly/pretty-slack-notify:
        webhook_url: ${SLACK_WEBHOOK_URL}
        channel: general
```

## deploy-prod-heroku
deploy-prod-herokuパイプラインは本番環境へのリリース用。環境変数以外は
deploy-stageパイプラインと同じ。

``` yaml
deploy-prod-heroku:
  steps:
    - heroku-deploy:
        key: $HEROKU_KEY
        user: $HEROKU_USER
        app-name: $HEROKU_APP_NAME
        install-toolbelt: true
    - script:
        name: Assets Precompile
        code: |
          heroku run rake assets:precompile --app $HEROKU_APP_NAME
    - script:
        name: DB Migrate
        code: |
          heroku run rake db:migrate --app $HEROKU_APP_NAME
  after-steps:
    - wantedly/pretty-slack-notify:
        webhook_url: ${SLACK_WEBHOOK_URL}
        channel: general
```

## deploy-prod-gae
deploy-prod-gaeパイプラインはdeploy-prod-herokuパイプラインと同じく本
番環境へのリリース用。GAEにいつでも移行できるように走らせている。

GAEのデプロイは癖があって、`gcloud app deploy`コマンドをつかってDocker
ビルドを走らせるが、その時にDocker内に外部から環境変数を設定することが
できない。そのため、アセットプリコンパイルのビルドの際、`asset_sync`を
使っていると別サーバーへ同期に失敗する。また、パイプライン上の別ステッ
プに環境変数を当てて行うことはできるが、`gcloud`のデプロイステップとア
セットプリコンパイルが重複して適切なダイジェストを発行できない。従って、
GAEをつかう場合は`./public`ディレクトリをつかうのが現状の正解である。
HerokuのSlugの取り扱い方針と違うので注意。

GAEのコンテナの中身は、`gcloud beta app gen-config --runtime=ruby
--custom`で出力されるDockerfileを参照。

``` yaml
deploy-prod-gae:
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
          gcloud app deploy ./app.yaml --promote --stop-previous-version
  after-steps:
    - wantedly/pretty-slack-notify:
        webhook_url: ${SLACK_WEBHOOK_URL}
        channel: general
```

## post-deploy
post-deployパイプラインは本番環境にデプロイした後の後処理用。参考程度
に`git tag`をつけてる。

``` yaml
post-deploy:
  steps:
    - add-ssh-key:
        host: github.com
        keyname: GITHUB
    - add-to-known_hosts:
        hostname: github.com
        fingerprint: 16:27:ac:a5:76:28:2d:36:63:1b:56:4d:eb:df:a6:48
    - script:
        name: Add git-tag
        code: |
          git remote set-url origin git@github.com:nabinno/utagaki.git
          git tag $(date +%Y-%m-%d-%H-%M-%S) master
          git push origin --tags
  after-steps:
    - wantedly/pretty-slack-notify:
        webhook_url: ${SLACK_WEBHOOK_URL}
        channel: general
```
