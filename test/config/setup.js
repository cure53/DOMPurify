window.alert = function () {
  window.xssed = true;
};

QUnit.assert.contains = function (needle, haystack, message) {
  var result = haystack.indexOf(needle) > -1;
  QUnit.push(result, needle, haystack, message);
};
