const segfault_hanlder = require('segfault-handler')
segfault_hanlder.registerHandler('crash.log')

const process = require('process')
const { ffi } = require("fastcall")
const { spawnSync } = require("child_process")

const Model = require('../model')
const TIMEOUT = 60 * 1000

class HardwareModel extends Model {
  constructor () {
    super()
    process.chdir(__dirname)

    this.instance = ffi.Library('obj_dir/blizzard_4.so', {
      init: ['void', []],
      destroy: ['void', []],
      reset: ['void', []],

      _step: ['void', ['int']],
      _read: ['int', ['int']],
      _write: ['void', ['int','int']],
      _copy: ['void', ['int','int']],
      _send_ps2_byte: ['void', ['int']],

      get_read_bus: ['int', []],
      get_data_bus: ['int', []],
      get_write_bus: ['int', []]
    })

    this.instance.init()
  }

  toString () {
    return '[HardwareModel]'
  }

  destroy () {
    this.instance.destroy()
    this.instance = null
  }

  reset () {
    this.instance.reset()
  }

  step (cycles) {
    if (cycles === undefined) {
      cycles = 1
    }
    this.instance._step(cycles)
  }

  get read_bus () {
    return this.instance.get_read_bus()
  }

  get data_bus () {
    return this.instance.get_data_bus()
  }

  get write_bus () {
    return this.instance.get_write_bus()
  }

  read(value) {
    return this.instance._read(value)
  }

  write(value, addr) {
    this.instance._write(value, addr)
  }

  copy(source, dest) {
    this.instance._copy(source, dest)
  }

  send_ps2_bytes(bytes) {
    for (let byte of bytes) {
      this.instance._send_ps2_byte(byte)
    }
  }
}

function run_step(name, cmd, cwd) {
  let val = spawnSync(cmd, { cwd: cwd, shell: true, timeout: TIMEOUT })

  if (val.error || (val.status != 0)) {
    console.error(`> Step '${name}' failed when running command:`)
    console.error(`'${cmd}'\n`)

    if (val.error) {
      console.error(`Node error:\n\n${val.error}`)
    } else {
      console.error(`> Process returned code ${val.status}, stderr:\n${val.stderr}`)
    }

    console.error("> Model build failed")
    process.exit(1)
  }
}

module.exports.HardwareModel = HardwareModel

module.exports.build = () => {
  const STEPS = [
    ['Verilog to C++',         `verilator blizzard_4.v -Imodules -Igeneric --trace --cc -Wno-fatal --exe main.cpp -CFLAGS "-fpic" -O3 --x-initial unique`],
    ['C++ compile',            `make -j OPT_FAST="-O3" -C obj_dir -f Vblizzard_4.mk`],
    ['Create dynamic library', `gcc -shared *.o -o blizzard_4.so`, 'obj_dir']
  ]
  process.chdir(__dirname)

  console.log("Building HardwareModel...")
  for (let [name, cmd, cwd] of STEPS) {
    run_step(name, cmd, cwd)
  }
}
