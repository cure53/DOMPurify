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

  QUnit.test(
    'internal TrustedTypes policy is not created when TRUSTED_TYPES_POLICY is null',
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
          // Sanitizing with an explicit null policy must NOT create the
          // internal `dompurify` fallback policy, and must NOT throw (see
          // #1422). This lets pages with a strict `trusted-types` CSP that does
          // not allow a `dompurify` policy call `sanitize` from inside their own
          // policy's `createHTML`.
          const out = window.DOMPurify.sanitize(
            '<img src=x onerror=alert(1)>',
            { TRUSTED_TYPES_POLICY: null }
          );
          assert.equal(out, '<img src="x">');
          assert.equal(createdPolicies.length, 0);

          // A subsequent call with null should likewise create nothing.
          window.DOMPurify.sanitize('<img />', { TRUSTED_TYPES_POLICY: null });
          assert.equal(createdPolicies.length, 0);
        }
      );
    }
  );

  QUnit.test(
    'a self-referential TRUSTED_TYPES_POLICY throws a clear error instead of recursing',
    function (assert) {
      loadDOMPurify(
        assert,
        false,
        function setup(window) {
          window.trustedTypes = {
            createPolicy(name, rules) {
              return {
                createHTML(s) {
                  return rules.createHTML(s);
                },
                createScriptURL(s) {
                  return rules.createScriptURL(s);
                },
              };
            },
          };
        },
        undefined,
        function onload(window) {
          // A policy whose createHTML calls back into DOMPurify.sanitize is
          // circular by definition (see #1422). Setting it as DOMPurify's own
          // policy must fail fast with a descriptive error rather than blowing
          // the stack with "Maximum call stack size exceeded".
          const selfPolicy = window.trustedTypes.createPolicy('my-policy', {
            createHTML(input) {
              return window.DOMPurify.sanitize(input);
            },
            createScriptURL(input) {
              return input;
            },
          });

          assert.throws(
            function () {
              window.DOMPurify.setConfig({ TRUSTED_TYPES_POLICY: selfPolicy });
            },
            /must not call DOMPurify\.sanitize/,
            'circular TRUSTED_TYPES_POLICY throws a descriptive TypeError'
          );

          // The failed setConfig must not poison the instance: a normal
          // sanitize call still works afterwards.
          assert.equal(
            window.DOMPurify.sanitize('<img src=x onerror=alert(1)>'),
            '<img src="x">'
          );
        }
      );
    }
  );

  // Regression tests for GHSA-vxr8-fq34-vvx9. These live in the bootstrap
  // (jsdom) suite, not test-suite.js, because they need a fresh realm per test:
  // Trusted Types policy names are unique per realm, so a shared browser page
  // cannot recreate the internal `dompurify` policy for a fresh instance.
  function withCountingTrustedTypes(created) {
    return function setup(window) {
      window.trustedTypes = {
        createPolicy(name, rules) {
          created.push(name);
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
    };
  }

  // A caller-supplied policy that ignores its input and always emits a fixed
  // payload — stands in for an unsafe/foreign policy installed by a
  // less-trusted integration.
  function unsafeCallerPolicy() {
    return {
      createHTML() {
        return new StringWrapper('<img src=x onerror=alert(1)>');
      },
      createScriptURL(url) {
        return url;
      },
    };
  }

  QUnit.test(
    'a caller TRUSTED_TYPES_POLICY does not survive clearConfig()',
    function (assert) {
      const created = [];
      loadDOMPurify(
        assert,
        false,
        withCountingTrustedTypes(created),
        undefined,
        function onload(window) {
          const DOMPurify = window.DOMPurify;

          // Caller opts an unsafe policy in for a single call.
          const during = String(
            DOMPurify.sanitize('<img src=x onerror=alert(1)>', {
              TRUSTED_TYPES_POLICY: unsafeCallerPolicy(),
              RETURN_TRUSTED_TYPE: true,
            })
          );
          assert.ok(
            during.indexOf('onerror') > -1,
            'opted-in policy applies to its own call'
          );

          DOMPurify.clearConfig();

          const afterTrusted = String(
            DOMPurify.sanitize('<img src=x onerror=alert(1)>', {
              RETURN_TRUSTED_TYPE: true,
            })
          );
          assert.equal(
            afterTrusted.indexOf('onerror'),
            -1,
            'stale policy must not sign output after clearConfig()'
          );
          assert.equal(
            afterTrusted,
            '<img src="x">',
            'output is the default-sanitized result'
          );
        }
      );
    }
  );

  QUnit.test(
    'TRUSTED_TYPES_POLICY: null clears a previously active policy',
    function (assert) {
      const created = [];
      loadDOMPurify(
        assert,
        false,
        withCountingTrustedTypes(created),
        undefined,
        function onload(window) {
          const DOMPurify = window.DOMPurify;

          DOMPurify.sanitize('x', {
            TRUSTED_TYPES_POLICY: unsafeCallerPolicy(),
            RETURN_TRUSTED_TYPE: true,
          });

          const afterNull = String(
            DOMPurify.sanitize('<img src=x onerror=alert(1)>', {
              TRUSTED_TYPES_POLICY: null,
              RETURN_TRUSTED_TYPE: true,
            })
          );
          assert.equal(
            afterNull.indexOf('onerror'),
            -1,
            'null opts out of any retained policy'
          );
          assert.equal(
            afterNull,
            '<img src="x">',
            'null returns the sanitized string'
          );
        }
      );
    }
  );

  QUnit.test(
    'default RETURN_TRUSTED_TYPE yields a Trusted Type and creates the internal policy once',
    function (assert) {
      const created = [];
      loadDOMPurify(
        assert,
        false,
        withCountingTrustedTypes(created),
        undefined,
        function onload(window) {
          const DOMPurify = window.DOMPurify;

          const out = DOMPurify.sanitize('<b>ok</b><script>alert(2)</script>', {
            RETURN_TRUSTED_TYPE: true,
          });
          assert.ok(
            out instanceof StringWrapper,
            'returns a Trusted Type, not a plain string'
          );
          assert.equal(
            String(out),
            '<b>ok</b>',
            'wraps the sanitized result; script removed'
          );

          // The default path, exercised again across clearConfig(), must not
          // recreate the internal policy — Trusted Types throws on duplicates.
          DOMPurify.clearConfig();
          DOMPurify.sanitize('<b>again</b>', { RETURN_TRUSTED_TYPE: true });
          assert.equal(
            created.filter(function (name) {
              return name === 'dompurify';
            }).length,
            1,
            'internal dompurify policy created exactly once'
          );
        }
      );
    }
  );
};
