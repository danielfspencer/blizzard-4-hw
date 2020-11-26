`include "headers/bus.vh"
`include "headers/clocks.vh"
`include "headers/addresses.vh"

module rom (
    `CLOCKS,
    `BUSES,
    input write_protect
    );

    parameter DEPTH = 32768;
    reg `WORD memory [DEPTH-1:0];

    reg out_en;
    reg `WORD out_buffer;

    always @ (posedge reset) out_en <= 0;
    always @ (negedge write_clk) out_en <= 0;

    always @ (posedge read_clk) begin
        if (read_bus >= `ROM_START && read_bus <= `ROM_END) begin
            out_buffer <= memory[read_bus - `ROM_START];
            out_en <= 1;
        end
    end

    always @ (posedge write_clk) begin
        if (~write_protect && write_bus >= `ROM_START && write_bus <= `ROM_END) begin
            memory[write_bus - `ROM_START] <= data_bus;
        end
    end


    assign data_bus = out_en ? out_buffer : `WORD_SIZE'hz;
endmodule
