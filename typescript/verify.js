// @ts-check

const fs = require('node:fs/promises');
const path = require('node:path');
const ts = require('typescript');
const { exec } = require('child_process');

run().catch((ex) => {
  console.error(ex);
  process.exitCode = 1;
});

async function run() {
  // Install node modules so that `dompurify` can be resolved.
  process.stdout.write(`\x1b[30mInstalling node modules...\x1b[0m\n`);

  await new Promise((resolve, reject) => {
    exec('npm install --no-package-lock', { cwd: __dirname }, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve(undefined);
      }
    });
  });

  process.stdout.write('\n');

  let projects = await fs.readdir(__dirname, { withFileTypes: true });

  for (let project of projects
    .filter((x) => x.isDirectory())
    .filter((x) => x.name !== 'node_modules')
    .sort((a, b) => a.name.localeCompare(b.name))) {
    await verify(project.name, path.join(__dirname, project.name));
  }
}

/**
 * Verifies that a TypeScript project compiles.
 * @param {string} name The name of the project.
 * @param {string} directory The project directory.
 * @returns {Promise<void>}
 */
async function verify(name, directory) {
  let line = `  ${name}...`;
  process.stdout.write(line);

  let diagnostics = await compile(path.join(directory, 'tsconfig.json'));
  let success = diagnostics.length === 0;
  let report = `\x1b${success ? '[32m✔' : '[31mX'}\x1b[0m`;

  if (process.stdout.isTTY) {
    process.stdout.write(`\x1b[${line.length}D${report} ${name}   \n`);
  } else {
    process.stdout.write(` ${report}\n`);
  }

  if (!success) {
    printDiagnostics(diagnostics);
    process.exitCode = 1;
  }
}

/**
 * Compiles a TypeScript project.
 * @param {string} configFileName The file name of the TypeScript config file.
 * @returns {Promise<ts.Diagnostic[]>} The diagnostics produced.
 */
async function compile(configFileName) {
  let jsonParseResult = ts.parseConfigFileTextToJson(
    configFileName,
    await fs.readFile(configFileName, { encoding: 'utf8' })
  );

  if (!jsonParseResult.config && jsonParseResult.error) {
    return [jsonParseResult.error];
  }

  let config = ts.parseJsonConfigFileContent(
    jsonParseResult.config,
    ts.sys,
    path.dirname(configFileName)
  );
  if (config.errors.length > 0) {
    return config.errors;
  }

  let program = ts.createProgram(config.fileNames, config.options);
  let emitResult = program.emit(
    undefined,
    // Do not emit anything.
    () => undefined
  );

  return ts.getPreEmitDiagnostics(program).concat(emitResult.diagnostics);
}

/**
 * Prints the diagnostics to stdout.
 * @param {ts.Diagnostic[]} diagnostics The diagnostics to report.
 */
function printDiagnostics(diagnostics) {
  diagnostics.forEach((diagnostic) => {
    let message = '';

    if (diagnostic.file && diagnostic.start) {
      let start = diagnostic.file.getLineAndCharacterOfPosition(
        diagnostic.start
      );

      message += ` ${diagnostic.file.fileName} (${start.line + 1},${
        start.character + 1
      })`;
    }

    message +=
      ': ' + ts.flattenDiagnosticMessageText(diagnostic.messageText, '    \n');

    process.stdout.write(`\x1b[30m    ${message}\x1b[0m\n`);
  });
}
