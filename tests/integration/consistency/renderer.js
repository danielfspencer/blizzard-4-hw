const fs = require("fs")
const CYCLES = 2200000 // approx. 1 frame

describe('3D renderer', () => {
  test(CROSS_CHECK.toString(), () => {
    const program = fs.readFileSync("../../programs/3d_renderer.bin").toString()

    let model = CROSS_CHECK
    model.reset()
    model.set_mem(program, 0x8000)

    model.step(CYCLES)
  })
})
