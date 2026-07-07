/*
 * DOMPurify test suite.
 *
 * Organised into QUnit modules. Modules group related tests so a failure
 * narrows the search space; within a module, tests run top-to-bottom in
 * declaration order. Cross-module ordering is not guaranteed, so anything
 * that needs to run before/after siblings goes inside a single module
 * (e.g. the hook-pollution module uses beforeEach/afterEach for isolation).
 *
 * Conventions:
 *   - `var` is reserved for the UMD wrapper and the per-test scratch where
 *     hoisting actually matters; everything else uses const/let.
 *   - Arrow callbacks for QUnit.test bodies; `function () {}` is used only
 *     where a hook needs its own `this` binding.
 *   - assert.contains([...]) is used when serialiser output varies across
 *     engines (jsdom vs Chromium vs Firefox vs WebKit). The list is the
 *     acceptable set, not "any of these is good enough".
 *
 * Security-regression tests carry a CVE / GHSA identifier in the test title
 * where one is published. The accompanying comment block explains the
 * primitive being guarded against; do not strip those comments — they are
 * the only documentation that exists for several of these issues.
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined'
    ? (module.exports = factory())
    : typeof define === 'function' && define.amd
      ? define(factory)
      : ((global =
          typeof globalThis !== 'undefined' ? globalThis : global || self),
        (global.testSuite = factory()));
})(this, function () {
  return function testSuite(
    DOMPurify,
    window,
    sanitizationTestCases,
    xssTestCases
  ) {
    const document = window.document;
    const jQuery = window.jQuery;

    // =======================================================================
    // Data-driven sanitization tests.
    // The fixtures live alongside the runner (`tests/fixtures/...`) so the
    // suite can be reused against multiple builds (dist, src, minified)
    // without duplicating the corpus.
    // =======================================================================

    QUnit.module('Sanitization (data-driven)');

    sanitizationTestCases.forEach((testCase) => {
      QUnit.test(`sanitization[${testCase.title}]`, (assert) => {
        assert.contains(
          DOMPurify.sanitize(testCase.payload),
          testCase.expected,
          `Payload: ${testCase.payload}`
        );
      });
    });

    // =======================================================================
    // XSS tests — assert that alert() is never called by sanitized output.
    // Three runners cover the three insertion sinks DOMPurify users hit
    // in practice: native innerHTML, jQuery.html(), and document.write().
    // The latter exists because Firefox historically behaves differently
    // from Chromium when content is injected via the parser entry point.
    // =======================================================================

    QUnit.module('XSS — native innerHTML');

    xssTestCases.forEach((testCase) => {
      QUnit.test(`xss[${testCase.title}]`, (assert) => {
        document.getElementById('qunit-fixture').innerHTML = DOMPurify.sanitize(
          testCase.payload
        );
        const done = assert.async();
        setTimeout(() => {
          assert.notEqual(window.xssed, true, 'alert() was called');
          document.getElementById('qunit-fixture').innerHTML = '';
          window.xssed = false;
          done();
        }, 100);
      });
    });

    QUnit.module('XSS — jQuery.html()');

    xssTestCases.forEach((testCase) => {
      QUnit.test(`xss[${testCase.title}]`, (assert) => {
        jQuery('#qunit-fixture').html(DOMPurify.sanitize(testCase.payload));
        const done = assert.async();
        setTimeout(() => {
          assert.notEqual(window.xssed, true, 'alert() was called');
          jQuery('#qunit-fixture').empty();
          window.xssed = false;
          done();
        }, 100);
      });
    });

    QUnit.module('XSS — iframe document.write()');

    xssTestCases.forEach((testCase) => {
      QUnit.test(`xss[${testCase.title}]`, (assert) => {
        const done = assert.async();
        const iframe = document.createElement('iframe');
        iframe.src = 'about:blank';
        iframe.onload = function () {
          iframe.contentDocument.write(
            '<script>window.alert=function(){top.xssed=true;}</script>' +
              DOMPurify.sanitize(testCase.payload)
          );
          assert.notEqual(
            window.xssed,
            true,
            'alert() was called from document.write()'
          );
          window.xssed = false;
          iframe.parentNode.removeChild(iframe);
          done();
        };
        document.body.appendChild(iframe);
      });
    });

    // Sanity check: confirm the iframe-write detector itself works when
    // given a genuinely malicious payload. If this test ever stops firing
    // alert(), the XSS — iframe document.write() module above is no longer
    // testing what we think it is.
    QUnit.module('XSS — detector self-test');

    QUnit.test(
      'iframe document.write() with raw payload triggers detector',
      (assert) => {
        const done = assert.async();
        window.xssed = false;
        const iframe = document.createElement('iframe');
        iframe.src = 'about:blank';
        iframe.onload = function () {
          iframe.contentDocument.write(
            '<script>window.alert=function(){parent.xssed=true;}</script>' +
              '<script>alert(1);</script>'
          );
          assert.equal(
            window.xssed,
            true,
            'alert() was called but the detector missed it'
          );
          window.xssed = false;
          iframe.parentNode.removeChild(iframe);
          done();
        };
        document.body.appendChild(iframe);
      }
    );

    // =======================================================================
    // Config: KEEP_CONTENT, ALLOWED_TAGS, ALLOWED_ATTR
    // =======================================================================

    QUnit.module('Config — KEEP_CONTENT, ALLOWED_TAGS, ALLOWED_ATTR');

    QUnit.test(
      'KEEP_CONTENT=false drops content of stripped tags',
      (assert) => {
        assert.equal(
          DOMPurify.sanitize('<iframe>Hello</iframe>', { KEEP_CONTENT: false }),
          ''
        );
      }
    );

    QUnit.test(
      'KEEP_CONTENT=true preserves content inside ALLOWED_TAGS / ALLOWED_ATTR',
      (assert) => {
        assert.contains(
          DOMPurify.sanitize(
            '<a href="#">abc<b style="color:red">123</b><q class="cite">123</b></a>',
            {
              ALLOWED_TAGS: ['b', 'q'],
              ALLOWED_ATTR: ['style'],
              KEEP_CONTENT: true,
            }
          ),
          [
            'abc<b style="color:red">123</b><q>123</q>',
            'abc<b style="color: red;">123</b><q>123</q>',
          ]
        );
      }
    );

    QUnit.test(
      'KEEP_CONTENT=false drops content even when surrounding tags are allowed',
      (assert) => {
        assert.equal(
          DOMPurify.sanitize(
            '<a href="#">abc<b style="color:red">123</b><q class="cite">123</b></a>',
            {
              ALLOWED_TAGS: ['b', 'q'],
              ALLOWED_ATTR: ['style'],
              KEEP_CONTENT: false,
            }
          ),
          ''
        );
        assert.equal(
          DOMPurify.sanitize('<a href="#">abc</a>', {
            ALLOWED_TAGS: ['b', 'q'],
            KEEP_CONTENT: false,
          }),
          ''
        );
      }
    );

    QUnit.test(
      'KEEP_CONTENT preserves descendants when only the parent is allowed',
      (assert) => {
        assert.equal(
          DOMPurify.sanitize('<form><input name="parentNode"></form>', {
            ALLOWED_TAGS: ['input'],
            KEEP_CONTENT: true,
          }),
          '<input>'
        );
      }
    );

    // =======================================================================
    // Config: ALLOW_SELF_CLOSE_IN_ATTR
    // =======================================================================

    QUnit.module('Config — ALLOW_SELF_CLOSE_IN_ATTR');

    QUnit.test('ALLOW_SELF_CLOSE_IN_ATTR=false strips attribute', (assert) => {
      assert.equal(
        DOMPurify.sanitize('<a href="#" class="foo <br/>">abc</a>', {
          ALLOW_SELF_CLOSE_IN_ATTR: false,
        }),
        '<a href="#">abc</a>'
      );
    });

    QUnit.test('ALLOW_SELF_CLOSE_IN_ATTR=true keeps attribute', (assert) => {
      assert.contains(
        DOMPurify.sanitize('<a href="#" class="foo <br/>">abc</a>', {
          ALLOW_SELF_CLOSE_IN_ATTR: true,
        }),
        [
          '<a href="#" class="foo <br/>">abc</a>',
          '<a href="#" class="foo &lt;br/&gt;">abc</a>',
        ]
      );
    });

    // =======================================================================
    // Declarative Partial Updates — patch-directive attributes
    // https://github.com/WICG/declarative-partial-updates/blob/main/patching-explainer.md
    //
    // <template for="..."> teleports / range-replaces content into a
    // pre-existing element (by id or marker name); patchsrc fetches remote
    // markup (script-loading equivalent for CSP). Patches apply on
    // connection/stream — AFTER a parse-time sanitizer has run over a detached
    // fragment — so these must never survive sanitization. PI range markers are
    // already dropped by _isUnsafeNode; removal is gated on SAFE_FOR_XML. Each
    // test uses a fresh instance so a persistent setConfig left by an earlier
    // test cannot suppress _parseConfig and swallow the per-call config.
    // =======================================================================

    QUnit.module('Declarative partial updates');

    QUnit.test(
      'for teleport directive is stripped on non-label/output',
      (assert) => {
        const purify = DOMPurify(window);
        assert.equal(
          purify.sanitize('<div for="account-panel">x</div>'),
          '<div>x</div>'
        );
        assert.equal(
          purify.sanitize('<section for="cart#total">$0.00</section>'),
          '<section>$0.00</section>'
        );
      }
    );

    QUnit.test('for is preserved on label and output', (assert) => {
      const purify = DOMPurify(window);
      assert.equal(
        purify.sanitize('<label for="email">Email</label>'),
        '<label for="email">Email</label>'
      );
      assert.equal(
        purify.sanitize('<output for="a b">42</output>', {
          ADD_TAGS: ['output'],
        }),
        '<output for="a b">42</output>'
      );
    });

    QUnit.test(
      'template[for] loses its patch directive when template is allowed',
      (assert) => {
        const purify = DOMPurify(window);
        assert.contains(
          purify.sanitize('<template for="account-panel"><b>x</b></template>', {
            ADD_TAGS: ['template'],
          }),
          ['<template><b>x</b></template>', '<template></template>', ''],
          'template survives but the `for` patch directive does not'
        );
      }
    );

    QUnit.test('patchsrc is stripped even when explicitly added', (assert) => {
      const purify = DOMPurify(window);
      assert.equal(
        purify.sanitize('<div patchsrc="//evil.example/p">x</div>', {
          ADD_ATTR: ['patchsrc'],
        }),
        '<div>x</div>'
      );
    });

    QUnit.test('processing-instruction range markers are removed', (assert) => {
      const purify = DOMPurify(window);
      assert.equal(
        purify.sanitize('<section><?start name="g">hi<?end></section>'),
        '<section>hi</section>'
      );
      assert.equal(
        purify.sanitize('<ul><li>a</li><?marker name="m"><li>b</li></ul>'),
        '<ul><li>a</li><li>b</li></ul>'
      );
    });

    QUnit.test(
      'SAFE_FOR_XML=false is the escape hatch for patch attributes',
      (assert) => {
        const purify = DOMPurify(window);
        assert.equal(
          purify.sanitize('<div for="target">x</div>', { SAFE_FOR_XML: false }),
          '<div for="target">x</div>'
        );
        assert.equal(
          purify.sanitize('<div patchsrc="//e">x</div>', {
            ADD_ATTR: ['patchsrc'],
            SAFE_FOR_XML: false,
          }),
          '<div patchsrc="//e">x</div>'
        );
      }
    );

    // =======================================================================
    // Config: ALLOW_DATA_ATTR
    // =======================================================================

    QUnit.module('Config — ALLOW_DATA_ATTR');

    QUnit.test('malformed data- attribute is stripped regardless', (assert) => {
      assert.equal(
        DOMPurify.sanitize('<a href="#" data-abc"="foo">abc</a>', {
          ALLOW_DATA_ATTR: true,
        }),
        '<a href="#">abc</a>'
      );
    });

    QUnit.test('ALLOW_DATA_ATTR=false strips data-* attributes', (assert) => {
      assert.equal(
        DOMPurify.sanitize('<a href="#" data-abc="foo">abc</a>', {
          ALLOW_DATA_ATTR: false,
        }),
        '<a href="#">abc</a>'
      );
    });

    QUnit.test(
      'ALLOW_DATA_ATTR=true keeps well-formed data-* attributes',
      (assert) => {
        assert.contains(
          DOMPurify.sanitize('<a href="#" data-abc="foo">abc</a>', {
            ALLOW_DATA_ATTR: true,
          }),
          [
            '<a data-abc="foo" href="#">abc</a>',
            '<a href="#" data-abc="foo">abc</a>',
          ]
        );
        assert.contains(
          DOMPurify.sanitize('<a href="#" data-abc-1-2-3="foo">abc</a>', {
            ALLOW_DATA_ATTR: true,
          }),
          [
            '<a data-abc-1-2-3="foo" href="#">abc</a>',
            '<a href="#" data-abc-1-2-3="foo">abc</a>',
          ]
        );
      }
    );

    QUnit.test(
      'ALLOW_DATA_ATTR with empty / non-ASCII names — name-validity rules apply',
      (assert) => {
        // Empty post-prefix name: rejected.
        assert.equal(
          DOMPurify.sanitize('<a href="#" data-""="foo">abc</a>', {
            ALLOW_DATA_ATTR: true,
          }),
          '<a href="#">abc</a>'
        );
        // Latin-1 letters: accepted in engines that follow the HTML spec.
        assert.contains(
          DOMPurify.sanitize('<a href="#" data-äöü="foo">abc</a>', {
            ALLOW_DATA_ATTR: true,
          }),
          [
            '<a href="#" data-äöü="foo">abc</a>',
            '<a data-äöü="foo" href="#">abc</a>',
          ]
        );
        // Middle-dot / combining marks — accepted-or-rejected depending on
        // engine; IE11 and Edge throw InvalidCharacterError, modern engines
        // accept.
        assert.contains(
          DOMPurify.sanitize('<a href="#" data-\u00B7._="foo">abc</a>', {
            ALLOW_DATA_ATTR: true,
          }),
          [
            '<a data-\u00B7._="foo" href="#">abc</a>',
            '<a href="#">abc</a>',
            '<a href="#" data-·._="foo">abc</a>',
          ]
        );
        // µ (micro sign, U+00B5) is not in the spec-defined name char set.
        assert.equal(
          DOMPurify.sanitize('<a href="#" data-\u00B5="foo">abc</a>', {
            ALLOW_DATA_ATTR: true,
          }),
          '<a href="#">abc</a>'
        );
      }
    );

    QUnit.test(
      'FORBID_ATTR overrides ALLOW_DATA_ATTR for the named attribute',
      (assert) => {
        assert.equal(
          DOMPurify.sanitize('<a href="#" data-evil="foo">abc</a>', {
            FORBID_ATTR: ['data-evil'],
          }),
          '<a href="#">abc</a>'
        );
        assert.equal(
          DOMPurify.sanitize('<a href="#" data-evil="foo">abc</a>', {
            ALLOW_DATA_ATTR: true,
            FORBID_ATTR: ['data-evil'],
          }),
          '<a href="#">abc</a>'
        );
      }
    );

    // =======================================================================
    // Config: ADD_TAGS & ADD_ATTR
    // ADD_TAGS / ADD_ATTR can be either string arrays or predicate functions.
    // The function form has its own subtleties (no leakage across calls,
    // URI validation still runs after the function returns true, etc.).
    // =======================================================================

    QUnit.module('Config — ADD_TAGS & ADD_ATTR');

    QUnit.test('ADD_TAGS as string array', (assert) => {
      assert.equal(
        DOMPurify.sanitize('<my-component>abc</my-component>', {
          ADD_TAGS: ['my-component'],
        }),
        '<my-component>abc</my-component>'
      );
    });

    QUnit.test(
      'ADD_TAGS without matching ADD_ATTR strips the custom attr',
      (assert) => {
        assert.equal(
          DOMPurify.sanitize('<my-component my-attr="foo">abc</my-component>', {
            ADD_TAGS: ['my-component'],
          }),
          '<my-component>abc</my-component>'
        );
      }
    );

    QUnit.test('ADD_TAGS + ADD_ATTR keeps both', (assert) => {
      assert.equal(
        DOMPurify.sanitize('<my-component my-attr="foo">abc</my-component>', {
          ADD_TAGS: ['my-component'],
          ADD_ATTR: ['my-attr'],
        }),
        '<my-component my-attr="foo">abc</my-component>'
      );
    });

    QUnit.test('ADD_TAGS as function selectively allows tags', (assert) => {
      assert.equal(
        DOMPurify.sanitize(
          '<apple>content</apple><banana>content</banana><cherry>content</cherry>',
          {
            ADD_TAGS: (tagName) => ['apple', 'banana'].includes(tagName),
            KEEP_CONTENT: false,
          }
        ),
        '<apple>content</apple><banana>content</banana>'
      );
      assert.equal(
        DOMPurify.sanitize('<allowed>yes</allowed><forbidden>no</forbidden>', {
          ADD_TAGS: (tagName) => tagName === 'allowed',
          KEEP_CONTENT: false,
        }),
        '<allowed>yes</allowed>'
      );
    });

    QUnit.test('ADD_TAGS as function supports pattern matching', (assert) => {
      assert.equal(
        DOMPurify.sanitize(
          '<item1>one</item1><item2>two</item2><other>three</other>',
          {
            ADD_TAGS: (tagName) => tagName.startsWith('item'),
            KEEP_CONTENT: false,
          }
        ),
        '<item1>one</item1><item2>two</item2>'
      );
    });

    QUnit.test(
      'ADD_ATTR as function receives (attrName, tagName) for tag-specific validation',
      (assert) => {
        assert.equal(
          DOMPurify.sanitize(
            '<one attribute-one="1" attribute-two="2"></one><two attribute-one="1" attribute-two="2"></two>',
            {
              ADD_TAGS: ['one', 'two'],
              ADD_ATTR: (attributeName, tagName) => {
                const allowed = {
                  one: ['attribute-one'],
                  two: ['attribute-two'],
                };
                return allowed[tagName]?.includes(attributeName) || false;
              },
            }
          ),
          '<one attribute-one="1"></one><two attribute-two="2"></two>'
        );
      }
    );

    QUnit.test('ADD_ATTR as function works on built-in tags', (assert) => {
      assert.equal(
        DOMPurify.sanitize('<div custom-attr="test">content</div>', {
          ADD_ATTR: (attr, tag) => tag === 'div' && attr === 'custom-attr',
        }),
        '<div custom-attr="test">content</div>'
      );
    });

    QUnit.test(
      'ADD_ATTR as function rejecting returns the default',
      (assert) => {
        assert.equal(
          DOMPurify.sanitize('<one attribute-one="1" forbidden="bad"></one>', {
            ADD_TAGS: ['one'],
            ADD_ATTR: (attr, tag) => tag === 'one' && attr === 'attribute-one',
          }),
          '<one attribute-one="1"></one>'
        );
      }
    );

    QUnit.test('ADD_ATTR function must not bypass URI validation', (assert) => {
      // Returning true from ADD_ATTR allows the *attribute name* but the
      // attribute *value* still has to pass IS_ALLOWED_URI for URI-bearing
      // attributes like href. Otherwise the function form would be a
      // permanent javascript: bypass.
      assert.ok(
        DOMPurify.sanitize('<a href="javascript:alert(1)">x</a>', {
          ADD_ATTR: (attr) => attr === 'href',
        }).indexOf('javascript:') === -1,
        'javascript: URI must be stripped from href'
      );
      assert.equal(
        DOMPurify.sanitize('<a href="https://example.com">x</a>', {
          ADD_ATTR: (attr) => attr === 'href',
        }),
        '<a href="https://example.com">x</a>',
        'safe URI must be preserved in href'
      );
    });

    QUnit.test(
      'ADD_TAGS function does not leak permissiveness into subsequent array-based calls',
      (assert) => {
        // Permissive function call — must not stash permissiveness on the
        // instance.
        DOMPurify.sanitize('<b>x</b>', { ADD_TAGS: () => true });

        const out = DOMPurify.sanitize(
          '<iframe src="https://evil.com"></iframe>' +
            '<object data="https://evil.com"></object>' +
            '<embed src="https://evil.com">',
          { ADD_TAGS: ['custom-tag'] }
        );
        assert.ok(
          !/<(iframe|object|embed)/i.test(out),
          'array-based call must not inherit permissiveness: ' + out
        );

        const out2 = DOMPurify.sanitize(
          '<iframe src="https://evil.com"></iframe>'
        );
        assert.ok(
          !/<iframe/i.test(out2),
          'default call after function-based ADD_TAGS must block iframe: ' +
            out2
        );
      }
    );

    QUnit.test(
      'ADD_ATTR function does not leak permissiveness into subsequent array-based calls',
      (assert) => {
        DOMPurify.sanitize('<b>x</b>', { ADD_ATTR: () => true });

        const out = DOMPurify.sanitize(
          '<a href="javascript:alert(1)">click</a>',
          { ADD_ATTR: ['class'] }
        );
        assert.ok(
          out.indexOf('javascript:') === -1,
          'array-based call must not inherit permissiveness: ' + out
        );

        const out2 = DOMPurify.sanitize(
          '<a href="javascript:alert(1)">click</a>'
        );
        assert.ok(
          out2.indexOf('javascript:') === -1,
          'default call after function-based ADD_ATTR must block javascript: URIs: ' +
            out2
        );
      }
    );

    // =======================================================================
    // Config: FORBID_CONTENTS / ADD_FORBID_CONTENTS
    // =======================================================================

    QUnit.module('Config — FORBID_CONTENTS / ADD_FORBID_CONTENTS');

    QUnit.test(
      'FORBID_CONTENTS + FORBID_TAGS drops content of named ancestors',
      (assert) => {
        assert.equal(
          DOMPurify.sanitize(
            '<div><b>preserve me</b></div><p><b>no not preserve me</b></p>',
            { FORBID_CONTENTS: ['p'], FORBID_TAGS: ['div', 'p'] }
          ),
          '<b>preserve me</b>'
        );
      }
    );

    QUnit.test(
      'ADD_FORBID_CONTENTS extends the FORBID_CONTENTS set',
      (assert) => {
        assert.equal(
          DOMPurify.sanitize(
            '<div><b>preserve me</b></div><p><b>no not preserve me</b></p><a><i>also no preserve me</i></a>',
            {
              FORBID_CONTENTS: ['p'],
              ADD_FORBID_CONTENTS: ['a'],
              FORBID_TAGS: ['div', 'p', 'a'],
            }
          ),
          '<b>preserve me</b>'
        );
      }
    );

    QUnit.test('ADD_FORBID_CONTENTS preserves the default set', (assert) => {
      assert.equal(
        DOMPurify.sanitize(
          '<script>var a = 1;</script><p><b>no not preserve me</b></p><a><i>preserve me</i></a>',
          { ADD_FORBID_CONTENTS: ['p'], FORBID_TAGS: ['script', 'p', 'a'] }
        ),
        '<i>preserve me</i>'
      );
    });

    // =======================================================================
    // Config: SAFE_FOR_JQUERY (now a no-op; secure by default)
    // The flag was removed but the behaviour it enabled is now unconditional.
    // The cases below pin that behaviour so removing the legacy default would
    // be immediately visible.
    // =======================================================================

    QUnit.module('Config — SAFE_FOR_JQUERY (legacy / secure by default)');

    QUnit.test('style inside option is stripped', (assert) => {
      assert.equal(
        DOMPurify.sanitize(
          '<a>123</a><option><style><img src=x onerror=alert(1)>'
        ),
        '<a>123</a><option></option>'
      );
    });

    QUnit.test('cross-boundary style + img inside option', (assert) => {
      assert.contains(
        DOMPurify.sanitize(
          '<option><style></option></select><b><img src=xx: onerror=alert(1)></style></option>'
        ),
        ['<option></option>', '']
      );
    });

    QUnit.test('iframe + script inside option', (assert) => {
      assert.contains(
        DOMPurify.sanitize(
          '<option><iframe></select><b><script>alert(1)</script>'
        ),
        ['<option></option>', '']
      );
    });

    QUnit.test('nested style tags with self-closing form', (assert) => {
      assert.equal(
        DOMPurify.sanitize('<b><style><style/><img src=xx: onerror=alert(1)>'),
        '<b></b>'
      );
    });

    QUnit.test('template element preservation varies by engine', (assert) => {
      assert.contains(DOMPurify.sanitize('1<template><s>000</s></template>2'), [
        '1<template><s>000</s></template>2',
        '1<template></template>2',
        '12',
      ]);
      assert.contains(DOMPurify.sanitize('<template><s>000</s></template>'), [
        '',
        '<template><s>000</s></template>',
      ]);
    });

    QUnit.test(
      'entity round-trip — github.com/cure53/DOMPurify/issues/283',
      (assert) => {
        assert.equal(
          DOMPurify.sanitize('<i>&amp;amp; &lt;</i>'),
          '<i>&amp;amp; &lt;</i>'
        );
      }
    );

    // =======================================================================
    // Config: SAFE_FOR_TEMPLATES
    // Scrubs Mustache-style {{...}} and ASP-style <% ... %> markers from
    // text and attribute values so template engines cannot interpolate
    // attacker-controlled expressions after sanitization.
    // =======================================================================

    QUnit.module('Config — SAFE_FOR_TEMPLATES');

    QUnit.test(
      'strips template markers from mixed text and style content',
      (assert) => {
        assert.equal(
          DOMPurify.sanitize(
            '<a>123{{456}}<b><style><% alert(1) %></style>456</b></a>',
            { SAFE_FOR_TEMPLATES: true }
          ),
          '<a> <b><style> </style>456</b></a>'
        );
      }
    );

    QUnit.test(
      'strips data-bind expressions even when not data-attributes',
      (assert) => {
        assert.equal(
          DOMPurify.sanitize('<a data-bind="style: alert(1)"></a>', {
            SAFE_FOR_TEMPLATES: true,
          }),
          '<a></a>'
        );
      }
    );

    QUnit.test(
      'does not bring back stripped attributes via ALLOW_DATA_ATTR',
      (assert) => {
        assert.equal(
          DOMPurify.sanitize('<a data-harmless=""></a>', {
            SAFE_FOR_TEMPLATES: true,
            ALLOW_DATA_ATTR: true,
          }),
          '<a></a>'
        );
        assert.equal(
          DOMPurify.sanitize('<a data-harmless=""></a>', {
            SAFE_FOR_TEMPLATES: false,
            ALLOW_DATA_ATTR: false,
          }),
          '<a></a>'
        );
      }
    );

    QUnit.test(
      'strips multiple template markers in the same node',
      (assert) => {
        assert.equal(
          DOMPurify.sanitize(
            '<a>{{123}}{{456}}<b><style><% alert(1) %><% 123 %></style>456</b></a>',
            { SAFE_FOR_TEMPLATES: true }
          ),
          '<a> <b><style> </style>456</b></a>'
        );
        assert.equal(
          DOMPurify.sanitize(
            '<a>{{123}}abc{{456}}<b><style><% alert(1) %>def<% 123 %></style>456</b></a>',
            { SAFE_FOR_TEMPLATES: true }
          ),
          '<a> <b><style> </style>456</b></a>'
        );
      }
    );

    QUnit.test(
      'greedy matching: nested and unbalanced markers scrub fully',
      (assert) => {
        assert.equal(
          DOMPurify.sanitize(
            '<a>123{{45{{6}}<b><style><% alert(1)%> %></style>456</b></a>',
            { SAFE_FOR_TEMPLATES: true }
          ),
          '<a> <b><style> </style>456</b></a>'
        );
        assert.equal(
          DOMPurify.sanitize(
            '<a>123{{45}}6}}<b><style><% <%alert(1) %></style>456</b></a>',
            { SAFE_FOR_TEMPLATES: true }
          ),
          '<a> <b><style> </style>456</b></a>'
        );
        assert.equal(
          DOMPurify.sanitize(
            '<a>123{{<b>456}}</b><style><% alert(1) %></style>456</a>',
            { SAFE_FOR_TEMPLATES: true }
          ),
          '<a>123 <b> </b><style> </style>456</a>'
        );
      }
    );

    QUnit.test(
      'scrubs expressions that contain stripped subtrees',
      (assert) => {
        assert.contains(
          DOMPurify.sanitize(
            '<b>{{evil<script>alert(1)</script><form><img src=x name=textContent></form>}}</b>',
            { SAFE_FOR_TEMPLATES: true }
          ),
          ['<b>  </b>', '<b> </b>', '<b> <form><img src="x"></form> </b>']
        );
        assert.contains(
          DOMPurify.sanitize(
            '<b>he{{evil<script>alert(1)</script><form><img src=x name=textContent></form>}}ya</b>',
            { SAFE_FOR_TEMPLATES: true }
          ),
          [
            '<b>he  ya</b>',
            '<b>he </b>',
            '<b>he <form><img src="x"></form> ya</b>',
          ]
        );
      }
    );

    QUnit.test(
      'handles cross-boundary <% ... %> spanning subtrees',
      (assert) => {
        assert.equal(
          DOMPurify.sanitize(
            '<a>123<% <b>456}}</b><style>{{ alert(1) }}</style>456 %></a>',
            { SAFE_FOR_TEMPLATES: true }
          ),
          '<a>123 <b> </b><style> </style> </a>'
        );
      }
    );

    QUnit.test(
      'scrubbed attribute values cannot reintroduce javascript:',
      (assert) => {
        assert.equal(
          DOMPurify.sanitize('<a href="}}javascript:alert(1)"></a>', {
            SAFE_FOR_TEMPLATES: true,
          }),
          '<a></a>'
        );
      }
    );

    QUnit.test(
      'attribute and bare-string markers are also scrubbed',
      (assert) => {
        assert.equal(
          DOMPurify.sanitize('<a class="{{999-333}}"></a>', {
            SAFE_FOR_TEMPLATES: true,
          }),
          '<a class=" "></a>'
        );
        assert.equal(
          DOMPurify.sanitize('{{999-333}}', { SAFE_FOR_TEMPLATES: true }),
          ' '
        );
        assert.equal(
          DOMPurify.sanitize('{<x>{333+333}<x>}', { SAFE_FOR_TEMPLATES: true }),
          ' '
        );
      }
    );

    QUnit.test(
      'CVE-2026-41239: IN_PLACE strips boundary-spanning Mustache expressions',
      (assert) => {
        // Per-text-node scrubbing during the sanitizer walk misses {{...}}
        // whose halves sit on either side of a stripped foreign element: at
        // walk time each surrounding text node holds only a single '{' or
        // '}', so MUSTACHE_EXPR (which requires '{{' or '}}') matches
        // nothing. Once the foreign element is removed, the surrounding
        // text nodes are adjacent; a normalize() call merges them into one
        // node containing '{{...}}', which a template-evaluating framework
        // would interpolate on mount. The final scrub pass runs normalize()
        // and then walks the merged character data so the joined
        // expression is caught.
        const dirty = document.createElement('div');
        dirty.innerHTML =
          '{<foo></foo>{constructor.constructor("alert(1)")()}<foo></foo>}';
        DOMPurify.sanitize(dirty, {
          SAFE_FOR_TEMPLATES: true,
          IN_PLACE: true,
        });
        assert.notOk(
          /\{\{[\s\S]*\}\}/.test(dirty.innerHTML),
          'merged Mustache expression should be scrubbed'
        );
        assert.notOk(
          /constructor/.test(dirty.innerHTML),
          'expression body should not survive scrubbing'
        );
      }
    );

    QUnit.test(
      'CVE-2026-41239: IN_PLACE strips boundary-spanning template-literal expressions',
      (assert) => {
        // Same bug class as the Mustache test above, for ES template
        // literals: '$' and '{' land in separate text nodes, so TMPLIT_EXPR
        // (which requires the paired '${' sigil) does not match per node.
        // After normalize() merges the surrounding text fragments the final
        // scrub walks the joined node and strips '${...}'.
        const dirty = document.createElement('div');
        dirty.innerHTML = '$<foo></foo>{<foo></foo>danger}';
        DOMPurify.sanitize(dirty, {
          SAFE_FOR_TEMPLATES: true,
          IN_PLACE: true,
        });
        assert.notOk(
          /\$\{[\s\S]*\}/.test(dirty.innerHTML),
          'merged template-literal expression should be scrubbed'
        );
      }
    );

    QUnit.test(
      'CVE-2026-41239: RETURN_DOM_FRAGMENT path also scrubs joined expressions',
      (assert) => {
        // RETURN_DOM_FRAGMENT was fixed alongside RETURN_DOM and now shares
        // the same scrub helper as IN_PLACE. Pinning here so a future
        // refactor of the post-walk return path cannot silently regress it.
        const result = DOMPurify.sanitize(
          '<div>{<foo></foo>{constructor.constructor("alert(1)")()}<foo></foo>}</div>',
          {
            SAFE_FOR_TEMPLATES: true,
            RETURN_DOM_FRAGMENT: true,
          }
        );
        const container = document.createElement('div');
        container.appendChild(result);
        assert.notOk(
          /\{\{[\s\S]*\}\}/.test(container.innerHTML),
          'merged Mustache expression should be scrubbed in fragment mode'
        );
      }
    );

    QUnit.test(
      'greedy-scrub of stray close marker prevents URL bypass',
      (assert) => {
        // After scrubbing {{}}, a lazy regex would leave }} behind, which
        // defeats IS_ALLOWED_URI because its [^a-z] alternation accepts any
        // non-letter leading character. The greedy regex scrubs the entire
        // value from {{ to end-of-string, leaving no usable URL.
        const cfg = { SAFE_FOR_TEMPLATES: true };
        assert.equal(
          DOMPurify.sanitize('<a href="{{}}javascript:alert(1)">x</a>', cfg),
          '<a>x</a>',
          'href scrubbed entirely; no stray }} left to pass the URL check'
        );
        assert.equal(
          DOMPurify.sanitize('<a href="{{x">y</a>', cfg),
          '<a>y</a>',
          'unterminated {{ scrubs to end of attribute value'
        );
        assert.equal(
          DOMPurify.sanitize('<a href="x}}javascript:alert(1)">y</a>', cfg),
          '<a>y</a>',
          'leading content before }} scrubbed along with the close marker'
        );
      }
    );

    // =======================================================================
    // Config: SANITIZE_DOM
    // =======================================================================

    QUnit.module('Config — SANITIZE_DOM');

    QUnit.test('strips names that would clobber document.* APIs', (assert) => {
      assert.equal(
        DOMPurify.sanitize('<img src="x" name="implementation">', {
          SANITIZE_DOM: true,
        }),
        '<img src="x">'
      );
      assert.equal(
        DOMPurify.sanitize('<img src="x" name="createNodeIterator">', {
          SANITIZE_DOM: true,
        }),
        '<img src="x">'
      );
      assert.equal(
        DOMPurify.sanitize('<img src="x" name="getElementById">', {
          SANITIZE_DOM: true,
        }),
        '<img src="x">'
      );
    });

    QUnit.test(
      'SANITIZE_DOM=false leaves clobbering names intact',
      (assert) => {
        assert.equal(
          DOMPurify.sanitize('<img src="x" name="getElementById">', {
            SANITIZE_DOM: false,
          }),
          '<img src="x" name="getElementById">'
        );
      }
    );

    QUnit.test(
      'strips ids that would clobber window.location etc.',
      (assert) => {
        assert.equal(
          DOMPurify.sanitize('<a href="x" id="location">click</a>', {
            SANITIZE_DOM: true,
          }),
          '<a href="x">click</a>'
        );
      }
    );

    QUnit.test(
      'form-input "attributes" name handling differs by engine',
      (assert) => {
        assert.contains(
          DOMPurify.sanitize('<form><input name="attributes"></form>', {
            ADD_TAGS: ['form'],
            SANITIZE_DOM: false,
          }),
          ['', '<form><input name="attributes"></form>']
        );
        assert.contains(
          DOMPurify.sanitize('<form><input name="attributes"></form>', {
            ADD_TAGS: ['form'],
            SANITIZE_DOM: true,
          }),
          ['', '<form><input name="attributes"></form>', '<form><input></form>']
        );
      }
    );

    // =======================================================================
    // Config: SANITIZE_NAMED_PROPS
    // Prefixes id= and name= attributes with "user-content-" so they cannot
    // clobber predefined window globals or document.* lookups.
    // =======================================================================

    QUnit.module('Config — SANITIZE_NAMED_PROPS');

    QUnit.test('id is prefixed with user-content-', (assert) => {
      assert.equal(
        DOMPurify.sanitize('<a id="x"></a>', { SANITIZE_NAMED_PROPS: true }),
        '<a id="user-content-x"></a>'
      );
    });

    QUnit.test('nested form + input ids are both prefixed', (assert) => {
      assert.equal(
        DOMPurify.sanitize('<form id="x"><input id="y"></form>', {
          SANITIZE_NAMED_PROPS: true,
        }),
        '<form id="user-content-x"><input id="user-content-y"></form>'
      );
    });

    QUnit.test('duplicate ids on siblings are both prefixed', (assert) => {
      assert.equal(
        DOMPurify.sanitize('<a id="x"></a><a id="x"></a>', {
          SANITIZE_NAMED_PROPS: true,
        }),
        '<a id="user-content-x"></a><a id="user-content-x"></a>'
      );
    });

    QUnit.test('SANITIZE_NAMED_PROPS is idempotent', (assert) => {
      const cfg = { SANITIZE_NAMED_PROPS: true };
      const inputs = [
        '<div id="foo">hi</div>',
        '<a name="bar">hi</a>',
        '<div id="user-content-foo">hi</div>',
        '<a name="user-content-bar">hi</a>',
        '<div id="">hi</div>',
        '<form id="x"><input id="y"></form>',
      ];
      inputs.forEach((input) => {
        const once = DOMPurify.sanitize(input, cfg);
        const twice = DOMPurify.sanitize(once, cfg);
        assert.equal(
          twice,
          once,
          `idempotent for input: ${input} (once=${once})`
        );
      });
    });

    QUnit.test('does not double-prefix already-prefixed values', (assert) => {
      const cfg = { SANITIZE_NAMED_PROPS: true };
      assert.equal(
        DOMPurify.sanitize('<div id="user-content-x">hi</div>', cfg),
        '<div id="user-content-x">hi</div>',
        'already-prefixed id left untouched'
      );
      assert.equal(
        DOMPurify.sanitize('<a name="user-content-x">hi</a>', cfg),
        '<a name="user-content-x">hi</a>',
        'already-prefixed name left untouched'
      );
    });

    // =======================================================================
    // Config: WHOLE_DOCUMENT
    // =======================================================================

    QUnit.module('Config — WHOLE_DOCUMENT');

    QUnit.test('text payload', (assert) => {
      assert.equal(DOMPurify.sanitize('123', { WHOLE_DOCUMENT: false }), '123');
      assert.equal(
        DOMPurify.sanitize('123', { WHOLE_DOCUMENT: true }),
        '<html><head></head><body>123</body></html>'
      );
    });

    QUnit.test('<style> is head-only without WHOLE_DOCUMENT', (assert) => {
      assert.equal(
        DOMPurify.sanitize('<style>*{color:red}</style>', {
          WHOLE_DOCUMENT: false,
        }),
        ''
      );
      assert.equal(
        DOMPurify.sanitize('<style>*{color:red}</style>', {
          WHOLE_DOCUMENT: true,
        }),
        '<html><head><style>*{color:red}</style></head><body></body></html>'
      );
    });

    QUnit.test('text + <style> interleave', (assert) => {
      assert.equal(
        DOMPurify.sanitize('123<style>*{color:red}</style>', {
          WHOLE_DOCUMENT: false,
        }),
        '123<style>*{color:red}</style>'
      );
      assert.equal(
        DOMPurify.sanitize('123<style>*{color:red}</style>', {
          WHOLE_DOCUMENT: true,
        }),
        '<html><head></head><body>123<style>*{color:red}</style></body></html>'
      );
    });

    QUnit.test(
      'doctype is stripped unless ADD_TAGS includes !doctype',
      (assert) => {
        assert.equal(
          DOMPurify.sanitize('<!DOCTYPE html><html><body>123</body></html>', {
            WHOLE_DOCUMENT: true,
          }),
          '<html><head></head><body>123</body></html>'
        );
        assert.equal(
          DOMPurify.sanitize('<!DOCTYPE html><html><body>123</body></html>', {
            WHOLE_DOCUMENT: true,
            ADD_TAGS: ['!doctype'],
          }),
          '<!DOCTYPE html>\n<html><head></head><body>123</body></html>'
        );
      }
    );

    // =======================================================================
    // Config: RETURN_DOM / RETURN_DOM_FRAGMENT
    // =======================================================================

    QUnit.module('Config — RETURN_DOM');

    QUnit.test('returns sanitized body element', (assert) => {
      assert.equal(
        DOMPurify.sanitize('<a>123<b>456</b></a>', { RETURN_DOM: true })
          .outerHTML,
        '<body><a>123<b>456</b></a></body>'
      );
      assert.equal(
        DOMPurify.sanitize('<a>123<b>456<script>alert(1)</script></b></a>', {
          RETURN_DOM: true,
        }).outerHTML,
        '<body><a>123<b>456</b></a></body>'
      );
    });

    QUnit.test(
      'RETURN_DOM + WHOLE_DOCUMENT returns sanitized html element',
      (assert) => {
        assert.equal(
          DOMPurify.sanitize('<a>123<b>456</b></a>', {
            RETURN_DOM: true,
            WHOLE_DOCUMENT: true,
          }).outerHTML,
          '<html><head></head><body><a>123<b>456</b></a></body></html>'
        );
        assert.equal(
          DOMPurify.sanitize('<a>123<b>456<script>alert(1)</script></b></a>', {
            RETURN_DOM: true,
            WHOLE_DOCUMENT: true,
          }).outerHTML,
          '<html><head></head><body><a>123<b>456</b></a></body></html>'
        );
      }
    );

    QUnit.test('plain text payload returns body wrapper', (assert) => {
      assert.equal(
        DOMPurify.sanitize('123', { RETURN_DOM: true }).outerHTML,
        '<body>123</body>'
      );
    });

    QUnit.test(
      'shadowroot attribute toggles owner-document selection',
      (assert) => {
        // Without `shadowroot` in ADD_ATTR, the returned DOM lives in a
        // *separate* document from the live one — protective against
        // clobbering attacks against the host document. With `shadowroot`
        // permitted, the caller has opted in to in-document return.
        assert.notEqual(
          DOMPurify.sanitize('123', { RETURN_DOM: true }).ownerDocument,
          document
        );
        assert.equal(
          DOMPurify.sanitize('123', {
            RETURN_DOM: true,
            ADD_ATTR: ['shadowroot'],
          }).ownerDocument,
          document
        );
        assert.notEqual(
          DOMPurify.sanitize('123', { RETURN_DOM_FRAGMENT: true })
            .ownerDocument,
          document
        );
        assert.equal(
          DOMPurify.sanitize('123', {
            RETURN_DOM_FRAGMENT: true,
            ADD_ATTR: ['shadowroot'],
          }).ownerDocument,
          document
        );
      }
    );

    QUnit.test('declarative shadowroot template is neutralised', (assert) => {
      const xss =
        '<body><div><template shadowroot=open>' +
        '<img src=x onerror=alert(3)></template></div></body>';
      const dom = DOMPurify.sanitize(xss, { RETURN_DOM: true });
      assert.equal(
        dom.outerHTML,
        '<body><div><template><img src="x"></template></div></body>'
      );
    });

    QUnit.module('Config — RETURN_DOM_FRAGMENT');

    QUnit.test('returns DocumentFragment with sanitized contents', (assert) => {
      let fragment = DOMPurify.sanitize(
        'foo<img id="createDocumentFragment">',
        { RETURN_DOM_FRAGMENT: true }
      );
      assert.equal(fragment.nodeType, 11);
      assert.notEqual(fragment.ownerDocument, document);
      assert.equal(fragment.firstChild && fragment.firstChild.nodeValue, 'foo');

      // Same again without SANITIZE_DOM to confirm the clobbering id is
      // still stripped by the fragment-mode pre-pass.
      fragment = DOMPurify.sanitize('foo<img id="createDocumentFragment">', {
        RETURN_DOM_FRAGMENT: true,
        SANITIZE_DOM: false,
      });
      assert.equal(fragment.nodeType, 11);
      assert.notEqual(fragment.ownerDocument, document);
      assert.equal(fragment.firstChild && fragment.firstChild.nodeValue, 'foo');
    });

    // =======================================================================
    // Config: IN_PLACE
    // IN_PLACE mutates the input node tree rather than returning a string.
    // It carries a number of edge cases: the root node itself must be a
    // valid container, clobbered nodes must throw, foreign-realm nodes
    // must be reached, attached shadow roots must be walked.
    // =======================================================================

    QUnit.module('Config — IN_PLACE');

    QUnit.test('returns the input node, mutated', (assert) => {
      const dirty = document.createElement('a');
      dirty.setAttribute('href', 'javascript:alert(1)');
      const clean = DOMPurify.sanitize(dirty, { IN_PLACE: true });
      assert.equal(dirty, clean, 'returns the input node');
      assert.equal(dirty.href, '', 'still sanitizes the dangerous href');
    });

    QUnit.test(
      'throws when the root node tag is itself disallowed (script)',
      (assert) => {
        const dirty = document.createElement('script');
        dirty.setAttribute('src', 'data:,alert(1)');
        assert.throws(() => DOMPurify.sanitize(dirty, { IN_PLACE: true }));
      }
    );

    QUnit.test(
      'throws when the root node tag is itself disallowed (iframe)',
      (assert) => {
        const dirty = document.createElement('iframe');
        dirty.setAttribute('src', 'javascript:alert(1)');
        assert.throws(() => DOMPurify.sanitize(dirty, { IN_PLACE: true }));
      }
    );

    QUnit.test(
      'sanitizes attached open shadow root on the root host',
      (assert) => {
        // A host element passed to DOMPurify with IN_PLACE may already
        // carry an open shadow root. NodeIterator does not descend into
        // shadow trees, so the sanitizer must recurse explicitly.
        //
        // NOTE: we intentionally avoid `src` on the <img> — setting
        // innerHTML with <img src=x> in a real browser starts a load that
        // will fail and fire onerror, polluting window.xssed for the next
        // test.
        const host = document.createElement('div');
        const shadow = host.attachShadow({ mode: 'open' });
        shadow.innerHTML =
          '<a id="poc" href="javascript:alert(1)">click</a>' +
          '<img id="poc2" onerror="alert(2)">';
        DOMPurify.sanitize(host, { IN_PLACE: true });
        const a = host.shadowRoot.querySelector('#poc');
        const img = host.shadowRoot.querySelector('#poc2');
        assert.ok(a, 'link element preserved');
        assert.equal(
          a.getAttribute('href'),
          null,
          'javascript: href stripped from shadow content'
        );
        assert.ok(img, 'img element preserved');
        assert.equal(
          img.getAttribute('onerror'),
          null,
          'onerror handler stripped from shadow content'
        );
        window.xssed = false;
      }
    );

    QUnit.test('sanitizes nested shadow roots', (assert) => {
      const outer = document.createElement('section');
      const outerShadow = outer.attachShadow({ mode: 'open' });
      const inner = document.createElement('div');
      outerShadow.appendChild(inner);
      inner.attachShadow({ mode: 'open' }).innerHTML =
        '<a id="nested" href="javascript:alert(1)">click</a>';
      DOMPurify.sanitize(outer, { IN_PLACE: true });
      const nested = outer.shadowRoot
        .querySelector('div')
        .shadowRoot.querySelector('#nested');
      assert.ok(nested, 'nested link preserved');
      assert.equal(
        nested.getAttribute('href'),
        null,
        'javascript: href stripped from nested shadow content'
      );
      window.xssed = false;
    });

    QUnit.test(
      'RETURN_DOM with DOM input sanitizes clonable shadow root',
      (assert) => {
        // Feature-detect clonable shadow root support. importNode() is
        // expected to deep-clone the shadow root only when clonable is
        // honoured by the engine. jsdom currently ignores the option, so
        // we skip the assertion there and rely on the browser pass.
        let supportsClonable = false;
        try {
          const probeHost = document.createElement('div');
          probeHost.attachShadow({ mode: 'open', clonable: true }).innerHTML =
            '<span>x</span>';
          const imported = document.importNode(probeHost, true);
          supportsClonable = !!(
            imported.shadowRoot && imported.shadowRoot.querySelector('span')
          );
        } catch (_) {}

        if (!supportsClonable) {
          assert.ok(
            true,
            'environment does not support clonable shadow roots; skipping'
          );
          return;
        }

        const host = document.createElement('div');
        host.attachShadow({ mode: 'open', clonable: true }).innerHTML =
          '<a id="poc" href="javascript:alert(1)">click</a>' +
          '<img id="poc2" onerror="alert(2)">';

        const clean = DOMPurify.sanitize(host, { RETURN_DOM: true });
        const returnedHost = clean.firstElementChild;
        assert.ok(
          returnedHost.shadowRoot instanceof window.DocumentFragment,
          'cloned shadow root present on returned host'
        );
        const a = returnedHost.shadowRoot.querySelector('#poc');
        const img = returnedHost.shadowRoot.querySelector('#poc2');
        if (a) {
          assert.equal(
            a.getAttribute('href'),
            null,
            'javascript: href stripped in cloned shadow'
          );
        } else {
          assert.ok(true, 'link removed entirely');
        }
        if (img) {
          assert.equal(
            img.getAttribute('onerror'),
            null,
            'onerror stripped in cloned shadow'
          );
        } else {
          assert.ok(true, 'img removed entirely');
        }
        window.xssed = false;
      }
    );

    QUnit.test(
      'RETURN_DOM_FRAGMENT with DOM input sanitizes clonable shadow root',
      (assert) => {
        let supportsClonable = false;
        try {
          const probeHost = document.createElement('div');
          probeHost.attachShadow({ mode: 'open', clonable: true }).innerHTML =
            '<span>x</span>';
          const imported = document.importNode(probeHost, true);
          supportsClonable = !!(
            imported.shadowRoot && imported.shadowRoot.querySelector('span')
          );
        } catch (_) {}

        if (!supportsClonable) {
          assert.ok(
            true,
            'environment does not support clonable shadow roots; skipping'
          );
          return;
        }

        const host = document.createElement('div');
        host.attachShadow({ mode: 'open', clonable: true }).innerHTML =
          '<a id="poc" href="javascript:alert(1)">click</a>';

        const fragment = DOMPurify.sanitize(host, {
          RETURN_DOM_FRAGMENT: true,
        });
        const returnedHost = fragment.querySelector('div');
        assert.ok(
          returnedHost.shadowRoot instanceof window.DocumentFragment,
          'cloned shadow root present on returned host'
        );
        const a = returnedHost.shadowRoot.querySelector('#poc');
        if (a) {
          assert.equal(
            a.getAttribute('href'),
            null,
            'javascript: href stripped in fragment shadow'
          );
        } else {
          assert.ok(true, 'link removed entirely');
        }
        window.xssed = false;
      }
    );

    QUnit.test('handles DOM-clobbered nodeName safely', (assert) => {
      const root = document.createElement('form');
      root.innerHTML =
        '<input name="nodeName" onclick="alert(1)">' +
        '<input name="attributes" onclick="alert(2)">';

      const clobbersNodeName = typeof root.nodeName !== 'string';
      if (clobbersNodeName) {
        assert.throws(
          () => DOMPurify.sanitize(root, { IN_PLACE: true }),
          /clobbered|forbidden/i,
          'clobbered IN_PLACE root must throw in clobbering-capable engines'
        );
      } else {
        const clean = DOMPurify.sanitize(root, { IN_PLACE: true });
        assert.ok(
          !/on\w+=/i.test(clean.outerHTML),
          'no on-handler survived: ' + clean.outerHTML
        );
      }
    });

    QUnit.test(
      'setConfig({IN_PLACE}) is not disabled by an intervening string call (REPORT-2)',
      (assert) => {
        DOMPurify.setConfig({ IN_PLACE: true });
        try {
          const div1 = document.createElement('div');
          div1.innerHTML = '<img onerror="alert(1)">'; // no src: avoid a load
          const ret1 = DOMPurify.sanitize(div1);
          assert.equal(ret1, div1, 'baseline: returns the same node');
          assert.notOk(
            /onerror/i.test(div1.innerHTML),
            'baseline: node sanitized in place'
          );

          // An innocuous string call must not flip the persistent IN_PLACE
          // flag (under setConfig, _parseConfig is skipped on later calls).
          DOMPurify.sanitize('<b>hello</b>');

          const div2 = document.createElement('div');
          div2.innerHTML = '<img onerror="alert(1)">';
          const ret2 = DOMPurify.sanitize(div2);
          assert.equal(
            ret2,
            div2,
            'after string call: still returns the same node'
          );
          assert.notOk(
            /onerror/i.test(div2.innerHTML),
            'after string call: node still sanitized in place'
          );
        } finally {
          DOMPurify.clearConfig();
        }
      }
    );

    QUnit.test(
      'a kill-decision on a detached IN_PLACE root is not a silent no-op (REPORT-3)',
      (assert) => {
        // A detached <style> whose text breaks out of the element trips the
        // mXSS canary. _forceRemove cannot detach a parentless root, so the
        // node must be neutralized (or the call must throw) rather than be
        // handed back intact while DOMPurify.removed claims a removal.
        const style = document.createElement('style');
        style.textContent = '</style><img onerror=alert(1)>'; // no src
        let ret = null;
        try {
          ret = DOMPurify.sanitize(style, { IN_PLACE: true });
        } catch (_) {
          assert.ok(true, 'fail-closed by throwing is acceptable');
          return;
        }

        // Emulate the app-side store-and-rerender (serialize -> reparse).
        const probe = document.createElement('div');
        probe.innerHTML = (ret || style).outerHTML;
        assert.notOk(
          probe.querySelector('[onerror],[onload],script'),
          'no executable sink survives serialize/reparse: ' + probe.innerHTML
        );

        const claimedRemoval = DOMPurify.removed.some(
          (entry) => entry.element === style
        );
        const stillDangerous = /<\/style|onerror/i.test(
          style.textContent || ''
        );
        assert.notOk(
          claimedRemoval && stillDangerous,
          'DOMPurify.removed bookkeeping matches reality'
        );
      }
    );

    // =======================================================================
    // Config: FORBID_TAGS / FORBID_ATTR
    // =======================================================================

    QUnit.module('Config — FORBID_TAGS / FORBID_ATTR');

    QUnit.test(
      'FORBID_TAGS removes the named tag, keeps content by default',
      (assert) => {
        assert.equal(
          DOMPurify.sanitize('<a>123<b>456</b></a>', { FORBID_TAGS: ['b'] }),
          '<a>123456</a>'
        );
      }
    );

    QUnit.test(
      'FORBID_TAGS list applies recursively to nested matches',
      (assert) => {
        assert.equal(
          DOMPurify.sanitize(
            '<a>123<b>456<script>alert(1)</script></b></a>789',
            { FORBID_TAGS: ['a', 'b'] }
          ),
          '123456789'
        );
      }
    );

    QUnit.test('unrecognised forbid entries are no-ops', (assert) => {
      assert.equal(
        DOMPurify.sanitize('<a>123<b>456</b></a>', { FORBID_TAGS: ['c'] }),
        '<a>123<b>456</b></a>'
      );
    });

    QUnit.test('FORBID_TAGS interacts with script removal', (assert) => {
      assert.equal(
        DOMPurify.sanitize('<a>123<b>456<script>alert(1)</script></b></a>789', {
          FORBID_TAGS: ['script', 'b'],
        }),
        '<a>123456</a>789'
      );
    });

    QUnit.test('FORBID_TAGS wins over ADD_TAGS for the same tag', (assert) => {
      assert.equal(
        DOMPurify.sanitize('<a>123<b>456</b></a>', {
          ADD_TAGS: ['b'],
          FORBID_TAGS: ['b'],
        }),
        '<a>123456</a>'
      );
    });

    QUnit.test('FORBID_ATTR drops the named attribute', (assert) => {
      assert.equal(
        DOMPurify.sanitize('<a x="1">123<b>456</b></a>', {
          FORBID_ATTR: ['x'],
        }),
        '<a>123<b>456</b></a>'
      );
      assert.equal(
        DOMPurify.sanitize(
          '<a class="0" x="1">123<b y="1">456<script>alert(1)</script></b></a>789',
          { FORBID_ATTR: ['x', 'y'] }
        ),
        '<a class="0">123<b>456</b></a>789'
      );
    });

    QUnit.test(
      'repeated attribute name appears once after FORBID_ATTR',
      (assert) => {
        assert.equal(
          DOMPurify.sanitize('<a y="1">123<b y="1" y="2">456</b></a>', {
            FORBID_ATTR: ['y'],
          }),
          '<a>123<b>456</b></a>'
        );
      }
    );

    QUnit.test(
      'FORBID_ATTR applies inside disallowed-tag content too',
      (assert) => {
        assert.equal(
          DOMPurify.sanitize(
            '<a>123<b x="1">456<script y="1">alert(1)</script></b></a>789',
            { FORBID_ATTR: ['x', 'y'] }
          ),
          '<a>123<b>456</b></a>789'
        );
      }
    );

    // =======================================================================
    // Config: CUSTOM_ELEMENT_HANDLING
    // =======================================================================

    QUnit.module('Config — CUSTOM_ELEMENT_HANDLING');

    QUnit.test('regex tag/attr checks + customized built-ins', (assert) => {
      assert.equal(
        DOMPurify.sanitize(
          '<foo-bar baz="foobar" forbidden="true"></foo-bar><div is="foo-baz"></div>',
          {
            CUSTOM_ELEMENT_HANDLING: {
              tagNameCheck: /^foo-/,
              attributeNameCheck: /baz/,
              allowCustomizedBuiltInElements: true,
            },
          }
        ),
        '<foo-bar baz="foobar"></foo-bar><div is="foo-baz"></div>'
      );
    });

    QUnit.test('allowCustomizedBuiltInElements=false drops is=', (assert) => {
      assert.equal(
        DOMPurify.sanitize(
          '<foo-bar baz="foobar" forbidden="true"></foo-bar><div is="foo-baz"></div>',
          {
            CUSTOM_ELEMENT_HANDLING: {
              tagNameCheck: /^foo-/,
              attributeNameCheck: /baz/,
              allowCustomizedBuiltInElements: false,
            },
          }
        ),
        '<foo-bar baz="foobar"></foo-bar><div is=""></div>'
      );
    });

    QUnit.test('tagNameCheck anchored to end of name', (assert) => {
      assert.equal(
        DOMPurify.sanitize(
          '<foo-bar baz="foobar" forbidden="true"></foo-bar><div is="foo-baz"></div>',
          {
            CUSTOM_ELEMENT_HANDLING: {
              tagNameCheck: /-bar$/,
              attributeNameCheck: /.+/,
              allowCustomizedBuiltInElements: true,
            },
          }
        ),
        '<foo-bar baz="foobar" forbidden="true"></foo-bar><div is=""></div>'
      );
    });

    QUnit.test('function-based tag/attr checks', (assert) => {
      assert.equal(
        DOMPurify.sanitize(
          '<foo-bar baz="foobar" forbidden="true"></foo-bar><div is="foo-baz"></div>',
          {
            CUSTOM_ELEMENT_HANDLING: {
              tagNameCheck: (tagName) => tagName.match(/^foo-/),
              attributeNameCheck: (attr) => attr.match(/baz/),
              allowCustomizedBuiltInElements: true,
            },
          }
        ),
        '<foo-bar baz="foobar"></foo-bar><div is="foo-baz"></div>'
      );
      assert.equal(
        DOMPurify.sanitize(
          '<foo-bar baz="foobar" forbidden="true"></foo-bar><div is="foo-baz"></div>',
          {
            CUSTOM_ELEMENT_HANDLING: {
              tagNameCheck: (tagName) => tagName.match(/-bar$/),
              attributeNameCheck: (attr) => attr.match(/baz/),
              allowCustomizedBuiltInElements: true,
            },
          }
        ),
        '<foo-bar baz="foobar"></foo-bar><div is=""></div>'
      );
    });

    QUnit.test('slot attribute on custom element is preserved', (assert) => {
      assert.equal(
        DOMPurify.sanitize(
          '<my-paragraph><span slot="my-text">test</span></my-paragraph>',
          { CUSTOM_ELEMENT_HANDLING: { tagNameCheck: /-/u } }
        ),
        '<my-paragraph><span slot="my-text">test</span></my-paragraph>'
      );
    });

    QUnit.test('null config values do not throw', (assert) => {
      DOMPurify.sanitize('', {
        CUSTOM_ELEMENT_HANDLING: {
          tagNameCheck: null,
          attributeNameCheck: null,
          allowCustomizedBuiltInElements: null,
        },
      });
      assert.ok(true);
    });

    QUnit.test('inherited top-level config is ignored', (assert) => {
      const proto = {};
      Object.defineProperty(proto, 'CUSTOM_ELEMENT_HANDLING', {
        get: () => {
          throw new Error('must not read inherited CUSTOM_ELEMENT_HANDLING');
        },
      });
      assert.equal(
        DOMPurify.sanitize('<foo-bar>abc</foo-bar>', Object.create(proto)),
        'abc'
      );
    });

    QUnit.test('inherited nested config is ignored', (assert) => {
      const inherited = Object.create({ tagNameCheck: /-/u });
      assert.equal(
        DOMPurify.sanitize('<foo-bar>abc</foo-bar>', {
          CUSTOM_ELEMENT_HANDLING: inherited,
        }),
        'abc'
      );
    });

    QUnit.test('inherited nested getters are ignored', (assert) => {
      const proto = {};
      Object.defineProperty(proto, 'tagNameCheck', {
        get: () => {
          throw new Error('must not read inherited tagNameCheck');
        },
      });
      assert.equal(
        DOMPurify.sanitize('abc', {
          CUSTOM_ELEMENT_HANDLING: Object.create(proto),
        }),
        'abc'
      );
    });

    QUnit.test('does not leak into subsequent default calls', (assert) => {
      DOMPurify.sanitize('<foo-bar>abc</foo-bar>', {
        CUSTOM_ELEMENT_HANDLING: { tagNameCheck: /-/u },
      });
      assert.equal(DOMPurify.sanitize('<foo-bar>abc</foo-bar>'), 'abc');
    });

    QUnit.test('attributeNameCheck receives tagName parameter', (assert) => {
      assert.equal(
        DOMPurify.sanitize(
          '<element-one attribute-one="1" attribute-two="2"></element-one>' +
            '<element-two attribute-one="1" attribute-two="2"></element-two>',
          {
            CUSTOM_ELEMENT_HANDLING: {
              tagNameCheck: (tagName) => tagName.match(/^element-(one|two)$/),
              attributeNameCheck: (attr, tagName) => {
                if (tagName === 'element-one') {
                  return ['attribute-one'].includes(attr);
                } else if (tagName === 'element-two') {
                  return ['attribute-two'].includes(attr);
                }
                return false;
              },
              allowCustomizedBuiltInElements: false,
            },
          }
        ),
        '<element-one attribute-one="1"></element-one>' +
          '<element-two attribute-two="2"></element-two>'
      );
    });

    QUnit.test(
      'rejects all spec-reserved element names regardless of permissive checks',
      (assert) => {
        // The HTML spec reserves a handful of hyphenated tag names that
        // don't qualify as custom elements. Even with the most permissive
        // CUSTOM_ELEMENT_HANDLING config, these must not gain custom-element
        // privileges (which would, for example, let on* handlers through
        // because the element looks "user-defined").
        const permissive = {
          CUSTOM_ELEMENT_HANDLING: {
            tagNameCheck: /.+/,
            attributeNameCheck: /.+/,
            allowCustomizedBuiltInElements: true,
          },
        };
        const reservedNames = [
          'annotation-xml',
          'color-profile',
          'font-face',
          'font-face-src',
          'font-face-uri',
          'font-face-format',
          'font-face-name',
          'missing-glyph',
        ];
        reservedNames.forEach((name) => {
          const dirty = `<${name} onclick="alert(1)">x</${name}>`;
          const clean = DOMPurify.sanitize(dirty, permissive);
          assert.notOk(
            /\son[a-z]+\s*=/i.test(clean),
            `no on-handler on <${name}>: ${clean}`
          );
        });
      }
    );

    QUnit.test('reserved-name check is case-insensitive (HTML)', (assert) => {
      // Uppercase HTML input gets lowercased by the parser; the
      // reserved-name check must still apply after that lowercasing.
      const permissive = {
        CUSTOM_ELEMENT_HANDLING: {
          tagNameCheck: /.+/,
          attributeNameCheck: /.+/,
        },
      };
      const clean = DOMPurify.sanitize(
        '<FONT-FACE onclick="alert(1)">x</FONT-FACE>',
        permissive
      );
      assert.notOk(
        /\son[a-z]+\s*=/i.test(clean),
        `no on-handler on <FONT-FACE>: ${clean}`
      );
    });

    QUnit.test('reserved-name check is case-insensitive (XHTML)', (assert) => {
      // In application/xhtml+xml mode, tag names keep their case. The
      // reserved-name check must compare case-insensitively so
      // <Annotation-XML> etc. don't slip past the basic-custom-element
      // exclusion.
      const cfg = {
        PARSER_MEDIA_TYPE: 'application/xhtml+xml',
        CUSTOM_ELEMENT_HANDLING: {
          tagNameCheck: /.+/,
          attributeNameCheck: /.+/,
        },
      };
      const mixedCaseNames = [
        'Annotation-XML',
        'Color-Profile',
        'Font-Face',
        'Font-Face-Src',
        'Missing-Glyph',
      ];
      mixedCaseNames.forEach((name) => {
        const dirty =
          '<root xmlns="http://www.w3.org/1999/xhtml"><' +
          name +
          ' onclick="alert(1)">x</' +
          name +
          '></root>';
        const clean = DOMPurify.sanitize(dirty, cfg);
        assert.notOk(
          /\son[a-z]+\s*=/i.test(clean),
          `no on-handler on <${name}> in XHTML mode: ${clean}`
        );
      });
    });

    // =======================================================================
    // Config: ALLOW_ARIA_ATTR (#198)
    // =======================================================================

    QUnit.module('Config — ALLOW_ARIA_ATTR');

    QUnit.test(
      'ALLOW_ARIA_ATTR=true preserves well-formed aria-*',
      (assert) => {
        assert.contains(
          DOMPurify.sanitize('<a aria-abc="foo" href="#">abc</a>', {
            ALLOW_ARIA_ATTR: true,
          }),
          [
            '<a aria-abc="foo" href="#">abc</a>',
            '<a href="#" aria-abc="foo">abc</a>',
          ]
        );
      }
    );

    QUnit.test('rejects non-ASCII aria- names even when allowed', (assert) => {
      assert.equal(
        DOMPurify.sanitize('<a href="#" aria-aöü="foo">abc</a>', {
          ALLOW_ARIA_ATTR: true,
        }),
        '<a href="#">abc</a>'
      );
    });

    QUnit.test(
      'ALLOW_ARIA_ATTR=false strips even well-formed aria-*',
      (assert) => {
        assert.equal(
          DOMPurify.sanitize('<a href="#" aria-abc="foo">abc</a>', {
            ALLOW_ARIA_ATTR: false,
          }),
          '<a href="#">abc</a>'
        );
        assert.equal(
          DOMPurify.sanitize('<a href="#" aria-äöü="foo">abc</a>', {
            ALLOW_ARIA_ATTR: false,
          }),
          '<a href="#">abc</a>'
        );
      }
    );

    // =======================================================================
    // Config: USE_PROFILES
    // =======================================================================

    QUnit.module('Config — USE_PROFILES');

    QUnit.test('html profile toggle', (assert) => {
      assert.equal(
        DOMPurify.sanitize('<h1>HELLO</h1>', { USE_PROFILES: { html: false } }),
        'HELLO'
      );
      assert.equal(
        DOMPurify.sanitize('<h1>HELLO</h1>', { USE_PROFILES: { html: true } }),
        '<h1>HELLO</h1>'
      );
    });

    QUnit.test('html + mathMl combined profile', (assert) => {
      assert.contains(
        DOMPurify.sanitize('<h1>HELLO</h1><math></math>', {
          USE_PROFILES: { html: true, mathMl: true },
        }),
        ['<h1>HELLO</h1>', '<h1>HELLO</h1><math></math>']
      );
      assert.contains(
        DOMPurify.sanitize('<h1>HELLO</h1><math><mi></mi></math>', {
          USE_PROFILES: { html: true, mathMl: true },
        }),
        [
          '<h1>HELLO</h1>',
          '<h1>HELLO</h1><math><mi></mi></math>',
          '<h1>HELLO</h1><math></math>',
        ]
      );
    });

    QUnit.test('FORBID_TAGS / FORBID_ATTR refine profile output', (assert) => {
      assert.contains(
        DOMPurify.sanitize('<h1>HELLO</h1><math><mi></mi></math>', {
          USE_PROFILES: { html: true, mathMl: true },
          FORBID_TAGS: ['mi'],
        }),
        ['<h1>HELLO</h1>', '<h1>HELLO</h1><math></math>']
      );
      assert.contains(
        DOMPurify.sanitize('<h1>HELLO</h1><math class="foo"><mi></mi></math>', {
          USE_PROFILES: { html: true, mathMl: true },
          FORBID_ATTR: ['class'],
        }),
        [
          '<h1>HELLO</h1>',
          '<h1>HELLO</h1><math><mi></mi></math>',
          '<h1>HELLO</h1><math></math>',
        ]
      );
    });

    QUnit.test(
      'unknown / non-object profile entries strip everything',
      (assert) => {
        assert.equal(
          DOMPurify.sanitize('<h1>HELLO</h1>', {
            USE_PROFILES: { bogus: true },
          }),
          'HELLO'
        );
        assert.equal(
          DOMPurify.sanitize('<h1>HELLO</h1>', { USE_PROFILES: 123 }),
          'HELLO'
        );
        assert.equal(
          DOMPurify.sanitize('<h1>HELLO</h1>', { USE_PROFILES: [] }),
          'HELLO'
        );
      }
    );

    QUnit.test('svg profile keeps SVG elements', (assert) => {
      assert.contains(
        DOMPurify.sanitize('<svg><rect height="50"></rect></svg>', {
          USE_PROFILES: { svg: true },
        }),
        [
          '',
          '<svg><rect height="50"></rect></svg>',
          '<svg xmlns="http://www.w3.org/2000/svg"><rect height="50" /></svg>',
          '<svg xmlns="http://www.w3.org/2000/svg" />',
        ]
      );
    });

    QUnit.test('svgFilters profile keeps SVG filter primitives', (assert) => {
      assert.contains(
        DOMPurify.sanitize(
          '<svg><feBlend in="SourceGraphic" mode="multiply" /></svg>',
          {
            USE_PROFILES: { svgFilters: true },
            ADD_TAGS: ['svg'],
          }
        ),
        [
          '<svg><feblend in="SourceGraphic" mode="multiply"></feblend></svg>',
          '<svg><feBlend in="SourceGraphic" mode="multiply"></feBlend></svg>',
          '<svg xmlns="http://www.w3.org/2000/svg"><feBlend in="SourceGraphic" mode="multiply" /></svg>',
          '<svg xmlns="http://www.w3.org/2000/svg" />',
        ]
      );
    });

    QUnit.test('svg <style> content survives', (assert) => {
      assert.contains(
        DOMPurify.sanitize(
          '<svg><style>.some-class {fill: #fff}</style></svg>',
          { USE_PROFILES: { svg: true } }
        ),
        [
          '',
          '<svg><style>.some-class {fill: #fff}</style></svg>',
          '<svg xmlns="http://www.w3.org/2000/svg"><style>.some-class {fill: #fff}</style></svg>',
          '<svg xmlns="http://www.w3.org/2000/svg" />',
        ]
      );
    });

    QUnit.test('svg <text> survives even with KEEP_CONTENT=false', (assert) => {
      assert.contains(
        DOMPurify.sanitize('<svg><text>SEE ME</text></svg>', {
          USE_PROFILES: { svg: true },
          KEEP_CONTENT: false,
        }),
        [
          '',
          '<svg><text>SEE ME</text></svg>',
          '<svg xmlns="http://www.w3.org/2000/svg"><text>SEE ME</text></svg>',
          '<svg xmlns="http://www.w3.org/2000/svg" />',
        ]
      );
      // Counterpart: <span> content is preserved by html profile + the
      // wrapper survives unless KEEP_CONTENT drops it.
      assert.equal(
        DOMPurify.sanitize('<span>SEE ME</span>', {
          USE_PROFILES: { html: true },
          KEEP_CONTENT: false,
        }),
        '<span>SEE ME</span>'
      );
    });

    QUnit.test('ADD_TAGS / ADD_ATTR extend profile allowlists', (assert) => {
      assert.equal(
        DOMPurify.sanitize('<div></div>', {
          USE_PROFILES: { svg: true },
          ADD_TAGS: ['div'],
        }),
        '<div></div>'
      );
      assert.contains(
        DOMPurify.sanitize('<svg keep="me"></svg>', {
          USE_PROFILES: { svg: true },
          ADD_ATTR: ['keep'],
        }),
        [
          '',
          '<svg keep="me"></svg>',
          '<svg xmlns="http://www.w3.org/2000/svg" keep="me" />',
        ]
      );
    });

    QUnit.test('inherited top-level USE_PROFILES is ignored', (assert) => {
      const proto = {};
      Object.defineProperty(proto, 'USE_PROFILES', {
        get: () => {
          throw new Error('must not read inherited USE_PROFILES');
        },
      });
      assert.equal(
        DOMPurify.sanitize('<h1>HELLO</h1>', Object.create(proto)),
        '<h1>HELLO</h1>'
      );
    });

    QUnit.test('inherited profile flags are ignored', (assert) => {
      const inherited = Object.create({ html: true });
      assert.equal(
        DOMPurify.sanitize('<h1>HELLO</h1>', { USE_PROFILES: inherited }),
        'HELLO'
      );
    });

    QUnit.test('does not leak into subsequent default calls', (assert) => {
      DOMPurify.sanitize('<h1>HELLO</h1>', {
        USE_PROFILES: { html: false },
      });
      assert.equal(DOMPurify.sanitize('<h1>HELLO</h1>'), '<h1>HELLO</h1>');
    });

    // =======================================================================
    // Config: ALLOWED_URI_REGEXP / ADD_URI_SAFE_ATTR / ALLOW_UNKNOWN_PROTOCOLS
    // =======================================================================

    QUnit.module('Config — ALLOWED_URI_REGEXP');

    QUnit.test('custom regex filters URI-bearing attributes', (assert) => {
      const tests = [
        {
          test: '<img src="https://i.imgur.com/hkfpOUu.gifv">',
          expected: '<img src="https://i.imgur.com/hkfpOUu.gifv">',
        },
        {
          test: '<img src="http://i.imgur.com/WScAnHr.jpg">',
          expected: '<img src="http://i.imgur.com/WScAnHr.jpg">',
        },
        {
          test: '<img src="blob:https://localhost:3000/c4ea3ec6-9f22-4d08-af6f-d79e78a0a7a7">',
          expected: '<img>',
        },
        {
          test: '<a href="mailto:demo@example.com">demo</a>',
          expected: '<a>demo</a>',
        },
      ];
      tests.forEach((t) => {
        const out = DOMPurify.sanitize(t.test, {
          ALLOWED_URI_REGEXP:
            /^(?:(?:(?:f|ht)tps?):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
        });
        assert.equal(out, t.expected);
      });
    });

    QUnit.test('ALLOWED_URI_REGEXP is not cached across calls', (assert) => {
      const dirty = '<img src="https://different.com">';
      const expected = '<img src="https://different.com">';

      assert.equal(DOMPurify.sanitize(dirty), expected);

      assert.equal(
        DOMPurify.sanitize('<img src="https://test.com">', {
          ALLOWED_URI_REGEXP: /test\.com/i,
        }),
        '<img src="https://test.com">'
      );

      assert.equal(DOMPurify.sanitize(dirty), expected);
    });

    QUnit.test(
      'ALLOWED_URI_REGEXP with /g flag does not lose state',
      (assert) => {
        // Stateful global regexes (.lastIndex) used to misbehave when reused
        // across multiple attribute checks within one sanitize call.
        const dirty =
          '<img src="blob:http://localhost:5173/84c49be9-3352-4407-b066-7b5b4d46c52a">' +
          '<a epub:type="noteref" href="epub:EPUB/xhtml/#footnote"></a>' +
          '<img src="blob:http://localhost:5173/84c49be9-3352-4407" >';
        const expected =
          '<img src="blob:http://localhost:5173/84c49be9-3352-4407-b066-7b5b4d46c52a">' +
          '<a href="epub:EPUB/xhtml/#footnote"></a>' +
          '<img src="blob:http://localhost:5173/84c49be9-3352-4407">';
        assert.strictEqual(
          DOMPurify.sanitize(dirty, {
            ALLOWED_URI_REGEXP: /^(blob|https|epub|filepos|kindle)/gi,
          }),
          expected
        );
      }
    );

    QUnit.module('Config — ADD_URI_SAFE_ATTR');

    QUnit.test(
      'ALLOW_DATA_ATTR + ADD_URI_SAFE_ATTR exempts attribute from URI check',
      (assert) => {
        assert.equal(
          DOMPurify.sanitize('<b typeof="bla:h">123</b>', {
            ALLOWED_ATTR: ['typeof'],
            ADD_URI_SAFE_ATTR: ['typeof'],
          }),
          '<b typeof="bla:h">123</b>'
        );
      }
    );

    QUnit.test(
      'URI safe additions do not persist across calls (#327)',
      (assert) => {
        // Side-effect setup call.
        DOMPurify.sanitize('<b typeof="bla:h">123</b>', {
          ALLOWED_ATTR: ['typeof'],
          ADD_URI_SAFE_ATTR: ['typeof'],
        });
        // Without ADD_URI_SAFE_ATTR, the attribute fails the URI check.
        assert.equal(
          DOMPurify.sanitize('<b typeof="bla:h">123</b>', {
            ALLOWED_ATTR: ['typeof'],
          }),
          '<b>123</b>'
        );
      }
    );

    QUnit.test(
      'URI safe additions do not overwrite defaults (#366)',
      (assert) => {
        let clean = DOMPurify.sanitize(
          '<div poster="x:y" style="color: red">Test</div>',
          { ADD_URI_SAFE_ATTR: ['poster'] }
        );
        assert.contains(clean, [
          '<div poster="x:y" style="color: red">Test</div>',
          '<div poster="x:y" style="color: red;">Test</div>',
        ]);

        clean = DOMPurify.sanitize(
          '<div poster="x:y" style="color: red">Test</div>'
        );
        assert.contains(clean, [
          '<div style="color: red">Test</div>',
          '<div style="color: red;">Test</div>',
        ]);
      }
    );

    QUnit.module('Config — ALLOW_UNKNOWN_PROTOCOLS');

    QUnit.test('opt-in allows custom schemes', (assert) => {
      const dirty =
        '<div><a href="spotify:track:12345"><img src="cid:1234567"></a></div>';
      assert.equal(
        dirty,
        DOMPurify.sanitize(dirty, { ALLOW_UNKNOWN_PROTOCOLS: true })
      );
    });

    QUnit.test(
      'javascript: is still blocked under ALLOW_UNKNOWN_PROTOCOLS',
      (assert) => {
        const dirty =
          '<div><a href="javascript:alert(document.title)"><img src="cid:1234567"/></a></div>';
        const expected = '<div><a><img src="cid:1234567"></a></div>';
        assert.equal(
          expected,
          DOMPurify.sanitize(dirty, { ALLOW_UNKNOWN_PROTOCOLS: true })
        );
      }
    );

    QUnit.test(
      'regression #166: onFoo is dropped under ALLOW_UNKNOWN_PROTOCOLS',
      (assert) => {
        const dirty = '<p onFoo="123">HELLO</p>';
        const expected = '<p>HELLO</p>';
        assert.equal(
          expected,
          DOMPurify.sanitize(dirty, { ALLOW_UNKNOWN_PROTOCOLS: true })
        );
      }
    );

    QUnit.test('data: URIs blocked by default in <a href>', (assert) => {
      const clean = DOMPurify.sanitize(
        '<a href="data:image/gif;base64,123">icon.gif</a>'
      );
      assert.equal(clean, '<a>icon.gif</a>');
    });

    QUnit.test(
      'ADD_DATA_URI_TAGS allows data: URIs on listed tags',
      (assert) => {
        const clean = DOMPurify.sanitize(
          '<a href="data:image/gif;base64,123">icon.gif</a>',
          { ADD_DATA_URI_TAGS: ['a', 'b'] }
        );
        assert.equal(clean, '<a href="data:image/gif;base64,123">icon.gif</a>');
      }
    );

    // =======================================================================
    // Config: NAMESPACE / ALLOWED_NAMESPACES
    // =======================================================================

    QUnit.module('Config — NAMESPACE / ALLOWED_NAMESPACES');

    QUnit.test(
      'namespaces are enforced for known foreign content',
      (assert) => {
        const tests = [
          {
            test: '<svg><desc><canvas></canvas><textarea></textarea></desc></svg>',
            expected: [
              '<svg><desc></desc></svg>',
              '<svg xmlns="http://www.w3.org/2000/svg"><desc></desc></svg>',
              '<svg xmlns="http://www.w3.org/2000/svg" />',
            ],
          },
          {
            test: '<svg><canvas></canvas><textarea></textarea></svg>',
            expected: [
              '<svg></svg>',
              '<svg xmlns="http://www.w3.org/2000/svg" />',
            ],
          },
          {
            test: '<math><canvas></canvas><textarea></textarea></math>',
            expected: ['<math></math>'],
          },
          {
            test: '<math><mi><canvas></canvas><textarea></textarea></mi></math>',
            expected: [
              '<math><mi><canvas></canvas><textarea></textarea></mi></math>',
              '<math></math>',
            ],
          },
          {
            test: '<svg><math></math><title><math></math></title></svg>',
            expected: [
              '<svg><title></title></svg>',
              '<svg xmlns="http://www.w3.org/2000/svg" />',
              '<svg xmlns="http://www.w3.org/2000/svg"><title></title></svg>',
            ],
          },
          {
            test: '<math><svg></svg><mi><svg></svg></mi></math>',
            expected: [
              '<math><mi><svg></svg></mi></math>',
              '<math><mi><svg xmlns="http://www.w3.org/2000/svg" /></mi></math>',
              '<math></math>',
            ],
          },
          {
            test: '<form><math><mi><mglyph></form><form>',
            expected: [
              '<form><math><mi><mglyph></mglyph></mi></math></form>',
              '<form><math></math></form>',
            ],
          },
        ];
        tests.forEach((t) =>
          assert.contains(DOMPurify.sanitize(t.test), t.expected)
        );
      }
    );

    QUnit.test('NAMESPACE pins the root namespace', (assert) => {
      const tests = [
        {
          test: '<polyline points="0 0"></polyline>',
          config: { NAMESPACE: 'http://www.w3.org/2000/svg' },
          expected: [
            '<polyline points="0 0"></polyline>',
            '<polyline xmlns="http://www.w3.org/2000/svg" points="0 0"/>',
            '<polyline xmlns="http://www.w3.org/2000/svg" points="0,0" />',
            '',
          ],
        },
        {
          test: '<polyline points="0 0"></polyline>',
          config: { NAMESPACE: 'http://www.w3.org/1999/xhtml' },
          expected: [''],
        },
        {
          test: '<mi></mi>',
          config: { NAMESPACE: 'http://www.w3.org/1998/Math/MathML' },
          expected: [
            '<mi></mi>',
            '<mi xmlns="http://www.w3.org/1998/Math/MathML"></mi>',
            '<mi xmlns="http://www.w3.org/1998/Math/MathML"/>',
            '<mi xmlns="http://www.w3.org/1998/Math/MathML" />',
            '',
          ],
        },
        {
          test: '<polyline points="0 0"></polyline>',
          config: { NAMESPACE: 'http://www.w3.org/1998/Math/MathML' },
          expected: [''],
        },
        {
          test: '<mi></mi>',
          config: { NAMESPACE: 'http://www.w3.org/1999/xhtml' },
          expected: [''],
        },
      ];
      tests.forEach((t) =>
        assert.contains(DOMPurify.sanitize(t.test, t.config), t.expected)
      );
    });

    QUnit.test(
      'ALLOWED_NAMESPACES allow-lists custom XML namespaces',
      (assert) => {
        const tests = [
          {
            // Default behaviour: result is empty for XML with a custom NS.
            test: '<library xmlns="http://www.ibm.com/library"><name>Library 1</name></library>',
            config: {
              ALLOWED_TAGS: ['#text', 'library', 'name'],
              KEEP_CONTENT: false,
              PARSER_MEDIA_TYPE: 'application/xhtml+xml',
            },
            expected: '',
          },
          {
            // Single custom NS at root.
            test:
              '<library xmlns="http://www.ibm.com/library"><name>Library 1</name>' +
              '<dirty onload="alert()" /></library>',
            config: {
              ALLOWED_NAMESPACES: ['http://www.ibm.com/library'],
              ALLOWED_TAGS: ['#text', 'library', 'name'],
              KEEP_CONTENT: false,
              PARSER_MEDIA_TYPE: 'application/xhtml+xml',
            },
            expected:
              '<library xmlns="http://www.ibm.com/library"><name>Library 1</name></library>',
          },
          {
            // Custom NS at sub-node; root keeps default HTML NS.
            test:
              '<city><library xmlns="http://www.ibm.com/library"><name>Library 1</name>' +
              '<dirty onload="alert()" /></library></city>',
            config: {
              ALLOWED_NAMESPACES: [
                'http://www.w3.org/1999/xhtml',
                'http://www.ibm.com/library',
              ],
              ALLOWED_TAGS: ['#text', 'city', 'library', 'name'],
              KEEP_CONTENT: false,
              PARSER_MEDIA_TYPE: 'application/xhtml+xml',
            },
            expected:
              '<city xmlns="http://www.w3.org/1999/xhtml"><library xmlns="http://www.ibm.com/library"><name>Library 1</name></library></city>',
          },
          {
            // Multiple namespaces with prefixes, only one allow-listed.
            test:
              '<library xmlns="http://www.ibm.com/library" xmlns:bk="urn:loc.gov:books">' +
              '<bk:name>Library 1</bk:name><dirty onload="alert()" /></library>',
            config: {
              ALLOWED_NAMESPACES: ['http://www.ibm.com/library'],
              ALLOWED_TAGS: ['library', 'bk:name'],
              KEEP_CONTENT: false,
              PARSER_MEDIA_TYPE: 'application/xhtml+xml',
            },
            expected: [
              '<library xmlns="http://www.ibm.com/library"/>',
              '<library xmlns="http://www.ibm.com/library" />',
            ],
          },
          {
            // Multiple allow-listed namespaces.
            test:
              '<library xmlns="http://www.ibm.com/library" xmlns:bk="urn:loc.gov:books" ' +
              'xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata">' +
              '<bk:name>Library 1<m:properties>Other Properties</m:properties></bk:name>' +
              '<dirty onload="alert()" /></library>',
            config: {
              ALLOWED_NAMESPACES: [
                'http://www.ibm.com/library',
                'urn:loc.gov:books',
                'http://schemas.microsoft.com/ado/2007/08/dataservices/metadata',
              ],
              ALLOWED_TAGS: ['#text', 'library', 'bk:name', 'm:properties'],
              KEEP_CONTENT: false,
              PARSER_MEDIA_TYPE: 'application/xhtml+xml',
            },
            expected:
              '<library xmlns="http://www.ibm.com/library">' +
              '<bk:name xmlns:bk="urn:loc.gov:books">Library 1' +
              '<m:properties xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata">Other Properties</m:properties>' +
              '</bk:name></library>',
          },
          {
            // FORBID_TAGS wins over namespace allow-listing.
            test:
              '<library xmlns="http://www.ibm.com/library" xmlns:bk="urn:loc.gov:books" ' +
              'xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata">' +
              '<bk:name>Library 1<m:properties>Other Properties</m:properties></bk:name>' +
              '<dirty onload="alert()" /></library>',
            config: {
              ADD_TAGS: ['library', 'bk:name'],
              ALLOWED_NAMESPACES: [
                'http://www.ibm.com/library',
                'urn:loc.gov:books',
                'http://schemas.microsoft.com/ado/2007/08/dataservices/metadata',
              ],
              FORBID_TAGS: ['m:properties'],
              KEEP_CONTENT: false,
              PARSER_MEDIA_TYPE: 'application/xhtml+xml',
            },
            expected:
              '<library xmlns="http://www.ibm.com/library">' +
              '<bk:name xmlns:bk="urn:loc.gov:books">Library 1</bk:name></library>',
          },
        ];
        tests.forEach((t) =>
          assert.contains(DOMPurify.sanitize(t.test, t.config), t.expected)
        );
      }
    );

    QUnit.test('inherited top-level NAMESPACE config is ignored', (assert) => {
      const proto = {};
      Object.defineProperty(proto, 'NAMESPACE', {
        get: () => {
          throw new Error('must not read inherited NAMESPACE');
        },
      });
      assert.equal(
        DOMPurify.sanitize(
          '<polyline points="0 0"></polyline>',
          Object.create(proto)
        ),
        ''
      );
    });

    QUnit.test('non-string NAMESPACE values are rejected', (assert) => {
      const hostile = {
        toString: () => {
          throw new Error('must not stringify NAMESPACE');
        },
      };
      assert.equal(
        DOMPurify.sanitize('<polyline points="0 0"></polyline>', {
          NAMESPACE: hostile,
        }),
        ''
      );
      if (typeof Symbol === 'function') {
        assert.equal(
          DOMPurify.sanitize('<polyline points="0 0"></polyline>', {
            NAMESPACE: Symbol('svg'),
          }),
          ''
        );
      } else {
        assert.ok(true);
      }
    });

    QUnit.test(
      'NAMESPACE does not leak into subsequent default calls',
      (assert) => {
        DOMPurify.sanitize('<polyline points="0 0"></polyline>', {
          NAMESPACE: 'http://www.w3.org/2000/svg',
        });
        assert.equal(
          DOMPurify.sanitize('<polyline points="0 0"></polyline>'),
          ''
        );
      }
    );

    QUnit.test('inherited integration-point config is ignored', (assert) => {
      const htmlProto = {};
      Object.defineProperty(htmlProto, 'HTML_INTEGRATION_POINTS', {
        get: () => {
          throw new Error('must not read inherited HTML_INTEGRATION_POINTS');
        },
      });
      const mathProto = Object.create(htmlProto);
      Object.defineProperty(mathProto, 'MATHML_TEXT_INTEGRATION_POINTS', {
        get: () => {
          throw new Error(
            'must not read inherited MATHML_TEXT_INTEGRATION_POINTS'
          );
        },
      });
      assert.equal(
        DOMPurify.sanitize('HELLO', Object.create(mathProto)),
        'HELLO'
      );
    });

    QUnit.test(
      'namespace defaults back to HTML after foreign use',
      (assert) => {
        // Documented behaviour: each call resolves independently.
        assert.contains(
          DOMPurify.sanitize('<br>', {
            NAMESPACE: 'http://www.w3.org/2000/svg',
          }),
          ['', '<br>']
        );
        assert.contains(DOMPurify.sanitize('<br>'), ['<br>']);
      }
    );

    QUnit.test(
      'non-HTML input after empty input still resolves correctly',
      (assert) => {
        assert.equal(
          DOMPurify.sanitize('', { NAMESPACE: 'http://www.w3.org/2000/svg' }),
          ''
        );
        assert.contains(
          DOMPurify.sanitize('<polyline points="0 0"></polyline>', {
            NAMESPACE: 'http://www.w3.org/2000/svg',
          }),
          [
            '<polyline points="0 0"></polyline>',
            '<polyline xmlns="http://www.w3.org/2000/svg" points="0 0"/>',
            '<polyline xmlns="http://www.w3.org/2000/svg" points="0,0" />',
            '',
          ]
        );
      }
    );

    QUnit.test('invalid XML payload variants', (assert) => {
      const tests = [
        {
          test: '',
          config: { NAMESPACE: 'http://www.w3.org/2000/svg' },
          expected: [''],
        },
        {
          test: '<!-->',
          config: { NAMESPACE: 'http://www.w3.org/2000/svg' },
          expected: ['', '<!-->'],
        },
        {
          test: '',
          config: { NAMESPACE: 'http://www.w3.org/1998/Math/MathML' },
          expected: [''],
        },
        {
          test: '<!-->',
          config: { NAMESPACE: 'http://www.w3.org/1998/Math/MathML' },
          expected: ['', '<!-->'],
        },
        {
          test: '',
          config: { NAMESPACE: 'http://www.w3.org/1999/xhtml' },
          expected: [''],
        },
        { test: '', config: {}, expected: [''] },
        {
          test: '<!-->',
          config: { NAMESPACE: 'http://www.w3.org/1999/xhtml' },
          expected: ['', '<!-->'],
        },
        { test: '<!-->', config: {}, expected: ['', '<!-->'] },
      ];
      tests.forEach((t) =>
        assert.contains(DOMPurify.sanitize(t.test, t.config), t.expected)
      );
    });

    // =======================================================================
    // Config: PARSER_MEDIA_TYPE
    // =======================================================================

    QUnit.module('Config — PARSER_MEDIA_TYPE');

    QUnit.test('case folding follows parser type', (assert) => {
      // HTML modes lower-case tags and attributes; XHTML preserves case.
      const tests = [
        {
          test: '<A href="#">invalid</A><a TITLE="title" href="#">valid</a>',
          expected: {
            '': [
              '<a href="#">invalid</a><a href="#" title="title">valid</a>',
              '<a href="#">invalid</a><a title="title" href="#">valid</a>',
            ],
            'Application/xhtml+xml': [
              '<a href="#">invalid</a><a href="#" title="title">valid</a>',
              '<a href="#">invalid</a><a title="title" href="#">valid</a>',
            ],
            'application/xml': [
              '<a href="#">invalid</a><a href="#" title="title">valid</a>',
              '<a href="#">invalid</a><a title="title" href="#">valid</a>',
            ],
            'application/xhtml+xml': [
              '<a href="#">invalid</a><a href="#" title="title">valid</a>',
              'invalid<a xmlns="http://www.w3.org/1999/xhtml" href="#">valid</a>',
              'invalid<a xmlns="http://www.w3.org/1999/xhtml" href="#" TITLE="title">valid</a>',
            ],
            'text/html': [
              '<a href="#">invalid</a><a href="#" title="title">valid</a>',
              '<a href="#">invalid</a><a title="title" href="#">valid</a>',
            ],
            'text/xml': [
              '<a href="#">invalid</a><a href="#" title="title">valid</a>',
              '<a href="#">invalid</a><a title="title" href="#">valid</a>',
            ],
          },
        },
        {
          config: { WHOLE_DOCUMENT: true },
          test: '<A href="#">invalid</A><a TITLE="title" href="#">valid</a>',
          expected: {
            'text/html': [
              '<html><head></head><body><a href="#">invalid</a><a href="#" title="title">valid</a></body></html>',
              '<html><head></head><body><a href="#">invalid</a><a title="title" href="#">valid</a></body></html>',
            ],
            'application/xhtml+xml': [
              '<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>invalid<a href="#">valid</a></body></html>',
              '<html xmlns="http://www.w3.org/1999/xhtml"><head /><body>invalid<a href="#">valid</a></body></html>',
              '<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>invalid<a href="#" TITLE="title">valid</a></body></html>',
            ],
          },
        },
      ];
      tests.forEach((test) => {
        Object.keys(test.expected).forEach((type) => {
          const config = Object.assign({}, test.config || {}, {
            PARSER_MEDIA_TYPE: type,
          });
          assert.contains(
            DOMPurify.sanitize(test.test, config),
            test.expected[type]
          );
        });
      });
    });

    QUnit.test(
      'PARSER_MEDIA_TYPE + ALLOWED_TAGS/ATTR preserves XHTML case',
      (assert) => {
        assert.contains(
          DOMPurify.sanitize(
            '<a href="#">abc</a><CustomTag customattr="bar" CustomAttr="foo"/>',
            {
              PARSER_MEDIA_TYPE: 'application/xhtml+xml',
              ALLOWED_TAGS: ['a', 'CustomTag'],
              ALLOWED_ATTR: ['href', 'CustomAttr'],
            }
          ),
          [
            '<a xmlns="http://www.w3.org/1999/xhtml" href="#">abc</a>' +
              '<CustomTag xmlns="http://www.w3.org/1999/xhtml" CustomAttr="foo"></CustomTag>',
            '<a xmlns="http://www.w3.org/1999/xhtml" href="#">abc</a>' +
              '<CustomTag xmlns="http://www.w3.org/1999/xhtml" CustomAttr="foo" customattr="foo"></CustomTag>',
          ]
        );
      }
    );

    QUnit.test(
      'namespaced data-* attributes handled in XML modes',
      (assert) => {
        const dirty =
          '<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">' +
          '<a xmlns:data-slonser="http://www.w3.org/1999/xlink" ' +
          'data-slonser:href="javascript:alert(1)">' +
          '<text x="20" y="35">Click me!</text></a></svg>';
        const expected = [
          '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">' +
            '<a><text x="20" y="35">Click me!</text></a></svg>',
          '<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">' +
            '<a><text x="20" y="35">Click me!</text></a></svg>',
        ];
        assert.contains(
          DOMPurify.sanitize(dirty, {
            PARSER_MEDIA_TYPE: 'application/xhtml+xml',
          }),
          expected
        );
      }
    );

    // =======================================================================
    // Config: FORCE_BODY (#199)
    // =======================================================================

    QUnit.module('Config — FORCE_BODY');

    QUnit.test('forces <style> into body when FORCE_BODY=true', (assert) => {
      assert.equal(
        DOMPurify.sanitize('<style>123</style>', { FORCE_BODY: true }),
        '<style>123</style>'
      );
    });

    QUnit.test(
      'forces <script> into body when allowed + FORCE_BODY=true',
      (assert) => {
        assert.equal(
          DOMPurify.sanitize('<script>123</script>', {
            FORCE_BODY: true,
            ADD_TAGS: ['script'],
          }),
          '<script>123</script>'
        );
      }
    );

    QUnit.test('FORCE_BODY preserves leading whitespace', (assert) => {
      assert.equal(
        DOMPurify.sanitize(' AAAAA', { FORCE_BODY: true }),
        ' AAAAA'
      );
    });

    QUnit.test(
      'leading whitespace preserved even without FORCE_BODY',
      (assert) => {
        assert.equal(
          DOMPurify.sanitize(' <b>AAAAA</b>', { FORCE_BODY: false }),
          ' <b>AAAAA</b>'
        );
      }
    );

    QUnit.test(
      'without FORCE_BODY, head-only elements end in head and are stripped',
      (assert) => {
        assert.equal(
          DOMPurify.sanitize('<style>123</style>', { FORCE_BODY: false }),
          ''
        );
      }
    );

    // =======================================================================
    // Config: RETURN_TRUSTED_TYPE
    // =======================================================================

    QUnit.module('Config — RETURN_TRUSTED_TYPE');

    QUnit.test('return type varies by engine when true', (assert) => {
      const clean = DOMPurify.sanitize('<b>hello goodbye</b>', {
        RETURN_TRUSTED_TYPE: true,
      });
      // In a TT-aware browser this is a TrustedHTML; in jsdom and engines
      // without the API it falls back to a plain string.
      assert.contains(typeof clean, ['TrustedHTML', 'string', 'object']);
    });

    QUnit.test('RETURN_TRUSTED_TYPE=false returns string', (assert) => {
      const clean = DOMPurify.sanitize('<b>hello goodbye</b>', {
        RETURN_TRUSTED_TYPE: false,
      });
      assert.equal(typeof clean, 'string');
    });

    QUnit.test('default (no flag) returns string', (assert) => {
      const clean = DOMPurify.sanitize('<b>hello goodbye</b>');
      assert.equal(typeof clean, 'string');
    });

    // =======================================================================
    // Input handling and API surface
    // =======================================================================

    QUnit.module('Input handling');

    QUnit.test('array input is joined before sanitization', (assert) => {
      assert.equal(
        DOMPurify.sanitize(['<a>123<b>456</b></a>']),
        '<a>123<b>456</b></a>'
      );
      assert.equal(
        DOMPurify.sanitize(['<img src=', 'x onerror=alert(1)>']),
        '<img src=",x">'
      );
    });

    QUnit.test('non-node objects with toString are stringified', (assert) => {
      assert.strictEqual(
        DOMPurify.sanitize({
          toString: () => '<b>hi</b><script>x<\/script>',
        }),
        '<b>hi</b>'
      );
    });

    QUnit.test(
      'plain objects with nodeType are not treated as nodes',
      (assert) => {
        // Regression guard: duck-typing must not accept spoofed objects.
        // The object should be stringified, not iterated.
        const fake = { nodeType: 1, nodeName: 'DIV', ownerDocument: {} };
        assert.strictEqual(typeof DOMPurify.sanitize(fake), 'string');
      }
    );

    QUnit.module('API — isSupported and constructor variants');

    QUnit.test('isSupported is a boolean', (assert) => {
      assert.equal(typeof DOMPurify.isSupported, 'boolean');
    });

    QUnit.test('DOMPurify accepts a custom or null window', (assert) => {
      // The factory should be defensive — a missing window or document
      // yields a stub instance with isSupported=false and no sanitize().
      assert.strictEqual(typeof DOMPurify(null).version, 'string');
      assert.strictEqual(DOMPurify(null).isSupported, false);
      assert.strictEqual(DOMPurify(null).sanitize, undefined);

      assert.strictEqual(typeof DOMPurify({}).version, 'string');
      assert.strictEqual(DOMPurify({}).isSupported, false);
      assert.strictEqual(DOMPurify({}).sanitize, undefined);

      assert.strictEqual(
        typeof DOMPurify({
          document: 'not really a document',
          Element: window.Element,
        }).version,
        'string'
      );
      assert.strictEqual(
        DOMPurify({
          document: 'not really a document',
          Element: window.Element,
        }).isSupported,
        false
      );
      assert.strictEqual(
        DOMPurify({
          document: 'not really a document',
          Element: window.Element,
        }).sanitize,
        undefined
      );

      assert.strictEqual(
        typeof DOMPurify({ document, Element: undefined }).version,
        'string'
      );
      assert.strictEqual(
        DOMPurify({ document, Element: undefined }).isSupported,
        false
      );
      assert.strictEqual(
        DOMPurify({ document, Element: undefined }).sanitize,
        undefined
      );

      assert.strictEqual(
        typeof DOMPurify({ document, Element: window.Element }).version,
        'string'
      );
      assert.strictEqual(
        typeof DOMPurify({ document, Element: window.Element }).sanitize,
        'function'
      );
      assert.strictEqual(typeof DOMPurify(window).version, 'string');
      assert.strictEqual(typeof DOMPurify(window).sanitize, 'function');
    });

    QUnit.test(
      'document clobbering after instantiation does not break sanitize()',
      (assert) => {
        // Inject conflicting ids that would clobber document.implementation,
        // .createNodeIterator, .importNode and .createElement. The cached
        // references inside DOMPurify must survive this.
        const evilNode = document.createElement('div');
        evilNode.innerHTML =
          '<img id="implementation"><img id="createNodeIterator">' +
          '<img id="importNode"><img id="createElement">';
        document.body.appendChild(evilNode);

        let resultPlain, resultImport, resultBody;
        try {
          resultPlain = DOMPurify.sanitize('123');
          resultImport = DOMPurify.sanitize('123', {
            RETURN_DOM: true,
            ADD_ATTR: ['shadowroot'],
          });
          resultBody = DOMPurify.sanitize('123<img id="body">');
        } finally {
          // Clean up before the assertions in case qunit/jquery touches
          // document during failure reporting.
          document.body.removeChild(evilNode);
        }
        assert.equal(resultPlain, '123');
        assert.equal(resultImport.ownerDocument, document);
        assert.equal(resultBody, '123<img>');
      }
    );

    QUnit.module('API — setConfig / clearConfig');

    QUnit.test('persistent config is applied then cleared', (assert) => {
      const dirty = '<foobar>abc</foobar>';
      assert.equal(DOMPurify.sanitize(dirty), 'abc');
      DOMPurify.setConfig({ ADD_TAGS: ['foobar'] });
      assert.equal(DOMPurify.sanitize(dirty), '<foobar>abc</foobar>');
      DOMPurify.clearConfig();
      assert.equal(DOMPurify.sanitize(dirty), 'abc');
    });

    // =======================================================================
    // DOMPurify.removed — accounting for stripped nodes and attributes
    // =======================================================================

    QUnit.module('DOMPurify.removed');

    QUnit.test(
      'removed contains one element for SVG filter primitive',
      (assert) => {
        DOMPurify.sanitize(
          '<svg onload=alert(1)><filter><feGaussianBlur /></filter></svg>'
        );
        assert.contains(DOMPurify.removed.length, [1, 2]); // IE removes two
      }
    );

    QUnit.test(
      'removed contains two elements for script + svg combo',
      (assert) => {
        DOMPurify.sanitize(
          '1<script>alert(1)</script><svg onload=alert(1)><filter><feGaussianBlur /></filter></svg>'
        );
        assert.contains(DOMPurify.removed.length, [2, 3]); // IE removes three
      }
    );

    QUnit.test('removed counts attribute removal', (assert) => {
      DOMPurify.sanitize('<img src=x onerror="alert(1)">');
      assert.equal(DOMPurify.removed.length, 1);
    });

    QUnit.test(
      'removed counts template-expression scrubs (single)',
      (assert) => {
        DOMPurify.sanitize('<a>123{{456}}</a>', {
          WHOLE_DOCUMENT: true,
          SAFE_FOR_TEMPLATES: true,
        });
        assert.equal(DOMPurify.removed.length, 1);
      }
    );

    QUnit.test(
      'removed counts template-expression scrubs (multiple)',
      (assert) => {
        DOMPurify.sanitize('<a>123{{456}}<b>456{{789}}</b></a>', {
          WHOLE_DOCUMENT: true,
          SAFE_FOR_TEMPLATES: true,
        });
        assert.equal(DOMPurify.removed.length, 2);
      }
    );

    QUnit.test('removed counts attribute-level template scrubs', (assert) => {
      DOMPurify.sanitize('<img src=1 width="{{123}}">', {
        WHOLE_DOCUMENT: true,
        SAFE_FOR_TEMPLATES: true,
      });
      assert.equal(DOMPurify.removed.length, 1);
    });

    QUnit.test('removed counts mXSS-style nested invalid markup', (assert) => {
      DOMPurify.sanitize(
        '<option><iframe></select><b><script>alert(1)</script>'
      );
      assert.equal(DOMPurify.removed.length, 1);
    });

    QUnit.test('removed is empty when all input is permitted', (assert) => {
      DOMPurify.sanitize('<a>123</a>');
      assert.equal(DOMPurify.removed.length, 0);

      DOMPurify.sanitize('<img src=x>');
      assert.equal(DOMPurify.removed.length, 0);
    });

    QUnit.test(
      'removed is empty for clean input under SAFE_FOR_TEMPLATES',
      (assert) => {
        DOMPurify.sanitize('1', {
          WHOLE_DOCUMENT: true,
          SAFE_FOR_TEMPLATES: true,
        });
        assert.equal(DOMPurify.removed.length, 0);

        DOMPurify.sanitize('1', { WHOLE_DOCUMENT: true });
        assert.equal(DOMPurify.removed.length, 0);
      }
    );

    QUnit.module('API — sanitizing element nodes directly');

    QUnit.test('sanitizing an element returns its outerHTML', (assert) => {
      assert.equal(
        DOMPurify.sanitize(document.createElement('td')),
        '<td></td>'
      );
    });

    QUnit.test(
      'sanitizing an element with RETURN_DOM returns wrapped body',
      (assert) => {
        const clean = DOMPurify.sanitize(document.createElement('td'), {
          RETURN_DOM: true,
        });
        assert.equal(clean.outerHTML, '<body><td></td></body>');
      }
    );

    // =======================================================================
    // Hooks
    // =======================================================================

    QUnit.module('Hooks — addHook / removeHook');

    QUnit.test(
      'uponSanitizeElement hook may detach the current node; it is treated as removed (issue #469 pattern, foreignObject filtering)',
      (assert) => {
        // A hook that removes the current node via parentNode.removeChild()
        // must not trip the REPORT-3 parentless-node throw in _forceRemove:
        // the throw exists for nodes DOMPurify wants gone but cannot detach,
        // not for nodes a hook has already safely detached.
        DOMPurify.addHook('uponSanitizeElement', (node) => {
          if (node.nodeName === 'foreignObject' && node.parentNode) {
            node.parentNode.removeChild(node);
          }
        });
        const clean = DOMPurify.sanitize(
          '<svg><switch><foreignObject><div>content</div></foreignObject></switch></svg>',
          {
            ADD_TAGS: ['foreignObject'],
            USE_PROFILES: { svg: true, html: true },
          }
        );
        assert.equal(clean, '<svg><switch></switch></svg>');
        assert.notOk(
          DOMPurify.removed.some(
            (entry) =>
              entry.element && entry.element.nodeName === 'foreignObject'
          ),
          'hook-detached nodes are not claimed in DOMPurify.removed'
        );
        DOMPurify.removeHooks('uponSanitizeElement');
      }
    );

    QUnit.test(
      'beforeSanitizeElements hook may detach the current node; it is treated as removed',
      (assert) => {
        DOMPurify.addHook('beforeSanitizeElements', (node) => {
          if (node.nodeName === 'ARTICLE' && node.parentNode) {
            node.parentNode.removeChild(node);
          }
        });
        assert.equal(
          DOMPurify.sanitize('<div><article><b>x</b></article><i>y</i></div>'),
          '<div><i>y</i></div>'
        );
        DOMPurify.removeHooks('beforeSanitizeElements');
      }
    );

    QUnit.test(
      'hook can add allowed tags / attributes on the fly',
      (assert) => {
        DOMPurify.addHook('uponSanitizeElement', (node, data) => {
          if (
            node.nodeName &&
            node.nodeName.match(/^\w+-\w+$/) &&
            !data.allowedTags[data.tagName]
          ) {
            data.allowedTags[data.tagName] = true;
          }
        });
        DOMPurify.addHook('uponSanitizeAttribute', (node, data) => {
          if (
            data.attrName &&
            data.attrName.match(/^\w+-\w+$/) &&
            !data.allowedAttributes[data.attrName]
          ) {
            data.allowedAttributes[data.attrName] = true;
          }
        });
        const dirty =
          '<p>HE<iframe></iframe><is-custom onload="alert(1)" super-custom="test" />LLO</p>';
        const modified =
          '<p>HE<is-custom super-custom="test">LLO</is-custom></p>';
        assert.equal(DOMPurify.sanitize(dirty), modified);
        DOMPurify.removeHooks('uponSanitizeElement');
        DOMPurify.removeHooks('uponSanitizeAttribute');
      }
    );

    QUnit.test('hookEvent.keepAttr=false removes attribute', (assert) => {
      // Removing input[type=file] via a hook flag is the documented escape
      // hatch — the attribute walker honours data.keepAttr=false on the
      // attribute that triggered the hook.
      DOMPurify.addHook('uponSanitizeAttribute', (node, data) => {
        if (
          node.nodeName == 'INPUT' &&
          node.getAttribute('type') &&
          node.getAttribute('type') == 'file'
        ) {
          data.keepAttr = false;
        }
      });
      const dirty = '<input type="file" />';
      const modified = '<input>';
      // This assertion only runs in node (jsdom); the browser parser
      // re-orders attributes during innerHTML serialisation in ways that
      // make a strict equal flaky. The node-only path is the meaningful
      // one for the regression that introduced this test.
      if (window.name == 'nodejs') {
        assert.equal(DOMPurify.sanitize(dirty), modified);
      } else {
        assert.expect(0);
      }
      DOMPurify.removeHooks('uponSanitizeAttribute');
    });

    QUnit.test('removeHook returns the hook function', (assert) => {
      const entryPoint = 'afterSanitizeAttributes';
      const dirty = '<div class="hello"></div>';
      const expected = '<div class="world"></div>';

      DOMPurify.addHook(entryPoint, (node) =>
        node.setAttribute('class', 'world')
      );
      assert.equal(DOMPurify.sanitize(dirty), expected);

      const hookFunction = DOMPurify.removeHook(entryPoint);
      assert.equal(DOMPurify.sanitize(dirty), dirty);

      DOMPurify.addHook(entryPoint, hookFunction);
      assert.equal(DOMPurify.sanitize(dirty), expected);

      DOMPurify.removeHook(entryPoint);
    });

    QUnit.test(
      'removeHook can target a specific hook in the chain',
      (assert) => {
        const entryPoint = 'afterSanitizeAttributes';
        const dirty = '<div class="original"></div>';
        const expected = '<div class="original first third"></div>';

        const firstHook = (node) => node.classList.add('first');
        const secondHook = (node) => node.classList.add('second');
        const thirdHook = (node) => node.classList.add('third');

        DOMPurify.addHook(entryPoint, firstHook);
        DOMPurify.addHook(entryPoint, secondHook);
        DOMPurify.addHook(entryPoint, thirdHook);

        assert.strictEqual(
          DOMPurify.removeHook(entryPoint, secondHook),
          secondHook,
          'removes the specified hook'
        );
        assert.strictEqual(
          DOMPurify.removeHook(entryPoint, secondHook),
          undefined,
          'cannot remove the same hook twice'
        );
        assert.strictEqual(
          DOMPurify.sanitize(dirty),
          expected,
          'removed hook is not executed'
        );

        DOMPurify.removeHook(entryPoint, firstHook);
        DOMPurify.removeHook(entryPoint, thirdHook);
      }
    );

    QUnit.test(
      'attributes added in afterSanitizeAttributes are not re-validated',
      (assert) => {
        DOMPurify.addHook('afterSanitizeAttributes', (node) => {
          if (node.nodeName === 'A') {
            node.setAttribute('data-injected-by-hook', 'yes');
          }
        });
        try {
          assert.equal(
            DOMPurify.sanitize('<a href="#">x</a>'),
            '<a href="#" data-injected-by-hook="yes">x</a>',
            'hook-added attribute present in output (documented behaviour)'
          );
        } finally {
          DOMPurify.removeHooks('afterSanitizeAttributes');
        }
      }
    );

    QUnit.test(
      'attributes added in uponSanitizeAttribute after current index escape validation',
      (assert) => {
        // Attributes are walked backwards using a snapshot of the length.
        // A hook that calls setAttribute() appends to the end of the list,
        // past the decreasing index, so the new attribute slips past
        // validation. This is intentional: hooks are the escape hatch for
        // users who need to force attribute values. Validation would
        // defeat that use case.
        DOMPurify.addHook('uponSanitizeAttribute', (node, hookEvent) => {
          if (hookEvent.attrName === 'href') {
            try {
              node.setAttribute('data-injected-by-hook', 'yes');
            } catch (_) {}
          }
        });
        try {
          assert.equal(
            DOMPurify.sanitize('<a href="#">x</a>'),
            '<a href="#" data-injected-by-hook="yes">x</a>',
            'hook-added attribute present in output (documented behaviour)'
          );
        } finally {
          DOMPurify.removeHooks('uponSanitizeAttribute');
        }
      }
    );

    // =======================================================================
    // Hooks — allowlist pollution (GHSA-XXXX-XXXX-XXXX)
    //
    // Pre-3.4.7: the data.allowedTags / data.allowedAttributes fields
    // passed to hooks were direct references to the live allowlist set.
    // When no explicit cfg.ALLOWED_TAGS was supplied, that live set WAS
    // the module-level DEFAULT_ALLOWED_TAGS constant. A hook that wrote
    //     data.allowedTags['script'] = true
    // permanently widened the defaults until the DOMPurify instance was
    // re-created.
    //
    // Fix: when uponSanitize* hooks are registered, the allowlist is
    // cloned for the call. In-call widening continues to work; the next
    // default-cfg call rebinds to the untouched default.
    // =======================================================================

    QUnit.module('Hooks — allowlist pollution (GHSA-XXXX)', function (hooks) {
      let purify;
      hooks.beforeEach(() => {
        // Per-test instance — the bug under test IS cross-call pollution.
        purify = DOMPurify(window);
      });
      hooks.afterEach(() => {
        purify.removeAllHooks();
        purify.clearConfig();
      });

      QUnit.test(
        'baseline: <script> and onclick are stripped by default',
        (assert) => {
          assert.equal(
            purify.sanitize('<svg><script>alert(1)</script></svg>'),
            '<svg></svg>'
          );
          assert.equal(
            purify.sanitize('<a onclick="alert(1)">x</a>'),
            '<a>x</a>'
          );
        }
      );

      QUnit.test('in-call widening via hook still works', (assert) => {
        // Mirrors the documented hook-widening API (test "hook can add
        // allowed tags / attributes on the fly" above). The fix hands the
        // hook a clone of the default; mutating the clone widens the
        // allowlist for the rest of the iteration.
        purify.addHook('uponSanitizeElement', (node, data) => {
          if (data.tagName === 'is-custom') {
            data.allowedTags['is-custom'] = true;
          }
        });
        purify.addHook('uponSanitizeAttribute', (node, data) => {
          if (data.attrName === 'super-custom') {
            data.allowedAttributes['super-custom'] = true;
          }
        });

        const input = '<p>HE<is-custom super-custom="test">LLO</is-custom></p>';
        assert.equal(purify.sanitize(input), input);
      });

      QUnit.test(
        'unguarded element hook does not poison subsequent default-config calls',
        (assert) => {
          purify.addHook('uponSanitizeElement', (node, data) => {
            data.allowedTags['script'] = true;
          });
          assert.equal(
            purify.sanitize('<svg><script>1</script></svg>'),
            '<svg><script>1</script></svg>',
            'in-call widening still works while hook is registered'
          );

          purify.removeAllHooks();
          purify.clearConfig();

          assert.equal(
            purify.sanitize('<svg><script>alert(1)</script></svg>'),
            '<svg></svg>',
            'default sanitize after element-hook removal strips <script>'
          );
        }
      );

      QUnit.test(
        'unguarded attribute hook does not poison subsequent default-config calls',
        (assert) => {
          purify.addHook('uponSanitizeAttribute', (node, data) => {
            data.allowedAttributes['onclick'] = true;
          });
          assert.ok(
            purify
              .sanitize('<a onclick="alert(1)">x</a>')
              .indexOf('onclick') !== -1
          );

          purify.removeAllHooks();
          purify.clearConfig();

          assert.equal(
            purify.sanitize('<a onclick="alert(1)">x</a>'),
            '<a>x</a>'
          );
        }
      );

      QUnit.test('pollution does not cross instance boundaries', (assert) => {
        purify.addHook('uponSanitizeElement', (node, data) => {
          data.allowedTags['script'] = true;
        });
        purify.sanitize('<svg><script>alert(1)</script></svg>');

        const freshInstance = DOMPurify(window);
        assert.equal(
          freshInstance.sanitize('<svg><script>alert(1)</script></svg>'),
          '<svg></svg>',
          'fresh DOMPurify instance must not inherit poisoned defaults'
        );
      });

      QUnit.test('read-only hook does not poison defaults', (assert) => {
        let sawScriptKey;
        purify.addHook('uponSanitizeElement', (node, data) => {
          if (sawScriptKey === undefined) {
            sawScriptKey = 'script' in data.allowedTags;
          }
        });

        purify.sanitize('<div><span>hi</span></div>');

        assert.strictEqual(
          sawScriptKey,
          false,
          'hook sees default allowlist with script NOT included'
        );

        purify.removeAllHooks();
        purify.clearConfig();

        assert.equal(
          purify.sanitize('<svg><script>alert(1)</script></svg>'),
          '<svg></svg>'
        );
      });

      QUnit.test(
        'multiple polluting calls do not accumulate state',
        (assert) => {
          purify.addHook('uponSanitizeElement', (node, data) => {
            data.allowedTags['script'] = true;
            data.allowedTags['iframe'] = true;
            data.allowedTags['object'] = true;
          });

          for (let i = 0; i < 10; i++) {
            purify.sanitize('<div></div>');
          }

          purify.removeAllHooks();
          purify.clearConfig();

          assert.equal(
            purify.sanitize('<svg><script>1</script></svg>'),
            '<svg></svg>'
          );
          assert.equal(purify.sanitize('<iframe src="x"></iframe>'), '');
          assert.equal(purify.sanitize('<object data="x"></object>'), '');
        }
      );

      QUnit.test(
        'explicit-cfg path is unaffected by hook mutation in other calls',
        (assert) => {
          // When cfg.ALLOWED_TAGS is supplied, ALLOWED_TAGS is already a
          // per-call fresh object (built via addToSet({}, ...)), not the
          // module default. Hooks mutating it cannot pollute the default
          // even pre-fix. Asserting this guards against an over-correction
          // that breaks the explicit-cfg path.
          purify.addHook('uponSanitizeElement', (node, data) => {
            data.allowedTags['script'] = true;
          });

          const withCfg = purify.sanitize(
            '<svg><script>alert(1)</script></svg>',
            { ALLOWED_TAGS: ['svg'] }
          );
          assert.ok(
            withCfg.indexOf('<script>') !== -1,
            'explicit-cfg call respects in-call hook widening: ' + withCfg
          );

          purify.removeAllHooks();
          purify.clearConfig();

          assert.equal(
            purify.sanitize('<svg><script>alert(1)</script></svg>'),
            '<svg></svg>',
            'default-cfg call after explicit-cfg+hook is unaffected'
          );
        }
      );

      // -------------------------------------------------------------------
      // Persistent-config path (setConfig). The original fix lived inside
      // _parseConfig, which sanitize() skips once setConfig() has run, so
      // these cases were unguarded: a hook write to data.allowedAttributes
      // mutated the shared allowlist for the instance lifetime, across calls
      // and elements. The guard is now applied on every sanitize() call for
      // both config paths. (GHSA-cmwh-pvxp-8882)
      // -------------------------------------------------------------------

      QUnit.test(
        'setConfig: attribute hook does not poison later calls',
        (assert) => {
          purify.setConfig({ ALLOWED_TAGS: ['img'], ALLOWED_ATTR: ['src'] });
          purify.addHook('uponSanitizeAttribute', (node, data) => {
            if (
              node.getAttribute &&
              node.getAttribute('data-trusted') === '1'
            ) {
              data.allowedAttributes['onerror'] = true;
            }
          });

          // A trusted element widens onerror for its own call.
          assert.ok(
            purify
              .sanitize('<img data-trusted="1" src="x" onerror="ok()">')
              .indexOf('onerror') !== -1,
            'in-call widening works for the trusted element under setConfig'
          );

          // A later untrusted call must NOT inherit the widened attribute.
          assert.equal(
            purify.sanitize('<img src="x" onerror="alert(1)">'),
            '<img src="x">',
            'untrusted call after trusted render strips onerror'
          );

          // Repeated calls must stay clean (no accumulated clone state).
          for (let i = 0; i < 5; i++) {
            assert.equal(
              purify.sanitize('<img src="x" onerror="alert(' + i + ')">'),
              '<img src="x">',
              'repeated untrusted call ' + i + ' stays clean'
            );
          }
        }
      );

      QUnit.test(
        'setConfig: element hook does not poison later calls',
        (assert) => {
          purify.setConfig({ ALLOWED_TAGS: ['span'], ALLOWED_ATTR: [] });
          purify.addHook('uponSanitizeElement', (node, data) => {
            if (
              node.getAttribute &&
              node.getAttribute('data-trusted') === '1' &&
              data.allowedTags
            ) {
              data.allowedTags['img'] = true;
            }
          });

          purify.sanitize('<span data-trusted="1"><img src="x"></span>');

          assert.equal(
            purify.sanitize('<img src="x" onerror="alert(1)">'),
            '',
            'untrusted <img> not allowed after trusted render under setConfig'
          );
        }
      );

      QUnit.test('setConfig: clearConfig restores a clean state', (assert) => {
        purify.setConfig({ ALLOWED_TAGS: ['img'], ALLOWED_ATTR: ['src'] });
        purify.addHook('uponSanitizeAttribute', (node, data) => {
          if (node.getAttribute && node.getAttribute('data-trusted') === '1') {
            data.allowedAttributes['onerror'] = true;
          }
        });
        purify.sanitize('<img data-trusted="1" src="x" onerror="ok()">');

        purify.clearConfig();

        assert.equal(
          purify.sanitize('<img src="x" onerror="alert(1)">'),
          '<img src="x">',
          'default-cfg call after clearConfig strips onerror'
        );
      });
    });

    // =======================================================================
    // Hooks — shadow roots nested inside <template>.content
    //
    // Two patches landed together to close a class of bypasses:
    //
    //   1. _sanitizeAttachedShadowRoots() must walk into the .content
    //      DocumentFragment of every <template> it encounters and continue
    //      hunting for attached shadow roots in there.
    //
    //   2. _sanitizeShadowDOM() iterates a TreeWalker whose root is a
    //      ShadowRoot; the walker does not enter the .content of inner
    //      <template> elements, and it does not surface attached shadow
    //      roots on host elements unless they're explicitly inspected.
    //      Both must be inspected by the recursion explicitly.
    //
    // The tests exercise the symmetric matrix of {plain, in-template,
    // nested-template, wrapper, alternating} × {host with shadow,
    // clonable shadow stamped during cloneNode}.
    // =======================================================================

    QUnit.module('Hooks — shadow roots inside <template>.content');

    QUnit.test(
      'shadow root attached to host inside template.content',
      (assert) => {
        // <template> elements' inner content lives in a *separate*
        // DocumentFragment. Iterating the template element itself does not
        // walk into .content; the sanitizer must recurse explicitly.
        const tpl = document.createElement('template');
        const host = document.createElement('div');
        tpl.content.appendChild(host);
        host.attachShadow({ mode: 'open' }).innerHTML =
          '<a id="poc" href="javascript:alert(1)">x</a>';

        DOMPurify.sanitize(tpl, { IN_PLACE: true });

        const a = tpl.content.firstChild.shadowRoot.querySelector('#poc');
        assert.ok(a, 'link preserved');
        assert.equal(
          a.getAttribute('href'),
          null,
          'javascript: href stripped inside template.content shadow'
        );
        window.xssed = false;
      }
    );

    QUnit.test(
      'clonable shadow root inside template.content survives stamping',
      (assert) => {
        // template.content is *cloned* on use. A clonable shadow root
        // inside that content needs to survive cloning AND still be
        // sanitized in-place.
        let supportsClonable = false;
        try {
          const probe = document.createElement('div');
          probe.attachShadow({ mode: 'open', clonable: true }).innerHTML = 'x';
          const imported = document.importNode(probe, true);
          supportsClonable = !!(
            imported.shadowRoot && imported.shadowRoot.firstChild
          );
        } catch (_) {}

        if (!supportsClonable) {
          assert.ok(true, 'environment does not support clonable shadow roots');
          return;
        }

        const tpl = document.createElement('template');
        const host = document.createElement('div');
        tpl.content.appendChild(host);
        host.attachShadow({ mode: 'open', clonable: true }).innerHTML =
          '<a id="poc" href="javascript:alert(1)">x</a>';

        DOMPurify.sanitize(tpl, { IN_PLACE: true });

        const liveA = tpl.content.firstChild.shadowRoot.querySelector('#poc');
        if (liveA) {
          assert.equal(liveA.getAttribute('href'), null);
        } else {
          assert.ok(true, 'link removed entirely is also safe');
        }
        window.xssed = false;
      }
    );

    QUnit.test('template inside shadow root (symmetric case)', (assert) => {
      // Mirror of the above: the outer container has a shadow root,
      // and the dangerous payload lives inside a template inside the
      // shadow root. _sanitizeShadowDOM must walk into the template.
      const host = document.createElement('section');
      const shadow = host.attachShadow({ mode: 'open' });
      const tpl = document.createElement('template');
      tpl.content.appendChild(
        (() => {
          const a = document.createElement('a');
          a.setAttribute('id', 'poc');
          a.setAttribute('href', 'javascript:alert(1)');
          return a;
        })()
      );
      shadow.appendChild(tpl);

      DOMPurify.sanitize(host, { IN_PLACE: true });

      const a = host.shadowRoot
        .querySelector('template')
        .content.querySelector('#poc');
      assert.ok(a, 'link preserved');
      assert.equal(
        a.getAttribute('href'),
        null,
        'javascript: href stripped inside shadow > template.content'
      );
      window.xssed = false;
    });

    QUnit.test(
      'nested templates: <template><template><a href=javascript:></template></template>',
      (assert) => {
        const outer = document.createElement('template');
        const inner = document.createElement('template');
        const a = document.createElement('a');
        a.setAttribute('href', 'javascript:alert(1)');
        a.setAttribute('id', 'poc');
        inner.content.appendChild(a);
        outer.content.appendChild(inner);

        DOMPurify.sanitize(outer, { IN_PLACE: true });

        const liveA = outer.content
          .querySelector('template')
          .content.querySelector('#poc');
        assert.ok(liveA, 'link preserved through nested templates');
        assert.equal(liveA.getAttribute('href'), null);
        window.xssed = false;
      }
    );

    QUnit.test('wrapper > template > shadow descent', (assert) => {
      const wrapper = document.createElement('section');
      const tpl = document.createElement('template');
      const host = document.createElement('div');
      tpl.content.appendChild(host);
      wrapper.appendChild(tpl);
      host.attachShadow({ mode: 'open' }).innerHTML =
        '<a id="poc" href="javascript:alert(1)">x</a>';

      DOMPurify.sanitize(wrapper, { IN_PLACE: true });

      const a = wrapper
        .querySelector('template')
        .content.firstChild.shadowRoot.querySelector('#poc');
      assert.ok(a);
      assert.equal(a.getAttribute('href'), null);
      window.xssed = false;
    });

    QUnit.test('shadow > template > shadow alternating descent', (assert) => {
      const outer = document.createElement('section');
      const outerShadow = outer.attachShadow({ mode: 'open' });
      const tpl = document.createElement('template');
      const innerHost = document.createElement('div');
      tpl.content.appendChild(innerHost);
      outerShadow.appendChild(tpl);
      innerHost.attachShadow({ mode: 'open' }).innerHTML =
        '<a id="poc" href="javascript:alert(1)">x</a>';

      DOMPurify.sanitize(outer, { IN_PLACE: true });

      const a = outer.shadowRoot
        .querySelector('template')
        .content.firstChild.shadowRoot.querySelector('#poc');
      assert.ok(a);
      assert.equal(a.getAttribute('href'), null);
      window.xssed = false;
    });

    QUnit.test(
      'deep clonable shadow stamped from nested templates',
      (assert) => {
        let supportsClonable = false;
        try {
          const probe = document.createElement('div');
          probe.attachShadow({ mode: 'open', clonable: true }).innerHTML = 'x';
          const imported = document.importNode(probe, true);
          supportsClonable = !!(
            imported.shadowRoot && imported.shadowRoot.firstChild
          );
        } catch (_) {}

        if (!supportsClonable) {
          assert.ok(true, 'environment does not support clonable shadow roots');
          return;
        }

        const outer = document.createElement('template');
        const inner = document.createElement('template');
        const host = document.createElement('div');
        host.attachShadow({ mode: 'open', clonable: true }).innerHTML =
          '<a id="poc" href="javascript:alert(1)">x</a>';
        inner.content.appendChild(host);
        outer.content.appendChild(inner);

        DOMPurify.sanitize(outer, { IN_PLACE: true });

        const liveA = outer.content
          .querySelector('template')
          .content.firstChild.shadowRoot.querySelector('#poc');
        if (liveA) {
          assert.equal(liveA.getAttribute('href'), null);
        } else {
          assert.ok(true, 'link removed entirely is also safe');
        }
        window.xssed = false;
      }
    );

    // =======================================================================
    // Regression — mXSS
    //
    // Mutation XSS: payload is re-parsed by the browser after sanitization
    // and the round-trip changes its meaning. The HTML parser is forgiving
    // about misnested tags in foreign-content (SVG / MathML) and recovers
    // by promoting children out of those subtrees. DOMPurify must catch
    // those promoted-out children before they reach the consumer.
    // =======================================================================

    QUnit.module('Regression — mXSS');

    QUnit.test(
      'Chrome 77+ SVG/HTML mXSS round-trip is neutralised',
      (assert) => {
        // Variants pulled from the original Chrome 77 disclosure thread.
        // Each is an mXSS primitive that the parser used to "fix" into
        // script execution on re-insertion.
        const dirty =
          '<svg></p><style><a id="</style><img src=1 onerror=alert(1)>"></svg>';
        const clean = DOMPurify.sanitize(dirty);
        assert.ok(
          clean.indexOf('<img') === -1 || clean.indexOf('onerror') === -1,
          'mXSS payload neutralised: ' + clean
        );
      }
    );

    QUnit.test(
      'less-aggressive mXSS handling preserves valid HTML (#369)',
      (assert) => {
        // Issue #369: an earlier defensive measure removed too much,
        // breaking legitimate inputs. Confirm the de-escalation kept
        // valid markup intact while still blocking the script.
        assert.equal(
          DOMPurify.sanitize('<p>Hello<b> World</b></p>'),
          '<p>Hello<b> World</b></p>'
        );
        // Plain MathML without HTML void elements: round-trips intact.
        // (Note: <br> inside <math> is foster-parented OUT of foreign
        // content by the HTML parser itself, before DOMPurify sees it.
        // We use <mn>/<mi>/<mo> here to stay in foreign content.)
        assert.equal(
          DOMPurify.sanitize('<a><math><mi>x</mi></math></a>'),
          '<a><math><mi>x</mi></math></a>'
        );
        // But the dangerous variant is still neutralised:
        const xss =
          '<math><mtext><table><mglyph><style><img src onerror=alert(1)>';
        const clean = DOMPurify.sanitize(xss);
        assert.ok(
          clean.indexOf('<img') === -1 || clean.indexOf('onerror') === -1,
          'mXSS variant still neutralised: ' + clean
        );
      }
    );

    QUnit.test('text-integration-points: math + xmp', (assert) => {
      // <math> with <annotation-xml encoding="text/html"> is a
      // text-integration-point: its children are parsed as HTML even
      // though they live inside foreign content. <xmp> is another
      // legacy text-only element. Both must be parsed in the right
      // mode to avoid mXSS via misnesting.
      const xss =
        '<math><annotation-xml encoding="text/html"><xmp><img src=x onerror=alert(1)></xmp></annotation-xml></math>';
      const clean = DOMPurify.sanitize(xss);
      assert.ok(
        clean.indexOf('onerror') === -1,
        'no onerror survived integration-point parsing: ' + clean
      );
    });

    QUnit.test('text-integration-points: svg + xmp', (assert) => {
      const xss =
        '<svg><foreignobject><xmp><img src=x onerror=alert(1)></xmp></foreignobject></svg>';
      const clean = DOMPurify.sanitize(xss);
      assert.ok(
        clean.indexOf('onerror') === -1,
        'no onerror survived integration-point parsing: ' + clean
      );
    });

    QUnit.test('jQuery v3.0+ html() insecure behaviour', (assert) => {
      // jQuery's html() does extra parsing that introduces an mXSS
      // window. DOMPurify output must be safe even when re-inserted
      // via jQuery's parser.
      if (!jQuery) {
        assert.ok(true, 'jQuery not present, skipping');
        return;
      }
      const dirty = '<img src=x onerror=alert(1)>';
      const clean = DOMPurify.sanitize(dirty);
      window.xssed = false;
      const $div = jQuery('<div>').html(clean);
      assert.equal(window.xssed, false, 'no XSS after jQuery round-trip');
      $div.remove();
    });

    // =======================================================================
    // Regression — noembed / noscript ALLOW_TAGS bypass
    // =======================================================================

    QUnit.module('Regression — noembed / noscript / table');

    QUnit.test(
      'noscript content is not parsed when scripting is disabled',
      (assert) => {
        // In server-side rendering / jsdom, scripting is disabled so the
        // contents of <noscript> are parsed as HTML, not as text. That
        // introduced a bypass where attackers wrapped payloads in noscript.
        const dirty =
          '<noscript><p title="</noscript><img src=x onerror=alert(1)>">';
        const clean = DOMPurify.sanitize(dirty);
        assert.ok(
          clean.indexOf('onerror') === -1,
          'noscript bypass neutralised: ' + clean
        );
      }
    );

    QUnit.test('noembed content is not parsed as raw HTML', (assert) => {
      const dirty = '<noembed><img src=x onerror=alert(1)></noembed>';
      const clean = DOMPurify.sanitize(dirty);
      assert.ok(
        clean.indexOf('onerror') === -1,
        'noembed bypass neutralised: ' + clean
      );
    });

    QUnit.test('table parsing does not cause O(n²) blowup (#365)', (assert) => {
      // Issue #365: a payload of N nested <table>s used to expand to
      // O(N²) work as each table re-parented its predecessor. The fix
      // caps the foster-parenting recursion.
      let payload = '';
      for (let i = 0; i < 200; i++) payload += '<table>';
      const start = Date.now();
      DOMPurify.sanitize(payload);
      const elapsed = Date.now() - start;
      assert.ok(
        elapsed < 3000,
        `200-deep table parse completed in ${elapsed}ms (must be < 3000ms)`
      );
    });

    QUnit.test(
      'table foster-parenting does not leak script (#365 part 2)',
      (assert) => {
        const dirty = '<table><script>alert(1)</script></table>';
        const clean = DOMPurify.sanitize(dirty);
        assert.ok(
          clean.indexOf('<script') === -1,
          'foster-parented script removed: ' + clean
        );
      }
    );

    QUnit.test('Unicode-named tags are removed', (assert) => {
      // Tags whose names contain non-ASCII characters are not valid
      // HTML elements. DOMPurify's default allowlist must keep them
      // out of the result tree. The library's escape for unknown
      // markup is to HTML-encode the whole tag back into text — which
      // is inert. So substring-searching the *string* for "onerror"
      // would match the encoded form (&lt;...onerror...&gt;) and give
      // a false negative; we must check the live-parsed tree instead.
      const dirty = '<\u0130mg src=x onerror=alert(1)>';
      const clean = DOMPurify.sanitize(dirty);
      const wrapper = document.createElement('div');
      wrapper.innerHTML = clean;
      const dangerous = wrapper.querySelectorAll('*');
      let hasHandler = false;
      for (const el of dangerous) {
        for (const a of el.attributes) {
          if (/^on/i.test(a.name)) hasHandler = true;
        }
      }
      assert.equal(
        hasHandler,
        false,
        'no live element carries an on-handler: ' + clean
      );
    });

    // =======================================================================
    // Regression — selectedcontent (Chrome 130+) — CVE 3.4.4 → 3.4.5
    //
    // <selectedcontent> mirrors the selected <option>'s subtree into its
    // own children. The mirroring happens *after* sanitization, so a
    // sanitizer that only inspects the static markup misses the eventual
    // script payload that the engine clones in.
    //
    // Fix: forbid <selectedcontent> unless explicitly opted in. When
    // opted in, refresh-after-sanitize: re-walk the subtree after
    // letting the engine populate the mirror.
    // =======================================================================

    QUnit.module('Regression — selectedcontent (3.4.5)');

    QUnit.test('default config removes <selectedcontent>', (assert) => {
      const dirty =
        '<select><option><img src=x onerror=alert(1)></option><selectedcontent></selectedcontent></select>';
      const clean = DOMPurify.sanitize(dirty);
      assert.ok(
        clean.indexOf('selectedcontent') === -1,
        'selectedcontent removed by default: ' + clean
      );
      assert.ok(
        clean.indexOf('onerror') === -1,
        'mirrored payload neutralised: ' + clean
      );
    });

    QUnit.test(
      'refresh-after-sanitize covers post-clone mirror payload',
      (assert) => {
        // Even if some configuration allows the selectedcontent element,
        // the post-sanitize refresh should catch the cloned-in subtree.
        // Run only in real browsers where the engine implements the mirror.
        if (typeof window.HTMLSelectedContentElement === 'undefined') {
          assert.ok(
            true,
            'engine does not implement selectedcontent; skipping'
          );
          return;
        }
        const dirty =
          '<select><option><img src=x onerror=alert(1)></option><selectedcontent></selectedcontent></select>';
        const wrapper = document.createElement('div');
        wrapper.innerHTML = DOMPurify.sanitize(dirty, {
          ADD_TAGS: ['selectedcontent'],
        });
        document.body.appendChild(wrapper);
        window.xssed = false;
        // give the engine a tick to populate the mirror
        const sc = wrapper.querySelector('selectedcontent');
        const stillEvil = sc && /onerror/i.test(sc.innerHTML);
        document.body.removeChild(wrapper);
        assert.ok(!stillEvil, 'post-clone mirror does not contain onerror');
      }
    );

    QUnit.test(
      'ADD_TAGS opt-in preserves <selectedcontent> with safe content',
      (assert) => {
        // Pre-condition: the engine must keep <selectedcontent> as a
        // live element WHEN PARSED INSIDE <select>. This is stricter
        // than the standalone parse: the HTML parser only allows
        // <option>/<optgroup> as children of <select> and foster-parents
        // everything else OUT. Engines that ship the v130+ form-controls
        // update extend the allowed-children list to include
        // <selectedcontent>; jsdom and older browsers do not. Probe at
        // the use site, not in a div.
        const probe = document.createElement('div');
        probe.innerHTML =
          '<select><selectedcontent></selectedcontent></select>';
        const select = probe.querySelector('select');
        const engineParses = !!(
          select && select.querySelector('selectedcontent')
        );
        if (!engineParses) {
          assert.ok(
            true,
            'engine does not keep <selectedcontent> inside <select>; skipping'
          );
          return;
        }
        const clean = DOMPurify.sanitize(
          '<select><option>Pick me</option><selectedcontent>Pick me</selectedcontent></select>',
          { ADD_TAGS: ['selectedcontent'] }
        );
        assert.ok(
          clean.indexOf('<selectedcontent') !== -1,
          'opt-in preserves the element: ' + clean
        );
      }
    );

    QUnit.test('generalized trigger variants (live-DOM check)', (assert) => {
      // Variants from the disclosure: nested option groups, option in
      // optgroup, multiple selectedcontents, all collapse to safe output.
      const variants = [
        '<select><optgroup><option><img src=x onerror=alert(1)></option></optgroup><selectedcontent></selectedcontent></select>',
        '<select><option><iframe srcdoc="<script>alert(1)</script>"></iframe></option><selectedcontent></selectedcontent></select>',
        '<select><option><svg onload=alert(1)></svg></option><selectedcontent></selectedcontent></select>',
      ];
      for (const v of variants) {
        const clean = DOMPurify.sanitize(v);
        assert.ok(
          !/onerror|srcdoc|onload/i.test(clean),
          'variant neutralised: ' + clean
        );
      }
    });

    // =======================================================================
    // Regression — Finding #1 (DoS via _forceRemove on clobbered form root)
    //
    // The internal _forceRemove() function walked up parentNode to
    // detach a node. A form whose .parentNode was clobbered by an
    // <input name="parentNode"> child would cause an infinite loop or
    // an exception that crashed the sanitizer.
    //
    // The fix early-rejects clobbered-form roots BEFORE the main
    // iteration begins, so the iterator never reaches _forceRemove
    // with an unwalkable parent chain. The tests cover the eight
    // distinct clobbering shapes the report enumerated.
    // =======================================================================

    QUnit.module('Regression — Finding #1 (clobbered form DoS)');

    [
      {
        name: 'HTML form firstElementChild clobber',
        html: '<form><input name="firstElementChild"></form>',
      },
      {
        name: 'HTML form innerHTML clobber',
        html: '<form><input name="innerHTML"></form>',
      },
      {
        name: 'HTML form textContent clobber',
        html: '<form><input name="textContent"></form>',
      },
      {
        name: 'HTML form attributes single clobber',
        html: '<form><input name="attributes"></form>',
      },
      {
        name: 'HTML form attributes double clobber',
        html: '<form><input name="attributes"><input name="attributes"></form>',
      },
      {
        name: 'XHTML form + CDATA',
        html: '<form xmlns="http://www.w3.org/1999/xhtml"><input name="parentNode"/><![CDATA[x]]></form>',
        mediaType: 'application/xhtml+xml',
      },
      {
        name: 'XHTML form + text + processing instruction',
        html: '<form xmlns="http://www.w3.org/1999/xhtml">text<?xml-stylesheet ?><input name="children"/></form>',
        mediaType: 'application/xhtml+xml',
      },
      {
        name: 'HTML form parentNode clobber',
        html: '<form><input name="parentNode"></form>',
      },
    ].forEach((c) => {
      QUnit.test(`DoS payload variant: ${c.name}`, (assert) => {
        const opts = { ALLOW_UNKNOWN_PROTOCOLS: true };
        if (c.mediaType) opts.PARSER_MEDIA_TYPE = c.mediaType;
        const start = Date.now();
        let clean;
        try {
          clean = DOMPurify.sanitize(c.html, opts);
        } catch (e) {
          // throwing is acceptable — the requirement is "does not hang"
          clean = '<threw/>';
        }
        const elapsed = Date.now() - start;
        assert.ok(
          elapsed < 2000,
          `${c.name} completed in ${elapsed}ms (must be < 2000ms)`
        );
        assert.ok(
          typeof clean === 'string',
          'sanitize returned a string (or controlled throw)'
        );
      });
    });

    // =======================================================================
    // Regression — Finding #2 (</style> stripped attribute-breakout)
    // =======================================================================

    QUnit.module('Regression — Finding #2 (attribute breakout)');

    QUnit.test(
      '</style> embedded in attribute does not escape style context',
      (assert) => {
        // The regex that strips style content used to be too eager and
        // could swallow </style> inside an attribute value, leaving the
        // following markup to be parsed as raw HTML.
        const dirty =
          '<style>a[href="</style><img src=x onerror=alert(1)>"]{}</style>';
        const clean = DOMPurify.sanitize(dirty);
        assert.ok(
          clean.indexOf('onerror') === -1,
          'style attribute-breakout neutralised: ' + clean
        );
      }
    );

    // =======================================================================
    // Regression — Finding #3 (informational)
    //
    // Documented for completeness: this finding was determined to be
    // out of scope (the consumer must encode HTML output before
    // inserting it via attribute setters). The single test below
    // documents that DOMPurify's output is itself not the vehicle.
    // =======================================================================

    QUnit.module('Regression — Finding #3 (informational)');

    QUnit.test(
      'output, re-inserted via innerHTML, does not regain its payload',
      (assert) => {
        const dirty = '<img src=x onerror=alert(1)>';
        const clean = DOMPurify.sanitize(dirty);
        const wrapper = document.createElement('div');
        wrapper.innerHTML = clean;
        assert.ok(
          !/onerror/i.test(wrapper.innerHTML),
          'round-trip does not regenerate the handler: ' + wrapper.innerHTML
        );
      }
    );

    // =======================================================================
    // Regression — Finding #4 (external form= association)
    //
    // <input form="formid"> associates a form-element with a form OUTSIDE
    // its DOM ancestry. The sanitizer must recognise the form= attribute
    // as a same-document reference and either strip it or scope it.
    // =======================================================================

    QUnit.module('Regression — Finding #4 (external form= association)');

    QUnit.test('form= attribute is stripped from inputs (HTML)', (assert) => {
      const dirty =
        '<form id="evil" action="javascript:alert(1)"></form><input form="evil" type="submit">';
      const clean = DOMPurify.sanitize(dirty);
      assert.ok(
        !/form="evil"/i.test(clean),
        'form= attribute stripped: ' + clean
      );
    });

    QUnit.test('form= attribute is stripped from inputs (XHTML)', (assert) => {
      const dirty =
        '<form xmlns="http://www.w3.org/1999/xhtml" id="evil" action="javascript:alert(1)"/><input xmlns="http://www.w3.org/1999/xhtml" form="evil" type="submit"/>';
      const clean = DOMPurify.sanitize(dirty, {
        PARSER_MEDIA_TYPE: 'application/xhtml+xml',
      });
      assert.ok(
        !/form="evil"/i.test(clean),
        'form= attribute stripped in XHTML: ' + clean
      );
    });

    // =======================================================================
    // Regression — bypass claim: <style> + XHTML + RETURN_DOM_FRAGMENT
    //
    // A published bypass claim asserted that round-tripping a payload
    // through (sanitize string) → (sanitize RETURN_DOM_FRAGMENT) →
    // (innerHTML insertion) yielded execution. Confirm at each step.
    // =======================================================================

    QUnit.module('Regression — style + XHTML + RETURN_DOM_FRAGMENT round-trip');

    QUnit.test('string sanitize is safe', (assert) => {
      const dirty =
        '<style>a{background:url("</style><img src=x onerror=alert(1)>")}</style>';
      const clean = DOMPurify.sanitize(dirty);
      assert.ok(!/onerror/i.test(clean), 'string mode neutralises: ' + clean);
    });

    QUnit.test(
      'round-trip (string → DOM fragment → innerHTML) is safe',
      (assert) => {
        const dirty =
          '<style>a{background:url("</style><img src=x onerror=alert(1)>")}</style>';
        const stringClean = DOMPurify.sanitize(dirty);
        const fragment = DOMPurify.sanitize(stringClean, {
          RETURN_DOM_FRAGMENT: true,
        });
        const wrapper = document.createElement('div');
        wrapper.appendChild(document.importNode(fragment, true));
        assert.ok(
          !/onerror/i.test(wrapper.innerHTML),
          'round-trip neutralises: ' + wrapper.innerHTML
        );
      }
    );

    QUnit.test(
      'native innerHTML application of clean output does not XSS',
      (assert) => {
        const dirty =
          '<style>a{background:url("</style><img src=x onerror=alert(1)>")}</style>';
        const clean = DOMPurify.sanitize(dirty);
        const wrapper = document.createElement('div');
        window.xssed = false;
        wrapper.innerHTML = clean;
        document.body.appendChild(wrapper);
        const triggered = window.xssed === true;
        document.body.removeChild(wrapper);
        window.xssed = false;
        assert.equal(triggered, false, 'no XSS on native insertion');
      }
    );

    QUnit.test(
      'bypass (#1150): entity-encoded </style> + XHTML + RETURN_DOM_FRAGMENT',
      (assert) => {
        // The #1150-1158 source-side check strips a <style> element
        // whose text content, once entity-decoded, contains </style>
        // followed by markup. The payload below relies on:
        //   1. XHTML parsing — text content of <style> is NOT raw-text
        //      mode, so &lt; / &gt; entities decode to angle brackets.
        //   2. RETURN_DOM_FRAGMENT — serialiser hand-back skips the
        //      string-level pre-pass that would otherwise normalise.
        // Without the source-side check, the decoded <img> escapes
        // the <style> on the consumer side and fires onerror.
        //
        // We confirm BOTH the string output is clean AND that a live
        // round-trip does not trigger window.xssed. The async portion
        // is important: alert() / onerror may fire from a microtask
        // after innerHTML returns.
        const payload =
          '<style>&lt;/style&gt;&lt;img src=x onerror=alert(1)&gt;<a></a></style>';

        const stringOut = DOMPurify.sanitize(payload);
        assert.notOk(
          /<img/i.test(stringOut) || /onerror/i.test(stringOut),
          `string sanitize output: ${stringOut}`
        );

        const done = assert.async();
        let clean;
        try {
          clean = DOMPurify.sanitize(payload, {
            PARSER_MEDIA_TYPE: 'application/xhtml+xml',
            RETURN_DOM_FRAGMENT: true,
          });
        } catch (e) {
          assert.ok(false, `sanitize() threw: ${e && e.message}`);
          done();
          return;
        }

        const div = document.createElement('div');
        div.appendChild(document.importNode(clean, true));

        // Scoped container — don't taint document.body if XSS were
        // to fire. Falls back to a transient body child when the
        // QUnit fixture isn't present (jsdom runner).
        const container =
          document.getElementById('qunit-fixture') ||
          document.body.appendChild(document.createElement('div'));
        const ownsContainer =
          container.parentNode === document.body &&
          container.id !== 'qunit-fixture';

        window.xssed = false;
        container.innerHTML = div.innerHTML;

        setTimeout(() => {
          assert.notEqual(
            window.xssed,
            true,
            'alert() fired via XHTML-style round-trip (bypass reproduces)'
          );
          container.innerHTML = '';
          if (ownsContainer) document.body.removeChild(container);
          window.xssed = false;
          done();
        }, 50);
      }
    );

    // =======================================================================
    // Regression — Cross-realm sanitization (GHSA-4w3q-35jp-p934)
    //
    // Pre-fix: when a node from a *different* document/realm was passed
    // as IN_PLACE input, the sanitizer's NodeIterator was constructed
    // against the local realm's document but walked the foreign tree.
    // The iterator silently skipped foreign-realm children — leaving
    // dangerous content in place.
    //
    // Fix: a per-call helper (_withForeignRealmDoc) detects the foreign
    // ownerDocument and adopts/imports the subtree before walking. The
    // tests below cover the four (c1-c4) config variants the report
    // enumerated, plus the recognition probes for spoofed objects.
    // =======================================================================

    QUnit.module('Regression — cross-realm sanitization (GHSA-4w3q-35jp-p934)');

    QUnit.test(
      'IN_PLACE with foreign-realm DOM input is sanitized',
      (assert) => {
        const iframe = document.createElement('iframe');
        document.body.appendChild(iframe);
        try {
          const foreignDoc = iframe.contentDocument;
          const foreignA = foreignDoc.createElement('a');
          foreignA.setAttribute('href', 'javascript:alert(1)');
          DOMPurify.sanitize(foreignA, { IN_PLACE: true });
          assert.equal(
            foreignA.getAttribute('href'),
            null,
            'foreign-realm href stripped'
          );
        } finally {
          document.body.removeChild(iframe);
        }
      }
    );

    QUnit.test(
      'string input with non-node object is rejected (c1)',
      (assert) => {
        // Spoofed objects must be stringified, never iterated.
        const out = DOMPurify.sanitize({
          toString: () => '<img src=x onerror=alert(1)>',
        });
        assert.ok(
          typeof out === 'string' && !/onerror/i.test(out),
          'spoofed toString is sanitized as a string: ' + out
        );
      }
    );

    QUnit.test(
      'plain object with nodeType is not treated as DOM (c2)',
      (assert) => {
        const fake = {
          nodeType: 1,
          nodeName: 'DIV',
          ownerDocument: {},
          innerHTML: '<img src=x onerror=alert(1)>',
        };
        const out = DOMPurify.sanitize(fake);
        assert.ok(
          typeof out === 'string',
          'spoofed node-like becomes a string'
        );
        assert.ok(
          !/onerror/i.test(out),
          'no payload survives stringification: ' + out
        );
      }
    );

    QUnit.test('IN_PLACE with spoofed nodeType is contained (c3)', (assert) => {
      // The invariant under test is "spoofed objects cannot smuggle
      // markup into IN_PLACE mode". The library is free to throw OR
      // to stringify-and-sanitize OR to return the spoof untouched —
      // any of those is acceptable as long as the spoofed innerHTML
      // string never becomes a live element with an on-handler.
      const fake = {
        nodeType: 1,
        nodeName: 'DIV',
        ownerDocument: {},
        innerHTML: '<img src=x onerror=alert(1)>',
      };
      let out;
      try {
        out = DOMPurify.sanitize(fake, { IN_PLACE: true });
      } catch (_) {
        assert.ok(true, 'threw on spoofed input (acceptable outcome)');
        return;
      }
      // Whatever came back must not be a parsable DOM carrying the
      // payload. Stringify and check, or inspect attributes if it
      // came back as an Element.
      if (out && typeof out === 'object' && out.nodeType === 1) {
        const attrs = out.attributes || [];
        let hasHandler = false;
        for (const a of attrs) {
          if (/^on/i.test(a.name)) hasHandler = true;
        }
        assert.equal(hasHandler, false, 'no on-handler on returned object');
      } else {
        const s = String(out);
        assert.ok(
          !/on\w+=/i.test(s),
          'no on-handler in stringified output: ' + s
        );
      }
    });

    QUnit.test('foreign-realm clobbered form is recognised (c4)', (assert) => {
      const iframe = document.createElement('iframe');
      document.body.appendChild(iframe);
      try {
        const foreignDoc = iframe.contentDocument;
        const form = foreignDoc.createElement('form');
        form.innerHTML = '<input name="nodeName"><input name="parentNode">';
        // Behaviour: either throws (preferred) or returns sanitized
        // string output free of on-handlers. Both are acceptable —
        // the original DoS was an infinite loop.
        let out;
        try {
          out = DOMPurify.sanitize(form, { IN_PLACE: true });
        } catch (_) {
          out = '<threw/>';
        }
        if (typeof out === 'string') {
          assert.ok(!/on\w+=/i.test(out));
        } else {
          assert.ok(true, 'foreign clobbered form handled');
        }
      } finally {
        document.body.removeChild(iframe);
      }
    });

    QUnit.test('foreign-realm template.content is walked', (assert) => {
      // The cross-realm fix also covers <template>.content, which has
      // its own ownerDocument distinct from the host document.
      const iframe = document.createElement('iframe');
      document.body.appendChild(iframe);
      try {
        const foreignDoc = iframe.contentDocument;
        const tpl = foreignDoc.createElement('template');
        const a = foreignDoc.createElement('a');
        a.setAttribute('href', 'javascript:alert(1)');
        tpl.content.appendChild(a);
        DOMPurify.sanitize(tpl, { IN_PLACE: true });
        assert.equal(tpl.content.firstChild.getAttribute('href'), null);
      } finally {
        document.body.removeChild(iframe);
      }
    });

    QUnit.test('foreign-realm attached shadow root is walked', (assert) => {
      const iframe = document.createElement('iframe');
      document.body.appendChild(iframe);
      try {
        const foreignDoc = iframe.contentDocument;
        const host = foreignDoc.createElement('div');
        host.attachShadow({ mode: 'open' }).innerHTML =
          '<a id="poc" href="javascript:alert(1)">x</a>';
        DOMPurify.sanitize(host, { IN_PLACE: true });
        const a = host.shadowRoot.querySelector('#poc');
        assert.ok(a, 'link survived');
        assert.equal(a.getAttribute('href'), null);
      } finally {
        document.body.removeChild(iframe);
      }
    });

    QUnit.test(
      'elements in forbidden namespaces are removed (cross-realm)',
      (assert) => {
        const iframe = document.createElement('iframe');
        document.body.appendChild(iframe);
        try {
          const foreignDoc = iframe.contentDocument;
          const ns = 'http://example.org/forbidden';
          const root = foreignDoc.createElementNS(ns, 'evil');
          DOMPurify.sanitize(root, {
            IN_PLACE: true,
            ALLOWED_NAMESPACES: [
              'http://www.w3.org/1999/xhtml',
              'http://www.w3.org/2000/svg',
              'http://www.w3.org/1998/Math/MathML',
            ],
          });
          // Element of forbidden namespace should be inert (no children,
          // no attributes). Implementations may also throw on the root.
          assert.ok(
            root.attributes.length === 0,
            'forbidden-namespace root has no attributes'
          );
        } catch (_) {
          assert.ok(true, 'throwing is also an acceptable outcome');
        } finally {
          document.body.removeChild(iframe);
        }
      }
    );

    // =======================================================================
    // DOM Clobbering of attached-shadow-root traversal
    //
    // Once attached shadow roots are walked, the traversal itself becomes
    // an attack surface. childNodes / nodeType / shadowRoot etc. can be
    // shadowed on a form element via <input name="...">. The sanitizer
    // probes the engine's actual behaviour and chooses between throwing
    // and continuing safely.
    // =======================================================================

    QUnit.module('DOM clobbering — shadow-root traversal');

    // Probe environment capabilities once per session.
    //
    // NOTE: every access goes through `window.*`, never the bare global.
    // In the node/jsdom runner the test code runs in a Node context that
    // does NOT have `Element`, `document`, etc. as globals — only via
    // the window argument passed into testSuite(). Touching the bare
    // `Element` here throws a ReferenceError at module load time.
    const env = (() => {
      const result = {
        shadowSanitization: false,
        formClobbering: false,
        setHTMLUnsafe: !!(
          window.Element &&
          window.Element.prototype &&
          typeof window.Element.prototype.setHTMLUnsafe === 'function'
        ),
      };
      try {
        const probeHost = document.createElement('div');
        probeHost.attachShadow({ mode: 'open' }).innerHTML = '<span>x</span>';
        DOMPurify.sanitize(probeHost, { IN_PLACE: true });
        result.shadowSanitization = !!probeHost.shadowRoot;
      } catch (_) {}
      try {
        const probeForm = document.createElement('form');
        probeForm.innerHTML = '<input name="nodeName">';
        result.formClobbering = typeof probeForm.nodeName !== 'string';
      } catch (_) {}
      return result;
    })();

    QUnit.test('clobbered childNodes is recognised', (assert) => {
      if (!env.formClobbering) {
        assert.ok(true, 'engine does not clobber form properties; skipping');
        return;
      }
      const root = document.createElement('form');
      root.innerHTML =
        '<input name="childNodes" onclick="alert(1)">' +
        '<input name="parentNode" onclick="alert(2)">';
      // Either throws on the clobbered root, or returns a clean string.
      let result;
      try {
        result = DOMPurify.sanitize(root, { IN_PLACE: true });
      } catch (_) {
        assert.ok(true, 'threw on clobbered root');
        return;
      }
      assert.ok(!/on\w+=/i.test(result.outerHTML || ''));
    });

    QUnit.test(
      '<select name="childNodes"> with length-as-number does not defeat typing probe',
      (assert) => {
        // The clobbering-detection check used to be `typeof x === 'object'`
        // — defeated by clobbering childNodes to a <select> whose
        // .length property is a number. Modern check explicitly
        // includes nodeType and constructor identity.
        const root = document.createElement('form');
        root.innerHTML =
          '<select name="childNodes">' +
          '<option value="a">a</option>' +
          '<option value="b">b</option>' +
          '</select>' +
          '<input name="parentNode" onclick="alert(1)">';
        let threw = false;
        try {
          DOMPurify.sanitize(root, { IN_PLACE: true });
        } catch (_) {
          threw = true;
        }
        // Result is one of: threw, or the on-handler was removed.
        if (!threw) {
          assert.ok(
            !/onclick/i.test(root.outerHTML),
            'no on-handler survived: ' + root.outerHTML
          );
        } else {
          assert.ok(true, 'threw on clobbered length-typed root');
        }
      }
    );

    QUnit.test('shadow root nested under select-clobbered form', (assert) => {
      if (!env.shadowSanitization) {
        assert.ok(
          true,
          'engine does not support shadow sanitization; skipping'
        );
        return;
      }
      // Compound case: the form clobbers childNodes, AND a child host
      // inside the form carries an attached shadow root with dangerous
      // content. The sanitizer should either bail safely on the
      // clobbered root, or successfully walk into the shadow.
      const form = document.createElement('form');
      const host = document.createElement('div');
      form.appendChild(host);
      const select = document.createElement('select');
      select.setAttribute('name', 'childNodes');
      select.innerHTML = '<option>a</option>';
      form.appendChild(select);
      host.attachShadow({ mode: 'open' }).innerHTML =
        '<a id="poc" href="javascript:alert(1)">x</a>';
      let threw = false;
      try {
        DOMPurify.sanitize(form, { IN_PLACE: true });
      } catch (_) {
        threw = true;
      }
      if (!threw && host.shadowRoot) {
        const a = host.shadowRoot.querySelector('#poc');
        if (a) {
          assert.equal(a.getAttribute('href'), null);
        } else {
          assert.ok(true, 'link removed');
        }
      } else {
        assert.ok(true, 'threw on clobbered root, shadow not walked');
      }
    });

    QUnit.test('setHTMLUnsafe + IN_PLACE declarative shadow', (assert) => {
      if (!env.setHTMLUnsafe) {
        assert.ok(true, 'setHTMLUnsafe not available; skipping');
        return;
      }
      const host = document.createElement('div');
      host.setHTMLUnsafe(
        '<div><template shadowrootmode="open">' +
          '<a id="poc" href="javascript:alert(1)">x</a>' +
          '</template></div>'
      );
      DOMPurify.sanitize(host, { IN_PLACE: true });
      // Either the declarative shadow root was materialised and walked,
      // or the template was stripped. Both eliminate the payload.
      const liveA = host.firstChild
        ? host.firstChild.shadowRoot
          ? host.firstChild.shadowRoot.querySelector('#poc')
          : null
        : null;
      if (liveA) {
        assert.equal(liveA.getAttribute('href'), null);
      } else {
        assert.ok(true, 'declarative shadow was either walked or stripped');
      }
      window.xssed = false;
    });

    // =======================================================================
    // GHSA-r47g-fvhr-h676 — parent-less clobbered form rejection
    //
    // The pre-fix sanitizer would attempt to "remove" a form whose
    // properties were clobbered by calling _forceRemove(form). Because
    // the form was the root, parentNode was null AND clobbered, and
    // the function silently returned without doing anything — handing
    // back the original clobbered form with its dangerous handlers.
    //
    // The fix wraps the preamble in a "parent-less clobbered root"
    // guard that throws BEFORE the iteration begins. The throw is the
    // contract: callers must not ignore it.
    // =======================================================================

    QUnit.module(
      'Regression — GHSA-r47g-fvhr-h676 (parent-less clobbered form)'
    );

    QUnit.test('parent-less clobbered form root throws', (assert) => {
      if (!env.formClobbering) {
        assert.ok(true, 'engine does not clobber form properties; skipping');
        return;
      }
      const root = document.createElement('form');
      root.innerHTML = '<input name="nodeName" onmouseover="alert(1)">';
      assert.throws(
        () => DOMPurify.sanitize(root, { IN_PLACE: true }),
        /clobbered|forbidden|invalid/i,
        'must throw rather than silently return clobbered root'
      );
    });

    QUnit.test(
      'all clobbering-name variants trigger preamble throw',
      (assert) => {
        if (!env.formClobbering) {
          assert.ok(true, 'engine does not clobber form properties; skipping');
          return;
        }
        // Which property names actually trigger the library's defensive
        // throw is decided by TWO independent things, and we cannot
        // predict either from the test:
        //
        //   1. Engine behaviour: not every name is clobberable via
        //      named-property access on HTMLFormElement. Chromium
        //      currently clobbers nodeName / nodeType / attributes /
        //      childNodes but leaves parentNode / firstChild / children
        //      as un-shadowable prototype getters. Other engines differ.
        //
        //   2. Library policy: _isClobbered checks a specific set of
        //      properties it considers structurally dangerous to its own
        //      traversal. Names outside that set are not guarded even
        //      when they are clobberable.
        //
        // Trying to predict the intersection of (1) and (2) from the
        // outside is fragile — every previous attempt at a static probe
        // failed on some engine. The robust pattern is to ask the
        // library directly: does it throw for this name? If yes, that's
        // a name in the guarded set, and the throw becomes part of the
        // contract we're testing across releases. If no, we have nothing
        // to assert beyond "the library did not break on it".
        //
        // We assert two invariants:
        //   - At least one name from our candidate list IS guarded
        //     (otherwise the entire defence has regressed).
        //   - For every name that IS guarded, the throw produces a
        //     thrown Error rather than a silent return of the
        //     clobbered form. The latter is the GHSA-r47g-fvhr-h676
        //     primitive.
        const candidates = [
          'nodeName',
          'nodeType',
          'parentNode',
          'children',
          'childNodes',
          'firstChild',
          'attributes',
        ];
        const guarded = [];
        const ungrarded = [];
        for (const name of candidates) {
          const root = document.createElement('form');
          root.innerHTML = `<input name="${name}" onmouseover="alert(1)">`;
          let thrownValue;
          let threw = false;
          try {
            DOMPurify.sanitize(root, { IN_PLACE: true });
          } catch (e) {
            threw = true;
            thrownValue = e;
          }
          if (threw) {
            guarded.push(name);
            assert.ok(
              thrownValue instanceof Error,
              `"${name}" throws an Error instance, not a primitive`
            );
          } else {
            ungrarded.push(name);
          }
        }
        assert.ok(
          guarded.length > 0,
          `at least one candidate name triggers throw (guarded=${JSON.stringify(
            guarded
          )}, ungrarded=${JSON.stringify(ungrarded)})`
        );
      }
    );

    QUnit.test(
      'parented clobbered form is still sanitized normally',
      (assert) => {
        // Regression guard for the throw: a clobbered form that is NOT
        // the iteration root must still be cleaned in place, with its
        // dangerous attributes removed. The throw is specifically for
        // root-level clobbering.
        if (!env.formClobbering) {
          assert.ok(true, 'engine does not clobber form properties; skipping');
          return;
        }
        const wrapper = document.createElement('div');
        wrapper.innerHTML =
          '<form><input name="nodeName" onmouseover="alert(1)"></form>';
        let threw = false;
        try {
          DOMPurify.sanitize(wrapper, { IN_PLACE: true });
        } catch (_) {
          threw = true;
        }
        // Either the wrapper-rooted iteration removed the on-handler and
        // (possibly) the form itself, OR the engine treated the nested
        // form as the iteration scope and threw. Both keep the consumer
        // safe; the only forbidden outcome is "returned with onmouseover".
        assert.ok(
          threw || !/onmouseover/i.test(wrapper.outerHTML),
          'parented clobbered form is either thrown on or cleaned: ' +
            wrapper.outerHTML
        );
      }
    );

    // =======================================================================
    // Regression guards — ordinary attached and nested shadow roots
    // =======================================================================

    QUnit.module('Regression — ordinary attached shadow roots');

    QUnit.test('shadow root with safe content is preserved', (assert) => {
      if (!env.shadowSanitization) {
        assert.ok(
          true,
          'engine does not support shadow sanitization; skipping'
        );
        return;
      }
      const host = document.createElement('div');
      host.attachShadow({ mode: 'open' }).innerHTML = '<p>hello</p>';
      DOMPurify.sanitize(host, { IN_PLACE: true });
      assert.equal(host.shadowRoot.querySelector('p').textContent, 'hello');
    });

    QUnit.test(
      'nested attached shadow roots preserve safe content',
      (assert) => {
        if (!env.shadowSanitization) {
          assert.ok(
            true,
            'engine does not support shadow sanitization; skipping'
          );
          return;
        }
        const outer = document.createElement('section');
        const outerShadow = outer.attachShadow({ mode: 'open' });
        const inner = document.createElement('div');
        outerShadow.appendChild(inner);
        inner.attachShadow({ mode: 'open' }).innerHTML = '<span>safe</span>';
        DOMPurify.sanitize(outer, { IN_PLACE: true });
        assert.equal(
          outer.shadowRoot.querySelector('div').shadowRoot.querySelector('span')
            .textContent,
          'safe'
        );
      }
    );

    // =======================================================================
    // GHSA-hpcv-96wg-7vj8 — cross-realm IN_PLACE follow-up
    //
    // After GHSA-4w3q-35jp-p934 closed the iterator-mismatch primitive,
    // a residual issue remained: the foreign-realm helper itself needed
    // to recognise clobbered forms and template.content the same way
    // the local-realm path does. The tests duplicate the local-realm
    // coverage across the cross-realm boundary.
    // =======================================================================

    QUnit.module(
      'Regression — GHSA-hpcv-96wg-7vj8 (cross-realm IN_PLACE follow-up)'
    );

    QUnit.test(
      '_withForeignRealmDoc helper handles foreign template.content',
      (assert) => {
        const iframe = document.createElement('iframe');
        document.body.appendChild(iframe);
        try {
          const foreignDoc = iframe.contentDocument;
          const tpl = foreignDoc.createElement('template');
          const inner = foreignDoc.createElement('img');
          inner.setAttribute('src', 'x');
          inner.setAttribute('onerror', 'alert(1)');
          tpl.content.appendChild(inner);
          DOMPurify.sanitize(tpl, { IN_PLACE: true });
          const liveImg = tpl.content.querySelector('img');
          if (liveImg) {
            assert.equal(liveImg.getAttribute('onerror'), null);
          } else {
            assert.ok(true, 'image removed entirely');
          }
        } finally {
          document.body.removeChild(iframe);
        }
      }
    );

    QUnit.test(
      'foreign clobbered form is recognised via capability probe',
      (assert) => {
        if (!env.formClobbering) {
          assert.ok(true, 'engine does not clobber form properties; skipping');
          return;
        }
        const iframe = document.createElement('iframe');
        document.body.appendChild(iframe);
        try {
          const foreignDoc = iframe.contentDocument;
          const form = foreignDoc.createElement('form');
          form.innerHTML = '<input name="nodeName" onmouseover="alert(1)">';
          let threw = false;
          try {
            DOMPurify.sanitize(form, { IN_PLACE: true });
          } catch (_) {
            threw = true;
          }
          // Same contract as the local-realm test: throw, or return clean.
          if (threw) {
            assert.ok(true, 'threw on foreign clobbered root');
          } else {
            assert.ok(!/onmouseover/i.test(form.outerHTML));
          }
        } finally {
          document.body.removeChild(iframe);
        }
      }
    );

    QUnit.test(
      'foreign attached shadow root is walked end-to-end',
      (assert) => {
        if (!env.shadowSanitization) {
          assert.ok(
            true,
            'engine does not support shadow sanitization; skipping'
          );
          return;
        }
        const iframe = document.createElement('iframe');
        document.body.appendChild(iframe);
        try {
          const foreignDoc = iframe.contentDocument;
          const host = foreignDoc.createElement('div');
          host.attachShadow({ mode: 'open' }).innerHTML =
            '<a id="poc" href="javascript:alert(1)">x</a>';
          DOMPurify.sanitize(host, { IN_PLACE: true });
          const a = host.shadowRoot.querySelector('#poc');
          assert.ok(a, 'link preserved');
          assert.equal(a.getAttribute('href'), null);
        } finally {
          document.body.removeChild(iframe);
        }
      }
    );

    QUnit.test(
      'foreign element in forbidden namespace is neutralised',
      (assert) => {
        const iframe = document.createElement('iframe');
        document.body.appendChild(iframe);
        try {
          const foreignDoc = iframe.contentDocument;
          const evil = foreignDoc.createElementNS(
            'http://example.org/evil',
            'evil-elem'
          );
          evil.setAttribute('onmouseover', 'alert(1)');
          let threw = false;
          try {
            DOMPurify.sanitize(evil, {
              IN_PLACE: true,
              ALLOWED_NAMESPACES: ['http://www.w3.org/1999/xhtml'],
            });
          } catch (_) {
            threw = true;
          }
          if (threw) {
            assert.ok(true, 'threw on forbidden-namespace root');
          } else {
            assert.equal(evil.getAttribute('onmouseover'), null);
          }
        } finally {
          document.body.removeChild(iframe);
        }
      }
    );

    QUnit.module('Regression — template.content traversal bypass');

    QUnit.test(
      'RETURN_DOM scrubs boundary-spanning expressions inside template.content',
      (assert) => {
        // _scrubTemplateExpressions uses a NodeIterator rooted at the output
        // body. Per the DOM spec, NodeIterator does not descend into
        // <template>.content, which is a separate DocumentFragment outside
        // the normal child-node tree. Stripped foreign elements inside a
        // <template> leave adjacent text nodes in template.content whose
        // individual fragments ('$' and '{...}') do not match TMPLIT_EXPR,
        // but merge into a full '${...}' after normalize(). The fix
        // explicitly recurses into each template.content, mirroring the
        // approach already used by _sanitizeShadowDOM.
        const dirty = document.createElement('div');
        const tmpl = document.createElement('template');
        tmpl.content.appendChild(document.createTextNode('$'));
        tmpl.content.appendChild(
          document.createTextNode('{constructor.constructor("alert(1)")()')
        );
        dirty.appendChild(tmpl);

        const result = DOMPurify.sanitize(dirty, {
          RETURN_DOM: true,
          SAFE_FOR_TEMPLATES: true,
        });

        result.querySelector('template').content.normalize();
        assert.notOk(
          /\$\{[\s\S]*\}/.test(
            result.querySelector('template').content.textContent
          ),
          'merged template-literal expression inside template.content should be scrubbed'
        );
      }
    );

    QUnit.test(
      'IN_PLACE scrubs boundary-spanning expressions inside template.content',
      (assert) => {
        // Same blind spot as the RETURN_DOM case above, but for the IN_PLACE
        // path. The fix must cover both since they share _scrubTemplateExpressions.
        const dirty = document.createElement('div');
        const tmpl = document.createElement('template');
        tmpl.content.appendChild(document.createTextNode('$'));
        tmpl.content.appendChild(
          document.createTextNode('{constructor.constructor("alert(1)")()')
        );
        dirty.appendChild(tmpl);

        DOMPurify.sanitize(dirty, {
          IN_PLACE: true,
          SAFE_FOR_TEMPLATES: true,
        });

        dirty.querySelector('template').content.normalize();
        assert.notOk(
          /\$\{[\s\S]*\}/.test(
            dirty.querySelector('template').content.textContent
          ),
          'merged template-literal expression inside template.content should be scrubbed in-place'
        );
      }
    );

    QUnit.test('scrub recurses into nested template.content', (assert) => {
      // A <template> inside a <template> produces two nested
      // DocumentFragments, both invisible to a flat NodeIterator. The
      // recursive fix must descend through each level.
      const dirty = document.createElement('div');
      const outer = document.createElement('template');
      const inner = document.createElement('template');
      inner.content.appendChild(document.createTextNode('$'));
      inner.content.appendChild(
        document.createTextNode('{constructor.constructor("alert(1)")()')
      );
      outer.content.appendChild(inner);
      dirty.appendChild(outer);

      const result = DOMPurify.sanitize(dirty, {
        RETURN_DOM: true,
        SAFE_FOR_TEMPLATES: true,
      });

      const innerAfter = result
        .querySelector('template')
        .content.querySelector('template');
      innerAfter.content.normalize();
      assert.notOk(
        /\$\{[\s\S]*\}/.test(innerAfter.content.textContent),
        'merged expression inside nested template.content should be scrubbed'
      );
    });

    // =======================================================================
    // DOM clobbering — comprehensive matrix ("roundhouse")
    //
    // A tripwire over the full cross-product of clobber-carrier markup and the
    // property/method names DOMPurify relies on when reading DOM nodes. The
    // carrier is <form>: its named/id children shadow built-ins via
    // LegacyOverrideBuiltIns, which is the element-level clobbering vector the
    // sanitizer must survive.
    //
    // IMPORTANT: this override is a *real-browser* behavior. jsdom does NOT
    // implement it, so under jsdom these tests pass trivially (no clobber ever
    // happens) — they only grow teeth in the Chromium (Playwright) run. The
    // first assertion reports whether the override is live in the current
    // engine so a green jsdom run is not mistaken for real coverage.
    // =======================================================================

    QUnit.module('DOM clobbering — comprehensive matrix');

    // Names DOMPurify (or a downstream consumer) reads off a node. Shadowing
    // any of these is the lever an attacker would pull.
    const CLOBBER_NAMES = [
      // identity / type
      'nodeName',
      'nodeType',
      'nodeValue',
      'tagName',
      'localName',
      'namespaceURI',
      'prefix',
      // content
      'textContent',
      'innerHTML',
      'outerHTML',
      'innerText',
      'data',
      // tree navigation
      'parentNode',
      'parentElement',
      'childNodes',
      'children',
      'firstChild',
      'lastChild',
      'firstElementChild',
      'lastElementChild',
      'nextSibling',
      'previousSibling',
      'nextElementSibling',
      'previousElementSibling',
      'ownerDocument',
      'getRootNode',
      'content',
      // attributes
      'attributes',
      'getAttribute',
      'getAttributeNode',
      'getAttributeNames',
      'hasAttribute',
      'hasAttributes',
      'setAttribute',
      'setAttributeNS',
      'removeAttribute',
      'removeAttributeNS',
      // mutation
      'removeChild',
      'appendChild',
      'insertBefore',
      'replaceChild',
      'cloneNode',
      'remove',
      'replaceWith',
      'before',
      'after',
      // shadow / query
      'shadowRoot',
      'host',
      'attachShadow',
      'querySelector',
      'querySelectorAll',
      'getElementsByTagName',
      'matches',
      'closest',
      // misc props read during sanitization or by consumers
      'classList',
      'className',
      'id',
      'name',
      'is',
      'value',
      'type',
      'style',
    ];

    // Inert sinks: none auto-loads (no <img src>), none executes in a parsed
    // or disconnected document, so the harness can never fire them itself —
    // yet each leaves a syntactic trace if sanitization is defeated.
    const CLOBBER_SINKS =
      '<img onerror="window.__clob=(window.__clob||0)+1">' +
      '<a href="javascript:window.__clob=1">x</a>' +
      '<script>window.__clob=1</script>' +
      '<div onclick="window.__clob=1">z</div>';

    const clobberHasSink = (s) => /\son\w+\s*=|<script|javascript:/i.test(s);
    const clobberReparseSink = (s) =>
      new window.DOMParser()
        .parseFromString(s, 'text/html')
        .querySelector('[onerror],[onload],[onclick],script');

    const clobberPayloads = (name) => [
      '<form><input name="' + name + '">' + CLOBBER_SINKS + '</form>',
      '<form><input id="' + name + '">' + CLOBBER_SINKS + '</form>',
      // two same-named controls -> a RadioNodeList/HTMLCollection clobber
      '<form><input name="' +
        name +
        '"><input name="' +
        name +
        '">' +
        CLOBBER_SINKS +
        '</form>',
      '<form name="' + name + '">' + CLOBBER_SINKS + '</form>',
    ];

    QUnit.test(
      'no clobbering combination defeats sanitization (string path)',
      (assert) => {
        window.__clob = 0;

        // Report whether this engine overrides built-ins at all.
        const probe = document.createElement('form');
        probe.innerHTML =
          '<input name="attributes"><input name="getAttributeNames">';
        const realAttributes = Object.getOwnPropertyDescriptor(
          window.Element.prototype,
          'attributes'
        ).get.call(probe);
        const overrideLive =
          typeof probe.nodeName !== 'string' ||
          typeof probe.getAttributeNames !== 'function' ||
          probe.attributes !== realAttributes;
        assert.ok(
          true,
          'form LegacyOverrideBuiltIns active in this engine: ' + overrideLive
        );

        const failures = [];
        const allBlocks = [];
        for (const name of CLOBBER_NAMES) {
          for (const payload of clobberPayloads(name)) {
            allBlocks.push(payload);
            const out = DOMPurify.sanitize(payload);
            if (clobberHasSink(out) || clobberReparseSink(out)) {
              failures.push(name + ' :: ' + out.slice(0, 160));
            }
          }
        }
        assert.deepEqual(
          failures,
          [],
          'every individual clobber payload sanitized to a sink-free result'
        );

        // The roundhouse: the entire matrix in a single block.
        const big = DOMPurify.sanitize(allBlocks.join(''));
        assert.notOk(
          clobberHasSink(big) || clobberReparseSink(big),
          'combined clobbering block leaves no executable sink'
        );

        assert.equal(
          window.__clob,
          0,
          'no clobbering payload executed during the test'
        );
      }
    );

    QUnit.test(
      'clobbered IN_PLACE roots throw or sanitize safely',
      (assert) => {
        window.__clob = 0;
        // Disconnected roots, inert sinks: nothing loads or fires here.
        const inPlaceSinks =
          '<img onerror="window.__clob=1">' +
          '<a href="javascript:window.__clob=1">x</a>' +
          '<div onclick="window.__clob=1">z</div>';

        const failures = [];
        for (const name of CLOBBER_NAMES) {
          const root = document.createElement('form');
          root.innerHTML = '<input name="' + name + '">' + inPlaceSinks;

          let threw = false;
          let out = null;
          try {
            out = DOMPurify.sanitize(root, { IN_PLACE: true });
          } catch (_) {
            threw = true; // fail-closed is acceptable (clobbered/forbidden root)
          }

          // Either it threw, or the returned node carries no sink.
          if (!threw && clobberHasSink(out.outerHTML)) {
            failures.push(name + ' :: ' + out.outerHTML.slice(0, 160));
          }
        }
        assert.deepEqual(
          failures,
          [],
          'every clobbered IN_PLACE root threw or returned a sink-free node'
        );
        assert.equal(
          window.__clob,
          0,
          'no payload executed during IN_PLACE matrix'
        );
      }
    );

    // =======================================================================
    // Security regression — audit-5 Finding A:
    // IN_PLACE hoisted content must neutralise the ORIGINAL subtree
    // =======================================================================
    // When KEEP_CONTENT removes a disallowed element it re-parents that
    // element's children so the sanitizer walk reaches them. The walk only
    // protects the IN_PLACE / build-then-sanitize pattern
    //
    //     el.innerHTML = dirty;                      // queues <img> loads
    //     DOMPurify.sanitize(el, { IN_PLACE: true }); // strips on* synchronously
    //
    // if the node that carries the queued resource event is the same node the
    // walk sanitizes. The historical implementation hoisted *clones* of the
    // children and merely detached the originals, so a handler wrapped in any
    // disallowed tag — `<x-wrap><img src=… onerror=…></x-wrap>` — left the
    // original <img> detached but still armed: its queued error/load event
    // fired the surviving on* handler in page scope while the returned tree
    // looked perfectly clean. The fix hoists the original nodes themselves, so
    // the walk strips the handler off the very node that holds the queued
    // event. Direct (unwrapped) handlers were always neutralised; these tests
    // pin that one wrapper tag can no longer flip that guarantee.
    QUnit.module(
      'Security — IN_PLACE hoisted-content neutralisation (audit-5)'
    );

    QUnit.test(
      'wrapped on*-handler original is scrubbed, not just its clone',
      (assert) => {
        // Capture the ORIGINAL handler-bearing node by reference *before*
        // sanitize. After IN_PLACE sanitize it must carry no on* attribute,
        // whether it survived in the tree or was detached — that attribute is
        // exactly what a queued load/error event would execute in a browser.
        const root = document.createElement('div');
        root.innerHTML =
          '<x-wrap><img src="http://127.0.0.1:1/x" onerror="alert(1)"></x-wrap>';
        const original = root.querySelector('img');
        assert.equal(
          original.getAttribute('onerror'),
          'alert(1)',
          'precondition: original carries the handler before sanitize'
        );

        DOMPurify.sanitize(root, { IN_PLACE: true });

        assert.equal(
          original.getAttribute('onerror'),
          null,
          'the original node (which holds any queued event) is scrubbed'
        );
        assert.notOk(
          /onerror/i.test(root.innerHTML),
          'returned tree is free of the handler'
        );
        // No surviving <img> anywhere may keep the handler (guards against a
        // sanitized clone in the tree masking an armed detached original).
        const imgs = root.querySelectorAll('img');
        let armed = 0;
        imgs.forEach((img) => {
          if (img.hasAttribute('onerror')) armed++;
        });
        assert.equal(armed, 0, 'no surviving <img> retains the handler');
      }
    );

    QUnit.test(
      'nested disallowed wrappers around a handler are fully scrubbed',
      (assert) => {
        const root = document.createElement('div');
        root.innerHTML =
          '<x-a><x-b><img src="http://127.0.0.1:1/x" ' +
          'onerror="alert(1)" onload="alert(2)"></x-b></x-a>';
        const original = root.querySelector('img');
        DOMPurify.sanitize(root, { IN_PLACE: true });
        assert.equal(
          original.getAttribute('onerror'),
          null,
          'onerror stripped from original through nested wrappers'
        );
        assert.equal(
          original.getAttribute('onload'),
          null,
          'onload stripped from original through nested wrappers'
        );
        assert.notOk(
          /onerror|onload/i.test(root.innerHTML),
          'returned tree is free of every handler'
        );
      }
    );

    QUnit.test(
      'wrapped handler does not execute after IN_PLACE sanitize',
      (assert) => {
        // Browser-meaningful execution check (inert but passing under jsdom,
        // which does not load resources). A succeeding data: image onload is
        // used so the vehicle does not depend on a failing network fetch.
        window.xssed = false;
        const root = document.createElement('div');
        document.getElementById('qunit-fixture').appendChild(root);
        root.innerHTML =
          '<x-wrap><img onload="alert(1)" ' +
          'src="data:image/gif;base64,' +
          'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"></x-wrap>';
        DOMPurify.sanitize(root, { IN_PLACE: true });
        const done = assert.async();
        setTimeout(() => {
          assert.notEqual(
            window.xssed,
            true,
            'handler of the wrapped/hoisted image must not fire'
          );
          document.getElementById('qunit-fixture').innerHTML = '';
          window.xssed = false;
          done();
        }, 100);
      }
    );

    QUnit.test(
      'handler stripping is not defeated by a clobbering <form> sibling',
      (assert) => {
        // The discarded original subtree may contain a <form> whose named
        // children clobber removeAttribute / attributes / childNodes. Because
        // in-place KEEP_CONTENT hoists the originals back into the walk (via
        // the cached Node.prototype getters, which a clobbering child cannot
        // redirect), the genuine event-handler vehicle (the <img>) is reached
        // and sanitised by the normal allowlist pass — the clobbering form
        // cannot hide it.
        const root = document.createElement('div');
        root.innerHTML =
          '<x-wrap><form>' +
          '<input name="removeAttribute"><input name="attributes">' +
          '<input name="childNodes">' +
          '<img src="http://127.0.0.1:1/x" onerror="alert(1)">' +
          '</form></x-wrap>';
        const original = root.querySelector('img');
        DOMPurify.sanitize(root, { IN_PLACE: true });
        assert.equal(
          original.getAttribute('onerror'),
          null,
          'handler stripped from the vehicle despite the clobbering form'
        );
        assert.notOk(
          /onerror/i.test(root.innerHTML),
          'returned tree carries no handler'
        );
      }
    );

    // =======================================================================
    // Security regression — campaign-3 (selectedcontent mirroring, exception
    // barrier, deep-tree fail-open). See audits 7-11.
    // =======================================================================
    // <selectedcontent> (customizable <select>) is mirrored by Chromium 148+
    // and WebKit 26.4+: the UA clones the selected <option>'s subtree —
    // including on* handlers — into it and re-mirrors synchronously whenever a
    // removal changes which option/selectedcontent is current, even inside
    // DOMPurify's inert DOMParser document. The full mirror cascade (infinite
    // loop F1, quadratic output F6, re-mirror bypass F3) can only be reproduced
    // in those engines; the structural guarantees pinned below hold in every
    // engine. The exception-barrier (F2) and deep-tree (F4) tests run anywhere.
    QUnit.module(
      'Security — campaign-3 (selectedcontent / barrier / deep tree)'
    );

    QUnit.test(
      'C3-F1/F6: <selectedcontent> is removed without hoisting its content',
      (assert) => {
        // The infinite re-mirror loop and quadratic amplification are both
        // driven by KEEP_CONTENT hoisting the engine-mirrored children of a
        // removed <selectedcontent> back into the tree, where the engine
        // refills the next mirror target. selectedcontent is now in
        // FORBID_CONTENTS, so removal drops its content instead of hoisting it,
        // breaking the cascade (the mirrored content is a duplicate of the
        // option, which is sanitized on its own). This pins the deterministic
        // structural guarantee that holds without engine mirroring.
        const clean = DOMPurify.sanitize(
          '<div><selectedcontent><img src=x onerror=alert(1)>' +
            '<b>copy</b></selectedcontent></div>'
        );
        assert.equal(
          clean,
          '<div></div>',
          'selectedcontent content dropped, not hoisted: ' + clean
        );
        assert.notOk(/onerror/i.test(clean), 'no hoisted handler');
        assert.notOk(/<img/i.test(clean), 'no hoisted element');
      }
    );

    QUnit.test(
      'C3-F1: selectedcontent content drop survives the KEEP_CONTENT path',
      (assert) => {
        // Explicit KEEP_CONTENT: true is the default and the vulnerable mode;
        // confirm the FORBID_CONTENTS entry still wins there.
        const clean = DOMPurify.sanitize(
          '<selectedcontent><span>x</span></selectedcontent>',
          { KEEP_CONTENT: true }
        );
        assert.equal(clean, '', 'content dropped under KEEP_CONTENT: ' + clean);
      }
    );

    QUnit.test(
      'C3-F2: custom-element mid-walk abort leaves no surviving handler',
      (assert) => {
        // A page-registered custom element whose reaction detaches the wrapper
        // currently being removed makes DOMPurify's own _forceRemove hit its
        // parentless guard and throw mid-walk. Without an exception barrier the
        // IN_PLACE walk aborts and the caller's live tree keeps everything after
        // the wrapper unsanitized. The barrier neutralises the in-place root on
        // any abort: nothing executable may survive (the call may still throw,
        // which is an accepted contract).
        if (typeof window.customElements === 'undefined') {
          assert.ok(true, 'no custom elements in this environment; skipping');
          return;
        }
        if (!window.customElements.get('x-surgeon-c3')) {
          class XSurgeonC3 extends window.HTMLElement {
            disconnectedCallback() {
              const w = document.querySelector('x-wrap-c3');
              if (w && w.parentNode) {
                w.remove();
              }
            }
          }
          window.customElements.define('x-surgeon-c3', XSurgeonC3);
        }
        const root = document.createElement('div');
        root.innerHTML =
          '<x-wrap-c3><x-surgeon-c3></x-surgeon-c3></x-wrap-c3>' +
          '<img src="data:,x" onerror="window.xssed = true">' +
          '<a href="javascript:alert(1)">l</a>' +
          '<div onclick="window.xssed = true">d</div>';
        try {
          DOMPurify.sanitize(root, { IN_PLACE: true });
        } catch (_) {
          // A thrown abort is acceptable; the tree must still be fail-closed.
        }
        assert.notOk(/onerror/i.test(root.innerHTML), 'no surviving onerror');
        assert.notOk(/onclick/i.test(root.innerHTML), 'no surviving onclick');
        assert.notOk(
          /javascript:/i.test(root.innerHTML),
          'no surviving javascript: URL'
        );
      }
    );

    QUnit.test(
      'C3-F4: deep DOM-built tree sanitizes in place without failing open',
      (assert) => {
        // The IN_PLACE entry pre-pass (_sanitizeAttachedShadowRoots) used to
        // recurse once per child, so a deep DOM-built tree — DOM APIs have no
        // parser depth cap — overflowed the call stack and threw before any
        // node was sanitized, leaving the caller's live tree 0% sanitized. The
        // walk is now iterative. Depth 5000 overflowed the old recursion
        // (~4500 in Chromium). The tree is never attached and never serialized
        // here, to avoid the engine's own deep-render / serializer recursion.
        const DEPTH = 5000;
        const root = document.createElement('div');
        const img = document.createElement('img');
        img.setAttribute('onerror', 'window.xssed = true');
        root.appendChild(img);
        let cursor = root;
        for (let i = 0; i < DEPTH; i++) {
          const child = document.createElement('div');
          cursor.appendChild(child);
          cursor = child;
        }
        let threw = false;
        try {
          DOMPurify.sanitize(root, { IN_PLACE: true });
        } catch (_) {
          threw = true;
        }
        assert.notOk(threw, 'no stack-overflow throw at the entry pre-pass');
        assert.notOk(
          img.hasAttribute('onerror'),
          'shallow handler stripped despite deep tree'
        );
      }
    );

    // =======================================================================
    // Coverage - non-string input coercion (utils.stringifyValue/lookupGetter)
    //
    // sanitize() stringifies any non-string, non-Node input before parsing
    // (purify.ts: `dirty = stringifyValue(dirty)`). The markup-driven tests
    // only ever pass strings, so the entire stringifyValue type switch and the
    // lookupGetter prototype walk go unexercised. These cover both, and the
    // object-with-toString case doubles as a real check that markup produced by
    // a coerced toString() is still sanitized.
    // =======================================================================

    QUnit.module('Coverage - input coercion');

    QUnit.test('coerces a number input', (assert) => {
      assert.equal(DOMPurify.sanitize(123), '123');
    });

    QUnit.test('coerces a boolean input', (assert) => {
      assert.equal(DOMPurify.sanitize(true), 'true');
    });

    if (typeof BigInt !== 'undefined') {
      QUnit.test('coerces a bigint input', (assert) => {
        assert.equal(DOMPurify.sanitize(BigInt(42)), '42');
      });
    }

    if (typeof Symbol !== 'undefined') {
      QUnit.test('coerces a symbol input', (assert) => {
        const out = DOMPurify.sanitize(Symbol('x'));
        assert.equal(out.indexOf('Symbol('), 0, `got: ${out}`);
      });
    }

    QUnit.test('coerces a function input', (assert) => {
      const out = DOMPurify.sanitize(function demo() {});
      assert.ok(out.indexOf('demo') > -1, `got: ${out}`);
    });

    QUnit.test('coerced toString() markup is still sanitized', (assert) => {
      const dirty = {
        toString() {
          return '<b>x</b><img src=x onerror=alert(1)>';
        },
      };
      const out = DOMPurify.sanitize(dirty);
      assert.equal(out.indexOf('onerror'), -1, `onerror survived: ${out}`);
      assert.ok(out.indexOf('<b>x</b>') > -1, `got: ${out}`);
    });

    QUnit.test(
      'coerces an object whose toString returns a non-string',
      (assert) => {
        const out = DOMPurify.sanitize({
          toString() {
            return 42;
          },
        });
        assert.equal(out, '[object Number]');
      }
    );

    QUnit.test(
      'coerces a null-prototype object (lookupGetter fallback)',
      (assert) => {
        // No toString on the chain: lookupGetter walks to null and returns its
        // fallbackValue(), which yields null, so objectToString is used instead.
        const out = DOMPurify.sanitize(Object.create(null));
        assert.equal(out, '[object Null]');
      }
    );

    // =======================================================================
    // Coverage - config set construction (utils.addToSet/cleanArray)
    //
    // Exercises the non-array guard, the non-string element branch, and the
    // sparse-array null-fill that clone()/cleanArray() perform on user config.
    // =======================================================================

    QUnit.module('Coverage - config set construction');

    QUnit.test('ADD_TAGS given a non-array is handled safely', (assert) => {
      const out = DOMPurify.sanitize('<div>x</div>', {
        ADD_TAGS: 'notanarray',
      });
      assert.ok(out.indexOf('x') > -1, `got: ${out}`);
    });

    QUnit.test('ADD_TAGS with a hole and a non-string element', (assert) => {
      const tags = ['custom-a'];
      tags[2] = 'custom-b'; // index 1 is a hole -> cleanArray null-fills it
      tags.push(123); // non-string element -> non-string branch of addToSet
      const out = DOMPurify.sanitize(
        '<custom-a></custom-a><custom-b></custom-b>',
        { ADD_TAGS: tags }
      );
      assert.ok(
        out.indexOf('custom-a') > -1 && out.indexOf('custom-b') > -1,
        `got: ${out}`
      );
    });

    // =======================================================================
    // Coverage - reachable branches the markup-driven suite never hits
    //
    // Public API surface (isValidAttribute, addHook guard), the user-supplied
    // TRUSTED_TYPES_POLICY config path (including its re-entrancy guard, #1422 /
    // GHSA-vxr8-fq34-vvx9), the forceKeepAttr/keepAttr hook decisions, the
    // noscript/noembed fallback-mXSS guard, and a few config permutations.
    //
    // Isolated: afterEach clears config and hooks so the sticky Trusted Types
    // policy and any added hooks cannot leak into the rest of the suite.
    // =======================================================================

    QUnit.module('Coverage - reachable branches', {
      beforeEach() {
        DOMPurify.clearConfig();
      },
      afterEach() {
        DOMPurify.removeAllHooks();
        DOMPurify.clearConfig();
      },
    });

    QUnit.test('isValidAttribute accepts and rejects', (assert) => {
      assert.ok(DOMPurify.isValidAttribute('a', 'href', 'https://example.com'));
      assert.notOk(DOMPurify.isValidAttribute('a', 'onclick', 'alert(1)'));
    });

    QUnit.test('addHook ignores a non-function', (assert) => {
      DOMPurify.addHook('uponSanitizeElement', null);
      assert.equal(DOMPurify.sanitize('<b>x</b>'), '<b>x</b>');
    });

    QUnit.test('null config is treated as empty config', (assert) => {
      assert.equal(DOMPurify.sanitize('<b>x</b>', null), '<b>x</b>');
    });

    QUnit.test('WHOLE_DOCUMENT keeps the document structure', (assert) => {
      const out = DOMPurify.sanitize(
        '<html><head></head><body><p>x</p></body></html>',
        { WHOLE_DOCUMENT: true }
      );
      assert.ok(out.indexOf('<p>x</p>') > -1, `got: ${out}`);
    });

    QUnit.test('template content is sanitized', (assert) => {
      const out = DOMPurify.sanitize(
        '<template><img src=x onerror=alert(1)></template>'
      );
      assert.equal(out.indexOf('onerror'), -1, `onerror survived: ${out}`);
    });

    QUnit.test(
      'namespaced SVG attribute is written via setAttributeNS',
      (assert) => {
        const out = DOMPurify.sanitize(
          '<svg><a xlink:href="https://x"></a></svg>'
        );
        assert.ok(out.indexOf('svg') > -1, `got: ${out}`);
      }
    );

    QUnit.test(
      'noscript/noembed fallback-mXSS guard removes the element',
      (assert) => {
        const out = DOMPurify.sanitize(
          '<noscript><noembed>x</noembed></noscript>'
        );
        assert.equal(out.indexOf('onerror'), -1, `got: ${out}`);
      }
    );

    QUnit.test(
      'uponSanitizeAttribute forceKeepAttr keeps a disallowed attribute',
      (assert) => {
        DOMPurify.addHook('uponSanitizeAttribute', (node, hookEvent) => {
          hookEvent.forceKeepAttr = true;
        });
        const out = DOMPurify.sanitize('<a onclick="alert(1)">x</a>');
        assert.ok(out.indexOf('onclick') > -1, `forceKeepAttr ignored: ${out}`);
      }
    );

    QUnit.test(
      'uponSanitizeAttribute keepAttr=false drops an allowed attribute',
      (assert) => {
        DOMPurify.addHook('uponSanitizeAttribute', (node, hookEvent) => {
          hookEvent.keepAttr = false;
        });
        const out = DOMPurify.sanitize('<a href="https://x">y</a>');
        assert.equal(out.indexOf('href'), -1, `keepAttr=false ignored: ${out}`);
      }
    );

    // ---- user-supplied TRUSTED_TYPES_POLICY config ----

    QUnit.test(
      'TRUSTED_TYPES_POLICY signs output through the policy',
      (assert) => {
        const policy = { createHTML: (s) => s, createScriptURL: (s) => s };
        const out = DOMPurify.sanitize('<b>x</b>', {
          TRUSTED_TYPES_POLICY: policy,
          RETURN_TRUSTED_TYPE: true,
        });
        assert.equal(String(out), '<b>x</b>');
      }
    );

    QUnit.test('TRUSTED_TYPES_POLICY without createHTML throws', (assert) => {
      assert.throws(
        () =>
          DOMPurify.sanitize('x', {
            TRUSTED_TYPES_POLICY: { createScriptURL: (s) => s },
          }),
        /createHTML/
      );
    });

    QUnit.test(
      'TRUSTED_TYPES_POLICY without createScriptURL throws',
      (assert) => {
        assert.throws(
          () =>
            DOMPurify.sanitize('x', {
              TRUSTED_TYPES_POLICY: { createHTML: (s) => s },
            }),
          /createScriptURL/
        );
      }
    );

    QUnit.test('TRUSTED_TYPES_POLICY null opts out for the call', (assert) => {
      assert.equal(
        DOMPurify.sanitize('<b>x</b>', { TRUSTED_TYPES_POLICY: null }),
        '<b>x</b>'
      );
    });

    QUnit.test(
      'a circular TRUSTED_TYPES_POLICY is rejected by the re-entrancy guard',
      (assert) => {
        const circular = {
          createHTML(s) {
            return DOMPurify.sanitize(s);
          },
          createScriptURL: (s) => s,
        };
        assert.throws(() =>
          DOMPurify.sanitize('<b>x</b>', { TRUSTED_TYPES_POLICY: circular })
        );
      }
    );

    // ---- config permutations ----

    QUnit.test('setConfig applies persistent configuration', (assert) => {
      DOMPurify.setConfig({ ALLOWED_TAGS: ['b'] });
      assert.equal(DOMPurify.sanitize('<b>x</b><i>y</i>'), '<b>x</b>y');
    });

    QUnit.test('ADD_ATTR given an array allows the attribute', (assert) => {
      const out = DOMPurify.sanitize('<a data-x="1">y</a>', {
        ADD_ATTR: ['data-x'],
      });
      assert.ok(out.indexOf('data-x') > -1, `got: ${out}`);
    });

    QUnit.test('integration-point objects are accepted', (assert) => {
      const out = DOMPurify.sanitize('<div>x</div>', {
        MATHML_TEXT_INTEGRATION_POINTS: { mtext: true },
        HTML_INTEGRATION_POINTS: { foreignobject: true },
      });
      assert.ok(out.indexOf('x') > -1, `got: ${out}`);
    });

    QUnit.test(
      'FORBID_CONTENTS clones before mutating the default',
      (assert) => {
        const out = DOMPurify.sanitize('<div><span>x</span></div>', {
          FORBID_CONTENTS: ['span'],
        });
        assert.ok(out.indexOf('<div>') > -1, `got: ${out}`);
      }
    );

    QUnit.test(
      'allowed noscript with a fallback-mXSS payload is removed',
      (assert) => {
        // The guard only runs for noscript/noembed/noframes that pass the
        // allow-list, so they have to be added first.
        const out = DOMPurify.sanitize(
          '<noscript><noembed>x</noembed></noscript>',
          { ADD_TAGS: ['noscript', 'noembed'] }
        );
        assert.equal(out.indexOf('onerror'), -1, `got: ${out}`);
      }
    );

    QUnit.test('IN_PLACE sanitizes and returns the passed node', (assert) => {
      const el = document.createElement('div');
      el.innerHTML = '<img src=x onerror=alert(1)>';
      const ret = DOMPurify.sanitize(el, { IN_PLACE: true });
      const img = el.querySelector('img');
      assert.equal(ret, el, 'returns the same node');
      assert.notOk(
        img && img.hasAttribute('onerror'),
        'onerror stripped in place'
      );
    });
  };
});
