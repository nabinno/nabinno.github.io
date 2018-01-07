---
layout: post
title: "HydeをつかってEmacsをJekyllクライアントにする"
category: F
tags: emacs,jekyll,hyde,github-pages
cover: false
cover-image:
---

# PROBLEM

- タスクメモがAsanaなどのタスク管理ツールに散在している
- ブラウザをつかって文章を書くのがつらい
- Gist/Yagist等でもいいのだけど編集がめんどうとか個人だとオーバースペックとか

-

# SOLUTION

そんなわけで、[Github Pages](https://pages.github.com/)（[Jekyll](https://jekyllrb.com/)）をEmacsで楽に管理できないかと以前から考えていたのだが、いい塩梅のソフトを発見した。Jekyllだから[Hyde](https://github.com/nibrahim/Hyde)という。`jekyll doctor (hyde)`とかぶってるが気にしない。

**Pros**

- `git`の自動コメント
- `jekyll build`、`jekyll serve`のショートカット

**Cons**

- キーバインドが既存のものとかぶる
- `hyde-home`がカスタム変数ではない
- `add-hook`が効かない

## Hydeの設定
下記はConsつぶし。Hyde本体がキーバインドを`defvar`で割り当てているので、`init.el`の設定で`require`前に割り込みevalして、`hyde`関数に`hyde-home`引数をわたせば解決する。あと、折り返し回りは別設定になっているので`adaptive-wrap`や`truncate-lines`を設定とか。

```emacs-lisp
;;; Hyde (Jekyll client)
(require-package 'adaptive-wrap)
(defun hyde/open-post-maybe-into-other-window (pos)
  "Opens the post under cursor in the editor (POS)."
  (interactive "d")
  (let ((post-file-name (nth
                         1
                         (split-string (strip-string (thing-at-point 'line)) " : ")))
        (dir (get-text-property pos 'dir)))
    (let ((hyde-buffer (current-buffer)))
      (find-file-other-window
       (strip-string (concat hyde-home "/" dir "/" post-file-name)))
      (hyde-markdown-activate-mode hyde-buffer)
      (adaptive-wrap-prefix-mode t)
      (set-default 'truncate-lines nil))))
(defun hyde/quit-wrap ()
  "Quits hyde."
  (interactive)
  (progn
    (delete-other-windows)
    (kill-buffer (current-buffer))))
(defun create-markdown-scratch ()
  "Create a markdown scratch buffer."
  (interactive)
  (switch-to-buffer (get-buffer-create "*markdown*"))
  (markdown-mode))
(defun hyde/nabinno ()
  "Run hyde-wrap with home parameter."
  (interactive)
  (progn
    (delete-other-windows)
    (create-markdown-scratch)
    (split-window-horizontally)
    (other-window 1)
    (hyde "~/nabinno.github.io/")))
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
    (define-key hyde-mode-map (kbd "X") 'hyde/quit-wrap)
    (define-key hyde-mode-map (kbd "O") 'hyde/open-post-maybe-into-other-window)
    hyde-mode-map)
  "Keymap for Hyde")
(global-set-key (kbd "C-c ; j") 'hyde/nabinno)
(require-package 'hyde)
(require 'hyde)
```

Jekyllのルートにおく`.hyde.el`の中身はこんな感じ。JekyllはWebrickを使っているので、VMなどでホストをいじっている場合は`hyde/serve-command`にホストIPを0.0.0.0（`jekyll s -H 0.0.0.0`）に変更する必要がある。

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

-

以上
