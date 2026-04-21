'use strict';

const assert = require('node:assert/strict');
const fc = require('fast-check');
const { JSDOM } = require('jsdom');
const createDOMPurify = require('../../dist/purify.cjs.js');

const FUZZ_RUNS = Number(process.env.FUZZ_RUNS || 300);

function withDOMPurify(fn) {
  const window = new JSDOM('').window;
  try {
    const DOMPurify = createDOMPurify(window);
    return fn(DOMPurify);
  } finally {
    window.close();
  }
}

const seedPayloads = [
  '',
  'hello',
  '<b>hello</b>',
  '<img src=x onerror=alert(1)>',
  '<svg><g/onload=alert(2)//<p>',
  '<math><mi//xlink:href="data:x,<script>alert(4)</script>">',
  '<TABLE><tr><td>HELLO</tr></TABL>',
  '<a href="javascript:alert(1)">x</a>',
  '<p>abc<iframe//src=jAva&Tab;script:alert(3)>def</p>',
  // ---- id/name attribute seeds: exercise SANITIZE_NAMED_PROPS paths ----
  '<div id="foo">hi</div>',
  '<a name="bar">hi</a>',
  '<div id="user-content-foo">hi</div>',
  '<a name="user-content-bar">hi</a>',
  '<form id="x"><input id="y"></form>',
  '<div id="">hi</div>',
  // ---- reserved custom-element names (per HTML spec) ----
  '<annotation-xml encoding="text/html" onclick="alert(1)">x</annotation-xml>',
  '<font-face onclick="alert(1)">x</font-face>',
  '<color-profile onclick="alert(1)">x</color-profile>',
  '<missing-glyph onclick="alert(1)">x</missing-glyph>',
  // ---- mXSS / parse-differential classics ----
  '<noscript><p title="</noscript><img src=x onerror=alert(1)>"></p>',
  '<style><style><img src=x onerror=alert(1)></style></style>',
  '<template><img src=x onerror=alert(1)></template>',
  '<svg><a><text>x</text><animate attributeName=href values=javascript:alert(1) begin=0s /></a></svg>',
  '<math><mtext><mglyph><style><!--</style><img src onerror=alert(1)>',
  '<svg><foreignObject><img src=x onerror=alert(1)></foreignObject></svg>',
  // ---- URL scheme tricks ----
  '<a href=" javascript:alert(1)">x</a>',
  '<a href="java\tscript:alert(1)">x</a>',
  '<a href="\0javascript:alert(1)">x</a>',
  '<a href="&#106;avascript:alert(1)">x</a>',
];

const primitiveDirtyArb = fc.oneof(
  fc.string(),
  fc.integer(),
  fc.double({ noNaN: false, noDefaultInfinity: false }),
  fc.boolean(),
  fc.constant(null),
  fc.constant(undefined)
);

const objectDirtyArb = fc.oneof(
  fc.array(fc.oneof(fc.string(), fc.integer(), fc.boolean(), fc.constant(null)), {
    maxLength: 10,
  }),
  fc.dictionary(fc.string(), fc.oneof(fc.string(), fc.integer(), fc.boolean(), fc.constant(null)), {
    maxKeys: 10,
  })
);

const dirtyArb = fc.oneof(
  fc.constantFrom(...seedPayloads),
  primitiveDirtyArb,
  objectDirtyArb
);

const dirtyForInvariantArb = fc.oneof(
  fc.constantFrom(...seedPayloads),
  fc.string()
);

