---
layout: post
title: "PositiveSSLをHerokuに適用する"
category: F
tags:
cover: false
cover-image:
---

# PROBLEM
- HerokuのSSLの期限がきた。

-

# SOLUTION
- というわけで、いつもつかっているSSL販売代理店「NameCheap社のSSLs.com」でPositiveSSL（運用Comodo社）をHerokuに適用することに。

## HOWTO
1. 証明書を購入する
  - まあ、SSL販売代理店であればどこでもいいんですが
2. 秘密鍵と署名リクエストをつくる
  - 秘密鍵 `openssl genrsa -des3 -out server.orig.key 2048`
  - 秘密鍵パスワードなし`openssl rsa -in server.orig.key -out server.key`
  - 署名リクエスト `openssl req -new -key server.key -out server.csr`
3. 証明書発行を申請する
  - SSL販売代理店より署名リクエスト`server.csr`と関連情報を送信する
4. ドメイン保持の証明をする
  - PositiveSSLの運用会社Comodoにたいしドメイン保持の証明をする
  - 証明方法はメールを受信する、あるいは、Webサイトにプレーンテキストを設置するかの2択
5. Heroku用の証明書をつくる
  - 証明タスクをこなししばらくすると、Comodo社より複数の証明書がおくられてくる
  - Heroku用に証明書をつくる `cat www_example_com.crt COMODORSADomainValidationSecureServerCA.crt COMODORSAAddTrustCA.crt AddTrustExternalCARoot.crt > server.crt`
6. Herokuに証明書を適用する
  - 新規で適用する場合
    - `heroku addons:add ssl:endpoint`
    - `heroku certs:add server.crt server.key`
  - 更新する場合
    - `heroku certs:update server.crt server.key`

-

以上 :construction_worker:
