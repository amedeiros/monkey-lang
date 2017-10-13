import { Lexer } from '../src/lexer/lexer.js'
import { Parser } from '../src/parser/parser.js'
import { TokenConstants } from '../src/lexer/token.js'

const CloudLang = CloudLang || { }
CloudLang.trace = false

describe('testLetStatement', () => {
    let input = 
`
let x = 5;
let y = 10;
let foobar = 838383;
`

    let lexer = new Lexer(input)
    let parser = new Parser(lexer)
    let program = parser.parseProgram()
    let tests = ['x', 'y', 'foobar']

    checkParseErrors(parser)
    it('should not be a null program', () => { expect(program).not.toBeNull() })
    it('should contain three statements', () => { expect(program.statements.length).toEqual(3) })
    it('should be a valid let statement', () => {
        for (var i = 0; i < tests.length; i++) {
            let statement = program.statements[i]
            let name = tests[i]

            expect(statement.tokenLiteral()).toEqual('let')
            expect(statement.name.value).toEqual(name)
            expect(statement.name.tokenLiteral()).toEqual(name)
        }
    })
})

describe('testReturnStatement', () => {
    let tests = [
        { input: 'return 5;', expected: 5 },
        { input: 'return 10;', expected: 10 },
        { input: 'return 993322;', expected: 993322 },
    ]

    for (var i = 0; i < tests.length; i++) {
        let test    = tests[i]
        let lexer   = new Lexer(test.input)
        let parser  = new Parser(lexer)
        let program = parser.parseProgram()
    
        checkParseErrors(parser)
        it('should not be a null program', () => { expect(program).not.toBeNull() })
        it('should contain one statement', () => { expect(program.statements.length).toEqual(1) })
        let returnStatement = program.statements[0]
        checkReturnLiteral(returnStatement)
        it('should return the correct value', () => { expect(returnStatement.expression.value).toEqual(test.expected) })
    }
})

describe('testIdentifierExpression', () => {
    let input = 'foobar;'
    let lexer = new Lexer(input)
    let parser = new Parser(lexer)
    let program = parser.parseProgram()

    checkParseErrors(parser)
    it('should contain one statement', () => { expect(program.statements.length).toEqual(1) })
    let ident = program.statements[0].expression
    it('should have the right value', () => { expect(ident.value).toEqual('foobar') })
    it('should have the right token literal', () => { expect(ident.tokenLiteral()).toEqual('foobar') })
})

describe('test integer literal expression', () => {
    let input = '5;'
    let lexer = new Lexer(input)
    let parser = new Parser(lexer)
    let program = parser.parseProgram()

    checkParseErrors(parser)
    it('should contain one statement', () => { expect(program.statements.length).toEqual(1) })
    let literal = program.statements[0].expression
    it('should have 5 as the value', () => { expect(literal.value).toEqual(5) })
    it('should have "5" as the token literal', () => { expect(literal.tokenLiteral()).toEqual('5') })
})

describe('test parsing prefix expressions', () => {
    let tests = [
        { input: '!5;', operator: '!', value: 5 },
        { input: '-15;', operator: '-', value: 15 }
    ]

    for (var i = 0; i < tests.length; i++){
        let test = tests[i]
        let lexer = new Lexer(test.input)
        let parser = new Parser(lexer)
        let program = parser.parseProgram()

        checkParseErrors(parser)
        it('should contain one statement', () => { expect(program.statements.length).toEqual(1) })
        let expression = program.statements[0].expression

        it('should have the right operator', () => { expect(expression.operator).toEqual(test.operator) })
        testIntegerLiteral(expression.right, test.value)
    }
})

