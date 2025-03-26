// Custom Solidity mode for CodeMirror
CodeMirror.defineSimpleMode("solidity", {
  // The start state contains the rules that are initially used
  start: [
    // Comments
    {regex: /\/\/.*/, token: "comment"},
    {regex: /\/\*/, token: "comment", next: "comment"},
    
    // Strings
    {regex: /"(?:[^\\]|\\.)*?(?:"|$)/, token: "string"},
    {regex: /'(?:[^\\]|\\.)*?(?:'|$)/, token: "string"},
    
    // Numbers
    {regex: /0x[a-f\d]+|[-+]?(?:\.\d+|\d+\.?\d*)(?:e[-+]?\d+)?/i, token: "number"},
    
    // Keywords
    {regex: /(?:pragma|contract|library|interface|function|modifier|event|struct|enum|mapping|address|string|bytes|uint|int|bool|public|private|external|internal|payable|view|pure|constant|memory|storage|calldata|returns|return|if|else|for|while|do|break|continue|delete|new|this|suicide|selfdestruct|emit|assembly|wei|ether|gwei|finney|szabo)\b/,
     token: "keyword"},
    
    // Operators
    {regex: /[+\-*&%=<>!?|^~:]+/, token: "operator"},
    
    // Identifiers
    {regex: /[a-z$][\w$]*/, token: "variable"},
    
    // Brackets
    {regex: /[{\[\(]/, indent: true},
    {regex: /[}\]\)]/, dedent: true}
  ],
  
  // The comment state
  comment: [
    {regex: /.*?\*\//, token: "comment", next: "start"},
    {regex: /.*/, token: "comment"}
  ],
  
  // The meta property contains global information about the mode
  meta: {
    dontIndentStates: ["comment"],
    lineComment: "//",
    blockCommentStart: "/*",
    blockCommentEnd: "*/"
  }
});