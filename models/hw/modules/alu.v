`include "headers/bus.vh"
`include "headers/clocks.vh"
`include "headers/addresses.vh"

module alu (
    `CLOCKS,
    `BUSES
    );

    reg `WORD op1;
    reg `WORD op2;

    reg out_en;
    reg `WORD out_buffer;

    always @ (posedge reset) out_en <= 0;
    always @ (negedge write_clk) out_en <= 0;

    always @ (posedge read_clk) begin
        if (read_bus >= `ALU_ADD && read_bus <= `ALU_OV)
            out_en <= 1;

        case (read_bus)
            `ALU_ADD: begin out_buffer <= op1 + op2; end
            `ALU_SUB: begin out_buffer <= op1 - op2; end
            `ALU_RS : begin out_buffer <= op1 >> 1; end
            `ALU_LS : begin out_buffer <= op1 << 1; end
            `ALU_AND: begin out_buffer <= op1 & op2; end
            `ALU_OR : begin out_buffer <= op1 | op2; end
            `ALU_NOT: begin out_buffer <= ~op1; end
            `ALU_GT : begin out_buffer <= op1 > op2; end
            `ALU_LT : begin out_buffer <= op1 < op2; end
            `ALU_EQ : begin out_buffer <= op1 == op2; end
            `ALU_OV : begin out_buffer <= ({1'b0, op1} + {1'b0, op2}) >> 16; end
        endcase
    end

    always @ (posedge write_clk) begin
        case (write_bus)
            `ALU_1: op1 <= data_bus;
            `ALU_2: op2 <= data_bus;
        endcase
    end

    assign data_bus = out_en ? out_buffer : `WORD_SIZE'hz;
endmodule
