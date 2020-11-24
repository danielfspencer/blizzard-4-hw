describe('right shift', () => {
  test.each(MODELS)('%s', model => {
    for (let i = 0; i < 0xffff; i++) {
      let ans = (i >> 1) & 0xffff

      model.write(i,8)

      let result = model.read(12)

      if (result !== ans) {
        throw new Error(`${i} >> 1 did not return ${ans} (got ${result})`)
      }
    }
  })
})

describe('left shift', () => {
  test.each(MODELS)('%s', model => {
    for (let i = 0; i < 0xffff; i++) {
      let ans = (i << 1) & 0xffff

      model.write(i,8)

      let result = model.read(13)

      if (result !== ans) {
        throw new Error(`${i} << 1 did not return ${ans} (got ${result})`)
      }
    }
  })
})

describe('¬ (not)', () => {
  test.each(MODELS)('%s', model => {
    for (let i = 0; i < 0xffff; i++) {
      let ans = i ^ 0xffff

      model.write(i,8)

      let result = model.read(16)

      if (result !== ans) {
        throw new Error(`!${i} did not return ${ans} (got ${result})`)
      }
    }
  })
})
