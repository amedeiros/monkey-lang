import { INTEGER_NODE, PROG_NODE, EXPRESSION_NODE, BOOL_NODE, PREFIX_NODE,
INFIX_NODE, BLOCK_NODE, IF_NODE, RETURN_NODE, LET_NODE, IDENTIFIER_NODE,
FUNCTION_NODE, CALL_NODE } from '../parser/ast.js'

import { Integer, Bool, Null, Return, Error, Function, Environment } from '../object/objects'
import { INTEGER_OBJ, RETURN_OBJ, ERROR_OBJ } from '../object/objects'

const TRUE  = new Bool(true)
const FALSE = new Bool(false)
const NULL  = new Null()

export function evaluate(node, env) {
    switch(node.type()) {
        case PROG_NODE:
            return evalProgram(node, env)
        case EXPRESSION_NODE:
            return evaluate(node.expression, env)
        case FUNCTION_NODE:
            return new Function(node.parameters, node.body, env)
        case CALL_NODE:
            var func = evaluate(node.function, env)
            if (isError(func)) { return func }
            var args = evalExpressions(node.arguments, env)
            if (args.length === 1 && isError(args[0])) { return args[0] }
            return applyFunction(func, args)
        case INTEGER_NODE:
            return new Integer(node.value)
        case BOOL_NODE:
            if (node.value) { return TRUE }
            return FALSE
        case LET_NODE:
            var val = evaluate(node.value, env)
            if (isError(val)) { return val }
            env.set(node.name.value, val)
            break
        case IDENTIFIER_NODE:
            return evalIdentifier(node, env)
        case PREFIX_NODE:
            var right = evaluate(node.right, env)
            if (isError(right)) { return right }
            return evalPrefixExpression(node.operator, right)
        case INFIX_NODE:
            var left = evaluate(node.left, env)
            if (isError(left)) { return left }
            var right = evaluate(node.right, env)
            if (isError(right)) { return right }
            return evalInfixExpression(node.operator, left, right)
        case BLOCK_NODE:
            return evalBlockStatement(node, env)
        case IF_NODE:
            return evalIfExpression(node, env)
        case RETURN_NODE:
            var val = evaluate(node.expression, env)
            if (isError(val)) { return val }
            return new Return(val)
        default:
            return null
    }
}

function applyFunction(func, args) {
    let extendedFuncEnv = extendFuncEnv(func, args)
    let evaluated = evaluate(func.body, extendedFuncEnv)
    return unwrapReturnValue(evaluated)
}

function unwrapReturnValue(val) {
    if (val !== undefined && val.type() === RETURN_OBJ) { return val.value }
    return val
}

function extendFuncEnv(func, args) {
    let env = new Environment(func.env)
    for (var i = 0; i < args.length; i++) { env.set(func.parameters[i].value, args[i]) }

    return env
}

function evalExpressions(expressions, env) {
    let result = []
    for (var i = 0; i < expressions.length; i++) {
        let evaluated = evaluate(expressions[i], env)
        if (isError(evaluated)) { return [evaluated] }
        result.push(evaluated)
    }

    return result
}

function evalIdentifier(node, env) {
    let val = env.get(node.value)
    if (val === undefined) { return new Error('identifier not found: ' + node.value) }
    return val
}

function evalIfExpression(node, env) {
    let condition = evaluate(node.condition, env)
    if (isError(condition)) { return condition }
    if (isTruthy(condition)) { return evaluate(node.consequence, env) }
    if (node.alternative !== null) { return evaluate(node.alternative, env) }
    return NULL
}

function isTruthy(condition) {
    switch(condition) {
        case NULL:
            return false
        case TRUE:
            return true
        case FALSE:
            return false
        default:
            return true
    }
}

function evalInfixExpression(operator, left, right) {
    if (left.type() !== right.type()) {
        return new Error('type mismatch: ' + left.type() + ' ' + operator + ' ' + right.type())
    }

    if (left.type() === INTEGER_OBJ && right.type() === INTEGER_OBJ) {
        return evalIntegerInfixExpression(operator, left, right)
    }

    switch(operator) {
        case '==':
            return nativeBoolToObjectBool(left === right)
        case '!=':
            return nativeBoolToObjectBool(left !== right)
        default:
            return new Error('unknown operator: ' + left.type() + ' ' + operator + ' ' + right.type())
    }
}

function evalIntegerInfixExpression(operator, left, right) {
    left  = left.value
    right = right.value

    switch (operator) {
        case '+':
            return new Integer(left + right)
        case '-':
            return new Integer(left - right)
        case '*':
            return new Integer(left * right)
        case '/':
            return new Integer(left / right)
        case '<':
            return nativeBoolToObjectBool(left < right)
        case '>' :
            return nativeBoolToObjectBool(left > right)
        case '==':
            return nativeBoolToObjectBool(left === right)
        case '!=':
            return nativeBoolToObjectBool(left !== right)
        case '<=':
            return nativeBoolToObjectBool(left <= right)
        case '>=':
            return nativeBoolToObjectBool(left >= right)
        default:
            return new Error('unknown operator: ' + left.type() + ' ' + operator + ' ' + right.type())
    }
}

function isError(error) {
    if (error !== null) { return error.type() == ERROR_OBJ }
    return false
}

function nativeBoolToObjectBool(bool) {
    if (bool) { return TRUE }
    return FALSE
}

function evalProgram(node, env) {
    let result = null

    for(var i = 0; i < node.statements.length; i++) {
        result = evaluate(node.statements[i], env)
        if (result !== undefined && result.type() === RETURN_OBJ) { return result.value }
        if (result !== undefined && result.type() === ERROR_OBJ) { return result }
    }

    return result
}

function evalBlockStatement(node, env) {
    let result = null

    for (var i = 0; i < node.statements.length; i++) {
        result = evaluate(node.statements[i], env)
        if (result.type() === RETURN_OBJ || result.type() == ERROR_OBJ) { return result }
    }

    return result
}

function evalPrefixExpression(operator, right) {
    switch(operator) {
        case '!':
            return evalBangOperatorExpression(right)
        case '-':
            return evalMinusOperatorExpression(right)
        default:
            return new Error("unknown operator: " + operator + right.type())
    }
}

function evalBangOperatorExpression(right) {
    switch(right) {
        case TRUE:
            return FALSE
        case FALSE:
            return TRUE
        case NULL:
            return TRUE
        default:
            return FALSE
    }
}

function evalMinusOperatorExpression(right) {
    if (right.type() !== INTEGER_NODE) { return new Error('unknown operator: -' + right.type()) }

    return new Integer(-right.value)
}