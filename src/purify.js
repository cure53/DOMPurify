import * as TAGS from './tags';
import * as ATTRS from './attrs';
import { addToSet, clone } from './utils';

function getGlobal() {
  // eslint-disable-next-line no-new-func
  return Function('return this')();
}

function createDOMPurify(window = getGlobal()) {
  const DOMPurify = root => createDOMPurify(root);

  /**
      * Version label, exposed for easier checks
      * if DOMPurify is up to date or not
      */
  DOMPurify.version = VERSION;

  /**
    * Array of elements that DOMPurify removed during sanitation.
    * Empty if nothing was removed.
    */
  DOMPurify.removed = [];

  if (!window || !window.document || window.document.nodeType !== 9) {
    // Not running in a browser, provide a factory function
    // so that you can pass your own Window
    DOMPurify.isSupported = false;

    return DOMPurify;
  }

  const originalDocument = window.document;
  let useDOMParser = false; // See comment below
  let useXHR = false;

  let document = window.document;
  const {
    DocumentFragment,
    HTMLTemplateElement,
    Node,
    NodeFilter,
    NamedNodeMap = window.NamedNodeMap || window.MozNamedAttrMap,
    Text,
    Comment,
    DOMParser,
    XMLHttpRequest = window.XMLHttpRequest,
    encodeURI = window.encodeURI,
  } = window;

  // As per issue #47, the web-components registry is inherited by a
  // new document created via createHTMLDocument. As per the spec
  // (http://w3c.github.io/webcomponents/spec/custom/#creating-and-passing-registries)
  // a new empty registry is used when creating a template contents owner
  // document, so we use that as our parent document to ensure nothing
  // is inherited.
  if (typeof HTMLTemplateElement === 'function') {
    const template = document.createElement('template');
    if (template.content && template.content.ownerDocument) {
      document = template.content.ownerDocument;
    }
  }

  const {
    implementation,
    createNodeIterator,
    getElementsByTagName,
    createDocumentFragment,
  } = document;
  const importNode = originalDocument.importNode;

  let hooks = {};

  /**
    * Expose whether this browser supports running the full DOMPurify.
    */
  DOMPurify.isSupported =
    implementation &&
    typeof implementation.createHTMLDocument !== 'undefined' &&
    document.documentMode !== 9;

  /**
    * We consider the elements and attributes below to be safe. Ideally
    * don't add any new ones but feel free to remove unwanted ones.
    */

  /* allowed element names */
  let ALLOWED_TAGS = null;
  const DEFAULT_ALLOWED_TAGS = addToSet({}, [
    ...TAGS.html,
    ...TAGS.svg,
    ...TAGS.svgFilters,
    ...TAGS.mathMl,
    ...TAGS.text,
  ]);

  /* Allowed attribute names */
  let ALLOWED_ATTR = null;
  const DEFAULT_ALLOWED_ATTR = addToSet({}, [
    ...ATTRS.html,
    ...ATTRS.svg,
    ...ATTRS.mathMl,
    ...ATTRS.xml,
  ]);

  /* Explicitly forbidden tags (overrides ALLOWED_TAGS/ADD_TAGS) */
  let FORBID_TAGS = null;

  /* Explicitly forbidden attributes (overrides ALLOWED_ATTR/ADD_ATTR) */
  let FORBID_ATTR = null;

  /* Decide if ARIA attributes are okay */
  let ALLOW_ARIA_ATTR = true;

  /* Decide if custom data attributes are okay */
  let ALLOW_DATA_ATTR = true;

  /* Decide if unknown protocols are okay */
  let ALLOW_UNKNOWN_PROTOCOLS = false;

  /* Output should be safe for jQuery's $() factory? */
  let SAFE_FOR_JQUERY = false;

  /* Output should be safe for common template engines.
   * This means, DOMPurify removes data attributes, mustaches and ERB
   */
  let SAFE_FOR_TEMPLATES = false;

  /* Specify template detection regex for SAFE_FOR_TEMPLATES mode */
  const MUSTACHE_EXPR = /\{\{[\s\S]*|[\s\S]*\}\}/gm;
  const ERB_EXPR = /<%[\s\S]*|[\s\S]*%>/gm;

  /* Decide if document with <html>... should be returned */
  let WHOLE_DOCUMENT = false;

  /* Track whether config is already set on this instance of DOMPurify. */
  let SET_CONFIG = false;

  /* Decide if all elements (e.g. style, script) must be children of
   * document.body. By default, browsers might move them to document.head */
  let FORCE_BODY = false;

  /* Decide if a DOM `HTMLBodyElement` should be returned, instead of a html string.
   * If `WHOLE_DOCUMENT` is enabled a `HTMLHtmlElement` will be returned instead
   */
  let RETURN_DOM = false;

  /* Decide if a DOM `DocumentFragment` should be returned, instead of a html string */
  let RETURN_DOM_FRAGMENT = false;

  /* If `RETURN_DOM` or `RETURN_DOM_FRAGMENT` is enabled, decide if the returned DOM
   * `Node` is imported into the current `Document`. If this flag is not enabled the
   * `Node` will belong (its ownerDocument) to a fresh `HTMLDocument`, created by
   * DOMPurify. */
  let RETURN_DOM_IMPORT = false;

  /* Output should be free from DOM clobbering attacks? */
  let SANITIZE_DOM = true;

  /* Keep element content when removing element? */
  let KEEP_CONTENT = true;

  /* Allow usage of profiles like html, svg and mathMl */
  let USE_PROFILES = {};

  /* Tags to ignore content of when KEEP_CONTENT is true */
  const FORBID_CONTENTS = addToSet({}, [
    'audio',
    'head',
    'math',
    'script',
    'style',
    'template',
    'svg',
    'video',
  ]);

  /* Tags that are safe for data: URIs */
  const DATA_URI_TAGS = addToSet({}, [
    'audio',
    'video',
    'img',
    'source',
    'image',
  ]);

  /* Attributes safe for values like "javascript:" */
  const URI_SAFE_ATTRIBUTES = addToSet({}, [
    'alt',
    'class',
    'for',
    'id',
    'label',
    'name',
    'pattern',
    'placeholder',
    'summary',
    'title',
    'value',
    'style',
    'xmlns',
  ]);

  /* Keep a reference to config to pass to hooks */
  let CONFIG = null;

  /* Ideally, do not touch anything below this line */
  /* ______________________________________________ */

  const formElement = document.createElement('form');

  /**
 * _parseConfig
 *
 * @param  optional config literal
 */
  // eslint-disable-next-line complexity
  const _parseConfig = function(cfg) {
    /* Shield configuration object from tampering */
    if (typeof cfg !== 'object') {
      cfg = {};
    }

    /* Set configuration parameters */
    ALLOWED_TAGS =
      'ALLOWED_TAGS' in cfg
        ? addToSet({}, cfg.ALLOWED_TAGS)
        : DEFAULT_ALLOWED_TAGS;
    ALLOWED_ATTR =
      'ALLOWED_ATTR' in cfg
        ? addToSet({}, cfg.ALLOWED_ATTR)
        : DEFAULT_ALLOWED_ATTR;
    FORBID_TAGS = 'FORBID_TAGS' in cfg ? addToSet({}, cfg.FORBID_TAGS) : {};
    FORBID_ATTR = 'FORBID_ATTR' in cfg ? addToSet({}, cfg.FORBID_ATTR) : {};
    USE_PROFILES = 'USE_PROFILES' in cfg ? cfg.USE_PROFILES : false;
    ALLOW_ARIA_ATTR = cfg.ALLOW_ARIA_ATTR !== false; // Default true
    ALLOW_DATA_ATTR = cfg.ALLOW_DATA_ATTR !== false; // Default true
    ALLOW_UNKNOWN_PROTOCOLS = cfg.ALLOW_UNKNOWN_PROTOCOLS || false; // Default false
    SAFE_FOR_JQUERY = cfg.SAFE_FOR_JQUERY || false; // Default false
    SAFE_FOR_TEMPLATES = cfg.SAFE_FOR_TEMPLATES || false; // Default false
    WHOLE_DOCUMENT = cfg.WHOLE_DOCUMENT || false; // Default false
    RETURN_DOM = cfg.RETURN_DOM || false; // Default false
    RETURN_DOM_FRAGMENT = cfg.RETURN_DOM_FRAGMENT || false; // Default false
    RETURN_DOM_IMPORT = cfg.RETURN_DOM_IMPORT || false; // Default false
    FORCE_BODY = cfg.FORCE_BODY || false; // Default false
    SANITIZE_DOM = cfg.SANITIZE_DOM !== false; // Default true
    KEEP_CONTENT = cfg.KEEP_CONTENT !== false; // Default true

    if (SAFE_FOR_TEMPLATES) {
      ALLOW_DATA_ATTR = false;
    }

    if (RETURN_DOM_FRAGMENT) {
      RETURN_DOM = true;
    }

    /* Parse profile info */
    if (USE_PROFILES) {
      ALLOWED_TAGS = addToSet({}, [...TAGS.text]);
      ALLOWED_ATTR = [];
      if (USE_PROFILES.html === true) {
        addToSet(ALLOWED_TAGS, TAGS.html);
        addToSet(ALLOWED_ATTR, ATTRS.html);
      }
      if (USE_PROFILES.svg === true) {
        addToSet(ALLOWED_TAGS, TAGS.svg);
        addToSet(ALLOWED_ATTR, ATTRS.svg);
        addToSet(ALLOWED_ATTR, ATTRS.xml);
      }
      if (USE_PROFILES.svgFilters === true) {
        addToSet(ALLOWED_TAGS, TAGS.svgFilters);
        addToSet(ALLOWED_ATTR, ATTRS.svg);
        addToSet(ALLOWED_ATTR, ATTRS.xml);
      }
      if (USE_PROFILES.mathMl === true) {
        addToSet(ALLOWED_TAGS, TAGS.mathMl);
        addToSet(ALLOWED_ATTR, ATTRS.mathMl);
        addToSet(ALLOWED_ATTR, ATTRS.xml);
      }
    }

    /* Merge configuration parameters */
    if (cfg.ADD_TAGS) {
      if (ALLOWED_TAGS === DEFAULT_ALLOWED_TAGS) {
        ALLOWED_TAGS = clone(ALLOWED_TAGS);
      }
      addToSet(ALLOWED_TAGS, cfg.ADD_TAGS);
    }
    if (cfg.ADD_ATTR) {
      if (ALLOWED_ATTR === DEFAULT_ALLOWED_ATTR) {
        ALLOWED_ATTR = clone(ALLOWED_ATTR);
      }
      addToSet(ALLOWED_ATTR, cfg.ADD_ATTR);
    }
    if (cfg.ADD_URI_SAFE_ATTR) {
      addToSet(URI_SAFE_ATTRIBUTES, cfg.ADD_URI_SAFE_ATTR);
    }

    /* Add #text in case KEEP_CONTENT is set to true */
    if (KEEP_CONTENT) {
      ALLOWED_TAGS['#text'] = true;
    }

    // Prevent further manipulation of configuration.
    // Not available in IE8, Safari 5, etc.
    if (Object && 'freeze' in Object) {
      Object.freeze(cfg);
    }

    CONFIG = cfg;
  };

  /**
 * _forceRemove
 *
 * @param  a DOM node
 */
  const _forceRemove = function(node) {
    DOMPurify.removed.push({ element: node });
    try {
      node.parentNode.removeChild(node);
    } catch (err) {
      node.outerHTML = '';
    }
  };

  /**
 * _removeAttribute
 *
 * @param  an Attribute name
 * @param  a DOM node
 */
  const _removeAttribute = function(name, node) {
    DOMPurify.removed.push({
      attribute: node.getAttributeNode(name),
      from: node,
    });
    node.removeAttribute(name);
  };

  /**
 * _initDocument
 *
 * @param  a string of dirty markup
 * @return a DOM, filled with the dirty markup
 */
  const _initDocument = function(dirty) {
    /* Create a HTML document */
    let doc;
    let body;

    if (FORCE_BODY) {
      dirty = '<remove></remove>' + dirty;
    }

    /* Use XHR if necessary because Safari 10.1 and newer are buggy */
    if (useXHR) {
      try {
        dirty = encodeURI(dirty);
      } catch (err) {}
      const xhr = new XMLHttpRequest();
      xhr.responseType = 'document';
      xhr.open('GET', 'data:text/html;charset=utf-8,' + dirty, false);
      xhr.send(null);
      doc = xhr.response;
    }

    /* Use DOMParser to workaround Firefox bug (see comment below) */
    if (useDOMParser) {
      try {
        doc = new DOMParser().parseFromString(dirty, 'text/html');
      } catch (err) {}
    }

    /* Otherwise use createHTMLDocument, because DOMParser is unsafe in
    Safari (see comment below) */
    if (!doc || !doc.documentElement) {
      doc = implementation.createHTMLDocument('');
      body = doc.body;
      body.parentNode.removeChild(body.parentNode.firstElementChild);
      body.outerHTML = dirty;
    }

    /* Work on whole document or just its body */
    return getElementsByTagName.call(doc, WHOLE_DOCUMENT ? 'html' : 'body')[0];
  };

  // Safari 10.1+ (unfixed as of time of writing) has a catastrophic bug in
  // its implementation of DOMParser such that the following executes the
  // JavaScript:
  //
  // new DOMParser()
  //   .parseFromString('<svg onload=alert(document.domain)>', 'text/html');
  //
  // Later, it was also noticed that even more assumed benign and inert ways
  // of creating a document are now insecure thanks to Safari. So we work
  // around that with a feature test and use XHR to create the document in
  // case we really have to. That one seems safe for now.
  //
  // However, Firefox uses a different parser for innerHTML rather than
  // DOMParser (see https://bugzilla.mozilla.org/show_bug.cgi?id=1205631)
  // which means that you *must* use DOMParser, otherwise the output may
  // not be safe if used in a document.write context later.
  //
  // So we feature detect the Firefox bug and use the DOMParser if necessary.
  if (DOMPurify.isSupported) {
    (function() {
      let doc = _initDocument(
        '<svg><g onload="this.parentNode.remove()"></g></svg>'
      );
      if (!doc.querySelector('svg')) {
        useXHR = true;
      }
      try {
        doc = _initDocument(
          '<svg><p><style><img src="</style><img src=x onerror=alert(1)//">'
        );
        if (doc.querySelector('svg img')) {
          useDOMParser = true;
        }
      } catch (err) {}
    })();
  }

  /**
 * _createIterator
 *
 * @param  document/fragment to create iterator for
 * @return iterator instance
 */
  const _createIterator = function(root) {
    return createNodeIterator.call(
      root.ownerDocument || root,
      root,
      NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_COMMENT | NodeFilter.SHOW_TEXT,
      () => {
        return NodeFilter.FILTER_ACCEPT;
      },
      false
    );
  };

  /**
 * _isClobbered
 *
 * @param  element to check for clobbering attacks
 * @return true if clobbered, false if safe
 */
  const _isClobbered = function(elm) {
    if (elm instanceof Text || elm instanceof Comment) {
      return false;
    }
    if (
      typeof elm.nodeName !== 'string' ||
      typeof elm.textContent !== 'string' ||
      typeof elm.removeChild !== 'function' ||
      !(elm.attributes instanceof NamedNodeMap) ||
      typeof elm.removeAttribute !== 'function' ||
      typeof elm.setAttribute !== 'function'
    ) {
      return true;
    }
    return false;
  };

  /**
 * _isNode
 *
 * @param object to check whether it's a DOM node
 * @return true is object is a DOM node
 */
  const _isNode = function(obj) {
    return typeof Node === 'object'
      ? obj instanceof Node
      : obj &&
        typeof obj === 'object' &&
        typeof obj.nodeType === 'number' &&
        typeof obj.nodeName === 'string';
  };

  /**
 * _executeHook
 * Execute user configurable hooks
 *
 * @param  {String} entryPoint  Name of the hook's entry point
 * @param  {Node} currentNode
 */
  const _executeHook = function(entryPoint, currentNode, data) {
    if (!hooks[entryPoint]) {
      return;
    }

    hooks[entryPoint].forEach(hook => {
      hook.call(DOMPurify, currentNode, data, CONFIG);
    });
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
  const _sanitizeElements = function(currentNode) {
    let content;

    /* Execute a hook if present */
    _executeHook('beforeSanitizeElements', currentNode, null);

    /* Check if element is clobbered or can clobber */
    if (_isClobbered(currentNode)) {
      _forceRemove(currentNode);
      return true;
    }

    /* Now let's check the element's type and name */
    const tagName = currentNode.nodeName.toLowerCase();

    /* Execute a hook if present */
    _executeHook('uponSanitizeElement', currentNode, {
      tagName,
      allowedTags: ALLOWED_TAGS,
    });

    /* Remove element if anything forbids its presence */
    if (!ALLOWED_TAGS[tagName] || FORBID_TAGS[tagName]) {
      /* Keep content except for black-listed elements */
      if (
        KEEP_CONTENT &&
        !FORBID_CONTENTS[tagName] &&
        typeof currentNode.insertAdjacentHTML === 'function'
      ) {
        try {
          currentNode.insertAdjacentHTML('AfterEnd', currentNode.innerHTML);
        } catch (err) {}
      }
      _forceRemove(currentNode);
      return true;
    }

    /* Convert markup to cover jQuery behavior */
    if (
      SAFE_FOR_JQUERY &&
      !currentNode.firstElementChild &&
      (!currentNode.content || !currentNode.content.firstElementChild) &&
      /</g.test(currentNode.textContent)
    ) {
      DOMPurify.removed.push({ element: currentNode.cloneNode() });
      currentNode.innerHTML = currentNode.textContent.replace(/</g, '&lt;');
    }

    /* Sanitize element content to be template-safe */
    if (SAFE_FOR_TEMPLATES && currentNode.nodeType === 3) {
      /* Get the element's text content */
      content = currentNode.textContent;
      content = content.replace(MUSTACHE_EXPR, ' ');
      content = content.replace(ERB_EXPR, ' ');
      if (currentNode.textContent !== content) {
        DOMPurify.removed.push({ element: currentNode.cloneNode() });
        currentNode.textContent = content;
      }
    }

    /* Execute a hook if present */
    _executeHook('afterSanitizeElements', currentNode, null);

    return false;
  };

  const DATA_ATTR = /^data-[\-\w.\u00B7-\uFFFF]/; // eslint-disable-line no-useless-escape
  const ARIA_ATTR = /^aria-[\-\w]+$/; // eslint-disable-line no-useless-escape
  const IS_ALLOWED_URI = /^(?:(?:(?:f|ht)tps?|mailto|tel):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i; // eslint-disable-line no-useless-escape
  const IS_SCRIPT_OR_DATA = /^(?:\w+script|data):/i;
  /* This needs to be extensive thanks to Webkit/Blink's behavior */
  const ATTR_WHITESPACE = /[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205f\u3000]/g;

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
  // eslint-disable-next-line complexity
  const _sanitizeAttributes = function(currentNode) {
    let attr;
    let name;
    let value;
    let lcName;
    let idAttr;
    let attributes;
    let l;
    /* Execute a hook if present */
    _executeHook('beforeSanitizeAttributes', currentNode, null);

    attributes = currentNode.attributes;

    /* Check if we have attributes; if not we might have a text node */
    if (!attributes) {
      return;
    }

    const hookEvent = {
      attrName: '',
      attrValue: '',
      keepAttr: true,
      allowedAttributes: ALLOWED_ATTR,
    };
    l = attributes.length;

    /* Go backwards over all attributes; safely remove bad ones */
    while (l--) {
      attr = attributes[l];
      name = attr.name;
      value = attr.value.trim();
      lcName = name.toLowerCase();

      /* Execute a hook if present */
      hookEvent.attrName = lcName;
      hookEvent.attrValue = value;
      hookEvent.keepAttr = true;
      _executeHook('uponSanitizeAttribute', currentNode, hookEvent);
      value = hookEvent.attrValue;

      /* Remove attribute */
      // Safari (iOS + Mac), last tested v8.0.5, crashes if you try to
      // remove a "name" attribute from an <img> tag that has an "id"
      // attribute at the time.
      if (
        lcName === 'name' &&
        currentNode.nodeName === 'IMG' &&
        attributes.id
      ) {
        idAttr = attributes.id;
        attributes = Array.prototype.slice.apply(attributes);
        _removeAttribute('id', currentNode);
        _removeAttribute(name, currentNode);
        if (attributes.indexOf(idAttr) > l) {
          currentNode.setAttribute('id', idAttr.value);
        }
      } else if (
        // This works around a bug in Safari, where input[type=file]
        // cannot be dynamically set after type has been removed
        currentNode.nodeName === 'INPUT' &&
        lcName === 'type' &&
        value === 'file' &&
        (ALLOWED_ATTR[lcName] || !FORBID_ATTR[lcName])
      ) {
        continue;
      } else {
        // This avoids a crash in Safari v9.0 with double-ids.
        // The trick is to first set the id to be empty and then to
        // remove the attribute
        if (name === 'id') {
          currentNode.setAttribute(name, '');
        }
        _removeAttribute(name, currentNode);
      }

      /* Did the hooks approve of the attribute? */
      if (!hookEvent.keepAttr) {
        continue;
      }

      /* Make sure attribute cannot clobber */
      if (
        SANITIZE_DOM &&
        (lcName === 'id' || lcName === 'name') &&
        (value in window || value in document || value in formElement)
      ) {
        continue;
      }

      /* Sanitize attribute content to be template-safe */
      if (SAFE_FOR_TEMPLATES) {
        value = value.replace(MUSTACHE_EXPR, ' ');
        value = value.replace(ERB_EXPR, ' ');
      }

      /* Allow valid data-* attributes: At least one character after "-"
         (https://html.spec.whatwg.org/multipage/dom.html#embedding-custom-non-visible-data-with-the-data-*-attributes)
         XML-compatible (https://html.spec.whatwg.org/multipage/infrastructure.html#xml-compatible and http://www.w3.org/TR/xml/#d0e804)
         We don't need to check the value; it's always URI safe. */
      if (ALLOW_DATA_ATTR && DATA_ATTR.test(lcName)) {
        // This attribute is safe
      } else if (ALLOW_ARIA_ATTR && ARIA_ATTR.test(lcName)) {
        // This attribute is safe
        /* Otherwise, check the name is permitted */
      } else if (!ALLOWED_ATTR[lcName] || FORBID_ATTR[lcName]) {
        continue;

        /* Check value is safe. First, is attr inert? If so, is safe */
      } else if (URI_SAFE_ATTRIBUTES[lcName]) {
        // This attribute is safe
        /* Check no script, data or unknown possibly unsafe URI
         unless we know URI values are safe for that attribute */
      } else if (IS_ALLOWED_URI.test(value.replace(ATTR_WHITESPACE, ''))) {
        // This attribute is safe
        /* Keep image data URIs alive if src/xlink:href is allowed */
      } else if (
        (lcName === 'src' || lcName === 'xlink:href') &&
        value.indexOf('data:') === 0 &&
        DATA_URI_TAGS[currentNode.nodeName.toLowerCase()]
      ) {
        // This attribute is safe
        /* Allow unknown protocols: This provides support for links that
         are handled by protocol handlers which may be unknown ahead of
         time, e.g. fb:, spotify: */
      } else if (
        ALLOW_UNKNOWN_PROTOCOLS &&
        !IS_SCRIPT_OR_DATA.test(value.replace(ATTR_WHITESPACE, ''))
      ) {
        // This attribute is safe
        /* Check for binary attributes */
        // eslint-disable-next-line no-negated-condition
      } else if (!value) {
        // Binary attributes are safe at this point
        /* Anything else, presume unsafe, do not add it back */
      } else {
        continue;
      }

      /* Handle invalid data-* attribute set by try-catching it */
      try {
        currentNode.setAttribute(name, value);
        DOMPurify.removed.pop();
      } catch (err) {}
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
  const _sanitizeShadowDOM = function(fragment) {
    let shadowNode;
    const shadowIterator = _createIterator(fragment);

    /* Execute a hook if present */
    _executeHook('beforeSanitizeShadowDOM', fragment, null);

    while ((shadowNode = shadowIterator.nextNode())) {
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
 * Sanitize
 * Public method providing core sanitation functionality
 *
 * @param {String|Node} dirty string or DOM node
 * @param {Object} configuration object
 */
  // eslint-disable-next-line complexity
  DOMPurify.sanitize = function(dirty, cfg) {
    let body;
    let importedNode;
    let currentNode;
    let oldNode;
    let returnNode;
    /* Make sure we have a string to sanitize.
      DO NOT return early, as this will return the wrong type if
      the user has requested a DOM object rather than a string */
    if (!dirty) {
      dirty = '<!-->';
    }

    /* Stringify, in case dirty is an object */
    if (typeof dirty !== 'string' && !_isNode(dirty)) {
      // eslint-disable-next-line no-negated-condition
      if (typeof dirty.toString !== 'function') {
        throw new TypeError('toString is not a function');
      } else {
        dirty = dirty.toString();
      }
    }

    /* Check we can run. Otherwise fall back or ignore */
    if (!DOMPurify.isSupported) {
      if (
        typeof window.toStaticHTML === 'object' ||
        typeof window.toStaticHTML === 'function'
      ) {
        if (typeof dirty === 'string') {
          return window.toStaticHTML(dirty);
        } else if (_isNode(dirty)) {
          return window.toStaticHTML(dirty.outerHTML);
        }
      }
      return dirty;
    }

    /* Assign config vars */
    if (!SET_CONFIG) {
      _parseConfig(cfg);
    }

    /* Clean up removed elements */
    DOMPurify.removed = [];

    if (dirty instanceof Node) {
      /* If dirty is a DOM element, append to an empty document to avoid
         elements being stripped by the parser */
      body = _initDocument('<!-->');
      importedNode = body.ownerDocument.importNode(dirty, true);
      if (importedNode.nodeType === 1 && importedNode.nodeName === 'BODY') {
        /* Node is already a body, use as is */
        body = importedNode;
      } else {
        body.appendChild(importedNode);
      }
    } else {
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
    }

    /* Remove first element node (ours) if FORCE_BODY is set */
    if (FORCE_BODY) {
      _forceRemove(body.firstChild);
    }

    /* Get node iterator */
    const nodeIterator = _createIterator(body);

    /* Now start iterating over the created document */
    while ((currentNode = nodeIterator.nextNode())) {
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
        /* AdoptNode() is not used because internal state is not reset
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
  * Public method to set the configuration once
  * setConfig
  *
  * @param {Object} configuration object
  * @return void
  */
  DOMPurify.setConfig = function(cfg) {
    _parseConfig(cfg);
    SET_CONFIG = true;
  };

  /**
  * Public method to remove the configuration
  * clearConfig
  *
  * @return void
  */
  DOMPurify.clearConfig = function() {
    CONFIG = null;
    SET_CONFIG = false;
  };

  /**
 * AddHook
 * Public method to add DOMPurify hooks
 *
 * @param {String} entryPoint
 * @param {Function} hookFunction
 */
  DOMPurify.addHook = function(entryPoint, hookFunction) {
    if (typeof hookFunction !== 'function') {
      return;
    }
    hooks[entryPoint] = hooks[entryPoint] || [];
    hooks[entryPoint].push(hookFunction);
  };

  /**
 * RemoveHook
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
 * RemoveHooks
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
 * RemoveAllHooks
 * Public method to remove all DOMPurify hooks
 *
 * @return void
 */
  DOMPurify.removeAllHooks = function() {
    hooks = {};
  };

  return DOMPurify;
}

export default createDOMPurify();
