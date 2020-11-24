const random_int = require('random-int')

const { SoftwareModel } = require("./models/sw/interface")
const { HardwareModel } = require("./models/hw/interface")

global.MODELS = [new SoftwareModel(), new HardwareModel()]
global.DUAL_OP_ITERS = 50000

global.random_int = random_int

global.random_word = () => {
  return random_int(0, 0xffff)
}

global.to_bin_word = (num) => {
  return ("0000000000000000" + num.toString(2)).slice(-16)
}

afterAll(() => {
  MODELS.forEach(m => m.destroy())
})
