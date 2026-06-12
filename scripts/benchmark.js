/* eslint-disable no-console */
'use strict';

/**
 * DOMPurify micro-benchmark harness.
 *
 * Benchmarks the BUILT library (dist/purify.cjs), not src - run
 * `npm run build` first. Intended workflow for A/B comparisons:
 *
 *   git checkout main && npm run build && npm run bench -- --json > /tmp/a.json
 *   git checkout perf-branch && npm run build && npm run bench -- --json > /tmp/b.json
 *   node scripts/benchmark.js --compare /tmp/a.json /tmp/b.json
 *
 * Fixtures are deterministic (no randomness) so numbers are comparable
 * across runs and machines. All timings are wall-clock medians over
 * --samples iterations after --warmup warmup rounds.
 *
 * CAVEAT: this runs on jsdom. jsdom's cost profile differs from real
 * browsers (innerHTML serialization in particular is relatively
 * expensive in jsdom). Treat results as directional; confirm
 * user-facing wins in real browsers before drawing conclusions.
 */

const { performance } = require('node:perf_hooks');
const fs = require('node:fs');
const path = require('node:path');
const createDOMPurify = require('../dist/purify.cjs');
const { JSDOM } = require('jsdom');

const argv = process.argv.slice(2);
const hasFlag = (f) => argv.includes(f);
const flagValue = (f, dflt) => {
  const i = argv.indexOf(f);
  return i !== -1 && argv[i + 1] !== undefined ? argv[i + 1] : dflt;
};

const WARMUP = Number(flagValue('--warmup', 5));
const SAMPLES = Number(flagValue('--samples', 25));
const ONLY = flagValue('--only', null);

/* ------------------------------------------------------------------ */
/* Compare mode: diff two --json outputs                                */
/* ------------------------------------------------------------------ */

if (hasFlag('--compare')) {
  const i = argv.indexOf('--compare');
  const a = JSON.parse(fs.readFileSync(path.resolve(argv[i + 1]), 'utf8'));
  const b = JSON.parse(fs.readFileSync(path.resolve(argv[i + 2]), 'utf8'));
  const rows = [];
  for (const name of Object.keys(a.results)) {
    if (!b.results[name]) {
      continue;
    }

    const ma = a.results[name].median;
    const mb = b.results[name].median;
    const delta = ((mb - ma) / ma) * 100;
    rows.push({
      scenario: name,
      'A median (ms)': ma.toFixed(3),
      'B median (ms)': mb.toFixed(3),
      'delta %': (delta >= 0 ? '+' : '') + delta.toFixed(1),
    });
  }

  console.log(`A: ${a.meta.label}  (node ${a.meta.node})`);
  console.log(`B: ${b.meta.label}  (node ${b.meta.node})`);
  console.table(rows);
  process.exit(0);
}

/* ------------------------------------------------------------------ */
/* Fixtures - deterministic builders                                    */
/* ------------------------------------------------------------------ */

function deepTree(depth, breadth) {
  // Nested structure exercising the element walk; text-only leaves
  // exercise the SAFE_FOR_XML innerHTML/textContent probes.
  let html = '';
  const open = [];
  const build = (d) => {
    if (d === 0) {
      html += '<p>leaf text node without any markup characters</p>';
      return;
    }

    html += `<div class="level-${d}">`;
    open.push('</div>');
    for (let i = 0; i < breadth; i++) {
      build(d - 1);
    }

    html += open.pop();
  };

  build(depth);
  return html;
}

function wideAttrs(n) {
  // Attribute-heavy flat list: exercises _sanitizeAttributes /
  // _isValidAttribute per-attribute costs.
  let html = '';
  for (let i = 0; i < n; i++) {
    html +=
      `<a id="link-${i}" class="c${i % 7} item" href="https://example.com/p/${i}"` +
      ` title="item ${i}" data-index="${i}" data-group="g${i % 5}"` +
      ` aria-label="open item ${i}" target="_blank" rel="noopener"` +
      ` style="color: rgb(${i % 255}, 0, 0)">item ${i}</a>`;
  }

  return html;
}

function textHeavy(n) {
  // Many text nodes, some carrying template expressions; pair with
  // SAFE_FOR_TEMPLATES to exercise the scrub paths.
  let html = '';
  for (let i = 0; i < n; i++) {
    html +=
      `<p>Paragraph ${i} with plain prose and a mustache {{ user.name${i} }}` +
      ` plus a template literal \${ totals[${i}] } and an erb <%= row${i} %> tail.</p>`;
  }

  return html;
}

