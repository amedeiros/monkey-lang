import { Token, TokenConstants } from './token.js'

class Lexer {
    constructor(input) {
        this.input        = input
        this.position     = 0
        this.readPosition = 0
        this.currentChar  = ''
        this.readChar() // Initalize our self
    }
    
    newToken(type, literal) { return new Token(type, literal) }

    nextToken() {
        let tok = null
        this.skipWhiteSpace()
        
        switch (this.currentChar) {
            case '=':
                if (this.peek() === '=') {
                    let ch = this.currentChar
                    this.readChar()
                    let ch1 = this.currentChar
                    tok = this.newToken(TokenConstants.EQ, ch + ch1)
                } else {
                    tok = this.newToken(TokenConstants.ASSIGN, this.currentChar)
                }
                
                break
            case ';':
                tok = this.newToken(TokenConstants.SEMICOLON, this.currentChar)
                break
            case '(':
                tok = this.newToken(TokenConstants.LPAREN, this.currentChar)
                break
            case ')':
                tok = this.newToken(TokenConstants.RPAREN, this.currentChar)
                break
            case ',':
                tok = this.newToken(TokenConstants.COMMA, this.currentChar)
                break
            case '+':
                tok = this.newToken(TokenConstants.PLUS, this.currentChar)
                break
            case '-':
                tok = this.newToken(TokenConstants.MINUS, this.currentChar)
                break
            case '!':
                if (this.peek() === '=') {
                    let ch = this.currentChar
                    this.readChar()
                    let ch1 = this.currentChar
                    tok = this.newToken(TokenConstants.NOT_EQ, ch + ch1)
                } else {
                    tok = this.newToken(TokenConstants.BANG, this.currentChar)
                }
                
                break
            case '{':
                tok = this.newToken(TokenConstants.LBRACE, this.currentChar)
                break
            case '}':
                tok = this.newToken(TokenConstants.RBRACE, this.currentChar)
                break
            case ',':
                tok = this.newToken(TokenConstants.COMMA, this.currentChar)
                break
            case '<':
                if (this.peek() === '=') {
                    let ch = this.currentChar
                    this.readChar()
                    let ch1 = this.currentChar
                    tok = this.newToken(TokenConstants.LT_EQ, ch + ch1)
                } else {
                    tok = this.newToken(TokenConstants.LT, this.currentChar)
                }
                break
            case '>':
                if (this.peek() === '=') {
                    let ch = this.currentChar
                    this.readChar()
                    let ch1 = this.currentChar
                    tok = this.newToken(TokenConstants.GT_EQ, ch + ch1)
                } else {
                    tok = this.newToken(TokenConstants.GT, this.currentChar)
                }
                break
            case '*':
                tok = this.newToken(TokenConstants.ASTERISK, this.currentChar)
                break
            case '/':
                tok = this.newToken(TokenConstants.SLASH, this.currentChar)
                break
            case undefined:
                return this.newToken(TokenConstants.EOF, '')
            default:
                if (this.isLetter(this.currentChar)) {
                    let ch = this.readIdentifier()
                    let type = this.lookupIdent(ch)
                    return this.newToken(type, ch)
                } else if (this.isDigit(this.currentChar)) {
                    return this.newToken(TokenConstants.INT, this.readNumber())
                } else {
                    tok = this.newToken(TokenConstants.ILLEGAL, this.currentChar)
                }
        }

        this.readChar()

        return tok
    }

    peek() {
        if (this.readPosition >= this.input.length) { return 0 }

        return this.input[this.readPosition]
    }

    isDigit(ch) { return ch !== ' ' && !isNaN(ch) }

    readNumber() {
        let position = this.position
        let number = ''

        while(this.isDigit(this.currentChar)) {
            number += this.currentChar
            this.readChar()
        }

        return number
    }

    skipWhiteSpace() {
        while(this.currentChar === ' ' || this.currentChar === '\t' || this.currentChar === '\n' || this.currentChar === '\r' ) {
            this.readChar()
        }
    }

    lookupIdent(ident) {
        let type = TokenConstants.RESERVED[ident]
        if (type == null) { return TokenConstants.IDENT }

        return type
    }

    readIdentifier() {
        let position = this.position
        let ident = ''
        while(this.isLetter(this.currentChar)) {
            ident += this.currentChar
            this.readChar() 
        }

        return ident
    }

    isLetter(ch) { return /^[a-zA-Z]+$/.test(ch) && ch !== undefined }

    readChar() {
        if (this.readPosition >= this.input.length) {
            this.currentChar = undefined
        } else {
            this.currentChar = this.input[this.readPosition]
        }

        this.position = this.readPosition
        this.readPosition += 1
    }
}

module.exports.Lexer = Lexer