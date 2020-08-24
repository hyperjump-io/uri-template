const UriTemplate = require("./uri-template");
const { expect } = require("chai");
const specExamples = require("../uritemplate-test/spec-examples.json");
const extendedTests = require("../uritemplate-test/extended-tests.json");
const negativeTests = require("../uritemplate-test/negative-tests.json");


const level = 0;

const allTests = {
  ...specExamples,
  ...extendedTests,
  ...negativeTests
};
Object.entries(allTests)
  .filter(([, suite]) => !level || suite.level === level)
  .forEach(([suiteDescription, suite]) => {
    describe(suiteDescription, () => {
      suite.testcases.forEach(([uriTemplate, expectedUri]) => {
        it(`${uriTemplate} => ${Array.isArray(expectedUri) ? expectedUri[0] : expectedUri}`, () => {
          if (Array.isArray(expectedUri)) {
            const ast = UriTemplate.parse(uriTemplate);
            const uri = UriTemplate.expand(ast, suite.variables);
            expect(uri).to.be.oneOf(expectedUri);
          } else if (expectedUri === false) {
            const subject = () => {
              const ast = UriTemplate.parse(uriTemplate);
              UriTemplate.expand(ast, suite.variables);
            };
            expect(subject).to.throw();
          } else {
            const ast = UriTemplate.parse(uriTemplate);
            const uri = UriTemplate.expand(ast, suite.variables);
            expect(uri).to.equal(expectedUri);
          }
        });
      });
    });
  });
