---
layout: post
title: "連載 Rails2Phoenix 2 認証機能を実装する"
category: F
tags: phoenix-framework, elixir, ruby-on-rails, ruby, wercker, heroku, authentication, guardian
cover: false
cover-image:
---

# PROBLEM
- サービスについて
    - 拡張にともない技術スタックがふえるのを抑えたい
    - スケーラビリティのためのコストを抑えたい
    - パフォーマンスをあげたい

-

# SOLUTION
というわけで、現在つかっているRailsをPhoenixに変更することにした。

- 方針
    - Railsから徐々にPhoenixに移行できるように
      - いままでとおなじPaaS（Heroku）
      - いままでとおなじレポジトリ
          - ブランチ戦略は `phoenix/base` をベースに
          - 気軽に参照できるようにRails関連ファイルは可能な限りのこしておく
      - いままでとおなじDB
          - 移行完了までDBマイグレーションをしない
    - Phoenixは今後の拡張性をかんがえてUmbrellaプロジェクトで

今回はRails/Deviseの認証機能をPhoenixで実装するながれをとりあげる。

## Guardianを実装する
参考にしたのはBlackodeの[guardian_auth](https://github.com/blackode/guardian_auth) :pray: ただ、Guardianのバージョンがふるいので[1.0へのマイグレーション記事](https://github.com/ueberauth/guardian/blob/master/upgrade_guides/0.14.to.1.0.md)をもとにアレンジしてある。

認証に関係しそうな構成は下記のとおり。

ロジック
- MyApp.Account
- MyApp.Account.Registration
- MyApp.Account.User
- MyApp.Auth.Guardian
- MyApp.Auth.ErrorHandler
- MyApp.Auth.Pipeline
- MyApp.Auth.AfterPipeline
- MyApp.Auth.Session

コントローラ
- MyAppWeb.RegistrationController
- MyAppWeb.SessionController

### シリアライザとエラーハンドラの設定
Guardian1.0から直接ではなくモジュールを介して参照するようになった。下記のように各モジュールを用意してコンフィグに割り当てる。

```elixir
# apps/my_app/lib/my_app/auth/guardian.ex

defmodule MyApp.Auth.Guardian do
  use Guardian, otp_app: :my_app
  alias MyApp.Account

  def subject_for_token(resource, _claims), do: {:ok, to_string(resource.id)}
  def subject_for_token(_, _), do: {:error, :reason_for_error}

  def resource_from_claims(claims), do: {:ok, Account.get_user!(claims["sub"])}
  def resource_from_claims(_claims), do: {:error, :reason_for_error}
end
```

```elixir
# apps/my_app/lib/my_app/auth/error_handler.ex

defmodule MyApp.Auth.ErrorHandler do
  import Plug.Conn

  def auth_error(conn, {type, _reason}, _opts) do
    body = Poison.encode!(%{message: to_string(type)})
    send_resp(conn, 401, body)
  end
end
```

```elixir
# apps/my_app/config/config.exs

config :my_app, MyApp.Auth.Guardian,
  issuer: "MyApp",
  ttl: {30, :days},
  allowed_drift: 2000,
  # optionals
  allowed_algos: ["HS512"],
  verify_module: MyApp.Auth.Guardian.JWT,
  verify_issuer: true,
  secret_key:
    System.get_env("GUARDIAN_SECRET") ||
      "secret_key"
```

### ルーターの設定
認証のパイプラインは、認証中と認証後のものを用意しコンフィグとルーターに割り当てる。

ルータースコープ内のパイプラインくみあわせについて、ここでは未ログインスコープには認証前・認証中パイプライン、ログイン済スコープには認証前・認証中・認証後パイプラインを適用している。こうすることでどのスコープにも認証リソースをロードすることができ、かつ、認証も担保することができるようになる。具体的にいうと、ルート `/` などの同一URLで未ログインスコープとログイン済スコープの切り替えができるようになる。

```elixir
# apps/my_app/lib/my_app/auth/pipeline.ex

defmodule MyApp.Auth.Pipeline do
  use Guardian.Plug.Pipeline, otp_app: :my_app

  plug(Guardian.Plug.VerifySession, claims: %{"typ" => "access"})
  plug(Guardian.Plug.VerifyHeader, claims: %{"typ" => "access"})
  plug(Guardian.Plug.LoadResource, allow_blank: true)
end
```

```elixir
# apps/my_app/lib/my_app/auth/after_pipeline.ex

defmodule MyApp.Auth.AfterPipeline do
  use Guardian.Plug.Pipeline, otp_app: :my_app

  plug(Guardian.Plug.EnsureAuthenticated)
end
```

```elixir
# apps/my_app/lib/my_app_web/router.ex

defmodule MyAppWeb.Router do
  use MyAppWeb, :router

  pipeline :browser do
    plug(:accepts, ["html"])
    plug(:fetch_session)
    plug(:fetch_flash)
    plug(:protect_from_forgery)
    plug(:put_secure_browser_headers)
  end

  pipeline :browser_auth do
    plug(MyApp.Auth.Pipeline)
  end

  pipeline :browser_auth_after do
    plug(MyApp.Auth.AfterPipeline)
  end

  scope "/", MyAppWeb do
    pipe_through([:browser, :browser_auth])

    post("/registration", RegistrationController, :create)
    get("/login", SessionController, :new)
    post("/login", SessionController, :create)
    get("/logout", SessionController, :delete)
  end

  scope "/", MyAppWeb do
    pipe_through([:browser, :browser_auth, :browser_auth_after])

    get("/edit", RegistrationController, :edit)
    put("/edit", RegistrationController, :update)
    get("/users", UserController, :index)
    resources "/", UserController, only: [:show, :delete], param: "username"
  end
end
```

```elixir
# apps/my_app/config/config.exs

config :MyApp, MyApp.Auth.Pipeline,
  module: MyApp.Auth.Guardian,
  error_handler: MyApp.Auth.ErrorHandler

config :MyApp, MyApp.Auth.AferPipeline,
  module: MyApp.Auth.Guardian,
  error_handler: MyApp.Auth.ErrorHandler
```

### 登録
登録は登録用のロジック（ユーザーモデルと登録サービス）とコントローラを用意する。

このあたりはDevise/Railsとあまり変わらない。ほかのアクション「新規パスワード発行」「メールアドレス確認」なども同様の構成をとろうと思っている。

```elixir
# apps/my_app/lib/my_app_web/controller/registration_controller.ex

def create(conn, user_params) do
  changeset = User.registration_changeset(%User{}, user_params)

  case Registration.create(changeset, Repo) do
    {:ok, user} ->
      conn
      |> MyApp.Auth.login(user)
      |> put_flash(:info, "Your account was created successfully")
      |> redirect(to: page_path(conn, :home))

   {:error, changeset} ->
      conn
      |> put_flash(:error, "Unable to create account: Try again")
      |> render(MyAppWeb.PageView, "home.html", changeset: changeset)
  end
end
```

```elixir
# apps/my_app/lib/my_app/auth/auth.ex

def login(conn, %User{} = user) do
  conn
  |> Guardian.Plug.sign_in(user)
  |> assign(:current_user, user)
end
```

```elixir
# apps/my_app/lib/my_app/account/registration.ex

def create(changeset, repo) do
  changeset
  |> repo.insert()
end
```

### ログイン・ログアウト
ログイン・ログアウトはセッション用のサービスとコントローラで実装する。

```elixir
# apps/my_app/lib/my_app_web/controller/session_controller.ex

@doc "Logged in [POST /login]"
def create(conn, %{"email" => email, "password" => password}) do
  case Session.authenticate_user(email, password) do
    {:ok, user} ->
      conn
      |> Session.login(user)
      |> put_flash(:info, "Logged in successfully")
      |> redirect(to: page_path(conn, :home))

    {:error, _reason} ->
      conn
      |> put_flash(:error, "Wrong username/password")
      |> render("new.html")
  end
end

@doc "Logged out [DELETE /logout]"
def delete(conn, _params) do
  conn
  |> Session.logout()
  |> put_flash(:info, "Logged out successfully.")
  |> redirect(to: "/")
end
```

```elixir
# apps/my_app/lib/my_app/auth/session.ex

defmodule MyApp.Auth.Session do
  import Ecto.Query
  import Plug.Conn
  import Comeonin.Bcrypt, only: [checkpw: 2, dummy_checkpw: 0]
  alias MyApp.Repo
  alias MyApp.Auth.Guardian
  alias MyApp.Account.User

  def login(conn, %User{} = user) do
    conn
    |> Guardian.Plug.sign_in(user)
    |> assign(:current_user, user)
  end

  def logout(conn), do: Guardian.Plug.sign_out(conn)

  def authenticate_user(email, given_password) do
    query = Ecto.Query.from(u in User, where: u.email == ^email)

    Repo.one(query)
    |> check_password(given_password)
  end

  def current_user(conn), do: Guardian.Plug.current_resource(conn, [])

  def logged_in?(conn), do: Guardian.Plug.authenticated?(conn, [])

  defp check_password(nil, _), do: {:error, "Incorrect username or password"}

  defp check_password(user, given_password) do
    case Comeonin.Bcrypt.checkpw(given_password, user.encrypted_password) do
      true -> {:ok, user}
      false -> {:error, "Incorrect email or password"}
    end
  end
end
```

Devise/Railsのビューヘルパーはビューマクロで適用する。

```elixir
# apps/my_app/lib/my_app_web.ex

def view do
  quote do
    # ..
    import Okuribi.Auth.Session, only: [current_user: 1, logged_in?: 1]
    # ..
  end
end
```

## その他
RailsのビューをPhoenixのテンプレートに移植するには下記の変換を地道におこなっていく。

| rails                                                                                      |
|--------------------------------------------------------------------------------------------|
| `ActionView::Helpers::FormHelper#form_for(record, options={}, &block)`                     |
| `ActionView::Helpers::FormHelper#text_field(object_name, method, options={})`              |
| `ActionView::Helpers::FormHelper#file_field(object_name, method, options={})`              |
| `ActionView::Helpers::FormHelper#hidden_field(object_name, method, options={})`            |
| `ActionView::Helpers::FormHelper#password_field(object_name, method, options={})`          |
| `ActionView::Helpers::FormHelper#radio_button(object_name, method, tag_value, options={})` |
| `ActionView::Helpers::FormBuilder#submit(value=nil, options={})`                           |
| `ActionView::Helpers::TranslationHelper#t`                                                 |

| phoenix                                                             |
|---------------------------------------------------------------------|
| `Phoenix.HTML.Form.form_for(form_data, action, options \\ [], fun)` |
| `Phoenix.HTML.Form.text_input(form, field, opts \\ [])`             |
| `Phoenix.HTML.Form.file_input(form, field, opts \\ [])`             |
| `Phoenix.HTML.Form.hidden_input(form, field, opts \\ [])`           |
| `Phoenix.HTML.Form.password_input(form, field, opts \\ [])`         |
| `Phoenix.HTML.Form.radio_button(form, field, value, opts \\ [])`    |
| `Phoenix.HTML.Form.submit(opts, opts \\ [])`                        |
| `Gettext.dgettext(backend, domain, msgid, bindings \\ %{})`         |

-

以上 :droplet:
