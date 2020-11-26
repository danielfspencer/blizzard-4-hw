const fs = require("fs")
const CYCLES = 100000 // ~1 second

describe('text editor', () => {
  test(CROSS_CHECK.toString(), () => {
    const program = fs.readFileSync("../../programs/type_test.bin").toString()

    let model = CROSS_CHECK
    model.reset()
    model.set_mem(program, 0x8000)

    const strings = ["Hello world", "", "This is a consistency based integration test"]

    let ps2_bytes = []
    for (let string of strings) {
        for (let char of string) {
            let code
            let is_uppercase = false
            if (char === " ") {
                code = "Space"
            } else {
                is_uppercase = char === char.toUpperCase()
                char = char.toUpperCase()
                code = `Key${char}`
            }

            if (is_uppercase) {
                // shift down (for uppercase)
                ps2_bytes.push(...keypress_to_scancode("ShiftLeft", true))
            }
            // keydown
            ps2_bytes.push(...keypress_to_scancode(code, true))

            // keyup
            ps2_bytes.push(...keypress_to_scancode(code, false))

            if (is_uppercase) {
                // shift up (for uppercase)
                ps2_bytes.push(...keypress_to_scancode("ShiftLeft", false))
            }
        }

        // return (newline)
        ps2_bytes.push(...keypress_to_scancode("Enter", true))
        ps2_bytes.push(...keypress_to_scancode("Enter", false))
    }


    // spread adding the bytes to the buffer over the length of the simulation
    // this stresses the fifo more because it is being written to and read from at the same time
    for (let i = 0; i < 10; i++) {
        if (ps2_bytes.length > 0) {
            for (let bytes = 0; bytes < 30; bytes++) {
                let byte = ps2_bytes.shift()
                if (byte !== undefined) {
                    model.send_ps2_bytes([byte])
                }
            }
        }
        model.step(CYCLES * (1/10))
    }
  })
})
