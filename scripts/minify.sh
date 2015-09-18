echo "# Ensuring ./dist directory exists..."

mkdir -p foo ./dist

echo "# Minifying purify.js using Uglifyjs2..."

./node_modules/.bin/uglifyjs ./src/purify.js -o ./dist/purify.min.js \
  --mangle --comments --source-map ./dist/purify.min.js.map

echo "# Amending minified assets to HEAD"

git add ./dist/purify.min.js ./dist/purify.min.js.map && git commit --amend --no-verify -C HEAD
