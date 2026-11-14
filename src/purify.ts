import type { Config, UseProfilesConfig } from './config';
import type { DOMPurify, HooksMap, HookFunction, WindowLike } from './types';
import * as TAGS from './tags.js';
import * as ATTRS from './attrs.js';
import * as EXPRESSIONS from './regexp.js';
import {
  addToSet,
  clone,
  cloneSet,
  entries,
  freeze,
  seal,
  arrayForEach,
  arrayIsArray,
  arrayLastIndexOf,
  arrayPop,
  arrayPush,
  arraySlice,
  arraySplice,
  stringMatch,
  stringReplace,
  stringToLowerCase,
  stringToString,
  stringIndexOf,
  stringTrim,
  regExpTest,
  setAdd,
  setCreate,
  setHas,
  isRegex,
  typeErrorCreate,
  lookupAccessor,
  lookupGetter,
  create,
  objectHasOwnProperty,
  stringifyValue,
} from './utils.js';

export type { Config } from './config';

export type {
  DOMPurify,
  RemovedElement,
  RemovedAttribute,
  HookName,
  NodeHook,
  ElementHook,
  DocumentFragmentHook,
  UponSanitizeElementHook,
  UponSanitizeAttributeHook,
  UponSanitizeElementHookEvent,
  UponSanitizeAttributeHookEvent,
  WindowLike,
} from './types';

declare const VERSION: string;

// https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType
const NODE_TYPE = {
  element: 1,
  text: 3,
  processingInstruction: 7,
  comment: 8,
  document: 9,
  documentFragment: 11,
};

/* HTML elements whose text children are serialized unescaped. A node built
   via the DOM API or an XML parse can hold an element child, or text with
   markup such as the element's own end tag, and both break out on an HTML
   reparse. _isUnsafeNode checks them via textContent, because an XML
   document escapes `<` in innerHTML. `script` is never allowed, it is listed
   to match the serializer's list. */
const LITERAL_TEXT_ELEMENT_NAMES = [
  'style',
  'script',
  'xmp',
  'iframe',
  'noembed',
  'noframes',
  'plaintext',
  'noscript',
];
const LITERAL_TEXT_ELEMENTS = freeze(addToSet({}, LITERAL_TEXT_ELEMENT_NAMES));

const getGlobal = function (): WindowLike {
  return typeof window === 'undefined' ? null : window;
};

/**
 * Creates a no-op policy for internal use only.
 * Don't export this function outside this module!
 * @param trustedTypes The policy factory.
 * @param purifyHostElement The Script element used to load DOMPurify (to determine policy name suffix).
 * @return The policy created (or null, if Trusted Types
 * are not supported or creating the policy failed).
 */
const _createTrustedTypesPolicy = function (
  trustedTypes: TrustedTypePolicyFactory,
  purifyHostElement: HTMLScriptElement
) {
  if (
    typeof trustedTypes !== 'object' ||
    typeof trustedTypes.createPolicy !== 'function'
  ) {
    return null;
  }

  // Allow the callers to control the unique policy name
  // by adding a data-tt-policy-suffix to the script element with the DOMPurify.
  // Policy creation with duplicate names throws in Trusted Types.
  let suffix = null;
  const ATTR_NAME = 'data-tt-policy-suffix';
  if (purifyHostElement && purifyHostElement.hasAttribute(ATTR_NAME)) {
    suffix = purifyHostElement.getAttribute(ATTR_NAME);
  }

  const policyName = 'dompurify' + (suffix ? '#' + suffix : '');

  try {
    return trustedTypes.createPolicy(policyName, {
      createHTML(html) {
        return html;
      },
      createScriptURL(scriptUrl) {
        return scriptUrl;
      },
    });
  } catch (_) {
    // Policy creation failed (most likely another DOMPurify script has
    // already run). Skip creating the policy, as this will only cause errors
    // if TT are enforced.
    console.warn(
      'TrustedTypes policy ' + policyName + ' could not be created.'
    );
    return null;
  }
};

const _createHooksMap = function (): HooksMap {
  return {
    afterSanitizeAttributes: [],
    afterSanitizeElements: [],
    afterSanitizeShadowDOM: [],
    beforeSanitizeAttributes: [],
    beforeSanitizeElements: [],
    beforeSanitizeShadowDOM: [],
    uponSanitizeAttribute: [],
    uponSanitizeElement: [],
    uponSanitizeShadowNode: [],
  };
};

/**
 * Resolve a set-valued configuration option.
 *
 * @param cfg the cloned, prototype-free configuration object
 * @param key the configuration property to read
 * @param fallback the set to use when the option is absent or not an array
 * @param options case transform, and an optional base set to extend a copy of
 * @returns a fresh set built from cfg[key], or the fallback
 */
const _resolveSetOption = function (
  cfg: Config,
  key: keyof Config,
  fallback: Record<string, boolean>,
  options: {
    transform: Parameters<typeof addToSet>[2];
    base?: Record<string, boolean>;
  }
): Record<string, boolean> {
  return objectHasOwnProperty(cfg, key) && arrayIsArray(cfg[key])
    ? addToSet(
        options.base ? cloneSet(options.base) : {},
        cfg[key] as readonly unknown[],
        options.transform
      )
    : fallback;
};

/**
 * Resolve an object-valued configuration option.
 *
 * @param cfg the cloned, prototype-free configuration object
 * @param key the configuration property to read
 * @param fallback the read-only value to use when the option is absent
 * @returns a prototype-free clone of cfg[key], or the fallback
 */
const _resolveObjectOption = function <T extends Record<string, any>>(
  cfg: Config,
  key: keyof Config,
  fallback: T
): T {
  const value = objectHasOwnProperty(cfg, key) ? cfg[key] : undefined;
  return value && typeof value === 'object' ? clone(value as T) : fallback;
};

