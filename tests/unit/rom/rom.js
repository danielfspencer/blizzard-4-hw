describe('copy', () => {
  test.each(MODELS)('%s', model => {
    for (let addr = 0x8000; addr < 0xffff; addr++) {
      let value = random_word()

      model.write(value, addr)
      model.copy(addr, addr + 1)

      let result = model.read(addr + 1)

      if (result !== value) {
        throw new Error(`Read ${addr + 1} did not equal ${value} (got ${result})`)
      }
    }
  })
})

describe('read/write', () => {
  test.each(MODELS)('%s', model => {
    for (let addr = 0x8000; addr <= 0xffff; addr++) {
      let value = random_word()

      model.write(value, addr)

      let result = model.read(addr)

      if (result !== value) {
        throw new Error(`Read ${addr} did not equal ${value} (got ${result})`)
      }
    }
  })
})
