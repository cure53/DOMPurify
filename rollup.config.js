const nodeResolve = require('rollup-plugin-node-resolve');
const babel = require('rollup-plugin-babel');
const replace = require('rollup-plugin-replace');
const uglify = require('rollup-plugin-uglify');
const pkg = require('./package.json');

const env = process.env.NODE_ENV;
const isProd = env === 'production';
const version = process.env.npm_package_version;

const config = {
  entry: pkg.src,
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

if (isProd) {
  config.plugins.push(
    uglify({
      compress: {
        warnings: false,
      },
    })
  );
}

module.exports = config;
