DOMPurify
=========

DOMPurify is a DOM-only, super-fast, uber-tolerant XSS sanitizer for HTML, MathML and SVG. It's written in JavaScript and works in all modern browsers (Safari, Opera (15+), Internet Explorer (9+), Firefox and Chrome - as well as almost anything else using Blink or Webkit). DOMPurify is written by security people who have vast background in web-attacks and XSS. Fear not.

### What does it do?

DOMPurify sanitizes HTML and prevents XSS attacks. You can feed DOMPurify with string full of dirty HTML and it will return a string with clean HTML. DOMPurify will strip out everything that contains dangerous HTML and thereby prevent XSS attacks and other nastiness. It's also damn bloody fast. We use the technologies the browser provides and turn them into an XSS filter. The faster your browser, the faster DOMPurify will be.

### How do I use it?

It's easy. Just include DOMPurify on your website. Afterwards you can sanitiize strings by executing the following code:

```javascript
var clean = DOMPurify.sanitize(dirty);
```

### Is there a demo?

Of course there is a demo! [Play with DOMPurify](https://cure53.de/purify)

### What is supported?

We currently support HTML5, SVG and MathML. DOMPurify per default allows CSS, HTML custom data attributes. We also support the Shadow DOM - and sanitize DOM templates recursively.

### Can I configure it?

Sure, right now you can simply customize the file and change what tags you allow, what attributes are permitted, whether you want to allow HTML custom data attributes.

Later versions will allow you to configure DOMPurify by passing in a configuration object where you can specify on your own what HTML you want to permit and what should be removed.

### What's on the road-map?

A lot. We want to support as many safe tags and attributes as possible. Currently, we work on extending the MathML & SVG support. Future versions will also allow to pass in a DOM or HTML element, get a DOM or an element back, reliably prevent leakage via HTTP requests, proxy HTTP requests etc. etc.

### Who contributed?

Several people need to be listed here! [@garethheyes](https://twitter.com/garethheyes) for invaluable help, [@shafigullin](https://twitter.com/shafigullin) for breaking the library multiple times and thereby strengthening it, [@mmrupp](https://twitter.com/mmrupp) for doing the same. Thanks also go to [@cgvwzq](https://twitter.com/cgvwzq) and [@giutro](https://twitter.com/giutro)!
