describe('addition', () => {
  test.each(MODELS)('%s', model => {
    for (let i = 0; i < DUAL_OP_ITERS; i++) {
      let a = random_word()
      let b = random_word()
      let ans = (a + b) & 0xffff

      model.write(a,8)
      model.write(b,9)

      let result = model.read(10)

      if (result !== ans) {
        throw new Error(`${a} + ${b} did not return ${ans} (got ${result})`)
      }
    }
  })
})

describe('subtraction', () => {
  test.each(MODELS)('%s', model => {
    for (let i = 0; i < DUAL_OP_ITERS; i++) {
      let a = random_word()
      let b = random_word()
      let ans = (a - b) & 0xffff

      model.write(a,8)
      model.write(b,9)

      let result = model.read(11)

      if (result !== ans) {
        throw new Error(`${a} - ${b} did not return ${ans} (got ${result})`)
      }
    }
  })
})

describe('∧ (and)', () => {
  test.each(MODELS)('%s', model => {
    for (let i = 0; i < DUAL_OP_ITERS; i++) {
      let a = random_word()
      let b = random_word()
      let ans = a & b

      model.write(a,8)
      model.write(b,9)

      let result = model.read(14)

      if (result !== ans) {
        throw new Error(`${a} & ${b} did not return ${ans} (got ${result})`)
      }
    }
  })
})

describe('∨ (or)', () => {
  test.each(MODELS)('%s', model => {
    for (let i = 0; i < DUAL_OP_ITERS; i++) {
      let a = random_word()
      let b = random_word()
      let ans = a | b

      model.write(a,8)
      model.write(b,9)

      let result = model.read(15)

      if (result !== ans) {
        throw new Error(`${a} | ${b} did not return ${ans} (got ${result})`)
      }
    }
  })
})

describe('greater than', () => {
  test.each(MODELS)('%s', model => {
    for (let i = 0; i < DUAL_OP_ITERS; i++) {
      let a = random_word()
      let b = random_word()
      let ans = (a > b) * 1

      model.write(a,8)
      model.write(b,9)

      let result = model.read(17)

      if (result !== ans) {
        throw new Error(`${a} > ${b} did not return ${ans} (got ${result})`)
      }
    }
  })
})

describe('less than', () => {
  test.each(MODELS)('%s', model => {
    for (let i = 0; i < DUAL_OP_ITERS; i++) {
      let a = random_word()
      let b = random_word()
      let ans = (a < b) * 1

      model.write(a,8)
      model.write(b,9)

      let result = model.read(18)

      if (result !== ans) {
        throw new Error(`${a} < ${b} did not return ${ans} (got ${result})`)
      }
    }
  })
})

describe('equal to', () => {
  test.each(MODELS)('%s', model => {
    for (let i = 0; i < DUAL_OP_ITERS; i++) {
      let a = random_word()
      let b = random_word()
      let ans = (a == b) * 1

      model.write(a,8)
      model.write(b,9)

      let result = model.read(19)

      if (result !== ans) {
        throw new Error(`${a} == ${b} did not return ${ans} (got ${result})`)
      }
    }
  })
})

describe('overflow', () => {
  test.each(MODELS)('%s', model => {
    for (let i = 0; i < DUAL_OP_ITERS; i++) {
      let a = random_word()
      let b = random_word()
      let ans = ((a + b) > 0xffff) * 1

      model.write(a,8)
      model.write(b,9)

      let result = model.read(20)

      if (result !== ans) {
        throw new Error(`(${a} + ${b}) > 0xffff did not return ${ans} (got ${result})`)
      }
    }
  })
})
