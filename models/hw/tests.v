`include "headers/addresses.vh"

`include "alu.v"
`include "ram.v"
`include "rom.v"
`include "control.v"
`include "clock_generator.v"

`timescale 1ns / 1ns

`define CLOCK repeat (2) begin clk = 1; #1 clk = 0; #1; end

module main();
    reg clk;
    reg reset;
    reg ctrl_enable;

    reg [15:0] read_out = 0;
    reg [15:0] data_out = 0;
    reg [15:0] write_out = 0;

    reg read_out_en = 0;
    reg data_out_en = 0;
    reg write_out_en = 0;

    initial begin
        $dumpfile("out.vcd");
        $dumpvars();

        clk = 0;
        ctrl_enable = 0;
        reset = 0;
        #1;
        reset = 1;
        #1;
        reset = 0;
        #1;

        // 5 -> alu.1
        write_out = `ALU_1; write_out_en = 1;
        data_out = 5; data_out_en = 1;
        `CLOCK

        // 3 -> alu.1
        write_out = `ALU_2; write_out_en = 1;
        data_out = 3; data_out_en = 1;
        `CLOCK

        // +
        read_out = `ALU_ADD; read_out_en = 1;
        `CLOCK

        // // -
        // read_out = `ALU_SUB; read_out_en = 1;
        // `CLOCK

        // // >>
        // read_out = `ALU_RS; read_out_en = 1;
        // `CLOCK

        // // <<
        // read_out = `ALU_LS; read_out_en = 1;
        // `CLOCK

        // // &
        // read_out = `ALU_AND; read_out_en = 1;
        // `CLOCK

        // // |
        // read_out = `ALU_OR; read_out_en = 1;
        // `CLOCK

        // // !
        // read_out = `ALU_NOT; read_out_en = 1;
        // `CLOCK

        // // >
        // read_out = `ALU_GT; read_out_en = 1;
        // `CLOCK

        // // <
        // read_out = `ALU_LT; read_out_en = 1;
        // `CLOCK

        // // ==
        // read_out = `ALU_EQ; read_out_en = 1;
        // `CLOCK

        // // ffff -> alu.1
        // write_out = `ALU_1; write_out_en = 1;
        // data_out = 65535; data_out_en = 1;
        // `CLOCK

        // // 1 -> alu.1
        // write_out = `ALU_2; write_out_en = 1;
        // data_out = 1; data_out_en = 1;
        // `CLOCK

        // // ov
        // read_out = `ALU_OV; read_out_en = 1;
        // `CLOCK

        // // 0xabcd -> ram.0
        // write_out = `RAM_START + 0; write_out_en = 1;
        // data_out = 16'habcd; data_out_en = 1;
        // `CLOCK

        // // 0xef01 -> ram.1
        // write_out = `RAM_START + 1; write_out_en = 1;
        // data_out = 16'hef01; data_out_en = 1;
        // `CLOCK

        // // ram.0
        // read_out = `RAM_START + 0; read_out_en = 1;
        // `CLOCK

        // // ram.1
        // read_out = `RAM_START + 1; read_out_en = 1;
        // `CLOCK;

        // // 1 -> sp
        // write_out = `STACK_POINT; write_out_en = 1;
        // data_out = 1; data_out_en = 1;
        // `CLOCK

        // // stack.0
        // read_out = `STACK_START + 0; read_out_en = 1;
        // `CLOCK;

        // // stack.0 -> ram.0
        // read_out = `STACK_START + 0; read_out_en = 1;
        // write_out = `RAM_START + 0; write_out_en = 1;
        // `CLOCK

        // // ram.0
        // read_out = `RAM_START + 0; read_out_en = 1;
        // `CLOCK

        // ctrl_enable = 1;
        // repeat (1000000) `CLOCK;

        $finish();
    end

    always @ (negedge write_clk) begin
        data_out_en <= 0;
        read_out_en <= 0;
        write_out_en <= 0;
    end

    wire [15:0] read_bus;
    wire [15:0] data_bus;
    wire [15:0] write_bus;

    assign read_bus = read_out_en ? read_out : 'hz;
    assign data_bus = data_out_en ? data_out : 'hz;
    assign write_bus = write_out_en ? write_out : 'hz;

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

    rom rom(
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
        .reset(reset),
        .read_bus(read_bus),
        .data_bus(data_bus),
        .write_bus(write_bus)
        );

    clock_generator #(.PHASES(3)) clock_generator
    (
        .reset(reset),
        .clk(clk),
        .out({write_clk, read_clk, ctrl_clk})
    );
endmodule
