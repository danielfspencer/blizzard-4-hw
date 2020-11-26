const random_byte = () => random_int(0,0xff)

const FIFO_SIZE = 255
const RANDOM_ACCESSES = 10000

describe('starts empty', () => {
  test.each(MODELS)('%s', model => {
    model.reset()

    for (let i = 0; i < 100; i++) {
      if (model.read(0x1006) !== 0) {
        throw new Error(`Expected FIFO to be empty on reset`)
      }
    }
  })
})

describe('total fill & empty', () => {
  test.each(MODELS)('%s', model => {
    model.reset()

    let fifo = []
    for (let i = 0; i < FIFO_SIZE; i++) {
      let byte = random_byte()
      fifo.push(byte)
      model.send_ps2_bytes([byte])
    }

    for (let expected of fifo) {
      let actual = model.read(0x1006)
      if (actual !== expected) {
        throw new Error(`${fifo} Expected FIFO read = ${expected}, got ${actual}`)
      }
    }

    if (model.read(0x1006) !== 0) {
      throw new Error(`Expected FIFO to read 0 after emptying`)
    }
  })
})

describe('random access', () => {
  test.each(MODELS)('%s', model => {
    model.reset()

    let fifo = []

    for (let i = 0; i < RANDOM_ACCESSES; i++) {
      if (random_int(0,1) && fifo.length < FIFO_SIZE) {
        // write byte
        let byte = random_byte()

        fifo.push(byte)
        model.send_ps2_bytes([byte])
      } else {
        // read byte
        let expected = fifo.shift()

        if (expected === undefined) {
          expected = 0
        }

        let actual = model.read(0x1006)
        if (actual !== expected) {
          throw new Error(`Expected FIFO read = ${expected}, got ${actual} (transaction #${i+1})`)
        }
      }
    }
  })
})
