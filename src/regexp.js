export const MUSTACHE_EXPR = /\{\{[\s\S]*|[\s\S]*\}\}/gm; // Specify template detection regex for SAFE_FOR_TEMPLATES mode
export const ERB_EXPR = /<%[\s\S]*|[\s\S]*%>/gm;
export const DATA_ATTR = /^data-[\-\w.\u00B7-\uFFFF]/; // eslint-disable-line no-useless-escape
export const ARIA_ATTR = /^aria-[\-\w]+$/; // eslint-disable-line no-useless-escape
export const IS_ALLOWED_URI = /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i; // eslint-disable-line no-useless-escape
export const IS_SCRIPT_OR_DATA = /^(?:\w+script|data):/i;
export const ATTR_WHITESPACE = /[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205f\u3000]/g; // This needs to be extensive thanks to Webkit/Blink's behavior
