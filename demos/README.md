## What is this?

This is a collection of demos of how to use DOMPurify. When run without any additional configuration parameters, DOMPurify will reliably protect against XSS and DOM Clobbering attacks. But there is a lot of more things this library can do. For example proxy all HTTP resources, enhance accessibility, prevent links to open in the same window, allow and sand-box JavaScript and more.

This collection of demos shows to same code for several different ways you can use DOMPurify. Please feel free to suggest additional demos if needed. All demos we have collected so far will be shown and explained below.

### Basic Demo [Link](basic-demo.html)

This is the most basic of all demos. It shows how you user DOMPurify and that's it. No configuration, no hooks, no extras. Just DOMPurify running with default settings.

This is the relevant code:

```javascript
// Clean HTML string and write into our DIV
const clean = DOMPurify.sanitize(dirty);
```

### Config Demo [Link](config-demo.html)

This demo shows how to use the configuration object the right way. In this demo, we only permit `<p>` elements and we want to preserve their text, but not the content of nested elements inside the `<p>`.

This is the relevant code:

```javascript
// Specify a configuration directive, only <P> elements allowed
// Note: We want to also keep <p>'s text content, so we add #text too
const config = { ALLOWED_TAGS: ['p', '#text'], KEEP_CONTENT: false };

// Clean HTML string and write into our DIV
const clean = DOMPurify.sanitize(dirty, config);
```

### Advanced Config Demo [Link](advanced-config-demo.html)

This demo shows, how we can use the configuration object to instruct DOMPurify to be more specific with what is to be permitted and what is not. We want to permit `<p>` elements and the fictional `<ying>` and `<yang>` tag. We also want to allow the `kitty-litter` attribute because why not - and make sure that a `document`-object is returned after sanitation - and not a plain string.

This is the relevant code:

```javascript
// Specify a configuration directive
const config = {
  ALLOWED_TAGS: ['p', '#text'], // only <P> and text nodes
  KEEP_CONTENT: false, // remove content from non-allow-listed nodes too
  ADD_ATTR: ['kitty-litter'], // permit kitty-litter attributes
  ADD_TAGS: ['ying', 'yang'], // permit additional custom tags
  RETURN_DOM: true, // return a document object instead of a string
};

// Clean HTML string and write into our DIV
const clean = DOMPurify.sanitize(dirty, config);
```

### Hooks Demo [Link](hooks-demo.html)

DOMPurify allows you to use hooks. Hooks are basically scripts that can hook into certain parts of the DOMPurify code flow and do stuff. Stuff that you like to be done. By using hooks, you can literally make DOMPurify do whatever. To show you, how powerful and easy to use hooks are, we created some demos for you. Like this one, that essentially renders all tag content to be in capitals.

This is the relevant code:

```javascript
// Add a hook to convert all text to capitals
DOMPurify.addHook('beforeSanitizeAttributes', function (node) {
  // Set text node content to uppercase
  if (node.nodeName && node.nodeName === '#text') {
    node.textContent = node.textContent.toUpperCase();
  }
});

// Clean HTML string and write into our DIV
const clean = DOMPurify.sanitize(dirty);
```

### Add hooks and remove hooks [Link](hooks-removal-demo.html)

A DOMPurify hook can also be removed in case you first need it and then you want to get rid of it right afterwards. This demo shows how you do that with ease and elegance.

This is the relevant code:

```javascript
// Add a hook to convert all text to capitals
DOMPurify.addHook('beforeSanitizeAttributes', function (node) {
  // Set text node content to uppercase
  if (node.nodeName && node.nodeName === '#text') {
    node.textContent = node.textContent.toUpperCase();
  }
});

// Clean HTML string and write into our DIV
let clean = DOMPurify.sanitize(dirty);

// now let's remove the hook again
console.log(DOMPurify.removeHook('beforeSanitizeAttributes'));

// Clean HTML string and write into our DIV
let clean = DOMPurify.sanitize(dirty);
```

### Hook to open all links in a new window [Link](hooks-target-blank-demo.html)

