const fs = require('fs');
const { DEFAULT_EXTENSIONS } = require('@babel/core');
const babel = require('@rollup/plugin-babel').babel;
const nodeResolve = require('@rollup/plugin-node-resolve').nodeResolve;
const replace = require('@rollup/plugin-replace');
const terser = require('@rollup/plugin-terser');
const typescript = require('rollup-plugin-typescript2');
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
      typescript({
        clean: true,
      }),
      babel({
        // It is recommended to configure this option explicitly (even if with its default value) so an informed decision is taken on how those babel helpers are inserted into the code.
        // Ref: https://github.com/rollup/plugins/tree/master/packages/babel#babelhelpers
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
  {
    input: './dist/types/purify.d.ts',
    output: [
      {
        file: pkg.main.replace(/\.js$/, '.d.ts'),
        format: 'cjs',
        banner: commonOutputConfig.banner,
      },
    ],
    plugins: [dts()],
  },
];

module.exports = config;
