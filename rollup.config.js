const commonjs = require("rollup-plugin-commonjs");
const { terser } = require("rollup-plugin-terser");


const flatMap = (fn, list) => list.reduce((acc, x) => acc.concat(fn(x)), []);
const combine = (lists, items) => flatMap((item) => lists.map((list) => [...list, item]), items);
const combinations = (...lists) => lists.reduce(combine, [[]]);

const formats = ["amd", "cjs", "esm", "iife", "umd", "system"];
const minify = [false, true];
const config = combinations(formats, minify);

module.exports = config.map(([format, minify]) => ({
  input: "lib/json-pointer.js",
  output: {
    format: format,
    file: `dist/uri-template-${format}${minify ? ".min" : ""}.js`,
    name: "UriTemplate",
    sourcemap: true
  },
  plugins: [
    commonjs(),
    minify && terser()
  ]
}));
