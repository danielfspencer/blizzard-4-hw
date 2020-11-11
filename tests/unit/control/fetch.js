describe('reset adddress', () => {
  test.each(MODELS)('%s', model => {
    model.reset()
    model.step()

    const RESET_ADDRESS = 0x8000
    // expect control unit to have fetched from RESET_ADDRESS
    if (model.read_bus !== RESET_ADDRESS) {
      throw new Error(`Expected read from ${RESET_ADDRESS}, got ${model.read_bus}`)
    }
  })
})

describe('fetch [imm] [imm]', () => {
  test.each(MODELS)('%s', model => {
    let [op1, op2] = [random_word(), random_word()]

    // write op1 op2
    const PROGRAM = `
    1000000000000000
    ${to_bin_word(op1)}
    ${to_bin_word(op2)}
    `
    model.reset()
    model.set_mem(PROGRAM, 0x8000)

    model.step(2)
    // expect control unit to have fetched op1
    if (model.data_bus !== op1) {
      throw new Error(`Expected data_bus = ${op1} (op 1), got ${model.data_bus}`)
    }

    model.step()
    // expect control unit to have fetched op2
    if (model.data_bus !== op2) {
      throw new Error(`Expected data_bus = ${op2} (op 2), got ${model.data_bus}`)
    }
  })
})

describe('fetch [imm] [direct]', () => {
  test.each(MODELS)('%s', model => {
    let [op1, op2] = [random_word(), random_word()]

    // write [op1] op2
    const PROGRAM = `
    1000100000000000
    ${to_bin_word(op1)}
    ${to_bin_word(op2)}
    `
    model.reset()
    model.set_mem(PROGRAM, 0x8000)

    model.step(2)
    // expect control unit to have fetched op1
    if (model.data_bus !== op1) {
      throw new Error(`Expected data_bus = ${op1} (op 1), got ${model.data_bus}`)
    }

    model.step()
    // expect control unit to have fetched op2
    if (model.data_bus !== op2) {
      throw new Error(`Expected data_bus = ${op2} (op 2), got ${model.data_bus}`)
    }

    model.step()
    // expect control unit to have looked up op2
    if (model.read_bus !== op2) {
      throw new Error(`Expected read_bus = ${op2} (op 2), got ${model.read_bus}`)
    }
  })
})

describe('fetch [direct] [imm]', () => {
  test.each(MODELS)('%s', model => {
    let [op1, op2] = [random_word(), random_word()]

    // write [op1] op2
    const PROGRAM = `
    1001000000000000
    ${to_bin_word(op1)}
    ${to_bin_word(op2)}
    `
    model.reset()
    model.set_mem(PROGRAM, 0x8000)

    model.step(2)
    // expect control unit to have fetched op1
    if (model.data_bus !== op1) {
      throw new Error(`Expected data_bus = ${op1} (op 1), got ${model.data_bus}`)
    }

    model.step()
    // expect control unit to have looked up op1
    if (model.read_bus !== op1) {
      throw new Error(`Expected read_bus = ${op1} (op 1), got ${model.read_bus}`)
    }

    model.step()
    // expect control unit to have fetched op2
    if (model.data_bus !== op2) {
      throw new Error(`Expected data_bus = ${op2} (op 2), got ${model.data_bus}`)
    }
  })
})

describe('fetch [direct] [direct]', () => {
  test.each(MODELS)('%s', model => {
    let [op1, op2] = [random_word(), random_word()]

    // write [op1] op2
    const PROGRAM = `
    1001100000000000
    ${to_bin_word(op1)}
    ${to_bin_word(op2)}
    `
    model.reset()
    model.set_mem(PROGRAM, 0x8000)

    model.step(2)
    // expect control unit to have fetched op1
    if (model.data_bus !== op1) {
      throw new Error(`Expected data_bus = ${op1} (op 1), got ${model.data_bus}`)
    }

    model.step()
    // expect control unit to have looked up op1
    if (model.read_bus !== op1) {
      throw new Error(`Expected read_bus = ${op1} (op 1), got ${model.read_bus}`)
    }

    model.step()
    // expect control unit to have fetched op2
    if (model.data_bus !== op2) {
      throw new Error(`Expected data_bus = ${op2} (op 2), got ${model.data_bus}`)
    }

    model.step()
    // expect control unit to have looked up op2
    if (model.read_bus !== op2) {
      throw new Error(`Expected read_bus = ${op2} (op 2), got ${model.read_bus}`)
    }
  })
})

