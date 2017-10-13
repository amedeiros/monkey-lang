import { Token, TokenConstants } from '../src/lexer/token.js'
import { Lexer } from '../src/lexer/lexer.js'

describe('#nextToken', () => {
    it('should do something', () => {
        let input = 
`
let five = 5;
let ten = 10;

let add = fn(x, y) {
    x + y;
};

let result = add(five, ten);

!-/*5;
5 < 10 > 5;

if (5 < 10) {
	return true;
} else {
	return false;
}

10 == 10;
10 != 9;
`

        let tests = [
            { expectedToken: TokenConstants.LET, expectedLiteral: 'let' },
            { expectedToken: TokenConstants.IDENT, expectedLiteral: 'five' },
            { expectedToken: TokenConstants.ASSIGN, expectedLiteral: '=' },
            { expectedToken: TokenConstants.INT, expectedLiteral: '5' },
            { expectedToken: TokenConstants.SEMICOLON, expectedLiteral: ';' },
            { expectedToken: TokenConstants.LET, expectedLiteral: 'let' },
            { expectedToken: TokenConstants.IDENT, expectedLiteral: 'ten' },
            { expectedToken: TokenConstants.ASSIGN, expectedLiteral: '=' },
            { expectedToken: TokenConstants.INT, expectedLiteral: '10' },
            { expectedToken: TokenConstants.SEMICOLON, expectedLiteral: ';' },
            { expectedToken: TokenConstants.LET, expectedLiteral: 'let' },
            { expectedToken: TokenConstants.IDENT, expectedLiteral: 'add' },
            { expectedToken: TokenConstants.ASSIGN, expectedLiteral: '=' },
            { expectedToken: TokenConstants.FUNCTION, expectedLiteral: 'fn' },
            { expectedToken: TokenConstants.LPAREN, expectedLiteral: '(' },
            { expectedToken: TokenConstants.IDENT, expectedLiteral: 'x' },
            { expectedToken: TokenConstants.COMMA, expectedLiteral: ',' },
            { expectedToken: TokenConstants.IDENT, expectedLiteral: 'y' },
            { expectedToken: TokenConstants.RPAREN, expectedLiteral: ')' },
            { expectedToken: TokenConstants.LBRACE, expectedLiteral: '{' },
            { expectedToken: TokenConstants.IDENT, expectedLiteral: 'x' },
            { expectedToken: TokenConstants.PLUS, expectedLiteral: '+' },
            { expectedToken: TokenConstants.IDENT, expectedLiteral: 'y' },
            { expectedToken: TokenConstants.SEMICOLON, expectedLiteral: ';' },
            { expectedToken: TokenConstants.RBRACE, expectedLiteral: '}' },
            { expectedToken: TokenConstants.SEMICOLON, expectedLiteral: ';' },
            { expectedToken: TokenConstants.LET, expectedLiteral: 'let' },
            { expectedToken: TokenConstants.IDENT, expectedLiteral: 'result' },
            { expectedToken: TokenConstants.ASSIGN, expectedLiteral: '=' },
            { expectedToken: TokenConstants.IDENT, expectedLiteral: 'add' },
            { expectedToken: TokenConstants.LPAREN, expectedLiteral: '(' },
            { expectedToken: TokenConstants.IDENT, expectedLiteral: 'five' },
            { expectedToken: TokenConstants.COMMA, expectedLiteral: ',' },
            { expectedToken: TokenConstants.IDENT, expectedLiteral: 'ten' },
            { expectedToken: TokenConstants.RPAREN, expectedLiteral: ')' },
            { expectedToken: TokenConstants.SEMICOLON, expectedLiteral: ';' },
            { expectedToken: TokenConstants.BANG, expectedLiteral: '!' },
            { expectedToken: TokenConstants.MINUS, expectedLiteral: '-' },
            { expectedToken: TokenConstants.SLASH, expectedLiteral: '/' },
            { expectedToken: TokenConstants.ASTERISK, expectedLiteral: '*' },
            { expectedToken: TokenConstants.INT, expectedLiteral: '5' },
            { expectedToken: TokenConstants.SEMICOLON, expectedLiteral: ';' },
            { expectedToken: TokenConstants.INT, expectedLiteral: '5' },
            { expectedToken: TokenConstants.LT, expectedLiteral: '<' },
            { expectedToken: TokenConstants.INT, expectedLiteral: '10' },
            { expectedToken: TokenConstants.GT, expectedLiteral: '>' },
            { expectedToken: TokenConstants.INT, expectedLiteral: '5' },
            { expectedToken: TokenConstants.SEMICOLON, expectedLiteral: ';' },
            { expectedToken: TokenConstants.IF, expectedLiteral: 'if' },
            { expectedToken: TokenConstants.LPAREN, expectedLiteral: '(' },
            { expectedToken: TokenConstants.INT, expectedLiteral: '5' },
            { expectedToken: TokenConstants.LT, expectedLiteral: '<' },
            { expectedToken: TokenConstants.INT, expectedLiteral: '10' },
            { expectedToken: TokenConstants.RPAREN, expectedLiteral: ')' },
            { expectedToken: TokenConstants.LBRACE, expectedLiteral: '{' },
            { expectedToken: TokenConstants.RETURN, expectedLiteral: 'return' },
            { expectedToken: TokenConstants.TRUE, expectedLiteral: 'true' },
            { expectedToken: TokenConstants.SEMICOLON, expectedLiteral: ';' },
            { expectedToken: TokenConstants.RBRACE, expectedLiteral: '}' },
            { expectedToken: TokenConstants.ELSE, expectedLiteral: 'else' },
            { expectedToken: TokenConstants.LBRACE, expectedLiteral: '{' },
            { expectedToken: TokenConstants.RETURN, expectedLiteral: 'return' },
            { expectedToken: TokenConstants.FALSE, expectedLiteral: 'false' },
            { expectedToken: TokenConstants.SEMICOLON, expectedLiteral: ';' },
            { expectedToken: TokenConstants.RBRACE, expectedLiteral: '}' },
            { expectedToken: TokenConstants.INT, expectedLiteral: '10' },
            { expectedToken: TokenConstants.EQ, expectedLiteral: '==' },
            { expectedToken: TokenConstants.INT, expectedLiteral: '10' },
            { expectedToken: TokenConstants.SEMICOLON, expectedLiteral: ';' },
            { expectedToken: TokenConstants.INT, expectedLiteral: '10' },
            { expectedToken: TokenConstants.NOT_EQ, expectedLiteral: '!=' },
            { expectedToken: TokenConstants.INT, expectedLiteral: '9' },
            { expectedToken: TokenConstants.SEMICOLON, expectedLiteral: ';' },
        ]
        
        let lexer = new Lexer(input)

        for (let i = 0; i < tests.length; i++) {
            let nextToken = lexer.nextToken()

            expect(nextToken.type).toBe(tests[i].expectedToken)
            expect(nextToken.literal).toBe(tests[i].expectedLiteral)
        }
    })
})
