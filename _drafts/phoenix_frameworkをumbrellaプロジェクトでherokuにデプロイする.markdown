---
layout: post
title: "連載 Rails2Phoenix 1 UmbrellaプロジェクトをHerokuにデプロイする"
category: F
tags: phoenix-framework, elixir
cover: false
cover-image:
---

# PROBLEM
- サービスについて
    - 拡張にともない
        - 技術スタックがふえるのを抑えたい
        - スケーラビリティのためのコストを抑えたい
    - パフォーマンスをあげたい

-

# SOLUTION
というわけで、現在つかっているRailsをPhoenixに変更することにした。

- 方針
    - PaaSはいままでとおなじHeroku
    - 既存Railsから徐々にPhoenixに移行できるようにおなじレポジトリ・DBをつかう
        - ブランチ戦略は `phoenix/base` をベースに
        - 気軽に参照できるようにRails関連ファイルは可能な限り残しておく
        - RailsからPhoenixへの移行が完了するまではPhoenixではDBマイグレーションをしない
    - Phoenixは今後の拡張性を考えてUmbrellaプロジェクトで

今回はRailsから移行中のPhoenix UmbrellaプロジェクトをHerokuにデプロイする流れをとりあげる。

## Herokuへのデプロイのながれ
基本的に[ドキュメント](https://hexdocs.pm/phoenix/heroku.html)通り。

### Phoenixアプリケーションを作成
まず、こんな感じでPhoenixの骨組みをつくる。Phoenix関連のファイル `apps/`, `deps/`, `config/config.exs`, `mix.exs`, `mix.lock` が追加される。
```sh
> cd rails_project
> mix new . --umbrella
> (cd ./apps && mix phx.new phoenix_app)
```

つぎに、既存のRailsでつくられたスキーマをPhoenixに移植。[Ripperをつかうとはかどる](http://developersnote.jp/elixir/share-db-between-rails-and-phoenix.html)。ちなみに手動でスキーマをつくりたい場合は、CLI `mix phx.gen.schema --no-migration Blog.Post blog_posts title:string` で作成する。
```rb
# lib/tasks/convert_to_phoenix.rake
# こちらはスキーマ移植タスクをPhoenix1.3用に改めたもの
require 'ripper'
require 'erb'
require 'fileutils'

namespace :db do
  namespace :schema do
    desc 'Convert schema from Rails to Phoenix'
    task convert_to_phoenix: :environment do
      ConvertSchemaForPhoenixService.call
    end
  end
end

class ConvertSchemaForPhoenixService
  class << self
    def call
      FileUtils.mkdir_p(File.join('tmp', 'models'))
      extract_activerecord_define_block(
        Ripper.sexp(
          Rails.root
               .join('db', 'schema.rb')
               .read
        )
      ).select(&method(:create_table_block?))
       .map(&method(:configuration))
       .each do |conf|
        project_name = 'PhoenixApp'
        table_name = conf[:table_name]
        table_columns = conf[:table_columns].reject(&method(:reject_condition))
                                            .map do |c|
          case c[:column_type]
          when 'text' then c[:column_type] = ':string'
          when 'datetime' then c[:column_type] = ':naive_datetime'
          when 'inet' then c[:column_type] = 'EctoNetwork.INET'
          else c[:column_type] = ":#{c[:column_type]}"
          end
          c
        end
        File.write(
          File.join('tmp', 'models', "#{conf[:table_name].singularize}.ex"),
          template.result(binding)
        )
      end
    end

    private

    def extract_activerecord_define_block(sexp)
      sexp.dig(1, 0, 2, 2)
    end

    def create_table_block?(activerecord_define_block_element_sexp)
      activerecord_define_block_element_sexp.dig(1, 1, 1) == 'create_table'
    rescue
      false
    end

    def extract_table_name(create_table_block_sexp)
      create_table_block_sexp.dig(1, 2, 1, 0, 1, 1, 1)
    end

    def extract_table_columns(create_table_block_sexp)
      create_table_block_sexp.dig(2, 2)
    end

    def extract_column_type(table_column_sexp)
      table_column_sexp.dig(3, 1)
    end

    def extract_column_name(table_column_sexp)
      # Return value of `t.index` is array like ['user_id'].
      if table_column_sexp.dig(4, 1, 0, 0) == :array
        return table_column_sexp.dig(4, 1, 0, 1).map { |e| e.dig(1, 1, 1) }
      end
      table_column_sexp.dig(4, 1, 0, 1, 1, 1)
    end

    def extract_column_option(table_column_sexp)
      # If is not `column_option`, then `table_column_sexp.dig(4, 1, 1,
      # 1)` method return nil. Set blank array ([]) for avoiding nil.
      table_column_sexp.dig(4, 1, 1, 1) || []
    end

    def extract_option_key(column_option_sexp)
      # Remove colon for avoiding `null:`.
      column_option_sexp.dig(1, 1).gsub(/:\z/, '')
    end

    def extract_option_value(column_option_sexp)
      if column_option_sexp.dig(2, 0) == :array
        return Array(column_option_sexp.dig(2, 1)).map { |e| e.dig(1, 1, 1) }
      end
      element = column_option_sexp.dig(2, 1)
      if element.class != Array
        return element
      end
      case element.dig(0)
      when :kw then element.dig(1)
      when :string_content then element.dig(1, 1) || ''
      end
    end

    def template
      ERB.new(<<'__EOD__', nil, '-')
defmodule <%= project_name %>.<%= table_name.classify %> do
  use Ecto.Schema
  import Ecto.Changeset
  alias <%= project_name %>.<%= table_name.classify %>

  schema "<%= table_name %>" do<% table_columns.each do |c| %>
    field :<%= c[:column_name] -%>, <%= c[:column_type] -%>
<% end %>
    timestamps inserted_at: :created_at
  end

  @doc false
  def changeset(%<%= table_name.classify %>{} = <%= table_name.singularize %>, attrs) do
    <%= table_name.singularize %>
    |> cast(attrs, [<%= table_columns.map { |c| ":" << c[:column_name] }.join(", ") -%>])
    # |> validate_required([<%= table_columns.map { |c| ":" << c[:column_name] }.join(", ") -%>])
  end
end
__EOD__
    end

    def configuration(table)
      {
        table_name: extract_table_name(table),
        table_columns: extract_table_columns(table).map do |c|
          {
            column_name: extract_column_name(c),
            column_type: extract_column_type(c),
            column_option: Hash[extract_column_option(c).map { |o| [extract_option_key(o), extract_option_value(o)] }]
          }
        end
      }
    end

    def reject_condition(column)
      column[:column_name] =~ /\A(created|updated)_at\z/ || column[:column_type] == 'index'
    end
  end
end
```
```sh
> rails db:schema:convert_to_phoenix
```

最後に、既存DBへはこんな感じで接続する。
```config
# rails_project/apps/phoenix_app/config/dev.exs
config :phoenix_app, PhoenixApp.Repo,
  adapter: Ecto.Adapters.Postgres,
  url: System.get_env("DATABASE_URL"),
  pool_size: 10,
  ssl: true
```
```sh
> (cd ./apps/phoenix_app/assets && npm install)
> mix deps.get
> mix phx.server
```

## デプロイのパイプラインを追加
さて、既存のCI（Wercker）も更新。今回はPhoenix関連ブランチが更新された場合にのみ、関連パイプラインを走らせるように下記のように変更した。特定ブランチをHerokuにデプロイするためのコマンド `git push -f "git@heroku.com:${HEROKU_PHOENIX_APP_NAME}.git"  ${BRANCH_NAME}:master` がポイント。

**BEFORE**
- build (all branch)
    - deploy.prod (master branch)

**AFTER**
- build (branches excluding phoenix/* branch)
    - deploy.prod (master)
    - deploy.phoenix.prod (phoenix/base branch)

```yaml
# wercker.yml
deploy-phoenix-prod-heroku:
  steps:
    - script:
        name: Init netrc
        code: |
          {
            echo "machine api.heroku.com"
            echo "  login ${HEROKU_KEY}"
            echo "  password ${HEROKU_USER}"
          } >> "$HOME/.netrc"
          chmod 0600 "$netrc";
    - add-ssh-key:
        host: github.com
        keyname: GITHUB
    - add-to-known_hosts:
        hostname: github.com
        fingerprint: 16:27:ac:a5:76:28:2d:36:63:1b:56:4d:eb:df:a6:48
    - script:
        name: Init git
        code: |
          git config --global user.name "${HEROKU_USER}"
          git config --global user.email "${HEROKU_USER}"
          git checkout phoenix/base
    - script:
        name: Init gitssh
        code: |
          gitssh_path="$(mktemp)";
          ssh_key_path="$(mktemp -d)/id_rsa";
          echo "ssh -e none -i \"$ssh_key_path\" \$"" > "$gitssh_path";
          chmod 0700 "$gitssh_path";
          export GIT_SSH="$gitssh_path";"
    - script:
        name: Remove unrequired files
        code: |
          rm -fr \
            Gemfile \
            Gemfile.lock
            Guardfile \
            Rakefile \
            app \
            config.ru \
            db \
            lib \
            log \
            package.json \
            public \
            spec \
            tmp \
            vendor \
    - script:
        name: Deploy phoenix/base to heroku
        code: |
          git add .
          git commit -m 'Deploy phoenix/base to heroku.'
          git push -f "git@heroku.com:${HEROKU_APP_NAME}.git" phoenix/base:master
  after-steps:
    - wantedly/pretty-slack-notify:
        webhook_url: ${SLACK_WEBHOOK_URL}
        channel: general
```

### Herokuアプリケーションを作成
基本ドキュメントの説明通り。Phoenix Umbrellaプロジェクトの注意点としては、ディレクトリの差異くらいでそれ以外はおなじ。つまり、これ `rails_project/config/prod.exs` をこう `rails_project/apps/phoenix_app/config/prod.exs` する。

**1. Herokuアプリにビルドパックを適用**
```sh
> heroku create --buildpack https://github.com/HashNuke/heroku-buildpack-elixir.git
> heroku buildpacks:add https://github.com/gjaldon/heroku-buildpack-phoenix-static.git
```

**2. 起動設定を準備**
```config
# rails_project/elixir_buildpack.config
erlang_version=19.1
elixir_version=1.4.2
always_rebuild=false
pre_compile="pwd"
post_compile="pwd"
runtime_path=/app
config_vars_to_export=(DATABASE_URL)
config_vars_to_export=(DATABASE_POOL_SIZE)
```
```config
# rails_project/phoenix_static_buildpack.config
phoenix_relative_path=apps/phoenix_app
```
```config
# rails_project/Procfile
web: MIX_ENV=prod mix phx.server
```

**3. 環境変数を適用**
データベース関連。
```config
# rails_project/apps/phoenix_app/config/prod.exs
config :phoenix_app, PhoenixApp.Repo,
  adapter: Ecto.Adapters.Postgres,
  url: System.get_env("DATABASE_URL"),
  pool_size: String.to_integer(System.get_env("DATABASE_POOL_SIZE") || 10),
  ssl: true
```
```sh
heroku config:set DATABASE_URL=foo
heroku config:set DATABASE_POOL_SIZE=bar
```

シークレットキー。
```sh
> heroku config:set SECRET_KEY_BASE=$(mix phoenix.gen.secret)
```

-

# WRAPUP


-

以上 :construction_worker::droplet:
