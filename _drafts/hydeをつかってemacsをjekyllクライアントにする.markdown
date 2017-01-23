---
layout: post
title: "HydeをつかってEmacsをJekyllクライアントにする"
category: emacs
tags: emacs,jekyll,hyde,github-pages
cover: false
cover-image:
---

# Problem

- タスクメモがAsanaなどのタスク管理ツールに散在している
- ブラウザをつかって文章を書くのがつらい

# Solution

そんなわけで[Github
Pages](https://pages.github.com/)（[Jekyll](https://jekyllrb.com/)）を
Emacsで楽に管理できないかと以前から考えていたのだが、いい塩梅のソフト
を発見した。Jekyllだから[Hyde](https://github.com/nibrahim/Hyde)。

*pros*
- `git`の自動コメント
- `jekyll build`、`jekyll serve`のショートカット

*cons*
- キーバインドが既存のものとかぶる
- `hyde-home`がカスタム変数ではない
- `add-hook`が効かない

## Hydeの設定
下記はconsつぶし。
Hyde本体がキーバインドを`defvar`で割り当てているので、`init.el`の設定
で`require`前に割り込みevalしてる。`view-mode`のオレオレキーバインドと
かぶっているのはいつものこと。

```emacs-lisp
;; hyde (jekyll client)
(defvar hyde-mode-map
  (let
      ((hyde-mode-map (make-sparse-keymap)))
    (define-key hyde-mode-map (kbd "N") 'hyde/new-post)
    (define-key hyde-mode-map (kbd "G") 'hyde/load-posts)
    (define-key hyde-mode-map (kbd "C") 'hyde/hyde-commit-post)
    (define-key hyde-mode-map (kbd "P") 'hyde/hyde-push)
    (define-key hyde-mode-map (kbd "J") 'hyde/run-jekyll)
    (define-key hyde-mode-map (kbd "S") 'hyde/serve)
    (define-key hyde-mode-map (kbd "K") 'hyde/stop-serve)
    (define-key hyde-mode-map (kbd "d") 'hyde/deploy)
    (define-key hyde-mode-map (kbd "D") 'hyde/delete-post)
    (define-key hyde-mode-map (kbd "U") 'hyde/promote-to-post)
    (define-key hyde-mode-map (kbd "Q") 'hyde/quit)
    (define-key hyde-mode-map (kbd "O") 'hyde/open-post-maybe)
    hyde-mode-map)
  "Keymap for Hyde")
(require 'hyde)
(defun hyde-nabinno ()
  "Run hyde with home parameter."
  (interactive)
  (hyde "~/nabinno.github.io/"))
(global-set-key (kbd "C-c ; j") 'hyde-nabinno)
```

Jekyllのルートにおく`.hyde.el`の中身はこんな感じ。JekyllはWebrickを使っ
ているので、VMなどでホストをいじっている場合は`hyde/serve-command`にホ
ストIPを0.0.0.0（`jekyll s -H 0.0.0.0`）に変更する必要がある。

```emacs-lisp
(setq hyde-deploy-dir "_site"
      hyde-posts-dir  "_posts"
      hyde-drafts-dir "_drafts"
      hyde-images-dir "images"
      hyde/git/remote "upstream" ; The name of the remote to which we should push
      hyde/git/branch "master"   ; The name of the branch on which your blog resides
      hyde/jekyll-command "jekyll b"    ; Command to build
      hyde/serve-command  "jekyll s -H 0.0.0.0 --force_polling"    ; Command to serve
      hyde-custom-params '(("category" "personal")
                           ("tags" "")
                           ("cover" "false")
                           ("cover-image" "")))
```

# Other
## ついでにデプロイ時にTwitterと連動する

デプロイ（`git push`）時にWerckerをからめてTwitterにメッセージを送信し
てみた。Twitterアンケートが便利そうだなとおもったので試しに実装。

-------------------------------------------------------------------------------

- [ソースコード](https://github.com/nabinno/nabinno.github.io)
