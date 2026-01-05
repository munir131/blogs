const csso = require("csso");
const css = ".bg-background { background-color: var(--background); }";
const minified = csso.minify(css).css;
console.log("Original:", css);
console.log("Minified:", minified);
