// decodes PS/2 serial data. asserts rx_done when byte ready

module ps2_interface(
    input reset,
    input ps2_data,
    input ps2_clock,
    output [7:0] rx_data,
    output rx_parity,
    output rx_done
    );

    // stores the current number of bits received
    reg [3:0] bit_count;

    // stores the received byte
    reg [7:0] data;

    // stores the parity bit
    reg parity_bit;

    // set to 1 when byte is ready
    reg byte_complete;

    always @ (negedge ps2_clock) begin
        // PS/2 data frame is 11 bits (1 start bit, 8 data bits, 1 parity bit, 1 stop bit)
        case (bit_count)
            0: byte_complete <= 0;
            1: data[0] <= ps2_data;
            2: data[1] <= ps2_data;
            3: data[2] <= ps2_data;
            4: data[3] <= ps2_data;
            5: data[4] <= ps2_data;
            6: data[5] <= ps2_data;
            7: data[6] <= ps2_data;
            8: data[7] <= ps2_data;
            9: parity_bit <= ps2_data;
            10: byte_complete <= 1;
        endcase

        // if the whole frame has not been received, move on to the next bit
        // otherwise, reset to 0 bits received ready for the next frame
        if (bit_count < 10) begin
            bit_count <= bit_count + 1;
        end else begin
            bit_count <= 0;
        end
    end

    always @ (posedge reset) begin
        bit_count <= 0;
        data <= 0;
        parity_bit <= 0;
        byte_complete <= 0;
    end

    // assign to produce non-reg outputs
    assign rx_data = data;
    assign rx_parity = parity_bit;
    assign rx_done = byte_complete;
endmodule
