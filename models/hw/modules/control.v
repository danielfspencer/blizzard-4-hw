`include "headers/bus.vh"
`include "headers/clocks.vh"
`include "headers/addresses.vh"

module control (
    `CLOCKS,
    `BUSES_FOR_PRIMARY,
    input enabled
    );

    initial begin
        $readmemb("fetch_ucode.mem", fetch_ucode);
        $readmemb("execute_ucode.mem", execute_ucode);
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
        u_program_counter <= 0;

        read_out_en <= 0;
        data_out_en <= 0;
        write_out_en <= 0;
    end

    always @ (posedge ctrl_clk) begin
        if (enabled) begin
            read_out <= 'h8005;
            read_out_en <= 1;

            write_out <= 'h4000;
            write_out_en <= 1;


            case (control_mode)
                FETCH: begin
                    // 4:3 addr_mode = 12:11 command_word
                    // 2:0 u_program_counter
                    fetch_u_instr <= fetch_ucode[
                        command_word[12:11] +
                        u_program_counter
                        ];
                end
                EXECUTE: begin
                    // 4:2 opcode = 15:13 command_word
                    // 1:0 u_program_counter (first 2 bits only)
                    execute_u_instr <= fetch_ucode[
                        command_word[15:13] +
                        u_program_counter[1:0]
                        ];
                end
            endcase
        end
    end

    always @ (posedge read_clk) begin
        u_program_counter <= u_program_counter + 1;
        // read clk instructions
    end

    always @ (posedge write_clk) begin
        // write clk instructions

        if (fetch_u_instr[0] ||
            execute_u_instr[0]) u_program_counter <= 0;
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
