const RANDOM_ITERS = 2000

const RAM_START = 0x4000
const RAM_END = 0xffff

describe('return <new PC> <new SP>', () => {
  test.each(MODELS)('%s', model => {
    for (let iters = 0; iters < RANDOM_ITERS; iters++) {
      // 1. use a return instruction to set a new SP and jump to a write instruction
      // 2. use the write instruction to verify that the new SP has been set

      let new_pc = random_int(RAM_START + 3, RAM_END - 3)
      let new_sp = random_word()

      // write sp+0 0
      const GET_STACK_POINTER = `
      1001000000000000
      0000000000000000
      0000000000000000
      `

      // return <new PC> <new SP>
      const RETURN = `
      0010000000000000
      ${to_bin_word(new_pc)}
      ${to_bin_word(new_sp)}
      `

      model.reset()
      model.set_mem(RETURN, RAM_START)
      model.set_mem(GET_STACK_POINTER, new_pc)

      // execute return instruction
      model.step(4)

      // fetch next instruction
      model.step()
      if (model.read_bus !== new_pc) {
        throw new Error(`Expected read from ${new_pc} (op 1, new program counter), got ${model.read_bus}`)
      }

      // execute write instruction
      model.step(3)
      if (model.data_bus !== new_sp) {
        throw new Error(`Expected data bus = ${new_sp} (op 2, new stack pointer), got ${model.data_bus}`)
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
      model.set_mem(PROGRAM, RAM_START)

      // execute instruction
      model.step(4)

      // fetch next instruction
      model.step()

      if ((op2 & 1) == 0) {
        // condition is true, expect PC = op1
        if (model.read_bus !== op1) {
          throw new Error(`Expected read from ${op1} (op 1), got ${model.read_bus}`)
        }
      } else {
        // condition is false, expect PC = PC + 1
        const NEXT_ADDR = RAM_START + 3
        if (model.read_bus !== NEXT_ADDR) {
          throw new Error(`Expected read from ${NEXT_ADDR} (next instruction), got ${model.read_bus}`)
        }
      }
    }
  })
})

describe('call <new PC> <new SP>', () => {
  test.each(MODELS)('%s', model => {
    for (let iters = 0; iters < RANDOM_ITERS; iters++) {
      // 1. use a return instruction to set the SP to a known value
      // 2. use a call instruction to set a new SP and jump to a write instruction
      // 3. check that the call has saved the old SP and PC values
      // 4. use the write instruction to verify that the new SP has been set

      // program 1 size: 6 words (return + call)
      // program 2 size: 3 words (write)
      const program_1_base = RAM_START
      const program_2_base = random_int(program_1_base + 6, RAM_END - 6)

      let new_pc = program_2_base

      // choose a new SP that will not overwrite either program
      // "call" writes data to new SP and new SP+1
      let new_sp = program_1_base
      while (
        ((new_sp >= program_1_base - 1) && (new_sp < program_1_base + 6)) ||
        ((new_sp >= program_2_base - 1) && (new_sp < program_2_base + 3))
        ) {
        new_sp = random_int(RAM_START, RAM_END)
      }

      let old_sp = random_word()

      // return <next instr.> <old SP>
      // call <new PC> <new SP>
      const PROGRAM_1 = `
      0010000000000000
      ${to_bin_word(program_1_base + 3)}
      ${to_bin_word(old_sp)}
      0110000000000000
      ${to_bin_word(new_pc)}
      ${to_bin_word(new_sp)}
      `

      // write sp+0 0
      const PROGRAM_2 = `
      1001000000000000
      0000000000000000
      0000000000000000
      `

      model.reset()
      model.set_mem(PROGRAM_1, program_1_base)
      model.set_mem(PROGRAM_2, program_2_base)

      // execute return instruction to set old SP value
      model.step(4)

      // fetch call instruction & operands
      model.step(3)

      model.step()
      // expect write of the PC value to the address of the new SP
      if (model.write_bus !== new_sp) {
        throw new Error(`Expected write bus = ${new_sp} (op 2, new stack pointer), got ${model.write_bus}`)
      }

      if (model.data_bus !== RAM_START + 6) {
        throw new Error(`Expected data bus = ${RAM_START + 6} (program counter), got ${model.data_bus}`)
      }

      model.step()
      // expect write of the old SP value to the address of the new SP + 1
      if (model.write_bus !== new_sp + 1) {
        throw new Error(`Expected write bus = ${new_sp + 1} (op 2, new stack pointer) + 1, got ${model.write_bus}`)
      }

      if (model.data_bus !== old_sp) {
        throw new Error(`Expected data bus = ${old_sp} (old stack pointer), got ${model.data_bus}`)
      }

      // no bus activity: but this cycle should set PC & SP to their new values
      model.step()

      // fetch next instruction (program 2)
      model.step()
      if (model.read_bus !== new_pc) {
        throw new Error(`While checking new SP value:\n Expected read from ${new_pc} (op 1, new program counter), got ${model.read_bus}`)
      }

      // execute write instruction
      model.step(3)
      if (model.data_bus !== new_sp) {
        throw new Error(`While checking new SP value:\n Expected data bus = ${new_sp} (op 2, new stack pointer), got ${model.data_bus}`)
      }
    }
  })
})

describe('write <data> <dest.>', () => {
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
      model.set_mem(PROGRAM, RAM_START)

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

describe('copy <source> <dest.>', () => {
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
      model.set_mem(PROGRAM, RAM_START)

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
