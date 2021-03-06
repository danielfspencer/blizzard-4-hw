const RANDOM_ITERS = 2000

const RAM_START = 0x4000
const RAM_END = 0xffff

class AddressingMode {
  constructor(direct, relative, program_counter) {
    this.direct = direct
    this.relative = relative
    this.program_counter = program_counter
  }

  toString() {
    let string = ""
    if (this.direct) {
      string += "direct"
    } else {
      string += "imm."
    }

    if (this.relative) {
      string += ", "
      if (this.program_counter) {
        string += "PC-rel"
      } else {
        string += "SP-rel"
      }
    }

    return string
  }

  get_value() {
    const relative_bit = this.relative ? 1 : 0
    const program_counter_bit = this.program_counter ? 1 : 0
    const direct_bit = this.direct ? 1 : 0
    return (relative_bit << 2) + (program_counter_bit << 1) + (direct_bit)
  }
}

const RELATIVE_MODES = [
  [[0,1,0], [0,1,0]],
  [[0,1,0], [0,1,1]],
  [[0,1,1], [0,1,0]],
  [[0,1,1], [0,1,1]],
  [[1,1,0], [1,1,0]],
  [[1,1,0], [1,1,1]],
  [[1,1,1], [1,1,0]],
  [[1,1,1], [1,1,1]],
]

// relative modes


// direct modes can check that PC/SP has been added during value lookup
// immediate modes need more work
for (const [op_1, op_2] of RELATIVE_MODES) {
  generate_test([
    new AddressingMode(...op_1),
    new AddressingMode(...op_2)
  ])
}

function generate_test(modes) {
  describe(`fetch <${modes[0]}> <${modes[1]}>`, () => {
    test.each(MODELS)('%s', model => {
      for (let iters = 0; iters < RANDOM_ITERS; iters++) {

        // use a stop instruction because it only needs to be fetched
        let command_word = 0
        command_word += modes[0].get_value() << 10
        command_word += modes[1].get_value() << 7

        const OP_ADDRESSES = [
          RAM_START + 1,
          RAM_START + 2
        ]

        const OP_VALUES = [
          random_word(),
          random_word()
        ]

        const PROGRAM = `
          ${to_bin_word(command_word)}
          ${to_bin_word(OP_VALUES[0])}
          ${to_bin_word(OP_VALUES[1])}
        `

        model.reset()
        model.set_mem(PROGRAM, RAM_START)

        // command word fetch (already tested by reset address test)
        model.step()

        for (let i = 0; i < 2; i++) {
          // operand fetch
          model.step()
          if (model.read_bus !== OP_ADDRESSES[i]) {
            throw new Error(`Expected read from ${OP_ADDRESSES[i]} (op. ${i+1} address), got ${model.read_bus}`)
          }

          // operand value lookup (direct addressing)
          if (modes[i].direct) {
            model.step()

            if (model.read_bus !== OP_VALUES[i]) {
              throw new Error(`Expected read from ${OP_VALUES[i]} (op. ${i+1} value), got ${model.read_bus}`)
            }
          }
        }
      }
    })
  })
}