const configObjectArb = fc.record(
  {
    SAFE_FOR_TEMPLATES: fc.boolean(),
    SAFE_FOR_XML: fc.boolean(),
    ALLOW_ARIA_ATTR: fc.boolean(),
    ALLOW_DATA_ATTR: fc.boolean(),
    ALLOW_UNKNOWN_PROTOCOLS: fc.boolean(),
    WHOLE_DOCUMENT: fc.boolean(),
    FORCE_BODY: fc.boolean(),
    KEEP_CONTENT: fc.boolean(),
    SANITIZE_DOM: fc.boolean(),
    SANITIZE_NAMED_PROPS: fc.boolean(),
    RETURN_TRUSTED_TYPE: fc.boolean(),
    RETURN_DOM: fc.boolean(),
    RETURN_DOM_FRAGMENT: fc.boolean(),
    PARSER_MEDIA_TYPE: fc.constantFrom('text/html', 'application/xhtml+xml'),
    ALLOWED_TAGS: fc.array(fc.string(), { maxLength: 8 }),
    ALLOWED_ATTR: fc.array(fc.string(), { maxLength: 8 }),
    FORBID_TAGS: fc.array(fc.string(), { maxLength: 8 }),
    FORBID_ATTR: fc.array(fc.string(), { maxLength: 8 }),
    ADD_TAGS: fc.array(fc.string(), { maxLength: 8 }),
    ADD_ATTR: fc.array(fc.string(), { maxLength: 8 }),
    ADD_DATA_URI_TAGS: fc.array(fc.string(), { maxLength: 8 }),
    ADD_URI_SAFE_ATTR: fc.array(fc.string(), { maxLength: 8 }),
  },
  { withDeletedKeys: true }
);

const idempotentConfigArb = fc.record(
  {
    SAFE_FOR_TEMPLATES: fc.boolean(),
    SAFE_FOR_XML: fc.boolean(),
    ALLOW_ARIA_ATTR: fc.boolean(),
    ALLOW_DATA_ATTR: fc.boolean(),
    ALLOW_UNKNOWN_PROTOCOLS: fc.boolean(),
    FORCE_BODY: fc.boolean(),
    KEEP_CONTENT: fc.boolean(),
    SANITIZE_DOM: fc.boolean(),
    SANITIZE_NAMED_PROPS: fc.boolean(),
    ALLOWED_TAGS: fc.array(fc.string(), { maxLength: 8 }),
    ALLOWED_ATTR: fc.array(fc.string(), { maxLength: 8 }),
    FORBID_TAGS: fc.array(fc.string(), { maxLength: 8 }),
    FORBID_ATTR: fc.array(fc.string(), { maxLength: 8 }),
    ADD_TAGS: fc.array(fc.string(), { maxLength: 8 }),
    ADD_ATTR: fc.array(fc.string(), { maxLength: 8 }),
    ADD_DATA_URI_TAGS: fc.array(fc.string(), { maxLength: 8 }),
    ADD_URI_SAFE_ATTR: fc.array(fc.string(), { maxLength: 8 }),
  },
  { withDeletedKeys: true }
);

const weirdValueArb = fc.oneof(
  fc.constant(null),
  fc.constant(undefined),
  fc.boolean(),
  fc.integer(),
  fc.double({ noNaN: false, noDefaultInfinity: false }),
  fc.bigInt(),
  fc.string(),
  fc.array(fc.oneof(fc.string(), fc.integer(), fc.boolean(), fc.constant(null)), {
    maxLength: 8,
  }),
  fc.dictionary(
    fc.string(),
    fc.oneof(fc.string(), fc.integer(), fc.boolean(), fc.constant(null)),
    { maxKeys: 8 }
  ),
  fc.constant(new Date(0)),
  fc.constant(new Date('invalid')),
  fc.constant(/x/i),
  fc.constant(/javascript:/i),
  fc.constant([]),
  fc.constant({}),
  fc.constant(Object.create(null))
);