function commentHeavy(n) {
  // Comments with and without markup-significant payloads: exercises
  // the SAFE_FOR_XML comment probe.
  let html = '';
  for (let i = 0; i < n; i++) {
    html += `<!-- plain comment number ${i} -->`;
    html += `<span>between ${i}</span>`;
    html += `<!-- tricky <b>payload ${i}</b> -->`;
  }

  return html;
}

function svgMath(n) {
  // Foreign-content blocks: exercises _checkValidNamespace dispatch.
  let html = '';
  for (let i = 0; i < n; i++) {
    html +=
      `<svg viewBox="0 0 10 10"><g><circle cx="5" cy="5" r="${(i % 4) + 1}"/>` +
      `<text x="1" y="9">s${i}</text></g></svg>` +
      `<math><mrow><mi>x</mi><mo>+</mo><mn>${i}</mn></mrow></math>`;
  }

  return html;
}

function dirtyMixed(n) {
  // Realistic dirty input: things to strip, hoist and rewrite.
  let html = '';
  for (let i = 0; i < n; i++) {
    html +=
      `<div onclick="alert(${i})"><script>steal(${i})</script>` +
      `<img src="x" onerror="alert(${i})">` +
      `<a href="javascript:alert(${i})">bad link ${i}</a>` +
      `<unknown-tag-${i % 3}><b>kept ${i}</b></unknown-tag-${i % 3}>` +
      `<p style="position:fixed">text ${i}</p></div>`;
  }

  return html;
}

/* ------------------------------------------------------------------ */
/* Scenarios                                                            */
/* ------------------------------------------------------------------ */

const SCENARIOS = [
  { name: 'deep-tree (default)', html: () => deepTree(6, 3), config: {} },
  { name: 'wide-attrs (default)', html: () => wideAttrs(800), config: {} },
  {
    name: 'text-heavy (SAFE_FOR_TEMPLATES)',
    html: () => textHeavy(800),
    config: { SAFE_FOR_TEMPLATES: true },
  },
  { name: 'text-heavy (default)', html: () => textHeavy(800), config: {} },
  { name: 'comments (default)', html: () => commentHeavy(500), config: {} },
  { name: 'svg-mathml (default)', html: () => svgMath(250), config: {} },
  { name: 'dirty-mixed (default)', html: () => dirtyMixed(300), config: {} },
];

/* ------------------------------------------------------------------ */
/* Runner                                                               */
/* ------------------------------------------------------------------ */

function median(values) {
  const s = [...values].sort((x, y) => x - y);
  const mid = s.length >> 1;
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

function percentile(values, p) {
  const s = [...values].sort((x, y) => x - y);
  return s[Math.min(s.length - 1, Math.floor((p / 100) * s.length))];
}

function run() {
  const results = {};

  for (const scenario of SCENARIOS) {
    if (ONLY && !scenario.name.includes(ONLY)) {
      continue;
    }

    // Fresh window per scenario: bounds jsdom memory growth over the
    // run and keeps scenarios order-independent.
    const { window } = new JSDOM('<!DOCTYPE html><body></body>');
    const DOMPurify = createDOMPurify(window);
    const html = scenario.html();
    let sink = 0; // Defeat dead-code elimination.

    for (let i = 0; i < WARMUP; i++) {
      sink += DOMPurify.sanitize(html, scenario.config).length;
    }

    const times = [];
    for (let i = 0; i < SAMPLES; i++) {
      const t0 = performance.now();
      sink += DOMPurify.sanitize(html, scenario.config).length;
      times.push(performance.now() - t0);
    }

    results[scenario.name] = {
      median: median(times),
      p25: percentile(times, 25),
      p75: percentile(times, 75),
      min: Math.min(...times),
      samples: SAMPLES,
      inputBytes: html.length,
      sink,
    };

    window.close();
  }

  return results;
}

const results = run();
const meta = {
  label: flagValue('--label', 'unlabeled'),
  node: process.version,
  version: createDOMPurify.version,
  warmup: WARMUP,
  samples: SAMPLES,
  date: new Date().toISOString(),
};

if (hasFlag('--json')) {
  console.log(JSON.stringify({ meta, results }, null, 2));
} else {
  console.log(
    `DOMPurify ${meta.version} | node ${meta.node} | ` +
      `${SAMPLES} samples after ${WARMUP} warmup`
  );
  console.table(
    Object.entries(results).map(([name, r]) => ({
      scenario: name,
      'median (ms)': r.median.toFixed(3),
      'p25 (ms)': r.p25.toFixed(3),
      'p75 (ms)': r.p75.toFixed(3),
      'min (ms)': r.min.toFixed(3),
      'input (KB)': (r.inputBytes / 1024).toFixed(0),
    }))
  );
}
