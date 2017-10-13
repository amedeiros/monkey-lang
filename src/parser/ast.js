export const PROG_NODE = 'PROGRAM'
export const LET_NODE  = 'LET'
export const IDENTIFIER_NODE = 'IDENTIFIER'
export const RETURN_NODE = 'RETURN'
export const EXPRESSION_NODE = 'EXPRESSION'
export const INTEGER_NODE = 'INTEGER'
export const PREFIX_NODE = 'PREFIX'
export const INFIX_NODE = 'INFIX'
export const BOOL_NODE = 'BOOL'
export const IF_NODE = 'IF'
export const BLOCK_NODE = 'BLOCK'
export const FUNCTION_NODE = 'FUNCTION'
export const CALL_NODE = 'CALL'

class Program {
    constructor() { this.statements = [] }

    type() { return PROG_NODE }

    tokenLiteral() {
        if (this.statements.length > 0) { return this.statements[0].tokenLiteral }
        return ''
    }

    toString() {
        let string = ''
        for (var i = 0; i < this.statements.length; i++) { string += this.statements[i].toString() }

        return string
    }
}

class LetStatement {
    constructor(token) {
        this.token = token
        this.name  = null
        this.value = null
    }
    
    type() { return LET_NODE }

    tokenLiteral() { return this.token.literal }
    statementNode() { }

    toString() {
        let string = this.tokenLiteral() + " " + this.name.toString() + " = "

        if (this.value !== null) { string += this.value.toString() }
        string += ';'

        return string
    }
}

class Identifier {
    constructor(token, value) {
        this.token = token
        this.value = value
    }

    type() { return IDENTIFIER_NODE }

    tokenLiteral() { return this.token.literal }
    expressionNode() { }
    toString() { return this.value }
}

class ReturnStatement {
    constructor(token) {
        this.token = token
        this.expression = null
    }

    type() { return RETURN_NODE }

    statementNode() { }
    tokenLiteral() { return this.token.literal }

    toString() {
        let string = this.tokenLiteral() + " "
        if (this.expression !== null) { string += this.expression.toString() }
        string += ';'

        return string
    }
}

class ExpressionStatement {
    constructor(token, expression) {
        this.token = token
        this.expression = expression
    }

    type() { return EXPRESSION_NODE }

    statementNode() { }
    tokenLiteral() { return this.token.literal }

    toString() {
        if (this.expression !== null) {  return this.expression.toString() }
        return ''
    }
}

class IntegerLiteral {
    constructor(token, value) {
        this.token = token
        this.value = value
    }

    type() { return INTEGER_NODE }

    expressionNode() { }
    toString() { return this.tokenLiteral() }
    tokenLiteral() { return this.token.literal }
}

class PrefixExpression {
    constructor(token, operator) {
        this.token    = token
        this.operator = operator
        this.right    = null
    }

    type() { return PREFIX_NODE }

    expressionNode() { }
    toString() { return '(' + this.operator + this.right.toString() + ')' }
    tokenLiteral() { return this.token.literal }
}

class InfixExpression {
    constructor(token, operator, left) {
        this.token    = token
        this.left     = left
        this.operator = operator
        this.right    = null
    }

    type() { return INFIX_NODE }

    expressionNode() { }
    toString() { return '(' + this.left.toString() + ' ' + this.operator + ' ' + this.right.toString() + ')' }
    tokenLiteral() { return this.token.literal }
}

class Bool {
    constructor(token, value) {
        this.token = token
        this.value = value
    }

    type() { return BOOL_NODE }

    expressionNode() { }
    toString() { return this.tokenLiteral() }
    tokenLiteral() { return this.token.literal }
}

class IfExpression {
    constructor(token) {
        this.token       = token
        this.condition   = null
        this.consequence = null
        this.alternative = null
    }

    type() { return IF_NODE }

    expressionNode() { }
    tokenLiteral() { return this.token.literal }
    toString() { 
        let expression = 'if' + this.condition.toString() + ' ' + this.consequence.toString()
        if (this.alternative != null) { expression  += 'else' + this.alternative.toString() }

        return expression
    }
}

class BlockStatement {
    constructor(token) {
        this.token      = token
        this.statements = []
    }

    type() { return BLOCK_NODE }

    statementNode() { }
    tokenLiteral() { return this.token.literal }
    toString() {
        let statements = ''
        if (this.statements === null) { return statements }
        for (var i = 0; i < this.statements.length; i++) { statements += this.statements[i].toString() }

        return statements
    }
}

class FunctionLiteral {
    constructor(token) {
        this.token      = token
        this.parameters = []
        this.body       = null
    }

    type() { return FUNCTION_NODE }

    expressionNode() { }
    tokenLiteral() { return this.token.literal }
    toString() {
        let params = []
        for(var i = 0; i < this.parameters.length; i++) { params.push(this.parameters[i].toString()) }
        return this.tokenLiteral() + '(' + params.join(', ') + ') { ' + this.body.toString() + ' }'
    }
}

class CallExpression {
    constructor(token, classExpression) {
        this.token     = token
        this.function  = classExpression
        this.arguments = []
    }

    type() { return CALL_NODE }

    expressionNode() { }
    tokenLiteral() { return this.token.literal }
    toString() {
        let args = []
        for (var i  = 0; i < this.arguments.length; i++) { args.push(this.arguments[i].toString()) }
        return this.function.toString() + '(' + args.join(', ') + ')'
    }
}

module.exports.Program             = Program
module.exports.LetStatement        = LetStatement
module.exports.Identifier          = Identifier
module.exports.ReturnStatement     = ReturnStatement
module.exports.ExpressionStatement = ExpressionStatement
module.exports.IntegerLiteral      = IntegerLiteral
module.exports.PrefixExpression    = PrefixExpression
module.exports.InfixExpression     = InfixExpression
module.exports.Bool                = Bool
module.exports.IfExpression        = IfExpression
module.exports.BlockStatement      = BlockStatement
module.exports.FunctionLiteral     = FunctionLiteral
module.exports.CallExpression      = CallExpression