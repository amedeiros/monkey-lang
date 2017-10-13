import { Lexer } from '../src/lexer/lexer.js'
import { Parser } from '../src/parser/parser.js'
import { Integer, Bool, Environment } from '../src/object/objects.js'
import { evaluate, NULL } from '../src/evaluator/evaluator.js'

describe('test integer eval expression', () => {
    let tests = [
        { input: '5', expected: 5 },
        { input: '-5', expected: -5 },
        { input: '10', expected: 10 },
        { input: '-10', expected: -10 },
        { input: '5 + 5 + 5 + 5 - 10', expected: 10 },
        { input: '2 * 2 * 2 * 2 * 2', expected: 32 },
        { input: '-50 + 100 + -50', expected: 0 },
        { input: '5 * 2 + 10', expected: 20 },
        { input: '5 + 2 * 10', expected: 25 },
        { input: '20 + 2 * -10', expected: 0 },
        { input: '50 / 2 * 2 + 10', expected: 60 },
        { input: '2 * (5 + 10)', expected: 30 },
        { input: '3 * 3 * 3 + 10', expected: 37 },
        { input: '3 * (3 * 3) + 10', expected: 37 },
        { input: '(5 + 10 * 2 + 15 / 3) * 2 + -10', expected: 50 },
    ]

    for(var i = 0; i < tests.length; i++) {
        let test = tests[i]
        let evaluated = testEval(test.input)
        testIntegerObject(evaluated, test.expected)
    }
})

describe('test bool eval expression', () => {
    let tests = [
        { input: 'true', expected: true },
        { input: 'false', expected: false },
        { input: 'true', expected: true },
        { input: 'false', expected: false },
        { input: '1 < 2', expected: true },
        { input: '1 > 2', expected: false },
        { input: '1 < 1', expected: false },
        { input: '1 > 1', expected: false },
        { input: '1 == 1', expected: true },
        { input: '1 != 1', expected: false },
        { input: '1 == 2', expected: false },
        { input: '1 != 2', expected: true },
        { input: '1 <= 2', expected: true },
        { input: '2 <= 1', expected: false },
        { input: '1 <= 1', expected: true },
        { input: '1 >= 1', expected: true },
        { input: '1 >= 2', expected: false },
        { input: '2 >= 1', expected: true },
        { input: 'true == true', expected: true },
        { input: 'false == false', expected: true },
        { input: 'true == false', expected: false },
        { input: 'true != false', expected: true },
        { input: 'false != true', expected: true },
        { input: '(1 < 2) == true', expected: true },
        { input: '(1 < 2) == false', expected: false },
        { input: '(1 > 2) == true', expected: false },
        { input: '(1 > 2) == false', expected: true },
    ]

    for(var i = 0; i < tests.length; i++) {
        let test = tests[i]
        let evaluated = testEval(test.input)
        testBoolObject(evaluated, test.expected)
    }
})

describe('test bang operator', () => {
    let tests = [
        { input: '!true', expected: false },
        { input: '!false', expected: true },
        { input: '!5', expected: false },
        { input: '!!true', expected: true },
        { input: '!!false', expected: false },
        { input: '!!5', expected: true },
    ]

    for(var i = 0; i < tests.length; i++) {
        let test = tests[i]
        let evaluated = testEval(test.input)
        testBoolObject(evaluated, test.expected)
    }
})

describe('test if else expression', () => {
    let tests = [
        { input: 'if (true) { 10 }', expected: 10 },
        { input: 'if (false) { 10 }', expected: NULL },
        { input: 'if (1) { 10 }', expected: 10 },
        { input: 'if (1 < 2) { 10 }', expected: 10 },
        { input: 'if (1 > 2) { 10 }', expected: NULL },
        { input: 'if (1 > 2) { 10 } else { 20 }', expected: 20 },
        { input: 'if (1 < 2) { 10 } else { 20 }', expected: 10 },
    ]

    for(var i = 0; i < tests.length; i++) {
        let test = tests[i]
        let evaluated = testEval(test.input)
        
        if (evaluated === NULL) { testNullObject(evaluated) }
        else { testIntegerObject(evaluated, test.expected) }
    }
})

