import { seal } from './utils.js';

// eslint-disable-next-line unicorn/better-regex
export const MUSTACHE_EXPR = seal(/\{\{[\w\W]*|[\w\W]*\}\}/gm); // Specify template detection regex for SAFE_FOR_TEMPLATES mode
export const ERB_EXPR = seal(/<%[\w\W]*|[\w\W]*%>/gm);
export const TMPLIT_EXPR = seal(/\${[\w\W]*}/gm);
export const DATA_ATTR = seal(/^data-[\-\w.\u00B7-\uFFFF]/); // eslint-disable-line no-useless-escape
export const ARIA_ATTR = seal(/^aria-[\-\w]+$/); // eslint-disable-line no-useless-escape
export const IS_ALLOWED_URI = seal(
  /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i // eslint-disable-line no-useless-escape
);
export const IS_SCRIPT_OR_DATA = seal(/^(?:\w+script|data):/i);
export const ATTR_WHITESPACE = seal(
  /[\u0000-\u0020\u00A0\u1680\u180E\u2000-\u2029\u205F\u3000]/g // eslint-disable-line no-control-regex
);
export const DOCTYPE_NAME = seal(/^html$/i);
