const software = require("./models/sw/interface")
const hardware = require("./models/hw/interface")

module.exports = async () => {
    software.build()
    hardware.build()
}
