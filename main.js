const { SoftwareModel } = require("./models/sw/interface")
// const { HardwareModel } = require("./models/hw/interface")

const { CrossCheck } = require("./models/crosscheck/interface")

const fs = require("fs")

let program = fs.readFileSync("programs/snake.bin").toString()

// let model = new CrossCheck([new SoftwareModel(), new HardwareModel()])
let model = new SoftwareModel()
model.reset()

model.write(1, 0x8)
model.write(2, 0x9)
console.log(model.read(0xa))
// model.set_mem(program, 0x8000)

// model.send_ps2_bytes([0xe0,0x72])
// model.send_ps2_bytes([0xe0,0xf0,0x72])

// try {
//   model.step(100)
// } catch (e) {
//   console.error(e.toString())
// }

// const to_bin_word = (num) => {
//   return ("0000000000000000" + num.toString(2)).slice(-16)
// }

// let addr = 0x1800
// for (let y = 0; y < 128; y++) {
//   let row = ""
//   for (let word = 0; word < 8; word++) {
//     let data = model.read(addr)
//     row += to_bin_word(data)
//     addr++
//   }
//   console.log(row)
// }

