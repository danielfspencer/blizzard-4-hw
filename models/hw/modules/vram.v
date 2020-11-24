`include "headers/bus.vh"
`include "headers/clocks.vh"
`include "headers/addresses.vh"

module vram (
    `CLOCKS,
    `BUSES
    );

    parameter DEPTH = 1024;
    reg `WORD memory [DEPTH-1:0];

    reg out_en;
    reg `WORD out_buffer;

    always @ (posedge reset) out_en <= 0;
    always @ (negedge write_clk) out_en <= 0;

    always @ (posedge read_clk or posedge reset) begin
        if (read_bus >= `VRAM_START && read_bus <= `VRAM_END) begin
            out_buffer <= memory[read_bus - `VRAM_START];
            out_en <= 1;
        end
    end

    always @ (posedge write_clk) begin
        if (write_bus >= `VRAM_START && write_bus <= `VRAM_END) begin
            memory[write_bus - `VRAM_START] <= data_bus;
        end
    end


    assign data_bus = out_en ? out_buffer : `WORD_SIZE'hz;
endmodule
