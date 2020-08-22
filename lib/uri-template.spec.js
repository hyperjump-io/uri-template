const UriTemplate = require("./uri-template");
const { expect } = require("chai");
const specExamples = require("../uritemplate-test/spec-examples.json");
const extendedTests = require("../uritemplate-test/extended-tests.json");


const level = 0;

const allTests = {
  ...specExamples,
  ...extendedTests
};
Object.entries(allTests)
  .filter(([, suite]) => !level || suite.level === level)
  .forEach(([suiteDescription, suite]) => {
    describe(suiteDescription, () => {
      suite.testcases.forEach(([uriTemplate, expectedUri]) => {
        it(`${uriTemplate} => ${Array.isArray(expectedUri) ? expectedUri[0] : expectedUri}`, () => {
          const ast = UriTemplate.parse(uriTemplate);
          const uri = UriTemplate.expand(ast, suite.variables);
          if (Array.isArray(expectedUri)) {
            expect(uri).to.be.oneOf(expectedUri);
          } else {
            expect(uri).to.equal(expectedUri);
          }
        });
      });
    });
  });
