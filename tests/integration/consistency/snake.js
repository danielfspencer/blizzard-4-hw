const fs = require("fs")
const CYCLES = 1000000 // ~20 seconds of gameplay

describe('snake', () => {
  test(CROSS_CHECK.toString(), () => {
    const program = fs.readFileSync("../../programs/snake.bin").toString()

    let model = CROSS_CHECK
    model.reset()
    model.set_mem(program, 0x8000)

    model.step(CYCLES)
  })
})
