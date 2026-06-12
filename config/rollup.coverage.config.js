// Coverage-only rollup config. Builds an istanbul-instrumented CJS bundle so the
// jsdom test run records line/branch coverage mapped to the original src/*.ts.
//
// Important: TypeScript stripping and istanbul instrumentation happen in a SINGLE
// babel pass (via @babel/preset-typescript), not as two separate transforms. A
// two-pass setup (rollup-plugin-typescript then babel) makes istanbul record
// positions against the already-transpiled JS, so the report points at the wrong
// lines. With one pass, babel keeps the original source positions and coverage
// maps exactly onto the .ts files.
//
// This config is not used by the normal build or any workflow; it is driven only
// by the local `npm run coverage` script.
const fs = require('fs');
const path = require('path');
const { DEFAULT_EXTENSIONS } = require('@babel/core');
const babel = require('@rollup/plugin-babel').babel;
const replace = require('@rollup/plugin-replace');

// Resolve the source's `.js` import specifiers (e.g. './tags.js') to their real
// `.ts` files, a job the TypeScript plugin would normally do.
const resolveTsAsJs = () => ({
  name: 'resolve-ts-as-js',
  resolveId(source, importer) {
    if (importer && source.startsWith('.') && source.endsWith('.js')) {
      const candidate = path.resolve(
        path.dirname(importer),
        source.slice(0, -3) + '.ts'
      );
      if (fs.existsSync(candidate)) {
        return candidate;
      }
    }
    return null;
  },
});

module.exports = {
  input: 'src/purify.ts',
  output: {
    file: 'dist/purify.cov.cjs.js',
    format: 'cjs',
    name: 'DOMPurify',
    exports: 'default',
    sourcemap: true,
  },
  plugins: [
    resolveTsAsJs(),
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
    replace({
      preventAssignment: true,
      values: {
        'process.env.NODE_ENV': JSON.stringify('test'),
        VERSION: "'coverage'",
      },
    }),
  ],
};
