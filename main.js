const {instance} = require("./models/hw/interface_wrapped")

i = instance()
// i = new HardwareModel()
i.read(0x8005)
i.write(1,8)
i.write(3,9)
i.read(10)
i.destroy()

i = instance()
// i = new HardwareModel()
i.read(0x8005)
i.write(1,8)
i.write(3,9)
i.read(10)
i.destroy()


// i.set_control_status(true)
// i.step(10000000)
