;(function(factory) {
    'use strict';
    /* global window: false, define: false, module: false */
    var root = typeof window === 'undefined' ? null : window;

    if (typeof define === 'function' && define.amd) {
        define(function(){ return factory(root); });
    } else if (typeof module !== 'undefined') {
        module.exports = factory(root);
    } else {
        root.DOMPurify = factory(root);
    }
}(function factory(window) {
    'use strict';

    var DOMPurify = function(window) {
        return factory(window);
    };

    /**
     * Version label, exposed for easier checks
     * if DOMPurify is up to date or not
     */
    DOMPurify.version = '0.7.4';

    if (!window || !window.document || window.document.nodeType !== 9) {
        // not running in a browser, provide a factory function
        // so that you can pass your own Window
        DOMPurify.isSupported = false;
        return DOMPurify;
    }

    var document = window.document;
    var originalDocument = document;
    var DocumentFragment = window.DocumentFragment;
    var HTMLTemplateElement = window.HTMLTemplateElement;
    var NodeFilter = window.NodeFilter;
    var NamedNodeMap = window.NamedNodeMap || window.MozNamedAttrMap;
    var Text = window.Text;
    var Comment = window.Comment;
    var DOMParser = window.DOMParser;

    // As per issue #47, the web-components registry is inherited by a
    // new document created via createHTMLDocument. As per the spec
    // (http://w3c.github.io/webcomponents/spec/custom/#creating-and-passing-registries)
    // a new empty registry is used when creating a template contents owner
    // document, so we use that as our parent document to ensure nothing
    // is inherited.
    if (typeof HTMLTemplateElement === 'function') {
        var template = document.createElement('template');
        if (template.content && template.content.ownerDocument) {
            document = template.content.ownerDocument;
        }
    }
    var implementation = document.implementation;
    var createNodeIterator = document.createNodeIterator;
    var getElementsByTagName = document.getElementsByTagName;
    var createDocumentFragment = document.createDocumentFragment;
    var importNode = originalDocument.importNode;

    var hooks = {};

    /**
     * Expose whether this browser supports running the full DOMPurify.
     */
    DOMPurify.isSupported =
        typeof implementation.createHTMLDocument !== 'undefined' &&
        document.documentMode !== 9;

    /* Add properties to a lookup table */
    var _addToSet = function(set, array) {
        var l = array.length;
        while (l--) {
            if (typeof array[l] === 'string') {
                array[l] = array[l].toLowerCase();
            }
            set[array[l]] = true;
        }
        return set;
    };

    /* Shallow clone an object */
    var _cloneObj = function(object) {
        var newObject = {};
        var property;
        for (property in object) {
            if (object.hasOwnProperty(property)) {
                newObject[property] = object[property];
            }
        }
        return newObject;
    };

    /**
     * We consider the elements and attributes below to be safe. Ideally
     * don't add any new ones but feel free to remove unwanted ones.
     */

    /* allowed element names */
    var ALLOWED_TAGS = null;
    var DEFAULT_ALLOWED_TAGS = _addToSet({}, [

        // HTML
        'a','abbr','acronym','address','area','article','aside','audio','b',
        'bdi','bdo','big','blink','blockquote','body','br','button','canvas',
        'caption','center','cite','code','col','colgroup','content','data',
        'datalist','dd','decorator','del','details','dfn','dir','div','dl','dt',
        'element','em','fieldset','figcaption','figure','font','footer','form',
        'h1','h2','h3','h4','h5','h6','head','header','hgroup','hr','html','i',
        'img','input','ins','kbd','label','legend','li','main','map','mark',
        'marquee','menu','menuitem','meter','nav','nobr','ol','optgroup',
        'option','output','p','pre','progress','q','rp','rt','ruby','s','samp',
        'section','select','shadow','small','source','spacer','span','strike',
        'strong','style','sub','summary','sup','table','tbody','td','template',
        'textarea','tfoot','th','thead','time','tr','track','tt','u','ul','var',
        'video','wbr',

        // SVG
        'svg','altglyph','altglyphdef','altglyphitem','animatecolor',
        'animatemotion','animatetransform','circle','clippath','defs','desc',
        'ellipse','filter','font','g','glyph','glyphref','hkern','image','line',
        'lineargradient','marker','mask','metadata','mpath','path','pattern',
        'polygon','polyline','radialgradient','rect','stop','switch','symbol',
        'text','textpath','title','tref','tspan','view','vkern',

        // SVG Filters
        'feBlend','feColorMatrix','feComponentTransfer','feComposite',
        'feConvolveMatrix','feDiffuseLighting','feDisplacementMap',
        'feFlood','feFuncA','feFuncB','feFuncG','feFuncR','feGaussianBlur',
        'feMerge','feMergeNode','feMorphology','feOffset',
        'feSpecularLighting','feTile','feTurbulence',

        //MathML
        'math','menclose','merror','mfenced','mfrac','mglyph','mi','mlabeledtr',
        'mmuliscripts','mn','mo','mover','mpadded','mphantom','mroot','mrow',
        'ms','mpspace','msqrt','mystyle','msub','msup','msubsup','mtable','mtd',
        'mtext','mtr','munder','munderover',

        //Text
        '#text'
    ]);

    /* Allowed attribute names */
    var ALLOWED_ATTR = null;
    var DEFAULT_ALLOWED_ATTR = _addToSet({}, [

        // HTML
        'accept','action','align','alt','autocomplete','background','bgcolor',
        'border','cellpadding','cellspacing','checked','cite','class','clear','color',
        'cols','colspan','coords','datetime','default','dir','disabled',
        'download','enctype','face','for','headers','height','hidden','high','href',
        'hreflang','id','ismap','label','lang','list','loop', 'low','max',
        'maxlength','media','method','min','multiple','name','noshade','novalidate',
        'nowrap','open','optimum','pattern','placeholder','poster','preload','pubdate',
        'radiogroup','readonly','rel','required','rev','reversed','rows',
        'rowspan','spellcheck','scope','selected','shape','size','span',
        'srclang','start','src','step','style','summary','tabindex','title',
        'type','usemap','valign','value','width','xmlns',

        // SVG
        'accent-height','accumulate','additivive','alignment-baseline',
        'ascent','attributename','attributetype','azimuth','basefrequency',
        'baseline-shift','begin','bias','by','clip','clip-path','clip-rule',
        'color','color-interpolation','color-interpolation-filters','color-profile',
        'color-rendering','cx','cy','d','dx','dy','diffuseconstant','direction',
        'display','divisor','dur','edgemode','elevation','end','fill','fill-opacity',
        'fill-rule','filter','flood-color','flood-opacity','font-family','font-size',
        'font-size-adjust','font-stretch','font-style','font-variant','font-weight',
        'fx', 'fy','g1','g2','glyph-name','glyphref','gradientunits','gradienttransform',
        'image-rendering','in','in2','k','k1','k2','k3','k4','kerning','keypoints',
        'keysplines','keytimes','lengthadjust','letter-spacing','kernelmatrix',
        'kernelunitlength','lighting-color','local','marker-end','marker-mid',
        'marker-start','markerheight','markerunits','markerwidth','maskcontentunits',
        'maskunits','max','mask','mode','min','numoctaves','offset','operator',
        'opacity','order','orient','orientation','origin','overflow','paint-order',
        'path','pathlength','patterncontentunits','patterntransform','patternunits',
        'points','preservealpha','r','rx','ry','radius','refx','refy','repeatcount',
        'repeatdur','restart','result','rotate','scale','seed','shape-rendering',
        'specularconstant','specularexponent','spreadmethod','stddeviation','stitchtiles',
        'stop-color','stop-opacity','stroke-dasharray','stroke-dashoffset','stroke-linecap',
        'stroke-linejoin','stroke-miterlimit','stroke-opacity','stroke','stroke-width',
        'surfacescale','targetx','targety','transform','text-anchor','text-decoration',
        'text-rendering','textlength','u1','u2','unicode','values','viewbox',
        'visibility','vert-adv-y','vert-origin-x','vert-origin-y','word-spacing',
        'wrap','writing-mode','xchannelselector','ychannelselector','x','x1','x2',
        'y','y1','y2','z','zoomandpan',

        // MathML
        'accent','accentunder','bevelled','close','columnsalign','columnlines',
        'columnspan','denomalign','depth','display','displaystyle','fence',
        'frame','largeop','length','linethickness','lspace','lquote',
        'mathbackground','mathcolor','mathsize','mathvariant','maxsize',
        'minsize','movablelimits','notation','numalign','open','rowalign',
        'rowlines','rowspacing','rowspan','rspace','rquote','scriptlevel',
        'scriptminsize','scriptsizemultiplier','selection','separator',
        'separators','stretchy','subscriptshift','supscriptshift','symmetric',
        'voffset',

        // XML
        'xlink:href','xml:id','xlink:title','xml:space','xmlns:xlink'
    ]);

    /* Explicitly forbidden tags (overrides ALLOWED_TAGS/ADD_TAGS) */
    var FORBID_TAGS = null;

    /* Explicitly forbidden attributes (overrides ALLOWED_ATTR/ADD_ATTR) */
    var FORBID_ATTR = null;

    /* Decide if custom data attributes are okay */
    var ALLOW_DATA_ATTR = true;

    /* Decide if unknown protocols are okay */
    var ALLOW_UNKNOWN_PROTOCOLS = false;

    /* Output should be safe for jQuery's $() factory? */
    var SAFE_FOR_JQUERY = false;

    /* Output should be safe for common template engines.
     * This means, DOMPurify removes data attributes, mustaches and ERB
     */
    var SAFE_FOR_TEMPLATES = false;

    /* Specify template detection regex for SAFE_FOR_TEMPLATES mode */
    var MUSTACHE_EXPR = /\{\{[\s\S]*|[\s\S]*\}\}/gm;
    var ERB_EXPR = /<%[\s\S]*|[\s\S]*%>/gm;

    /* Decide if document with <html>... should be returned */
    var WHOLE_DOCUMENT = false;

    /* Decide if a DOM `HTMLBodyElement` should be returned, instead of a html string.
     * If `WHOLE_DOCUMENT` is enabled a `HTMLHtmlElement` will be returned instead
     */
    var RETURN_DOM = false;

    /* Decide if a DOM `DocumentFragment` should be returned, instead of a html string */
    var RETURN_DOM_FRAGMENT = false;

    /* If `RETURN_DOM` or `RETURN_DOM_FRAGMENT` is enabled, decide if the returned DOM
     * `Node` is imported into the current `Document`. If this flag is not enabled the
     * `Node` will belong (its ownerDocument) to a fresh `HTMLDocument`, created by
     * DOMPurify. */
    var RETURN_DOM_IMPORT = false;

    /* Output should be free from DOM clobbering attacks? */
    var SANITIZE_DOM = true;

    /* Keep element content when removing element? */
    var KEEP_CONTENT = true;

    /* Tags to ignore content of when KEEP_CONTENT is true */
    var FORBID_CONTENTS = _addToSet({}, [
        'audio', 'head', 'math', 'script', 'style', 'svg', 'video'
    ]);

    /* Tags that are safe for data: URIs */
    var DATA_URI_TAGS = _addToSet({}, [
        'audio', 'video', 'img', 'source'
    ]);

    /* Attributes safe for values like "javascript:" */
    var URI_SAFE_ATTRIBUTES = _addToSet({}, [
        'alt','class','for','id','label','name','pattern','placeholder',
        'summary','title','value','style','xmlns'
    ]);

    /* Keep a reference to config to pass to hooks */
    var CONFIG = null;

    /* Ideally, do not touch anything below this line */
    /* ______________________________________________ */

    var formElement = document.createElement('form');

    /**
     * _parseConfig
     *
     * @param  optional config literal
     */
    var _parseConfig = function(cfg) {
        /* Shield configuration object from tampering */
        if (typeof cfg !== 'object') {
            cfg = {};
        }

        /* Set configuration parameters */
        ALLOWED_TAGS = 'ALLOWED_TAGS' in cfg ?
            _addToSet({}, cfg.ALLOWED_TAGS) : DEFAULT_ALLOWED_TAGS;
        ALLOWED_ATTR = 'ALLOWED_ATTR' in cfg ?
            _addToSet({}, cfg.ALLOWED_ATTR) : DEFAULT_ALLOWED_ATTR;
        FORBID_TAGS = 'FORBID_TAGS' in cfg ?
            _addToSet({}, cfg.FORBID_TAGS) : {};
        FORBID_ATTR = 'FORBID_ATTR' in cfg ?
            _addToSet({}, cfg.FORBID_ATTR) : {};
        ALLOW_DATA_ATTR     = cfg.ALLOW_DATA_ATTR     !== false; // Default true
        ALLOW_UNKNOWN_PROTOCOLS = cfg.ALLOW_UNKNOWN_PROTOCOLS || false; // Default false
        SAFE_FOR_JQUERY     = cfg.SAFE_FOR_JQUERY     ||  false; // Default false
        SAFE_FOR_TEMPLATES  = cfg.SAFE_FOR_TEMPLATES  ||  false; // Default false
        WHOLE_DOCUMENT      = cfg.WHOLE_DOCUMENT      ||  false; // Default false
        RETURN_DOM          = cfg.RETURN_DOM          ||  false; // Default false
        RETURN_DOM_FRAGMENT = cfg.RETURN_DOM_FRAGMENT ||  false; // Default false
        RETURN_DOM_IMPORT   = cfg.RETURN_DOM_IMPORT   ||  false; // Default false
        SANITIZE_DOM        = cfg.SANITIZE_DOM        !== false; // Default true
        KEEP_CONTENT        = cfg.KEEP_CONTENT        !== false; // Default true

        if (SAFE_FOR_TEMPLATES) {
            ALLOW_DATA_ATTR = false;
        }

        if (RETURN_DOM_FRAGMENT) {
            RETURN_DOM = true;
        }

        /* Merge configuration parameters */
        if (cfg.ADD_TAGS) {
            if (ALLOWED_TAGS === DEFAULT_ALLOWED_TAGS) {
                ALLOWED_TAGS = _cloneObj(ALLOWED_TAGS);
            }
            _addToSet(ALLOWED_TAGS, cfg.ADD_TAGS);
        }
        if (cfg.ADD_ATTR) {
            if (ALLOWED_ATTR === DEFAULT_ALLOWED_ATTR) {
                ALLOWED_ATTR = _cloneObj(ALLOWED_ATTR);
            }
            _addToSet(ALLOWED_ATTR, cfg.ADD_ATTR);
        }

        /* Add #text in case KEEP_CONTENT is set to true */
        if (KEEP_CONTENT) { ALLOWED_TAGS['#text'] = true; }

        // Prevent further manipulation of configuration.
        // Not available in IE8, Safari 5, etc.
        if (Object && 'freeze' in Object) { Object.freeze(cfg); }

        CONFIG = cfg;
    };

   /**
     * _forceRemove
     *
     * @param  a DOM node
     */
    var _forceRemove = function(node) {
        try {
            node.parentNode.removeChild(node);
        } catch (e) {
            node.outerHTML = '';
        }
    };

   /**
     * _initDocument
     *
     * @param  a string of dirty markup
     * @return a DOM, filled with the dirty markup
     */
    var _initDocument = function(dirty) {
        /* Create a HTML document using DOMParser */
        var doc, body;
        try {
            doc = new DOMParser().parseFromString(dirty, 'text/html');
        } catch (e) {}

        /* Some browsers throw, some browsers return null for the code above
           DOMParser with text/html support is only in very recent browsers. */
        if (!doc) {
            doc = implementation.createHTMLDocument('');
            body = doc.body;
            body.parentNode.removeChild(body.parentNode.firstElementChild);
            body.outerHTML = dirty;
        }

        /* Work on whole document or just its body */
        if (typeof doc.getElementsByTagName === 'function') {
            return doc.getElementsByTagName(
                WHOLE_DOCUMENT ? 'html' : 'body')[0];
        }
        return getElementsByTagName.call(doc,
            WHOLE_DOCUMENT ? 'html' : 'body')[0];
    };

    /**
     * _createIterator
     *
     * @param  document/fragment to create iterator for
     * @return iterator instance
     */
    var _createIterator = function(root) {
        return createNodeIterator.call(root.ownerDocument || root,
            root,
            NodeFilter.SHOW_ELEMENT
            | NodeFilter.SHOW_COMMENT
            | NodeFilter.SHOW_TEXT,
            function() { return NodeFilter.FILTER_ACCEPT; },
            false
        );
    };

    /**
     * _isClobbered
     *
     * @param  element to check for clobbering attacks
     * @return true if clobbered, false if safe
     */
    var _isClobbered = function(elm) {
        if (elm instanceof Text || elm instanceof Comment) {
            return false;
        }
        if (  typeof elm.nodeName !== 'string'
           || typeof elm.textContent !== 'string'
           || typeof elm.removeChild !== 'function'
           || !(elm.attributes instanceof NamedNodeMap)
           || typeof elm.removeAttribute !== 'function'
           || typeof elm.setAttribute !== 'function'
        ) {
            return true;
        }
        return false;
    };

    /**
     * _sanitizeElements
     *
     * @protect nodeName
     * @protect textContent
     * @protect removeChild
     *
     * @param   node to check for permission to exist
     * @return  true if node was killed, false if left alive
     */
    var _sanitizeElements = function(currentNode) {
        var tagName, content;
        /* Execute a hook if present */
        _executeHook('beforeSanitizeElements', currentNode, null);

        /* Check if element is clobbered or can clobber */
        if (_isClobbered(currentNode)) {
            _forceRemove(currentNode);
            return true;
        }

        /* Now let's check the element's type and name */
        tagName = currentNode.nodeName.toLowerCase();

        /* Execute a hook if present */
        _executeHook('uponSanitizeElement', currentNode, {
            tagName: tagName
        });

        /* Remove element if anything forbids its presence */
        if (!ALLOWED_TAGS[tagName] || FORBID_TAGS[tagName]) {
            /* Keep content except for black-listed elements */
            if (KEEP_CONTENT && !FORBID_CONTENTS[tagName]
                    && typeof currentNode.insertAdjacentHTML === 'function') {
                try {
                    currentNode.insertAdjacentHTML('AfterEnd', currentNode.innerHTML);
                } catch (e) {}
            }
            _forceRemove(currentNode);
            return true;
        }

        /* Convert markup to cover jQuery behavior */
        if (SAFE_FOR_JQUERY && !currentNode.firstElementChild &&
                (!currentNode.content || !currentNode.content.firstElementChild)) {
            currentNode.innerHTML = currentNode.textContent.replace(/</g, '&lt;');
        }

        /* Sanitize element content to be template-safe */
        if (SAFE_FOR_TEMPLATES && currentNode.nodeType === 3) {
            /* Get the element's text content */
            content = currentNode.textContent;
            content = content.replace(MUSTACHE_EXPR, ' ');
            content = content.replace(ERB_EXPR, ' ');
            currentNode.textContent = content;
        }

        /* Execute a hook if present */
        _executeHook('afterSanitizeElements', currentNode, null);

        return false;
    };

    var DATA_ATTR = /^data-[\w.\u00B7-\uFFFF-]/;
    var IS_ALLOWED_URI = /^(?:(?:(?:f|ht)tps?|mailto|tel):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i;
    var IS_SCRIPT_OR_DATA = /^(?:\w+script|data):/i;
    /* This needs to be extensive thanks to Webkit/Blink's behavior */
    var ATTR_WHITESPACE = /[\x00-\x20\xA0\u1680\u180E\u2000-\u2029\u205f\u3000]/g;

    /**
     * _sanitizeAttributes
     *
     * @protect attributes
     * @protect nodeName
     * @protect removeAttribute
     * @protect setAttribute
     *
     * @param   node to sanitize
     * @return  void
     */
    var _sanitizeAttributes = function(currentNode) {
        var attr, name, value, lcName, idAttr, attributes, hookEvent, l;
        /* Execute a hook if present */
        _executeHook('beforeSanitizeAttributes', currentNode, null);

        attributes = currentNode.attributes;

        /* Check if we have attributes; if not we might have a text node */
        if (!attributes) { return; }

        hookEvent = {
            attrName: '',
            attrValue: '',
            keepAttr: true
        };
        l = attributes.length;

        /* Go backwards over all attributes; safely remove bad ones */
        while (l--) {
            attr = attributes[l];
            name = attr.name;
            value = attr.value;
            lcName = name.toLowerCase();

            /* Execute a hook if present */
            hookEvent.attrName = lcName;
            hookEvent.attrValue = value;
            hookEvent.keepAttr = true;
            _executeHook('uponSanitizeAttribute', currentNode, hookEvent );
            value = hookEvent.attrValue;

            /* Remove attribute */
            // Safari (iOS + Mac), last tested v8.0.5, crashes if you try to
            // remove a "name" attribute from an <img> tag that has an "id"
            // attribute at the time.
            if (lcName === 'name'  &&
                    currentNode.nodeName === 'IMG' && attributes.id) {
                idAttr = attributes.id;
                attributes = Array.prototype.slice.apply(attributes);
                currentNode.removeAttribute('id');
                currentNode.removeAttribute(name);
                if (attributes.indexOf(idAttr) > l) {
                    currentNode.setAttribute('id', idAttr.value);
                }
            } else {
                // This avoids a crash in Safari v9.0 with double-ids.
                // The trick is to first set the id to be empty and then to
                // remove the attriubute
                if (name === 'id') {
                    currentNode.setAttribute(name, '');
                }
                currentNode.removeAttribute(name);
            }

            /* Did the hooks approve of the attribute? */
            if (!hookEvent.keepAttr) {
                continue;
            }

            /* Make sure attribute cannot clobber */
            if (SANITIZE_DOM &&
                    (lcName === 'id' || lcName === 'name') &&
                    (value in window || value in document || value in formElement)) {
                continue;
            }

            /* Sanitize attribute content to be template-safe */
            if (SAFE_FOR_TEMPLATES) {
                value = value.replace(MUSTACHE_EXPR, ' ');
                value = value.replace(ERB_EXPR, ' ');
            }

            if (
                /* Check the name is permitted */
                (ALLOWED_ATTR[lcName] && !FORBID_ATTR[lcName] && (
                  /* Check no script, data or unknown possibly unsafe URI
                     unless we know URI values are safe for that attribute */
                  URI_SAFE_ATTRIBUTES[lcName] ||
                  IS_ALLOWED_URI.test(value.replace(ATTR_WHITESPACE,'')) ||
                  /* Keep image data URIs alive if src is allowed */
                  (lcName === 'src' && value.indexOf('data:') === 0 &&
                   DATA_URI_TAGS[currentNode.nodeName.toLowerCase()])
                )) ||
                /* Allow potentially valid data-* attributes:
                 * At least one character after "-" (https://html.spec.whatwg.org/multipage/dom.html#embedding-custom-non-visible-data-with-the-data-*-attributes)
                 * XML-compatible (https://html.spec.whatwg.org/multipage/infrastructure.html#xml-compatible and http://www.w3.org/TR/xml/#d0e804)
                 * We don't need to check the value; it's always URI safe.
                 */
                 (ALLOW_DATA_ATTR && DATA_ATTR.test(lcName)) ||
                 /* Allow unknown protocols:
                  * This provides support for links that are handled by protocol handlers which may be unknown
                  * ahead of time, e.g. fb:, spotify:
                  */
                 (ALLOW_UNKNOWN_PROTOCOLS && !IS_SCRIPT_OR_DATA.test(value.replace(ATTR_WHITESPACE,'')))
            ) {
                /* Handle invalid data-* attribute set by try-catching it */
                try {
                    currentNode.setAttribute(name, value);
                } catch (e) {}
            }
        }

        /* Execute a hook if present */
        _executeHook('afterSanitizeAttributes', currentNode, null);
    };

    /**
     * _sanitizeShadowDOM
     *
     * @param  fragment to iterate over recursively
     * @return void
     */
    var _sanitizeShadowDOM = function(fragment) {
        var shadowNode;
        var shadowIterator = _createIterator(fragment);

        /* Execute a hook if present */
        _executeHook('beforeSanitizeShadowDOM', fragment, null);

        while ( (shadowNode = shadowIterator.nextNode()) ) {
            /* Execute a hook if present */
            _executeHook('uponSanitizeShadowNode', shadowNode, null);

            /* Sanitize tags and elements */
            if (_sanitizeElements(shadowNode)) {
                continue;
            }

            /* Deep shadow DOM detected */
            if (shadowNode.content instanceof DocumentFragment) {
                _sanitizeShadowDOM(shadowNode.content);
            }

            /* Check attributes, sanitize if necessary */
            _sanitizeAttributes(shadowNode);
        }

        /* Execute a hook if present */
        _executeHook('afterSanitizeShadowDOM', fragment, null);
    };

    /**
     * _executeHook
     * Execute user configurable hooks
     *
     * @param  {String} entryPoint  Name of the hook's entry point
     * @param  {Node} currentNode
     */
    var _executeHook = function(entryPoint, currentNode, data) {
        if (!hooks[entryPoint]) { return; }

        hooks[entryPoint].forEach(function(hook) {
            hook.call(DOMPurify, currentNode, data, CONFIG);
        });
    };

    /**
     * sanitize
     * Public method providing core sanitation functionality
     *
     * @param {String} dirty string
     * @param {Object} configuration object
     */
    DOMPurify.sanitize = function(dirty, cfg) {
        var body, currentNode, oldNode, nodeIterator, returnNode;
        /* Make sure we have a string to sanitize.
           DO NOT return early, as this will return the wrong type if
           the user has requested a DOM object rather than a string */
        if (!dirty) {
            dirty = '';
        }

        /* Stringify, in case dirty is an object */
        if (typeof dirty !== 'string') {
            if (typeof dirty.toString !== 'function') {
                throw new TypeError('toString is not a function');
            } else {
                dirty = dirty.toString();
            }
        }

        /* Check we can run. Otherwise fall back or ignore */
        if (!DOMPurify.isSupported) {
            if (typeof window.toStaticHTML === 'object'
                || typeof window.toStaticHTML === 'function') {
                return window.toStaticHTML(dirty);
            }
            return dirty;
        }

        /* Assign config vars */
        _parseConfig(cfg);

        /* Exit directly if we have nothing to do */
        if (!RETURN_DOM && !WHOLE_DOCUMENT && dirty.indexOf('<') === -1) {
            return dirty;
        }

        /* Initialize the document to work on */
        body = _initDocument(dirty);

        /* Check we have a DOM node from the data */
        if (!body) {
            return RETURN_DOM ? null : '';
        }

        /* Get node iterator */
        nodeIterator = _createIterator(body);

        /* Now start iterating over the created document */
        while ( (currentNode = nodeIterator.nextNode()) ) {

            /* Fix IE's strange behavior with manipulated textNodes #89 */
            if (currentNode.nodeType === 3 && currentNode === oldNode) {
                continue;
            }

            /* Sanitize tags and elements */
            if (_sanitizeElements(currentNode)) {
                continue;
            }

            /* Shadow DOM detected, sanitize it */
            if (currentNode.content instanceof DocumentFragment) {
                _sanitizeShadowDOM(currentNode.content);
            }

            /* Check attributes, sanitize if necessary */
            _sanitizeAttributes(currentNode);

            oldNode = currentNode;
        }

        /* Return sanitized string or DOM */
        if (RETURN_DOM) {

            if (RETURN_DOM_FRAGMENT) {
                returnNode = createDocumentFragment.call(body.ownerDocument);

                while (body.firstChild) {
                    returnNode.appendChild(body.firstChild);
                }
            } else {
                returnNode = body;
            }

            if (RETURN_DOM_IMPORT) {
                /* adoptNode() is not used because internal state is not reset
                   (e.g. the past names map of a HTMLFormElement), this is safe
                   in theory but we would rather not risk another attack vector.
                   The state that is cloned by importNode() is explicitly defined
                   by the specs. */
                returnNode = importNode.call(originalDocument, returnNode, true);
            }

            return returnNode;
        }

        return WHOLE_DOCUMENT ? body.outerHTML : body.innerHTML;
    };

    /**
     * addHook
     * Public method to add DOMPurify hooks
     *
     * @param {String} entryPoint
     * @param {Function} hookFunction
     */
    DOMPurify.addHook = function(entryPoint, hookFunction) {
        if (typeof hookFunction !== 'function') { return; }
        hooks[entryPoint] = hooks[entryPoint] || [];
        hooks[entryPoint].push(hookFunction);
    };

    /**
     * removeHook
     * Public method to remove a DOMPurify hook at a given entryPoint
     * (pops it from the stack of hooks if more are present)
     *
     * @param {String} entryPoint
     * @return void
     */
    DOMPurify.removeHook = function(entryPoint) {
        if (hooks[entryPoint]) {
            hooks[entryPoint].pop();
        }
    };

    /**
     * removeHooks
     * Public method to remove all DOMPurify hooks at a given entryPoint
     *
     * @param  {String} entryPoint
     * @return void
     */
    DOMPurify.removeHooks = function(entryPoint) {
        if (hooks[entryPoint]) {
            hooks[entryPoint] = [];
        }
    };

    /**
     * removeAllHooks
     * Public method to remove all DOMPurify hooks
     *
     * @return void
     */
    DOMPurify.removeAllHooks = function() {
        hooks = [];
    };

    return DOMPurify;
}));
