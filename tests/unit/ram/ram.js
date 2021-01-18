describe('copy', () => {
  test.each(MODELS)('%s', model => {
    for (let addr = 0x4000; addr < 0x8000 - 1; addr++) {
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

describe('stack pointer', () => {
  test.each(MODELS)('%s', model => {
    for (let stack_poitner = 0; stack_poitner < 0x4000; stack_poitner++) {
      let value = random_word()

      // write value to ram location
      model.write(value, 0x4000 + stack_poitner)

      // set stack pointer
      model.write(stack_poitner, 2)

      // try to access value via stack
      let result = model.read(0x800)

      if (result !== value) {
        throw new Error(`Read via stack expected ${value} (got ${result})`)
      }
    }
  })
})