describe('test return statement', () => {
    let tests = [
        { input: 'return 10;', expected: 10 },
        { input: 'return 10; 9;', expected: 10 },
        { input: 'return 2 * 5; 9;', expected: 10 },
        { input: '9; return 2 * 5; 9;', expected: 10 },
        { input: `
        if (10 > 1) {
          if (10 > 1) {
            return 10;
          }
        
          return 1;
        }
        `, expected: 10 }
    ]

    for (var i = 0; i < tests.length; i ++) {
        let test = tests[i]
        let evaluated = testEval(test.input)
        testIntegerObject(evaluated, test.expected)
    }
})

describe('test error handling', () => {
    let tests = [
        { input: '5 + true;', expected: 'type mismatch: INTEGER + BOOL' },
        { input: '5 + true; 5', expected: 'type mismatch: INTEGER + BOOL' },
        { input: '-true', expected: 'unknown operator: -BOOL' },
        { input: 'true + false', expected: 'unknown operator: BOOL + BOOL' },
        { input: '5; true + false; 5;', expected: 'unknown operator: BOOL + BOOL' },
        { input: 'if (10 > 1) { true + false; }', expected: 'unknown operator: BOOL + BOOL' },
        { input: 'foobar', expected: 'identifier not found: foobar' },
        { input: `if (10 > 1) {
            if (10 > 1) {
              return true + false;
            }
          
            return 1;
          }`, expected: 'unknown operator: BOOL + BOOL' },
    ]

    for (var i = 0; i < tests.length; i ++) {
        let test = tests[i]
        let evaluated = testEval(test.input)
        
        it('should have the expected error message', () => { expect(evaluated.message).toEqual(test.expected) })
    }
})

describe('test let statements', () => {
    let tests = [
        { input: 'let a = 5; a;', expected: 5 },
        { input: 'let a = 5 * 5; a;', expected: 25 },
        { input: 'let a = 5; let b = a; b;', expected: 5 },
        { input: 'let a = 5; let b = a; let c = a + b + 5; c;', expected: 15 },
    ]

    for (var i = 0; i < tests.length; i ++) {
        let val = testEval(tests[i].input)
        testIntegerObject(val, tests[i].expected)
    }
})

describe('test functions', () => {
    let input = 'fn(x) { x + 2; };'
    let evaluated = testEval(input)

    it('should have one parameter', () => { expect(evaluated.parameters.length).toBe(1) })
    it('should have the correct parameter name', () => { expect(evaluated.parameters[0].toString()).toBe('x') })
    it('should have the correct body', () => { expect(evaluated.body.toString()).toBe('(x + 2)') })
})

describe('test function application', () => {
    let tests = [
        { input: 'let identity = fn(x) { x; }; identity(5);', expected: 5 },
        { input: 'fn(x) { x; }(5)', expected: 5 },
        { input: 'let identity = fn(x) { return x; }; identity(5);', expected: 5 },
        { input: 'let double = fn(x) { x * 2; }; double(5);', expected: 10 },
        { input: 'let add = fn(x, y) { x + y; }; add(5, 5);', expected: 10 },
        { input: 'let add = fn(x, y) { x + y; }; add(5 + 5, add(5, 5));', expected: 20 },
    ]

    for (var i = 0; i < tests.length; i++) { testIntegerObject(testEval(tests[i].input), tests[i].expected) }
})

describe('test closures', () => {
    let input = `
    let newAdder = fn(x) {
      fn(y) { x + y };
    };
    
    let addTwo = newAdder(2);
    addTwo(2);`
    
    testIntegerObject(testEval(input), 4)
    
})
  
function testEval(input) {
    let lexer = new Lexer(input)
    let parser = new Parser(lexer)
    let program = parser.parseProgram()

    return evaluate(program, new Environment())
}

function testIntegerObject(object, expected) {
    it('should have the expected integer', () => { expect(object.value).toBe(expected) })
}

function testBoolObject(object, expected) {
    it('should have the expected bool', () => { expect(object.value).toBe(expected) })
}

function testNullObject(evaluated) {
    it('should be null', () => { expect(evaluated).toEqual(NULL) })
}