const sample = require('lodash.sample');
const argv = require('minimist')(process.argv.slice(2));
const isArray = require('lodash.isarray');

const customLaunchers = {
  bs_win10_chrome_59: {
    base: 'BrowserStack',
    device: null,
    os: 'Windows',
    browser_version: '59.0',
    browser: 'chrome',
    os_version: '10',
  },
};

const getAllBrowsers = () => Object.keys(customLaunchers);
const getRandomBrowser = () => sample(getAllBrowsers());

/**
 * Environment variables are passed into the script and the depth of testing
 * is affected accordginly.
 *
 * - Whenever on a PR we only want to probe test with Firefox
 * - Whenever we are on the most recent node version on Travis we test via BrowserStack
 * - If none of the prior mentioned holds we assume to be running local and respect the passed
 *   in borwsers argv
 */
const shouldProbeOnly = argv.shouldProbeOnly !== '';
const shouldTestOnBrowserStack = argv.shouldTestOnBrowserStack !== '';
const defaultBrowsers = ['Firefox'];
const argvBrowsers = isArray(argv.browsers)
  ? argv.browsers.split(' ')
  : defaultBrowsers;
const browsers = shouldTestOnBrowserStack
  ? shouldProbeOnly ? defaultBrowsers : getAllBrowsers()
  : argvBrowsers;

module.exports = {
  customLaunchers,
  browsers,
  getRandomBrowser,
};
