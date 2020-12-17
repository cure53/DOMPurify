import { unapply, __lookupGetter__ } from './utils';
const { Element } = window;

const ElementPrototype = Element.prototype;

const cloneNode = unapply(ElementPrototype.cloneNode);
const getNextSibling = unapply(
  __lookupGetter__(ElementPrototype, 'nextSibling')
);
const getChildNodes = unapply(
  __lookupGetter__(ElementPrototype, 'getChildNodes')
);
const getParentNode = unapply(__lookupGetter__(ElementPrototype, 'parentNode'));

export { cloneNode, getChildNodes, getNextSibling, getParentNode };