describe('test parsing infix expressions', () => {
    let tests = [
        { input: '5 + 5', leftValue: 5, operator: '+' , rightValue: 5 },
        { input: '5 - 5', leftValue: 5, operator: '-' , rightValue: 5 },
        { input: '5 * 5', leftValue: 5, operator: '*' , rightValue: 5 },
        { input: '5 / 5', leftValue: 5, operator: '/' , rightValue: 5 },
        { input: '5 < 5', leftValue: 5, operator: '<' , rightValue: 5 },
        { input: '5 <= 5', leftValue: 5, operator: '<=' , rightValue: 5 },
        { input: '5 > 5', leftValue: 5, operator: '>' , rightValue: 5 },
        { input: '5 >= 5', leftValue: 5, operator: '>=' , rightValue: 5 },
        { input: '5 == 5', leftValue: 5, operator: '==' , rightValue: 5 },
        { input: '5 != 5', leftValue: 5, operator: '!=' , rightValue: 5 },
    ]

    for (var i = 0; i < tests.length; i++) {
        let test = tests[i]
        let lexer = new Lexer(test.input)
        let parser = new Parser(lexer)
        let program = parser.parseProgram()

        checkParseErrors(parser)
        it('should contain one statement', () => { expect(program.statements.length).toEqual(1) })
        let expression = program.statements[0].expression

        testIntegerLiteral(expression.left, test.leftValue)
        it('should have the right operator', () => { expect(expression.operator).toEqual(test.operator) })
        testIntegerLiteral(expression.right, test.rightValue)
    }
})

describe('test precedence', () => {
    let tests = [
        { input: '-a * b', expected: '((-a) * b)' },
        { input: '!-a', expected: '(!(-a))' },
        { input: 'a + b + c', expected: '((a + b) + c)' },
        { input: 'a + b - c', expected: '((a + b) - c)' },
        { input: 'a * b * c', expected: '((a * b) * c)' },
        { input: 'a * b / c', expected: '((a * b) / c)' },
        { input: 'a + b / c', expected: '(a + (b / c))' },
        { input: 'a + b * c + d / e - f', expected: '(((a + (b * c)) + (d / e)) - f)' },
        { input: '3 + 4; -5 * 5', expected: '(3 + 4)((-5) * 5)' },
        { input: '5 > 4 == 3 < 4', expected: '((5 > 4) == (3 < 4))' },
        { input: '5 < 4 != 3 > 4', expected: '((5 < 4) != (3 > 4))' },
        { input: '3 + 4 * 5 == 3 * 1 + 4 * 5', expected: '((3 + (4 * 5)) == ((3 * 1) + (4 * 5)))' },
        { input: 'a + add(b * c) + d', expected: '((a + add((b * c))) + d)' },
        { input: 'add(a, b, 1, 2 * 3, 4 + 5, add(6, 7 * 8))', expected: 'add(a, b, 1, (2 * 3), (4 + 5), add(6, (7 * 8)))' },
        { input: 'add(a + b + c * d / f + g)', expected: 'add((((a + b) + ((c * d) / f)) + g))' },
    ]

    for (var i = 0; i < tests.length; i++) {
        let test = tests[i]
        let lexer = new Lexer(test.input)
        let parser = new Parser(lexer)
        let program = parser.parseProgram()

        checkParseErrors(parser)
        it('should equal the expected', () => { expect(program.toString()).toEqual(test.expected) })
    }
})

describe('test boolean parsing', () => {
    let tests = [
        { input: 'true', expected: true },
        { input: 'false', expected: false },
    ]

    for (var i = 0; i < tests.length; i++) {
        let test = tests[i]
        let lexer = new Lexer(test.input)
        let parser = new Parser(lexer)
        let program = parser.parseProgram()

        checkParseErrors(parser)
        it('should contain one statement', () => { expect(program.statements.length).toEqual(1) })
        let expression = program.statements[0].expression
        it('should have the right boolean', () => { expect(expression.value).toEqual(test.expected) })
    }
})

describe('test operator precedence', () => {
    let tests = [
        { input: 'true', expected: 'true' },
        { input: 'false', expected: 'false' },
        { input: '3 > 5 == false', expected: '((3 > 5) == false)' },
        { input: '3 < 5 == true', expected: '((3 < 5) == true)' },
        { input: '1 + (2 + 3) + 4', expected: '((1 + (2 + 3)) + 4)' },
        { input: '(5 + 5) * 2', expected: '((5 + 5) * 2)' },
        { input: '2 / (5 + 5)', expected: '(2 / (5 + 5))' },
        { input: '-(5 + 5)', expected: '(-(5 + 5))' },
        { input: '!(true == true)', expected: '(!(true == true))' },
    ]

    for (var i = 0; i < tests.length; i++) {
        let test = tests[i]
        let lexer = new Lexer(test.input)
        let parser = new Parser(lexer)
        let program = parser.parseProgram()

        checkParseErrors(parser)
        it('should equal the expected', () => { expect(program.toString()).toEqual(test.expected) })
    }
})