This hook is an important one and used quite commonly. It is made to assure that all elements that can function as a link will open the linked page in a new tab or window. This is often of great importance in web mailers and other tools, where a click on a link is not supposed to navigate the original page but rather open another window or tab.

This is the relevant code:

```javascript
// Add a hook to make all links open a new window
DOMPurify.addHook('afterSanitizeAttributes', function (node) {
  // set all elements owning target to target=_blank
  if ('target' in node) {
    node.setAttribute('target', '_blank');
  }
  // set non-HTML/MathML links to xlink:show=new
  if (
    !node.hasAttribute('target') &&
    (node.hasAttribute('xlink:href') || node.hasAttribute('href'))
  ) {
    node.setAttribute('xlink:show', 'new');
  }
});

// Clean HTML string and write into our DIV
const clean = DOMPurify.sanitize(dirty);
```

### Hook to white-list safe URI Schemes [Link](hooks-scheme-allowlist.html)

Depending on where you show your sanitized HTML, different URI schemes might cause trouble. And in most situations, you only want to allow HTTP and HTTPS - but not any of those fancy URI schemes supported on mobile devices or even on the desktop with Windows 10. This hook demo shows how to easily make sure only HTTP, HTTPS and FTP URIs are permitted while all others are eliminated for good.

Note that you might want to be more thorough, if not only links but also backgrounds and other attributes should be covered. We have an example later on to [cover all these too](hooks-proxy-demo.html).

This is the relevant code:

```javascript
// allowed URI schemes
const allowlist = ['http', 'https', 'ftp'];

// build fitting regex
const regex = RegExp('^(' + allowlist.join('|') + '):', 'gim');

// Add a hook to enforce URI scheme allow-list
DOMPurify.addHook('afterSanitizeAttributes', function (node) {
  // build an anchor to map URLs to
  const anchor = document.createElement('a');

  // check all href attributes for validity
  if (node.hasAttribute('href')) {
    anchor.href = node.getAttribute('href');
    if (anchor.protocol && !anchor.protocol.match(regex)) {
      node.removeAttribute('href');
    }
  }
  // check all action attributes for validity
  if (node.hasAttribute('action')) {
    anchor.href = node.getAttribute('action');
    if (anchor.protocol && !anchor.protocol.match(regex)) {
      node.removeAttribute('action');
    }
  }
  // check all xlink:href attributes for validity
  if (node.hasAttribute('xlink:href')) {
    anchor.href = node.getAttribute('xlink:href');
    if (anchor.protocol && !anchor.protocol.match(regex)) {
      node.removeAttribute('xlink:href');
    }
  }
});

// Clean HTML string and write into our DIV
const clean = DOMPurify.sanitize(dirty);
```

### Hook to allow and sand-box all JavaScript [Link](hooks-mentaljs-demo.html)

Okay, now this is real witch-craft! Imagine you want users to submit JavaScript but it should be sand-boxed. With a hook, you can actually do that. What we are doing here is permitting all JavaScript and event handlers, but take their contents and sand-box it using Gareth Heyes' amazing [MentalJS](https://github.com/hackvertor/MentalJS) library. The hook shows how do to this safely.

Be careful though, this is playing with fire. If you want to use this in production, better give us a quick ping to see if all is really working as desired.

This is the relevant code:

```javascript
// allow script elements
const config = {
  ADD_TAGS: ['script'],
  ADD_ATTR: ['onclick', 'onmouseover', 'onload', 'onunload'],
};

// Add a hook to sanitize all script content with MentalJS
DOMPurify.addHook('uponSanitizeElement', function (node, data) {
  if (data.tagName === 'script') {
    let script = node.textContent;
    if (
      !script ||
      'src' in node.attributes ||
      'href' in node.attributes ||
      'xlink:href' in node.attributes
    ) {
      return node.parentNode.removeChild(node);
    }
    try {
      let mental = MentalJS().parse({
        options: {
          eval: false,
          dom: true,
        },
        code: script,
      });
      return (node.textContent = mental);
    } catch (e) {
      return node.parentNode.removeChild(node);
    }
  }
});

// Add a hook to sanitize all white-listed events with MentalJS
DOMPurify.addHook('uponSanitizeAttribute', function (node, data) {
  if (data.attrName.match(/^on\w+/)) {
    let script = data.attrValue;
    try {
      return (data.attrValue = MentalJS().parse({
        options: {
          eval: false,
          dom: true,
        },
        code: script,
      }));
    } catch (e) {
      return (data.attrValue = '');
    }
  }
});

// Clean HTML string and write into our DIV
const clean = DOMPurify.sanitize(dirty, config);
```

