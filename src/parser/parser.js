import { TokenConstants } from '../lexer/token.js'
import { Tracer } from './tracer.js'
import { Program, LetStatement, Identifier, ReturnStatement, ExpressionStatement, 
    IntegerLiteral, PrefixExpression, InfixExpression, Bool, 
    IfExpression, BlockStatement, FunctionLiteral, CallExpression } from './ast.js'

// Precedend
const LOWEST      = 0
const EQUALS      = 1
const LESSGREATER = 2
const SUM         = 3
const PRODUCT     = 4
const PREFIX      = 5
const CALL        = 6

const PRECEDENCES = { }
PRECEDENCES[TokenConstants.EQ]       = EQUALS
PRECEDENCES[TokenConstants.NOT_EQ]   = EQUALS
PRECEDENCES[TokenConstants.LT]       = LESSGREATER
PRECEDENCES[TokenConstants.LT_EQ]    = LESSGREATER
PRECEDENCES[TokenConstants.GT]       = LESSGREATER
PRECEDENCES[TokenConstants.GT_EQ]    = LESSGREATER
PRECEDENCES[TokenConstants.PLUS]     = SUM
PRECEDENCES[TokenConstants.MINUS]    = SUM
PRECEDENCES[TokenConstants.SLASH]    = PRODUCT
PRECEDENCES[TokenConstants.ASTERISK] = PRODUCT
PRECEDENCES[TokenConstants.LPAREN]   = CALL

