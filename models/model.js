class Model {
    destroy () {}

    set_mem(input, dest) {
        let array = input.trim().split("\n")

        for (let i = 0; i < array.length; i++) {
            let number = parseInt(array[i], 2)

            if (number >= 0 && number <= 0xffff) {
                this.write(number, dest+ i)
            } else {
                throw new Error(`Illegal memory input, word ${i}: '${array[i]}'`)
            }
        }
    }
}

module.exports = Model
