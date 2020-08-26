const { encodeURI, encodeURIComponent } = require("./uri-encode");
const { Lexer } = require("./lexer");


const parse = (template) => {
  const ast = [];

  const nextToken = Lexer(template);

  let token;
  while (token = nextToken("literal")) { // eslint-disable-line no-cond-assign
    if (token === "{") {
      const operator = nextToken("operator");

      const variables = [];
      do {
        const path = [];
        do {
          path.push(nextToken("variableName"));
        } while (nextToken("."));

        const modifier = nextToken("modifier");
        const explode = modifier === "*";
        const maxLength = modifier === ":" ? nextToken("maxLength") : undefined;

        variables.push({ name: path.join("."), explode, maxLength });
      } while (nextToken("variableEnd") === ",");

      ast.push({ type: operator, variables });
    } else {
      ast.push({ type: "literal", value: encodeURI(token) });
    }
  }

  return ast;
};

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

  if (maxLength !== undefined) {
    if (isObject(value) || Array.isArray(value)) {
      throw Error("The prefix modifier is not allowed for composite values");
    }
    value = (value + "").substring(0, maxLength);
  }

  if (!isObject(value)) {
    if (options.keyMode === SHOW) {
      result += name + "=";
    } else if (options.keyMode === NO_TRAILLING_EQ) {
      result += name + (value === "" ? "" : "=");
    }
  }

  return result + encodeValue(options)(value);
};

const encodeValue = (options) => (value) => {
  if (Array.isArray(value)) {
    return value.map(encodeValue(options));
  } else if (isObject(value)) {
    return Object.entries(value)
      .map(([key, value]) => options.encoder(key) + "=" + encodeValue(options)(value))
      .join(options.separator);
  } else {
    return options.encoder(value);
  }
};

const isObject = (value) => typeof value === "object" && !Array.isArray(value) && value !== null;
const isEmpty = (value) => value === undefined || (Array.isArray(value) && value.length === 0) || (isObject(value) && Object.keys(value).length === 0);

module.exports = { parse, expand };
