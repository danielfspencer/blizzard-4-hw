const random_int = require('random-int')
const keycode_to_scancode = require("./libs/scancodes")

const { SoftwareModel } = require("./models/sw/interface")
const { HardwareModel } = require("./models/hw/interface")
const { CrossCheck } = require("./models/crosscheck/interface")

global.MODELS = [new HardwareModel()]
global.CROSS_CHECK = new CrossCheck([...MODELS])

global.random_int = random_int

global.random_word = () => {
  return random_int(0, 0xffff)
}

global.to_bin_word = (num) => {
  return ("0000000000000000" + num.toString(2)).slice(-16)
}

global.keypress_to_scancode = (key, down) => {
  let scancodes = keycode_to_scancode[key]
  if (down) {
    return scancodes[0]
  } else {
    return scancodes[1]
  }
}

afterAll(() => {
  MODELS.forEach(m => m.destroy())
})
