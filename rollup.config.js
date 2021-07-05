const nodeResolve = require('rollup-plugin-node-resolve');
const babel = require('rollup-plugin-babel');
const replace = require('rollup-plugin-replace');
const { terser } = require('rollup-plugin-terser');
const fs = require('fs');

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
    nodeResolve(),
    babel({
      exclude: ['**/node_modules/**'],
    }),
    replace({
      'process.env.NODE_ENV': JSON.stringify(env),
      VERSION: `'${version}'`,
    }),
  ],
};

if (isProd) {
  config.plugins.push(terser());
}

module.exports = config;
