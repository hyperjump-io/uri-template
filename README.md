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


// Parse and expand in one step
UriTemplate.expand("/foo{?foo,bar}", { foo: "aaa", bar: "bbb" }); // => /foo?foo=aaa&bar=bbb

// Parse a URI Template
const template = UriTemplate.parse("/foo{?foo,bar}");

// Expand a URI Template from the pre-parsed template
UriTemplate.expand(template, { foo: "aaa", bar: "bbb" }); // => /foo?foo=aaa&bar=bbb
UriTemplate.expand(template, { foo: "ccc", bar: "ddd" }); // => /foo?foo=ccc&bar=ddd

// Convert a parsed template back into a string
UriTemplate.stringify(template); // => /foo{?foo,bar}
```

## API

* **parse**: (string) => Template

    Parse a URI Template

* **expand**: (Template | string, Object) => string

    Expand a URI template. The first argument can either be a URI Template AST
    (the result of `parse`) or a URI Template string.

* **stringify**: (Template) => string

    Convert a URI Template AST back into a URI Template string

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
