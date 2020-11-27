const fs = require("fs")

const ITERS = 500

describe('u16_multiply', () => {
  test.each(MODELS)('%s', model => {
    const program = fs.readFileSync("../../programs/standard_lib/u16_multiply.bin").toString()
    model.set_mem(program, 0x8000)

    for (let i = 0; i < ITERS; i++) {
      let a = random_int(0,255)
      let b = random_int(0,255)
      let ans = (a * b) & 0xffff

      model.reset()
      model.write(a, 0x4000 + 2)
      model.write(b, 0x4000 + 3)

      model.step(600)

      let result = model.read(0x4000 + 4)

      if (result !== ans) {
        throw new Error(`${a} * ${b} expected ${ans}, got ${result}`)
      }
    }
  })
})

describe('s16_multiply', () => {
  test.each(MODELS)('%s', model => {
    const program = fs.readFileSync("../../programs/standard_lib/s16_multiply.bin").toString()
    model.set_mem(program, 0x8000)

    for (let i = 0; i < ITERS; i++) {
      let a = random_int(-127,127)
      let b = random_int(-127,127)
      let ans = (a * b) & 0xffff

      model.reset()
      model.write(a, 0x4000 + 2)
      model.write(b, 0x4000 + 3)

      model.step(600)

      let result = model.read(0x4000 + 4)

      if (result !== ans) {
        throw new Error(`${a} * ${b} expected ${ans}, got ${result}`)
      }
    }
  })
})