describe('test if expression', () => {
    let input = 'if (x < y) { x }'
    let lexer = new Lexer(input)
    let parser = new Parser(lexer)
    let program = parser.parseProgram()

    checkParseErrors(parser)
    it('should contain one statement', () => { expect(program.statements.length).toEqual(1) })
    let expression = program.statements[0].expression
    testInfixExpression(expression.condition, "x", "<", "y")
})

describe('test function literal parsing', () => {
    let input = 'fn(x, y) { x + y; }'
    let lexer = new Lexer(input)
    let parser = new Parser(lexer)
    let program = parser.parseProgram()

    checkParseErrors(parser)
    it('should contain one statement', () => { expect(program.statements.length).toEqual(1) })
    let expression = program.statements[0].expression
    it('should have two parameters', () => { expect(expression.parameters.length).toEqual(2) })
    testLiteralExpression(expression.parameters[0], 'x')
    testLiteralExpression(expression.parameters[1], 'y')
    it('should have a body that is one statement', () =>  { expect(expression.body.statements.length).toEqual(1) })
})

describe('test function parameter parsing', () => {
    let tests = [
        { input: 'fn() {};', expectedParams: [] },
        { input: 'fn(x) {};', expectedParams: ['x'] },
        { input: 'fn(x, y, z) {};', expectedParams: ['x', 'y', 'z'] },
    ]

    for (var i = 0; i < tests.length; i++) {
        let test = tests[i]
        let lexer = new Lexer(test.input)
        let parser = new Parser(lexer)
        let program = parser.parseProgram()

        checkParseErrors(parser)
        let expression = program.statements[0].expression
        it('should have ' + test.expectedParams.length  + ' parameters', () => { expect(expression.parameters.length).toEqual(test.expectedParams.length) })

        for (var x = 0; x < test.expectedParams.length; x++) {
            testLiteralExpression(expression.parameters[x], test.expectedParams[x])
        }
    }
})

describe('test call expression parsing', () => {
    let input = 'add(1, 2 * 3, 4 + 5);'
    let lexer = new Lexer(input)
    let parser = new Parser(lexer)
    let program = parser.parseProgram()

    checkParseErrors(parser)
    it('should contain one statement', () => { expect(program.statements.length).toEqual(1) })
    let expression = program.statements[0].expression
    testIdentifier(expression.function, 'add')
    it('should have three arguments', () => { expect(expression.arguments.length).toEqual(3) })
    testLiteralExpression(expression.arguments[0], 1)
    testInfixExpression(expression.arguments[1], 2, '*', 3)
    testInfixExpression(expression.arguments[2], 4, '+', 5)
})

// Helper Functions
function checkParseErrors(parser) {
    it('should not have any parse errors', () => { 
        if (parser.errors.length > 0) { 
            for(var i = 0; i < parser.errors.length; i++) {
                fail(parser.errors[i])
            }
        }
     })
}

function checkReturnLiteral(statement) {
    it('should have return as its token literal', () => {
        expect(statement.tokenLiteral()).toEqual('return') 
    })
}

function testIntegerLiteral(expression, value) {
    it('should have the right value', () => { expect(expression.value).toEqual(value) })
    it('should have the right token literal', () => { expect(expression.tokenLiteral()).toEqual(value.toString()) })
}

function testInfixExpression(expression, left, operator, right) {
    testLiteralExpression(expression.left, left)
    testLiteralExpression(expression.right, right)
}

function testIdentifier(expression, value) {
    it('should have the correct value', () => { expect(expression.value).toEqual(value) })
    it('should have the correct token literal', () => { expect(expression.tokenLiteral()).toEqual(value) })
}

function testLiteralExpression(expression, expected) {
    switch (typeof  expected) {
        case 'number':
            return testIntegerLiteral(expression, parseInt(expected))
        case 'string': 
            return testIdentifier(expression, expected)
    }
}
