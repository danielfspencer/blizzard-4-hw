`include "headers/types.vh"

module blizzard_4 (
    input clk,
    input reset,
    input ctrl_enable,
    input ps2_data,
    input ps2_clock
    );

    wire ctrl_clk;
    wire read_clk;
    wire write_clk;

    wire `WORD read_bus;
    wire `WORD data_bus;
    wire `WORD write_bus;

    bridge bridge(
        .read_clk(read_clk),
        .write_clk(write_clk),
        .reset(reset),
        .read_bus(read_bus),
        .data_bus(data_bus),
        .write_bus(write_bus)
        );

    alu alu(
        .read_clk(read_clk),
        .write_clk(write_clk),
        .reset(reset),
        .read_bus(read_bus),
        .data_bus(data_bus),
        .write_bus(write_bus)
        );

    ram ram(
        .read_clk(read_clk),
        .write_clk(write_clk),
        .reset(reset),
        .read_bus(read_bus),
        .data_bus(data_bus),
        .write_bus(write_bus)
        );

    vram vram(
        .read_clk(read_clk),
        .write_clk(write_clk),
        .reset(reset),
        .read_bus(read_bus),
        .data_bus(data_bus),
        .write_bus(write_bus)
        );

    io io(
        .ps2_data(ps2_data),
        .ps2_clock(ps2_clock),

        .ctrl_clk(ctrl_clk),
        .read_clk(read_clk),
        .write_clk(write_clk),
        .reset(reset),
        .read_bus(read_bus),
        .data_bus(data_bus),
        .write_bus(write_bus)
        );

    control control(
        .enabled(ctrl_enable),

        .ctrl_clk(ctrl_clk),
        .read_clk(read_clk),
        .write_clk(write_clk),
        .reset(reset),
        .read_bus(read_bus),
        .data_bus(data_bus),
        .write_bus(write_bus)
        );

    clock_generator #(.PHASES(3)) clock_generator(
        .reset(reset),
        .clk(clk),
        .out({write_clk, read_clk, ctrl_clk})
        );
endmodule
