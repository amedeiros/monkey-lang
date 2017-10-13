import readline from 'readline'
import { evaluate } from './evaluator/evaluator.js'
import { Lexer } from './lexer/lexer.js'
import { Parser } from './parser/parser.js'
import { Environment } from './object/objects.js'

const rl = readline.createInterface(process.stdin, process.stdout)
const env = new Environment()

function logErrors(errors) {
  for (var i = 0; i < errors.length; i++) { console.log(errors[i]) }
}

rl.setPrompt('>> ')
rl.prompt()
rl.on('line', (code) => {
  if (code.toLowerCase().trim() === 'exit') { 
    rl.close() 
  } else {
    var lexer = new Lexer(code)
    var parser = new Parser(lexer)
    var program = parser.parseProgram()

    if (parser.errors.length > 0) {
      logErrors(parser.errors)
    } else {
      var val = evaluate(program, env)
      if (val !== undefined) { console.log(val.inspect()) }
    }

    rl.prompt()
  }
})

rl.on('close', () => { process.exit() })