### Hook to proxy all links [Link](hooks-link-proxy-demo.html)

DOMPurify itself permits links to all resources that don't cause XSS. That includes pretty much all URI schemes and of course HTTP and HTTPS links. Yet, often, preventing XSS is not everything you want to do. And a common use case for a sanitizer is to also proxy all existing links on a website to make sure a de-referrer is used or the website owner has more control over what links are pointing where - to avoid referrer leaks, attacks using window.opener and alike. This hook shows, how all out-bound links can easily be proxied for maximum safety.

This is the relevant code:

```javascript
// Add a hook to make all links point to a proxy
DOMPurify.addHook('afterSanitizeAttributes', function (node) {
  // proxy form actions
  if ('action' in node) {
    node.setAttribute(
      'action',
      proxy + encodeURIComponent(node.getAttribute('action'))
    );
  }
  // proxy regular HTML links
  if (node.hasAttribute('href')) {
    node.setAttribute(
      'href',
      proxy + encodeURIComponent(node.getAttribute('href'))
    );
  }
  // proxy SVG/MathML links
  if (node.hasAttribute('xlink:href')) {
    node.setAttribute(
      'xlink:href',
      proxy + encodeURIComponent(node.getAttribute('xlink:href'))
    );
  }
});

// Clean HTML string and write into our DIV
const clean = DOMPurify.sanitize(dirty);
```

### Hook to proxy all HTTP leaks including CSS [Link](hooks-proxy-demo.html)

Now this is a hook you don't talk about on your first date. This monster has the purpose of proxying **all** known [HTTP leaks](https://github.com/cure53/HTTPLeaks) including the ones hidden in CSS. It proxies HTML, CSS rules, in-line styles, `@media` rules, `@font-face` rules and `@keyframes`. It further eliminates `@charset` and `@import` as they both help carrying out XSS attacks. This hook is supposed to be a comprehensive demo on how to cover each and every HTTP leak. That's why the amount of code is a bit higher than usual.

When ever you want to reliably filter HTML and CSS using DOMPurify, this is the way to go. How to try the demo? Run the HTML file linked above in your browser and have a look at the network tab of your favorite debugger. You will see that all external resources are proxied. If not then you found a bug.

This is the relevant code:

