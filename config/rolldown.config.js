const fs = require('fs');
const { DEFAULT_EXTENSIONS } = require('@babel/core');
const babel = require('@rollup/plugin-babel').babel;
const { dts } = require('rolldown-plugin-dts');
const pkg = require('../package.json');

const env = process.env.NODE_ENV;
const version = process.env.npm_package_version;
const license = fs
  .readFileSync('./src/license_header', 'utf8')
  .replace(/VERSION/gi, version);

const experimental = { attachDebugInfo: 'none' };

const commonOutputConfig = {
  name: 'DOMPurify',
  sourcemap: true,
  banner: license,
  exports: 'default',
  sourcemapExcludeSources: true,
};

// The source is ESM, so it has always executed in strict mode, and Rollup put
// `'use strict'` inside the format wrapper of every non-ESM bundle to keep it
// that way. Rolldown's `transform.target` equivalent here is `output.strict`,
// but that hoists the directive *above* the UMD wrapper, making the whole
// script strict and leaking that to anything concatenated after it. `intro`
const useStrict = { intro: "'use strict';" };

// 🔧 Plugin to strip named type exports from .d.ts for CommonJS
const stripNamedTypeExports = () => ({
  name: 'strip-named-type-exports',
  transform(code, id) {
    if (id.endsWith('.d.ts')) {
      return {
        code: code.replace(/^export\s+\{\s*type[\s\S]+?^\};\s*$/gm, ''),
        map: null,
      };
    }
  },
});

const bundleOutputs = {
  umd: {
    ...commonOutputConfig,
    ...useStrict,
    file: pkg.browser,
    format: 'umd',
  },
  'umd-min': {
    ...commonOutputConfig,
    ...useStrict,
    file: pkg.production,
    format: 'umd',
    // Oxc's minifier defaults to `esnext` and would re-introduce `||=` / `?.`
    // into code Babel already down-levelled for the `.babelrc` browsers.
    minify: { compress: { target: 'es2015' } },
  },
  es: { ...commonOutputConfig, file: pkg.module, format: 'es' },
  cjs: { ...commonOutputConfig, ...useStrict, file: pkg.main, format: 'cjs' },
};

const target = process.env.DOMPURIFY_BUILD_TARGET;

if (target && !bundleOutputs[target]) {
  throw new Error(`Unknown DOMPURIFY_BUILD_TARGET: ${target}`);
}

const bundle = {
  input: 'src/purify.ts',
  external: [],
  experimental,
  plugins: [
    babel({
      babelHelpers: 'bundled',
      exclude: ['**/node_modules/**'],
      extensions: [...DEFAULT_EXTENSIONS, '.ts'],
      presets: ['@babel/preset-typescript'],
    }),
  ],
  transform: {
    define: {
      'process.env.NODE_ENV': JSON.stringify(env) ?? 'undefined',
      VERSION: `'${version}'`,
    },
  },
  output: target ? [bundleOutputs[target]] : Object.values(bundleOutputs),
};

const declarations = (file, plugins = []) => ({
  input: './dist/types/purify.d.ts',
  external: [/^[^.\/]/],
  experimental,
  output: [{ file, format: 'es', banner: license }],
  plugins: [...plugins, dts({ dtsInput: true })],
});

module.exports = target
  ? [bundle]
  : [
      bundle,
      // ESM type declarations
      declarations(pkg.module.replace(/\.mjs$/, '.d.mts')),
      // CJS type declarations with named export stripping
      declarations(pkg.main.replace(/\.js$/, '.d.ts'), [
        stripNamedTypeExports(),
      ]),
    ];
