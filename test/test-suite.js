module.exports = function(DOMPurify, window, tests, xssTests) {
  var document = window.document;
  var jQuery = window.jQuery;

  QUnit
    .cases(tests)
    .test( 'Sanitization test', function(params, assert) {
        assert.contains( DOMPurify.sanitize( params.payload ), params.expected, 'Payload: ' + params.payload);
    });
  
  // Config-Flag Tests
  QUnit.test( 'Config-Flag tests: KEEP_CONTENT + ALLOWED_TAGS / ALLOWED_ATTR', function(assert) {
      // KEEP_CONTENT + ALLOWED_TAGS / ALLOWED_ATTR
      assert.equal( DOMPurify.sanitize( '<iframe>Hello</iframe>', {KEEP_CONTENT: false} ), "");
      assert.contains( DOMPurify.sanitize( '<a href="#">abc<b style="color:red">123</b><q class="cite">123</b></a>', {ALLOWED_TAGS: ['b', 'q'], ALLOWED_ATTR: ['style'], KEEP_CONTENT: true}),
          ["abc<b style=\"color:red\">123</b><q>123</q>", "abc<b style=\"color: red;\">123</b><q>123</q>"]
      );
      assert.equal( DOMPurify.sanitize( '<a href="#">abc<b style="color:red">123</b><q class="cite">123</b></a>', {ALLOWED_TAGS: ['b', 'q'], ALLOWED_ATTR: ['style'], KEEP_CONTENT: false}), "");
      assert.equal( DOMPurify.sanitize( '<a href="#">abc</a>', {ALLOWED_TAGS: ['b', 'q'], KEEP_CONTENT: false}), "");
      assert.equal( DOMPurify.sanitize( '<form><input name="parentNode"></form>', {ALLOWED_TAGS: ['input'], KEEP_CONTENT: true}), "<input>" );
  });
  QUnit.test( 'Config-Flag tests: ALLOW_DATA_ATTR', function(assert) {
      // ALLOW_DATA_ATTR
      assert.equal( DOMPurify.sanitize( '<a href="#" data-abc\"="foo">abc</a>', {ALLOW_DATA_ATTR: true}), "<a href=\"#\">abc</a>" );
      assert.equal( DOMPurify.sanitize( '<a href="#" data-abc="foo">abc</a>', {ALLOW_DATA_ATTR: false}), "<a href=\"#\">abc</a>" );
      assert.contains( DOMPurify.sanitize( '<a href="#" data-abc="foo">abc</a>', {ALLOW_DATA_ATTR: true}),
          ["<a data-abc=\"foo\" href=\"#\">abc</a>", "<a href=\"#\" data-abc=\"foo\">abc</a>"]
      );
      assert.contains( DOMPurify.sanitize( '<a href="#" data-abc-1-2-3="foo">abc</a>', {ALLOW_DATA_ATTR: true}),
          ["<a data-abc-1-2-3=\"foo\" href=\"#\">abc</a>", "<a href=\"#\" data-abc-1-2-3=\"foo\">abc</a>"]
      );
      assert.equal( DOMPurify.sanitize( '<a href="#" data-""="foo">abc</a>', {ALLOW_DATA_ATTR: true}), "<a href=\"#\">abc</a>" );
      assert.contains( DOMPurify.sanitize( '<a href="#" data-äöü="foo">abc</a>', {ALLOW_DATA_ATTR: true}),
              ["<a href=\"#\" data-äöü=\"foo\">abc</a>", "<a data-äöü=\"foo\" href=\"#\">abc</a>"]
      );
      assert.contains( DOMPurify.sanitize( '<a href="#" data-\u00B7._="foo">abc</a>', {ALLOW_DATA_ATTR: true}),
              ["<a data-\u00B7._=\"foo\" href=\"#\">abc</a>", "<a href=\"#\">abc</a>"] // IE11 and Edge throw an InvalidCharacterError
      );
      assert.equal( DOMPurify.sanitize( '<a href="#" data-\u00B5="foo">abc</a>', {ALLOW_DATA_ATTR: true}), "<a href=\"#\">abc</a>" );
  });
  QUnit.test( 'Config-Flag tests: ADD_TAGS', function(assert) {
      // ADD_TAGS
      assert.equal( DOMPurify.sanitize( '<my-component>abc</my-component>', {ADD_TAGS: ['my-component']}), "<my-component>abc</my-component>" );
      assert.equal( DOMPurify.sanitize( '<my-ĸompønent>abc</my-ĸompønent>', {ADD_TAGS: ['my-ĸompønent']}), "<my-ĸompønent>abc</my-ĸompønent>" );
  });
  QUnit.test( 'Config-Flag tests: ADD_TAGS + ADD_ATTR', function(assert) {
      // ADD_TAGS + ADD_ATTR
      assert.equal( DOMPurify.sanitize( '<my-component my-attr="foo">abc</my-component>', {ADD_TAGS: ['my-component']}), "<my-component>abc</my-component>" );
      assert.equal( DOMPurify.sanitize( '<my-component my-attr="foo">abc</my-component>', {ADD_TAGS: ['my-component'], ADD_ATTR: ['my-attr']}), "<my-component my-attr=\"foo\">abc</my-component>" );
      assert.equal( DOMPurify.sanitize( '<my-ĸompønent my-æŧŧr="foo">abc</my-ĸompønent>', {ADD_TAGS: ['my-ĸompønent']}), "<my-ĸompønent>abc</my-ĸompønent>" );
      assert.equal( DOMPurify.sanitize( '<my-ĸompønent my-æŧŧr="foo">abc</my-ĸompønent>', {ADD_TAGS: ['my-ĸompønent'], ADD_ATTR: ['my-æŧŧr']}), "<my-ĸompønent my-æŧŧr=\"foo\">abc</my-ĸompønent>" );
  });
  QUnit.test( 'Config-Flag tests: SAFE_FOR_JQUERY', function(assert) {
      //SAFE_FOR_JQUERY
      assert.equal( DOMPurify.sanitize( '<a>123</a><option><style><img src=x onerror=alert(1)>', {SAFE_FOR_JQUERY: false}), "<a>123</a><option><style><img src=x onerror=alert(1)></style></option>" );
      assert.equal( DOMPurify.sanitize( '<a>123</a><option><style><img src=x onerror=alert(1)>', {SAFE_FOR_JQUERY: true}), "<a>123</a><option><style>&lt;img src=x onerror=alert(1)></style></option>" );
      assert.equal( DOMPurify.sanitize( '<option><style></option></select><b><img src=xx: onerror=alert(1)></style></option>', {SAFE_FOR_JQUERY: false}), "<option><style></option></select><b><img src=xx: onerror=alert(1)></style></option>" );
      assert.equal( DOMPurify.sanitize( '<option><style></option></select><b><img src=xx: onerror=alert(1)></style></option>', {SAFE_FOR_JQUERY: true}), "<option><style>&lt;/option>&lt;/select>&lt;b>&lt;img src=xx: onerror=alert(1)></style></option>" );
      assert.equal( DOMPurify.sanitize( '<option><iframe></select><b><script>alert(1)<\/script>', {SAFE_FOR_JQUERY: false, KEEP_CONTENT: false}), "<option></option>" );
      assert.equal( DOMPurify.sanitize( '<option><iframe></select><b><script>alert(1)<\/script>', {SAFE_FOR_JQUERY: true, KEEP_CONTENT: false}), "<option></option>" );
      assert.equal( DOMPurify.sanitize( '<b><style><style/><img src=xx: onerror=alert(1)>', {SAFE_FOR_JQUERY: false}), "<b><style><style/><img src=xx: onerror=alert(1)></style></b>" );
      assert.equal( DOMPurify.sanitize( '<b><style><style/><img src=xx: onerror=alert(1)>', {SAFE_FOR_JQUERY: true}), "<b><style>&lt;style/>&lt;img src=xx: onerror=alert(1)></style></b>" );
      assert.contains( DOMPurify.sanitize( '1<template><s>000</s></template>2', {SAFE_FOR_JQUERY: true}), ["1<template><s>000</s></template>2", "1<template></template>2"] );
      assert.contains( DOMPurify.sanitize( '<template><s>000</s></template>', {SAFE_FOR_JQUERY: true}), ["", "<template><s>000</s></template>"]);
  });
  QUnit.test( 'Config-Flag tests: SAFE_FOR_TEMPLATES', function(assert) {
      //SAFE_FOR_TEMPLATES
      assert.equal( DOMPurify.sanitize( '<a>123{{456}}<b><style><% alert(1) %></style>456</b></a>', {SAFE_FOR_TEMPLATES: true}), "<a> <b><style> </style>456</b></a>" );
      assert.equal( DOMPurify.sanitize( '<a data-bind="style: alert(1)"></a>', {SAFE_FOR_TEMPLATES: true}), "<a></a>" );
      assert.equal( DOMPurify.sanitize( '<a data-harmless=""></a>', {SAFE_FOR_TEMPLATES: true, ALLOW_DATA_ATTR: true}), "<a></a>" );
      assert.equal( DOMPurify.sanitize( '<a data-harmless=""></a>', {SAFE_FOR_TEMPLATES: false, ALLOW_DATA_ATTR: false}), "<a></a>" );
      assert.equal( DOMPurify.sanitize( '<a>{{123}}{{456}}<b><style><% alert(1) %><% 123 %></style>456</b></a>', {SAFE_FOR_TEMPLATES: true}), "<a> <b><style> </style>456</b></a>" );
      assert.equal( DOMPurify.sanitize( '<a>{{123}}abc{{456}}<b><style><% alert(1) %>def<% 123 %></style>456</b></a>', {SAFE_FOR_TEMPLATES: true}), "<a> <b><style> </style>456</b></a>" );
      assert.equal( DOMPurify.sanitize( '<a>123{{45{{6}}<b><style><% alert(1)%> %></style>456</b></a>', {SAFE_FOR_TEMPLATES: true}), "<a> <b><style> </style>456</b></a>" );
      assert.equal( DOMPurify.sanitize( '<a>123{{45}}6}}<b><style><% <%alert(1) %></style>456</b></a>', {SAFE_FOR_TEMPLATES: true}), "<a> <b><style> </style>456</b></a>" );
      assert.equal( DOMPurify.sanitize( '<a>123{{<b>456}}</b><style><% alert(1) %></style>456</a>', {SAFE_FOR_TEMPLATES: true}), "<a>123 <b> </b><style> </style>456</a>" );
      assert.contains( DOMPurify.sanitize( '<b>{{evil<script>alert(1)</script><form><img src=x name=textContent></form>}}</b>', {SAFE_FOR_TEMPLATES: true}), 
          ["<b>  </b>", "<b> </b>", "<b> <form><img src=\"x\"></form> </b>"] 
      );
      assert.contains( DOMPurify.sanitize( '<b>he{{evil<script>alert(1)</script><form><img src=x name=textContent></form>}}ya</b>', {SAFE_FOR_TEMPLATES: true}), 
          ["<b>he  ya</b>", "<b>he </b>", "<b>he <form><img src=\"x\"></form> ya</b>"]
      );
      assert.equal( DOMPurify.sanitize( '<a>123<% <b>456}}</b><style>{{ alert(1) }}</style>456 %></a>', {SAFE_FOR_TEMPLATES: true}), "<a>123 <b> </b><style> </style> </a>" );
      assert.equal( DOMPurify.sanitize( '<a href="}}javascript:alert(1)"></a>', {SAFE_FOR_TEMPLATES: true}), "<a></a>" );
  }); 
  QUnit.test( 'Config-Flag tests: SANITIZE_DOM', function(assert) {
      // SANITIZE_DOM
      assert.equal( DOMPurify.sanitize( '<form name="window">', {SANITIZE_DOM: true}), "<form></form>" );
      assert.equal( DOMPurify.sanitize( '<img src="x" name="implementation">', {SANITIZE_DOM: true}), '<img src="x">' );
      assert.equal( DOMPurify.sanitize( '<img src="x" name="createNodeIterator">', {SANITIZE_DOM: true}), '<img src="x">' );
      assert.equal( DOMPurify.sanitize( '<img src="x" name="getElementById">', {SANITIZE_DOM: false}), "<img name=\"getElementById\" src=\"x\">" );
      assert.equal( DOMPurify.sanitize( '<img src="x" name="getElementById">', {SANITIZE_DOM: true}), "<img src=\"x\">" );
      assert.equal( DOMPurify.sanitize( '<a href="x" id="location">click</a>', {SANITIZE_DOM: true}), "<a href=\"x\">click</a>" );
      assert.contains( DOMPurify.sanitize( '<form><input name="attributes"></form>', {ADD_TAGS: ['form'], SANITIZE_DOM: false}),
          ["", "<form><input name=\"attributes\"></form>"]
      );
      assert.contains( DOMPurify.sanitize( '<form><input name="attributes"></form>', {ADD_TAGS: ['form'], SANITIZE_DOM: true}),
          ["", "<form><input name=\"attributes\"></form>", "<form><input></form>"]
      );
  });
  QUnit.test( 'Config-Flag tests: WHOLE_DOCUMENT', function(assert) {
      //WHOLE_DOCUMENT
      assert.equal( DOMPurify.sanitize( '123', {WHOLE_DOCUMENT: false}), "123" );
      assert.equal( DOMPurify.sanitize( '123', {WHOLE_DOCUMENT: true}), "<html><head></head><body>123</body></html>" );
      assert.equal( DOMPurify.sanitize( '<style>*{color:red}</style>', {WHOLE_DOCUMENT: false}), "" );
      assert.equal( DOMPurify.sanitize( '<style>*{color:red}</style>', {WHOLE_DOCUMENT: true}), "<html><head><style>*{color:red}</style></head><body></body></html>" );
      assert.equal( DOMPurify.sanitize( '123<style>*{color:red}</style>', {WHOLE_DOCUMENT: false}), "123<style>*{color:red}</style>" );
      assert.equal( DOMPurify.sanitize( '123<style>*{color:red}</style>', {WHOLE_DOCUMENT: true}), "<html><head></head><body>123<style>*{color:red}</style></body></html>" );
  });
  QUnit.test( 'Config-Flag tests: RETURN_DOM', function(assert) {
      //RETURN_DOM
      assert.equal( DOMPurify.sanitize( '<a>123<b>456</b></a>', {RETURN_DOM: true}).outerHTML, "<body><a>123<b>456</b></a></body>" );
      assert.equal( DOMPurify.sanitize( '<a>123<b>456<script>alert(1)<\/script></b></a>', {RETURN_DOM: true}).outerHTML, "<body><a>123<b>456</b></a></body>" );
      assert.equal( DOMPurify.sanitize( '<a>123<b>456</b></a>', {RETURN_DOM: true, WHOLE_DOCUMENT: true}).outerHTML, "<html><head></head><body><a>123<b>456</b></a></body></html>" );
      assert.equal( DOMPurify.sanitize( '<a>123<b>456<script>alert(1)<\/script></b></a>', {RETURN_DOM: true, WHOLE_DOCUMENT: true}).outerHTML, "<html><head></head><body><a>123<b>456</b></a></body></html>" );
      assert.equal( DOMPurify.sanitize( '123', {RETURN_DOM: true}).outerHTML, "<body>123</body>" );
  });
  QUnit.test( 'Config-Flag tests: RETURN_DOM_IMPORT', function(assert) {
      //RETURN_DOM_IMPORT
      assert.notEqual( DOMPurify.sanitize( '123', {RETURN_DOM         : true                          }).ownerDocument, document );
      assert.notEqual( DOMPurify.sanitize( '123', {RETURN_DOM         : true, RETURN_DOM_IMPORT: false}).ownerDocument, document );
      assert.equal   ( DOMPurify.sanitize( '123', {RETURN_DOM         : true, RETURN_DOM_IMPORT: true }).ownerDocument, document );
      assert.notEqual( DOMPurify.sanitize( '123', {RETURN_DOM_FRAGMENT: true                          }).ownerDocument, document );
      assert.notEqual( DOMPurify.sanitize( '123', {RETURN_DOM_FRAGMENT: true, RETURN_DOM_IMPORT: false}).ownerDocument, document );
      assert.equal   ( DOMPurify.sanitize( '123', {RETURN_DOM_FRAGMENT: true, RETURN_DOM_IMPORT: true }).ownerDocument, document );
  });
  QUnit.test( 'Config-Flag tests: RETURN_DOM_FRAGMENT', function(assert) {
      //RETURN_DOM_FRAGMENT
      // attempt clobbering
      var fragment = DOMPurify.sanitize( 'foo<img id="createDocumentFragment">', {RETURN_DOM_FRAGMENT: true});
      assert.equal(fragment.nodeType, 11);
      assert.notEqual(fragment.ownerDocument, document);
      assert.equal(fragment.firstChild && fragment.firstChild.nodeValue, 'foo');
      // again, but without SANITIZE_DOM
      fragment = DOMPurify.sanitize( 'foo<img id="createDocumentFragment">', {RETURN_DOM_FRAGMENT: true, SANITIZE_DOM: false});
      assert.equal(fragment.nodeType, 11);
      assert.notEqual(fragment.ownerDocument, document);
      assert.equal(fragment.firstChild && fragment.firstChild.nodeValue, 'foo');
  });
  QUnit.test( 'Config-Flag tests: FORBID_TAGS', function(assert) {
      //FORBID_TAGS
      assert.equal( DOMPurify.sanitize( '<a>123<b>456</b></a>', {FORBID_TAGS: ['b']}), "<a>123456</a>" );
      assert.equal( DOMPurify.sanitize( '<a>123<b>456<script>alert(1)<\/script></b></a>789', {FORBID_TAGS: ['a', 'b']}), "123456789" );
      assert.equal( DOMPurify.sanitize( '<a>123<b>456</b></a>', {FORBID_TAGS: ['c']}), "<a>123<b>456</b></a>" );
      assert.equal( DOMPurify.sanitize( '<a>123<b>456<script>alert(1)<\/script></b></a>789', {FORBID_TAGS: ['script', 'b']}), "<a>123456</a>789" );
      assert.equal( DOMPurify.sanitize( '<a>123<b>456</b></a>', {ADD_TAGS: ['b'], FORBID_TAGS: ['b']}), "<a>123456</a>" );
  });
  QUnit.test( 'Config-Flag tests: FORBID_ATTR', function(assert) {
      //FORBID_ATTR
      assert.equal( DOMPurify.sanitize( '<a x="1">123<b>456</b></a>', {FORBID_ATTR: ['x']}), "<a>123<b>456</b></a>" );
      assert.equal( DOMPurify.sanitize( '<a class="0" x="1">123<b y="1">456<script>alert(1)<\/script></b></a>789', {FORBID_ATTR: ['x', 'y']}), "<a class=\"0\">123<b>456</b></a>789" );
      assert.equal( DOMPurify.sanitize( '<a y="1">123<b y="1" y="2">456</b></a>', {FORBID_ATTR: ['y']}), "<a>123<b>456</b></a>" );
      assert.equal( DOMPurify.sanitize( '<a>123<b x="1">456<script y="1">alert(1)<\/script></b></a>789', {FORBID_ATTR: ['x', 'y']}), "<a>123<b>456</b></a>789" );
  });
  QUnit.test( 'Test dirty being an array', function(assert) {
      assert.equal( DOMPurify.sanitize( ['<a>123<b>456</b></a>']), "<a>123<b>456</b></a>" );
      assert.equal( DOMPurify.sanitize( ['<img src=', 'x onerror=alert(1)>']), "<img src=\",x\">" );
  });  
  // XSS tests: Native DOM methods (alert() should not be called)
  QUnit
    .cases(xssTests)
    .asyncTest('XSS test: native', function(params, assert) {
      document.getElementById( 'qunit-fixture' ).innerHTML = DOMPurify.sanitize( params.payload );
      setTimeout(function() {
          QUnit.start();
          assert.notEqual( window.xssed, true, 'alert() was called' );
          // Teardown
          document.getElementById( 'qunit-fixture' ).innerHTML = '';
          window.xssed = false;
        }, 100);
    });
  // XSS tests: jQuery (alert() should not be called)
  QUnit
    .cases(xssTests)
    .asyncTest('XSS test: jQuery', function(params, assert) {
      jQuery( '#qunit-fixture' ).html( DOMPurify.sanitize( params.payload, {SAFE_FOR_JQUERY: true} ) );
      setTimeout(function() {
          QUnit.start();
          assert.notEqual( window.xssed, true, 'alert() was called' );
          // Teardown
          jQuery( '#qunit-fixture' ).empty();
          window.xssed = false;
        }, 100);
    });
  // document.write tests to handle FF's strange behavior
  QUnit
    .cases(xssTests)
    .asyncTest('XSS test: document.write() into iframe', function(params, assert) {
        var iframe = document.createElement('iframe');
        iframe.src='about:blank';
        iframe.onload=function(){
            QUnit.start();
            iframe.contentDocument.write('<script>window.alert=function(){top.xssed=true;}</script>' + DOMPurify.sanitize( params.payload ));
            assert.notEqual( window.xssed, true, 'alert() was called from document.write()' );
            window.xssed = false;
            iframe.parentNode.removeChild(iframe);
        }
        document.body.appendChild(iframe);  
  });
  // cross-check that document.write into iframe works properly
  QUnit
    .asyncTest('XSS test: document.write() into iframe', function(assert) {
        window.xssed = false;
        var iframe = document.createElement('iframe');
        iframe.src='about:blank';
        iframe.onload=function(){
            QUnit.start();
            iframe.contentDocument.write('<script>window.alert=function(){parent.xssed=true;}</script><script>alert(1);</script>' );
            assert.equal( window.xssed, true, 'alert() was called but not detected' );
            window.xssed = false;
            iframe.parentNode.removeChild(iframe);
        }
        document.body.appendChild(iframe);
  }); 
  // Check for isSupported property
  QUnit.test( 'DOMPurify property tests', function(assert) {
      assert.equal( typeof DOMPurify.isSupported, 'boolean' );
  });
  // Test with a custom window object
  QUnit.test( 'DOMPurify custom window tests', function(assert) {
      assert.strictEqual(typeof DOMPurify(null).version, 'string');
      assert.strictEqual(DOMPurify(null).isSupported, false);
      assert.strictEqual(DOMPurify(null).sanitize, undefined);
      assert.strictEqual(typeof DOMPurify({}).version, 'string');
      assert.strictEqual(DOMPurify({}).isSupported, false);
      assert.strictEqual(DOMPurify({}).sanitize, undefined);
      assert.strictEqual(typeof DOMPurify({document: 'not really a document'}).version, 'string');
      assert.strictEqual(DOMPurify({document: 'not really a document'}).isSupported, false);
      assert.strictEqual(DOMPurify({document: 'not really a document'}).sanitize, undefined);
      assert.strictEqual(typeof DOMPurify(window).version, 'string');
      assert.strictEqual(typeof DOMPurify(window).sanitize, 'function');
  });
  // Test to prevent security issues with pre-clobbered DOM
  QUnit.test( 'sanitize() should not throw if the original document is clobbered _after_ DOMPurify has been instantiated', function(assert) {
      var evilNode = document.createElement('div');
      evilNode.innerHTML = '<img id="implementation"><img id="createNodeIterator"><img id="importNode"><img id="createElement">';
      document.body.appendChild(evilNode);
      try {
              // tests implementation and createNodeIterator
              var resultPlain =  DOMPurify.sanitize('123');
              // tests importNode
              var resultImport = DOMPurify.sanitize( '123', {RETURN_DOM : true, RETURN_DOM_IMPORT: true });
              // tests createElement
              var resultBody = DOMPurify.sanitize( '123<img id="body">');
      } finally {
              // clean up before doing the actual assertions, otherwise qunit/jquery/etc might blow up
              document.body.removeChild(evilNode);
      }
      assert.equal( resultPlain, '123' );
      assert.equal( resultImport.ownerDocument, document );
      assert.equal( resultBody, '123<img>' );
  } );
  // Test to check against a hang in MSIE (#89)
  QUnit.test( 'sanitize() should not hang on MSIE when hook changes textContent', function(assert) {
      DOMPurify.addHook('afterSanitizeElements', function(node) {
          if (node.nodeType && node.nodeType === document.TEXT_NODE) {
              node.textContent = 'foo';
          }
          return node;
      });
      var dirty = '<div><p>This is a beatufiul text</p><p>This is too</p></div>';
      var modified = '<div><p>foo</p><p>foo</p></div>';
      assert.equal(modified, DOMPurify.sanitize(dirty));
      DOMPurify.removeHooks('afterSanitizeElements')
  } );
  QUnit.test( 'sanitize() should allow unknown protocols when ALLOW_UNKNOWN_PROTOCOLS is true', function (assert) {
      var dirty = '<div><a href="spotify:track:12345"><img src="cid:1234567"></a></div>';
      assert.equal(dirty, DOMPurify.sanitize(dirty, {ALLOW_UNKNOWN_PROTOCOLS: true}));
  } );

  QUnit.test( 'sanitize() should not allow javascript when ALLOW_UNKNOWN_PROTOCOLS is true', function (assert) {
      var dirty = '<div><a href="javascript:alert(document.title)"><img src="cid:1234567"/></a></div>';
      var modified = '<div><a><img src="cid:1234567"></a></div>';
      assert.equal(modified, DOMPurify.sanitize(dirty, {ALLOW_UNKNOWN_PROTOCOLS: true}));
  } );

  QUnit.test( 'Regression-Test to make sure #166 stays fixed', function (assert) {
      var dirty = '<p onFoo="123">HELLO</p>';
      var modified = '<p>HELLO</p>';
      assert.equal(modified, DOMPurify.sanitize(dirty, {ALLOW_UNKNOWN_PROTOCOLS: true}));
  } );  

  // Test 1 to check if the element count in DOMPurify.removed is correct
  QUnit.test( 'DOMPurify.removed should contain one element', function (assert) {
      var dirty = '<svg onload=alert(1)><filter><feGaussianBlur /></filter></svg>';
      DOMPurify.sanitize(dirty);
      assert.equal(DOMPurify.removed.length, 1);
  } );

  // Test 2 to check if the element count in DOMPurify.removed is correct
  QUnit.test( 'DOMPurify.removed should contain two elements', function (assert) {
      var dirty = '1<script>alert(1)<\/script><svg onload=alert(1)><filter><feGaussianBlur /></filter></svg>';
      DOMPurify.sanitize(dirty);
      assert.equal(DOMPurify.removed.length, 2);
  } );

  // Test 3 to check if the element count in DOMPurify.removed is correct
  QUnit.test( 'DOMPurify.removed should be correct', function (assert) {
      var dirty = '<img src=x onerror="alert(1)">';
      DOMPurify.sanitize(dirty);
      assert.equal(DOMPurify.removed.length, 1);
  } );

  // Test 4 to check that DOMPurify.removed is correct in SAFE_FOR_TEMLATES mode 
  QUnit.test( 'DOMPurify.removed should be correct in SAFE_FOR_TEMPLATES mode', function (assert) {
      var dirty = '<a>123{{456}}</a>';
      DOMPurify.sanitize(dirty, {WHOLE_DOCUMENT: true, SAFE_FOR_TEMPLATES: true});
      assert.equal(DOMPurify.removed.length, 1);
  } );

  // Test 5 to check that DOMPurify.removed is correct in SAFE_FOR_TEMLATES mode 
  QUnit.test( 'DOMPurify.removed should be correct in SAFE_FOR_TEMPLATES mode', function (assert) {
      var dirty = '<a>123{{456}}<b>456{{789}}</b></a>';
      DOMPurify.sanitize(dirty, {WHOLE_DOCUMENT: true, SAFE_FOR_TEMPLATES: true});
      assert.equal(DOMPurify.removed.length, 2);
  } );

  // Test 6 to check that DOMPurify.removed is correct in SAFE_FOR_TEMLATES mode 
  QUnit.test( 'DOMPurify.removed should be correct in SAFE_FOR_TEMPLATES mode', function (assert) {
      var dirty = '<img src=1 width="{{123}}">';
      DOMPurify.sanitize(dirty, {WHOLE_DOCUMENT: true, SAFE_FOR_TEMPLATES: true});
      assert.equal(DOMPurify.removed.length, 1);
  } );

  // Test 7 to check that DOMPurify.removed is correct in SAFE_FOR_JQUERY mode 
  QUnit.test( 'DOMPurify.removed should be correct in SAFE_FOR_JQUERY mode', function (assert) {
      var dirty = '<option><iframe></select><b><script>alert(1)<\/script>';
      DOMPurify.sanitize(dirty, {SAFE_FOR_JQUERY: true});
      assert.equal(DOMPurify.removed.length, 2);
  } );

  // Test 8 to check that DOMPurify.removed is correct if tags are clean 
  QUnit.test( 'DOMPurify.removed should not contain elements if tags are permitted', function (assert) {
      var dirty = '<a>123</a>';
      DOMPurify.sanitize(dirty);
      assert.equal(DOMPurify.removed.length, 0);
  } );

  // Test 9 to check that DOMPurify.removed is correct if the tags and attributes are clean
  QUnit.test( 'DOMPurify.removed should not contain elements if all tags and attrs are permitted', function (assert) {
      var dirty = '<img src=x>';
      DOMPurify.sanitize(dirty);
      assert.equal(DOMPurify.removed.length, 0);
  } );

  // Test 10 to check that DOMPurify.removed does not have false positive elements in SAFE_FOR_TEMLATES mode
  QUnit.test( 'DOMPurify.removed should not contain elements for valid data in SAFE_FOR_TEMLATES mode', function (assert) {
      var dirty = '1';
      DOMPurify.sanitize(dirty, {WHOLE_DOCUMENT: true, SAFE_FOR_TEMPLATES: true});
      assert.equal(DOMPurify.removed.length, 0);
  } );

  // Test 11 to check that DOMPurify.removed does not have false positive elements in SAFE_FOR_JQUERY mode 
  QUnit.test( 'DOMPurify.removed should not contain elements for valid data in SAFE_FOR_JQUERY mode', function (assert) {
      var dirty = '1';
      DOMPurify.sanitize(dirty, {WHOLE_DOCUMENT: true, SAFE_FOR_JQUERY: true});
      assert.equal(DOMPurify.removed.length, 0);
  } );

  // Make sure the fix for #168 doesn't regress and boolean attributes are permitted
  QUnit.test( 'Boolean attributes should not be stripped', function (assert) {
      var dirty = '<input type=checkbox checked>';
      var modified = DOMPurify.sanitize(dirty);
      assert.equal(modified, '<input type="checkbox" checked="checked" />');
  } );
}
