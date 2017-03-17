---
layout: post
title: "Xamarin開発環境をととのえる"
category: F
tags:
cover: false
cover-image:
---

# PROBLEM

- Xamarin周辺の変数のうごきが大きいので開発環境が安定していない
  - Visual Studio Community 2015の動作がもっさりしている
  - 適切な開発フローがわからない
  - 適切なアプリケーションフレームワークがわからない
  - 適切なXAMLプレビュワーがわからない
  - 適切なAndroidエミュレーターがわからない
- 普段の開発環境とかい離している
  - C#の開発経験なし
  - ホスト側のIDEでの開発経験なし

-

# SOLUTION

というわけで、動作が快適になったVisual Studio 2017がでたのでそちらを中心に開発環境を整理する。

**開発フロー**

- テスト駆動開発
  - デバッグ
    - XAMLのプレビュー
    - デバッグによる画面プレビュー
  - 単体テスト
    - UIテスト
    - 単体テスト (NUnit3)
    - Reference
      - http://www.buildinsider.net/mobile/insidexamarin/09
      - https://code.msdn.microsoft.com/TFSVSO-dc7b8c9d
      - http://klabgames.tech.blog.jp.klab.com/archives/1051161536.html
- デプロイ
  - Featureブランチ プッシュ
  - CI
    - ビルド
    - テスト
    - 配布
    - レビュー
    - CIツール
      - [Visual Studio Mobile Center](https://mobile.azure.com/apps) - HockeyApp（クラッシュレポート）とXamarin Test Cloudを統合したCIサービス
  - Appストアへデプロイ
    - Android
    - iOS

-

以上 :construction_worker:
