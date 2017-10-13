class Token {
    constructor(type, literal) {
        this.type = type
        this.literal = literal
    }
}

const TokenConstants = {
    ILLEGAL: 'ILLEGAL',
    EOF    : "EOF",
    
    // Identifiers + literals
    IDENT: 'IDENT', // add, foobar, x, y, ...
    INT  : 'INT',   // 1343456
    
    // Operators
    ASSIGN  : '=',
    PLUS    : '+',
    MINUS   : '-',
    BANG    : '!',
    ASTERISK: '*',
    SLASH   : '/',
    
    LT: '<',
    GT: '>',
    LT_EQ: '<=',
    GT_EQ: '>=',
    
    EQ    : '==',
    NOT_EQ: '!=',
    
    // Delimiters
    COMMA    : ',',
    SEMICOLON: ';',
    
    LPAREN: '(',
    RPAREN: ')',
    LBRACE: '{',
    RBRACE: '}',
    
    // Keywords
    FUNCTION: 'FUNCTION',
    LET     : 'LET',
    TRUE    : 'TRUE',
    FALSE   : 'FALSE',
    IF      : 'IF',
    ELSE    : 'ELSE',
    RETURN  : 'RETURN',
    
    // RESERVED WORDS
    RESERVED: {
        'fn': 'FUNCTION',
        'let': 'LET',
        'true': 'TRUE',
        'false': 'FALSE',
        'if': 'IF',
        'else': 'ELSE',
        'return': 'RETURN',
    }
} 


module.exports.Token          = Token
module.exports.TokenConstants = TokenConstants