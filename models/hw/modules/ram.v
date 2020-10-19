`include "headers/bus.vh"
`include "headers/clocks.vh"
`include "headers/addresses.vh"

module ram (
    `CLOCKS,
    `BUSES
    );

    initial begin
        $readmemh("ram_image.mem", memory);
    end

    parameter DEPTH = 16384;
    reg `WORD memory [DEPTH-1:0];

    reg [13:0] stack_pointer;

    reg out_en;
    reg `WORD out_buffer;

    always @ (posedge reset) out_en <= 0;
    always @ (negedge write_clk) out_en <= 0;

    always @ (posedge read_clk) begin
        if (read_bus == `STACK_POINT) begin
            out_buffer <= stack_pointer;
            out_en <= 1;
        end

        if (read_bus >= `RAM_START && read_bus < `RAM_END) begin
            out_buffer <= memory[read_bus - `RAM_START];
            out_en <= 1;
        end

        if (read_bus >= `STACK_START && read_bus < `STACK_END) begin
            out_buffer <= memory[read_bus - `STACK_START + stack_pointer];
            out_en <= 1;
        end
    end

    always @ (posedge write_clk) begin
        if (write_bus == `STACK_POINT) begin
            stack_pointer <= data_bus;
        end

        if (write_bus >= `RAM_START && write_bus < `RAM_END) begin
            memory[write_bus - `RAM_START] <= data_bus;
        end

        if (write_bus >= `STACK_START && write_bus < `STACK_END) begin
            memory[write_bus - `STACK_START + stack_pointer] <= data_bus;
        end
    end


    assign data_bus = out_en ? out_buffer : `WORD_SIZE'hz;
endmodule
