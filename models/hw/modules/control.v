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

    // microcode memory (8 bit x 32)
    `define UCODE_WIDTH [7:0]
    reg `UCODE_WIDTH fetch_ucode [31:0];
    reg `UCODE_WIDTH execute_ucode [31:0];

    // bus outputs
    reg read_out_en;
    reg data_out_en;
    reg write_out_en;

    reg `WORD read_out;
    reg `WORD data_out;
    reg `WORD write_out;

    // internal state
    enum reg {FETCH, EXECUTE} control_mode;

    reg `WORD stack_pointer;
    reg `WORD program_counter;
    reg [2:0] u_program_counter;

    reg `WORD command_word;
    reg `WORD arg_1;
    reg `WORD arg_2;
    reg `WORD arg_3;

    // microcode memory address
    wire [4:0] fetch_u_addr =     // bit | source
        (command_word[10] << 4) + // 4   | arg2 imm(0)/dir(1) mode
        (command_word[7] << 3) +  // 3   | arg1 imm(0)/dir(1) mode
        u_program_counter;        // 2:0 | micro program counter

    wire [4:0] execute_u_addr =      // bit | source
        (command_word[15:13] << 2) + // 4:2 | opcode
        u_program_counter[1:0];      // 1:0 | micro program counter (lower 2 bits)

    // microcode instruction fetch
    wire `UCODE_WIDTH fetch_u_instr = fetch_ucode[fetch_u_addr];
    wire `UCODE_WIDTH execute_u_instr = execute_ucode[execute_u_addr];

    // reset
    always @ (posedge reset) begin
        control_mode <= FETCH;
        program_counter <= `RAM_START;
        u_program_counter <= 0;

        read_out_en <= 0;
        data_out_en <= 0;
        write_out_en <= 0;
    end

    // offset for relative addressing modes
    reg `WORD offset;

    always @ (*) begin
        if (
            (command_word[12] && fetch_u_instr[2]) || // arg1 is relative && currently loading arg1
            (command_word[9]  && fetch_u_instr[3])    // arg2 is relative && currently loading arg2
        )
        begin
            // relative mode
            if (
                (command_word[11] && fetch_u_instr[2]) || // arg1 is PC-rel && currently loading arg1
                (command_word[8] && fetch_u_instr[3])     // arg2 is PC-rel && currently loading arg2
            ) begin
                // PC-relative
                offset = program_counter;
            end else begin
                // SP-relative
                offset = stack_pointer;
            end
        end else begin
            // non-relative mode
            offset = 0;
        end
    end

    always @ (posedge ctrl_clk) begin
        if (enabled) begin
            case (control_mode)
                FETCH: begin
                    if (!fetch_u_instr[7]) begin // pc -> read bus
                        read_out <= program_counter; read_out_en <= 1;
                    end
                    if (!fetch_u_instr[6]) begin // arg3 -> read bus
                        read_out <= arg_3; read_out_en <= 1;
                    end
                end
                EXECUTE: begin
                    if (execute_u_instr[1]) begin // stop clock
                        // TODO
                    end
                    if (!execute_u_instr[2]) begin // sp -> data bus AND (arg 2) + 1 -> write bus
                        data_out <= stack_pointer; data_out_en <= 1;
                        write_out <= arg_2 + 1; write_out_en <= 1;
                    end
                    if (!execute_u_instr[3]) begin // pc -> data bus
                        data_out <= program_counter; data_out_en <= 1;
                    end
                    if (!execute_u_instr[4]) begin // arg 2 -> write bus
                        write_out <= arg_2; write_out_en <= 1;
                    end
                    if (execute_u_instr[5]) begin //arg 1 -> pc uncond. AND arg 2 -> sp
                        program_counter <= arg_1;
                        stack_pointer <= arg_2;
                    end

                    // arg 1 destination select
                    case (execute_u_instr[7:6])
                        0: ; // nowhere
                        1: begin // arg 1 -> pc [if arg 2 LSB = 0]
                            if (arg_2[0] == 0) program_counter <= arg_1;
                        end
                        2: begin // arg 1 -> read bus
                            read_out <= arg_1; read_out_en <= 1;
                        end
                        3: begin // arg 1 -> data bus
                            data_out <= arg_1; data_out_en <= 1;
                        end
                    endcase
                end
            endcase
        end
    end

    always @ (posedge write_clk) begin
        if (enabled) begin
            if (control_mode == FETCH) begin
                if (fetch_u_instr[1]) begin // increment PC
                    program_counter <= program_counter + 1;
                end

                // data bus destination select
                case (fetch_u_instr[5:4])
                    0: command_word <= data_bus + offset;
                    1: arg_1 <= data_bus + offset;
                    2: arg_2 <= data_bus + offset;
                    3: arg_3 <= data_bus + offset;
                endcase
            end

            // increment mode (effective in both FETCH and EXECUTE)
            if (
                (control_mode == FETCH   && fetch_u_instr[0]) ||
                (control_mode == EXECUTE && execute_u_instr[0])
                ) begin
                u_program_counter <= 0;
                control_mode <= control_mode + 1;
            end else begin
                u_program_counter <= u_program_counter + 1;
            end
        end
    end

    always @ (negedge write_clk) begin
        read_out_en <= 0;
        data_out_en <= 0;
        write_out_en <= 0;
    end

    assign read_bus = read_out_en ? read_out : `WORD_SIZE'hz;
    assign data_bus = data_out_en ? data_out : `WORD_SIZE'hz;
    assign write_bus = write_out_en ? write_out : `WORD_SIZE'hz;
endmodule
