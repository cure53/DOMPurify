## What it this?

This is a collection of demos of how to use DOMPurify. When run without any additional configuration parameters, DOMPurify will reliably protect against XSS and DOM Clobbering attacks. But there is a lot of more things this library can do. For example proxy all HTTP resources, enhance accessibility, prevent links to open in the same window and more.

This collection of demos shows to same code for several different ways you can use DOMPurify. Please feel free to suggest additional demos if needed. All demos we have collected so far will be shown and explained below.

### Basic Demo

This is the most basic of all demos. It shows how you user DOMPurify and that's it. No configuration, no hooks, no extras.

This is the relevant code:
```javascript
// Clean HTML string and write into our DIV
var clean = DOMPurify.sanitize(dirty);
```

### Config Demo

This demo shows how to use the configuration object the right way. In this demo, we only permit `<p>` elements and we want to preserve their text, but not the content of nested elements inside the `<p>`.

This is the relevant code:
```javascript
// Specify a configuration directive, only <P> elements allowed
// Note: We want to also keep <p>'s text content, so we add #text too
var config = { ALLOWED_TAGS: ['p', '#text'], KEEP_CONTENT: false };

// Clean HTML string and write into our DIV
var clean = DOMPurify.sanitize(dirty, config);
```

### Advanced Config Demo

This demo shows, how we can use the configuration object to instruct DOMPurify to be more specific with what is to be permitted and what s not. We want to permit `<p>` elements and the fictional `<ying>` and `<yang>` tag. We also want to allow the `kitty-litter` attribute because why not - and make sure that a `document`-object is returned after sanitization - and not a plain string. 

This is the relevant code:
```javascript
// Specify a configuration directive
var config = {
    ALLOWED_TAGS: ['p', '#text'], // only <P> and text nodes
    KEEP_CONTENT: false, // remove content from non-white-listed nodes too
    ADD_ATTR: ['kitty-litter'], // permit kitty-litter attributes
    ADD_TAGS: ['ying', 'yang'], // permit additional custom tags
    RETURN_DOM: true // return a document object instead of a string
};

// Clean HTML string and write into our DIV
var clean = DOMPurify.sanitize(dirty, config);
```