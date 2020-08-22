const curry = require("just-curry-it");
const { encodeURI, encodeURIComponent } = require("./uri-encode");


const NONE = 0, SHOW = 1, NO_TRAILLING_EQ = 2;
const expressionHandler = {
  "": { prefix: "", separator: ",", keyMode: NONE, encoder: encodeURIComponent },
  "+": { prefix: "", separator: ",", keyMode: NONE, encoder: encodeURI },
  "#": { prefix: "#", separator: ",", keyMode: NONE, encoder: encodeURI },
  ".": { prefix: ".", separator: ".", keyMode: NONE, encoder: encodeURIComponent },
  "/": { prefix: "/", separator: "/", keyMode: NONE, encoder: encodeURIComponent },
  ";": { prefix: ";", separator: ";", keyMode: NO_TRAILLING_EQ, encoder: encodeURIComponent },
  "?": { prefix: "?", separator: "&", keyMode: SHOW, encoder: encodeURIComponent },
  "&": { prefix: "&", separator: "&", keyMode: SHOW, encoder: encodeURIComponent }
};

const digit = `0-9`;
const hexdig = `${digit}a-fA-F`;
const pctEncoded = `%[${hexdig}]{2}`;
const variableName = `(?:\\w|\\.|${pctEncoded})+`;
const variableParser = `(${variableName})(?::(\\d+)|(\\*))?`;
const operator = `[+#\\./;?&]?`;
const expression = `\\{(${operator})(${variableParser}(?:,${variableParser})*)\\}`;
const parser = new RegExp(`${expression}|(?<=\\}|^).+?(?=${expression}|$)`, "g");

const parse = (uriTemplate) => {
  const matches = uriTemplate.matchAll(parser);

  const ast = [];
  for (const [fullMatch, operator, variables] of matches) {
    if (operator === undefined) {
      ast.push({ type: "literal", value: encodeURI(fullMatch) });
    } else {
      ast.push({
        type: operator,
        variables: variables.split(",")
          .map((variable) => {
            const [, name, maxLength, explode] = variable.match(variableParser);
            return { name, maxLength, explode };
          })
      });
    }
  }

  return ast;
};

const expand = (ast, input) => {
  return ast.reduce((result, node) => {
    if (node.type === "literal") {
      return result + node.value;
    } else {
      const expandedVariable = expandVariables(node.variables, input, expressionHandler[node.type]);
      const prefix = expandedVariable && expressionHandler[node.type].prefix;
      return result + prefix + expandedVariable;
    }
  }, "");
};

const expandVariables = (variables, input, options) => {
  const result = [];

  for (const variable of variables) {
    const value = input[variable.path || variable.name];

    if (isEmpty(value)) {
      continue;
    } else if (variable.explode && Array.isArray(value)) {
      const explodedVariables = value.map((_, ndx) => ({ name: variable.name, path: ndx + "" }));
      result.push(expandVariables(explodedVariables, value, options));
    } else if (!variable.explode && isObject(value)) {
      result.push(expandVariable(variable, Object.entries(value), options));
    } else {
      result.push(expandVariable(variable, value, options));
    }
  }

  return result.join(options.separator);
};

const expandVariable = ({ name, maxLength }, value, options) => {
  let result = "";

  const modifiedValue = maxLength !== undefined && typeof value === "string" ? value.substring(0, maxLength) : value;

  if (!isObject(modifiedValue)) {
    if (options.keyMode === SHOW) {
      result += name + "=";
    } else if (options.keyMode === NO_TRAILLING_EQ) {
      result += name + (modifiedValue === "" ? "" : "=");
    }
  }

  return result + encodeValue(options, modifiedValue);
};

const encodeValue = curry((options, value) => {
  if (Array.isArray(value)) {
    return value.map(encodeValue(options));
  } else if (isObject(value)) {
    return Object.entries(value)
      .map(([key, value]) => options.encoder(key) + "=" + encodeValue(options, value))
      .join(options.separator);
  } else {
    return options.encoder(value);
  }
});

const isObject = (value) => typeof value === "object" && !Array.isArray(value) && value !== null;
const isEmpty = (value) => value === undefined || (Array.isArray(value) && value.length === 0) || (isObject(value) && Object.keys(value).length === 0);

module.exports = { parse, expand };
