;;; dot-hyde --- Hyde configuration file
;;; Commentary:
;;; Code:

(setq hyde-home       "~/nabinno.github.io"
      hyde-deploy-dir "_site"
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


(provide '.hyde)
;;; .hyde.el ends here
