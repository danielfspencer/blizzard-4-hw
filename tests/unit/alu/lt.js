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
