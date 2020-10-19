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
            step: ['void', ['int']],

            set_control_status: ['void', ['int']],

            set_read_bus: ['void', ['int']],
            set_data_bus: ['void', ['int']],
            set_write_bus: ['void', ['int']],

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

    step (cycles) {
        if (cycles === undefined) {
            cycles = 1
        }
        this.instance.step(cycles)
    }

    set_control_status (enabled) {
        this.instance.set_control_status(enabled)
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
        this.instance.set_read_bus(value)
        this.step()
        return this.data_bus
    }

    write(value, addr) {
        this.instance.set_data_bus(value)
        this.instance.set_write_bus(addr)
        this.step()
    }

    copy(source, dest) {
        this.instance.set_read_bus(source)
        this.instance.set_write_bus(dest)
        this.step()
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
    } else {
        // console.debug(val.stdout.toString())
    }
}

module.exports.HardwareModel = HardwareModel

module.exports.build = () => {
    const STEPS = [
        ['Verilog to C++',         `verilator blizzard_4.v -Imodules --trace --cc -Wno-fatal --exe main.cpp -CFLAGS "-fpic" -O3 --x-initial unique`],
        ['C++ compile',            `make -j OPT_FAST="-O3" -C obj_dir -f Vblizzard_4.mk`],
        ['Create dynamic library', `gcc -shared *.o -o blizzard_4.so`, 'obj_dir']
    ]
    process.chdir(__dirname)

    console.log("\nBuilding hardware model...")
    for (let [name, cmd, cwd] of STEPS) {
        run_step(name, cmd, cwd)
    }
}
