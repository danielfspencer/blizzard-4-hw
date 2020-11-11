const RANDOM_ITERS = 1000

describe('return <new PC> <new SP>', () => {
  test.each(MODELS)('%s', model => {
    for (let iters = 0; iters < RANDOM_ITERS; iters++) {
      let op1 = random_word()
      let op2 = random_int(0, 2 ** 14 - 1) // max 14 bits

      // return <new PC> <new SP>
      const PROGRAM = `
      0010000000000000
      ${to_bin_word(op1)}
      ${to_bin_word(op2)}
      `
      model.reset()
      model.set_mem(PROGRAM, 0x8000)

      // execute instruction
      model.step(4)

      let sp = model.read(0x2)
      if (sp !== op2) {
        throw new Error(`Expected stack pointer = ${op2} (op 2), got ${sp}`)
      }

      // fetch next instruction
      model.step()
      if (model.read_bus !== op1) {
        throw new Error(`Expected fetch from ${op1} (op 1), got ${model.read_bus}`)
      }
    }
  })
})

describe('goto <addr> <cond>', () => {
  test.each(MODELS)('%s', model => {
    for (let iters = 0; iters < RANDOM_ITERS; iters++) {
      let op1 = random_word()
      let op2 = random_word()

      // goto <addr> <cond>
      const PROGRAM = `
      0100000000000000
      ${to_bin_word(op1)}
      ${to_bin_word(op2)}
      `
      model.reset()
      model.set_mem(PROGRAM, 0x8000)

      // execute instruction
      model.step(4)

      // fetch next instruction
      model.step()

      if ((op2 & 1) == 0) {
        // condition is true, expect PC = op1
        if (model.read_bus !== op1) {
          throw new Error(`Expected fetch from ${op1} (op 1), got ${model.read_bus}`)
        }
      } else {
        // condition is false, expect PC = PC + 1
        const NEXT_ADDR = 0x8003
        if (model.read_bus !== NEXT_ADDR) {
          throw new Error(`Expected fetch from ${NEXT_ADDR} (next instruction), got ${model.read_bus}`)
        }
      }
    }
  })
})

describe('call <addr> <frame size>', () => {
  test.each(MODELS)('%s', model => {
    for (let iters = 0; iters < RANDOM_ITERS; iters++) {
      let op1 = random_word()
      let op2 = random_word()

      // call <addr> <frame size>
      const PROGRAM = `
      0110000000000000
      ${to_bin_word(op1)}
      ${to_bin_word(op2)}
      `
      model.reset()
      model.set_mem(PROGRAM, 0x8000)
      let old_sp = model.read(0x2)

      // execute instruction
      model.step(7)

      let expected_sp = (old_sp + op2) & (2 ** 14 -1)
      let new_sp = model.read(0x2)

      if (new_sp !== expected_sp) {
        throw new Error(`Expected stack pointer = ${expected_sp} (SP + op 2), got ${new_sp}`)
      }

      // fetch next instruction
      model.step()
      if (model.read_bus !== op1) {
        throw new Error(`Expected fetch from ${op1} (op 1), got ${model.read_bus}`)
      }
    }
  })
})

describe('write <data> <addr>', () => {
  test.each(MODELS)('%s', model => {
    for (let iters = 0; iters < RANDOM_ITERS; iters++) {
      let op1 = random_word()
      let op2 = random_word()

      // write <data> <addr>
      const PROGRAM = `
      1000000000000000
      ${to_bin_word(op1)}
      ${to_bin_word(op2)}
      `
      model.reset()
      model.set_mem(PROGRAM, 0x8000)

      // execute instruction
      model.step(4)

      if (model.data_bus !== op1) {
        throw new Error(`Expected data bus = ${op1} (op 1), got ${model.data_bus}`)
      }

      if (model.write_bus !== op2) {
        throw new Error(`Expected write bus = ${op2} (op 2), got ${model.write_bus}`)
      }
    }
  })
})

describe('copy <source> <dest>', () => {
  test.each(MODELS)('%s', model => {
    for (let iters = 0; iters < RANDOM_ITERS; iters++) {
      let op1 = random_word()
      let op2 = random_word()

      // copy <source> <dest>
      const PROGRAM = `
      1010000000000000
      ${to_bin_word(op1)}
      ${to_bin_word(op2)}
      `
      model.reset()
      model.set_mem(PROGRAM, 0x8000)

      // execute instruction
      model.step(4)

      if (model.read_bus !== op1) {
        throw new Error(`Expected read bus = ${op1} (op 1), got ${model.read_bus}`)
      }

      if (model.write_bus !== op2) {
        throw new Error(`Expected write bus = ${op2} (op 2), got ${model.write_bus}`)
      }
    }
  })
})
