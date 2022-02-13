window.alert = function () {
  window.xssed = true;
};

QUnit.assert.contains = function (actual, expected, message) {
  const result = expected.indexOf(actual) > -1;
  // Ref: https://api.qunitjs.com/assert/pushResult/
  this.pushResult(
    {
      result,
      actual,
      expected,
      message
    }
  );
};