```javascript
// Specify proxy URL
const proxy = 'https://my.proxy/?url=';

// What do we allow? Not much for now. But it's tight.
const config = {
  FORBID_TAGS: ['svg'],
  WHOLE_DOCUMENT: true,
};

// Specify attributes to proxy
const attributes = ['action', 'background', 'href', 'poster', 'src', 'srcset']

// specify the regex to detect external content
const regex = /(url\("?)(?!data:)/gim;

/**
 *  Take CSS property-value pairs and proxy URLs in values,
 *  then add the styles to an array of property-value pairs
 */
function addStyles(output, styles) {
  for (let prop = styles.length - 1; prop >= 0; prop--) {
    if (styles[styles[prop]]) {
      let url = styles[styles[prop]].replace(regex, '$1' + proxy);
      styles[styles[prop]] = url;
    }
    if (styles[styles[prop]]) {
      output.push(styles[prop] + ':' + styles[styles[prop]] + ';');
    }
  }
}

/**
 * Take CSS rules and analyze them, proxy URLs via addStyles(),
 * then create matching CSS text for later application to the DOM
 */
function addCSSRules(output, cssRules) {
  for (let index = cssRules.length - 1; index >= 0; index--) {
    let rule = cssRules[index];
    // check for rules with selector
    if (rule.type == 1 && rule.selectorText) {
      output.push(rule.selectorText + '{');
      if (rule.style) {
        addStyles(output, rule.style);
      }
      output.push('}');
      // check for @media rules
    } else if (rule.type === rule.MEDIA_RULE) {
      output.push('@media ' + rule.media.mediaText + '{');
      addCSSRules(output, rule.cssRules);
      output.push('}');
      // check for @font-face rules
    } else if (rule.type === rule.FONT_FACE_RULE) {
      output.push('@font-face {');
      if (rule.style) {
        addStyles(output, rule.style);
      }
      output.push('}');
      // check for @keyframes rules
    } else if (rule.type === rule.KEYFRAMES_RULE) {
      output.push('@keyframes ' + rule.name + '{');
      for (let i = rule.cssRules.length - 1; i >= 0; i--) {
        let frame = rule.cssRules[i];
        if (frame.type === 8 && frame.keyText) {
          output.push(frame.keyText + '{');
          if (frame.style) {
            addStyles(output, frame.style);
          }
          output.push('}');
        }
      }
      output.push('}');
    }
  }
}

/**
 * Proxy a URL in case it's not a Data URI
 */
function proxyAttribute(url) {
  if (/^data:image\//.test(url)) {
    return url;
  } else {
    return proxy + escape(url);
  }
}

// Add a hook to enforce proxy for leaky CSS rules
DOMPurify.addHook('uponSanitizeElement', function (node, data) {
  if (data.tagName === 'style') {
    let output = [];
    addCSSRules(output, node.sheet.cssRules);
    node.textContent = output.join('\n');
  }
});

// Add a hook to enforce proxy for all HTTP leaks incl. inline CSS
DOMPurify.addHook('afterSanitizeAttributes', function (node) {
  // Check all src attributes and proxy them
  for (let i = 0; i <= attributes.length - 1; i++) {
    if (node.hasAttribute(attributes[i])) {
      node.setAttribute(
        attributes[i],
        proxyAttribute(node.getAttribute(attributes[i]))
      );
    }
  }

  // Check all style attribute values and proxy them
  if (node.hasAttribute('style')) {
    let styles = node.style;
    let output = [];
    for (let prop = styles.length - 1; prop >= 0; prop--) {
      // we re-write each property-value pair to remove invalid CSS
      if (node.style[styles[prop]] && regex.test(node.style[styles[prop]])) {
        let url = node.style[styles[prop]].replace(regex, '$1' + proxy);
        node.style[styles[prop]] = url;
      }
      output.push(styles[prop] + ':' + node.style[styles[prop]] + ';');
    }
    // re-add styles in case any are left
    if (output.length) {
      node.setAttribute('style', output.join(''));
    } else {
      node.removeAttribute('style');
    }
  }
});

// Clean HTML string and write into our DIV
const clean = DOMPurify.sanitize(dirty, config);
```

### Hook to sanitize SVGs shown via an `<img>` tag. [Link](hooks-svg-demo.html)

DOMPurify can be used to sanitize SVGs, but there can be some issues with some of their content and that can be solved via custom hooks and parsing. Also, it's possible to allow some tags which are disabled by default when showing SVGs via an `<img>` tag.

Here is an example which works well for content generated by Illustrator:

```javascript
// Add a hook to post-process a sanitized SVG
DOMPurify.addHook('afterSanitizeAttributes', function (node) {
  // Fix namespaces added by Adobe Illustrator
  node.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  node.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
});

// Clean SVG string and allow the "filter" tag
const clean = DOMPurify.sanitize(dirty, { ADD_TAGS: ['filter'] });

// Remove partial XML comment left in the HTML
let badTag = clean.indexOf(']&gt;');
let pureSvg = clean.substring(badTag < 0 ? 0 : 5, clean.length);

// Show sanitized content in <img> element
let img = new Image();
img.src = 'data:image/svg+xml;base64,' + window.btoa(pureSvg);
document.getElementById('sanitized').appendChild(img);
```
