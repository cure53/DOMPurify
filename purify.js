/* BOF */
DOMPurify = {};
DOMPurify.sanitize = function(a){
  /******* /***************************************************************
   ****** / * Don't allow script elements. Or event handlers.             *
   ***** /  * And careful with SVG's "values" attribute.                  *
   **** /   * Other than that, you can basically allow whatever you want. *
   *** /    * We'll make it safe for you.                                 *
   ** / *******************************************************************
   * /
    /* allowed element names */
    var ALLOWED_TAGS = [
        // HTML
        'a','abbr','acronym','address','area','article',
        'aside','audio','b','bdi','bdo','big','blink',
        'blockquote','body','br','button','canvas','caption',
        'center','cite','code','col','colgroup','content','data',
        'datalist','dd','decorator','del','details','dfn','dir',
        'div','dl','dt','element','em','fieldset',
        'figcaption','figure','font','footer','form','h1','h2','h3',
        'h4','h5','h6','header','hgroup','hr','html','i',
        'img','input','ins','kbd','label','legend','li','main','map',
        'mark','marquee','menu','menuitem','meter','nav',
        'nobr','ol','optgroup','option','output','p','pre',
        'progress','q','rp','rt','ruby','s','samp','section','select',
        'shadow','small','source','spacer','span','strike','strong','style',
        'sub','summary','sup','table','tbody','td','template','textarea',
        'tfoot','th','thead','time','tr','track','tt','u',
        'ul','var','video','wbr',
                        
        // SVG
        'svg','altglyph','altglyphdef','altglyphitem','animatecolor',
        'animatemotion','animatetransform','circle','clippath','defs',
        'desc','ellipse','font','g','glyph','glyphref','hkern','image',
        'line','lineargradient','marker','mask','metadata',
        'mpath','path','pattern','polygon','polyline','radialgradient',
        'rect','stop','switch','symbol','text','textpath','title',
        'tref','tspan','view','vkern',
        
        //MathML
        'math','menclose','merror','mfenced','mfrac','mglyph','mi','mlabeledtr',
        'mmuliscripts','mn','mo','mover','mpadded','mphantom','mroot','mrow',
        'ms','mpspace','msqrt','mystyle','msub','msup','msubsup','mtable',
        'mtd','mtext','mtr','munder','munderover'
    ];
    
    /* decide if custom data attributes are okay */
    var ALLOW_DATA_ATTRIBUTES = true;
    
    /* allowed attribute names */                    
    var ALLOWED_ATTR = [
        //HTML
        'name', 'id','href','action','class','title',
        'alt','src', 'type','height','width', 'method','rev','rel',
        'accept','align','autocomplete','xmlns',
        'bgcolor','border','checked','cite','color','cols',
        'colspan','coords','datetime','default','dir',
        'disabled','download','enctype','for','headers',
        'hidden','high','hreflang','ismap','label','lang',
        'list','loop', 'low','max','maxlength','media','min',
        'multiple','novalidate','open','optimum','pattern',
        'placeholder','poster','preload','pubdate','radiogroup',
        'readonly','required','reversed','rows','rowspan',
        'spellcheck','scope','selected','shape','size',
        'span','srclang','start','step','style','summary',
        'tabindex','usemap','value',
       
        //SVG
        'wrap','clip','cx','cy',
        'd','dy','dy','in','in2','k1','k2','k3','k4','mask','mode',
        'opacity','order','overflow','path','points','radius',
        'rx','ry','scale','stroke','stroke-width','transform',
        'u1','u2','r','x','y','x1','viewbox',
        'x2','y1','y2','z','fill',
        
        //MathML
        'accent','accentunder','bevelled','close','columnsalign','columnlines',
        'columnspan','denomalign','depth','display','displaystyle','fence',
        'frame','largeop','length','linethickness','lspace','lquote',
        'mathbackground','mathcolor','mathsize','mathvariant','maxsize',
        'minsize','movablelimits','notation','numalign','open','rowalign',
        'rowlines','rowspacing','rowspan','rspace','rquote','scriptlevel',
        'scriptminsize','scriptsizemultiplier','selection','separator',
        'separators','stretchy','subscriptshift','supscriptshift','symmetric',
        'voffset'
    ];
    
    /* Ideally, do not touch anything below this line */
    /* ______________________________________________ */
    
    /**
     * _createIterator
     * 
     * @param  document/fragment to create iterator for
     * @return iterator instance
     */
    var _createIterator = function(doc){
        return document.createNodeIterator(
            doc, 129, function() { return NodeFilter.FILTER_ACCEPT }, false
        );            
    }
    
    /**
     * _isClobbered
     * 
     * @param  element to check for clobbering attacks
     * @return true if clobbered, false if safe
     */
    var _isClobbered = function(elm){
        if((elm.children && !(elm.children instanceof HTMLCollection))
            || typeof elm.nodeName !== 'string'
            || typeof elm.nodeType !== 'number'
            || typeof elm.setAttribute !== 'function'
            || typeof elm.removeAttributeNode !== 'function'
            || typeof elm.attributes.item !== 'function'){
            return true;
        }
        return false;
    }
    
    /**
     * _sanitizeElements
     * 
     * @protect removeChild
     * @protect nodeType
     * @protect nodeName
     * @protect currentNode 
     * 
     * @param   node to check for permission to exist
     * @return  true if node was killed, false if left alive
     */
    var _sanitizeElements = function(currentNode){
        if(_isClobbered(currentNode) || currentNode.nodeType === 8 
                || ALLOWED_TAGS.indexOf(currentNode.nodeName.toLowerCase()
            ) === -1) {
            currentNode.parentNode.removeChild(currentNode);
            return true;
        }
        return false;
    }
            
    /**
     * _sanitizeAttributes
     * 
     * @protect attributes
     * @protect removeAttribiuteNode
     * @protect setAttribute
     * 
     * @param   node to sanitize
     * @return  void
     */
    var _sanitizeAttributes = function(currentNode){
        var regex = /^(\w+script|data):/gi;
        for(var attr = currentNode.attributes.length-1; attr>=0; attr--){
            var tmp  = currentNode.attributes[attr];
            currentNode.removeAttributeNode(currentNode.attributes[attr]);
            if(tmp instanceof Attr) {
                if((ALLOWED_ATTR.indexOf(tmp.name.toLowerCase()) > -1 || 
                 (ALLOW_DATA_ATTRIBUTES && tmp.name.match(/^data-[\w-]+/i))) 
                    && !tmp.value.replace(/[\x00-\x20]/g,'').match(regex)) {
                    currentNode.setAttribute(tmp.name, tmp.value);
                }
            }
        }            
    }    
        
    /**
     * _sanitizeShadowDOM
     * 
     * @param  fragment to iterate over recursively
     * @return void
     */
    var _sanitizeShadowDOM = function(fragment){
        var shadowNode; 
        var shadowIterator = _createIterator(fragment);
        while(shadowNode   = shadowIterator.nextNode()) {
            /* Sanitize tags and elements */
            if(_sanitizeElements(shadowNode)){
                continue;
            }
            /* Deep shadow DOM detected */
            if(shadowNode.content instanceof DocumentFragment){
                _sanitizeShadowDOM(shadowNode.content);
                 
            }
            /* Check attributes, sanitize if necessary */
            _sanitizeAttributes(shadowNode);
        }            
    }    
    
    /* Create documents to map markup to */
    var dom = document.implementation.createHTMLDocument('');
        dom.body.outerHTML=a;
        var body = dom.body;
    if(!(dom.body instanceof HTMLBodyElement)){
        var freshdom = document.implementation.createHTMLDocument('');    
        body = freshdom.getElementsByTagName.call(dom,'body')[0];
    }
    
    /* Get node iterator */
    var currentNode; 
    var nodeIterator = _createIterator(body);
    
    /* Now start iterating over the created document */
    while(currentNode = nodeIterator.nextNode()) {
        /* Sanitize tags and elements */
        if(_sanitizeElements(currentNode)){
            continue;
        }
        /* Shadow DOM detected, sanitize it */
        if(currentNode.content instanceof DocumentFragment){
            _sanitizeShadowDOM(currentNode.content);
        }
        /* Check attributes, sanitize if necessary */
        _sanitizeAttributes(currentNode);
    }
    
    /* serialize sanitized document, return a string */ 
    return body.innerHTML;
};
/* EOF */