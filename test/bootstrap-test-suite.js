module.exports = function(jsdom) {

    class StringWrapper {
      constructor(s) {
        this.s = s;
      }

      toString() {
        return this.s;
      }
    }

    function loadDOMPurify(assert, head, setup, onload) {
      const testDone = assert.async();
      jsdom.env({
        html: '<head>' + head + '</head>',
        features: {
          FetchExternalResources: ["script"],
          ProcessExternalResources: ["script"],
        },
        created(err, window) {
          if (setup) {
            setup(window);
          }
        },
        done(err, window) {
          assert.ok(window.DOMPurify.sanitize);
          // Sanity check
          assert.equal(window.DOMPurify.sanitize('<img src=x onerror=alert(1)>'),
            '<img src="x">');
          if (onload) {
            onload(window);
          }
          testDone();
        }
      });
    }

  QUnit.test('works in a non-Trusted Type environment', function(assert) {
      let policyCreated;

      loadDOMPurify(
        assert,
        '<script src="dist/purify.js"></script>',
        function setup(window) {
          delete window.TrustedTypes;
        },
        function onload(window) {
          const output = window.DOMPurify.sanitize('<img>');
          assert.ok(typeof output === 'string');
        }
      );
  });

  QUnit.test('works in a Trusted Type environment', function(assert) {
      let policyCreated;

      loadDOMPurify(
        assert,
        '<script src="dist/purify.js"></script>',
        function setup(window) {


          window.TrustedTypes = {
            createPolicy(name, rules) {
              policyCreated = name;
              return {
                createHTML(s) {
                  return new StringWrapper(rules.createHTML(s));
                }
              };
            },
          };
        },
        function onload(window) {
          assert.equal(policyCreated, 'dompurify');
          const output = window.DOMPurify.sanitize('<img>');
          assert.equal(output, '<img>');
          assert.ok(output instanceof StringWrapper);
        }
      );
  });
  QUnit.test('supports configuring the policy suffix via an attribute', function(assert) {
      let policyCreated;

      loadDOMPurify(
        assert,
        '<script data-tt-policy-suffix="suffix" src="dist/purify.js"></script>',
        function setup(window) {
          window.TrustedTypes = {
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
  });
};
