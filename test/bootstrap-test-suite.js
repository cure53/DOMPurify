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

  function loadDOMPurify(
    assert,
    addScriptAttribute,
    setup,
    beforeOnLoad,
    onload
  ) {
    const testDone = assert.async();
    const { window } = new JSDOM('<head></head>', {
      runScripts: 'dangerously',
    });
    require('jquery')(window);
    if (setup) {
      setup(window);
    }

    const myLibrary = fs.readFileSync('dist/purify.js', { encoding: 'utf-8' });
    const scriptEl = window.document.createElement('script');
    if (addScriptAttribute)
      scriptEl.setAttribute('data-tt-policy-suffix', 'suffix');

    scriptEl.textContent = myLibrary;
    window.document.body.appendChild(scriptEl);

    assert.ok(window.DOMPurify.sanitize);

    if (beforeOnLoad) {
      beforeOnLoad(window);
    }

    if (onload) {
      onload(window);
    }
    testDone();
  }

  function loadDOMPurifyWithSanityCheck(
    assert,
    addScriptAttribute,
    setup,
    onload
  ) {
    const beforeOnLoadSanityCheck = function (window) {
      assert.equal(
        window.DOMPurify.sanitize('<img src=x onerror=alert(1)>'),
        '<img src="x">'
      );
    };
    loadDOMPurify(
      assert,
      addScriptAttribute,
      setup,
      beforeOnLoadSanityCheck,
      onload
    );
  }

  QUnit.test(
    'sanity check: works in a non-Trusted Type environment',
    function (assert) {
      let policyCreated;

      loadDOMPurifyWithSanityCheck(
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
    }
  );

  QUnit.test(
    'sanity check: works in a Trusted Type environment',
    function (assert) {
      let policyCreated;

      loadDOMPurifyWithSanityCheck(
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
    }
  );

  QUnit.test(
    'sanity check: supports configuring the policy suffix via an attribute',
    function (assert) {
      let policyCreated;

      loadDOMPurifyWithSanityCheck(
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

  QUnit.test('supports TRUSTED_TYPES_POLICY via sanitize()', function (assert) {
    loadDOMPurify(assert, false, undefined, undefined, function onload(window) {
      let validationError;
      try {
        window.DOMPurify.sanitize('<img>', {
          TRUSTED_TYPES_POLICY: {
            createScript(s) {
              return s;
            },
          },
        });
      } catch (e) {
        validationError = e;
      }
      assert.equal(
        validationError.message,
        'TRUSTED_TYPES_POLICY configuration option must provide a "createHTML" hook.'
      );

      try {
        window.DOMPurify.sanitize('<img>', {
          TRUSTED_TYPES_POLICY: {
            createHTML(s) {
              return s;
            },
          },
        });
      } catch (e) {
        validationError = e;
      }
      assert.equal(
        validationError.message,
        'TRUSTED_TYPES_POLICY configuration option must provide a "createScriptURL" hook.'
      );

      let suppliedPolicyCallCount = 0;
      window.DOMPurify.sanitize('<img>', {
        TRUSTED_TYPES_POLICY: {
          createHTML(s) {
            suppliedPolicyCallCount += 1;
            return new StringWrapper(s);
          },
          createScriptURL(s) {
            return new StringWrapper(s);
          },
        },
      });
      assert.equal(suppliedPolicyCallCount, 2);
    });
  });

  QUnit.test(
    'supports TRUSTED_TYPES_POLICY via setConfig() on a new instance',
    function (assert) {
      loadDOMPurify(
        assert,
        false,
        undefined,
        undefined,
        function onload(window) {
          let purify = window.DOMPurify();
          assert.notEqual(purify, window.DOMPurify);

          let suppliedPolicyCallCount = 0;
          purify.setConfig({
            TRUSTED_TYPES_POLICY: {
              createHTML(s) {
                suppliedPolicyCallCount += 1;
                return new StringWrapper(s);
              },
              createScriptURL(s) {
                return new StringWrapper(s);
              },
            },
          });

          purify.sanitize('<img>');
          assert.equal(suppliedPolicyCallCount, 2);
        }
      );
    }
  );

  QUnit.test(
    'internal TrustedTypes policy is not created when TRUSTED_TYPES_POLICY option is provided',
    function (assert) {
      const createdPolicies = [];
      loadDOMPurify(
        assert,
        false,
        function setup(window) {
          window.trustedTypes = {
            createPolicy(name, rules) {
              createdPolicies.push(name);
              return {
                createHTML(s) {
                  return new StringWrapper(rules.createHTML(s));
                },
                createScriptURL(s) {
                  return new StringWrapper(rules.createScriptURL(s));
                },
              };
            },
          };
        },
        undefined,
        function onload(window) {
          assert.equal(createdPolicies.length, 0);
          const testPolicy = window.trustedTypes.createPolicy('test', {
            createHTML(s) {
              return s;
            },
            createScriptURL(s) {
              return s;
            },
          });
          window.DOMPurify.sanitize('<img />', {
            TRUSTED_TYPES_POLICY: testPolicy,
          });
          assert.equal(createdPolicies.length, 1);
          assert.equal(createdPolicies[0], 'test');
          // Subsequent calls to `sanitize` even without supplying a configuration
          // should recognize previously set Trusted Types policy.
          window.DOMPurify.sanitize('<img />');
          assert.equal(createdPolicies.length, 1);
          assert.equal(createdPolicies[0], 'test');
        }
      );
    }
  );
};
