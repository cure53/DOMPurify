const fs = require('fs');

module.exports = function (JSDOM) {
  class StringWrapper {
    constructor(s) {
      this.s = s;
    }

    toString() {
      return this.s;
    }
  }

  function loadDOMPurify(assert, addScriptAttribute, setup, onload) {
    const testDone = assert.async();
    const { window } = new JSDOM('<head></head>', { runScripts: "dangerously" });
    require('jquery')(window);
    if (setup) {
      setup(window);
    }

    const myLibrary = fs.readFileSync('dist/purify.js', { encoding: "utf-8" });
    const scriptEl = window.document.createElement("script");
    if (addScriptAttribute) scriptEl.setAttribute('data-tt-policy-suffix', 'suffix');

    scriptEl.textContent = myLibrary;
    window.document.body.appendChild(scriptEl);

    assert.ok(window.DOMPurify.sanitize);
    // Sanity check
    assert.equal(
      window.DOMPurify.sanitize('<img src=x onerror=alert(1)>'),
      '<img src="x">'
    );
    if (onload) {
      onload(window);
    }
    testDone();
  }

  QUnit.test('works in a non-Trusted Type environment', function (assert) {
    let policyCreated;

    loadDOMPurify(
      assert,
      false,
      function setup(window) {
        delete window.trustedTypes;
      },
      function onload(window) {
        const output = window.DOMPurify.sanitize('<img>');
        assert.ok(typeof output === 'string');
      }
    );
  });

  QUnit.test('works in a Trusted Type environment', function (assert) {
    let policyCreated;

    loadDOMPurify(
      assert,
      false,
      function setup(window) {
        window.trustedTypes = {
          createPolicy(name, rules) {
            policyCreated = name;
            return {
              createHTML(s) {
                return new StringWrapper(rules.createHTML(s));
              },
            };
          },
        };
      },
      function onload(window) {
        assert.equal(policyCreated, 'dompurify');
        const output = window.DOMPurify.sanitize('<img>', {
          RETURN_TRUSTED_TYPE: true,
        });
        assert.equal(output, '<img>');
        assert.ok(output instanceof StringWrapper);
      }
    );
  });

  QUnit.test(
    'supports configuring the policy suffix via an attribute',
    function (assert) {
      let policyCreated;

      loadDOMPurify(
        assert,
        true,
        function setup(window) {
          window.trustedTypes = {
            createPolicy(name, rules) {
              policyCreated = name;
              return rules;
            },
          };
        },
        function onload(window) {
          assert.equal(policyCreated, 'dompurify#suffix');
        }
      );
    }
  );
};
