const nodeResolve = require('rollup-plugin-node-resolve');
const babel = require('rollup-plugin-babel');
const replace = require('rollup-plugin-replace');
const uglify = require('rollup-plugin-uglify');
const bundleSize = require('rollup-plugin-bundle-size');

const env = process.env.NODE_ENV;
const version = process.env.npm_package_version;

const config = {
  entry: 'src/purify.js',
  external: [],
  globals: {},
  format: 'umd',
  moduleName: 'DOMPurify',
  sourceMap: true,
  plugins: [
    nodeResolve(),
    babel({
      exclude: '**/node_modules/**',
    }),
    replace({
      'process.env.NODE_ENV': JSON.stringify(env),
      VERSION: `'${version}'`,
    }),
  ],
};

if (env === 'production') {
  config.plugins.push(
    uglify({
      compress: {
        warnings: false,
      },
    })
  );
}

if (env !== 'test') {
  config.plugins.push(bundleSize());
}

module.exports = config;
