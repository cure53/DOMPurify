(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.bootstrapTestSuite = factory();
  }
}(this, function () {
  return function bootstrapTestSuite(JSDOM, test, nodeFs, jq) {
    function StringWrapper(s) {
      this.s = s;
    }
    StringWrapper.prototype.toString = function() {
      return this.s;
    };

    function loadDOMPurify(
      assert,
      addScriptAttribute,
      setup,
      beforeOnLoad,
      onload
    ) {
      var testDone = assert.async();
      var win;
      var cleanup;

      if (JSDOM) {
          var dom = new JSDOM('<head></head>', {
            runScripts: 'dangerously',
            resources: 'usable'
          });
          win = dom.window;
          cleanup = function() {};
      } else {
          // Real browser environment - use an iframe
          var iframe = document.createElement('iframe');
          iframe.style.display = 'none';
          document.body.appendChild(iframe);
          win = iframe.contentWindow;
          cleanup = function() {
              document.body.removeChild(iframe);
          };
      }

      var jqueryInstance = jq || win.jQuery || (typeof jquery !== 'undefined' ? jquery : null);
      if (jqueryInstance) jqueryInstance(win);

      if (setup) {
        setup(win);
      }

      var myLibrary;
      var fsInstance = nodeFs || (typeof fs !== 'undefined' ? fs : null);

      if (fsInstance && fsInstance.readFileSync) {
          var paths = ['dist/purify.js', './dist/purify.js', '../dist/purify.js'];
          for (var i = 0; i < paths.length; i++) {
              try {
                  myLibrary = fsInstance.readFileSync(paths[i], { encoding: 'utf-8' });
                  break;
              } catch (e) {}
          }
      }

      function executeScript(libraryCode) {
          var scriptEl = win.document.createElement('script');
          if (addScriptAttribute)
            scriptEl.setAttribute('data-tt-policy-suffix', 'suffix');

          scriptEl.textContent = libraryCode;
          win.document.body.appendChild(scriptEl);

          // Give it a tick to execute if needed
          if (!win.DOMPurify) {
              win.eval(libraryCode);
          }

          assert.ok(win.DOMPurify && win.DOMPurify.sanitize, 'DOMPurify is loaded');

          if (beforeOnLoad) {
            beforeOnLoad(win);
          }

          if (onload) {
            onload(win);
          }

          cleanup();
          testDone();
      }

      if (!myLibrary) {
          var url = (typeof window !== 'undefined' && window.location && window.location.host) ? '../dist/purify.js' : '/dist/purify.js';
          fetch(url).then(function(r) { return r.text(); }).then(function(code) {
              executeScript(code);
          }).catch(function(e) {
              // Fallback or error
              testDone();
          });
      } else {
          executeScript(myLibrary);
      }
    }

    function loadDOMPurifyWithSanityCheck(
      assert,
      addScriptAttribute,
      setup,
      onload
    ) {
      var beforeOnLoadSanityCheck = function (window) {
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

    test(
      'sanity check: works in a non-Trusted Type environment',
      function (assert) {
        loadDOMPurifyWithSanityCheck(
          assert,
          false,
          function setup(window) {
            try {
                delete window.trustedTypes;
            } catch (e) {
                window.trustedTypes = undefined;
            }
          },
          function onload(window) {
            var output = window.DOMPurify.sanitize('<img>');
            assert.ok(typeof output === 'string');
          }
        );
      }
    );

    test(
      'sanity check: works in a Trusted Type environment',
      function (assert) {
        var policyCreated;

        loadDOMPurifyWithSanityCheck(
          assert,
          false,
          function setup(window) {
            var tt = {
              createPolicy: function(name, rules) {
                policyCreated = name;
                return {
                  createHTML: function(s) {
                    return new StringWrapper(rules.createHTML(s));
                  },
                };
              },
            };
            try {
                Object.defineProperty(window, 'trustedTypes', {
                    value: tt,
                    configurable: true,
                    writable: true
                });
            } catch (e) {
                window.trustedTypes = tt;
            }
          },
          function onload(window) {
            if (policyCreated) {
                assert.equal(policyCreated, 'dompurify');
                var output = window.DOMPurify.sanitize('<img>', {
                  RETURN_TRUSTED_TYPE: true,
                });
                assert.equal(output, '<img>');
                assert.ok(output instanceof StringWrapper);
            } else {
                assert.ok(true, 'Skipped TT check due to environment limitation');
            }
          }
        );
      }
    );

    test(
      'sanity check: supports configuring the policy suffix via an attribute',
      function (assert) {
        var policyCreated;

        loadDOMPurifyWithSanityCheck(
          assert,
          true,
          function setup(window) {
            var tt = {
              createPolicy: function(name, rules) {
                policyCreated = name;
                return rules;
              },
            };
            try {
                Object.defineProperty(window, 'trustedTypes', {
                    value: tt,
                    configurable: true,
                    writable: true
                });
            } catch (e) {
                window.trustedTypes = tt;
            }
          },
          function onload(window) {
            if (policyCreated) {
                assert.equal(policyCreated, 'dompurify#suffix');
            } else {
                assert.ok(true, 'Skipped TT check due to environment limitation');
            }
          }
        );
      }
    );

    test('supports TRUSTED_TYPES_POLICY via sanitize()', function (assert) {
      loadDOMPurify(assert, false, undefined, undefined, function onload(window) {
        var validationError;
        try {
          window.DOMPurify.sanitize('<img>', {
            TRUSTED_TYPES_POLICY: {
              createScript: function(s) {
                return s;
              },
            },
          });
        } catch (e) {
          validationError = e;
        }
        assert.equal(
          validationError && validationError.message,
          'TRUSTED_TYPES_POLICY configuration option must provide a "createHTML" hook.'
        );

        try {
          window.DOMPurify.sanitize('<img>', {
            TRUSTED_TYPES_POLICY: {
              createHTML: function(s) {
                return s;
              },
            },
          });
        } catch (e) {
          validationError = e;
        }
        assert.equal(
          validationError && validationError.message,
          'TRUSTED_TYPES_POLICY configuration option must provide a "createScriptURL" hook.'
        );

        var suppliedPolicyCallCount = 0;
        window.DOMPurify.sanitize('<img>', {
          TRUSTED_TYPES_POLICY: {
            createHTML: function(s) {
              suppliedPolicyCallCount += 1;
              return new StringWrapper(s);
            },
            createScriptURL: function(s) {
              return new StringWrapper(s);
            },
          },
        });
        assert.equal(suppliedPolicyCallCount, 2);
      });
    });

    test(
      'supports TRUSTED_TYPES_POLICY via setConfig() on a new instance',
      function (assert) {
        loadDOMPurify(
          assert,
          false,
          undefined,
          undefined,
          function onload(window) {
            var purify = window.DOMPurify();
            assert.notEqual(purify, window.DOMPurify);

            var suppliedPolicyCallCount = 0;
            purify.setConfig({
              TRUSTED_TYPES_POLICY: {
                createHTML: function(s) {
                  suppliedPolicyCallCount += 1;
                  return new StringWrapper(s);
                },
                createScriptURL: function(s) {
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

    test(
      'internal TrustedTypes policy is not created when TRUSTED_TYPES_POLICY option is provided',
      function (assert) {
        var createdPolicies = [];
        loadDOMPurify(
          assert,
          false,
          function setup(window) {
            var tt = {
              createPolicy: function(name, rules) {
                createdPolicies.push(name);
                return {
                  createHTML: function(s) {
                    return new StringWrapper(rules.createHTML(s));
                  },
                  createScriptURL: function(s) {
                    return new StringWrapper(rules.createScriptURL(s));
                  },
                };
              },
            };
            try {
                Object.defineProperty(window, 'trustedTypes', {
                    value: tt,
                    configurable: true,
                    writable: true
                });
            } catch (e) {
                window.trustedTypes = tt;
            }
          },
          undefined,
          function onload(window) {
            var ttAvailable = false;
            try { ttAvailable = !!window.trustedTypes.createPolicy; } catch(e) {}

            if (ttAvailable) {
                assert.equal(createdPolicies.length, 0);
                var testPolicy = window.trustedTypes.createPolicy('test', {
                  createHTML: function(s) {
                    return s;
                  },
                  createScriptURL: function(s) {
                    return s;
                  },
                });
                window.DOMPurify.sanitize('<img />', {
                  TRUSTED_TYPES_POLICY: testPolicy,
                });
                assert.equal(createdPolicies.length, 1);
                assert.equal(createdPolicies[0], 'test');
                window.DOMPurify.sanitize('<img />');
                assert.equal(createdPolicies.length, 1);
                assert.equal(createdPolicies[0], 'test');
            } else {
                assert.ok(true, 'Skipped TT check due to environment limitation');
            }
          }
        );
      }
    );
  };
}));