function createDOMPurify(window: WindowLike = getGlobal()): DOMPurify {
  const DOMPurify: DOMPurify = (root: WindowLike) => createDOMPurify(root);

  DOMPurify.version = VERSION;

  DOMPurify.removed = [];

  if (
    !window ||
    !window.document ||
    window.document.nodeType !== NODE_TYPE.document ||
    !window.Element
  ) {
    // Not running in a browser, provide a factory function
    // so that you can pass your own Window
    DOMPurify.isSupported = false;

    return DOMPurify;
  }

  let { document } = window;

  const originalDocument = document;
  const currentScript: HTMLScriptElement =
    originalDocument.currentScript as HTMLScriptElement;
  const {
    HTMLTemplateElement,
    Node,
    Element,
    NodeFilter,
    DOMParser,
    trustedTypes,
  } = window;

  const ElementPrototype = Element.prototype;

  const cloneNode = lookupGetter(ElementPrototype, 'cloneNode');
  const remove = lookupGetter(ElementPrototype, 'remove');
  // Cached, as a form child named "removeAttributeNode" shadows the method
  const removeAttributeNode = lookupGetter(
    ElementPrototype,
    'removeAttributeNode'
  );
  const getNextSibling = lookupGetter(ElementPrototype, 'nextSibling');
  const getChildNodes = lookupGetter(ElementPrototype, 'childNodes');
  const getParentNode = lookupGetter(ElementPrototype, 'parentNode');
  const getShadowRoot = lookupGetter(ElementPrototype, 'shadowRoot');
  const getAttributes = lookupGetter(ElementPrototype, 'attributes');
  const getNodeType =
    Node && Node.prototype ? lookupGetter(Node.prototype, 'nodeType') : null;
  const getNodeName =
    Node && Node.prototype ? lookupGetter(Node.prototype, 'nodeName') : null;
  const getOwnerDocument =
    Node && Node.prototype
      ? lookupGetter(Node.prototype, 'ownerDocument')
      : null;

  /* Clobber-safe nodeType / nodeName reads through the cached Node.prototype
     getters, with a direct-property fallback for environments that lack
     Node.prototype. Sites that need a different fallback (e.g. _isClobbered
     returns early on a null name) intentionally keep their own reads. */
  const _readNodeType = function (node: Node): number {
    return getNodeType ? getNodeType(node) : (node as any).nodeType;
  };

  const _readNodeName = function (node: Node): string {
    return getNodeName ? getNodeName(node) : (node as any).nodeName;
  };

  /* Element namespace through the cached Element.prototype getter, so a live
     node's own-property override (Object.defineProperty) cannot steer
     namespace decisions; direct read where the getter does not exist. Only
     call this on Elements - the getter throws on other node types. */
  const getNamespaceURI = lookupAccessor(ElementPrototype, 'namespaceURI');
  const _readNamespaceURI = function (element: Element): string | null {
    return getNamespaceURI
      ? getNamespaceURI(element)
      : (element as any).namespaceURI;
  };

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

  let trustedTypesPolicy;
  let emptyHTML = '';

  // The instance's own Trusted Types policy. Created at most once, as Trusted
  // Types throws on duplicate names, and the only one to survive clearConfig().
  let defaultTrustedTypesPolicy;
  let defaultTrustedTypesPolicyResolved = false;

  // Depth of running policy callbacks. A policy whose createHTML or
  // createScriptURL calls DOMPurify.sanitize would recurse forever (#1422),
  // so re-entry throws instead.
  let IN_TRUSTED_TYPES_POLICY = 0;
  const _assertNotInTrustedTypesPolicy = function (): void {
    if (IN_TRUSTED_TYPES_POLICY > 0) {
      throw typeErrorCreate(
        'A configured TRUSTED_TYPES_POLICY callback (createHTML or ' +
          'createScriptURL) must not call DOMPurify.sanitize, as that causes ' +
          'infinite recursion. Do not pass a policy whose callbacks wrap ' +
          'DOMPurify as TRUSTED_TYPES_POLICY; see the "DOMPurify and Trusted ' +
          'Types" section of the README.'
      );
    }
  };

  const _createTrustedHTML = function (html: string): string {
    _assertNotInTrustedTypesPolicy();

    IN_TRUSTED_TYPES_POLICY++;
    try {
      return trustedTypesPolicy.createHTML(html);
    } finally {
      IN_TRUSTED_TYPES_POLICY--;
    }
  };

  /* Sign string output when a policy is active and the caller asked for it */
  const _signOutput = function (html: string): string {
    return trustedTypesPolicy && RETURN_TRUSTED_TYPE
      ? _createTrustedHTML(html)
      : html;
  };

  const _createTrustedScriptURL = function (scriptUrl: string): string {
    _assertNotInTrustedTypesPolicy();

    IN_TRUSTED_TYPES_POLICY++;
    try {
      return trustedTypesPolicy.createScriptURL(scriptUrl);
    } finally {
      IN_TRUSTED_TYPES_POLICY--;
    }
  };

  // Resolve the default policy once; neither success nor failure is retried
  const _getDefaultTrustedTypesPolicy = function () {
    if (!defaultTrustedTypesPolicyResolved) {
      defaultTrustedTypesPolicy = _createTrustedTypesPolicy(
        trustedTypes,
        currentScript
      );
      defaultTrustedTypesPolicyResolved = true;
    }

    return defaultTrustedTypesPolicy;
  };

  const {
    implementation,
    createNodeIterator,
    createDocumentFragment,
    getElementsByTagName,
  } = document;
  const { importNode } = originalDocument;

  let hooks = _createHooksMap();

  /**
   * Expose whether this browser supports running the full DOMPurify.
   */
  DOMPurify.isSupported =
    typeof entries === 'function' &&
    typeof getParentNode === 'function' &&
    implementation &&
    implementation.createHTMLDocument !== undefined;

  const {
    MUSTACHE_EXPR,
    ERB_EXPR,
    TMPLIT_EXPR,
    DATA_ATTR,
    ARIA_ATTR,
    IS_SCRIPT_OR_DATA,
    ATTR_WHITESPACE,
    CUSTOM_ELEMENT,
  } = EXPRESSIONS;

  let { IS_ALLOWED_URI } = EXPRESSIONS;

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

  /*
   * Configure how DOMPurify should handle custom elements and their attributes as well as customized built-in elements.
   * @property {RegExp|Function|null} tagNameCheck one of [null, regexPattern, predicate]. Default: `null` (disallow any custom elements)
   * @property {RegExp|Function|null} attributeNameCheck one of [null, regexPattern, predicate]. Default: `null` (disallow any attributes not on the allow list)
   * @property {boolean} allowCustomizedBuiltInElements allow custom elements derived from built-ins if they pass CUSTOM_ELEMENT_HANDLING.tagNameCheck. Default: `false`.
   */
  let CUSTOM_ELEMENT_HANDLING = null;

  /* Explicitly forbidden tags (overrides ALLOWED_TAGS/ADD_TAGS) */
  let FORBID_TAGS = null;

  /* Explicitly forbidden attributes (overrides ALLOWED_ATTR/ADD_ATTR) */
  let FORBID_ATTR = null;

  /* Config object to store ADD_TAGS/ADD_ATTR functions (when used as functions) */
  const EXTRA_ELEMENT_HANDLING = Object.seal(
    create(null, {
      tagCheck: {
        writable: true,
        configurable: false,
        enumerable: true,
        value: null,
      },
      attributeCheck: {
        writable: true,
        configurable: false,
        enumerable: true,
        value: null,
      },
    })
  );

  /* Decide if ARIA attributes are okay */
  let ALLOW_ARIA_ATTR = true;

  /* Decide if custom data attributes are okay */
  let ALLOW_DATA_ATTR = true;

  /* Decide if unknown protocols are okay */
  let ALLOW_UNKNOWN_PROTOCOLS = false;

  /* Decide if self-closing tags in attributes are allowed.
   * Usually removed due to a mXSS issue in jQuery 3.0 */
  let ALLOW_SELF_CLOSE_IN_ATTR = true;

  /* Output should be safe for common template engines.
   * This means, DOMPurify removes data attributes, mustaches and ERB
   */
  let SAFE_FOR_TEMPLATES = false;

  /* Output should be safe even for XML used within HTML and alike.
   * This means, DOMPurify removes comments when containing risky content.
   */
  let SAFE_FOR_XML = true;

  /* Decide if document with <html>... should be returned */
  let WHOLE_DOCUMENT = false;

  /* Track whether config is already set on this instance of DOMPurify. */
  let SET_CONFIG = false;

  /* Allowlists as captured by setConfig(). sanitize() restores the sets from
   * these on every call, so a hook's widening cannot carry across calls. */
  let SET_CONFIG_ALLOWED_TAGS = null;
  let SET_CONFIG_ALLOWED_ATTR = null;

  /* Decide if all elements (e.g. style, script) must be children of
   * document.body. By default, browsers might move them to document.head */
  let FORCE_BODY = false;

  /* Decide if a DOM `HTMLBodyElement` should be returned, instead of a html
   * string (or a TrustedHTML object if Trusted Types are supported).
   * If `WHOLE_DOCUMENT` is enabled a `HTMLHtmlElement` will be returned instead
   */
  let RETURN_DOM = false;

  /* Decide if a DOM `DocumentFragment` should be returned, instead of a html
   * string  (or a TrustedHTML object if Trusted Types are supported) */
  let RETURN_DOM_FRAGMENT = false;

  /* Try to return a Trusted Type object instead of a string, return a string in
   * case Trusted Types are not supported  */
  let RETURN_TRUSTED_TYPE = false;

  /* Output should be free from DOM clobbering attacks?
   * This sanitizes markups named with colliding, clobberable built-in DOM APIs.
   */
  let SANITIZE_DOM = true;

  /* Achieve full DOM Clobbering protection by isolating the namespace of named
   * properties and JS variables, mitigating attacks that abuse the HTML/DOM spec rules.
   *
   * HTML/DOM spec rules that enable DOM Clobbering:
   *   - Named Access on Window (§7.3.3)
   *   - DOM Tree Accessors (§3.1.5)
   *   - Form Element Parent-Child Relations (§4.10.3)
   *   - Iframe srcdoc / Nested WindowProxies (§4.8.5)
   *   - HTMLCollection (§4.2.10.2)
   *
   * Namespace isolation is implemented by prefixing `id` and `name` attributes
   * with a constant string, i.e., `user-content-`
   */
  let SANITIZE_NAMED_PROPS = false;
  const SANITIZE_NAMED_PROPS_PREFIX = 'user-content-';

  /* Keep element content when removing element? */
  let KEEP_CONTENT = true;

  /* If a `Node` is passed to sanitize(), then performs sanitization in-place instead
   * of importing it into a new Document and returning a sanitized copy */
  let IN_PLACE = false;

  /* IN_PLACE: nodes processed during the current call */
  let IN_PLACE_VISITED: Set<unknown> | null = null;

  /* Allow usage of profiles like html, svg and mathMl */
  let USE_PROFILES: UseProfilesConfig | false = false;

  /* Tags to ignore content of when KEEP_CONTENT is true */
  let FORBID_CONTENTS = null;
  const DEFAULT_FORBID_CONTENTS = addToSet({}, [
    'annotation-xml',
    'audio',
    'colgroup',
    'desc',
    'foreignobject',
    'head',
    'iframe',
    'math',
    'mi',
    'mn',
    'mo',
    'ms',
    'mtext',
    'noembed',
    'noframes',
    'noscript',
    'plaintext',
    'script',
    // The engine mirrors the selected <option> into <selectedcontent> and
    // re-mirrors on removal, even in our inert document. Hoisting its
    // children would loop forever, so the content is dropped instead; it
    // duplicates the option, which is sanitized on its own.
    'selectedcontent',
    'style',
    'svg',
    'template',
    'thead',
    'title',
    'video',
    'xmp',
  ]);

  /* Tags that are safe for data: URIs */
  let DATA_URI_TAGS = null;
  const DEFAULT_DATA_URI_TAGS = addToSet({}, [
    'audio',
    'video',
    'img',
    'source',
    'image',
    'track',
  ]);

  /* Attributes safe for values like "javascript:" */
  let URI_SAFE_ATTRIBUTES = null;
  const DEFAULT_URI_SAFE_ATTRIBUTES = addToSet({}, [
    'alt',
    'class',
    'for',
    'id',
    'label',
    'name',
    'pattern',
    'placeholder',
    'role',
    'summary',
    'title',
    'value',
    'style',
    'xmlns',
  ]);

  const MATHML_NAMESPACE = 'http://www.w3.org/1998/Math/MathML';
  const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';
  const HTML_NAMESPACE = 'http://www.w3.org/1999/xhtml';
  /* Document namespace */
  let NAMESPACE = HTML_NAMESPACE;
  let IS_EMPTY_INPUT = false;

  /* Allowed XHTML+XML namespaces */
  let ALLOWED_NAMESPACES = null;
  const DEFAULT_ALLOWED_NAMESPACES = addToSet(
    {},
    [MATHML_NAMESPACE, SVG_NAMESPACE, HTML_NAMESPACE],
    stringToString
  );

  /* Read-only defaults, shared across parses */
  const DEFAULT_MATHML_TEXT_INTEGRATION_POINTS = freeze(
    addToSet({}, ['mi', 'mo', 'mn', 'ms', 'mtext'])
  );
  let MATHML_TEXT_INTEGRATION_POINTS = null;

  const DEFAULT_HTML_INTEGRATION_POINTS = freeze(
    addToSet({}, ['annotation-xml'])
  );
  let HTML_INTEGRATION_POINTS = null;

  const DEFAULT_CUSTOM_ELEMENT_HANDLING = freeze(create(null));

  // Certain elements are allowed in both SVG and HTML
  // namespace. We need to specify them explicitly
  // so that they don't get erroneously deleted from
  // HTML namespace.
  const COMMON_SVG_AND_HTML_ELEMENTS = addToSet({}, [
    'title',
    'style',
    'font',
    'a',
    'script',
  ]);

  /* Parsing of strict XHTML documents */
  let PARSER_MEDIA_TYPE: null | DOMParserSupportedType = null;
  const SUPPORTED_PARSER_MEDIA_TYPES = ['application/xhtml+xml', 'text/html'];
  const DEFAULT_PARSER_MEDIA_TYPE = 'text/html';
  let transformCaseFunc: null | Parameters<typeof addToSet>[2] = null;

  /* Keep a reference to config to pass to hooks */
  let CONFIG: Config | null = null;

  /* Ideally, do not touch anything below this line */
  /* ______________________________________________ */

  const formElement = document.createElement('form');

  const isRegexOrFunction = function (
    testValue: unknown
  ): testValue is Function | RegExp {
    return testValue instanceof RegExp || testValue instanceof Function;
  };

  /**
   * _parseConfig
   *
   * @param cfg optional config literal
   */
  // eslint-disable-next-line complexity
  const _parseConfig = function (cfg: Config = {}): void {
    /* Shield configuration object from tampering */
    if (!cfg || typeof cfg !== 'object') {
      cfg = {};
    }

    /* Shield configuration object from prototype pollution */
    cfg = clone(cfg);

    PARSER_MEDIA_TYPE =
      // eslint-disable-next-line unicorn/prefer-includes
      SUPPORTED_PARSER_MEDIA_TYPES.indexOf(cfg.PARSER_MEDIA_TYPE) === -1
        ? DEFAULT_PARSER_MEDIA_TYPE
        : cfg.PARSER_MEDIA_TYPE;

    // HTML tags and attributes are not case-sensitive, converting to lowercase. Keeping XHTML as is.
    transformCaseFunc =
      PARSER_MEDIA_TYPE === 'application/xhtml+xml'
        ? stringToString
        : stringToLowerCase;

    /* Set configuration parameters */
    ALLOWED_TAGS = _resolveSetOption(
      cfg,
      'ALLOWED_TAGS',
      DEFAULT_ALLOWED_TAGS,
      { transform: transformCaseFunc }
    );
    ALLOWED_ATTR = _resolveSetOption(
      cfg,
      'ALLOWED_ATTR',
      DEFAULT_ALLOWED_ATTR,
      { transform: transformCaseFunc }
    );
    ALLOWED_NAMESPACES = _resolveSetOption(
      cfg,
      'ALLOWED_NAMESPACES',
      DEFAULT_ALLOWED_NAMESPACES,
      { transform: stringToString }
    );
    URI_SAFE_ATTRIBUTES = _resolveSetOption(
      cfg,
      'ADD_URI_SAFE_ATTR',
      DEFAULT_URI_SAFE_ATTRIBUTES,
      { transform: transformCaseFunc, base: DEFAULT_URI_SAFE_ATTRIBUTES }
    );
    DATA_URI_TAGS = _resolveSetOption(
      cfg,
      'ADD_DATA_URI_TAGS',
      DEFAULT_DATA_URI_TAGS,
      { transform: transformCaseFunc, base: DEFAULT_DATA_URI_TAGS }
    );
    FORBID_CONTENTS = _resolveSetOption(
      cfg,
      'FORBID_CONTENTS',
      DEFAULT_FORBID_CONTENTS,
      { transform: transformCaseFunc }
    );
    FORBID_TAGS = _resolveSetOption(cfg, 'FORBID_TAGS', create(null), {
      transform: transformCaseFunc,
    });
    FORBID_ATTR = _resolveSetOption(cfg, 'FORBID_ATTR', create(null), {
      transform: transformCaseFunc,
    });
    USE_PROFILES = objectHasOwnProperty(cfg, 'USE_PROFILES')
      ? cfg.USE_PROFILES && typeof cfg.USE_PROFILES === 'object'
        ? clone(cfg.USE_PROFILES)
        : cfg.USE_PROFILES
      : false;

    ALLOW_ARIA_ATTR = cfg.ALLOW_ARIA_ATTR !== false; // Default true
    ALLOW_DATA_ATTR = cfg.ALLOW_DATA_ATTR !== false; // Default true
    ALLOW_UNKNOWN_PROTOCOLS = cfg.ALLOW_UNKNOWN_PROTOCOLS || false; // Default false
    ALLOW_SELF_CLOSE_IN_ATTR = cfg.ALLOW_SELF_CLOSE_IN_ATTR !== false; // Default true
    SAFE_FOR_TEMPLATES = cfg.SAFE_FOR_TEMPLATES || false; // Default false
    SAFE_FOR_XML = cfg.SAFE_FOR_XML !== false; // Default true
    WHOLE_DOCUMENT = cfg.WHOLE_DOCUMENT || false; // Default false
    RETURN_DOM = cfg.RETURN_DOM || false; // Default false
    RETURN_DOM_FRAGMENT = cfg.RETURN_DOM_FRAGMENT || false; // Default false
    RETURN_TRUSTED_TYPE = cfg.RETURN_TRUSTED_TYPE || false; // Default false
    FORCE_BODY = cfg.FORCE_BODY || false; // Default false
    SANITIZE_DOM = cfg.SANITIZE_DOM !== false; // Default true
    SANITIZE_NAMED_PROPS = cfg.SANITIZE_NAMED_PROPS || false; // Default false
    KEEP_CONTENT = cfg.KEEP_CONTENT !== false; // Default true
    IN_PLACE = cfg.IN_PLACE || false; // Default false
    IS_ALLOWED_URI = isRegex(cfg.ALLOWED_URI_REGEXP)
      ? cfg.ALLOWED_URI_REGEXP
      : EXPRESSIONS.IS_ALLOWED_URI; // Default regexp

    NAMESPACE =
      typeof cfg.NAMESPACE === 'string' ? cfg.NAMESPACE : HTML_NAMESPACE; // Default HTML namespace

    MATHML_TEXT_INTEGRATION_POINTS = _resolveObjectOption(
      cfg,
      'MATHML_TEXT_INTEGRATION_POINTS',
      DEFAULT_MATHML_TEXT_INTEGRATION_POINTS
    );

    HTML_INTEGRATION_POINTS = _resolveObjectOption(
      cfg,
      'HTML_INTEGRATION_POINTS',
      DEFAULT_HTML_INTEGRATION_POINTS
    );

    const customElementHandling = _resolveObjectOption(
      cfg,
      'CUSTOM_ELEMENT_HANDLING',
      DEFAULT_CUSTOM_ELEMENT_HANDLING
    );

    CUSTOM_ELEMENT_HANDLING = create(null);

    if (
      objectHasOwnProperty(customElementHandling, 'tagNameCheck') &&
      isRegexOrFunction(customElementHandling.tagNameCheck)
    ) {
      CUSTOM_ELEMENT_HANDLING.tagNameCheck = customElementHandling.tagNameCheck; // Default undefined
    }

    if (
      objectHasOwnProperty(customElementHandling, 'attributeNameCheck') &&
      isRegexOrFunction(customElementHandling.attributeNameCheck)
    ) {
      CUSTOM_ELEMENT_HANDLING.attributeNameCheck =
        customElementHandling.attributeNameCheck; // Default undefined
    }

    if (
      objectHasOwnProperty(
        customElementHandling,
        'allowCustomizedBuiltInElements'
      ) &&
      typeof customElementHandling.allowCustomizedBuiltInElements === 'boolean'
    ) {
      CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements =
        customElementHandling.allowCustomizedBuiltInElements; // Default undefined
    }

    seal(CUSTOM_ELEMENT_HANDLING);

    if (SAFE_FOR_TEMPLATES) {
      ALLOW_DATA_ATTR = false;
    }

    if (RETURN_DOM_FRAGMENT) {
      RETURN_DOM = true;
    }

    /* Parse profile info */
    if (USE_PROFILES) {
      if (
        (objectHasOwnProperty(cfg, 'ALLOWED_TAGS') ||
          objectHasOwnProperty(cfg, 'ALLOWED_ATTR')) &&
        typeof console !== 'undefined' &&
        typeof console.warn === 'function'
      ) {
        console.warn(
          'DOMPurify: USE_PROFILES overrides ALLOWED_TAGS and ALLOWED_ATTR. ' +
            'Do not use these options together.'
        );
      }

      ALLOWED_TAGS = addToSet({}, TAGS.text);
      ALLOWED_ATTR = create(null);
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

    /* Always reset function-based ADD_TAGS / ADD_ATTR checks to prevent
     * leaking across calls when switching from function to array config */
    EXTRA_ELEMENT_HANDLING.tagCheck = null;
    EXTRA_ELEMENT_HANDLING.attributeCheck = null;

    /* Merge configuration parameters */
    if (objectHasOwnProperty(cfg, 'ADD_TAGS')) {
      if (typeof cfg.ADD_TAGS === 'function') {
        EXTRA_ELEMENT_HANDLING.tagCheck = cfg.ADD_TAGS;
      } else if (arrayIsArray(cfg.ADD_TAGS)) {
        if (ALLOWED_TAGS === DEFAULT_ALLOWED_TAGS) {
          ALLOWED_TAGS = cloneSet(ALLOWED_TAGS);
        }

        addToSet(ALLOWED_TAGS, cfg.ADD_TAGS, transformCaseFunc);
      }
    }

    if (objectHasOwnProperty(cfg, 'ADD_ATTR')) {
      if (typeof cfg.ADD_ATTR === 'function') {
        EXTRA_ELEMENT_HANDLING.attributeCheck = cfg.ADD_ATTR;
      } else if (arrayIsArray(cfg.ADD_ATTR)) {
        if (ALLOWED_ATTR === DEFAULT_ALLOWED_ATTR) {
          ALLOWED_ATTR = cloneSet(ALLOWED_ATTR);
        }

        addToSet(ALLOWED_ATTR, cfg.ADD_ATTR, transformCaseFunc);
      }
    }

    if (
      objectHasOwnProperty(cfg, 'ADD_FORBID_CONTENTS') &&
      arrayIsArray(cfg.ADD_FORBID_CONTENTS)
    ) {
      if (FORBID_CONTENTS === DEFAULT_FORBID_CONTENTS) {
        FORBID_CONTENTS = cloneSet(FORBID_CONTENTS);
      }

      addToSet(FORBID_CONTENTS, cfg.ADD_FORBID_CONTENTS, transformCaseFunc);
    }

    /* Add #text in case KEEP_CONTENT is set to true */
    if (KEEP_CONTENT) {
      ALLOWED_TAGS['#text'] = true;
    }

    /* Add html, head and body to ALLOWED_TAGS in case WHOLE_DOCUMENT is true */
    if (WHOLE_DOCUMENT) {
      addToSet(ALLOWED_TAGS, ['html', 'head', 'body']);
    }

    /* Add tbody to ALLOWED_TAGS in case tables are permitted, see #286, #365 */
    if (ALLOWED_TAGS.table) {
      ALLOWED_TAGS.tbody = true;
      delete FORBID_TAGS.tbody;
    }

    // The active Trusted Types policy is re-derived on every parse, so a
    // caller-supplied policy cannot outlive its configuration and sign later
    // output. See GHSA-vxr8-fq34-vvx9.
    if (cfg.TRUSTED_TYPES_POLICY) {
      if (typeof cfg.TRUSTED_TYPES_POLICY.createHTML !== 'function') {
        throw typeErrorCreate(
          'TRUSTED_TYPES_POLICY configuration option must provide a "createHTML" hook.'
        );
      }

      if (typeof cfg.TRUSTED_TYPES_POLICY.createScriptURL !== 'function') {
        throw typeErrorCreate(
          'TRUSTED_TYPES_POLICY configuration option must provide a "createScriptURL" hook.'
        );
      }

      // A caller-supplied policy applies to this configuration only.
      const previousTrustedTypesPolicy = trustedTypesPolicy;
      trustedTypesPolicy = cfg.TRUSTED_TYPES_POLICY;

      // Sign local variables required by `sanitize`. If the supplied policy's
      // `createHTML` is circular (i.e. it calls `DOMPurify.sanitize`), this
      // throws via the re-entrancy guard. Restore the previous policy first so
      // the instance is not left in a poisoned state. See #1422.
      try {
        emptyHTML = _createTrustedHTML('');
      } catch (error) {
        trustedTypesPolicy = previousTrustedTypesPolicy;
        throw error;
      }
    } else if (cfg.TRUSTED_TYPES_POLICY === null) {
      // Explicit opt-out: sign nothing and create no policy, so sanitize()
      // can be called from inside a caller's own policy (#1422). This also
      // drops a previously supplied policy.
      trustedTypesPolicy = undefined;
      emptyHTML = '';
    } else {
      // No policy supplied: a previously supplied one stays active until
      // clearConfig(), otherwise the instance's own policy is used.
      if (trustedTypesPolicy === undefined) {
        trustedTypesPolicy = _getDefaultTrustedTypesPolicy();
      }

      // Sign internal variables only when a policy is active. A falsy policy
      // (Trusted Types unsupported, creation failed, or an explicit opt-out)
      // leaves `emptyHTML` as a plain string, so we never call `.createHTML` on
      // a non-policy and throw. See #1422.
      if (trustedTypesPolicy && typeof emptyHTML === 'string') {
        emptyHTML = _createTrustedHTML('');
      }
    }

    // Prevent further manipulation of configuration
    CONFIG = freeze(cfg);
  };

  /* Keep track of all possible SVG and MathML tags
   * so that we can perform the namespace checks
   * correctly. */
  const ALL_SVG_TAGS = addToSet({}, [
    ...TAGS.svg,
    ...TAGS.svgFilters,
    ...TAGS.svgDisallowed,
  ]);
  const ALL_MATHML_TAGS = addToSet({}, [
    ...TAGS.mathMl,
    ...TAGS.mathMlDisallowed,
  ]);

  /**
   * Namespace rules for an element in the SVG namespace.
   *
   * @param tagName the element's lowercase tag name
   * @param parentNamespace the (possibly simulated) parent's namespace
   * @param parentTagName the parent's lowercase tag name
   * @returns true if a spec-compliant parser could produce this element
   */
  const _checkSvgNamespace = function (
    tagName: string,
    parentNamespace: string | null,
    parentTagName: string
  ): boolean {
    // The only way to switch from HTML namespace to SVG
    // is via <svg>. If it happens via any other tag, then
    // it should be killed.
    if (parentNamespace === HTML_NAMESPACE) {
      return tagName === 'svg';
    }

    // The only way to switch from MathML to SVG is via <svg>
    // if the parent is either <annotation-xml> or a MathML
    // text integration point.
    if (parentNamespace === MATHML_NAMESPACE) {
      return (
        tagName === 'svg' &&
        (parentTagName === 'annotation-xml' ||
          MATHML_TEXT_INTEGRATION_POINTS[parentTagName])
      );
    }

    // We only allow elements that are defined in SVG
    // spec. All others are disallowed in SVG namespace.
    return Boolean(ALL_SVG_TAGS[tagName]);
  };

  /**
   * Namespace rules for an element in the MathML namespace.
   *
   * @param tagName the element's lowercase tag name
   * @param parentNamespace the (possibly simulated) parent's namespace
   * @param parentTagName the parent's lowercase tag name
   * @returns true if a spec-compliant parser could produce this element
   */
  const _checkMathMlNamespace = function (
    tagName: string,
    parentNamespace: string | null,
    parentTagName: string
  ): boolean {
    // The only way to switch from HTML namespace to MathML
    // is via <math>. If it happens via any other tag, then
    // it should be killed.
    if (parentNamespace === HTML_NAMESPACE) {
      return tagName === 'math';
    }

    // The only way to switch from SVG to MathML is via
    // <math> and HTML integration points
    if (parentNamespace === SVG_NAMESPACE) {
      return tagName === 'math' && HTML_INTEGRATION_POINTS[parentTagName];
    }

    // We only allow elements that are defined in MathML
    // spec. All others are disallowed in MathML namespace.
    return Boolean(ALL_MATHML_TAGS[tagName]);
  };

  /**
   * Namespace rules for an element in the HTML namespace.
   *
   * @param tagName the element's lowercase tag name
   * @param parentNamespace the (possibly simulated) parent's namespace
   * @param parentTagName the parent's lowercase tag name
   * @returns true if a spec-compliant parser could produce this element
   */
  const _checkHtmlNamespace = function (
    tagName: string,
    parentNamespace: string | null,
    parentTagName: string
  ): boolean {
    // The only way to switch from SVG to HTML is via
    // HTML integration points, and from MathML to HTML
    // is via MathML text integration points
    if (
      parentNamespace === SVG_NAMESPACE &&
      !HTML_INTEGRATION_POINTS[parentTagName]
    ) {
      return false;
    }

    if (
      parentNamespace === MATHML_NAMESPACE &&
      !MATHML_TEXT_INTEGRATION_POINTS[parentTagName]
    ) {
      return false;
    }

    // We disallow tags that are specific for MathML
    // or SVG and should never appear in HTML namespace
    return (
      !ALL_MATHML_TAGS[tagName] &&
      (COMMON_SVG_AND_HTML_ELEMENTS[tagName] || !ALL_SVG_TAGS[tagName])
    );
  };

  /**
   * @param element a DOM element whose namespace is being checked
   * @returns Return false if the element has a
   *  namespace that a spec-compliant parser would never
   *  return. Return true otherwise.
   */
  const _checkValidNamespace = function (element: Element): boolean {
    /* Cached getters only: a live node may carry own-property overrides of
       tagName or namespaceURI (GHSA-x4vx-rjvf-j5p4). */
    const elementNamespace = _readNamespaceURI(element);
    const tagName = stringToLowerCase(_readNodeName(element));

    // A missing parent (JSDOM inside shadow DOM) or a non-element parent
    // (DocumentFragment, ShadowRoot, Document) is simulated as a <template>
    // in the configured namespace, as before.
    const parentNode = getParentNode(element);
    let parentNamespace: string | null = NAMESPACE;
    let parentTagName = 'template';
    if (parentNode && _readNodeType(parentNode) === NODE_TYPE.element) {
      parentNamespace = _readNamespaceURI(parentNode);
      parentTagName = stringToLowerCase(_readNodeName(parentNode));
    }

    if (!ALLOWED_NAMESPACES[elementNamespace]) {
      return false;
    }

    if (elementNamespace === SVG_NAMESPACE) {
      return _checkSvgNamespace(tagName, parentNamespace, parentTagName);
    }

    if (elementNamespace === MATHML_NAMESPACE) {
      return _checkMathMlNamespace(tagName, parentNamespace, parentTagName);
    }

    if (elementNamespace === HTML_NAMESPACE) {
      return _checkHtmlNamespace(tagName, parentNamespace, parentTagName);
    }

    // An allowed custom namespace is only valid in XHTML and XML documents
    return PARSER_MEDIA_TYPE === 'application/xhtml+xml';
  };

  /**
   * _forceRemove
   *
   * @param node a DOM node
   */
  const _forceRemove = function (node: Node): void {
    arrayPush(DOMPurify.removed, { element: node });

    try {
      // eslint-disable-next-line unicorn/prefer-dom-node-remove
      getParentNode(node).removeChild(node);
    } catch (_) {
      /* Only a parentless node gets here, e.g. a detached in-place root.
         remove() is a no-op on it, so the node would be handed back intact.
         Fail closed by throwing rather than neutralizing it through its own,
         clobberable methods (GHSA-r47g-fvhr-h676). */
      remove(node);

      if (!getParentNode(node)) {
        throw typeErrorCreate(
          'a node selected for removal could not be detached from its tree ' +
            'and cannot be safely returned; refusing to sanitize in place'
        );
      }
    }
  };

  /**
   * Removes an Attr node as that exact node, without book-keeping. Name-based
   * removal lowercases the name in HTML documents and would miss a
   * case-preserved one such as `ONERROR`, so it is only the fallback for
   * clobbered or detached nodes.
   *
   * @param element the element to strip the attribute from
   * @param attribute the Attr node to remove
   * @param name the attribute's name, for the fallback path
   */
  const _stripAttributeNode = function (
    element: Element,
    attribute: Attr,
    name: string
  ): void {
    try {
      removeAttributeNode(element, attribute);
    } catch (_) {
      try {
        element.removeAttribute(name);
      } catch (_) {}
    }
  };

  /**
   * Fail-closed teardown of an in-place root: strip every disallowed attribute
   * in the subtree first, so nothing armed is left behind, then remove all
   * children and the root's own attributes.
   *
   * @param root the in-place root to empty
   */
  const _neutralizeRoot = function (root: Node): void {
    _neutralizeSubtree(root);

    const childNodes = getChildNodes(root);
    if (childNodes) {
      arrayForEach(arraySlice(childNodes), (child: Node) => {
        try {
          remove(child);
        } catch (_) {
          /* Best effort */
        }
      });
    }

    // Only elements have attributes; the root may be a rejected fragment
    if (_readNodeType(root) === NODE_TYPE.element) {
      _stripAttributes(root as Element, false);
    }
  };

  /**
   * Removes an attribute, preferably as its exact Attr node: name-based
   * removal lowercases the name in HTML documents and misses case-preserved
   * names, e.g. from imported XHTML.
   *
   * @param name an Attribute name
   * @param element a DOM node
   * @param attr the exact Attr node to remove, when the caller has it
   */
  const _removeAttribute = function (
    name: string,
    element: Element,
    attr?: Attr | null
  ): void {
    if (!attr) {
      try {
        attr = element.getAttributeNode(name);
      } catch (_) {
        attr = null;
      }
    }

    arrayPush(DOMPurify.removed, {
      attribute: attr || null,
      from: element,
    });

    if (attr) {
      _stripAttributeNode(element, attr, name);
    } else {
      try {
        element.removeAttribute(name);
      } catch (_) {}
    }

    // We void attribute values for unremovable "is" attributes
    if (name === 'is') {
      if (RETURN_DOM || RETURN_DOM_FRAGMENT) {
        try {
          _forceRemove(element);
        } catch (_) {}
      } else {
        try {
          element.setAttribute(name, '');
        } catch (_) {}
      }
    }
  };

  /**
   * Removes an element's attributes without book-keeping. Used to neutralize
   * nodes discarded from an in-place tree.
   *
   * @param element the element to strip
   * @param keepAllowed whether attributes on the allowlist stay
   */
  const _stripAttributes = function (
    element: Element,
    keepAllowed: boolean
  ): void {
    const attributes = getAttributes(element);
    if (!attributes) {
      return;
    }

    for (let i = attributes.length - 1; i >= 0; --i) {
      const attribute = attributes[i];
      const name = attribute && attribute.name;
      if (
        typeof name === 'string' &&
        !(keepAllowed && ALLOWED_ATTR[transformCaseFunc(name)])
      ) {
        _stripAttributeNode(element, attribute, name);
      }
    }
  };

  /**
   * Iterative depth-first walk, so deep trees cannot overflow the call stack,
   * reading through the cached getters, so clobbering cannot hide children.
   * When `visit` returns false, the node's children are skipped. With
   * `intoShadow`, open shadow roots are walked after their host's children.
   *
   * @param root where to start
   * @param visit called for every node
   * @param intoShadow whether to enter open shadow roots
   */
  const _walkTree = function (
    root: Node,
    visit: (node: Node) => boolean | void,
    intoShadow = false
  ): void {
    const stack: Node[] = [root];

    while (stack.length > 0) {
      const node = stack.pop();
      if (visit(node) === false) {
        continue;
      }

      if (intoShadow && _readNodeType(node) === NODE_TYPE.element) {
        const shadowRoot = getShadowRoot(node);
        if (_isDocumentFragment(shadowRoot)) {
          stack.push(shadowRoot);
        }
      }

      const childNodes = getChildNodes(node);
      if (childNodes) {
        for (let i = childNodes.length - 1; i >= 0; --i) {
          stack.push(childNodes[i]);
        }
      }
    }
  };

  /**
   * Strips disallowed attributes from every element of a discarded subtree,
   * so a handler that is already queued (a loading image) cannot fire.
   *
   * @param root the root of a removed subtree
   */
  const _neutralizeSubtree = function (root: Node): void {
    _walkTree(root, (node) => {
      if (_readNodeType(node) === NODE_TYPE.element) {
        _stripAttributes(node as Element, true);
      }
    });
  };

  /**
   * All nodes under `root`, root first, including open shadow roots. Template
   * content is not entered, it is inert.
   *
   * @param root the in-place root
   * @return the nodes
   */
  const _collectLiveNodes = function (root: Node): Node[] {
    const nodes: Node[] = [];
    _walkTree(
      root,
      (node) => {
        nodes.push(node);
      },
      true
    );
    return nodes;
  };

  /**
   * Strips disallowed attributes from every element that was under the
   * in-place root when the call started and no longer is, whatever removed
   * or moved it.
   *
   * @param root the in-place root
   * @param before the root's nodes, collected before the walk
   */
  const _neutralizeEscapedElements = function (
    root: Node,
    before: Node[]
  ): void {
    const reachable = setCreate();
    arrayForEach(_collectLiveNodes(root), (node: Node) => {
      if (_readNodeType(node) === NODE_TYPE.element) {
        setAdd(reachable, node);
      }
    });
    arrayForEach(before, (node: Node) => {
      if (
        _readNodeType(node) === NODE_TYPE.element &&
        !setHas(reachable, node)
      ) {
        _stripAttributes(node as Element, true);
      }
    });
  };

  /**
   * Neutralizes everything that left the in-place tree during the call: what
   * DOMPurify removed, and what hooks or custom elements removed or moved out.
   *
   * @param root the in-place root
   * @param before the root's nodes, collected before the walk
   * @return true if the root itself was removed
   */
  const _neutralizeDiscarded = function (root: Node, before: Node[]): boolean {
    let rootRemoved = false;
    arrayForEach(DOMPurify.removed, (entry) => {
      if (entry.element) {
        rootRemoved = rootRemoved || entry.element === root;
        _neutralizeSubtree(entry.element as Node);
      }
    });
    _neutralizeEscapedElements(root, before);
    return rootRemoved;
  };

  const MAX_UNVISITED_ROUNDS = 8;

  /**
   * The walk only moves forward, so a node moved to a position it already
   * passed is never visited. Give every original node that is still in the
   * tree but unvisited the normal treatment, hooks included. Nodes created
   * during the call are left alone. Fails closed if the tree keeps changing.
   *
   * @param root the in-place root
   * @param before the root's nodes, collected before the walk
   */
  const _sanitizeUnvisitedNodes = function (root: Node, before: Node[]): void {
    const visited = IN_PLACE_VISITED;
    /* Built lazily: usually every live node was visited */
    let original: Set<unknown> | null = null;
    const getOriginal = (): Set<unknown> => {
      if (!original) {
        original = setCreate();
        arrayForEach(before, (beforeNode: Node) => {
          setAdd(original, beforeNode);
        });
      }

      return original;
    };

    for (let round = 0; ; round++) {
      const live = _collectLiveNodes(root);
      const containers: Node[] = [root];
      let pending = false;

      arrayForEach(live, (node: Node) => {
        if (_readNodeType(node) === NODE_TYPE.documentFragment) {
          /* An open shadow root under the root */
          arrayPush(containers, node);
        } else if (!pending && !setHas(visited, node)) {
          pending = setHas(getOriginal(), node);
        }
      });

      if (!pending) {
        return;
      }

      if (round >= MAX_UNVISITED_ROUNDS) {
        throw typeErrorCreate(
          'the tree kept changing during in-place sanitization; ' +
            'refusing to return it'
        );
      }

      arrayForEach(containers, (container: Node, index: number) => {
        _sanitizeUnvisitedIn(container, index > 0, root, getOriginal());
      });
    }
  };

  /**
   * One _sanitizeUnvisitedNodes pass over the root or an open shadow root.
   *
   * @param container the root or an open shadow root
   * @param inShadow whether container is a shadow root
   * @param root the in-place root
   * @param original the root's nodes collected before the walk, as a set
   */
  const _sanitizeUnvisitedIn = function (
    container: Node,
    inShadow: boolean,
    root: Node,
    original: Set<unknown>
  ): void {
    const iterator = _createNodeIterator(container);
    let node: Node | null;
    while ((node = iterator.nextNode())) {
      if (!setHas(original, node) || setHas(IN_PLACE_VISITED, node)) {
        continue;
      }

      if (inShadow) {
        _executeHooks(hooks.uponSanitizeShadowNode, node, null);
      }

      _sanitizeNode(node, root);
    }
  };

  /**
   * Records that _sanitizeElements processed `node`. No-op outside IN_PLACE.
   *
   * @param node the node being processed
   */
  const _markVisited = function (node: Node): void {
    if (IN_PLACE_VISITED) {
      setAdd(IN_PLACE_VISITED, node);
    }
  };

  /**
   * Patch-linkage attributes (declarative partial updates): `patchsrc`
   * always, `for` everywhere except on <label> and <output>. Gated on
   * SAFE_FOR_XML. Shared by the IN_PLACE pre-pass and _isValidAttribute.
   *
   * @param lcName the transformCaseFunc'd attribute name
   * @param lcTag the transformCaseFunc'd tag name of the carrying element
   * @return true if the attribute is patch linkage and must be dropped
   */
  const _isPatchLinkageAttribute = function (
    lcName: string,
    lcTag: string
  ): boolean {
    if (!SAFE_FOR_XML) {
      return false;
    }

    if (lcName === 'patchsrc') {
      return true;
    }

    return lcName === 'for' && lcTag !== 'label' && lcTag !== 'output';
  };

  /**
   * IN_PLACE pre-pass: sever all patch linkage before the walk, so no patch
   * can fire mid-walk into a part of the tree the walker already passed.
   * Removes range markers (processing instructions, comments with markup)
   * and strips linkage attributes. It cannot undo a patch that already fired.
   *
   * TODO: if the shipped feature can patch through `for` on <label>/<output>,
   * drop that pair here too.
   *
   * @param root the in-place root to sweep
   */
  const _neutralizePatchLinkage = function (root: Node): void {
    if (!SAFE_FOR_XML) {
      return;
    }

    _walkTree(root, (node) => {
      const nodeType = _readNodeType(node);

      // Range markers: processing instructions, comments with markup
      if (
        nodeType === NODE_TYPE.processingInstruction ||
        (nodeType === NODE_TYPE.comment &&
          regExpTest(EXPRESSIONS.COMMENT_MARKUP_PROBE, (node as any).data))
      ) {
        try {
          remove(node);
        } catch (_) {
          /* Best effort */
        }

        return false;
      }

      // Linkage attributes
      if (nodeType === NODE_TYPE.element) {
        const element = node as Element;
        const lcTag = transformCaseFunc(_readNodeName(node));
        try {
          if (element.hasAttribute && element.hasAttribute('patchsrc')) {
            element.removeAttribute('patchsrc');
          }

          if (
            element.hasAttribute &&
            element.hasAttribute('for') &&
            _isPatchLinkageAttribute('for', lcTag)
          ) {
            element.removeAttribute('for');
          }
        } catch (_) {
          /* Clobbered methods on a doomed node */
        }
      }

      return true;
    });
  };

  /**
   * _initDocument
   *
   * @param dirty - a string of dirty markup
   * @return a DOM, filled with the dirty markup
   */
  const _initDocument = function (dirty: string): Document {
    /* Create a HTML document */
    let doc = null;
    let leadingWhitespace = null;

    if (FORCE_BODY) {
      dirty = '<remove></remove>' + dirty;
    } else {
      /* If FORCE_BODY isn't used, leading whitespace needs to be preserved manually */
      const matches = stringMatch(dirty, EXPRESSIONS.LEADING_WHITESPACE);
      leadingWhitespace = matches && matches[0];
    }

    if (
      PARSER_MEDIA_TYPE === 'application/xhtml+xml' &&
      NAMESPACE === HTML_NAMESPACE
    ) {
      // Root of XHTML doc must contain xmlns declaration (see https://www.w3.org/TR/xhtml1/normative.html#strict)
      dirty =
        '<html xmlns="http://www.w3.org/1999/xhtml"><head></head><body>' +
        dirty +
        '</body></html>';
    }

    const dirtyPayload = trustedTypesPolicy ? _createTrustedHTML(dirty) : dirty;
    /*
     * Use the DOMParser API by default, fallback later if needs be
     * DOMParser not work for svg when has multiple root element.
     */
    if (NAMESPACE === HTML_NAMESPACE) {
      try {
        doc = new DOMParser().parseFromString(dirtyPayload, PARSER_MEDIA_TYPE);
      } catch (_) {}
    }

    /* Use createHTMLDocument in case DOMParser is not available */
    if (!doc || !doc.documentElement) {
      doc = implementation.createDocument(NAMESPACE, 'template', null);
      try {
        doc.documentElement.innerHTML = IS_EMPTY_INPUT
          ? emptyHTML
          : dirtyPayload;
      } catch (_) {
        // Syntax error if dirtyPayload is invalid xml
      }
    }

    const body = doc.body || doc.documentElement;

    if (dirty && leadingWhitespace) {
      body.insertBefore(
        document.createTextNode(leadingWhitespace),
        body.childNodes[0] || null
      );
    }

    /* Work on whole document or just its body */
    if (NAMESPACE === HTML_NAMESPACE) {
      return getElementsByTagName.call(
        doc,
        WHOLE_DOCUMENT ? 'html' : 'body'
      )[0];
    }

    return WHOLE_DOCUMENT ? doc.documentElement : body;
  };

  /**
   * Creates a NodeIterator over `root`. ownerDocument is read through the
   * cached getter: a form child named "ownerDocument" shadows the direct
   * read and would make createNodeIterator throw.
   *
   * @param root The node to start traversing on.
   * @param characterDataOnly whether to skip elements
   * @return The created NodeIterator
   */
  const _createNodeIterator = function (
    root: Node,
    characterDataOnly = false
  ): NodeIterator {
    const doc = getOwnerDocument ? getOwnerDocument(root) : root.ownerDocument;
    return createNodeIterator.call(
      doc || root,
      root,
      // eslint-disable-next-line no-bitwise
      (characterDataOnly ? 0 : NodeFilter.SHOW_ELEMENT) |
        NodeFilter.SHOW_COMMENT |
        NodeFilter.SHOW_TEXT |
        NodeFilter.SHOW_PROCESSING_INSTRUCTION |
        NodeFilter.SHOW_CDATA_SECTION,
      null
    );
  };

  /**
   * Replace template expression syntax (mustache, ERB, template
   * literal) with a space; shared by all SAFE_FOR_TEMPLATES scrub
   * sites. Order matters: mustache, then ERB, then template literal.
   *
   * @param value the string to scrub
   * @returns the scrubbed string
   */
  const _stripTemplateExpressions = function (value: string): string {
    value = stringReplace(value, MUSTACHE_EXPR, ' ');
    value = stringReplace(value, ERB_EXPR, ' ');
    value = stringReplace(value, TMPLIT_EXPR, ' ');
    return value;
  };

  /**
   * Strips template expressions from the character data under `node`,
   * template contents included. Runs after the walk, since an expression can
   * also form when a removed element leaves two text nodes adjacent. Works on
   * the nodes rather than on markup, which keeps node references intact and
   * sees `<%` unescaped. Attribute values are handled in _sanitizeAttributes.
   *
   * @param node The root element whose character data should be scrubbed.
   */
  const _scrubTemplateExpressions = function (node: Element): void {
    _scrubOwnCharacterData(node);

    // NodeIterator does not descend into <template>.content per the DOM spec,
    // so we must explicitly recurse into each template's content fragment,
    // mirroring the approach used by _sanitizeShadowDOM.
    const templates = node.querySelectorAll?.('template');
    if (templates) {
      arrayForEach(templates, (tmpl: HTMLTemplateElement) => {
        if (_isDocumentFragment(tmpl.content)) {
          _scrubTemplateExpressions(tmpl.content as unknown as Element);
        }
      });
    }
  };

  /**
   * Normalizes `node` and strips template expressions from its own character
   * data. Template contents and shadow roots are not entered, their own
   * _sanitizeShadowDOM call scrubs them.
   *
   * @param node The root whose own character data should be scrubbed.
   */
  const _scrubOwnCharacterData = function (node: Element): void {
    node.normalize();
    const walker = _createNodeIterator(node, true);

    let currentNode = walker.nextNode() as CharacterData | null;
    while (currentNode) {
      currentNode.data = _stripTemplateExpressions(currentNode.data);
      currentNode = walker.nextNode() as CharacterData | null;
    }
  };

  /**
   * Detects DOM clobbering on a form, the only element whose named children
   * shadow its own properties. Each probe compares a direct read with what
   * the property has to be.
   *
   * @param element element to check for clobbering attacks
   * @return true if clobbered, false if safe
   */
  const _isClobbered = function (element: Element): boolean {
    // Without a readable tag name there is nothing to check here; the
    // caller's other defences still apply
    const realTagName = getNodeName ? getNodeName(element) : null;
    if (typeof realTagName !== 'string') {
      return false;
    }

    if (transformCaseFunc(realTagName) !== 'form') {
      return false;
    }

    return (
      typeof element.nodeName !== 'string' ||
      typeof element.textContent !== 'string' ||
      typeof element.removeChild !== 'function' ||
      // Direct and cached reads differ when a child is named "attributes"
      element.attributes !== getAttributes(element) ||
      typeof element.removeAttribute !== 'function' ||
      // Without these two, attribute removal falls back to removal by name,
      // which misses case-preserved names
      typeof element.removeAttributeNode !== 'function' ||
      typeof element.getAttributeNode !== 'function' ||
      typeof element.setAttribute !== 'function' ||
      typeof element.namespaceURI !== 'string' ||
      typeof element.insertBefore !== 'function' ||
      typeof element.hasChildNodes !== 'function' ||
      // Same comparison as for attributes
      element.nodeType !== getNodeType(element) ||
      element.childNodes !== getChildNodes(element)
    );
  };

  /**
   * Reads nodeType through the cached getter, so the result holds for nodes
   * from any realm (GHSA-4w3q-35jp-p934) and cannot be clobbered.
   *
   * @param value anything
   * @return the node type, or null if value is not a DOM node
   */
  const _nodeTypeOf = function (value: unknown): number | null {
    if (!getNodeType || typeof value !== 'object' || value === null) {
      return null;
    }

    try {
      const nodeType = getNodeType(value as Node);
      return typeof nodeType === 'number' ? nodeType : null;
    } catch (_) {
      return null;
    }
  };

  const _isDocumentFragment = function (value: unknown): boolean {
    return _nodeTypeOf(value) === NODE_TYPE.documentFragment;
  };

  const _isNode = function (value: unknown): value is Node {
    return _nodeTypeOf(value) !== null;
  };

  function _executeHooks<T extends HookFunction>(
    hooks: HookFunction[],
    currentNode: Parameters<T>[0],
    data: Parameters<T>[1]
  ): void {
    if (hooks.length === 0) {
      return;
    }

    arrayForEach(hooks, (hook: T) => {
      hook.call(DOMPurify, currentNode, data, CONFIG);
    });
  }

  /**
   * Structural-threat checks that condemn a node regardless of the
   * allowlists: mXSS via namespace confusion, risky CSS construction,
   * processing instructions, markup-bearing comments. Pure predicate;
   * the caller removes. Check order is load-bearing.
   *
   * @param currentNode the node to inspect
   * @param tagName the node's transformCaseFunc'd tag name
   * @param nodeType the node's type, read through the cached getter
   * @return true if the node must be removed
   */
  const _isUnsafeNode = function (
    currentNode: any,
    tagName: string,
    nodeType: number
  ): boolean {
    /* Detect mXSS attempts abusing namespace confusion */
    if (
      SAFE_FOR_XML &&
      nodeType === NODE_TYPE.element &&
      currentNode.hasChildNodes() &&
      !_isNode(currentNode.firstElementChild) &&
      regExpTest(EXPRESSIONS.ELEMENT_MARKUP_PROBE, currentNode.textContent) &&
      regExpTest(EXPRESSIONS.ELEMENT_MARKUP_PROBE, currentNode.innerHTML)
    ) {
      return true;
    }

    /* Literal-text elements holding an element child or markup-like text,
       see LITERAL_TEXT_ELEMENTS. Reads textContent, as an XML document
       escapes innerHTML. Elements only: a processing instruction's nodeName
       is its target and can collide with these names. */
    if (
      SAFE_FOR_XML &&
      LITERAL_TEXT_ELEMENTS[tagName] &&
      nodeType === NODE_TYPE.element &&
      _readNamespaceURI(currentNode) === HTML_NAMESPACE &&
      (_isNode(currentNode.firstElementChild) ||
        (typeof currentNode.textContent === 'string' &&
          regExpTest(
            EXPRESSIONS.ELEMENT_MARKUP_PROBE,
            currentNode.textContent
          )))
    ) {
      return true;
    }

    /* Remove any occurrence of processing instructions */
    if (nodeType === NODE_TYPE.processingInstruction) {
      return true;
    }

    /* Remove any kind of possibly harmful comments */
    if (
      SAFE_FOR_XML &&
      nodeType === NODE_TYPE.comment &&
      regExpTest(EXPRESSIONS.COMMENT_MARKUP_PROBE, currentNode.data)
    ) {
      return true;
    }

    return false;
  };

  /**
   * Evaluate a CUSTOM_ELEMENT_HANDLING check (a RegExp or a predicate
   * function, per the validation in _parseConfig) against a name.
   * Additional arguments are forwarded to predicate functions - the
   * attributeNameCheck predicate receives the tag name as its second
   * argument. A null/absent check never matches.
   *
   * @param check the configured tagNameCheck / attributeNameCheck value
   * @param name the name to test
   * @param args extra arguments forwarded to a predicate function
   * @return true if the check matches the name
   */
  const _matchesNameCheck = function (
    check: unknown,
    name: string,
    ...args: unknown[]
  ): boolean {
    if (check instanceof RegExp) {
      return regExpTest(check, name);
    }

    if (check instanceof Function) {
      return Boolean(check(name, ...args));
    }

    return false;
  };

  /**
   * Handles a node whose tag is forbidden or not allowlisted: hoists its
   * content per KEEP_CONTENT and removes it. The one exception is a custom
   * element allowed via CUSTOM_ELEMENT_HANDLING, which is kept.
   *
   * @param currentNode the disallowed node
   * @param tagName the node's transformCaseFunc'd tag name
   * @return true if the node was removed, false if kept
   */
  const _sanitizeDisallowedNode = function (
    currentNode: any,
    tagName: string,
    root: Node
  ): boolean {
    /* Check if we have a custom element to handle */
    if (
      !FORBID_TAGS[tagName] &&
      _isBasicCustomElement(tagName) &&
      _matchesNameCheck(CUSTOM_ELEMENT_HANDLING.tagNameCheck, tagName)
    ) {
      return false;
    }

    /* Keep content except for bad-listed elements */
    if (
      KEEP_CONTENT &&
      !FORBID_CONTENTS[tagName] &&
      /* XHTML keeps the tag's case, the default list is lowercase */
      !FORBID_CONTENTS[stringToLowerCase(tagName)]
    ) {
      const parentNode = getParentNode(currentNode);
      const childNodes = getChildNodes(currentNode);

      if (childNodes && parentNode) {
        const childCount = childNodes.length;

        /* Move the children up rather than cloning them: linear for nested
           disallowed elements, and a child with a queued event (a loading
           image) gets sanitized instead of staying detached and armed. Only
           the walk root's children are cloned, as the result is serialized
           from inside the root. Tail to head, as childNodes is live. */
        for (let i = childCount - 1; i >= 0; --i) {
          const hoisted =
            currentNode === root
              ? cloneNode(childNodes[i], true)
              : childNodes[i];
          parentNode.insertBefore(hoisted, getNextSibling(currentNode));
        }
      }
    }

    _forceRemove(currentNode);
    return true;
  };

  /**
   * Forks an allowlist off its shared binding (the instance default or the
   * setConfig() capture) before a hook sees it, so a hook's widening stays
   * within the call. A set that is already call-local is returned as is.
   *
   * @param hookList the uponSanitize* hook array for this event
   * @param set the current ALLOWED_TAGS / ALLOWED_ATTR binding
   * @param defaultSet the per-instance DEFAULT_ALLOWED_* constant
   * @param setConfigSet the captured setConfig() binding, or null
   * @return a call-local clone if a hook is present and set is still shared,
   *   else set unchanged
   */
  const _forkSharedAllowlist = function <T extends Record<string, any>>(
    hookList: unknown[],
    set: T,
    defaultSet: T,
    setConfigSet: T | null
  ): T {
    if (hookList.length === 0) {
      return set;
    }

    return set === defaultSet || set === setConfigSet ? cloneSet(set) : set;
  };

  /**
   * A hook may have detached the node it was called for. If so, treat it as
   * removed and stop processing it; the walk root is exempt. On the IN_PLACE
   * path the detached subtree is neutralized right away.
   *
   * @param currentNode the node a hook may have detached
   * @param root the current walk root
   * @return true if the node was detached
   */
  const _handleHookDetachedNode = function (
    currentNode: Node,
    root: Node
  ): boolean {
    if (currentNode === root || getParentNode(currentNode) !== null) {
      return false;
    }

    if (IN_PLACE) {
      _neutralizeSubtree(currentNode);
    }

    return true;
  };

  /**
   * _sanitizeElements
   *
   * @protect nodeName
   * @protect textContent
   * @protect removeChild
   * @param currentNode to check for permission to exist
   * @return true if node was killed, false if left alive
   */
  const _sanitizeElements = function (currentNode: any, root: Node): boolean {
    /* IN_PLACE: remember the node was processed (see _sanitizeUnvisitedNodes). */
    _markVisited(currentNode);

    /* Execute a hook if present */
    _executeHooks(hooks.beforeSanitizeElements, currentNode, null);

    /* A hook may have detached the node - treat it as removed (see
       _handleHookDetachedNode for the full rationale). */
    if (_handleHookDetachedNode(currentNode, root)) {
      return true;
    }

    /* Check if element is clobbered or can clobber */
    if (_isClobbered(currentNode)) {
      _forceRemove(currentNode);
      return true;
    }

    /* Now let's check the element's type and name */
    const tagName = transformCaseFunc(_readNodeName(currentNode));
    const nodeType = _readNodeType(currentNode);

    /* The hook gets ALLOWED_TAGS by reference; fork it off a shared binding
       first, so widening stays scoped to this call. */
    ALLOWED_TAGS = _forkSharedAllowlist(
      hooks.uponSanitizeElement,
      ALLOWED_TAGS,
      DEFAULT_ALLOWED_TAGS,
      SET_CONFIG_ALLOWED_TAGS
    );

    /* Execute a hook if present */
    _executeHooks(hooks.uponSanitizeElement, currentNode, {
      tagName,
      allowedTags: ALLOWED_TAGS,
    });

    /* The uponSanitizeElement hook may have detached the node, exactly as
       above (see _handleHookDetachedNode for the full rationale). */
    if (_handleHookDetachedNode(currentNode, root)) {
      return true;
    }

    /* Remove mXSS vectors, processing instructions and risky comments */
    if (_isUnsafeNode(currentNode, tagName, nodeType)) {
      _forceRemove(currentNode);
      return true;
    }

    /* Remove element if anything forbids its presence */
    if (
      FORBID_TAGS[tagName] ||
      (!(
        EXTRA_ELEMENT_HANDLING.tagCheck instanceof Function &&
        EXTRA_ELEMENT_HANDLING.tagCheck(tagName)
      ) &&
        !ALLOWED_TAGS[tagName])
    ) {
      const removed = _sanitizeDisallowedNode(currentNode, tagName, root);

      /* A kept custom element still gets afterSanitizeElements, like any
         allowed element (GHSA-c2j3-45gr-mqc4). */
      if (removed === false) {
        _executeHooks(hooks.afterSanitizeElements, currentNode, null);

        /* The hook may have detached the kept custom element. Same
           IN_PLACE hazard as the before/upon sites: neutralize the
           detached subtree before the walker skips past it (see
           _handleHookDetachedNode). */
        if (_handleHookDetachedNode(currentNode, root)) {
          return true;
        }
      }

      return removed;
    }

    /* Check whether element has a valid namespace. nodeType comes from the
       cached getter, which also holds for foreign-realm nodes
       (GHSA-hpcv-96wg-7vj8). */
    if (nodeType === NODE_TYPE.element && !_checkValidNamespace(currentNode)) {
      _forceRemove(currentNode);
      return true;
    }

    /* Make sure that older browsers don't get fallback-tag mXSS */
    if (
      (tagName === 'noscript' ||
        tagName === 'noembed' ||
        tagName === 'noframes') &&
      regExpTest(EXPRESSIONS.FALLBACK_TAG_CLOSE, currentNode.innerHTML)
    ) {
      _forceRemove(currentNode);
      return true;
    }

    /* Sanitize element content to be template-safe */
    if (SAFE_FOR_TEMPLATES && nodeType === NODE_TYPE.text) {
      const text = currentNode.textContent;
      const content = _stripTemplateExpressions(text);

      if (text !== content) {
        arrayPush(DOMPurify.removed, { element: currentNode.cloneNode() });
        currentNode.textContent = content;
      }
    }

    /* Execute a hook if present */
    _executeHooks(hooks.afterSanitizeElements, currentNode, null);

    /* A node detached by this hook is not visited again, so report it as
       removed. */
    return _handleHookDetachedNode(currentNode, root);
  };

  /**
   * _isValidAttribute
   *
   * @param lcTag Lowercase tag name of containing element.
   * @param lcName Lowercase attribute name.
   * @param value Attribute value.
   * @return Returns true if `value` is valid, otherwise false.
   */
  // eslint-disable-next-line complexity
  const _isValidAttribute = function (
    lcTag: string,
    lcName: string,
    value: string
  ): boolean {
    /* FORBID_ATTR must always win, even if ADD_ATTR predicate would allow it */
    if (FORBID_ATTR[lcName]) {
      return false;
    }

    /* Patch-linkage attributes of declarative partial updates
       (https://github.com/WICG/declarative-partial-updates). The patch itself
       is applied at parse or connection time, so the walk already sees the
       expanded tree. Dropping the linkage keeps it from expanding again in
       the caller's context. */
    if (_isPatchLinkageAttribute(lcName, lcTag)) {
      return false;
    }

    /* Make sure attribute cannot clobber */
    if (
      SANITIZE_DOM &&
      (lcName === 'id' || lcName === 'name') &&
      (value in document || value in formElement)
    ) {
      return false;
    }

    const nameIsPermitted =
      ALLOWED_ATTR[lcName] ||
      (EXTRA_ELEMENT_HANDLING.attributeCheck instanceof Function &&
        EXTRA_ELEMENT_HANDLING.attributeCheck(lcName, lcTag));

    /* Allow valid data-* attributes: At least one character after "-"
        (https://html.spec.whatwg.org/multipage/dom.html#embedding-custom-non-visible-data-with-the-data-*-attributes)
        XML-compatible (https://html.spec.whatwg.org/multipage/infrastructure.html#xml-compatible and http://www.w3.org/TR/xml/#d0e804)
        We don't need to check the value; it's always URI safe. */
    if (ALLOW_DATA_ATTR && regExpTest(DATA_ATTR, lcName)) {
      return true;
    }

    /* Allow valid aria-* attributes, the value is always URI safe */
    if (ALLOW_ARIA_ATTR && regExpTest(ARIA_ATTR, lcName)) {
      return true;
    }

    /* A name outside the allowlist is only acceptable on custom-element
       terms. The value checks below are skipped then, as custom elements
       define their attributes at their own discretion. */
    if (!nameIsPermitted) {
      return (
        // Condition a) covers a basically valid custom element tag name whose
        // tag passes the configured tagNameCheck and whose attribute name
        // passes the configured attributeNameCheck ...
        (_isBasicCustomElement(lcTag) &&
          _matchesNameCheck(CUSTOM_ELEMENT_HANDLING.tagNameCheck, lcTag) &&
          _matchesNameCheck(
            CUSTOM_ELEMENT_HANDLING.attributeNameCheck,
            lcName,
            lcTag
          )) ||
        // Condition b) covers an `is` attribute whose value passes the
        // configured tagNameCheck while customized built-in elements are
        // allowed.
        (lcName === 'is' &&
          CUSTOM_ELEMENT_HANDLING.allowCustomizedBuiltInElements &&
          _matchesNameCheck(CUSTOM_ELEMENT_HANDLING.tagNameCheck, value))
      );
    }

    /* Check value is safe. First, is attr inert? If so, is safe */
    if (URI_SAFE_ATTRIBUTES[lcName]) {
      return true;
    }

    /* Check no script, data or unknown possibly unsafe URI
        unless we know URI values are safe for that attribute */
    const compactValue = stringReplace(value, ATTR_WHITESPACE, '');
    if (regExpTest(IS_ALLOWED_URI, compactValue)) {
      return true;
    }

    /* Keep image data URIs alive if src/xlink:href is allowed */
    /* Further prevent gadget XSS for dynamically built script tags */
    if (
      (lcName === 'src' || lcName === 'xlink:href' || lcName === 'href') &&
      lcTag !== 'script' &&
      stringIndexOf(value, 'data:') === 0 &&
      DATA_URI_TAGS[lcTag]
    ) {
      return true;
    }

    /* Allow unknown protocols: This provides support for links that
        are handled by protocol handlers which may be unknown ahead of
        time, e.g. fb:, spotify: */
    if (
      ALLOW_UNKNOWN_PROTOCOLS &&
      !regExpTest(IS_SCRIPT_OR_DATA, compactValue)
    ) {
      return true;
    }

    /* Only an empty (binary) value remains safe at this point;
       anything else is presumed unsafe, do not add it back */
    return !value;
  };

  /* Names the HTML spec reserves from valid-custom-element-name; these must
   * never be treated as basic custom elements even when a permissive
   * CUSTOM_ELEMENT_HANDLING.tagNameCheck is configured. */
  const RESERVED_CUSTOM_ELEMENT_NAMES = addToSet({}, [
    'annotation-xml',
    'color-profile',
    'font-face',
    'font-face-format',
    'font-face-name',
    'font-face-src',
    'font-face-uri',
    'missing-glyph',
  ]);

  /**
   * _isBasicCustomElement
   * checks if at least one dash is included in tagName, and it's not the first char
   * for more sophisticated checking see https://github.com/sindresorhus/validate-element-name
   *
   * @param tagName name of the tag of the node to sanitize
   * @returns Returns true if the tag name meets the basic criteria for a custom element, otherwise false.
   */
  const _isBasicCustomElement = function (tagName: string): boolean {
    return (
      !RESERVED_CUSTOM_ELEMENT_NAMES[stringToLowerCase(tagName)] &&
      regExpTest(CUSTOM_ELEMENT, tagName)
    );
  };

  /**
   * Wrap an attribute value in the matching Trusted Types object when
   * the active policy requires it. Namespaced attributes pass through
   * unchanged (no TT support yet, see
   * https://bugs.chromium.org/p/chromium/issues/detail?id=1305293).
   *
   * @param lcTag lowercase tag name of the containing element
   * @param lcName lowercase attribute name
   * @param namespaceURI the attribute's namespace, if any
   * @param value the attribute value to wrap
   * @return the value, wrapped when Trusted Types demand it
   */
  const _applyTrustedTypesToAttribute = function (
    lcTag: string,
    lcName: string,
    namespaceURI: string | null,
    value: string
  ): string {
    if (
      trustedTypesPolicy &&
      typeof trustedTypes === 'object' &&
      typeof trustedTypes.getAttributeType === 'function' &&
      !namespaceURI
    ) {
      switch (trustedTypes.getAttributeType(lcTag, lcName)) {
        case 'TrustedHTML': {
          return _createTrustedHTML(value);
        }

        case 'TrustedScriptURL': {
          return _createTrustedScriptURL(value);
        }

        default: {
          break;
        }
      }
    }

    return value;
  };

  /**
   * Writes a changed attribute value back. If the new value clobbers, the
   * element is removed; if the write fails, the attribute is.
   *
   * @param currentNode the element carrying the attribute
   * @param name the attribute name as present on the element
   * @param namespaceURI the attribute's namespace, if any
   * @param value the new attribute value
   * @return true if the value was written without introducing clobbering
   */
  const _setAttributeValue = function (
    currentNode: Element,
    name: string,
    namespaceURI: string | null,
    value: string
  ): boolean {
    try {
      if (namespaceURI) {
        currentNode.setAttributeNS(namespaceURI, name, value);
      } else {
        /* Fallback to setAttribute() for browser-unrecognized namespaces e.g. "x-schema". */
        currentNode.setAttribute(name, value);
      }

      if (_isClobbered(currentNode)) {
        _forceRemove(currentNode);
        return false;
      }

      return true;
    } catch (_) {
      _removeAttribute(name, currentNode);
      return false;
    }
  };

  /**
   * Value checks that apply before a hook can force-keep an attribute. Also
   * used by isValidAttribute(), so it never approves a value that sanitize()
   * would strip.
   *
   * @param name the attribute name as found on the node (case preserved)
   * @param value the attribute value
   * @returns true if the attribute must be removed because of its value
   */
  const _isUnsafeAttributeValue = function (
    name: string,
    value: string
  ): boolean {
    /* Work around a security issue with comments inside attributes, and
       raw-text closers that re-contextualize the value on a later reparse */
    if (SAFE_FOR_XML && regExpTest(EXPRESSIONS.ATTR_VALUE_BREAKOUT, value)) {
      return true;
    }

    /* Make sure we cannot easily use animated hrefs, even if animations are
       allowed. Case-insensitive, as XHTML keeps the attributeName spelling
       (GHSA-c6gr-qvv4-5v3f). */
    return (
      stringToLowerCase(name) === 'attributename' &&
      stringIndexOf(value, 'href') !== -1
    );
  };

  /**
   * _sanitizeAttributes
   *
   * @protect attributes
   * @protect nodeName
   * @protect removeAttribute
   * @protect setAttribute
   *
   * @param currentNode to sanitize
   * @param root the current walk root
   */
  const _sanitizeAttributes = function (
    currentNode: Element,
    root: Node
  ): void {
    /* Execute a hook if present */
    _executeHooks(hooks.beforeSanitizeAttributes, currentNode, null);

    /* A hook may have detached the node, see _handleHookDetachedNode */
    if (_handleHookDetachedNode(currentNode, root)) {
      return;
    }

    const { attributes } = currentNode;

    /* Check if we have attributes; if not we might have a text node */
    if (!attributes || _isClobbered(currentNode)) {
      return;
    }

    /* Same as for uponSanitizeElement: fork before a hook can see it. */
    ALLOWED_ATTR = _forkSharedAllowlist(
      hooks.uponSanitizeAttribute,
      ALLOWED_ATTR,
      DEFAULT_ALLOWED_ATTR,
      SET_CONFIG_ALLOWED_ATTR
    );

    const hookEvent = {
      attrName: '',
      attrValue: '',
      keepAttr: true,
      allowedAttributes: ALLOWED_ATTR,
      forceKeepAttr: undefined,
    };
    let l = attributes.length;
    const lcTag = transformCaseFunc(_readNodeName(currentNode));

    /* Go backwards over all attributes; safely remove bad ones */
    while (l--) {
      const attr = attributes[l];
      const { name, namespaceURI, value: attrValue } = attr;
      const lcName = transformCaseFunc(name);

      const initValue = attrValue;
      let value = name === 'value' ? initValue : stringTrim(initValue);

      /* Set when this attribute pushed a DOMPurify.removed record that the
         write-back below takes off again. Only the SANITIZE_NAMED_PROPS
         remove-and-recreate does; any other write-back must not pop, or it
         would drop an unrelated removal record. */
      let recreatedNamedProp = false;

      /* Execute a hook if present */
      hookEvent.attrName = lcName;
      hookEvent.attrValue = value;
      hookEvent.keepAttr = true;
      hookEvent.forceKeepAttr = undefined; // Allows developers to see this is a property they can set
      _executeHooks(hooks.uponSanitizeAttribute, currentNode, hookEvent);
      value = hookEvent.attrValue;

      /* Full DOM Clobbering protection via namespace isolation,
       * Prefix id and name attributes with `user-content-`
       */
      if (
        SANITIZE_NAMED_PROPS &&
        (lcName === 'id' || lcName === 'name') &&
        stringIndexOf(value, SANITIZE_NAMED_PROPS_PREFIX) !== 0
      ) {
        // Remove the attribute with this value
        _removeAttribute(name, currentNode, attr);
        // Prefix the value and later re-create the attribute with the sanitized value
        value = SANITIZE_NAMED_PROPS_PREFIX + value;
        // This attribute owns the record just pushed; its recreate writeback
        // is the one allowed to pop it back off.
        recreatedNamedProp = true;
      }
      // Else: already prefixed, and the prefix is the protection

      /* Value checks that apply regardless of hooks (comment / raw-text
         closers in the value, animated hrefs); see _isUnsafeAttributeValue. */
      if (_isUnsafeAttributeValue(name, value)) {
        _removeAttribute(name, currentNode, attr);
        continue;
      }

      /* Did the hooks force-keep the attribute? */
      if (hookEvent.forceKeepAttr) {
        continue;
      }

      /* Did the hooks approve of the attribute? */
      if (!hookEvent.keepAttr) {
        _removeAttribute(name, currentNode, attr);
        continue;
      }

      /* Work around a security issue in jQuery 3.0 */
      if (
        !ALLOW_SELF_CLOSE_IN_ATTR &&
        regExpTest(EXPRESSIONS.SELF_CLOSING_TAG, value)
      ) {
        _removeAttribute(name, currentNode, attr);
        continue;
      }

      /* Sanitize attribute content to be template-safe */
      if (SAFE_FOR_TEMPLATES) {
        value = _stripTemplateExpressions(value);
      }

      /* Is `value` valid for this attribute? */
      if (!_isValidAttribute(lcTag, lcName, value)) {
        _removeAttribute(name, currentNode, attr);
        continue;
      }

      /* Handle attributes that require Trusted Types */
      value = _applyTrustedTypesToAttribute(lcTag, lcName, namespaceURI, value);

      /* Handle invalid data-* attribute set by try-catching it */
      if (value !== initValue) {
        const cleanWrite = _setAttributeValue(
          currentNode,
          name,
          namespaceURI,
          value
        );

        if (cleanWrite && recreatedNamedProp) {
          arrayPop(DOMPurify.removed);
        }
      }
    }

    /* Execute a hook if present */
    _executeHooks(hooks.afterSanitizeAttributes, currentNode, null);

    /* Same detach re-check as after beforeSanitizeAttributes: this is the
       last hook that runs for the node, so a detach here would otherwise
       hand the caller a live, handler-bearing subtree. */
    _handleHookDetachedNode(currentNode, root);
  };

  /**
   * Sanitizes one node: the node itself, its attributes and, for a
   * template, its content.
   *
   * @param node the node to sanitize
   * @param root the current walk root
   */
  const _sanitizeNode = function (node: any, root: Node): void {
    _sanitizeElements(node, root);
    _sanitizeAttributes(node, root);

    if (_isDocumentFragment(node.content)) {
      _sanitizeShadowDOM(node.content);
    }
  };

  /**
   * _sanitizeShadowDOM
   *
   * @param fragment to iterate over recursively
   */
  const _sanitizeShadowDOM = function (fragment: DocumentFragment): void {
    let shadowNode = null;
    const shadowIterator = _createNodeIterator(fragment);

    /* Execute a hook if present */
    _executeHooks(hooks.beforeSanitizeShadowDOM, fragment, null);

    while ((shadowNode = shadowIterator.nextNode())) {
      /* Execute a hook if present */
      _executeHooks(hooks.uponSanitizeShadowNode, shadowNode, null);

      _sanitizeNode(shadowNode, fragment);

      /* NodeIterator does not enter shadow trees, so walk a shadow root
         hosted inside this fragment explicitly */
      if (_readNodeType(shadowNode) === NODE_TYPE.element) {
        const innerSr = getShadowRoot(shadowNode);
        if (_isDocumentFragment(innerSr)) {
          _sanitizeAttachedShadowRoots(innerSr);
          _sanitizeShadowDOM(innerSr);
        }
      }
    }

    /* An expression can form across text nodes once a separating element is
       removed, so scrub the fragment as a whole. Own data only: nested
       template contents and shadow roots are scrubbed by their own call.
       Runs before the hook, which should see the final fragment. */
    if (SAFE_FOR_TEMPLATES) {
      _scrubOwnCharacterData(fragment as unknown as Element);
    }

    /* Execute a hook if present */
    _executeHooks(hooks.afterSanitizeShadowDOM, fragment, null);
  };

  /**
   * Sanitizes every attached shadow root under `root`, since the node
   * iterator does not enter shadow trees. Needed for IN_PLACE input and for
   * DOM input whose clonable shadow roots were copied by importNode().
   *
   * @param root the subtree root to walk for attached shadow roots
   */
  const _sanitizeAttachedShadowRoots = function (root: Node): void {
    /* Explicit stack, so deep trees cannot overflow the call stack. An item is
       a node to walk or a shadow root to sanitize. Items are processed in
       reverse push order: a shadow root is walked first (finding nested
       roots), then sanitized, then template content, then the children. */
    const stack: Array<{ node: Node | null; shadow: DocumentFragment | null }> =
      [{ node: root, shadow: null }];

    while (stack.length > 0) {
      const item = stack.pop();

      if (item.shadow) {
        _sanitizeShadowDOM(item.shadow);
        continue;
      }

      const node = item.node;
      const nodeType = _readNodeType(node);
      const isElement = nodeType === NODE_TYPE.element;

      // Children, copied now since hooks may detach siblings mid-walk
      const childNodes = getChildNodes(node);
      if (childNodes) {
        for (let i = childNodes.length - 1; i >= 0; --i) {
          stack.push({ node: childNodes[i], shadow: null });
        }
      }

      // Template content
      if (isElement) {
        const rootName = getNodeName ? getNodeName(node) : null;
        if (
          typeof rootName === 'string' &&
          transformCaseFunc(rootName) === 'template'
        ) {
          const content = (node as HTMLTemplateElement).content;
          if (_isDocumentFragment(content)) {
            stack.push({ node: content, shadow: null });
          }
        }
      }

      // Shadow root: walk it, then sanitize it (realm-safe nodeType check)
      if (isElement) {
        const sr = getShadowRoot(node);
        if (_isDocumentFragment(sr)) {
          stack.push({ node: null, shadow: sr }, { node: sr, shadow: null });
        }
      }
    }
  };

  // eslint-disable-next-line complexity
  DOMPurify.sanitize = function (dirty, cfg = {}) {
    let body = null;
    let importedNode = null;
    let currentNode = null;
    let returnNode = null;
    /* Make sure we have a string to sanitize.
      DO NOT return early, as this will return the wrong type if
      the user has requested a DOM object rather than a string */
    IS_EMPTY_INPUT = !dirty;
    if (IS_EMPTY_INPUT) {
      dirty = '<!-->';
    }

    /* Stringify, in case dirty is an object */
    if (typeof dirty !== 'string' && !_isNode(dirty)) {
      dirty = stringifyValue(dirty);

      if (typeof dirty !== 'string') {
        throw typeErrorCreate('dirty is not a string, aborting');
      }
    }

    /* Return dirty HTML if DOMPurify cannot run */
    if (!DOMPurify.isSupported) {
      return dirty;
    }

    /* Assign config vars */
    if (SET_CONFIG) {
      /* Persistent setConfig() path: _parseConfig is skipped, so restore the
       * sets captured at setConfig() time. A hook's fork from a previous
       * call must not carry over. */
      ALLOWED_TAGS = SET_CONFIG_ALLOWED_TAGS;
      ALLOWED_ATTR = SET_CONFIG_ALLOWED_ATTR;
    } else {
      _parseConfig(cfg);
    }

    /* Clean up removed elements */
    DOMPurify.removed = [];

    /* Resolved per call: setConfig() skips _parseConfig, so writing IN_PLACE
       here would leak into later calls */
    const inPlace = IN_PLACE && typeof dirty !== 'string' && _isNode(dirty);
    /* IN_PLACE: the caller's nodes before any hook or custom element can run,
       and the visit tracking of an outer call this one may be nested in */
    let inPlaceNodes: Node[] = [];
    const outerVisited = IN_PLACE_VISITED;

    if (inPlace) {
      _neutralizePatchLinkage(dirty as Node);

      /* The root must be an allowed tag and not clobbered: a parentless root
         cannot be removed, so it would come back unsanitized. Its name is read
         through the cached getter, a clobbering child could shadow it. */
      const nn = _readNodeName(dirty as Node);
      if (typeof nn === 'string') {
        const tagName = transformCaseFunc(nn);
        if (!ALLOWED_TAGS[tagName] || FORBID_TAGS[tagName]) {
          _neutralizeRoot(dirty as Node);
          throw typeErrorCreate(
            'root node is forbidden and cannot be sanitized in-place'
          );
        }
      }

      if (_isClobbered(dirty as Element)) {
        _neutralizeRoot(dirty as Node);
        throw typeErrorCreate(
          'root node is clobbered and cannot be sanitized in-place'
        );
      }

      inPlaceNodes = _collectLiveNodes(dirty as Node);
      IN_PLACE_VISITED = setCreate();
    } else if (_isNode(dirty)) {
      /* If dirty is a DOM element, append to an empty document to avoid
         elements being stripped by the parser */
      body = _initDocument('<!---->');
      importedNode = body.ownerDocument.importNode(dirty, true);
      if (
        importedNode.nodeType === NODE_TYPE.element &&
        importedNode.nodeName === 'BODY'
      ) {
        /* Node is already a body, use as is */
        body = importedNode;
      } else if (importedNode.nodeName === 'HTML') {
        body = importedNode;
      } else {
        // eslint-disable-next-line unicorn/prefer-dom-node-append
        body.appendChild(importedNode);
      }

      /* Clonable shadow roots are copied by importNode(), and the iterator
         does not enter them. Walk from `body`: an imported fragment was
         emptied into it by the appendChild() above. */
      _sanitizeAttachedShadowRoots(body);
    } else {
      /* Exit directly if we have nothing to do */
      if (
        !RETURN_DOM &&
        !SAFE_FOR_TEMPLATES &&
        !WHOLE_DOCUMENT &&
        // eslint-disable-next-line unicorn/prefer-includes
        dirty.indexOf('<') === -1
      ) {
        return _signOutput(dirty);
      }

      /* Initialize the document to work on */
      body = _initDocument(dirty);

      /* Check we have a DOM node from the data */
      if (!body) {
        return RETURN_DOM ? null : RETURN_TRUSTED_TYPE ? emptyHTML : '';
      }
    }

    /* Remove first element node (ours) if FORCE_BODY is set */
    if (body && FORCE_BODY) {
      _forceRemove(body.firstChild);
    }

    /* Get node iterator */
    const walkRoot: Node = inPlace ? (dirty as Node) : body;

    /* If anything throws, an in-place tree is stripped bare before the error
       propagates, never left half-sanitized. */
    try {
      if (inPlace) {
        _sanitizeAttachedShadowRoots(dirty as Node);
      }

      const nodeIterator = _createNodeIterator(walkRoot);
      while ((currentNode = nodeIterator.nextNode())) {
        _sanitizeNode(currentNode, walkRoot);
      }

      if (inPlace) {
        _sanitizeUnvisitedNodes(dirty as Node, inPlaceNodes);
      }
    } catch (error) {
      if (inPlace) {
        _neutralizeRoot(dirty as Node);
        _neutralizeDiscarded(dirty as Node, inPlaceNodes);
      }

      throw error;
    } finally {
      IN_PLACE_VISITED = outerVisited;
    }

    if (inPlace) {
      // A removed root has no safe state to return
      if (_neutralizeDiscarded(dirty as Node, inPlaceNodes)) {
        throw typeErrorCreate(
          'a node selected for removal could not be safely returned; ' +
            'refusing to sanitize in place'
        );
      }

      if (SAFE_FOR_TEMPLATES) {
        _scrubTemplateExpressions(dirty as Element);
      }

      return dirty;
    }

    /* Return sanitized string or DOM */
    if (RETURN_DOM) {
      if (SAFE_FOR_TEMPLATES) {
        _scrubTemplateExpressions(body);
      }

      if (RETURN_DOM_FRAGMENT) {
        returnNode = createDocumentFragment.call(body.ownerDocument);

        while (body.firstChild) {
          // eslint-disable-next-line unicorn/prefer-dom-node-append
          returnNode.appendChild(body.firstChild);
        }
      } else {
        returnNode = body;
      }

      if (ALLOWED_ATTR.shadowroot || ALLOWED_ATTR.shadowrootmode) {
        /*
          AdoptNode() is not used because internal state is not reset
          (e.g. the past names map of a HTMLFormElement), this is safe
          in theory but we would rather not risk another attack vector.
          The state that is cloned by importNode() is explicitly defined
          by the specs.
        */
        returnNode = importNode.call(originalDocument, returnNode, true);
      }

      return returnNode;
    }

    const serialize = (): string =>
      WHOLE_DOCUMENT ? body.outerHTML : body.innerHTML;
    let serializedHTML = serialize();

    /* Scrub our tree, not the markup: a regex over markup cuts through
       tags. Only needed if the output holds a marker pair. Template
       content was already scrubbed by _sanitizeShadowDOM. */
    if (
      SAFE_FOR_TEMPLATES &&
      regExpTest(EXPRESSIONS.TMPL_MARKER_SERIALIZED, serializedHTML)
    ) {
      _scrubOwnCharacterData(body);
      serializedHTML = serialize();
    }

    /* Serialize doctype if allowed */
    if (
      WHOLE_DOCUMENT &&
      ALLOWED_TAGS['!doctype'] &&
      body.ownerDocument &&
      body.ownerDocument.doctype &&
      body.ownerDocument.doctype.name &&
      regExpTest(EXPRESSIONS.DOCTYPE_NAME, body.ownerDocument.doctype.name)
    ) {
      serializedHTML =
        '<!DOCTYPE ' + body.ownerDocument.doctype.name + '>\n' + serializedHTML;
    }

    return _signOutput(serializedHTML);
  };

  DOMPurify.setConfig = function (cfg = {}) {
    _parseConfig(cfg);
    SET_CONFIG = true;
    SET_CONFIG_ALLOWED_TAGS = ALLOWED_TAGS;
    SET_CONFIG_ALLOWED_ATTR = ALLOWED_ATTR;
  };

  DOMPurify.clearConfig = function () {
    CONFIG = null;
    SET_CONFIG = false;
    SET_CONFIG_ALLOWED_TAGS = null;
    SET_CONFIG_ALLOWED_ATTR = null;

    // Drop a caller-supplied Trusted Types policy; the next _parseConfig
    // restores the instance's own. See GHSA-vxr8-fq34-vvx9.
    trustedTypesPolicy = defaultTrustedTypesPolicy;
    emptyHTML = '';
  };

  DOMPurify.isValidAttribute = function (tag, attr, value) {
    /* Initialize shared config vars if necessary. */
    if (!CONFIG) {
      _parseConfig({});
    }

    const lcTag = transformCaseFunc(tag);
    const lcName = transformCaseFunc(attr);

    /* Apply the same value checks sanitize() applies to an attribute when no
       hook intervenes, so a value approved here is one sanitize() would also
       keep: comment / raw-text closers, animated hrefs, and the jQuery 3.0
       self-closing-tag pattern. */
    if (
      typeof value === 'string' &&
      (_isUnsafeAttributeValue(attr, value) ||
        (!ALLOW_SELF_CLOSE_IN_ATTR &&
          regExpTest(EXPRESSIONS.SELF_CLOSING_TAG, value)))
    ) {
      return false;
    }

    return _isValidAttribute(lcTag, lcName, value);
  };

  DOMPurify.addHook = function (
    entryPoint: keyof HooksMap,
    hookFunction: HookFunction
  ) {
    if (typeof hookFunction !== 'function') {
      return;
    }

    /* Reject unknown entry points. Without this, a non-hook key (e.g.
     * '__proto__') indexes off the prototype chain rather than a real
     * hook array, and arrayPush then writes to Object.prototype. Guard
     * with an own-property check against the known hook names. */
    if (!objectHasOwnProperty(hooks, entryPoint)) {
      return;
    }

    arrayPush(hooks[entryPoint], hookFunction);
  };

  DOMPurify.removeHook = function (
    entryPoint: keyof HooksMap,
    hookFunction: HookFunction
  ) {
    if (!objectHasOwnProperty(hooks, entryPoint)) {
      return undefined;
    }

    if (hookFunction !== undefined) {
      const index = arrayLastIndexOf(hooks[entryPoint], hookFunction);

      return index === -1
        ? undefined
        : arraySplice(hooks[entryPoint], index, 1)[0];
    }

    return arrayPop(hooks[entryPoint]);
  };

  DOMPurify.removeHooks = function (entryPoint: keyof HooksMap) {
    if (!objectHasOwnProperty(hooks, entryPoint)) {
      return;
    }

    hooks[entryPoint] = [];
  };

  DOMPurify.removeAllHooks = function () {
    hooks = _createHooksMap();
  };

  return DOMPurify;
}

export default createDOMPurify();
