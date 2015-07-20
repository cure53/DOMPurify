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

This demo shows, how we can use the configuration object to instruct DOMPurify to be more specific with what is to be permitted and what s not. We want to permit `<p>` elements and the fictional `<ying>` and `<yang>` tag. We also want to allow the `kitty-litter` attribute because why not - and make sure that a `document`-object is returned after sanitation - and not a plain string. 

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

### Hooks Demo

DOMPurify allows you to use hooks. Hooks are basically scripts that can hook into certain parts of the DOMPurify code flow and do stuff. Stuff that you like to be done. By using hooks, you can literally make DOMPurify do whatever. To show you, how powerful and easy to use hooks are, we created some demos for you. Like this one, that essentially renders all tag content to be in capitals.

This is the relevant code:
```javascript
// Add a hook to convert all text to capitals
DOMPurify.addHook('beforeSanitizeAttributes', function(node){
    // Set text node content to uppercase
    if(node.nodeName && node.nodeName === '#text') {
        node.textContent=node.textContent.toUpperCase();
    }
});

// Clean HTML string and write into our DIV
var clean = DOMPurify.sanitize(dirty);
```

### Add hooks and remove hooks

A DOMPurify hook can also be removed in case you first need it and then you want to get rid of it right afterwards. This demo shows how you do that with ease and elegance.

This is the relevant code:
```javascript
// Add a hook to convert all text to capitals
DOMPurify.addHook('beforeSanitizeAttributes', function(node){
    // Set text node content to uppercase
    if(node.nodeName && node.nodeName === '#text') {
        node.textContent=node.textContent.toUpperCase();
    }
});

// Clean HTML string and write into our DIV
var clean = DOMPurify.sanitize(dirty);

// now let's remove the hook again
console.log(DOMPurify.removeHook('beforeSanitizeAttributes'));

// Clean HTML string and write into our DIV
var clean = DOMPurify.sanitize(dirty);
```

### Hook to open all links in a new window

This hook is an important one and used quite commonly. It is made to assure that all elements that can function as a link will open the linked page in a new tab or window. This is often of great importance in web mailers and other tools, where a click on a link is not supposed to navigate the original page but rather open another window or tab.

This is the relevant code:
```javascript
// Add a hook to make all links open a new window
DOMPurify.addHook('afterSanitizeAttributes', function(node){
    // set all elements owning target to target=_blank
    if('target' in node){
        node.setAttribute('target','_blank');
    }
    // set non-HTML/MathML links to xlink:show=new
    if(!node.hasAttribute('target') 
        && (node.hasAttribute('xlink:href') 
            || node.hasAttribute('href'))){
        node.setAttribute('xlink:show', 'new');
    }
});

// Clean HTML string and write into our DIV
var clean = DOMPurify.sanitize(dirty);
``` 

### Hook to white-list safe URI Schemes

Depending on where you show your sanitized HTML, different URI schemes might cause trouble. And in most situations, you only want to allow HTTP and HTTPS - but not any of those fancy URI schemes supported on mobile devices or even on the desktop with Windows 10. This hook demo shows how to easily make sure only HTTP and HTTP URIs are permitted while all others are eliminated for good.

Note that you might want to be more thorough, if not only links but also backgrounds and other attributes should be covered. We have an example later on to cover all these too.

This is the relevant code:
```javascript
// allowed URI schemes
var whitelist = ['http', 'https', 'ftp'];

// build fitting regex
var regex = RegExp('^('+whitelist.join('|')+'):', 'gim');

// Add a hook to enforce URI scheme whitelist
DOMPurify.addHook('afterSanitizeAttributes', function(node){

    // build an anchor to map URLs to
    var anchor = document.createElement('a');

    // check all href attributes for validity
    if(node.hasAttribute('href')){
        anchor.href  = node.getAttribute('href');
        if(anchor.protocol && !anchor.protocol.match(regex)){
            node.removeAttribute('href');
        }
    }
    // check all action attributes for validity
    if(node.hasAttribute('action')){
        anchor.href  = node.getAttribute('action');
        if(anchor.protocol && !anchor.protocol.match(regex)){
            node.removeAttribute('action');
        }
    }
    // check all xlink:href attributes for validity
    if(node.hasAttribute('xlink:href')){
        anchor.href  = node.getAttribute('xlink:href');
        if(anchor.protocol && !anchor.protocol.match(regex)){
            node.removeAttribute('xlink:href');
        }
    }
});

// Clean HTML string and write into our DIV
var clean = DOMPurify.sanitize(dirty);
```

### Hook to allow and sand-box all JavaScript

Okay, now this is real witch-craft! Imagine you want users to submit JavaScript but it should be sand-boxed. With a hook, you can actually do that. What we are doing here is permitting all JavaScript and event handlers, but take their contents and sand-box it using Gareth Heyes' [MentalJS](https://github.com/hackvertor/MentalJS) library. The hook shows how do to this safely. 

Be careful though, this is playing with fire. If you want to use this in production, better give us a quick ping to see if all is really working as desired.

This is the relevant code:
```javascript
// allow script elements
var config = { 
    ADD_TAGS: ['script'], 
    ADD_ATTR: ['onclick', 'onmouseover', 'onload', 'onunload']
}            

// Add a hook to sanitize all script content with MentalJS
DOMPurify.addHook('uponSanitizeElement', function(node, data){
    if(data.tagName === 'script'){
        var script = node.textContent;
        if(!script || 'src' in node.attributes
            || 'href' in node.attributes 
            || 'xlink:href' in node.attributes){
                return node.parentNode.removeChild(node)
        }
        try {
            var mental = MentalJS().parse(
                {options:{eval:false, dom:true}, code:script}
            );
            return node.textContent = mental;
        } catch(e) {
            return node.parentNode.removeChild(node);
        }
    }
});

// Add a hook to sanitize all white-listed events with MentalJS
DOMPurify.addHook('uponSanitizeAttribute', function(node, data){
    if(data.attrName.match(/^on\w+/)) {
        var script = data.attrValue;
        try {
            return data.attrValue = MentalJS().parse(
                {options:{eval:false, dom:true}, code:script}
            );
        } catch(e) {
            return data.attrValue = '';
        }
    }
});            

// Clean HTML string and write into our DIV
var clean = DOMPurify.sanitize(dirty, config);
```   