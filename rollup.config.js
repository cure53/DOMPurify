const nodeResolve = require('rollup-plugin-node-resolve');
const babel = require('rollup-plugin-babel');
const replace = require('rollup-plugin-replace');
const uglify = require('rollup-plugin-uglify');
const commonjs = require('rollup-plugin-commonjs');
const includePaths = require('rollup-plugin-includepaths');

const env = process.env.NODE_ENV
const version = process.env.npm_package_version

const config = {
  entry: 'src/purify.js',
  external: [],
  globals: {},
  format: 'umd',
  moduleName: 'purify',
  sourceMap: true,
  plugins: [
    nodeResolve(),
    babel({
      exclude: '**/node_modules/**'
    }),
    replace({
      'process.env.NODE_ENV': JSON.stringify(env),
      'VERSION': `'${version}'`,
    })
  ]
}

if (env === 'production' || env === 'test') {
  config.plugins.push(
    uglify({
      compress: {
        warnings: false
      }
    })
  )
}

if (env === 'test') {
  config.plugins.push(
    commonjs(),
    includePaths({
      include: {
        'purify': 'dist/purify.js',
        'purify.min': 'dist/purify.min.js'
      }
    })
  )
}

module.exports = config;
