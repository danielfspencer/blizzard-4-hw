const Model = require('../model')

function is_consistent(values) {
  return (new Set(values)).size == 1
}

class CrossCheck extends Model {
  constructor (models) {
    super()
    this.cycle_count = 0
    this.instances = models
  }

  _crosscheck () {
    let values = {
      'read_bus': [],
      'data_bus': [],
      'write_bus': []
    }

    for (let instance of this.instances) {
      for (let bus in values) {
        values[bus].push(instance[bus])
      }
    }

    for (let bus in values) {
      if (!is_consistent(values[bus])) {
        let string = `Divergence of ${bus} at cycle ${this.cycle_count}.\n`
        string += 'read_bus:\n' + this._values_to_string(values['read_bus'])
        string += 'data_bus:\n' + this._values_to_string(values['data_bus'])
        string += 'write_bus:\n' + this._values_to_string(values['write_bus'])
        throw new Error(string)
      }
    }
  }

  _values_to_string (values) {
    let string = ''
    for (let i = 0; i < this.instances.length; i++) {
      string += ` - ${this.instances[i].toString()} = ${values[i]}\n`
    }
    return string
  }

  toString () {
    let string = ''
    for (let instance of this.instances) {
      string += ' ' + instance.toString()
    }
    return `[CrossCheck:${string}]`
  }

  destroy () {
    for (let instance of this.instances) {
      instance.destroy()
    }
  }

  set_mem(input, dest) {
    for (let instance of this.instances) {
      instance.set_mem(input, dest)
    }
  }

  reset () {
    this.cycle_count = 0
    for (let instance of this.instances) {
      instance.reset()
    }
  }

  step (cycles) {
    if (cycles === undefined) {
      cycles = 1
    }

    while (cycles-- >= 1) {
      for (let instance of this.instances) {
        instance.step()
      }
      this._crosscheck()
      this.cycle_count++
    }
  }

  get read_bus () {
    return this.instances[0].read_bus
  }

  get data_bus () {
    return this.instances[0].data_bus
  }

  get write_bus () {
    return this.instances[0].write_bus
  }

  read(addr) {
    let values = []
    for (let instance of this.instances) {
      values.push(instance.read(addr))
    }
    this._crosscheck()
    return values[0]
  }

  write(value, addr) {
    for (let instance of this.instances) {
      instance.write(value, addr)
    }
  }

  copy(source, dest) {
    for (let instance of this.instances) {
      instance.copy(source, dest)
    }
    this._crosscheck()
  }

  send_ps2_bytes(bytes) {
    for (let instance of this.instances) {
      instance.send_ps2_bytes(bytes)
    }
  }
}

module.exports.CrossCheck = CrossCheck
module.exports.build = () => {}
