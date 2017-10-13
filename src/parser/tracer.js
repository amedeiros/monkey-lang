const traceIdentPlaceholder = "\t"

class Tracer {
    constructor() {
        this.traceLevel = 0
    }

    identLevel() { 
        let string = ''
        for (var i = 0; i < this.traceLevel;i ++) { string += traceIdentPlaceholder }

        return string
    }

    tracePrint(fs) { console.log(this.identLevel() + fs + "\n") }

    incIdent() { this.traceLevel += 1 }
    decIdent() { this.traceLevel -= 1 }
    trace(msg) { 
        this.incIdent()
        this.tracePrint("BEGIN " + msg)
        return msg
    }

    untrace(msg) {
        this.tracePrint("END " + msg)
        this.decIdent()
    }
}

module.exports.Tracer = Tracer
