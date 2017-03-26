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
  - ホスト側IDEでの開発経験なし

-

# SOLUTION

というわけで、動作が快適になったVisual Studio 2017がでたのでそちらを中心に開発環境を暫定で整理する。

## 開発フロー
まず、想定している開発フローは下記の通り。

- テスト駆動開発
  - デバッグ
    - XAMLのプレビュー
    - エミュレーター画面の動作確認
  - テスト
    - 単体テスト - NUnit
      - https://www.slideshare.net/masakit/xamarin-101
      - https://developer.xamarin.com/guides/ios/deployment,_testing,_and_metrics/touch.unit/
    - UIテスト
- [Github Flow](http://qiita.com/tbpgr/items/4ff76ef35c4ff0ec8314)にそったデプロイ
  - `feature`ブランチをきってプルリクエストをたてる
  - 当該ブランチに対してCIツールでビルド・テスト・配布を自動化 - ビルド・テスト後にレビュアーにメールにて配布しスマホで確認してもらう流れ。
    - CIツール
      - [Visual Studio Mobile Center](https://mobile.azure.com/apps) - HockeyApp（クラッシュレポート）とXamarin Test Cloud（UIテスト）を統合したCIサービス。Xamarin.Formsは2017年3月18日現在iOS対応、Android非対応という状況。
      - [Wercker](https://app.wercker.com/) - `master`マージ後にいらなくなった`feature`ブランチを消すなどの後片付け役。
  - Appストアへデプロイ
    - Android
    - iOS

ちなみにWerckerでの`feature`ブランチなどの後片付けはこんな感じ。`master`マージのタイミングではしらせる。

```yaml
box: ruby:2.4.0
build:
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
          _tag=$(date -u -d '9 hours' +%Y-%m-%d-%H-%M-%S)
          git remote add origin git@github.com:nabinno/utagaki.git
          git config --global user.email 'wercker@blahfe.com'
          git config --global user.name 'Wercker Bot'
          git tag -a $_tag master -m 'wercker deploy'
          git push origin $_tag
  after-steps:
    - wantedly/pretty-slack-notify:
        webhook_url: ${SLACK_WEBHOOK_URL}
        channel: general
```

## 開発環境
その上で開発環境は下記の通りになった。HypervisorがHyper-VからIntel HAXMやVirtualBoxに変更になったことが大きな変化。クラッシュが心配。

- IDE
  -  Visual Studio Community 2017 - 体感としてVS2015より倍近く早くなった気がする。KeyboardのスキーマにはまだEmacsがない。
    - Basic extentions
      - Microsoft Visual Studio Community 2017 Version 15.0.26228.9 D15RTWSVC
      - Microsoft .NET Framework Version 4.6.01586
      - Visual C# 2017
      - JavaScript Language Service   2.0
      - JavaScript Project System   2.0
      - JavaScript UWP Project System   2.0
      - TypeScript   2.1.5.0
      - Microsoft Visual Studio VC Package   1.0
      - Xamarin   4.3.0.784 (73f58d6)
      - Xamarin.Android SDK   7.1.0.41 (9578cdc)
      - Xamarin.iOS and Xamarin.Mac SDK   10.4.0.123 (35d1ccd)
      - Visual Studio Tools for Unity   3.0.0.1
      - Visual Studio Tools for Universal Windows Apps   15.0.26228.00
      - Mono Debugging for Visual Studio   Mono.Debugging.VisualStudio
      - ASP.NET and Web Tools 2017   15.0.30223.0
      - NuGet Package Manager   4.0.0
      - Common Azure Tools   1.9
      - NpgsqlVSPackage Extension   1.0
      - Merq   1.1.13-alpha (2f64b6d)
      - VSPackage Extension   1.2
    - Other extentions
      - JetBrains ReSharper Ultimate 2016.3.2 - なにはともあれ入れておく。
      - CodeMaid   10.2.7 - 気軽にコード整形してくれる。
      - .ignore   1.2.71
      - Markdown Editor   1.11.201
      - File Nesting   2.6.67
      - GitHub.VisualStudio   2.2.0.8
      - VSColorOutput   2.5
    - Debug用エミュレーター
      - XAML Previewer for Xamarin.Forms - Gorilla PlayerはVS2017未対応の上、Data Bindingを参照できないため機能的にXAML Previewer for Xamarin.Formsとほぼかわらない様子。
      - Android Emulator Manager/Android SDK Manager - VS2017ではHyper-VベースのVisual Studio Emulator for Xamarinがなくなり、Intel HAXMベースのAndroid Emulator Manager/Android SDK Manager (Google)のみとなった。
- DevStack
  - Prism/Prism template (Profile259)
    - Newtonsoft.Json
    - FubarCoder.RestSharp.Portable.HttpClient
    - NUnit
    - Moq

## キーバインド

- Navigation
  - `C-a` - Edit.LineStart
  - `C-b` - Edit.CharLeft
  - `C-c,:` - CodeMaid.SwitchFile
  - `C-e` - Edit.LineEnd
  - `C-f` - Edit.CharRight
  - `C-i` - Edit.ToggleOutlingExpansion
  - `C-l` - Edit.ScrollLineCenter
  - `C-n` - Edit.LineDown
  - `C-p` - Edit.LineUp
  - `C-s` - Edit.IncrementalSearch
  - `C-u,M-c` - Edit.ToggleAllOutling
  - `C-v` - Edit.PageDown
  - `C-x,1` - Window.PreviousTabGroup
  - `C-x,|` - Window.NewVerticalTabGroup
  - `M-<` - Edit.DocumentTop
  - `M->` - Edit.DocumentBottom
  - `M-b` - Edit.WordPrevious
  - `M-f` - Edit.WordNext
  - `M-g` - Edit.GoTo
  - `M-v` - Edit.PageUp
  - `M-x,b` - ReSharper.ReSharper_GotoRecentFiles
  - `M-{` - Edit.PreviousMethod
  - `M-}` - Edit.NextMethod
- Edit
  - `C-,` - Edit.InsertSnippet
  - `C-SPC` - Edit.SelectCurrentWord
  - `C-c,;` - ReSharper.ReSharper_GotoRelatedFile
  - `C-c,j` - CodeMaid.JoinLine
  - `C-c,p` - ReSharpe._ReSharper_DuplicateText
  - `C-d` - Edit.Delete
  - `C-h` - Edit.BackwardDelete
  - `C-k` - Edit.LineCut
  - `C-m` - Edit.BreakLine
  - `C-x,C-S` - File.SaveSelection
  - `C-x,K` - File.Close
  - `C-y` - Edit.Paste
  - `M-/` - Edit.Undo
  - `M-:` - Edit.UncommentSelection
  - `M-;` - Edit.CommentSelection
  - `M-c` - Edit.Capitalize
  - `M-l` - Edit.MakeLowercase
  - `M-u` - Edit.MakeUppercase
- Other
  - `[N/A]` - Edit.LineCut
  - `[N/A]` - Resharper*


-

以上 :construction_worker:
