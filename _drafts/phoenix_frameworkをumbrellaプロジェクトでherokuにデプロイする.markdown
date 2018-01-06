---
layout: post
title: "連載 Rails2Phoenix 1 UmbrellaプロジェクトをHerokuにデプロイする"
category: F
tags: phoenix-framework, elixir
cover: false
cover-image:
---

# PROBLEM
- Herokuで運用しているRailsをPhoenixに移行したい
    - 既存Railsから徐々にPhoenixに移行できるようにおなじレポジトリ・DBをつかいたい
- 当該Phoenixは今後の拡張性を考えてUmbrellaプロジェクトで実装したい

-

# SOLUTION
というわけで、LYSE本の連載がおわったのでRailsからPhoenixに移行する連載「Rails2Phoenix」をはじめる。

- 下記方針
    - `phoenix/base` ブランチをベースに
    - 気軽に参照できるようにRails関連ファイルは可能な限り残しておく
    - Phoenixへの移行が終わるまではPhoenixではDBマイグレーションをしない
    - Kubernetesについては、まだPaaS環境が過渡期なため見送ることに

今回はRailsから移行中のPhoenix UmbrellaプロジェクトをHerokuにデプロイする流れをとりあげる。

## Herokuへのデプロイのながれ
基本的に[ドキュメント](https://hexdocs.pm/phoenix/heroku.html)通り。

### Phoenixアプリケーションを作成
まず、こんな感じでPhoenixの骨組みをつくる。Phoenix関連のファイル `apps/`, `deps/`, `config/config.exs`, `mix.exs`, `mix.lock` が追加される。
```sh
> cd rails_project
> mix new . --umbrella
> cd ./apps
> mix phx.new phoenix_app
> cd ./phoenix_app
```

つぎに、既存のRailsでつくられたスキーマをPhoenixに移植。[Ripperをつかうとはかどる](http://developersnote.jp/elixir/share-db-between-rails-and-phoenix.html)。手動でスキーマをつくりたい場合は、CLI `mix phx.gen.schema --no-migration Blog.Post blog_posts title:string` で作成する。
```sh
> rails db:schema:convert_to_phoenix
```

試しに既存DBへこんな感じで接続してみる。
```config
# rails_project/apps/phoenix_app/config/dev.exs
config :phoenix_app, PhoenixApp.Repo,
  adapter: Ecto.Adapters.Postgres,
  username: System.get_env("POSTGRES_USERNAME"),
  password: System.get_env("POSTGRES_PASSWORD"),
  database: System.get_env("POSTGRES_DATABASE"),
  hostname: System.get_env("POSTGRES_HOSTNAME"),
  pool_size: 10,
  ssl: true
```
```sh
> (cd ./assets && npm install)
> mix deps.get
> mix phx.server
```

## デプロイのパイプラインを追加
さて、既存のCIも更新しよう。今回はPhoenix関連ブランチが更新された場合にのみ、関連パイプラインを走らせるように下記のように変更した。

**BEFORE**
- build
    - deploy.prod

**AFTER**
- build
    - deploy.prod
- phoenix.build
    - phoenix.deploy.prod

### Herokuアプリケーションを作成

`config/prod.exs` = `apps/phoenix_app/config/prod.exs`
`config/prod.secret.exs` = `apps/phoenix_app/config/prod.secret.exs`

**1. Herokuアプリにビルドパックを適用**
```sh
> heroku create --buildpack https://github.com/HashNuke/heroku-buildpack-elixir.git
> heroku buildpacks:add https://github.com/gjaldon/heroku-buildpack-phoenix-static.git
```

**2. 起動設定を準備**
`elixir_buildpack.config`
```config
erlang_version=19.1
elixir_version=1.4.2
always_rebuild=false
pre_compile="pwd"
post_compile="pwd"
runtime_path=/app
config_vars_to_export=(DATABASE_URL)
```

`phoenix_static_buildpack.config`
```config
phoenix_relative_path=apps/phoenix_app
```

`Procfile`
```config
web: MIX_ENV=prod mix phx.server
```

**3. 環境変数を適用**
`config/prod.exs` ファイルを準備

`SECRET_KEY_BASE` を適用
```sh
> mix phoenix.gen.secret
> heroku config:set SECRET_KEY_BASE=foo
```

**MEMO**
Deploy Phoenix with umbrella to Heroku
- https://hackernoon.com/deploying-a-phoenix-1-3-umbrella-app-to-heroku-452436b2b37f

Deploy to Heroku
- http://qiita.com/ma2ge/items/cfe17e02f593bb55b084

Phoenix with umbrella
- http://www.cultivatehq.com/posts/elixir-distillery-umbrella-docker/

-

以上 :construction_worker::droplet:

-
