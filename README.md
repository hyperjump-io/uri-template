# URI Template

This is an implementation of [RFC 6570](https://tools.ietf.org/html/rfc6570) -
URI Template.

* Supports Level 4
* Separate parse and expand steps
  * More efficient expansion
  * Introspect a template
  * Validate that a template is correct without expanding
* Detailed error messaging

## Installation

```bash
npm install @hyperjump/uri-template
```

## Usage

```javascript
const UriTemplate = require("@hyperjump/uri-template");


const template = UriTemplate.parse("/foo{?foo,bar}");
const uri = UriTemplate.expand(template, { foo: "aaa", bar: "bbb" }); // => /foo?foo=aaa&bar=bbb
```

## API

* **parse**: (string) => Template

    Parse a URI Template

* **expand**: (Template, Object) => string

    Expand a parsed template

* **Template**: array

    An AST representing URI Template

## Contributing

### Tests

Run the tests

```bash
npm test
```

Run the tests with a continuous test runner
```bash
npm test -- --watch
```
