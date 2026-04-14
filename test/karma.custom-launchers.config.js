const argv = require('minimist')(process.argv.slice(2));

const customLaunchers = {
  bs_iphone_16_safari: {
	base: 'BrowserStack',
	device: 'iPhone 16',
	real_mobile: true,
	browser: 'safari',
	os_version: '18',
  },
  bs_s23_chrome: {
	base: 'BrowserStack',
	device: 'Samsung Galaxy S23 Ultra',
	real_mobile: true,
	browser: 'chrome',
	os_version: '13.0',
  },
  bs_sequoia_safari_latest: {
	base: 'BrowserStack',
	device: null,
	os: 'OS X',
	browser: 'safari',
	browser_version: 'latest',
    os_version: 'Sequoia',
  },	
  bs_tahoe_safari_latest: {
    base: 'BrowserStack',
    device: null,
    os: 'OS X',
    browser_version: 'latest',
    browser: 'safari',
    os_version: 'Tahoe',
  },
  bs_win11_edge_latest_minus_3: {
    base: 'BrowserStack',
    device: null,
    os: 'Windows',
    browser_version: 'latest - 3',
    browser: 'edge',
    os_version: '11',
  },
  bs_win11_edge_latest_minus_2: {
    base: 'BrowserStack',
    device: null,
    os: 'Windows',
    browser_version: 'latest - 2',
    browser: 'edge',
    os_version: '11',
  },
  bs_win11_edge_latest_minus_1: {
    base: 'BrowserStack',
    device: null,
    os: 'Windows',
    browser_version: 'latest - 1',
    browser: 'edge',
    os_version: '11',
  },
  bs_win11_edge_latest: {
    base: 'BrowserStack',
    device: null,
    os: 'Windows',
    browser_version: 'latest',
    browser: 'edge',
    os_version: '11',
  },
  bs_win11_firefox_latest_minus_3: {
    base: 'BrowserStack',
    device: null,
    os: 'Windows',
    browser_version: 'latest - 3',
    browser: 'firefox',
    os_version: '11',
  },
  bs_win11_firefox_latest_minus_2: {
    base: 'BrowserStack',
    device: null,
    os: 'Windows',
    browser_version: 'latest - 2',
    browser: 'firefox',
    os_version: '11',
  },
  bs_win11_firefox_latest_minus_1: {
    base: 'BrowserStack',
    device: null,
    os: 'Windows',
    browser_version: 'latest - 1',
    browser: 'firefox',
    os_version: '11',
  },
  bs_win11_firefox_latest: {
    base: 'BrowserStack',
    device: null,
    os: 'Windows',
    browser_version: 'latest',
    browser: 'firefox',
    os_version: '11',
  },
  bs_win11_chrome_latest_minus_3: {
    base: 'BrowserStack',
    device: null,
    os: 'Windows',
    browser_version: 'latest - 3',
    browser: 'chrome',
    os_version: '11',
  },
  bs_win11_chrome_latest_minus_2: {
    base: 'BrowserStack',
    device: null,
    os: 'Windows',
    browser_version: 'latest - 2',
    browser: 'chrome',
    os_version: '11',
  },
  bs_win11_chrome_latest_minus_1: {
    base: 'BrowserStack',
    device: null,
    os: 'Windows',
    browser_version: 'latest - 1',
    browser: 'chrome',
    os_version: '11',
  },
  bs_win11_chrome_latest: {
    base: 'BrowserStack',
    device: null,
    os: 'Windows',
    browser_version: 'latest',
    browser: 'chrome',
    os_version: '11',
  },
};

const getAllBrowsers = () => Object.keys(customLaunchers);
const getRandomBrowser = () => {
  const browsers = getAllBrowsers();
  const randomIndex = Math.floor(Math.random() * browsers.length);
  return browsers[randomIndex];
};

/**
 * Environment variables are passed into the script and the depth of testing
 * is affected accordingly.
 *
 * - Whenever on a PR we only want to probe test with Firefox
 * - Whenever we are on the most recent node version on GitHub Actions we test via BrowserStack
 * - If none of the prior mentioned holds we assume to be running local and respect the passed
 *   in browsers argv
 */
const shouldProbeOnly = argv.shouldProbeOnly === 'true';
const shouldTestOnBrowserStack = argv.shouldTestOnBrowserStack === 'true';
const defaultBrowsers = ['Firefox'];
const argvBrowsers = Array.isArray(argv.browsers)
  ? argv.browsers.split(' ')
  : defaultBrowsers;
const browsers = shouldTestOnBrowserStack
  ? shouldProbeOnly
    ? defaultBrowsers
    : getAllBrowsers()
  : argvBrowsers;

module.exports = {
  customLaunchers,
  browsers,
  getRandomBrowser,
};
