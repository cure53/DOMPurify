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
  try {
    // 1. Read the generated type file
    let types = await fs.readFile(fileName, { encoding: 'utf-8' });

    // 2. Remove the ESM-style default exports.
    // We use Regex to handle the variation your compiler is producing.
    let fixed = types
      .replace(/export default _default;/g, '')
      .replace(/, _default as default/g, '');

    // 3. Append the CommonJS-friendly export.
    // This is the "fix" that allows require('dompurify') to work with TS.
    fixed += '\n// @ts-ignore\nexport = _default;\n';

    // 4. Write the file back to the dist folder
    await fs.writeFile(fileName, fixed);
  } catch (err) {
    // We catch the error but don't re-throw it.
    // This ensures 'npm run build' continues even if this step hiccups.
    console.warn(`Warning: Could not patch ${fileName}. Error: ${err.message}`);
  }
}
