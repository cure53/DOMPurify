// Coverage-only rolldown config. Builds an istanbul-instrumented CJS bundle so
// the jsdom test run records line/branch coverage mapped to the original
// src/*.ts.
//
// Important: TypeScript stripping and istanbul instrumentation happen in a
// SINGLE babel pass (via @babel/preset-typescript), not as two separate
// transforms. A two-pass setup (a TypeScript transform then babel) makes
// istanbul record positions against the already-transpiled JS, so the report
// points at the wrong lines. With one pass, babel keeps the original source
// positions and coverage maps exactly onto the .ts files. Rolldown's own oxc
// pass only reprints what babel already instrumented, so the recorded
// positions are unaffected.
//
// This config is not used by the normal build or any workflow; it is driven
// only by the local `npm run coverage` script.
const { DEFAULT_EXTENSIONS } = require('@babel/core');
const babel = require('@rollup/plugin-babel').babel;

module.exports = {
  input: 'src/purify.ts',
  // Rolldown resolves the source's `.js` import specifiers (e.g. './tags.js')
  // to their real `.ts` files on its own, so no resolver plugin is needed here.
  transform: {
    define: {
      'process.env.NODE_ENV': JSON.stringify('test'),
      VERSION: "'coverage'",
    },
  },
  experimental: { attachDebugInfo: 'none' },
  output: {
    file: 'dist/purify.cov.cjs.js',
    format: 'cjs',
    name: 'DOMPurify',
    exports: 'default',
    sourcemap: true,
  },
  plugins: [
    babel({
      babelHelpers: 'bundled',
      babelrc: false,
      configFile: false,
      extensions: [...DEFAULT_EXTENSIONS, '.ts'],
      presets: [
        ['@babel/preset-env', { targets: { node: 'current' }, modules: false }],
        '@babel/preset-typescript',
      ],
      plugins: ['istanbul'],
    }),
  ],
};
