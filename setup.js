const random_int = require('random-int')

const { SoftwareModel } = require("./models/sw/interface")
const { HardwareModel } = require("./models/hw/interface")

global.MODELS = [new SoftwareModel(), new HardwareModel()]
global.DUAL_OP_ITERS = 100000

global.random_word = () => {
    return random_int(0, 0xffff)
}

afterAll(() => {
    MODELS.forEach(m => m.destroy())
})
