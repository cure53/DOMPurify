// TypeScript 4.4 predates the inline `type` modifier on export specifiers (added in 4.5),
// so it fails to even parse `export { type Config }`.
// This project pins that release to keep `scripts/fix-types.js` honest
import * as dompurify from 'dompurify';
import { type Config } from 'dompurify';

const config: Config = { ALLOWED_TAGS: ['b'] };

dompurify.sanitize('<p>');
dompurify().sanitize('<p>', config);
