const fs = require("fs")
const CYCLES = 106720 // 1 run of the program

describe('integer tests', () => {
  test(CROSS_CHECK.toString(), () => {
    const program = fs.readFileSync("../../programs/integer_tests.bin").toString()

    let model = CROSS_CHECK
    model.reset()
    model.set_mem(program, 0x8000)

    model.step(CYCLES)
  })
})
