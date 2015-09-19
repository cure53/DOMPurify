echo "# Amending minified assets to HEAD"

git add ./dist/purify.min.js ./dist/purify.min.js.map && git commit --amend --no-verify -C HEAD
