`include "headers/bus.vh"
`include "headers/clocks.vh"
`include "headers/addresses.vh"

`include "generic/async_fifo.v"
`include "generic/ps2_interface.v"

module io (
    input ps2_data,
    input ps2_clock,
    `CLOCKS,
    `BUSES
    );

    reg out_en;
    reg `WORD out_buffer;

    always @ (posedge reset) out_en <= 0;
    always @ (negedge write_clk) out_en <= 0;

    always @ (posedge read_clk) begin
        if (read_bus == `IO_POP && !fifo_empty) begin
            out_en <= 1;
            out_buffer <= read_byte;
        end
    end

    assign data_bus = out_en ? out_buffer : `WORD_SIZE'hz;

    // ps2 decoding and fifo
    wire input_ready;
    wire [7:0] input_byte;

    wire [7:0] read_byte;
    wire fifo_empty;

    async_fifo # (
        .DATA_WIDTH(8),
        .ADDR_WIDTH(8)
    ) fifo (
        .areset(reset),

        .write_clk(input_ready),
        .write_en(1),
        .write_data(input_byte),

        .read_clk(out_en),
        .read_en(1),
        .read_data(read_byte),
        .empty(fifo_empty)
    );

    ps2_interface decoder(
        .reset(reset),
        .ps2_data(ps2_data),
        .ps2_clock(ps2_clock),

        .rx_data(input_byte),
        .rx_done(input_ready)
    );
endmodule
