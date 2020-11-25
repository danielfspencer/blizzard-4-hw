const vm = require('vm')
const fs = require('fs')
const path = require('path')

const Model = require('../model')

const EMULATOR = fs.readFileSync(path.join(__dirname, 'engine.js'))

function create_context(files) {
  // create fake WebWorker environment
  const context = {
    postMessage: (data) => {}
  }

  // instantiate the context with the given global vars
  vm.createContext(context)

  // load & evaluate each file in the context
  for (const [source, name] of files) {
      vm.runInContext(source, context, {filename: name})
  }

  return context
}

class SoftwareModel extends Model {
  constructor () {
    super()

    this.instance = create_context([
      [EMULATOR, '<emulator>']
    ])
  }

  toString () {
    return '[SoftwareModel]'
  }

  reset () {
    this.instance.init_memory()
    this.instance.init_emulator()
  }

  step (cycles) {
    if (cycles === undefined) {
      cycles = 1
    }

    while (cycles-- >= 1) {
      this.instance.zero_busses()
      this.instance.step_clock()
    }
  }

  get read_bus () {
    return this.instance.read_bus
  }

  get data_bus () {
    return this.instance.data_bus
  }

  get write_bus () {
    return this.instance.write_bus
  }

  read(addr) {
    return this.instance.read(addr)
  }

  write(value, addr) {
    this.instance.write(value, addr)
  }

  copy(source, dest) {
    this.instance.copy(source, dest)
  }
}

module.exports.SoftwareModel = SoftwareModel

module.exports.build = () => {}
