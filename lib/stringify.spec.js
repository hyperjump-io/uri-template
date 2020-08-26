const { expect } = require("chai");
//const { Given, When, Then } = require("./mocha-gherkin.spec");
const UriTemplate = require("./uri-template");


describe("UriTemplate.stringify", () => {
  it("An empty template", () => {
    const template = [];
    const uri = UriTemplate.stringify(template);
    expect(uri).to.equal("");
  });

  it("A template with a literal", () => {
    const template = [
      { type: "literal", value: "/foo" }
    ];
    const uri = UriTemplate.stringify(template);
    expect(uri).to.equal("/foo");
  });

  it("A template with a simple expression with one variable", () => {
    const template = [
      {
        type: "",
        variables: [
          { name: "foo", explode: false }
        ]
      }
    ];
    const uri = UriTemplate.stringify(template);
    expect(uri).to.equal("{foo}");
  });

  it("A template with a simple expression with multiple variables", () => {
    const template = [
      {
        type: "",
        variables: [
          { name: "foo", explode: false },
          { name: "bar", explode: false }
        ]
      }
    ];
    const uri = UriTemplate.stringify(template);
    expect(uri).to.equal("{foo,bar}");
  });

  it("A template with a simple expression with variable modifiers", () => {
    const template = [
      {
        type: "",
        variables: [
          { name: "foo", explode: false, maxLength: 10 },
          { name: "bar", explode: true }
        ]
      }
    ];
    const uri = UriTemplate.stringify(template);
    expect(uri).to.equal("{foo:10,bar*}");
  });

  it("A template with an expression that has an operator", () => {
    const template = [
      {
        type: "+",
        variables: [
          { name: "foo", explode: false }
        ]
      }
    ];
    const uri = UriTemplate.stringify(template);
    expect(uri).to.equal("{+foo}");
  });

  it("A template with a little bit of everything", () => {
    const template = [
      { type: "literal", value: "/foo" },
      {
        type: "/",
        variables: [
          { name: "bar", explode: false, maxLength: 10 },
          { name: "baz", explode: true }
        ]
      },
      { type: "literal", value: "/" },
      {
        type: "#",
        variables: [
          { name: "quux", explode: false }
        ]
      }
    ];
    const uri = UriTemplate.stringify(template);
    expect(uri).to.equal("/foo{/bar:10,baz*}/{#quux}");
  });
});