const weirdTypedConfigArb = fc.record(
  {
    SAFE_FOR_TEMPLATES: weirdValueArb,
    SAFE_FOR_XML: weirdValueArb,
    ALLOW_ARIA_ATTR: weirdValueArb,
    ALLOW_DATA_ATTR: weirdValueArb,
    ALLOW_UNKNOWN_PROTOCOLS: weirdValueArb,
    WHOLE_DOCUMENT: weirdValueArb,
    FORCE_BODY: weirdValueArb,
    KEEP_CONTENT: weirdValueArb,
    SANITIZE_DOM: weirdValueArb,
    SANITIZE_NAMED_PROPS: weirdValueArb,
    RETURN_TRUSTED_TYPE: weirdValueArb,
    RETURN_DOM: weirdValueArb,
    RETURN_DOM_FRAGMENT: weirdValueArb,
    PARSER_MEDIA_TYPE: weirdValueArb,
    ALLOWED_TAGS: weirdValueArb,
    ALLOWED_ATTR: weirdValueArb,
    FORBID_TAGS: weirdValueArb,
    FORBID_ATTR: weirdValueArb,
    ADD_TAGS: weirdValueArb,
    ADD_ATTR: weirdValueArb,
    ADD_DATA_URI_TAGS: weirdValueArb,
    ADD_URI_SAFE_ATTR: weirdValueArb,
    ALLOWED_URI_REGEXP: weirdValueArb,
  },
  { withDeletedKeys: true }
);

const configArb = fc.oneof(
  fc.constant(undefined),
  fc.constant(null),
  fc.boolean(),
  fc.integer(),
  fc.double({ noNaN: false, noDefaultInfinity: false }),
  fc.string(),
  fc.array(fc.oneof(fc.string(), fc.integer(), fc.boolean(), fc.constant(null)), {
    maxLength: 10,
  }),
  fc.dictionary(fc.string(), fc.oneof(fc.string(), fc.integer(), fc.boolean(), fc.constant(null)), {
    maxKeys: 10,
  }),
  configObjectArb
);

console.log(`Property 1: random dirty + random config should either return or throw a normal exception.`);
fc.assert(
  fc.property(dirtyArb, configArb, (dirty, config) => {
    withDOMPurify((DOMPurify) => {
      try {
        DOMPurify.sanitize(dirty, config);
      } catch (err) {
        assert.ok(
          err instanceof Error ||
            Object.prototype.toString.call(err) === '[object DOMException]',
          `Unexpected thrown value: ${String(err)}`
        );
      }
    });
  }),
  {
    numRuns: FUZZ_RUNS,
    verbose: true,
  }
);

console.log(`Property 2: for ordinary fragment-style string-output configs, sanitization should be idempotent.`);
fc.assert(
  fc.property(dirtyForInvariantArb, idempotentConfigArb, (dirty, config) => {
    withDOMPurify((DOMPurify) => {
      const once = DOMPurify.sanitize(dirty, config);
      const twice = DOMPurify.sanitize(once, config);

      assert.equal(typeof once, 'string');
      assert.equal(once, twice);
    });
  }),
  {
    numRuns: FUZZ_RUNS,
    verbose: true,
  }
);

console.log(`Property 3: weirdly typed values for real config keys should not crash the process.`);
fc.assert(
  fc.property(dirtyArb, weirdTypedConfigArb, (dirty, config) => {
	withDOMPurify((DOMPurify) => {
      try {
        DOMPurify.sanitize(dirty, config);
      } catch (err) {
        assert.ok(
          err instanceof Error ||
            Object.prototype.toString.call(err) === '[object DOMException]',
          `Unexpected thrown value: ${String(err)}`
        );
      }
    });
  }),
  {
    numRuns: FUZZ_RUNS,
    verbose: true,
  }
);

