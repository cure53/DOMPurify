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
    var document = window.document;
    var jQuery = window.jQuery;

    sanitizationTestCases.forEach((testCase) => {
      QUnit.test(`Sanitization test[${testCase.title}]`, (assert) => {
        assert.contains(
          DOMPurify.sanitize(testCase.payload),
          testCase.expected,
          `Payload: ${testCase.payload}`
        );
      });
    });

    // XSS tests: Native DOM methods (alert() should not be called)
    xssTestCases.forEach((testCase) => {
      QUnit.test(`XSS test: native[${testCase.title}]`, (assert) => {
        document.getElementById('qunit-fixture').innerHTML = DOMPurify.sanitize(
          testCase.payload
        );
        const done = assert.async();
        setTimeout(() => {
          assert.notEqual(window.xssed, true, 'alert() was called');
          // Teardown
          document.getElementById('qunit-fixture').innerHTML = '';
          window.xssed = false;
          done();
        }, 100);
      });
    });
    // XSS tests: jQuery (alert() should not be called)
    xssTestCases.forEach((testCase) => {
      QUnit.test(`XSS test: jQuery[${testCase.title}]`, (assert) => {
        jQuery('#qunit-fixture').html(DOMPurify.sanitize(testCase.payload));
        const done = assert.async();
        setTimeout(() => {
          assert.notEqual(window.xssed, true, 'alert() was called');
          // Teardown
          jQuery('#qunit-fixture').empty();
          window.xssed = false;
          done();
        }, 100);
      });
    });
    // document.write tests to handle FF's strange behavior
    xssTestCases.forEach((testCase) => {
      QUnit.test(
        `XSS test: document.write() into iframe[${testCase.title}]`,
        (assert) => {
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
        }
      );
    });

    // Config-Flag Tests
    QUnit.test(
      'Config-Flag tests: KEEP_CONTENT + ALLOWED_TAGS / ALLOWED_ATTR',
      function (assert) {
        // KEEP_CONTENT + ALLOWED_TAGS / ALLOWED_ATTR
        assert.equal(
          DOMPurify.sanitize('<iframe>Hello</iframe>', { KEEP_CONTENT: false }),
          ''
        );
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
        assert.equal(
          DOMPurify.sanitize('<form><input name="parentNode"></form>', {
            ALLOWED_TAGS: ['input'],
            KEEP_CONTENT: true,
          }),
          '<input>'
        );
      }
    );
    QUnit.test(
      'Config-Flag tests: ALLOW_SELF_CLOSE_IN_ATTR',
      function (assert) {
        // ALLOW_SELF_CLOSE_IN_ATTR
        assert.equal(
          DOMPurify.sanitize('<a href="#" class="foo <br/>">abc</a>', {
            ALLOW_SELF_CLOSE_IN_ATTR: false,
          }),
          '<a href="#">abc</a>'
        );
        assert.contains(
          DOMPurify.sanitize('<a href="#" class="foo <br/>">abc</a>', {
            ALLOW_SELF_CLOSE_IN_ATTR: true,
          }),
          [
            '<a href="#" class="foo <br/>">abc</a>',
            '<a href="#" class="foo &lt;br/&gt;">abc</a>',
          ]
        );
      }
    );
    QUnit.test('Config-Flag tests: ALLOW_DATA_ATTR', function (assert) {
      // ALLOW_DATA_ATTR
      assert.equal(
        DOMPurify.sanitize('<a href="#" data-abc"="foo">abc</a>', {
          ALLOW_DATA_ATTR: true,
        }),
        '<a href="#">abc</a>'
      );
      assert.equal(
        DOMPurify.sanitize('<a href="#" data-abc="foo">abc</a>', {
          ALLOW_DATA_ATTR: false,
        }),
        '<a href="#">abc</a>'
      );
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
      assert.equal(
        DOMPurify.sanitize('<a href="#" data-""="foo">abc</a>', {
          ALLOW_DATA_ATTR: true,
        }),
        '<a href="#">abc</a>'
      );
      assert.contains(
        DOMPurify.sanitize('<a href="#" data-äöü="foo">abc</a>', {
          ALLOW_DATA_ATTR: true,
        }),
        [
          '<a href="#" data-äöü="foo">abc</a>',
          '<a data-äöü="foo" href="#">abc</a>',
        ]
      );
      assert.contains(
        DOMPurify.sanitize('<a href="#" data-\u00B7._="foo">abc</a>', {
          ALLOW_DATA_ATTR: true,
        }),
        [
          '<a data-\u00B7._="foo" href="#">abc</a>',
          '<a href="#">abc</a>',
          '<a href="#" data-·._="foo">abc</a>',
        ] // IE11 and Edge throw an InvalidCharacterError
      );
      assert.equal(
        DOMPurify.sanitize('<a href="#" data-\u00B5="foo">abc</a>', {
          ALLOW_DATA_ATTR: true,
        }),
        '<a href="#">abc</a>'
      );
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
    });
    QUnit.test('Config-Flag tests: ADD_TAGS', function (assert) {
      // ADD_TAGS
      assert.equal(
        DOMPurify.sanitize('<my-component>abc</my-component>', {
          ADD_TAGS: ['my-component'],
        }),
        '<my-component>abc</my-component>'
      );
    });
    QUnit.test('Config-Flag tests: ADD_TAGS + ADD_ATTR', function (assert) {
      // ADD_TAGS + ADD_ATTR
      assert.equal(
        DOMPurify.sanitize('<my-component my-attr="foo">abc</my-component>', {
          ADD_TAGS: ['my-component'],
        }),
        '<my-component>abc</my-component>'
      );
      assert.equal(
        DOMPurify.sanitize('<my-component my-attr="foo">abc</my-component>', {
          ADD_TAGS: ['my-component'],
          ADD_ATTR: ['my-attr'],
        }),
        '<my-component my-attr="foo">abc</my-component>'
      );
    });
    QUnit.test('Config-Flag tests: ADD_TAGS as function', function (assert) {
      // ADD_TAGS as function for selective tag validation
      assert.equal(
        DOMPurify.sanitize(
          '<apple>content</apple><banana>content</banana><cherry>content</cherry>',
          {
            ADD_TAGS: (tagName) => {
              return ['apple', 'banana'].includes(tagName);
            },
            KEEP_CONTENT: false,
          }
        ),
        '<apple>content</apple><banana>content</banana>'
      );
      // ADD_TAGS function should reject tags when function returns false
      assert.equal(
        DOMPurify.sanitize('<allowed>yes</allowed><forbidden>no</forbidden>', {
          ADD_TAGS: (tagName) => {
            return tagName === 'allowed';
          },
          KEEP_CONTENT: false,
        }),
        '<allowed>yes</allowed>'
      );
      // ADD_TAGS function with pattern matching
      assert.equal(
        DOMPurify.sanitize(
          '<item1>one</item1><item2>two</item2><other>three</other>',
          {
            ADD_TAGS: (tagName) => {
              return tagName.startsWith('item');
            },
            KEEP_CONTENT: false,
          }
        ),
        '<item1>one</item1><item2>two</item2>'
      );
    });
    QUnit.test('Config-Flag tests: ADD_ATTR as function', function (assert) {
      // ADD_ATTR as function with tag-specific attribute validation
      assert.equal(
        DOMPurify.sanitize(
          '<one attribute-one="1" attribute-two="2"></one><two attribute-one="1" attribute-two="2"></two>',
          {
            ADD_TAGS: ['one', 'two'],
            ADD_ATTR: (attributeName, tagName) => {
              const allowedAttributes = {
                one: ['attribute-one'],
                two: ['attribute-two'],
              };
              return (
                allowedAttributes[tagName]?.includes(attributeName) || false
              );
            },
          }
        ),
        '<one attribute-one="1"></one><two attribute-two="2"></two>'
      );
      // ADD_ATTR function should work with built-in tags too
      assert.equal(
        DOMPurify.sanitize('<div custom-attr="test">content</div>', {
          ADD_ATTR: (attributeName, tagName) => {
            return tagName === 'div' && attributeName === 'custom-attr';
          },
        }),
        '<div custom-attr="test">content</div>'
      );
      // ADD_ATTR function should reject attributes when function returns false
      assert.equal(
        DOMPurify.sanitize('<one attribute-one="1" forbidden="bad"></one>', {
          ADD_TAGS: ['one'],
          ADD_ATTR: (attributeName, tagName) => {
            return tagName === 'one' && attributeName === 'attribute-one';
          },
        }),
        '<one attribute-one="1"></one>'
      );
      // ADD_ATTR function must not bypass URI validation: javascript: should be stripped
      assert.ok(
        DOMPurify.sanitize('<a href="javascript:alert(1)">x</a>', {
          ADD_ATTR: (attr) => attr === 'href',
        }).indexOf('javascript:') === -1,
        'ADD_ATTR function: javascript: URI must be stripped from href'
      );
      // ADD_ATTR function must preserve safe URIs after URI validation
      assert.equal(
        DOMPurify.sanitize('<a href="https://example.com">x</a>', {
          ADD_ATTR: (attr) => attr === 'href',
        }),
        '<a href="https://example.com">x</a>',
        'ADD_ATTR function: safe URI must be preserved in href'
      );
    });
    QUnit.test(
      'Config-Flag tests: ADD_TAGS function should not leak into subsequent array calls',
      function (assert) {
        // Step 1: Call with ADD_TAGS as a permissive function
        DOMPurify.sanitize('<b>x</b>', {
          ADD_TAGS: function () {
            return true;
          },
        });
        // Step 2: Call with ADD_TAGS as an array – should NOT allow iframe/object/embed
        var out = DOMPurify.sanitize(
          '<iframe src="https://evil.com"></iframe><object data="https://evil.com"></object><embed src="https://evil.com">',
          { ADD_TAGS: ['custom-tag'] }
        );
        assert.ok(
          !/<(iframe|object|embed)/i.test(out),
          'ADD_TAGS function must not leak permissiveness into subsequent array-based calls: ' +
            out
        );
        // Step 3: Call with no ADD_TAGS – should also be clean
        var out2 = DOMPurify.sanitize(
          '<iframe src="https://evil.com"></iframe>'
        );
        assert.ok(
          !/<iframe/i.test(out2),
          'Default call after function-based ADD_TAGS must block iframe: ' +
            out2
        );
      }
    );
    QUnit.test(
      'Config-Flag tests: ADD_ATTR function should not leak into subsequent array calls',
      function (assert) {
        // Step 1: Call with ADD_ATTR as a permissive function
        DOMPurify.sanitize('<b>x</b>', {
          ADD_ATTR: function () {
            return true;
          },
        });
        // Step 2: Call with ADD_ATTR as an array – should NOT allow javascript: URIs
        var out = DOMPurify.sanitize(
          '<a href="javascript:alert(1)">click</a>',
          { ADD_ATTR: ['class'] }
        );
        assert.ok(
          out.indexOf('javascript:') === -1,
          'ADD_ATTR function must not leak permissiveness into subsequent array-based calls: ' +
            out
        );
        // Step 3: Call with no ADD_ATTR – should also be clean
        var out2 = DOMPurify.sanitize(
          '<a href="javascript:alert(1)">click</a>'
        );
        assert.ok(
          out2.indexOf('javascript:') === -1,
          'Default call after function-based ADD_ATTR must block javascript: URIs: ' +
            out2
        );
      }
    );
    QUnit.test(
      'Config-Flag tests: FORBID_CONTENTS + FORBID_TAGS',
      function (assert) {
        // FORBID_CONTENTS + FORBID_TAGS
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
      'Config-Flag tests: FORBID_CONTENTS + ADD_FORBID_CONTENTS + FORBID_TAGS',
      function (assert) {
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
    QUnit.test(
      'Config-Flag tests: DEFAULT_FORBID_CONTENTS + ADD_FORBID_CONTENTS',
      function (assert) {
        assert.equal(
          DOMPurify.sanitize(
            '<script>var a = 1;</script><p><b>no not preserve me</b></p><a><i>preserve me</i></a>',
            { ADD_FORBID_CONTENTS: ['p'], FORBID_TAGS: ['script', 'p', 'a'] }
          ),
          '<i>preserve me</i>'
        );
      }
    );
    QUnit.test(
      'Config-Flag tests: SAFE_FOR_JQUERY (now inactive, secure by default)',
      function (assert) {
        assert.equal(
          DOMPurify.sanitize(
            '<a>123</a><option><style><img src=x onerror=alert(1)>'
          ),
          '<a>123</a><option></option>'
        );
        assert.equal(
          DOMPurify.sanitize(
            '<a>123</a><option><style><img src=x onerror=alert(1)>'
          ),
          '<a>123</a><option></option>'
        );
        assert.contains(
          DOMPurify.sanitize(
            '<option><style></option></select><b><img src=xx: onerror=alert(1)></style></option>'
          ),
          ['<option></option>', '']
        );
        assert.contains(
          DOMPurify.sanitize(
            '<option><iframe></select><b><script>alert(1)</script>'
          ),
          ['<option></option>', '']
        );
        assert.contains(
          DOMPurify.sanitize(
            '<option><iframe></select><b><script>alert(1)</script>'
          ),
          ['<option></option>', '']
        );
        assert.equal(
          DOMPurify.sanitize(
            '<b><style><style/><img src=xx: onerror=alert(1)>'
          ),
          '<b></b>'
        );
        assert.equal(
          DOMPurify.sanitize(
            '<b><style><style/><img src=xx: onerror=alert(1)>'
          ),
          '<b></b>'
        );
        assert.contains(
          DOMPurify.sanitize('1<template><s>000</s></template>2'),
          ['1<template><s>000</s></template>2', '1<template></template>2', '12']
        );
        assert.contains(DOMPurify.sanitize('<template><s>000</s></template>'), [
          '',
          '<template><s>000</s></template>',
        ]);
        // see https://github.com/cure53/DOMPurify/issues/283
        assert.equal(
          DOMPurify.sanitize('<i>&amp;amp; &lt;</i>'),
          '<i>&amp;amp; &lt;</i>'
        );
      }
    );
    QUnit.test('Config-Flag tests: SAFE_FOR_TEMPLATES', function (assert) {
      //SAFE_FOR_TEMPLATES
      assert.equal(
        DOMPurify.sanitize(
          '<a>123{{456}}<b><style><% alert(1) %></style>456</b></a>',
          { SAFE_FOR_TEMPLATES: true }
        ),
        '<a> <b><style> </style>456</b></a>'
      );
      assert.equal(
        DOMPurify.sanitize('<a data-bind="style: alert(1)"></a>', {
          SAFE_FOR_TEMPLATES: true,
        }),
        '<a></a>'
      );
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
      assert.equal(
        DOMPurify.sanitize(
          '<a>123<% <b>456}}</b><style>{{ alert(1) }}</style>456 %></a>',
          { SAFE_FOR_TEMPLATES: true }
        ),
        '<a>123 <b> </b><style> </style> </a>'
      );
      assert.equal(
        DOMPurify.sanitize('<a href="}}javascript:alert(1)"></a>', {
          SAFE_FOR_TEMPLATES: true,
        }),
        '<a></a>'
      );
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
    });
    QUnit.test('Config-Flag tests: SANITIZE_DOM', function (assert) {
      // SANITIZE_DOM
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
          SANITIZE_DOM: false,
        }),
        '<img src="x" name="getElementById">'
      );
      assert.equal(
        DOMPurify.sanitize('<img src="x" name="getElementById">', {
          SANITIZE_DOM: true,
        }),
        '<img src="x">'
      );
      assert.equal(
        DOMPurify.sanitize('<a href="x" id="location">click</a>', {
          SANITIZE_DOM: true,
        }),
        '<a href="x">click</a>'
      );
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
    });
    QUnit.test('Config-Flag tests: SANITIZE_NAMED_PROPS', function (assert) {
      // SANITIZE_NAMED_PROPS
      assert.equal(
        DOMPurify.sanitize('<a id="x"></a>', {
          SANITIZE_NAMED_PROPS: true,
        }),
        '<a id="user-content-x"></a>'
      );
      assert.equal(
        DOMPurify.sanitize('<form id="x"><input id="y"></form>', {
          SANITIZE_NAMED_PROPS: true,
        }),
        '<form id="user-content-x"><input id="user-content-y"></form>'
      );
      assert.equal(
        DOMPurify.sanitize('<a id="x"></a><a id="x"></a>', {
          SANITIZE_NAMED_PROPS: true,
        }),
        '<a id="user-content-x"></a><a id="user-content-x"></a>'
      );
    });
    QUnit.test('Config-Flag tests: WHOLE_DOCUMENT', function (assert) {
      //WHOLE_DOCUMENT
      assert.equal(DOMPurify.sanitize('123', { WHOLE_DOCUMENT: false }), '123');
      assert.equal(
        DOMPurify.sanitize('123', { WHOLE_DOCUMENT: true }),
        '<html><head></head><body>123</body></html>'
      );
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
    });
    QUnit.test('Config-Flag tests: RETURN_DOM', function (assert) {
      //RETURN_DOM
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
      assert.equal(
        DOMPurify.sanitize('123', { RETURN_DOM: true }).outerHTML,
        '<body>123</body>'
      );
    });
    QUnit.test('Config-Flag tests: shadowroot', function (assert) {
      assert.notEqual(
        DOMPurify.sanitize('123', {
          RETURN_DOM: true,
        }).ownerDocument,
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
        DOMPurify.sanitize('123', {
          RETURN_DOM_FRAGMENT: true,
        }).ownerDocument,
        document
      );
      assert.equal(
        DOMPurify.sanitize('123', {
          RETURN_DOM_FRAGMENT: true,
          ADD_ATTR: ['shadowroot'],
        }).ownerDocument,
        document
      );
    });
    QUnit.test('Config-Flag tests: RETURN_DOM_FRAGMENT', function (assert) {
      //RETURN_DOM_FRAGMENT
      // attempt clobbering
      var fragment = DOMPurify.sanitize(
        'foo<img id="createDocumentFragment">',
        {
          RETURN_DOM_FRAGMENT: true,
        }
      );
      assert.equal(fragment.nodeType, 11);
      assert.notEqual(fragment.ownerDocument, document);
      assert.equal(fragment.firstChild && fragment.firstChild.nodeValue, 'foo');
      // again, but without SANITIZE_DOM
      fragment = DOMPurify.sanitize('foo<img id="createDocumentFragment">', {
        RETURN_DOM_FRAGMENT: true,
        SANITIZE_DOM: false,
      });
      assert.equal(fragment.nodeType, 11);
      assert.notEqual(fragment.ownerDocument, document);
      assert.equal(fragment.firstChild && fragment.firstChild.nodeValue, 'foo');
    });
    QUnit.test('Config-Flag tests: RETURN_DOM_FRAGMENT', function (assert) {
      var xss = `<body><div><template shadowroot=open><img src=x onerror=alert(3)></template></div></body>`;
      var dom_body = DOMPurify.sanitize(xss, { RETURN_DOM: true });
      assert.equal(
        dom_body.outerHTML,
        '<body><div><template><img src="x"></template></div></body>'
      );
    });
    QUnit.test('Config-Flag tests: IN_PLACE', function (assert) {
      //IN_PLACE
      var dirty = document.createElement('a');
      dirty.setAttribute('href', 'javascript:alert(1)');
      var clean = DOMPurify.sanitize(dirty, { IN_PLACE: true });
      assert.equal(dirty, clean); // should return the input node
      assert.equal(dirty.href, ''); // should still sanitize
    });
    QUnit.test(
      'Config-Flag tests: SAFE_FOR_TEMPLATES strips boundary-spanning Mustache expressions in IN_PLACE mode',
      function (assert) {
        // Regression for the IN_PLACE counterpart of CVE-2026-41239.
        // Per-text-node scrubbing during the sanitizer walk misses {{...}}
        // whose halves sit on either side of a stripped foreign element: at
        // walk time each surrounding text node holds only a single '{' or '}',
        // so MUSTACHE_EXPR (which requires '{{' or '}}') matches nothing.
        // Once the foreign element is removed, the surrounding text nodes are
        // adjacent; a normalize() call merges them into one node containing
        // '{{...}}', which a template-evaluating framework would interpolate
        // on mount. The final scrub pass runs normalize() and then walks the
        // merged character data so the joined expression is caught.
        var dirty = document.createElement('div');
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
      'Config-Flag tests: SAFE_FOR_TEMPLATES strips boundary-spanning template-literal expressions in IN_PLACE mode',
      function (assert) {
        // Same bug class as above, for ES template literals: '$' and '{' land
        // in separate text nodes, so TMPLIT_EXPR (which requires the paired
        // '${' sigil) does not match per node. After normalize() merges the
        // surrounding text fragments the final scrub walks the joined node
        // and strips '${...}'.
        var dirty = document.createElement('div');
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
      'Config-Flag tests: SAFE_FOR_TEMPLATES pins RETURN_DOM_FRAGMENT scrub behavior',
      function (assert) {
        // RETURN_DOM_FRAGMENT was fixed alongside RETURN_DOM in CVE-2026-41239
        // and both paths now share the same scrub helper as IN_PLACE. Pinning
        // the fragment path here so future refactors of the post-walk return
        // logic do not silently regress it.
        var result = DOMPurify.sanitize(
          '<div>{<foo></foo>{constructor.constructor("alert(1)")()}<foo></foo>}</div>',
          {
            SAFE_FOR_TEMPLATES: true,
            RETURN_DOM_FRAGMENT: true,
          }
        );
        var container = document.createElement('div');
        container.appendChild(result);
        assert.notOk(
          /\{\{[\s\S]*\}\}/.test(container.innerHTML),
          'merged Mustache expression should be scrubbed in fragment mode'
        );
      }
    );
    QUnit.test(
      'Config-Flag tests: IN_PLACE insecure root-nodes',
      function (assert) {
        //IN_PLACE with insecure root node (script)
        var dirty = document.createElement('script');
        dirty.setAttribute('src', 'data:,alert(1)');
        assert.throws(function () {
          DOMPurify.sanitize(dirty, { IN_PLACE: true });
        });
      }
    );
    QUnit.test(
      'Config-Flag tests: IN_PLACE insecure root-nodes',
      function (assert) {
        //IN_PLACE with insecure root node (iframe)
        var dirty = document.createElement('iframe');
        dirty.setAttribute('src', 'javascript:alert(1)');
        assert.throws(function () {
          DOMPurify.sanitize(dirty, { IN_PLACE: true });
        });
      }
    );
    QUnit.test(
      'Config-Flag tests: IN_PLACE sanitizes attached open shadow root',
      function (assert) {
        // A host element passed to DOMPurify with IN_PLACE may already
        // carry an open shadow root. NodeIterator does not descend into
        // shadow trees, so the sanitizer must recurse explicitly.
        // NOTE: we intentionally avoid `src` on the <img> below — in
        // real browsers, setting innerHTML with <img src=x> kicks off
        // an image load that will fail and fire onerror, polluting the
        // window.xssed flag that other tests depend on.
        var host = document.createElement('div');
        var shadow = host.attachShadow({ mode: 'open' });
        shadow.innerHTML =
          '<a id="poc" href="javascript:alert(1)">click</a>' +
          '<img id="poc2" onerror="alert(2)">';
        DOMPurify.sanitize(host, { IN_PLACE: true });
        var a = host.shadowRoot.querySelector('#poc');
        var img = host.shadowRoot.querySelector('#poc2');
        assert.ok(a, 'link element preserved');
        assert.equal(
          a.getAttribute('href'),
          null,
          'javascript: href is stripped from shadow content'
        );
        assert.ok(img, 'img element preserved');
        assert.equal(
          img.getAttribute('onerror'),
          null,
          'onerror handler is stripped from shadow content'
        );
        // Defensive teardown — match the pattern used by the existing
        // XSS test loop so we never leave xssed=true for the next test.
        window.xssed = false;
      }
    );
    QUnit.test(
      'Config-Flag tests: IN_PLACE sanitizes nested shadow roots',
      function (assert) {
        // Shadow-inside-shadow: both levels must be sanitized.
        var outer = document.createElement('section');
        var outerShadow = outer.attachShadow({ mode: 'open' });
        var inner = document.createElement('div');
        outerShadow.appendChild(inner);
        inner.attachShadow({ mode: 'open' }).innerHTML =
          '<a id="nested" href="javascript:alert(1)">click</a>';
        DOMPurify.sanitize(outer, { IN_PLACE: true });
        var nested = outer.shadowRoot
          .querySelector('div')
          .shadowRoot.querySelector('#nested');
        assert.ok(nested, 'nested link preserved');
        assert.equal(
          nested.getAttribute('href'),
          null,
          'javascript: href is stripped from nested shadow content'
        );
        window.xssed = false;
      }
    );
    QUnit.test(
      'Config-Flag tests: RETURN_DOM with DOM input sanitizes clonable shadow root',
      function (assert) {
        // Feature-detect clonable shadow root support. importNode() is
        // expected to deep-clone the shadow root only when clonable is
        // honored by the engine. jsdom currently ignores the option, so
        // we skip the assertion there and rely on the browser pass.
        var supportsClonable = false;
        try {
          var probeHost = document.createElement('div');
          probeHost.attachShadow({ mode: 'open', clonable: true }).innerHTML =
            '<span>x</span>';
          var imported = document.importNode(probeHost, true);
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

        // Same caveat as the IN_PLACE test above: no `src` attribute on
        // the img so setting innerHTML in a real browser does not start
        // a load and fire onerror before sanitize() runs.
        var host = document.createElement('div');
        host.attachShadow({ mode: 'open', clonable: true }).innerHTML =
          '<a id="poc" href="javascript:alert(1)">click</a>' +
          '<img id="poc2" onerror="alert(2)">';

        var clean = DOMPurify.sanitize(host, { RETURN_DOM: true });
        var returnedHost = clean.firstElementChild;
        assert.ok(
          returnedHost.shadowRoot instanceof DocumentFragment,
          'cloned shadow root present on returned host'
        );
        var a = returnedHost.shadowRoot.querySelector('#poc');
        var img = returnedHost.shadowRoot.querySelector('#poc2');
        if (a) {
          assert.equal(
            a.getAttribute('href'),
            null,
            'javascript: href is stripped in cloned shadow'
          );
        } else {
          assert.ok(true, 'link removed entirely');
        }
        if (img) {
          assert.equal(
            img.getAttribute('onerror'),
            null,
            'onerror is stripped in cloned shadow'
          );
        } else {
          assert.ok(true, 'img removed entirely');
        }
        window.xssed = false;
      }
    );
    QUnit.test(
      'Config-Flag tests: RETURN_DOM_FRAGMENT with DOM input sanitizes clonable shadow root',
      function (assert) {
        var supportsClonable = false;
        try {
          var probeHost = document.createElement('div');
          probeHost.attachShadow({ mode: 'open', clonable: true }).innerHTML =
            '<span>x</span>';
          var imported = document.importNode(probeHost, true);
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

        var host = document.createElement('div');
        host.attachShadow({ mode: 'open', clonable: true }).innerHTML =
          '<a id="poc" href="javascript:alert(1)">click</a>';

        var fragment = DOMPurify.sanitize(host, { RETURN_DOM_FRAGMENT: true });
        var returnedHost = fragment.querySelector('div');
        assert.ok(
          returnedHost.shadowRoot instanceof DocumentFragment,
          'cloned shadow root present on returned host'
        );
        var a = returnedHost.shadowRoot.querySelector('#poc');
        if (a) {
          assert.equal(
            a.getAttribute('href'),
            null,
            'javascript: href is stripped in fragment shadow'
          );
        } else {
          assert.ok(true, 'link removed entirely');
        }
        window.xssed = false;
      }
    );
    QUnit.test('Config-Flag tests: FORBID_TAGS', function (assert) {
      //FORBID_TAGS
      assert.equal(
        DOMPurify.sanitize('<a>123<b>456</b></a>', { FORBID_TAGS: ['b'] }),
        '<a>123456</a>'
      );
      assert.equal(
        DOMPurify.sanitize('<a>123<b>456<script>alert(1)</script></b></a>789', {
          FORBID_TAGS: ['a', 'b'],
        }),
        '123456789'
      );
      assert.equal(
        DOMPurify.sanitize('<a>123<b>456</b></a>', { FORBID_TAGS: ['c'] }),
        '<a>123<b>456</b></a>'
      );
      assert.equal(
        DOMPurify.sanitize('<a>123<b>456<script>alert(1)</script></b></a>789', {
          FORBID_TAGS: ['script', 'b'],
        }),
        '<a>123456</a>789'
      );
      assert.equal(
        DOMPurify.sanitize('<a>123<b>456</b></a>', {
          ADD_TAGS: ['b'],
          FORBID_TAGS: ['b'],
        }),
        '<a>123456</a>'
      );
    });
    QUnit.test('Config-Flag tests: FORBID_ATTR', function (assert) {
      //FORBID_ATTR
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
      assert.equal(
        DOMPurify.sanitize('<a y="1">123<b y="1" y="2">456</b></a>', {
          FORBID_ATTR: ['y'],
        }),
        '<a>123<b>456</b></a>'
      );
      assert.equal(
        DOMPurify.sanitize(
          '<a>123<b x="1">456<script y="1">alert(1)</script></b></a>789',
          { FORBID_ATTR: ['x', 'y'] }
        ),
        '<a>123<b>456</b></a>789'
      );
    });
    QUnit.test(
      'Config-Param tests: CUSTOM_ELEMENT_HANDLING',
      function (assert) {
        //CUSTOM_ELEMENT_HANDLING
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
        assert.equal(
          DOMPurify.sanitize(
            '<my-paragraph><span slot="my-text">test</span></my-paragraph>',
            {
              CUSTOM_ELEMENT_HANDLING: { tagNameCheck: /-/u },
            }
          ),
          '<my-paragraph><span slot="my-text">test</span></my-paragraph>'
        );
      }
    );
    QUnit.test(
      'CUSTOM_ELEMENT_HANDLING config values of null do not throw a TypeError.',
      function (assert) {
        DOMPurify.sanitize('', {
          CUSTOM_ELEMENT_HANDLING: {
            tagNameCheck: null,
            attributeNameCheck: null,
            allowCustomizedBuiltInElements: null,
          },
        });

        // Don't see a great way to assert NOT throws...
        assert.ok(true);
      }
    );

    QUnit.test(
      'Config-Param tests: CUSTOM_ELEMENT_HANDLING should ignore inherited top-level config',
      function (assert) {
        var proto = {};
        Object.defineProperty(proto, 'CUSTOM_ELEMENT_HANDLING', {
          get: function () {
            throw new Error('must not read inherited CUSTOM_ELEMENT_HANDLING');
          },
        });
        var config = Object.create(proto);

        assert.equal(
          DOMPurify.sanitize('<foo-bar>abc</foo-bar>', config),
          'abc'
        );
      }
    );

    QUnit.test(
      'Config-Param tests: CUSTOM_ELEMENT_HANDLING should ignore inherited nested config',
      function (assert) {
        var inheritedHandling = Object.create({
          tagNameCheck: /-/u,
        });

        assert.equal(
          DOMPurify.sanitize('<foo-bar>abc</foo-bar>', {
            CUSTOM_ELEMENT_HANDLING: inheritedHandling,
          }),
          'abc'
        );
      }
    );

    QUnit.test(
      'Config-Param tests: CUSTOM_ELEMENT_HANDLING should ignore inherited nested getters',
      function (assert) {
        var proto = {};
        Object.defineProperty(proto, 'tagNameCheck', {
          get: function () {
            throw new Error('must not read inherited tagNameCheck');
          },
        });
        var inheritedHandling = Object.create(proto);

        assert.equal(
          DOMPurify.sanitize('abc', {
            CUSTOM_ELEMENT_HANDLING: inheritedHandling,
          }),
          'abc'
        );
      }
    );

    QUnit.test(
      'Config-Param tests: CUSTOM_ELEMENT_HANDLING should not leak into subsequent default calls',
      function (assert) {
        DOMPurify.sanitize('<foo-bar>abc</foo-bar>', {
          CUSTOM_ELEMENT_HANDLING: {
            tagNameCheck: /-/u,
          },
        });

        assert.equal(DOMPurify.sanitize('<foo-bar>abc</foo-bar>'), 'abc');
      }
    );

    QUnit.test(
      'CUSTOM_ELEMENT_HANDLING attributeNameCheck with tagName parameter',
      function (assert) {
        assert.equal(
          DOMPurify.sanitize(
            '<element-one attribute-one="1" attribute-two="2"></element-one><element-two attribute-one="1" attribute-two="2"></element-two>',
            {
              CUSTOM_ELEMENT_HANDLING: {
                tagNameCheck: (tagName) => tagName.match(/^element-(one|two)$/),
                attributeNameCheck: (attr, tagName) => {
                  if (tagName === 'element-one') {
                    return ['attribute-one'].includes(attr);
                  } else if (tagName === 'element-two') {
                    return ['attribute-two'].includes(attr);
                  } else {
                    return false;
                  }
                },
                allowCustomizedBuiltInElements: false,
              },
            }
          ),
          '<element-one attribute-one="1"></element-one><element-two attribute-two="2"></element-two>'
        );
      }
    );
    QUnit.test('Test dirty being an array', function (assert) {
      assert.equal(
        DOMPurify.sanitize(['<a>123<b>456</b></a>']),
        '<a>123<b>456</b></a>'
      );
      assert.equal(
        DOMPurify.sanitize(['<img src=', 'x onerror=alert(1)>']),
        '<img src=",x">'
      );
    });
    // cross-check that document.write into iframe works properly
    QUnit.test('XSS test: document.write() into iframe', function (assert) {
      const done = assert.async();
      window.xssed = false;
      var iframe = document.createElement('iframe');
      iframe.src = 'about:blank';
      iframe.onload = function () {
        iframe.contentDocument.write(
          '<script>window.alert=function(){parent.xssed=true;}</script><script>alert(1);</script>'
        );
        assert.equal(window.xssed, true, 'alert() was called but not detected');
        window.xssed = false;
        iframe.parentNode.removeChild(iframe);
        done();
      };
      document.body.appendChild(iframe);
    });
    // Check for isSupported property
    QUnit.test('DOMPurify property tests', function (assert) {
      assert.equal(typeof DOMPurify.isSupported, 'boolean');
    });
    // Test with a custom window object
    QUnit.test('DOMPurify custom window tests', function (assert) {
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
    // Test to prevent security issues with pre-clobbered DOM
    QUnit.test(
      'sanitize() should not throw if the original document is clobbered _after_ DOMPurify has been instantiated',
      function (assert) {
        var evilNode = document.createElement('div');
        evilNode.innerHTML =
          '<img id="implementation"><img id="createNodeIterator"><img id="importNode"><img id="createElement">';
        document.body.appendChild(evilNode);
        try {
          // tests implementation and createNodeIterator
          var resultPlain = DOMPurify.sanitize('123');
          // tests importNode
          var resultImport = DOMPurify.sanitize('123', {
            RETURN_DOM: true,
            ADD_ATTR: ['shadowroot'],
          });
          // tests createElement
          var resultBody = DOMPurify.sanitize('123<img id="body">');
        } finally {
          // clean up before doing the actual assertions, otherwise qunit/jquery/etc might blow up
          document.body.removeChild(evilNode);
        }
        assert.equal(resultPlain, '123');
        assert.equal(resultImport.ownerDocument, document);
        assert.equal(resultBody, '123<img>');
      }
    );
    // Tests to ensure that a configuration can be set and cleared
    QUnit.test(
      'ensure that a persistent configuration can be set and cleared',
      function (assert) {
        var dirty = '<foobar>abc</foobar>';
        assert.equal(DOMPurify.sanitize(dirty), 'abc');
        DOMPurify.setConfig({ ADD_TAGS: ['foobar'] });
        assert.equal(DOMPurify.sanitize(dirty), '<foobar>abc</foobar>');
        DOMPurify.clearConfig();
        assert.equal(DOMPurify.sanitize(dirty), 'abc');
      }
    );
    // Test to ensure that a hook can add allowed tags / attributes on the fly
    QUnit.test(
      'ensure that a hook can add allowed tags / attributes on the fly',
      function (assert) {
        DOMPurify.addHook('uponSanitizeElement', function (node, data) {
          if (
            node.nodeName &&
            node.nodeName.match(/^\w+-\w+$/) &&
            !data.allowedTags[data.tagName]
          ) {
            data.allowedTags[data.tagName] = true;
          }
        });
        DOMPurify.addHook('uponSanitizeAttribute', function (node, data) {
          if (
            data.attrName &&
            data.attrName.match(/^\w+-\w+$/) &&
            !data.allowedAttributes[data.attrName]
          ) {
            data.allowedAttributes[data.attrName] = true;
          }
        });
        var dirty =
          '<p>HE<iframe></iframe><is-custom onload="alert(1)" super-custom="test" />LLO</p>';
        var modified =
          '<p>HE<is-custom super-custom="test">LLO</is-custom></p>';
        assert.equal(DOMPurify.sanitize(dirty), modified);
        DOMPurify.removeHooks('uponSanitizeElement');
        DOMPurify.removeHooks('uponSanitizeAttribute');
      }
    );
    // Test to ensure that if input[type=file] is badlisted and flagged as an
    // attribute not to keep via hookEvent.keepAttr, it should be removed despite
    // it being an issue of being able to programmatically add it back in Safari.
    QUnit.test(
      'ensure that input[type=file] is removed via hookEvent keepAttr',
      function (assert) {
        DOMPurify.addHook('uponSanitizeAttribute', function (node, data) {
          if (
            node.nodeName == 'INPUT' &&
            node.getAttribute('type') &&
            node.getAttribute('type') == 'file'
          ) {
            data.keepAttr = false;
          }
        });
        var dirty = '<input type="file" />';
        var modified = '<input>';
        if (window.name == 'nodejs') {
          assert.equal(DOMPurify.sanitize(dirty), modified);
        } else {
          assert.expect(0);
        }
        DOMPurify.removeHooks('uponSanitizeAttribute');
      }
    );
    QUnit.test(
      'sanitize() should allow unknown protocols when ALLOW_UNKNOWN_PROTOCOLS is true',
      function (assert) {
        var dirty =
          '<div><a href="spotify:track:12345"><img src="cid:1234567"></a></div>';
        assert.equal(
          dirty,
          DOMPurify.sanitize(dirty, { ALLOW_UNKNOWN_PROTOCOLS: true })
        );
      }
    );

    QUnit.test(
      'sanitize() should not allow javascript when ALLOW_UNKNOWN_PROTOCOLS is true',
      function (assert) {
        var dirty =
          '<div><a href="javascript:alert(document.title)"><img src="cid:1234567"/></a></div>';
        var modified = '<div><a><img src="cid:1234567"></a></div>';
        assert.equal(
          modified,
          DOMPurify.sanitize(dirty, { ALLOW_UNKNOWN_PROTOCOLS: true })
        );
      }
    );

    QUnit.test(
      'Regression-Test to make sure #166 stays fixed',
      function (assert) {
        var dirty = '<p onFoo="123">HELLO</p>';
        var modified = '<p>HELLO</p>';
        assert.equal(
          modified,
          DOMPurify.sanitize(dirty, { ALLOW_UNKNOWN_PROTOCOLS: true })
        );
      }
    );

    // Test 1 to check if the element count in DOMPurify.removed is correct
    QUnit.test(
      'DOMPurify.removed should contain one element',
      function (assert) {
        var dirty =
          '<svg onload=alert(1)><filter><feGaussianBlur /></filter></svg>';
        DOMPurify.sanitize(dirty);
        assert.contains(DOMPurify.removed.length, [1, 2]); // IE removes two
      }
    );

    // Test 2 to check if the element count in DOMPurify.removed is correct
    QUnit.test(
      'DOMPurify.removed should contain two elements',
      function (assert) {
        var dirty =
          '1<script>alert(1)</script><svg onload=alert(1)><filter><feGaussianBlur /></filter></svg>';
        DOMPurify.sanitize(dirty);
        assert.contains(DOMPurify.removed.length, [2, 3]); // IE removed three
      }
    );

    // Test 3 to check if the element count in DOMPurify.removed is correct
    QUnit.test('DOMPurify.removed should be correct', function (assert) {
      var dirty = '<img src=x onerror="alert(1)">';
      DOMPurify.sanitize(dirty);
      assert.equal(DOMPurify.removed.length, 1);
    });

    // Test 4 to check that DOMPurify.removed is correct in SAFE_FOR_TEMLATES mode
    QUnit.test(
      'DOMPurify.removed should be correct in SAFE_FOR_TEMPLATES mode',
      function (assert) {
        var dirty = '<a>123{{456}}</a>';
        DOMPurify.sanitize(dirty, {
          WHOLE_DOCUMENT: true,
          SAFE_FOR_TEMPLATES: true,
        });
        assert.equal(DOMPurify.removed.length, 1);
      }
    );

    // Test 5 to check that DOMPurify.removed is correct in SAFE_FOR_TEMLATES mode
    QUnit.test(
      'DOMPurify.removed should be correct in SAFE_FOR_TEMPLATES mode',
      function (assert) {
        var dirty = '<a>123{{456}}<b>456{{789}}</b></a>';
        DOMPurify.sanitize(dirty, {
          WHOLE_DOCUMENT: true,
          SAFE_FOR_TEMPLATES: true,
        });
        assert.equal(DOMPurify.removed.length, 2);
      }
    );

    // Test 6 to check that DOMPurify.removed is correct in SAFE_FOR_TEMLATES mode
    QUnit.test(
      'DOMPurify.removed should be correct in SAFE_FOR_TEMPLATES mode',
      function (assert) {
        var dirty = '<img src=1 width="{{123}}">';
        DOMPurify.sanitize(dirty, {
          WHOLE_DOCUMENT: true,
          SAFE_FOR_TEMPLATES: true,
        });
        assert.equal(DOMPurify.removed.length, 1);
      }
    );

    // Test 7 to check that DOMPurify.removed is correct
    QUnit.test('DOMPurify.removed should be correct', function (assert) {
      var dirty = '<option><iframe></select><b><script>alert(1)</script>';
      DOMPurify.sanitize(dirty);
      assert.equal(DOMPurify.removed.length, 1);
    });

    // Test 8 to check that DOMPurify.removed is correct if tags are clean
    QUnit.test(
      'DOMPurify.removed should not contain elements if tags are permitted',
      function (assert) {
        var dirty = '<a>123</a>';
        DOMPurify.sanitize(dirty);
        assert.equal(DOMPurify.removed.length, 0);
      }
    );

    // Test 9 to check that DOMPurify.removed is correct if the tags and attributes are clean
    QUnit.test(
      'DOMPurify.removed should not contain elements if all tags and attrs are permitted',
      function (assert) {
        var dirty = '<img src=x>';
        DOMPurify.sanitize(dirty);
        assert.equal(DOMPurify.removed.length, 0);
      }
    );

    // Test 10 to check that DOMPurify.removed does not have false positive elements in SAFE_FOR_TEMLATES mode
    QUnit.test(
      'DOMPurify.removed should not contain elements for valid data in SAFE_FOR_TEMLATES mode',
      function (assert) {
        var dirty = '1';
        DOMPurify.sanitize(dirty, {
          WHOLE_DOCUMENT: true,
          SAFE_FOR_TEMPLATES: true,
        });
        assert.equal(DOMPurify.removed.length, 0);
      }
    );

    // Test 11 to check that DOMPurify.removed does not have false positive elements
    QUnit.test(
      'DOMPurify.removed should not contain elements for valid data',
      function (assert) {
        var dirty = '1';
        DOMPurify.sanitize(dirty, {
          WHOLE_DOCUMENT: true,
        });
        assert.equal(DOMPurify.removed.length, 0);
      }
    );
    // Tests to make sure that the node scanning feature delivers accurate results on all browsers
    QUnit.test(
      'DOMPurify should deliver accurate results when sanitizing nodes 1',
      function (assert) {
        var clean = DOMPurify.sanitize(document.createElement('td'));
        assert.equal(clean, '<td></td>');
      }
    );
    QUnit.test(
      'DOMPurify should deliver accurate results when sanitizing nodes 2',
      function (assert) {
        var clean = DOMPurify.sanitize(document.createElement('td'), {
          RETURN_DOM: true,
        });
        assert.equal(clean.outerHTML, '<body><td></td></body>');
      }
    );
    // Test to make sure that URI_safe attributes can be configured too
    QUnit.test(
      'DOMPurify should allow to define URI safe attributes',
      function (assert) {
        var clean = DOMPurify.sanitize('<b typeof="bla:h">123</b>', {
          ALLOWED_ATTR: ['typeof'],
          ADD_URI_SAFE_ATTR: ['typeof'],
        });
        assert.equal(clean, '<b typeof="bla:h">123</b>');
      }
    );
    // Test to make sure that URI_safe attributes don't persist, see #327
    QUnit.test(
      'DOMPurify should not persist URI safe attributes',
      function (assert) {
        var clean = DOMPurify.sanitize('<b typeof="bla:h">123</b>', {
          ALLOWED_ATTR: ['typeof'],
          ADD_URI_SAFE_ATTR: ['typeof'],
        });
        var clean = DOMPurify.sanitize('<b typeof="bla:h">123</b>', {
          ALLOWED_ATTR: ['typeof'],
        });
        assert.equal(clean, '<b>123</b>');
      }
    );
    // Test to make sure that URI_safe attributes don't overwrite default, see #366
    QUnit.test(
      'DOMPurify should not overwrite default URI safe attributes',
      function (assert) {
        var clean = DOMPurify.sanitize(
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
    // Tests to make sure that FORCE_BODY pushes elements to document.body (#199)
    QUnit.test(
      'FORCE_BODY needs to push some elements to document.body',
      function (assert) {
        var clean = DOMPurify.sanitize('<style>123</style>', {
          FORCE_BODY: true,
        });
        assert.equal(clean, '<style>123</style>');
      }
    );
    QUnit.test(
      'FORCE_BODY needs to push some elements to document.body',
      function (assert) {
        var clean = DOMPurify.sanitize('<script>123</script>', {
          FORCE_BODY: true,
          ADD_TAGS: ['script'],
        });
        assert.equal(clean, '<script>123</script>');
      }
    );
    QUnit.test(
      'FORCE_BODY needs to push some elements to document.body',
      function (assert) {
        var clean = DOMPurify.sanitize(' AAAAA', { FORCE_BODY: true });
        assert.equal(clean, ' AAAAA');
      }
    );
    QUnit.test(
      'Lack of FORCE_BODY still preserves leading whitespace',
      function (assert) {
        var clean = DOMPurify.sanitize(' <b>AAAAA</b>', { FORCE_BODY: false });
        assert.equal(clean, ' <b>AAAAA</b>');
      }
    );
    QUnit.test(
      'Lack of FORCE_BODY needs to push some elements to document.head',
      function (assert) {
        var clean = DOMPurify.sanitize('<style>123</style>', {
          FORCE_BODY: false,
        });
        assert.equal(clean, '');
      }
    );
    // Test to make sure that ALLOW_ARIA_ATTR is working as expected (#198)
    QUnit.test('Config-Flag tests: ALLOW_ARIA_ATTR', function (assert) {
      assert.contains(
        DOMPurify.sanitize('<a aria-abc="foo" href="#">abc</a>', {
          ALLOW_ARIA_ATTR: true,
        }),
        [
          '<a aria-abc="foo" href="#">abc</a>',
          '<a href="#" aria-abc="foo">abc</a>',
        ]
      );
      assert.equal(
        DOMPurify.sanitize('<a href="#" aria-aöü="foo">abc</a>', {
          ALLOW_ARIA_ATTR: true,
        }),
        '<a href="#">abc</a>'
      );
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
    });
    QUnit.test('Config-Flag tests: USE_PROFILES', function (assert) {
      assert.equal(
        DOMPurify.sanitize('<h1>HELLO</h1>', { USE_PROFILES: { html: false } }),
        'HELLO'
      );
      assert.equal(
        DOMPurify.sanitize('<h1>HELLO</h1>', { USE_PROFILES: { html: true } }),
        '<h1>HELLO</h1>'
      );
      assert.contains(
        DOMPurify.sanitize('<h1>HELLO</h1><math></math>', {
          USE_PROFILES: { html: true, mathMl: true },
        }),
        [
          '<h1>HELLO</h1>',
          '<h1>HELLO</h1><math></math>',
          '<h1>HELLO</h1><math></math>',
        ]
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
      assert.contains(
        DOMPurify.sanitize('<h1>HELLO</h1><math><mi></mi></math>', {
          USE_PROFILES: { html: true, mathMl: true },
          FORBID_TAGS: ['mi'],
        }),
        [
          '<h1>HELLO</h1>',
          '<h1>HELLO</h1><math></math>',
          '<h1>HELLO</h1><math></math>',
        ]
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
      assert.equal(
        DOMPurify.sanitize('<h1>HELLO</h1>', { USE_PROFILES: { bogus: true } }),
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
          '<svg><feblend in="SourceGraphic" mode="multiply"></feblend></svg>',
          '<svg><feBlend in="SourceGraphic" mode="multiply"></feBlend></svg>',
          '<svg><feBlend in="SourceGraphic" mode="multiply"></feBlend></svg>',
          '<svg xmlns="http://www.w3.org/2000/svg"><feBlend in="SourceGraphic" mode="multiply" /></svg>',
          '<svg xmlns="http://www.w3.org/2000/svg" />',
        ]
      );
      assert.contains(
        DOMPurify.sanitize(
          '<svg><style>.some-class {fill: #fff}</style></svg>',
          {
            USE_PROFILES: { svg: true },
          }
        ),
        [
          '',
          '<svg><style>.some-class {fill: #fff}</style></svg>',
          '<svg xmlns="http://www.w3.org/2000/svg"><style>.some-class {fill: #fff}</style></svg>',
          '<svg xmlns="http://www.w3.org/2000/svg" />',
        ]
      );
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
      assert.equal(
        DOMPurify.sanitize('<span>SEE ME</span>', {
          USE_PROFILES: { html: true },
          KEEP_CONTENT: false,
        }),
        '<span>SEE ME</span>'
      );
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
    QUnit.test(
      'Config-Flag tests: USE_PROFILES should ignore inherited top-level config',
      function (assert) {
        var proto = {};
        Object.defineProperty(proto, 'USE_PROFILES', {
          get: function () {
            throw new Error('must not read inherited USE_PROFILES');
          },
        });
        var config = Object.create(proto);

        assert.equal(
          DOMPurify.sanitize('<h1>HELLO</h1>', config),
          '<h1>HELLO</h1>'
        );
      }
    );

    QUnit.test(
      'Config-Flag tests: USE_PROFILES should ignore inherited profile flags',
      function (assert) {
        var inheritedProfiles = Object.create({
          html: true,
        });

        assert.equal(
          DOMPurify.sanitize('<h1>HELLO</h1>', {
            USE_PROFILES: inheritedProfiles,
          }),
          'HELLO'
        );
      }
    );
    QUnit.test(
      'Config-Flag tests: USE_PROFILES should not leak into subsequent default calls',
      function (assert) {
        DOMPurify.sanitize('<h1>HELLO</h1>', {
          USE_PROFILES: {
            html: false,
          },
        });

        assert.equal(DOMPurify.sanitize('<h1>HELLO</h1>'), '<h1>HELLO</h1>');
      }
    );
    QUnit.test('Config-Flag tests: ALLOWED_URI_REGEXP', function (assert) {
      var tests = [
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
      tests.forEach(function (test) {
        var str = DOMPurify.sanitize(test.test, {
          ALLOWED_URI_REGEXP:
            /^(?:(?:(?:f|ht)tps?):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
        });
        assert.equal(str, test.expected);
      });
    });
    QUnit.test('Ensure ALLOWED_URI_REGEXP is not cached', function (assert) {
      const dirty = '<img src="https://different.com">',
        expected = '<img src="https://different.com">';

      assert.equal(DOMPurify.sanitize(dirty), expected);

      // sanitize with a custom URI regexp
      assert.equal(
        DOMPurify.sanitize('<img src="https://test.com">', {
          ALLOWED_URI_REGEXP: /test\.com/i,
        }),
        '<img src="https://test.com">'
      );

      // ensure that the previous regexp does not affect future sanitize calls
      assert.equal(DOMPurify.sanitize(dirty), expected);
    });
    QUnit.test(
      'Avoid freeze when using tables and ALLOW_TAGS',
      function (assert) {
        var clean = DOMPurify.sanitize('<table><tr><td></td></tr></table>', {
          ALLOW_TAGS: ['table', 'tr', 'td'],
        });
        assert.equal(clean, '<table><tbody><tr><td></td></tr></tbody></table>');
      }
    );
    QUnit.test(
      'Avoid XSS with ALLOW_TAGS permitting noembed, noscript',
      function (assert) {
        var clean = DOMPurify.sanitize(
          "a<noembed><p id='</noembed><img src=x onerror=alert(1)>'></p></noembed>",
          { ADD_TAGS: ['noembed'] }
        );
        assert.contains(clean, [
          'a<noembed><p id=\'</noembed><img src="x">\'&gt;<p></p>',
          'a',
          'a<noembed>&lt;p id=\'</noembed><img src="x">\'&gt;<p></p>',
          'a<noembed><p id="&lt;/noembed&gt;&lt;img src=x onerror=alert(1)&gt;"></p></noembed>',
          'a<noembed></noembed>',
          'a<img src="x">\'&gt;<p></p>',
        ]);
      }
    );
    QUnit.test(
      'Avoid mXSS in Chrome 77 and above using SVG',
      function (assert) {
        var clean = DOMPurify.sanitize('<svg></p><style><g title="</style>');
        assert.contains(clean, [
          '',
          '<svg></svg><p></p><style><g title="</style>',
          '<p></p><style><g title="</style>',
          '<svg></svg><p></p>',
          '<svg><style></style></svg>',
          '<svg xmlns="http://www.w3.org/2000/svg"><style /></svg>',
          '<svg xmlns="http://www.w3.org/2000/svg"><style /></svg></svg>',
        ]);
      }
    );
    QUnit.test(
      'Avoid mXSS in Chrome 77 and above using HTML',
      function (assert) {
        var clean = DOMPurify.sanitize('<svg></p><title><a href="</title>qqq');
        assert.contains(clean, [
          '',
          '<svg></svg><p></p><title>&lt;a href="</title>qqq<img src="">"&gt;',
          '<svg></svg><p></p><title>&lt;a href="</title>qqq',
          '<p></p><title>&lt;a href="</title>qqq',
          '<svg></svg><p></p>qqq',
          '<svg><title></title></svg>',
          '<svg xmlns="http://www.w3.org/2000/svg"><title /></svg>',
          '<svg xmlns="http://www.w3.org/2000/svg"><title /></svg></svg>',
        ]);
      }
    );
    QUnit.test(
      'Test for correct return value when RETURN_TRUSTED_TYPE is true',
      function (assert) {
        var clean = DOMPurify.sanitize('<b>hello goodbye</b>', {
          RETURN_TRUSTED_TYPE: true,
        });
        var type = typeof clean;
        assert.contains(type, ['TrustedHTML', 'string', 'object']);
      }
    );
    QUnit.test(
      'Test for correct return value when RETURN_TRUSTED_TYPE is false',
      function (assert) {
        var clean = DOMPurify.sanitize('<b>hello goodbye</b>', {
          RETURN_TRUSTED_TYPE: false,
        });
        var type = typeof clean;
        assert.equal(type, 'string');
      }
    );
    QUnit.test(
      'Test for correct return value when RETURN_TRUSTED_TYPE is not set',
      function (assert) {
        var clean = DOMPurify.sanitize('<b>hello goodbye</b>');
        var type = typeof clean;
        assert.equal(type, 'string');
      }
    );

    QUnit.test(
      'Test for DoS coming from table sanitization 1/2 See #365',
      function (assert) {
        var config = { FORBID_TAGS: ['tbody'] };
        var clean = DOMPurify.sanitize(
          '<table><tbody><tr><td>test</td></tr></tbody></table>',
          config
        );
        assert.equal(
          clean,
          '<table><tbody><tr><td>test</td></tr></tbody></table>'
        );
      }
    );
    QUnit.test(
      'Test for DoS coming from table sanitization 2/2 See #365',
      function (assert) {
        var config = {
          ALLOWED_TAGS: [
            'b',
            'strong',
            'i',
            'italic',
            'div',
            'p',
            'span',
            'ul',
            'li',
            'ol',
            'a',
            'img',
            'br',
            'tr',
            'td',
            'th',
            'table',
            'h1',
            'h2',
            'h3',
            'h4',
            'h5',
            'h6',
          ],
          ALLOW_DATA_ATTR: false,
          ALLOWED_ATTR: ['src', 'class', 'target', 'href'],
        };
        var clean = DOMPurify.sanitize(
          '<table><colgroup><col></col></colgroup><tbody><tr><td >test</td></tr></tbody></table>',
          config
        );
        assert.equal(
          clean,
          '<table><tbody><tr><td>test</td></tr></tbody></table>'
        );
      }
    );
    QUnit.test(
      'Test for less aggressive mXSS handling, See #369',
      function (assert) {
        var config = {
          FORBID_TAGS: ['svg', 'math'],
        };
        var clean = DOMPurify.sanitize(
          '<b data-test="<span>content</span>"></b>',
          config
        );
        assert.contains(clean, [
          '<b data-test="<span>content</span>"></b>',
          '<b data-test="&lt;span&gt;content&lt;/span&gt;"></b>',
        ]);
      }
    );
    QUnit.test(
      'Test against mXSS using text integration points and removal 1/2',
      function (assert) {
        var config = {
          FORBID_TAGS: ['mi'],
        };
        var clean = DOMPurify.sanitize(
          '<math><mi><b><style><b title="</style><iframe onload&#x3d;alert(1)<!--"></style>',
          config
        );
        assert.contains(clean, [
          '<math><b><style><b title="</style></b></math>',
          '<math></math>',
          '',
        ]);
      }
    );
    QUnit.test(
      'Test against mXSS using text integration points and removal 2/2',
      function (assert) {
        var config = {
          ADD_TAGS: ['xmp'],
        };
        var clean = DOMPurify.sanitize(
          "x<noframes><svg><b><xmp><b title='</xmp><img>",
          config
        );
        assert.contains(clean, ['x']);
      }
    );
    QUnit.test(
      'Test against insecure behavior in jQUery v3.0 and newer 1/2',
      function (assert) {
        var config = {};
        var clean = DOMPurify.sanitize(
          '<img x="/><img src=x onerror=alert(1)>" y="<x">',
          config
        );
        assert.contains(clean, [
          '<img x="/><img src=x onerror=alert(1)>" y="<x">', // jsdom
          '<img y="<x">',
          '<img y="&lt;x">',
          '<img y="<x">',
          '<img x="/&gt;&lt;img src=x onerror=alert(1)&gt;" y="&lt;x">',
        ]);
      }
    );
    QUnit.test(
      'Test against insecure behavior in jQUery v3.0 and newer 2/2',
      function (assert) {
        var config = {};
        var clean = DOMPurify.sanitize(
          "a<noscript><p id='><noscript /><img src=x onerror=alert(1)>'></noscript>",
          config
        );
        assert.contains(clean, [
          "a<noscript>&lt;p id='>&lt;noscript />&lt;img src=x onerror=alert(1)>'></noscript>", // jsdom
          'a<noscript><p></p></noscript>',
          'a<p></p>',
          'a',
        ]);
      }
    );
    QUnit.test(
      'Test against data URIs in anchors without proper config flag',
      function (assert) {
        var clean = DOMPurify.sanitize(
          '<a href="data:image/gif;base64,123">icon.gif</a>'
        );
        assert.equal(clean, '<a>icon.gif</a>');
      }
    );
    QUnit.test(
      'Test against data URIs in anchors using proper config flag',
      function (assert) {
        var clean = DOMPurify.sanitize(
          '<a href="data:image/gif;base64,123">icon.gif</a>',
          {
            ADD_DATA_URI_TAGS: ['a', 'b'],
          }
        );
        assert.equal(clean, '<a href="data:image/gif;base64,123">icon.gif</a>');
      }
    );
    QUnit.test(
      'Test against Unicode tag names and proper removal',
      function (assert) {
        var clean = DOMPurify.sanitize('<svg><blocKquote>foo</blocKquote>');
        assert.contains(clean, [
          '<svg></svg>',
          '<svg xmlns="http://www.w3.org/2000/svg" />',
        ]);

        var clean = DOMPurify.sanitize('<svg><blocKquote>foo</blocKquote>');
        assert.contains(clean, [
          '<svg></svg><blockquote>foo</blockquote>',
          '<svg><blockquote>foo</blockquote></svg>',
          '<svg xmlns="http://www.w3.org/2000/svg" /><blockquote>foo</blockquote>',
        ]);
      }
    );
    QUnit.test('Test if namespaces are properly enforced', function (assert) {
      var tests = [
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
      tests.forEach(function (test) {
        var clean = DOMPurify.sanitize(test.test);
        assert.contains(clean, test.expected);
      });
    });
    QUnit.test('Config-Flag tests: NAMESPACE', function (assert) {
      var tests = [
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
      tests.forEach(function (test) {
        var clean = DOMPurify.sanitize(test.test, test.config);
        assert.contains(clean, test.expected);
      });
    });
    QUnit.test('Config-Flag tests: ALLOWED_NAMESPACES', function (assert) {
      const tests = [
        // Test when ALLOWED_NAMESPACES is not set, result is empty for XML with custom namespace
        {
          test: '<library xmlns="http://www.ibm.com/library"><name>Library 1</name></library>',
          config: {
            ALLOWED_TAGS: ['#text', 'library', 'name'],
            KEEP_CONTENT: false,
            PARSER_MEDIA_TYPE: 'application/xhtml+xml',
          },
          expected: '',
        },
        // Test with one custom namespace at the root (ie. all sub-nodes will inherit that namespace)
        {
          test: '<library xmlns="http://www.ibm.com/library"><name>Library 1</name><dirty onload="alert()" /></library>',
          config: {
            ALLOWED_NAMESPACES: ['http://www.ibm.com/library'],
            ALLOWED_TAGS: ['#text', 'library', 'name'],
            KEEP_CONTENT: false,
            PARSER_MEDIA_TYPE: 'application/xhtml+xml',
          },
          expected:
            '<library xmlns="http://www.ibm.com/library"><name>Library 1</name></library>',
        },
        // Test with one custom namespace at sub-node (root will default to HTML_NAMESPACE and should be kept)
        {
          test: '<city><library xmlns="http://www.ibm.com/library"><name>Library 1</name><dirty onload="alert()" /></library></city>',
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
        // Test removal of namespaces not listed in ALLOWED_NAMESPACES when input has multiple namespaces
        {
          test: '<library xmlns="http://www.ibm.com/library" xmlns:bk="urn:loc.gov:books"><bk:name>Library 1</bk:name><dirty onload="alert()" /></library>',
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
        // Test with multiple custom namespaces and prefixes in input
        {
          test: '<library xmlns="http://www.ibm.com/library" xmlns:bk="urn:loc.gov:books" xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata"><bk:name>Library 1<m:properties>Other Properties</m:properties></bk:name><dirty onload="alert()" /></library>',
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
            '<library xmlns="http://www.ibm.com/library"><bk:name xmlns:bk="urn:loc.gov:books">Library 1<m:properties xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata">Other Properties</m:properties></bk:name></library>',
        },
        // Test removal of elements mentioned in FORBID_TAGS even if their namespaces are allow-listed
        {
          test: '<library xmlns="http://www.ibm.com/library" xmlns:bk="urn:loc.gov:books" xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata"><bk:name>Library 1<m:properties>Other Properties</m:properties></bk:name><dirty onload="alert()" /></library>',
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
            '<library xmlns="http://www.ibm.com/library"><bk:name xmlns:bk="urn:loc.gov:books">Library 1</bk:name></library>',
        },
      ];
      tests.forEach(function (test) {
        assert.contains(
          DOMPurify.sanitize(test.test, test.config),
          test.expected
        );
      });
    });
    QUnit.test(
      'Config-Flag tests: NAMESPACE should ignore inherited top-level config',
      function (assert) {
        var proto = {};
        Object.defineProperty(proto, 'NAMESPACE', {
          get: function () {
            throw new Error('must not read inherited NAMESPACE');
          },
        });
        var config = Object.create(proto);

        assert.equal(
          DOMPurify.sanitize('<polyline points="0 0"></polyline>', config),
          ''
        );
      }
    );

    QUnit.test(
      'Config-Flag tests: NAMESPACE should ignore non-string values',
      function (assert) {
        var hostileNamespace = {
          toString: function () {
            throw new Error('must not stringify NAMESPACE');
          },
        };

        assert.equal(
          DOMPurify.sanitize('<polyline points="0 0"></polyline>', {
            NAMESPACE: hostileNamespace,
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
      }
    );

    QUnit.test(
      'Config-Flag tests: NAMESPACE should not leak into subsequent default calls',
      function (assert) {
        DOMPurify.sanitize('<polyline points="0 0"></polyline>', {
          NAMESPACE: 'http://www.w3.org/2000/svg',
        });

        assert.equal(
          DOMPurify.sanitize('<polyline points="0 0"></polyline>'),
          ''
        );
      }
    );

    QUnit.test(
      'Config-Flag tests: inherited integration-point config should be ignored',
      function (assert) {
        var htmlProto = {};
        Object.defineProperty(htmlProto, 'HTML_INTEGRATION_POINTS', {
          get: function () {
            throw new Error('must not read inherited HTML_INTEGRATION_POINTS');
          },
        });

        var mathProto = Object.create(htmlProto);
        Object.defineProperty(mathProto, 'MATHML_TEXT_INTEGRATION_POINTS', {
          get: function () {
            throw new Error(
              'must not read inherited MATHML_TEXT_INTEGRATION_POINTS'
            );
          },
        });

        var config = Object.create(mathProto);

        assert.equal(DOMPurify.sanitize('HELLO', config), 'HELLO');
      }
    );
    QUnit.test('Config-Flag tests: PARSER_MEDIA_TYPE', function (assert) {
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
          config: {
            WHOLE_DOCUMENT: true,
          },
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
      tests.forEach(function (test) {
        Object.keys(test.expected).forEach(function (type) {
          var config = test.config || {};
          config.PARSER_MEDIA_TYPE = type;
          var clean = DOMPurify.sanitize(test.test, config);
          assert.contains(clean, test.expected[type]);
        });
      });
    });

    QUnit.test(
      'Config-Flag tests: PARSER_MEDIA_TYPE + ALLOWED_TAGS/ALLOWED_ATTR',
      function (assert) {
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
            '<a xmlns="http://www.w3.org/1999/xhtml" href="#">abc</a><CustomTag xmlns="http://www.w3.org/1999/xhtml" CustomAttr="foo" customattr="foo"></CustomTag>',
          ]
        );
      }
    );

    QUnit.test('Test invalid xml', function (assert) {
      var tests = [
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
        {
          test: '',
          config: {},
          expected: [''],
        },
        {
          test: '<!-->',
          config: { NAMESPACE: 'http://www.w3.org/1999/xhtml' },
          expected: ['', '<!-->'],
        },
        {
          test: '<!-->',
          config: {},
          expected: ['', '<!-->'],
        },
      ];
      tests.forEach(function (test) {
        var clean = DOMPurify.sanitize(test.test, test.config);
        assert.contains(clean, test.expected);
      });
    });

    QUnit.test(
      'Test namespace default to html after other namespace been used',
      function (assert) {
        var tests = [
          {
            test: '<br>',
            config: { NAMESPACE: 'http://www.w3.org/2000/svg' },
            expected: ['', '<br>'],
          },
          {
            test: '<br>',
            config: {},
            expected: ['<br>'],
          },
        ];
        tests.forEach(function (test) {
          var clean = DOMPurify.sanitize(test.test, test.config);
          assert.contains(clean, test.expected);
        });
      }
    );

    QUnit.test('Test non-html input after empty input', function (assert) {
      var tests = [
        {
          test: '',
          config: { NAMESPACE: 'http://www.w3.org/2000/svg' },
          expected: [''],
        },
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
      ];
      tests.forEach(function (test) {
        var clean = DOMPurify.sanitize(test.test, test.config);
        assert.contains(clean, test.expected);
      });
    });

    QUnit.test('removeHook returns hook function', function (assert) {
      const entryPoint = 'afterSanitizeAttributes';
      const dirty = '<div class="hello"></div>';
      const expected = '<div class="world"></div>';

      DOMPurify.addHook(entryPoint, function (node) {
        return node.setAttribute('class', 'world');
      });
      assert.equal(DOMPurify.sanitize(dirty), expected);

      // remove hook and keep it
      const hookFunction = DOMPurify.removeHook(entryPoint);
      assert.equal(DOMPurify.sanitize(dirty), dirty);

      // set the same hook
      DOMPurify.addHook(entryPoint, hookFunction);
      assert.equal(DOMPurify.sanitize(dirty), expected);

      // cleanup hook
      DOMPurify.removeHook(entryPoint);
    });

    QUnit.test(
      'removeHook allows specifying the hook to remove',
      function (assert) {
        const entryPoint = 'afterSanitizeAttributes';
        const dirty = '<div class="original"></div>';
        const expected = '<div class="original first third"></div>';

        const firstHook = function (node) {
          node.classList.add('first');
        };
        const secondHook = function (node) {
          node.classList.add('second');
        };
        const thirdHook = function (node) {
          node.classList.add('third');
        };

        DOMPurify.addHook(entryPoint, firstHook);
        DOMPurify.addHook(entryPoint, secondHook);
        DOMPurify.addHook(entryPoint, thirdHook);

        // removes the specified hook
        assert.strictEqual(
          DOMPurify.removeHook(entryPoint, secondHook),
          secondHook
        );

        // can’t remove it again
        assert.strictEqual(
          DOMPurify.removeHook(entryPoint, secondHook),
          undefined
        );

        // removed hook isn’t used during sanitize
        assert.strictEqual(DOMPurify.sanitize(dirty), expected);

        // cleanup hooks
        DOMPurify.removeHook(entryPoint, firstHook);
        DOMPurify.removeHook(entryPoint, thirdHook);
      }
    );

    QUnit.test(
      'Test proper removal of annotation-xml w. custom elements',
      function (assert) {
        const dirty =
          "<svg><annotation-xml><foreignobject><style><!--</style><p id=\"--><img src='x' onerror='alert(1)'>\">";
        const config = {
          CUSTOM_ELEMENT_HANDLING: { tagNameCheck: /.*/ },
          FORBID_CONTENTS: [''],
        };
        const expected = '<svg></svg>';
        let clean = DOMPurify.sanitize(dirty, config);
        assert.contains(clean, expected);
      }
    );

    QUnit.test(
      'Test proper handling of attributes with RETURN_DOM',
      function (assert) {
        const dirty = '<body onload="alert(1)">&lt;a<!-- <f --></body>';
        const config = {
          RETURN_DOM: true,
        };
        const expected = '<body>&lt;a</body>';
        let clean = DOMPurify.sanitize(dirty, config);

        let iframe = document.createElement('iframe');
        iframe.srcdoc = `<html><head></head>${clean.outerHTML}</html>`;
        document.body.appendChild(iframe); // alert test
        assert.contains(clean.outerHTML, expected);
      }
    );

    QUnit.test(
      'Test proper handling of data-attribiutes in XML modes',
      function (assert) {
        const dirty =
          '<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg"><a xmlns:data-slonser="http://www.w3.org/1999/xlink" data-slonser:href="javascript:alert(1)"><text  x="20" y="35">Click me!</text></a></svg>';
        const config = {
          PARSER_MEDIA_TYPE: 'application/xhtml+xml',
        };
        const expected = [
          '<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"800\" height=\"600\"><a><text x=\"20\" y=\"35\">Click me!</text></a></svg>',
          '<svg width=\"800\" height=\"600\" xmlns=\"http://www.w3.org/2000/svg\"><a><text x=\"20\" y=\"35\">Click me!</text></a></svg>',
        ];
        let clean = DOMPurify.sanitize(dirty, config);
        assert.contains(clean, expected);
      }
    );

    QUnit.test(
      'Expect the same results when using ALLOWED_URI_REGEXP with the g flag',
      function (assert) {
        const dirty =
          '<img src="blob:http://localhost:5173/84c49be9-3352-4407-b066-7b5b4d46c52a"><a epub:type="noteref" href="epub:EPUB/xhtml/#footnote"></a><img src="blob:http://localhost:5173/84c49be9-3352-4407" >';
        const config = {
          ALLOWED_URI_REGEXP: /^(blob|https|epub|filepos|kindle)/gi,
        };
        const expected =
          '<img src=\"blob:http://localhost:5173/84c49be9-3352-4407-b066-7b5b4d46c52a\"><a href=\"epub:EPUB/xhtml/#footnote\"></a><img src=\"blob:http://localhost:5173/84c49be9-3352-4407\">';
        let clean = DOMPurify.sanitize(dirty, config);
        assert.strictEqual(clean, expected);
      }
    );

    QUnit.test(
      'Config-Param tests: CUSTOM_ELEMENT_HANDLING rejects all spec-reserved names',
      function (assert) {
        var permissive = {
          CUSTOM_ELEMENT_HANDLING: {
            tagNameCheck: /.+/,
            attributeNameCheck: /.+/,
            allowCustomizedBuiltInElements: true,
          },
        };
        var reservedNames = [
          'annotation-xml',
          'color-profile',
          'font-face',
          'font-face-src',
          'font-face-uri',
          'font-face-format',
          'font-face-name',
          'missing-glyph',
        ];
        reservedNames.forEach(function (name) {
          var dirty = '<' + name + ' onclick="alert(1)">x</' + name + '>';
          var clean = DOMPurify.sanitize(dirty, permissive);
          assert.notOk(
            /\son[a-z]+\s*=/i.test(clean),
            'no on-handler on <' + name + '>: ' + clean
          );
        });
      }
    );

    QUnit.test(
      'Config-Param tests: CUSTOM_ELEMENT_HANDLING reserved-name check is case-insensitive (HTML)',
      function (assert) {
        // Uppercase HTML input gets lowercased by the parser; the reserved-name
        // check must still apply after that lowercasing.
        var permissive = {
          CUSTOM_ELEMENT_HANDLING: {
            tagNameCheck: /.+/,
            attributeNameCheck: /.+/,
          },
        };
        var clean = DOMPurify.sanitize(
          '<FONT-FACE onclick="alert(1)">x</FONT-FACE>',
          permissive
        );
        assert.notOk(
          /\son[a-z]+\s*=/i.test(clean),
          'no on-handler on <FONT-FACE>: ' + clean
        );
      }
    );

    QUnit.test(
      'Config-Param tests: CUSTOM_ELEMENT_HANDLING reserved-name check is case-insensitive (XHTML)',
      function (assert) {
        // In application/xhtml+xml mode, tag names keep their case. The
        // reserved-name check must compare case-insensitively so <Annotation-XML>
        // etc. don't slip past the basic-custom-element exclusion.
        var cfg = {
          PARSER_MEDIA_TYPE: 'application/xhtml+xml',
          CUSTOM_ELEMENT_HANDLING: {
            tagNameCheck: /.+/,
            attributeNameCheck: /.+/,
          },
        };
        var mixedCaseNames = [
          'Annotation-XML',
          'Color-Profile',
          'Font-Face',
          'Font-Face-Src',
          'Missing-Glyph',
        ];
        mixedCaseNames.forEach(function (name) {
          var dirty =
            '<root xmlns="http://www.w3.org/1999/xhtml"><' +
            name +
            ' onclick="alert(1)">x</' +
            name +
            '></root>';
          var clean = DOMPurify.sanitize(dirty, cfg);
          assert.notOk(
            /\son[a-z]+\s*=/i.test(clean),
            'no on-handler on <' + name + '> in XHTML mode: ' + clean
          );
        });
      }
    );

    QUnit.test(
      'Config-Flag tests: SANITIZE_NAMED_PROPS is idempotent',
      function (assert) {
        var cfg = { SANITIZE_NAMED_PROPS: true };
        var inputs = [
          '<div id="foo">hi</div>',
          '<a name="bar">hi</a>',
          '<div id="user-content-foo">hi</div>',
          '<a name="user-content-bar">hi</a>',
          '<div id="">hi</div>',
          '<form id="x"><input id="y"></form>',
        ];
        inputs.forEach(function (input) {
          var once = DOMPurify.sanitize(input, cfg);
          var twice = DOMPurify.sanitize(once, cfg);
          assert.equal(
            twice,
            once,
            'idempotent for input: ' + input + ' (once=' + once + ')'
          );
        });
      }
    );

    QUnit.test(
      'Config-Flag tests: SANITIZE_NAMED_PROPS does not double-prefix',
      function (assert) {
        var cfg = { SANITIZE_NAMED_PROPS: true };
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
      }
    );

    QUnit.test(
      'Config-Flag tests: IN_PLACE handles DOM-clobbered nodeName safely',
      function (assert) {
        // <input name=nodeName> in a form clobbers form.nodeName in most
        // browsers. The IN_PLACE path must handle this without producing a
        // sanitized output that still contains attacker-controlled handlers.
        var dirty = document.createElement('form');
        dirty.innerHTML =
          '<input name="nodeName" onclick="alert(1)">' +
          '<input name="attributes" onclick="alert(2)">';
        try {
          DOMPurify.sanitize(dirty, { IN_PLACE: true });
        } catch (e) {
          // Either throwing OR scrubbing is acceptable; only script execution
          // would be unacceptable.
        }
        assert.notOk(
          /\son[a-z]+\s*=/i.test(dirty.innerHTML),
          'no on-handler survived: ' + dirty.innerHTML
        );
      }
    );

    QUnit.test(
      'Config-Flag tests: SAFE_FOR_TEMPLATES greedy-scrub of stray close marker',
      function (assert) {
        var cfg = { SAFE_FOR_TEMPLATES: true };
        // After scrubbing {{}}, a lazy regex would leave }} behind, which
        // defeats IS_ALLOWED_URI because its [^a-z] alternation accepts any
        // non-letter leading character. The greedy regex instead scrubs the
        // entire value from {{ to end-of-string, leaving no usable URL.
        assert.equal(
          DOMPurify.sanitize('<a href="{{}}javascript:alert(1)">x</a>', cfg),
          '<a>x</a>',
          'href scrubbed entirely, no stray }} left to pass the URL check'
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

    QUnit.test(
      'ensure attributes added in afterSanitizeAttributes hook are not revalidated',
      function (assert) {
        DOMPurify.addHook('afterSanitizeAttributes', function (node) {
          if (node.nodeName === 'A') {
            node.setAttribute('data-injected-by-hook', 'yes');
          }
        });
        try {
          assert.equal(
            DOMPurify.sanitize('<a href="#">x</a>'),
            '<a href="#" data-injected-by-hook="yes">x</a>',
            'hook-added attribute present in output (documented behavior)'
          );
        } finally {
          DOMPurify.removeHooks('afterSanitizeAttributes');
        }
      }
    );

    QUnit.test(
      'ensure attributes added in uponSanitizeAttribute after current index are not revalidated',
      function (assert) {
        // Attributes are walked backwards using a snapshot of the length. A
        // hook that calls setAttribute() appends to the end of the list, past
        // the decreasing index, so the new attribute slips past validation.
        // This is intentional: hooks are the escape hatch for users who need
        // to force attribute values. Validation would defeat that use case.
        DOMPurify.addHook('uponSanitizeAttribute', function (node, hookEvent) {
          if (hookEvent.attrName === 'href') {
            try {
              node.setAttribute('data-injected-by-hook', 'yes');
            } catch (e) {}
          }
        });
        try {
          assert.equal(
            DOMPurify.sanitize('<a href="#">x</a>'),
            '<a href="#" data-injected-by-hook="yes">x</a>',
            'hook-added attribute present in output (documented behavior)'
          );
        } finally {
          DOMPurify.removeHooks('uponSanitizeAttribute');
        }
      }
    );

    QUnit.module('Finding #1: _forceRemove DoS (Dompurify_exceptions.md)');

    /* Eight payloads from Dompurify_exceptions.md. Each claim is that
     * sanitize() throws — a real exception escaping the call site, which
     * a caller would see as a DoS. If any of these throws, finding #1
     * reproduces and needs a patch (wrap the final remove() call at
     * purify.ts:932 in a second try/catch, or use remove() as the primary
     * path instead of parent.removeChild).
     *
     * Implementation note: we compare against a sentinel object so we
     * distinguish "threw" from "returned undefined/empty string". */
    const DOS_PAYLOADS = [
      {
        title:
          'HTML: form with clobbered firstElementChild + innerHTML + textContent',
        payload:
          '<form><input name=firstElementChild><input name=innerHTML><input name=textContent></form>',
        config: {},
      },
      {
        title: 'HTML: form with clobbered attributes (single input)',
        payload: '<form><input name=attributes></form>',
        config: {},
      },
      {
        title: 'HTML: form with clobbered attributes (two inputs)',
        payload: '<form><input name=attributes><input name=attributes></form>',
        config: {},
      },
      {
        title: 'HTML: form onclick + clobbered attributes (two inputs)',
        payload:
          '<form onclick=alert(1)><input name=attributes><input name=attributes></form>',
        config: {},
      },
      {
        title: 'XHTML: form with CDATA (mXSS regexes both match)',
        payload: '<form id="f"><![CDATA[<img src=x onerror=alert(1)>]]></form>',
        config: { PARSER_MEDIA_TYPE: 'application/xhtml+xml' },
      },
      {
        title:
          'XHTML: form with text + PI (textContent + innerHTML regexes match)',
        payload: '<form id="f">&lt;a<?x <img src=x onerror=alert(1)?></form>',
        config: { PARSER_MEDIA_TYPE: 'application/xhtml+xml' },
      },
      {
        title: 'XHTML: form with text + CDATA',
        payload:
          '<form id="f">&lt;a<![CDATA[<img src=x onerror=alert(1)>]]></form>',
        config: { PARSER_MEDIA_TYPE: 'application/xhtml+xml' },
      },
      {
        title: 'XHTML: form with PI + CDATA',
        payload:
          '<form id="f"><?a <x?><![CDATA[<img onerror=alert(1)>]]></form>',
        config: { PARSER_MEDIA_TYPE: 'application/xhtml+xml' },
      },
    ];

    DOS_PAYLOADS.forEach((tc) => {
      QUnit.test(`#1 DoS: ${tc.title}`, (assert) => {
        let threw = false;
        let errorMsg = '';
        let result;
        try {
          result = DOMPurify.sanitize(tc.payload, tc.config);
        } catch (e) {
          threw = true;
          errorMsg = (e && (e.stack || e.message)) || String(e);
        }
        assert.notOk(
          threw,
          threw
            ? `REPRODUCES — sanitize() threw:\n  ${errorMsg}`
            : `safe — sanitize() returned: ${JSON.stringify(result)}`
        );
      });
    });

    QUnit.module('Finding #1 bonus: sanitize-for is robust under clobbering');

    /* Even if sanitize() returns safely, confirm the clobbering payload
     * doesn't leave dangerous residue. These assertions are advisory;
     * the DoS test above is the primary signal. */
    QUnit.test(
      '#1: HTML form-clobber output contains no event handler',
      (assert) => {
        const out = DOMPurify.sanitize(
          '<form onclick=alert(1)><input name=attributes><input name=attributes></form>'
        );
        assert.notOk(/onclick/i.test(out), `output retains onclick: ${out}`);
      }
    );

    QUnit.module(
      'Finding #2: attribute-breakout regex coverage (listing/plaintext)'
    );

    function attrValueAfterSanitize(input, attrName) {
      const clean = DOMPurify.sanitize(input);
      const probe = document.createElement('div');
      probe.innerHTML = clean;
      const el = probe.querySelector('[' + attrName + ']');
      return el ? el.getAttribute(attrName) : null;
    }

    QUnit.test(
      '#2 control: </style> IS stripped (regex works for listed tags)',
      (assert) => {
        const value = attrValueAfterSanitize(
          '<a title="x</style>y">z</a>',
          'title'
        );
        assert.notOk(
          value && /<\/style>/i.test(value),
          value
            ? `control failed: title retained </style>: "${value}"`
            : 'control passed: </style> stripped'
        );
      }
    );

    QUnit.module('Finding #3: _isClobbered coverage (informational)');

    /* Hardening: extend _isClobbered to cover firstElementChild, innerHTML,
     * nodeType, tagName. No direct observable bug; the values feed the
     * mXSS check at line 1138–1146, currently contained by defense in
     * depth. Nothing to test beyond #1's DoS suite — those payloads cover
     * whether clobbering these properties produces an observable crash. */
    QUnit.test('#3: informational — covered by #1 DoS suite', (assert) => {
      assert.ok(true, 'no additional test — see Finding #1 DoS results above');
    });

    QUnit.module('Finding #4: external form= association');

    /* Claim: <form id=f></form><input form=f name=X> clobbers from outside
     * the form's subtree. _isClobbered still catches the form itself (it
     * checks property types, not child presence), but the clobbering
     * input survives as a sibling.
     *
     * Test: after sanitize, does the clobbering NAME survive? SANITIZE_DOM
     * should strip it (default is true). If it survives, the primitive is
     * open. If stripped, only the form= attribute itself is left — which
     * is the hardening recommendation #4a. */
    QUnit.test(
      '#4: HTML — name="firstElementChild" on stray input is stripped',
      (assert) => {
        const out = DOMPurify.sanitize(
          '<form id="f"></form><input form="f" name="firstElementChild">'
        );
        const nameSurvived = /name\s*=\s*["']?firstElementChild/i.test(out);
        assert.notOk(
          nameSurvived,
          nameSurvived
            ? `REPRODUCES — name="firstElementChild" survived SANITIZE_DOM. Output: ${out}`
            : `safe — SANITIZE_DOM stripped the clobbering name. Output: ${out}`
        );
      }
    );

    QUnit.test(
      '#4: XHTML — name="firstElementChild" on stray input is stripped',
      (assert) => {
        const out = DOMPurify.sanitize(
          '<form id="f"><![CDATA[<x>]]></form><input form="f" name="firstElementChild"/>',
          { PARSER_MEDIA_TYPE: 'application/xhtml+xml' }
        );
        const nameSurvived = /name\s*=\s*["']?firstElementChild/i.test(out);
        assert.notOk(
          nameSurvived,
          nameSurvived
            ? `REPRODUCES — name="firstElementChild" survived in XHTML. Output: ${out}`
            : `safe — name stripped in XHTML. Output: ${out}`
        );
      }
    );

    QUnit.test(
      '#4 informational: form= attribute presence in output',
      (assert) => {
        const out = DOMPurify.sanitize(
          '<form id="f"></form><input form="f" name="firstElementChild">'
        );
        const formAttrSurvived = /\sform\s*=/i.test(out);
        // This is purely informational. #4a recommends stripping form=
        // attributes unconditionally via _isValidAttribute. This assertion
        // passes either way — it just records which state the code is in.
        assert.ok(
          true,
          `INFO — form= attribute ${formAttrSurvived ? 'survived' : 'was stripped'}. Output: ${out}`
        );
      }
    );

    QUnit.module(
      'Bypass claim: style + XHTML + RETURN_DOM_FRAGMENT round-trip'
    );

    /* User-provided snippet:
     *
     *   const clean = DOMPurify.sanitize(
     *     '<style>&lt;/style&gt;&lt;img src=x onerror=alert(1)&gt;<a></a></style>',
     *     { PARSER_MEDIA_TYPE: 'application/xhtml+xml', RETURN_DOM_FRAGMENT: true }
     *   );
     */

    QUnit.test(
      'bypass: reparsed fragment contains no <img onerror> after round-trip',
      (assert) => {
        const payload =
          '<style>&lt;/style&gt;&lt;img src=x onerror=alert(1)&gt;<a></a></style>';

        let clean;
        try {
          clean = DOMPurify.sanitize(payload, {
            PARSER_MEDIA_TYPE: 'application/xhtml+xml',
            RETURN_DOM_FRAGMENT: true,
          });
        } catch (e) {
          assert.ok(false, `sanitize() threw: ${e && e.message}`);
          return;
        }

        const div = document.createElement('div');
        div.appendChild(clean);
        const roundTripped = div.innerHTML;

        // Reparse the serialized HTML in a detached div to see what a
        // downstream consumer assigning it via innerHTML would get.
        const probe = document.createElement('div');
        probe.innerHTML = roundTripped;

        const imgs = probe.querySelectorAll('img');
        const dangerous = Array.prototype.some.call(imgs, (img) =>
          img.hasAttribute('onerror')
        );

        assert.notOk(
          dangerous,
          dangerous
            ? `REPRODUCES — reparsed DOM has <img onerror>. Round-trip HTML: ${roundTripped}`
            : `safe — round-trip HTML: ${roundTripped}`
        );
      }
    );

    QUnit.test(
      'bypass: string sanitize (no FRAGMENT) of the same payload is safe',
      (assert) => {
        const payload =
          '<style>&lt;/style&gt;&lt;img src=x onerror=alert(1)&gt;<a></a></style>';
        const out = DOMPurify.sanitize(payload, {
          PARSER_MEDIA_TYPE: 'application/xhtml+xml',
        });
        // We should see no <img> and no onerror in the output. The <style>
        // element should be stripped entirely by the #1150-1158 check.
        assert.notOk(
          /<img/i.test(out) || /onerror/i.test(out),
          `string sanitize output: ${out}`
        );
      }
    );

    QUnit.test(
      'bypass: XSS native — alert() must not fire after round-trip',
      (assert) => {
        const done = assert.async();
        const payload =
          '<style>&lt;/style&gt;&lt;img src=x onerror=alert(1)&gt;<a></a></style>';

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
        div.appendChild(clean);

        // Scoped container — don't taint document.body if XSS were to fire.
        const container = document.getElementById('qunit-fixture');
        container.innerHTML = div.innerHTML;

        setTimeout(() => {
          assert.notEqual(
            window.xssed,
            true,
            'alert() fired via XHTML-style round-trip (bypass reproduces)'
          );
          container.innerHTML = '';
          window.xssed = false;
          done();
        }, 100);
      }
    );
    QUnit.test(
      'IN_PLACE sanitizes cross-realm DOM nodes (GHSA-4w3q-35jp-p934)',
      (assert) => {
        const iframe = document.createElement('iframe');
        document.body.appendChild(iframe);
        const foreignDoc = iframe.contentDocument;

        const dirty = foreignDoc.createElement('div');
        dirty.innerHTML =
          '<img src=x onerror=alert(1)><script>alert(2)<\/script>';

        const result = DOMPurify.sanitize(dirty, { IN_PLACE: true });

        assert.strictEqual(
          result,
          dirty,
          'returns the same node, not a string'
        );
        assert.notOk(dirty.querySelector('script'), 'script removed');
        assert.notOk(
          dirty.querySelector('img').getAttribute('onerror'),
          'onerror removed'
        );

        document.body.removeChild(iframe);
      }
    );

    QUnit.test(
      'string-input path still strings-stringifies non-node objects',
      (assert) => {
        assert.strictEqual(
          DOMPurify.sanitize({
            toString: () => '<b>hi</b><script>x<\/script>',
          }),
          '<b>hi</b>'
        );
      }
    );

    QUnit.test(
      'plain objects with nodeType are not treated as nodes',
      (assert) => {
        // Regression guard: duck-typing must not accept spoofed objects.
        const fake = { nodeType: 1, nodeName: 'DIV', ownerDocument: {} };
        // Should be stringified, not iterated. No throw, returns sanitized string.
        const result = DOMPurify.sanitize(fake);
        assert.strictEqual(typeof result, 'string');
      }
    );

    QUnit.test(
      'cross-realm DOM input across config variants (GHSA-4w3q-35jp-p934 follow-up)',
      (assert) => {
        // Set up a cross-realm node identical to the PoC: an HTMLDivElement
        // owned by an iframe document, containing a known XSS payload.
        const iframe = document.createElement('iframe');
        document.body.appendChild(iframe);
        const foreignDoc = iframe.contentDocument;

        const PAYLOAD =
          '<p>hi <b>x</b></p>' +
          '<img src=x onerror=alert(1)>' +
          '<script>alert(2)<\/script>';

        const mk = () => {
          const n = foreignDoc.createElement('div');
          n.innerHTML = PAYLOAD;
          return n;
        };

        // Helper: serialize whatever sanitize returns into a string we can grep.
        const ser = (r) => {
          if (r === undefined || r === null) return String(r);
          if (typeof r === 'string') return r;
          if (r.outerHTML !== undefined) return r.outerHTML;
          if (r.nodeType === 11) {
            // DocumentFragment
            const w = document.createElement('div');
            w.appendChild(r.cloneNode(true));
            return w.innerHTML;
          }
          return String(r);
        };

        // The universal invariant across every config variant: no executable
        // payload may appear in the returned value. This is the actual security
        // property; useful-output is a separate (looser) concern.
        const assertNoExecutable = (label, returned) => {
          const s = ser(returned);
          assert.notOk(/<script/i.test(s), label + ': no <script> in return');
          assert.notOk(/onerror=/i.test(s), label + ': no onerror= in return');
        };

        // ── c1: sanitize(node, {}) ────────────────────────────────────────────
        // Current behavior with the _isNode patch alone: throws TypeError because
        // `dirty instanceof Node` is still realm-bound, the cross-realm node
        // falls through to the string branch, and `dirty.indexOf` is undefined.
        // If the dispatch is broadened (`else if (_isNode(dirty))`), this should
        // return a sanitized string instead. Either outcome is acceptable from a
        // security standpoint; both are tested.
        {
          const n = mk();
          let returned, threw;
          try {
            returned = DOMPurify.sanitize(n, {});
          } catch (e) {
            threw = e;
          }

          if (threw) {
            assert.ok(
              threw instanceof TypeError,
              'c1: throwing is acceptable (loud failure, no bypass)'
            );
          } else {
            assertNoExecutable('c1', returned);
            assert.notOk(
              /\[object /.test(ser(returned)),
              'c1: should not return a stringified-node placeholder (would mean ' +
                'dispatch still goes through the string branch)'
            );
          }
        }

        // ── c2: sanitize(node, { IN_PLACE: true }) ────────────────────────────
        // This is the original GHSA-4w3q-35jp-p934 case. The node must be
        // mutated in place and returned.
        {
          const n = mk();
          const returned = DOMPurify.sanitize(n, { IN_PLACE: true });

          assert.strictEqual(
            returned,
            n,
            'c2: returns the same node, not a string'
          );
          assert.notOk(
            n.querySelector('script'),
            'c2: <script> removed in place'
          );
          const img = n.querySelector('img');
          assert.ok(img, 'c2: <img> retained');
          assert.notOk(
            img.hasAttribute('onerror'),
            'c2: onerror stripped in place'
          );
          assertNoExecutable('c2', n);
        }

        // ── c3: sanitize(node, { RETURN_DOM: true }) ─────────────────────────
        // The return value must be safe regardless of whether the cross-realm
        // node was actually sanitized or just stringified to a placeholder.
        {
          const n = mk();
          const returned = DOMPurify.sanitize(n, { RETURN_DOM: true });
          assertNoExecutable('c3', returned);
          // Original node is non-IN_PLACE and must not have been mutated.
          assert.ok(
            /onerror=/i.test(n.outerHTML),
            'c3: original cross-realm node is left untouched (non-IN_PLACE contract)'
          );
        }

        // ── c4: sanitize(node, { RETURN_DOM_FRAGMENT: true }) ────────────────
        {
          const n = mk();
          const returned = DOMPurify.sanitize(n, { RETURN_DOM_FRAGMENT: true });
          assertNoExecutable('c4', returned);
          assert.ok(
            /onerror=/i.test(n.outerHTML),
            'c4: original cross-realm node is left untouched (non-IN_PLACE contract)'
          );
        }

        document.body.removeChild(iframe);
      }
    );
  };
});
