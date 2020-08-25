const hexdig = `[a-fA-F0-9]`;
const pctEncoded = `%${hexdig}{2}`;
const varchar = `(?:\\w|${pctEncoded})`;
const varname = `${varchar}+`;

const patterns = {
  literal: {
    pattern: /\{|[^{}}]+|$/g,
    message: "Unexpected close-expression token ('}') found. If you need a literal '}' in your URI Template, you can use '%7D'"
  },
  operator: {
    pattern: new RegExp(`[+#/.;?&]|(?=${varchar}|\\.)`, "y"),
    message: "Expected an operator ('+', '#', '/', '.', ';', '?', '&') or a variable name"
  },
  variableName: {
    pattern: new RegExp(varname, "y"),
    message: "Expected a variable name"
  },
  ".": {
    pattern: new RegExp(`\\.?`, "y"),
    message: ""
  },
  modifier: {
    pattern: /[:*]|(?=[,}])/y,
    message: "Expected a hierarchical variable name ('.'), or a modifier (':', '*'), or termination of the variable declaration (',', '}')"
  },
  maxLength: {
    pattern: /[1-9]\d*/y,
    message: "The prefix modifier expects an integer argument"
  },
  variableEnd: {
    pattern: /[,}]/y,
    message: "Expected either ',' to declare another variable, or '}' to close the expression"
  }
};

const Lexer = (subject) => {
  let lastIndex = 0;

  return (type) => {
    const { pattern, message } = patterns[type];
    pattern.lastIndex = lastIndex;
    const match = pattern.exec(subject);
    if (match === null || match.index > lastIndex) {
      const index = match ? match.index : lastIndex + 1;
      throw Error(`Parse Error: ${message}\n${subject}\n${"^".padStart(index, " ")}`);
    }
    lastIndex = pattern.lastIndex;
    return match[0];
  };
};

module.exports = { Lexer };
