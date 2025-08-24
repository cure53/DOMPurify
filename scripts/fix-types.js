// @ts-check

const fs = require('node:fs/promises');
const path = require('node:path');

(async () => {
  // Note that this script is intended to run on the type declaration file that is
  // output by Rollup, and not the type declaration file generated from TypeScript.
  await fixCjsTypes(path.resolve(__dirname, '../dist/purify.cjs.d.ts'));
})().catch((ex) => {
  console.error(ex);
  process.exitCode = 1;
});

/**
 * Fixes the CommonJS type declarations file.
 * @param {string} fileName
 */
async function fixCjsTypes(fileName) {
  let types = await fs.readFile(fileName, { encoding: 'utf-8' });

  // DOMPurify is exported as a default export, but rollup changes
  // it to be assigned to `module.exports`. We need to change the
  // type declarations to match what rollup changed it to. Remove
  // the "default" export from the `export { ... }` statement.
  let fixed = types.replace(', _default as default', '');

  // Verify that we actually removed something in case the
  // type declarations are different to what we expected.
  if (fixed === types) {
    throw new Error('Failed to fix CommonJS type declarations.');
  }

  // Append `export = _default;` to match the `module.exports = DOMPurify`
  // statement that Rollup creates. This can cause compilation errors
  // for certain configurations, so add a `@ts-ignore` comment before it.
  fixed += '\n// @ts-ignore\nexport = _default;\n';

  await fs.writeFile(fileName, fixed);
}
