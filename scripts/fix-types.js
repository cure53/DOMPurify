// @ts-check

const fs = require('node:fs/promises');
const path = require('node:path');

(async () => {
  // Note that this script is intended to run on the type declaration files that
  // are output by Rolldown, and not the type declaration files generated from TypeScript.
  await fixEsmTypes(path.resolve(__dirname, '../dist/purify.es.d.mts'));
  await fixCjsTypes(path.resolve(__dirname, '../dist/purify.cjs.d.ts'));
})().catch((ex) => {
  console.error(ex);
  process.exitCode = 1;
});

/**
 * Rewrites bundled export statements that use inline `type` modifiers into a
 * plain value export plus a type-only export:
 *
 *   export { type Config, ... };
 *     ->  export type { Config, ... };
 *
 * The inline form requires TypeScript 4.5, so emitting it narrows the range of
 * TypeScript versions that can consume the package - it is what caused the `',' expected` build failures in [cure53/DOMPurify#1118](https://github.com/cure53/DOMPurify/issues/1118).
 * The split form has worked since TypeScript 3.8 and describes exactly the same type surface.
 * @param {string} types
 * @returns {string}
 */
function rewriteInlineTypeExports(types) {
  return types.replace(/^export \{([^}]*)\};$/gm, (statement, specifiers) => {
    const parts = specifiers.split(',').map((s) => s.trim());
    const values = parts.filter((s) => s && !s.startsWith('type '));
    const names = parts
      .filter((s) => s.startsWith('type '))
      .map((s) => s.slice(5));

    if (names.length === 0) return statement;

    return [
      values.length > 0 && `export { ${values.join(', ')} };`,
      `export type { ${names.join(', ')} };`,
    ]
      .filter(Boolean)
      .join('\n');
  });
}

/**
 * Fixes the ES module type declarations file.
 * @param {string} fileName
 */
async function fixEsmTypes(fileName) {
  try {
    const types = await fs.readFile(fileName, { encoding: 'utf-8' });
    await fs.writeFile(fileName, rewriteInlineTypeExports(types));
  } catch (err) {
    console.warn(`Warning: Could not patch ${fileName}. Error: ${err.message}`);
  }
}

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

    // 3. Split any inline `type` export specifiers so older TypeScript versions
    // can still parse the declarations.
    fixed = rewriteInlineTypeExports(fixed);

    // 4. Append the CommonJS-friendly export.
    // This is the "fix" that allows require('dompurify') to work with TS.
    fixed += '\n// @ts-ignore\nexport = _default;\n';

    // 5. Write the file back to the dist folder
    await fs.writeFile(fileName, fixed);
  } catch (err) {
    // We catch the error but don't re-throw it.
    // This ensures 'npm run build' continues even if this step hiccups.
    console.warn(`Warning: Could not patch ${fileName}. Error: ${err.message}`);
  }
}
