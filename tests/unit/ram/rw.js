describe('read/write', () => {
  test.each(MODELS)('%s', model => {
    for (let addr = 0x4000; addr < 0x8000; addr++) {
      let value = random_word()

      model.write(value, addr)

      let result = model.read(addr)

      if (result !== value) {
        throw new Error(`Read ${addr} did not equal ${value} (got ${result})`)
      }
    }
  })
})
