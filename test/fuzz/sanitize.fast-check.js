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

// Property 1: random dirty + random config should either return or throw a normal exception.
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

// Property 2: for ordinary fragment-style string-output configs, sanitization should be idempotent.
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

console.log(`sanitize() fuzzing passed with ${FUZZ_RUNS} runs per property`);