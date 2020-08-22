const alpha = `a-zA-Z`;
const digit = `0-9`;
const hexdig = `${digit}a-fA-F`;
const unreserved = `${alpha}${digit}\\-._~`;
const genDelims = `:/?#[\\]@`;
const subDelims = `!$&'()*+,;=`;
const reserved = `${genDelims}${subDelims}`;
const percent = `%(?![${hexdig}]{2})`;
const uriDisallowedCharacters = new RegExp(`[^${reserved}${unreserved}%]|${percent}`, "g");
const uriReservedCharacters = new RegExp(`[^${unreserved}]`, "g");

const encodeURI = (str) => (str + "").replace(uriDisallowedCharacters, pctEncode);
const encodeURIComponent = (str) => (str + "").replace(uriReservedCharacters, pctEncode);
const pctEncode = (char) => [...Buffer.from(char)].map((byte) => "%" + byte.toString(16).toUpperCase()).join("");

module.exports = { encodeURI, encodeURIComponent };
