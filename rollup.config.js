const nodeResolve = require("rollup-plugin-node-resolve");
const babel = require("rollup-plugin-babel");
const replace = require("rollup-plugin-replace");
const uglify = require("rollup-plugin-uglify");
const fs = require("fs");

const env = process.env.NODE_ENV;
const isProd = env === "production";
const version = process.env.npm_package_version;

const config = {
  input: "src/purify.js",
  external: [],
  output: {
    name: "DOMPurify",
    globals: {},
    format: "umd",
    sourcemap: true,
    banner: fs.readFileSync("./src/license_header")
  },
  plugins: [
    nodeResolve(),
    babel({
      plugins: ['external-helpers'],
      exclude: "**/node_modules/**"
    }),
    replace({
      "process.env.NODE_ENV": JSON.stringify(env),
      VERSION: `'${version}'`
    })
  ]
};

if (isProd) {
  config.plugins.push(
    uglify({
      warnings: false,
      output: {
        comments: 'some'
      }
    })
  );
}

module.exports = config;
