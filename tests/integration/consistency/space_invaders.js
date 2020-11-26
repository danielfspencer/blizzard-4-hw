const fs = require("fs")
const CYCLES = 1000000 // ~10 seconds of gameplay

describe('space invaders', () => {
  test(CROSS_CHECK.toString(), () => {
    const program = fs.readFileSync("../../programs/space_invaders.bin").toString()

    let model = CROSS_CHECK
    model.reset()
    model.set_mem(program, 0x8000)

    // put a space keypress in the fifo so that the game progresses beyond the menu
    model.send_ps2_bytes(keypress_to_scancode('Space', true))
    model.send_ps2_bytes(keypress_to_scancode('Space', false))

    model.step(CYCLES)
  })
})