function Parser(lexer) {
    this.tracer = new Tracer()
    this.lexer = lexer
    this.curToken = lexer.nextToken()
    this.peekToken = lexer.nextToken()
    this.errors = []
    this.prefixParseFns = {}
    this.infixParseFns  = {}

    this.nextToken = () => {
        this.curToken = this.peekToken
        this.peekToken = this.lexer.nextToken()
    }

    this.parseProgram = () => {
        let program = new Program()

        while (!this.currentTokenIs(TokenConstants.EOF)) {
            let statement = this.parseStatement()

            if (statement !== null) { program.statements.push(statement) }
            this.nextToken()
        }

        return program
    }

    this.parseStatement = () => {
        switch(this.curToken.type) {
            case TokenConstants.LET:
                return this.parseLetStatement()
            case TokenConstants.RETURN:
                return this.parseReturnStatement()
            default:
                return this.parseExpressionStatement()
        }
    }

    this.currentTokenIs = (tokenType) => { return tokenType == this.curToken.type }
    this.peekTokenIs = (tokenType) => { return tokenType == this.peekToken.type }
    this.expectPeek = (tokenType) => {
        if (this.peekTokenIs(tokenType)) {
            this.nextToken()
            return true
        }

        this.peekError(tokenType)
        return false
    }

    this.peekError = (tokenType) => { 
        this.errors.push('Expected next token to be ' + tokenType + ', got ' + this.peekToken.type + ' instead.') 
    }

    this.parseLetStatement = () => {
        let statement = new LetStatement(this.curToken)
        if (!this.expectPeek(TokenConstants.IDENT)) { return null }
        statement.name = new Identifier(this.curToken, this.curToken.literal)

        if (!this.expectPeek(TokenConstants.ASSIGN)) { return null }

        this.nextToken()
        statement.value = this.parseExpression(LOWEST)

        if (this.peekTokenIs(TokenConstants.SEMICOLON)) { this.nextToken() }

        return statement
    }

    this.parseReturnStatement = () => {
        let statement = new ReturnStatement(this.curToken)
        this.nextToken()

        statement.expression = this.parseExpression(LOWEST)

        if (this.peekTokenIs(TokenConstants.SEMICOLON)) { this.nextToken() }

        return statement
    }

    this.parseExpressionStatement = () => {
        let statement = new ExpressionStatement(this.curToken, this.parseExpression(LOWEST))

        // Optional ;
        if (this.peekTokenIs(TokenConstants.SEMICOLON)) { this.nextToken() }

        return statement
    }

    this.parseExpression = (precedence) => {
        let prefix = this.prefixParseFns[this.curToken.type]

        if (prefix === undefined) {
            this.noPrefixParseFnError(this.curToken.type)
            return null 
        }

        let leftExp = prefix()

        while(!this.peekTokenIs(TokenConstants.SEMICOLON) && precedence < this.peekPrecedence()) {
            let infix = this.infixParseFns[this.peekToken.type]
            if (infix === undefined) { return leftExp }
            this.nextToken()
            
            leftExp = infix(leftExp)
        }

        return leftExp
     }

     this.parsePrefixExpression = () => {
         let expression = new PrefixExpression(this.curToken, this.curToken.literal)
         this.nextToken()
         expression.right = this.parseExpression(PREFIX)
         
         return expression
     }

    this.peekPrecedence = () => {
        let p = PRECEDENCES[this.peekToken.type]
        if (p !== undefined) { return p }

        return LOWEST
     }

     this.curPrecedence = () => {
         let p = PRECEDENCES[this.curToken.type]
         if (p !== undefined) { return p }

         return LOWEST
     }

     this.parseInfixExpression = (left) => {
        let expression = new InfixExpression(this.curToken, this.curToken.literal, left)
        let precedence = this.curPrecedence()
        this.nextToken()
        expression.right = this.parseExpression(precedence)

        return expression
     }

     this.parseGroupedExpressions = () => {
         this.nextToken()

        let expression = this.parseExpression(LOWEST)

        if (!this.expectPeek(TokenConstants.RPAREN)) { return null }

        return expression
     }

     this.parseIfExpression = () => {
         let expression = new IfExpression(this.curToken)
         if (!this.expectPeek(TokenConstants.LPAREN)) { return null }

         this.nextToken()
         expression.condition = this.parseExpression(LOWEST)
         if (!this.expectPeek(TokenConstants.RPAREN)) { console.log('missing rparen?'); return null }
         if (!this.expectPeek(TokenConstants.LBRACE)) { console.log('missing lbrace?'); return null }

         expression.consequence = this.parseBlockStatement()

         if (this.peekTokenIs(TokenConstants.ELSE)) {
             this.nextToken()

             if (!this.expectPeek(TokenConstants.LBRACE)) { return null }
             expression.alternative = this.parseBlockStatement()
         }

         return expression
     }

     this.parseBlockStatement = () => {
         let expression = new BlockStatement(this.curToken)
         this.nextToken()

         while (!this.currentTokenIs(TokenConstants.RBRACE) && !this.currentTokenIs(TokenConstants.EOF)) {
             let statement = this.parseStatement()
             if (statement != null) { expression.statements.push(statement) }
             this.nextToken()
         }

         return expression
     }

    this.parseFunctionLiteral = () => {
        let functionLiteral = new FunctionLiteral(this.curToken)
        if (!this.expectPeek(TokenConstants.LPAREN)) { return null }

        functionLiteral.parameters = this.parseFunctionParameters()
        if (!this.expectPeek(TokenConstants.LBRACE)) { return null }
        
        functionLiteral.body = this.parseBlockStatement()
        return functionLiteral
    }

    this.parseFunctionParameters = () => {
        let identifiers = []
        if (this.peekTokenIs(TokenConstants.RPAREN)) { this.nextToken(); return identifiers }

        this.nextToken()
        identifiers.push(new Identifier(this.curToken, this.curToken.literal))

        while (this.peekTokenIs(TokenConstants.COMMA)) {
            this.nextToken()
            this.nextToken()
            identifiers.push(new Identifier(this.curToken, this.curToken.literal))
        }

        if (!this.expectPeek(TokenConstants.RPAREN)) { return null }

        return identifiers
    }

    this.parseCallExpression = (functionExpression) => {
        let expression = new CallExpression(this.curToken, functionExpression)
        expression.arguments = this.parseCallArguments()
        return expression
    }

    this.parseCallArguments = () => {
        let args = []
        if (this.peekTokenIs(TokenConstants.RPAREN)) { this.nextToken(); return args }

        this.nextToken()
        args.push(this.parseExpression(LOWEST))

        while(this.peekTokenIs(TokenConstants.COMMA)) {
            this.nextToken()
            this.nextToken()
            args.push(this.parseExpression(LOWEST))
        }

        if (!this.expectPeek(TokenConstants.RPAREN)) { return null }
        return args
    }

    this.parseBoolean = () => { return new Bool(this.curToken, this.currentTokenIs(TokenConstants.TRUE)) }

    this.noPrefixParseFnError = (tokenType) => { this.errors.push('no prefix parse function for ' + tokenType + ' found') }
    this.parseIdentifier = () => { return new Identifier(this.curToken, this.curToken.literal) }
    this.parseIntegerLiteral = () => { return new IntegerLiteral(this.curToken, parseInt(this.curToken.literal)) }

    this.registerPrefix = (tokenType, func) => { this.prefixParseFns[tokenType] = func }
    this.registerInfix = (tokenType, func) => { this.infixParseFns[tokenType] = func }

    // Register our functions
    this.registerPrefix(TokenConstants.IDENT, this.parseIdentifier)
    this.registerPrefix(TokenConstants.INT, this.parseIntegerLiteral)   
    this.registerPrefix(TokenConstants.BANG, this.parsePrefixExpression) 
    this.registerPrefix(TokenConstants.MINUS, this.parsePrefixExpression)
    this.registerPrefix(TokenConstants.TRUE, this.parseBoolean)
    this.registerPrefix(TokenConstants.FALSE, this.parseBoolean)
    this.registerPrefix(TokenConstants.LPAREN, this.parseGroupedExpressions)
    this.registerPrefix(TokenConstants.IF, this.parseIfExpression)
    this.registerPrefix(TokenConstants.FUNCTION, this.parseFunctionLiteral)

    this.registerInfix(TokenConstants.PLUS, this.parseInfixExpression)
    this.registerInfix(TokenConstants.MINUS, this.parseInfixExpression)
    this.registerInfix(TokenConstants.SLASH, this.parseInfixExpression)
    this.registerInfix(TokenConstants.ASTERISK, this.parseInfixExpression)
    this.registerInfix(TokenConstants.EQ, this.parseInfixExpression)
    this.registerInfix(TokenConstants.NOT_EQ, this.parseInfixExpression)
    this.registerInfix(TokenConstants.LT, this.parseInfixExpression)
    this.registerInfix(TokenConstants.GT, this.parseInfixExpression)
    this.registerInfix(TokenConstants.GT_EQ, this.parseInfixExpression)
    this.registerInfix(TokenConstants.LT_EQ, this.parseInfixExpression)
    this.registerInfix(TokenConstants.LPAREN, this.parseCallExpression)
}

module.exports.Parser = Parser