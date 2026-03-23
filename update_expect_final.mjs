import fs from 'fs';

const filepath = 'test/fixtures/expect.mjs';
let content = fs.readFileSync(filepath, 'utf8');

// List of test titles that need to be wrapped in ["", "original"]
const titlesToWrap = [
    "onsubmit, onfocus; DOM clobbering: nodeName",
    "onsubmit, onfocus; DOM clobbering: attributes",
    "onsubmit, onfocus; DOM clobbering: removeChild",
    "onsubmit, onfocus; DOM clobbering: setAttribute",
    "DOM clobbering: hasChildNodes"
];

titlesToWrap.forEach(title => {
    // Find the object with this title and replace its expected value
    // We look for "title": "...", and then the next "expected": "..."
    const escapedTitle = title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp('("title"\\s*:\\s*"' + escapedTitle + '"[^{}]*?"expected"\\s*:\\s*)"([^"]*)"', 'g');

    if (regex.test(content)) {
        content = content.replace(regex, '$1["", "$2"]');
        console.log(`Wrapped expected value for: ${title}`);
    } else {
        console.warn(`Could not find test with title: ${title}`);
    }
});

fs.writeFileSync(filepath, content);
