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

// Babel down-levels the source to the browsers listed in `.babelrc`, but Oxc's
// minifier defaults to `esnext` and happily *upgrades* syntax again (`||=`,
// `?.`, ...), which would silently drop the legacy engines the minified bundle
// is expected to run on. Derive the minifier's target from the very same list
// so the two can never drift apart.
const babelTargets = JSON.parse(fs.readFileSync('./.babelrc', 'utf8'))
  .presets[0][1].targets;
const minifyTargets = Object.entries(babelTargets).map(
  ([browser, browserVersion]) => `${browser}${browserVersion}`
);

const commonOutputConfig = {
  name: 'DOMPurify',
  sourcemap: true,
  banner: license,
  exports: 'default',
};

// Rolldown strips TypeScript with oxc *after* the plugin `transform` hooks run,
// so Babel still sees the raw `.ts` source. Handing it `@babel/preset-typescript`
// keeps type stripping and the `.babelrc` browser down-levelling in a single
// pass - the same arrangement the coverage config already relies on.
const babelConfig = {
  babelHelpers: 'bundled',
  exclude: ['**/node_modules/**'],
  extensions: [...DEFAULT_EXTENSIONS, '.ts'],
  presets: ['@babel/preset-typescript'],
};

// `@rollup/plugin-replace` is covered by Rolldown's built-in `transform.define`,
// which rewrites both bare globals (VERSION) and property accessors
// (process.env.NODE_ENV). `JSON.stringify(undefined)` is `undefined`, so fall
// back to the literal the replace plugin used to stringify it into.
const define = {
  'process.env.NODE_ENV': JSON.stringify(env) ?? 'undefined',
  VERSION: `'${version}'`,
};

// The declaration bundles are fed the `.d.ts` files `build:types` already
// emitted, so the plugin only has to bundle them. Rolldown resolves bare
// specifiers through node_modules by default; Rollup left them alone, so keep
// `trusted-types` (and anything else non-relative) an external import instead
// of inlining its global declarations into our own `.d.ts`.
const dtsOptions = { dtsInput: true };
const dtsCommonInputConfig = {
  external: [/^[^.\/]/],
  experimental: { attachDebugInfo: 'none' },
};

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
    file: pkg.browser,
    format: 'umd',
  },
  'umd-min': {
    ...commonOutputConfig,
    file: pkg.production,
    format: 'umd',
    minify: { compress: { target: minifyTargets } },
  },
  es: {
    ...commonOutputConfig,
    file: pkg.module,
    format: 'es',
  },
  cjs: {
    ...commonOutputConfig,
    file: pkg.main,
    format: 'cjs',
  },
};

// `npm run build:umd` and friends want one specific bundle. The CLI's `-f`/`-o`
// flags cannot express that here: they are applied to *every* config in this
// array - including the declaration-only ones below - so all six outputs end up
// overwriting the same file. Selecting the output from the environment instead
// keeps each script building exactly the artifact its name promises.
const target = process.env.DOMPURIFY_BUILD_TARGET;

if (target && !(target in bundleOutputs)) {
  throw new Error(
    `Unknown DOMPURIFY_BUILD_TARGET '${target}'. Expected one of: ${Object.keys(
      bundleOutputs
    ).join(', ')}.`
  );
}

const bundleConfig = {
  input: 'src/purify.ts',
  external: [],
  transform: { define },
  experimental: { attachDebugInfo: 'none' },
  output: target ? [bundleOutputs[target]] : Object.values(bundleOutputs),
  plugins: [babel(babelConfig)],
};

const config = [
  bundleConfig,

  // ESM type declarations
  {
    input: './dist/types/purify.d.ts',
    ...dtsCommonInputConfig,
    output: [
      {
        file: pkg.module.replace(/\.mjs$/, '.d.mts'),
        format: 'es',
        banner: commonOutputConfig.banner,
      },
    ],
    plugins: [dts(dtsOptions)],
  },

  // CJS type declarations with named export stripping
  {
    input: './dist/types/purify.d.ts',
    ...dtsCommonInputConfig,
    output: [
      {
        file: pkg.main.replace(/\.js$/, '.d.ts'),
        format: 'es',
        banner: commonOutputConfig.banner,
      },
    ],
    plugins: [stripNamedTypeExports(), dts(dtsOptions)],
  },
];

module.exports = target ? [bundleConfig] : config;