// -------------------------------------------------------------------------
// Property 4: XSS invariants under the default config.
//
// For arbitrary input sanitized with the default (safe) configuration, the
// output string must not contain markers that indicate executable content:
// an actual <script> tag, an on* event-handler attribute, or a javascript:
// / vbscript: / data:text/html URL in attribute position. Regexes are
// written to match raw output syntax only — they do NOT match entity-
// encoded text like `&lt;script` or text-node occurrences of the word
// "javascript:".
//
// This property intentionally runs against the default config only (Option
// A from the April 2026 review), because several legitimate configurations
// (ADD_TAGS: ['script'], ADD_ATTR: ['onclick'], etc.) explicitly allow the
// very markers we're asserting against. A per-config safety classifier
// would itself be logic that has to stay correct; the default config is
// the tightest test bed and also the one that matters most for real-world
// use.
// -------------------------------------------------------------------------
const XSS_INVARIANTS = [
  { name: 'script-open-tag',       re: /<script[\s>\/]/i },
  { name: 'script-close-tag',      re: /<\/script/i },
  { name: 'onhandler-attribute',   re: /\son[a-z]+\s*=/i },
  { name: 'javascript-url-attr',   re: /=\s*["']?\s*javascript:/i },
  { name: 'vbscript-url-attr',     re: /=\s*["']?\s*vbscript:/i },
  { name: 'data-html-url-attr',    re: /=\s*["']?\s*data:text\/html/i },
];

function assertXssInvariants(output, dirty) {
  if (typeof output !== 'string') return;
  for (const inv of XSS_INVARIANTS) {
    assert.ok(
      !inv.re.test(output),
      `XSS invariant "${inv.name}" violated.\n  input:  ${JSON.stringify(dirty)}\n  output: ${JSON.stringify(output)}`
    );
  }
}

console.log(`Property 4: default-config output must satisfy XSS invariants (no <script>, no on*=, no javascript: URLs).`);
fc.assert(
  fc.property(dirtyForInvariantArb, (dirty) => {
    withDOMPurify((DOMPurify) => {
      const output = DOMPurify.sanitize(dirty);
      assertXssInvariants(output, dirty);
    });
  }),
  {
    numRuns: FUZZ_RUNS,
    verbose: true,
  }
);

// -------------------------------------------------------------------------
// Property 5: idempotence across a richer input corpus.
//
// The existing property 2 asserts sanitize(sanitize(x)) === sanitize(x),
// but its input generator (fc.string() + seedPayloads) rarely produces
// HTML with attributes like id= or name= that exercise attribute-
// transforming options such as SANITIZE_NAMED_PROPS. This property uses
// the expanded seedPayloads (which include id/name/reserved-name cases)
// and explicitly runs with SANITIZE_NAMED_PROPS enabled so a regression
// in that transform is caught automatically.
// -------------------------------------------------------------------------
console.log(`Property 5: idempotence holds with SANITIZE_NAMED_PROPS enabled on id/name-bearing inputs.`);
fc.assert(
  fc.property(fc.constantFrom(...seedPayloads), (dirty) => {
    withDOMPurify((DOMPurify) => {
      const cfg = { SANITIZE_NAMED_PROPS: true };
      const once = DOMPurify.sanitize(dirty, cfg);
      const twice = DOMPurify.sanitize(once, cfg);
      assert.equal(typeof once, 'string');
      assert.equal(once, twice, `non-idempotent for input ${JSON.stringify(dirty)}`);
    });
  }),
  {
    numRuns: FUZZ_RUNS,
    verbose: true,
  }
);

// -------------------------------------------------------------------------
// Negative control: prove the XSS invariant actually fires.
//
// If we write an assertion and it never goes red, we've written an
// assertion that doesn't work. This block feeds known-executable markup
// through a DELIBERATELY-unsafe config that bypasses sanitization, and
// asserts that the XSS invariant check DOES detect the violation. If this
// assertion stops throwing, it means the invariant regexes have been
// weakened or the sanitizer has started escaping output in a way that
// defeats the check — either way, property 4's signal is gone and this
// file has a bug.
// -------------------------------------------------------------------------
console.log(`Negative Control: XSS invariant must detect a deliberately-unsafe output.`);
(function assertNegativeControl() {
  const obviouslyBad = '<img src=x onerror=alert(1)>';
  let caught = false;
  try {
    // ADD_ATTR lets onerror through; this is the exact shape we want
    // property 4 to catch in normal operation.
    withDOMPurify((DOMPurify) => {
      const output = DOMPurify.sanitize(obviouslyBad, { ADD_ATTR: ['onerror'] });
      assertXssInvariants(output, obviouslyBad);
    });
  } catch (err) {
    caught = err instanceof assert.AssertionError;
  }
  assert.ok(
    caught,
    'Negative control failed: XSS invariant did not fire for onerror-in-output. ' +
    'Either the regexes are broken or sanitizer output is now escaped in a way that defeats them.'
  );
})();

console.log(`\nsanitize() fuzzing passed with ${FUZZ_RUNS} runs per property`);