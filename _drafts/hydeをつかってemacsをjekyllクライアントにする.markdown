---
layout: post
title: "HydeをつかってEmacsをJekyllクライアントにする"
category: emacs
tags: emacs,jekyll,hyde,github-pages
cover: false
cover-image:
---

Github Pages（[Jekyll](https://jekyllrb.com/)）をEmacsで楽に管理できな
いかと以前から考えていたのだが、いい塩梅のソフトを発見した。Jekyllだか
らHyde。

例の設定は`defvar`つかっているので、`require`前にevalしてる。自分の
`view-mode`のカスタマイズキーバインドとかぶっているのはいつものこと。

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
(require-package 'hyde)
(require 'hyde)
(defun hyde-nabinno ()
  "Run hyde with home parameter."
  (interactive)
  (hyde "~/nabinno.github.io/"))
(global-set-key (kbd "C-c ; j") 'hyde-nabinno)
```

`git`の自動コメント、`jekyll build`、`jekyll serve`あたりのコマンドが便利。

しばらくこれで運用してみる。
