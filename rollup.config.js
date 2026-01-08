const fs = require('fs');
const { DEFAULT_EXTENSIONS } = require('@babel/core');
const babel = require('@rollup/plugin-babel').babel;
const nodeResolve = require('@rollup/plugin-node-resolve').nodeResolve;
const replace = require('@rollup/plugin-replace');
const terser = require('@rollup/plugin-terser');
const typescript = require('@rollup/plugin-typescript');
const { dts } = require('rollup-plugin-dts');
const pkg = require('./package.json');

const env = process.env.NODE_ENV;
const version = process.env.npm_package_version;
const license = fs
  .readFileSync('./src/license_header', 'utf8')
  .replace(/VERSION/gi, version);

const commonOutputConfig = {
  name: 'DOMPurify',
  sourcemap: true,
  banner: license,
  exports: 'default',
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

const config = [
  {
    input: 'src/purify.ts',
    external: [],
    output: [
      {
        ...commonOutputConfig,
        file: pkg.browser,
        format: 'umd',
      },
      {
        ...commonOutputConfig,
        file: pkg.production,
        format: 'umd',
        plugins: [terser()],
      },
      {
        ...commonOutputConfig,
        file: pkg.module,
        format: 'es',
      },
      {
        ...commonOutputConfig,
        file: pkg.main,
        format: 'cjs',
      },
    ],
    plugins: [
      typescript(),
      babel({
        babelHelpers: 'bundled',
        exclude: ['**/node_modules/**'],
        extensions: [...DEFAULT_EXTENSIONS, '.ts'],
      }),
      nodeResolve(),
      replace({
        preventAssignment: true,
        values: {
          'process.env.NODE_ENV': JSON.stringify(env),
          VERSION: `'${version}'`,
        },
      }),
    ],
  },

  // ESM type declarations
  {
    input: './dist/types/purify.d.ts',
    output: [
      {
        file: pkg.module.replace(/\.mjs$/, '.d.mts'),
        format: 'es',
        banner: commonOutputConfig.banner,
      },
    ],
    plugins: [dts()],
  },

  // CJS type declarations with named export stripping
  {
    input: './dist/types/purify.d.ts',
    output: [
      {
        file: pkg.main.replace(/\.js$/, '.d.ts'),
        format: 'cjs',
        banner: commonOutputConfig.banner,
      },
    ],
    plugins: [
      stripNamedTypeExports(),
      dts(),
    ],
  },
];

module.exports = config;