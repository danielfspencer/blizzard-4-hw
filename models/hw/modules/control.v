`include "headers/bus.vh"
`include "headers/clocks.vh"
`include "headers/addresses.vh"

module control (
    `CLOCKS,
    `BUSES_FOR_PRIMARY,
    input enabled
    );

    initial begin
        $readmemb("u_code/fetch.mem", fetch_ucode);
        $readmemb("u_code/execute.mem", execute_ucode);
    end

    // constants
    `define FETCH_UCODE_WIDTH [7:0]
    `define EXECUTE_UCODE_WIDTH [15:0]
    reg `FETCH_UCODE_WIDTH fetch_ucode [31:0];
    reg `EXECUTE_UCODE_WIDTH execute_ucode [23:0];

    // bus outputs
    reg read_out_en;
    reg data_out_en;
    reg write_out_en;

    reg `WORD read_out;
    reg `WORD data_out;
    reg `WORD write_out;

    // internal state
    enum reg {FETCH, EXECUTE} control_mode;

    reg `FETCH_UCODE_WIDTH fetch_u_instr;
    reg `EXECUTE_UCODE_WIDTH execute_u_instr;

    reg `WORD program_counter;
    reg [2:0] u_program_counter;

    reg `WORD command_word;
    reg `WORD arg_1;
    reg `WORD arg_2;
    reg `WORD arg_3;

    // reset
    always @ (posedge reset) begin
        control_mode <= FETCH;
        program_counter <= `ROM_START;
        u_program_counter <= 7;
        fetch_u_instr <= 0;
        execute_u_instr <= 0;

        read_out_en <= 0;
        data_out_en <= 0;
        write_out_en <= 0;
    end

    always @ (posedge ctrl_clk) begin
        if (enabled) begin
            case (control_mode)
                FETCH: begin
                    if (fetch_u_instr[7]) begin // pc -> read bus
                        read_out <= program_counter; read_out_en <= 1;
                    end
                    if (fetch_u_instr[6]) begin // arg 3 -> read bus
                        read_out <= arg_3; read_out_en <= 1;
                    end
                end
                EXECUTE: begin
                    if (execute_u_instr[15]) begin // arg 1 -> data bus
                        data_out <= arg_1; data_out_en <= 1;
                    end
                    if (execute_u_instr[14]) begin // arg 1 -> read bus
                        read_out <= arg_1; read_out_en <= 1;
                    end
                    if (execute_u_instr[13]) begin // arg 2 -> data bus
                        data_out <= arg_2; data_out_en <= 1;
                    end
                    if (execute_u_instr[12]) begin // arg 3 -> data bus
                        data_out <= arg_3; data_out_en <= 1;
                    end
                    if (execute_u_instr[11]) begin // arg 2 + arg 3 -> data bus
                        data_out <= arg_2 + arg_3; data_out_en <= 1;
                    end
                    if (execute_u_instr[10]) begin // ctl.sp -> read bus
                        read_out <= `STACK_POINT; read_out_en <= 1;
                    end
                    if (execute_u_instr[9]) begin // pc -> data bus
                        data_out <= program_counter; data_out_en <= 1;
                    end
                    if (execute_u_instr[8]) begin // ctl.sp -> write bus
                        write_out <= `STACK_POINT; write_out_en <= 1;
                    end
                    if (execute_u_instr[7]) begin // stack.0 -> write bus
                        write_out <= `STACK_START; write_out_en <= 1;
                    end
                    if (execute_u_instr[6]) begin // stack.1 -> write bus
                        write_out <= `STACK_START + 1; write_out_en <= 1;
                    end
                    if (execute_u_instr[5]) begin // arg 2 -> write bus
                        write_out <= arg_2; write_out_en <= 1;
                    end
                end
            endcase
        end
    end

    always @ (posedge read_clk) begin
        if (enabled) begin
            case (control_mode)
                FETCH: begin
                    if (fetch_u_instr[7]) begin // increment pc
                        program_counter <= program_counter + 1;
                    end
                end
                EXECUTE: begin
                    if (execute_u_instr[3]) begin // arg 1 -> pc [if arg 2 LSB = 0]
                        if (arg_2[0] == 0) program_counter <= arg_1;
                    end
                    if (execute_u_instr[2]) begin // arg 1 -> pc
                        program_counter <= arg_1;
                    end
                    if (execute_u_instr[1]) begin // stop clock
                        $display("Stop clock");
                    end
                end
            endcase
        end
    end

    always @ (posedge write_clk) begin
        if (enabled) begin
            case (control_mode)
                FETCH: begin
                    if (fetch_u_instr[5]) begin // data bus -> command reg
                        command_word <= data_bus;
                    end
                    if (fetch_u_instr[4]) begin // data bus -> arg 1
                        arg_1 <= data_bus;
                    end
                    if (fetch_u_instr[3]) begin // data bus -> arg 2
                        arg_2 <= data_bus;
                    end
                    if (fetch_u_instr[2]) begin // data bus -> arg 3
                        arg_3 <= data_bus;
                    end
                end
                EXECUTE: begin
                    if (execute_u_instr[4]) begin // data bus -> arg 3
                        arg_3 <= data_bus;
                    end
                end
            endcase

            if ((control_mode == FETCH   && fetch_u_instr[0])
              || control_mode == EXECUTE && execute_u_instr[0]) begin
                u_program_counter <= 0;
                control_mode <= control_mode + 1;
            end else begin
                u_program_counter <= u_program_counter + 1;
            end
        end
    end

    always @ (negedge write_clk) begin
        // 4:3 addr_mode = bits 12:11 of command_word
        // 2:0 u_pc      = bits 2:0 of u_program_counter
        fetch_u_instr <= fetch_ucode[
            ((command_word & 'b1100000000000) >> 8 ) +
            u_program_counter
            ];

        // 4:2 opcode = bits 15:13 of command_word
        // 1:0   u_pc = bits 1:0 of u_program_counter
        execute_u_instr <= execute_ucode[
            ((command_word & 'b1110000000000000) >> 11) +
            u_program_counter[1:0]
            ];

        read_out_en <= 0;
        data_out_en <= 0;
        write_out_en <= 0;
    end

    assign read_bus = read_out_en ? read_out : `WORD_SIZE'hz;
    assign data_bus = data_out_en ? data_out : `WORD_SIZE'hz;
    assign write_bus = write_out_en ? write_out : `WORD_SIZE'hz;
endmodule
