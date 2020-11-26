const fs = require("fs")
const CYCLES = 1000000 // ~10 seconds of gameplay

describe('snake', () => {
  test(CROSS_CHECK.toString(), () => {
    const program = fs.readFileSync("../../programs/snake.bin").toString()

    let model = CROSS_CHECK
    model.reset()
    model.set_mem(program, 0x8000)

    // put a space keypress in the fifo so that the game progresses beyond the menu
    model.send_ps2_bytes(keypress_to_scancode('ArrowDown', true))
    model.send_ps2_bytes(keypress_to_scancode('ArrowDown', false))

    model.step(CYCLES)
  })
})
