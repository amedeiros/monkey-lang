export const INTEGER_OBJ = 'INTEGER'
export const BOOL_OBJ    = 'BOOL'
export const NULL_OBJ    = 'NULL'
export const RETURN_OBJ  = 'RETURN'
export const ERROR_OBJ   = 'ERROR'
export const ENV_OBJ     = 'ENVIRONMENT'
export const FUNC_OBJ    = 'FUNCTION'

class Integer {
    constructor(value) { this.value = value }

    inspect() { return this.value.toString() }
    type() { return INTEGER_OBJ }
}

class Bool {
    constructor(value) { this.value = value }

    inspect() { return this.value.toString() }
    type() { return BOOL_OBJ }
}

class Null {
    constructor() { }

    inspect() { return 'null' }
    type() { return NULL_OBJ }
}

class Return {
    constructor(value) { this.value = value }
    
    inspect() { return this.value.inspect() }
    type() { return RETURN_OBJ }
}

class Error {
    constructor(message) { this.message = message }

    inspect() { return 'Error: ' + this.message }
    type() { return ERROR_OBJ }
}

class Environment {
    constructor(outer = null) { 
        this.store = { }
        this.outer = outer
    }

    get(name) {
        if (!this.store[name] && this.outer !== null) { return this.outer.get(name) }
        return this.store[name] 
    }
    set(name, value) { this.store[name] = value; return value }
}

class Function {
    constructor(parameters, body, env) {
        this.parameters = parameters
        this.body       = body
        this.env        = env
    }

    type() { return FUNC_OBJ }
    
    inspect() {
        let string = 'fn('
        let params = []
        for (var i = 0; i < this.parameters.length; i++) { params.push(this.parameters[i].toString()) }
        string += params.join(', ')
        string += ') {\n' + this.body.toString() + '\n}'

        return string
    }
}

module.exports.Integer = Integer
module.exports.Bool = Bool
module.exports.Null = Null
module.exports.Return = Return
module.exports.Error = Error
module.exports.Environment = Environment
module.exports.Function = Function