import fs from 'fs';
import { babel } from '@rollup/plugin-babel';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import { terser } from 'rollup-plugin-terser';

const env = process.env.NODE_ENV;
const isProd = env === 'production';
const version = process.env.npm_package_version;
const license = fs.readFileSync('./src/license_header', 'utf8').replace(/VERSION/ig, version);

const config = {
  input: 'src/purify.js',
  external: [],
  output: {
    name: 'DOMPurify',
    globals: {},
    format: 'umd',
    sourcemap: true,
    banner: license,
  },
  plugins: [
    babel({
      // It is recommended to configure this option explicitly (even if with its default value) so an informed decision is taken on how those babel helpers are inserted into the code.
      // Ref: https://github.com/rollup/plugins/tree/master/packages/babel#babelhelpers
      babelHelpers: 'bundled',
      exclude: ['**/node_modules/**'],
    }),
    nodeResolve(),
    replace({
      preventAssignment: true,
      values: {
        'process.env.NODE_ENV': JSON.stringify(env),
        VERSION: `'${version}'`,
      }
    }),
  ],
};

if (isProd) {
  config.plugins.push(terser());
}

module.exports = config;
