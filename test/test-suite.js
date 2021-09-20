module.exports = function (DOMPurify, window, tests, xssTests) {
  var document = window.document;
  var jQuery = window.jQuery;

  QUnit.cases(tests).test('Sanitization test', function (params, assert) {
    assert.contains(
      DOMPurify.sanitize(params.payload),
      params.expected,
      'Payload: ' + params.payload
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
         ALLOW_DATA_ATTR: true, FORBID_ATTR: ['data-evil'], 
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
  QUnit.test('Config-Flag tests: SAFE_FOR_JQUERY (now inactive, secure by default)', function (assert) {
    assert.equal(
      DOMPurify.sanitize('<a>123</a><option><style><img src=x onerror=alert(1)>'),
      "<a>123</a><option></option>"
    );
    assert.equal(
      DOMPurify.sanitize('<a>123</a><option><style><img src=x onerror=alert(1)>'),
      "<a>123</a><option></option>"
    );
    assert.equal(
      DOMPurify.sanitize(
        '<option><style></option></select><b><img src=xx: onerror=alert(1)></style></option>'
      ),
      "<option></option>"
    );
    assert.equal(
      DOMPurify.sanitize(
        '<option><iframe></select><b><script>alert(1)</script>'),
      '<option></option>'
    );
    assert.equal(
      DOMPurify.sanitize(
        '<option><iframe></select><b><script>alert(1)</script>'),
      '<option></option>'
    );
    assert.equal(
      DOMPurify.sanitize('<b><style><style/><img src=xx: onerror=alert(1)>'),
      '<b></b>'
    );
    assert.equal(
      DOMPurify.sanitize('<b><style><style/><img src=xx: onerror=alert(1)>'),
      '<b></b>'
    );
    assert.contains(
      DOMPurify.sanitize('1<template><s>000</s></template>2'),
      ['1<template><s>000</s></template>2', '1<template></template>2', '12']
    );
    assert.contains(
      DOMPurify.sanitize('<template><s>000</s></template>'),
      ['', '<template><s>000</s></template>']
    );
    // see https://github.com/cure53/DOMPurify/issues/283
    assert.equal(
      DOMPurify.sanitize('<i>&amp;amp; &lt;</i>'),
      '<i>&amp;amp; &lt;</i>'
    );
  });
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
      ['<b>he  ya</b>', '<b>he </b>', '<b>he <form><img src="x"></form> ya</b>']
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
      '<img name="getElementById" src="x">'
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
  QUnit.test('Config-Flag tests: RETURN_DOM_IMPORT', function (assert) {
    //RETURN_DOM_IMPORT
    assert.equal(
      DOMPurify.sanitize('123', { RETURN_DOM: true }).ownerDocument,
      document
    );
    assert.notEqual(
      DOMPurify.sanitize('123', { RETURN_DOM: true, RETURN_DOM_IMPORT: false })
        .ownerDocument,
      document
    );
    assert.equal(
      DOMPurify.sanitize('123', { RETURN_DOM: true, RETURN_DOM_IMPORT: true })
        .ownerDocument,
      document
    );
    assert.equal(
      DOMPurify.sanitize('123', { RETURN_DOM_FRAGMENT: true }).ownerDocument,
      document
    );
    assert.notEqual(
      DOMPurify.sanitize('123', {
        RETURN_DOM_FRAGMENT: true,
        RETURN_DOM_IMPORT: false,
      }).ownerDocument,
      document
    );
    assert.equal(
      DOMPurify.sanitize('123', {
        RETURN_DOM_FRAGMENT: true,
        RETURN_DOM_IMPORT: true,
      }).ownerDocument,
      document
    );
  });
  QUnit.test('Config-Flag tests: RETURN_DOM_FRAGMENT', function (assert) {
    //RETURN_DOM_FRAGMENT
    // attempt clobbering
    var fragment = DOMPurify.sanitize('foo<img id="createDocumentFragment">', {
      RETURN_DOM_FRAGMENT: true,
    });
    assert.equal(fragment.nodeType, 11);
    assert.equal(fragment.ownerDocument, document);
    assert.equal(fragment.firstChild && fragment.firstChild.nodeValue, 'foo');
    // again, but without SANITIZE_DOM
    fragment = DOMPurify.sanitize('foo<img id="createDocumentFragment">', {
      RETURN_DOM_FRAGMENT: true,
      SANITIZE_DOM: false,
    });
    assert.equal(fragment.nodeType, 11);
    assert.equal(fragment.ownerDocument, document);
    assert.equal(fragment.firstChild && fragment.firstChild.nodeValue, 'foo');
  });
  QUnit.test('Config-Flag tests: RETURN_DOM_FRAGMENT', function (assert) {
      var xss = `<body><div><template shadowroot=open><img src=x onerror=alert(3)></template></div></body>`;
      var dom_body = DOMPurify.sanitize(xss, {RETURN_DOM: true});
      assert.equal(dom_body.outerHTML, "<body><div><template><img src=\"x\"></template></div></body>");
  });
  QUnit.test('Config-Flag tests: IN_PLACE', function (assert) {
    //IN_PLACE
    var dirty = document.createElement('a');
    dirty.setAttribute('href', 'javascript:alert(1)');
    var clean = DOMPurify.sanitize(dirty, { IN_PLACE: true });
    assert.equal(dirty, clean); // should return the input node
    assert.equal(dirty.href, ''); // should still sanitize
  });
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
      DOMPurify.sanitize('<a x="1">123<b>456</b></a>', { FORBID_ATTR: ['x'] }),
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
  // XSS tests: Native DOM methods (alert() should not be called)
  QUnit.cases(xssTests).asyncTest('XSS test: native', function (
    params,
    assert
  ) {
    document.getElementById('qunit-fixture').innerHTML = DOMPurify.sanitize(
      params.payload
    );
    setTimeout(function () {
      QUnit.start();
      assert.notEqual(window.xssed, true, 'alert() was called');
      // Teardown
      document.getElementById('qunit-fixture').innerHTML = '';
      window.xssed = false;
    }, 100);
  });
  // XSS tests: jQuery (alert() should not be called)
  QUnit.cases(xssTests).asyncTest('XSS test: jQuery', function (
    params,
    assert
  ) {
    jQuery('#qunit-fixture').html(
      DOMPurify.sanitize(params.payload)
    );
    setTimeout(function () {
      QUnit.start();
      assert.notEqual(window.xssed, true, 'alert() was called');
      // Teardown
      jQuery('#qunit-fixture').empty();
      window.xssed = false;
    }, 100);
  });
  // document.write tests to handle FF's strange behavior
  QUnit.cases(xssTests).asyncTest(
    'XSS test: document.write() into iframe',
    function (params, assert) {
      var iframe = document.createElement('iframe');
      iframe.src = 'about:blank';
      iframe.onload = function () {
        QUnit.start();
        iframe.contentDocument.write(
          '<script>window.alert=function(){top.xssed=true;}</script>' +
            DOMPurify.sanitize(params.payload)
        );
        assert.notEqual(
          window.xssed,
          true,
          'alert() was called from document.write()'
        );
        window.xssed = false;
        iframe.parentNode.removeChild(iframe);
      };
      document.body.appendChild(iframe);
    }
  );
  // cross-check that document.write into iframe works properly
  QUnit.asyncTest('XSS test: document.write() into iframe', function (assert) {
    window.xssed = false;
    var iframe = document.createElement('iframe');
    iframe.src = 'about:blank';
    iframe.onload = function () {
      QUnit.start();
      iframe.contentDocument.write(
        '<script>window.alert=function(){parent.xssed=true;}</script><script>alert(1);</script>'
      );
      assert.equal(window.xssed, true, 'alert() was called but not detected');
      window.xssed = false;
      iframe.parentNode.removeChild(iframe);
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
      typeof DOMPurify({ document: 'not really a document' }).version,
      'string'
    );
    assert.strictEqual(
      DOMPurify({ document: 'not really a document' }).isSupported,
      false
    );
    assert.strictEqual(
      DOMPurify({ document: 'not really a document' }).sanitize,
      undefined
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
          RETURN_DOM_IMPORT: true,
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
  // Test to check against a hang in MSIE (#89)
  QUnit.test(
    'sanitize() should not hang on MSIE when hook changes textContent',
    function (assert) {
      DOMPurify.addHook('afterSanitizeElements', function (node) {
        if (node.nodeType && node.nodeType === document.TEXT_NODE) {
          node.textContent = 'foo';
        }
        return node;
      });
      var dirty =
        '<div><p>This is a beatufiul text</p><p>This is too</p></div>';
      var modified = '<div><p>foo</p><p>foo</p></div>';
      assert.equal(DOMPurify.sanitize(dirty), modified);
      DOMPurify.removeHooks('afterSanitizeElements');
    }
  );
  // Tests to ensure that a configuration can be set and cleared
  QUnit.test(
    'ensure that a persistent configuration can be set and cleared',
    function (assert) {
      var dirty = '<my-component>abc</my-component>';
      assert.equal(DOMPurify.sanitize(dirty), 'abc');
      DOMPurify.setConfig({ ADD_TAGS: ['my-component'] });
      assert.equal(
        DOMPurify.sanitize(dirty),
        '<my-component>abc</my-component>'
      );
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
      var modified = '<p>HE<is-custom super-custom="test">LLO</is-custom></p>';
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

  QUnit.test('Regression-Test to make sure #166 stays fixed', function (
    assert
  ) {
    var dirty = '<p onFoo="123">HELLO</p>';
    var modified = '<p>HELLO</p>';
    assert.equal(
      modified,
      DOMPurify.sanitize(dirty, { ALLOW_UNKNOWN_PROTOCOLS: true })
    );
  });

  // Test 1 to check if the element count in DOMPurify.removed is correct
  QUnit.test('DOMPurify.removed should contain one element', function (assert) {
    var dirty =
      '<svg onload=alert(1)><filter><feGaussianBlur /></filter></svg>';
    DOMPurify.sanitize(dirty);
    assert.contains(DOMPurify.removed.length, [1, 2]); // IE removes two
  });

  // Test 2 to check if the element count in DOMPurify.removed is correct
  QUnit.test('DOMPurify.removed should contain two elements', function (
    assert
  ) {
    var dirty =
      '1<script>alert(1)</script><svg onload=alert(1)><filter><feGaussianBlur /></filter></svg>';
    DOMPurify.sanitize(dirty);
    assert.contains(DOMPurify.removed.length, [2, 3]); // IE removed three
  });

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
  QUnit.test(
    'DOMPurify.removed should be correct',
    function (assert) {
      var dirty = '<option><iframe></select><b><script>alert(1)</script>';
      DOMPurify.sanitize(dirty);
      assert.equal(DOMPurify.removed.length, 1);
    }
  );

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
        WHOLE_DOCUMENT: true
      });
      assert.equal(DOMPurify.removed.length, 0);
    }
  );
  // Tests to make sure that the node scanning feature delivers acurate results on all browsers
  QUnit.test(
    'DOMPurify should deliver acurate results when sanitizing nodes 1',
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
  QUnit.test('DOMPurify should allow to define URI safe attributes', function (
    assert
  ) {
    var clean = DOMPurify.sanitize('<b typeof="bla:h">123</b>', {
      ALLOWED_ATTR: ['typeof'],
      ADD_URI_SAFE_ATTR: ['typeof'],
    });
    assert.equal(clean, '<b typeof="bla:h">123</b>');
  });
  // Test to make sure that URI_safe attributes don't persist, see #327
  QUnit.test('DOMPurify should not persist URI safe attributes', function (
    assert
  ) {
    var clean = DOMPurify.sanitize('<b typeof="bla:h">123</b>', {
      ALLOWED_ATTR: ['typeof'],
      ADD_URI_SAFE_ATTR: ['typeof'],
    });
    var clean = DOMPurify.sanitize('<b typeof="bla:h">123</b>', {
      ALLOWED_ATTR: ['typeof'],
    });
    assert.equal(clean, '<b>123</b>');
  });
  // Test to make sure that URI_safe attributes don't overwrite default, see #366
  QUnit.test(
    'DOMPurify should not overwrite default URI safe attributes',
    function (assert) {
      var clean = DOMPurify.sanitize(
        '<div poster="x:y" style="color: red">Test</div>',
        { ADD_URI_SAFE_ATTR: ['poster'] }
      );
      assert.contains(clean, [
        '<div style="color: red" poster="x:y">Test</div>',
        '<div style="color: red;" poster="x:y">Test</div>',
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
  // Test to make sure that empty HTML doesn't return null on MSIE11 (#198)
  QUnit.test(
    "Empty HTML shouldn't return null on MSIE11 in RETURN_DOM_FRAGMENT mode",
    function (assert) {
      var clean = DOMPurify.sanitize('', {
        RETURN_DOM: true,
        RETURN_DOM_FRAGMENT: true,
      });
      assert.equal(typeof clean, 'object');
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
  QUnit.test('Lack of FORCE_BODY still preserves leading whitespace', function (
    assert
  ) {
    var clean = DOMPurify.sanitize(' <b>AAAAA</b>', { FORCE_BODY: false });
    assert.equal(clean, ' <b>AAAAA</b>');
  });
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
      ['<h1>HELLO</h1>', '<h1>HELLO</h1><math></math>', "<h1>HELLO</h1><math></math>"]
    );
    assert.contains(
      DOMPurify.sanitize('<h1>HELLO</h1><math><mi></mi></math>', {
        USE_PROFILES: { html: true, mathMl: true },
      }),
      ['<h1>HELLO</h1>', '<h1>HELLO</h1><math><mi></mi></math>', "<h1>HELLO</h1><math></math>"]
    );
    assert.contains(
      DOMPurify.sanitize('<h1>HELLO</h1><math><mi></mi></math>', {
        USE_PROFILES: { html: true, mathMl: true },
        FORBID_TAGS: ['mi'],
      }),
      ['<h1>HELLO</h1>', '<h1>HELLO</h1><math></math>', "<h1>HELLO</h1><math></math>"]
    );
    assert.contains(
      DOMPurify.sanitize('<h1>HELLO</h1><math class="foo"><mi></mi></math>', {
        USE_PROFILES: { html: true, mathMl: true },
        FORBID_ATTR: ['class'],
      }),
      ['<h1>HELLO</h1>', '<h1>HELLO</h1><math><mi></mi></math>', "<h1>HELLO</h1><math></math>"]
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
        "<svg xmlns=\"http://www.w3.org/2000/svg\" />"
      ]
    );
    assert.contains(
      DOMPurify.sanitize('<svg><feBlend in="SourceGraphic" mode="multiply" /></svg>', {
        USE_PROFILES: { svgFilters: true },
        ADD_TAGS: ['svg'],
      }),
      [
        '<svg><feblend in="SourceGraphic" mode="multiply"></feblend></svg>',
        '<svg><feblend mode="multiply" in="SourceGraphic"></feblend></svg>',
        '<svg><feBlend mode="multiply" in="SourceGraphic"></feBlend></svg>',
        '<svg><feBlend mode="multiply" in="SourceGraphic"></feBlend></svg>',
        "<svg xmlns=\"http://www.w3.org/2000/svg\"><feBlend in=\"SourceGraphic\" mode=\"multiply\" /></svg>",
        "<svg xmlns=\"http://www.w3.org/2000/svg\" />"
      ]
    );
    assert.contains(
      DOMPurify.sanitize('<svg><style>.some-class {fill: #fff}</style></svg>', {
        USE_PROFILES: { svg: true },
      }),
      [
        '',
        '<svg><style>.some-class {fill: #fff}</style></svg>',
        '<svg xmlns="http://www.w3.org/2000/svg"><style>.some-class {fill: #fff}</style></svg>',
        "<svg xmlns=\"http://www.w3.org/2000/svg\" />"
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
        "<svg xmlns=\"http://www.w3.org/2000/svg\" />"
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
        test:
          '<img src="blob:https://localhost:3000/c4ea3ec6-9f22-4d08-af6f-d79e78a0a7a7">',
        expected: '<img>',
      },
      {
        test: '<a href="mailto:demo@example.com">demo</a>',
        expected: '<a>demo</a>',
      },
    ].forEach(function (test) {
      var str = DOMPurify.sanitize(test.test, {
        ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
      });
      assert.equal(str, test.expected);
    });
  });
  QUnit.test('Avoid freeze when using tables and ALLOW_TAGS', function (
    assert
  ) {
    var clean = DOMPurify.sanitize('<table><tr><td></td></tr></table>', {
      ALLOW_TAGS: ['table', 'tr', 'td'],
    });
    assert.equal(clean, '<table><tbody><tr><td></td></tr></tbody></table>');
  });
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
        "a<img src=\"x\">'&gt;<p></p>"
      ]);
    }
  );
  QUnit.test('Avoid mXSS in Chrome 77 and above using SVG', function (assert) {
    var clean = DOMPurify.sanitize('<svg></p><style><g title="</style>');
    assert.contains(clean, [
      '',
      '<svg></svg><p></p><style><g title="</style>',
      '<p></p><style><g title="</style>',
      "<svg></svg><p></p>",
      "<svg><style></style></svg>",
      "<svg xmlns=\"http://www.w3.org/2000/svg\"><style /></svg>",
      "<svg xmlns=\"http://www.w3.org/2000/svg\"><style /></svg></svg>"
    ]);
  });
  QUnit.test('Avoid mXSS in Chrome 77 and above using HTML', function (assert) {
    var clean = DOMPurify.sanitize('<svg></p><title><a href="</title>qqq');
    assert.contains(clean, [
      '',
      '<svg></svg><p></p><title>&lt;a href="</title>qqq<img src="">"&gt;',
      '<svg></svg><p></p><title>&lt;a href="</title>qqq',
      '<p></p><title>&lt;a href="</title>qqq',
      "<svg></svg><p></p>qqq",
      "<svg><title></title></svg>",
      "<svg xmlns=\"http://www.w3.org/2000/svg\"><title /></svg>",
      "<svg xmlns=\"http://www.w3.org/2000/svg\"><title /></svg></svg>"
    ]);
  });
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
  QUnit.test('Test for less agressive mXSS handling, See #369', function (
    assert
  ) {
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
  });
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
        ''
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
        '<img y="<x" x="/><img src=x onerror=alert(1)>">', // jsdom
        '<img y="<x">',
        '<img y="&lt;x">',
        '<img y="<x">',
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
        "a<p></p>",
        "a"
      ]);
    }
  );
  QUnit.test(
    'Test against data URIs in anchors without proper config flag',
    function (assert) {
      var clean = DOMPurify.sanitize('<a href="data:image/gif;base64,123">icon.gif</a>');
      assert.equal(clean, '<a>icon.gif</a>');
    }
  );
  QUnit.test(
    'Test against data URIs in anchors using proper config flag',
    function (assert) {
      var clean = DOMPurify.sanitize('<a href="data:image/gif;base64,123">icon.gif</a>', {
          ADD_DATA_URI_TAGS: ['a', 'b']
      });
      assert.equal(clean, '<a href="data:image/gif;base64,123">icon.gif</a>');
    }
  );
  QUnit.test(
    'Test against Unicode tag names and proper removal',
    function (assert) {
      var clean = DOMPurify.sanitize('<svg><blocKquote>foo</blocKquote>');
      assert.contains(clean, [
          '<svg></svg>',
          '<svg xmlns="http://www.w3.org/2000/svg" />'
      ]);

      var clean = DOMPurify.sanitize('<svg><blocKquote>foo</blocKquote>');
      assert.contains(clean, [
            '<svg></svg><blockquote>foo</blockquote>',
            '<svg><blockquote>foo</blockquote></svg>',
            '<svg xmlns="http://www.w3.org/2000/svg" /><blockquote>foo</blockquote>'
      ]);
    }
  );
  QUnit.test(
    'Test protection from prototype pollution attacks',
    function (assert) {

      const obj = JSON.parse('{"ALLOWED_ATTR":["onerror","src"], "documentMode":9}');
      try {
        for (let [k, v] of Object.entries(obj)) {
            Object.prototype[k] = v;
        }
      } catch(e) {}
      var clean = DOMPurify.sanitize('<img src=x onerror=alert(1)>');
      assert.equal(clean, '<img src="x">');
    }
  );
  QUnit.test(
    'Test if namespaces are properly enforced',
    function (assert) {
      var tests = [
        {
          test: '<svg><desc><canvas></canvas><textarea></textarea></desc></svg>',
          expected: [
            '<svg><desc><canvas></canvas><textarea></textarea></desc></svg>',
            "<svg xmlns=\"http://www.w3.org/2000/svg\"><desc><canvas></canvas><textarea></textarea></desc></svg>",
            "<svg xmlns=\"http://www.w3.org/2000/svg\" />"
          ]
        },
        {
          test: '<svg><canvas></canvas><textarea></textarea></svg>',
          expected: [
            '<svg></svg>',
            "<svg xmlns=\"http://www.w3.org/2000/svg\" />"
          ]
        },
        {
          test: '<math><canvas></canvas><textarea></textarea></math>',
          expected: ['<math></math>']
        },
        {
          test: '<math><mi><canvas></canvas><textarea></textarea></mi></math>',
          expected: [
            '<math><mi><canvas></canvas><textarea></textarea></mi></math>', 
            "<math></math>"
          ]
        },
        {
          test: '<svg><math></math><title><math></math></title></svg>',
          expected: [
            '<svg><title><math></math></title></svg>', 
            "<svg xmlns=\"http://www.w3.org/2000/svg\" />",
            "<svg xmlns=\"http://www.w3.org/2000/svg\"><title><math></math></title></svg>"
          ]
        },
        {
          test: '<math><svg></svg><mi><svg></svg></mi></math>',
          expected: [
            '<math><mi><svg></svg></mi></math>',
            "<math><mi><svg xmlns=\"http://www.w3.org/2000/svg\" /></mi></math>",
            "<math></math>"
          ]
        },
        {
          test: '<form><math><mi><mglyph></form><form>',
          expected: ['<form><math><mi><mglyph></mglyph></mi></math></form>', "<form><math></math></form>"]
        },
      ];
      tests.forEach(function (test) {
        var clean = DOMPurify.sanitize(test.test);
        assert.contains(clean, test.expected)
      });
    }
  );

  QUnit.test('Config-Flag tests: NAMESPACE', function (assert) {
    var tests = [
      {
        test: '<polyline points="0 0"></polyline>',
        config: { NAMESPACE: 'http://www.w3.org/2000/svg' },
        expected: [
          '<polyline points="0 0"></polyline>',
          '<polyline xmlns="http://www.w3.org/2000/svg" points="0 0"/>',
          '<polyline xmlns="http://www.w3.org/2000/svg" points="0,0" />',
          ''
        ],
      },
      {
        test: '<polyline points="0 0"></polyline>',
        config: { NAMESPACE: 'http://www.w3.org/1999/xhtml' },
        expected: ['', '<polyline points="0 0"></polyline>'], // IE10
      },
      {
        test: '<mi></mi>',
        config: { NAMESPACE: 'http://www.w3.org/1998/Math/MathML' },
        expected: [
          '<mi></mi>',
          '<mi xmlns="http://www.w3.org/1998/Math/MathML"></mi>',
          '<mi xmlns="http://www.w3.org/1998/Math/MathML"/>',
          '<mi xmlns="http://www.w3.org/1998/Math/MathML" />',
          ''
        ],
      },
      {
        test: '<polyline points="0 0"></polyline>',
        config: { NAMESPACE: 'http://www.w3.org/1998/Math/MathML' },
        expected: ['', '<polyline points="0 0"></polyline>'], // IE10
      },
      {
        test: '<mi></mi>',
        config: { NAMESPACE: 'http://www.w3.org/1999/xhtml' },
        expected: [
          '',
        ],
      },
    ];
    tests.forEach(function (test) {
      var clean = DOMPurify.sanitize(test.test, test.config);
      assert.contains(clean, test.expected);
    });
  });

  QUnit.test('Config-Flag tests: PARSER_MEDIA_TYPE', function (assert) {
    const tests = [
      {
        test: '<A href="#">invalid</A><a TITLE="title" href="#">valid</a>',
        expected: {
          '': [
                '<a href="#">invalid</a><a href="#" title="title">valid</a>',
                '<a href="#">invalid</a><a title="title" href="#">valid</a>'
           ],
          'Application/xhtml+xml': [
                '<a href="#">invalid</a><a href="#" title="title">valid</a>',
                '<a href="#">invalid</a><a title="title" href="#">valid</a>'
           ],
          'application/xml': [
                '<a href="#">invalid</a><a href="#" title="title">valid</a>',
                '<a href="#">invalid</a><a title="title" href="#">valid</a>'
           ],
          'application/xhtml+xml': [
                '<a href="#">invalid</a><a href="#" title="title">valid</a>',
                'invalid<a xmlns="http://www.w3.org/1999/xhtml" href="#">valid</a>',
                'invalid<a xmlns="http://www.w3.org/1999/xhtml" href="#" TITLE="title">valid</a>'
           ],
          'text/html': [
                '<a href="#">invalid</a><a href="#" title="title">valid</a>',
                '<a href="#">invalid</a><a title="title" href="#">valid</a>'
           ],
          'text/xml': [
                '<a href="#">invalid</a><a href="#" title="title">valid</a>',
                '<a href="#">invalid</a><a title="title" href="#">valid</a>'
          ]
        }
      },
      {
        config: {
          WHOLE_DOCUMENT: true
        },
        test: '<A href="#">invalid</A><a TITLE="title" href="#">valid</a>',
        expected: {
          'text/html': [
                '<html><head></head><body><a href="#">invalid</a><a href="#" title="title">valid</a></body></html>',
                '<html><head></head><body><a href="#">invalid</a><a title="title" href="#">valid</a></body></html>'
          ],
          'application/xhtml+xml': [
                '<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>invalid<a href="#">valid</a></body></html>',
                '<html xmlns="http://www.w3.org/1999/xhtml"><head /><body>invalid<a href="#">valid</a></body></html>',
                '<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>invalid<a href="#" TITLE="title">valid</a></body></html>'
          ]
        }
      }
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

  QUnit.test('Test namespace default to html after other namespace been used', function (assert) {
    var tests = [
      {
        test: '<br>',
        config: { NAMESPACE: 'http://www.w3.org/2000/svg' },
        expected: ['', '<br>'],
      },
      {
        test: '<br>',
        config: { },
        expected: ['<br>'],
      },
    ];
    tests.forEach(function (test) {
      var clean = DOMPurify.sanitize(test.test, test.config);
      assert.contains(clean, test.expected);
    });
  });

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
};
