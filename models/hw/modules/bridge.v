`include "headers/bus.vh"
`include "headers/clocks.vh"

module bridge (
    `CLOCKS,
    `BUSES_FOR_PRIMARY
    );

    reg `WORD read_out = 0;
    reg `WORD data_out = 0;
    reg `WORD write_out = 0;

    reg read_out_en = 0;
    reg data_out_en = 0;
    reg write_out_en = 0;

    reg `WORD latest_read_bus = 0;
    reg `WORD latest_data_bus = 0;
    reg `WORD latest_write_bus = 0;

    always @ (posedge write_clk) begin
        latest_read_bus <= read_bus;
        latest_data_bus <= data_bus;
        latest_write_bus <= write_bus;
    end

    always @ (negedge write_clk) begin
        data_out_en = 0;
        read_out_en = 0;
        write_out_en = 0;
    end

    assign read_bus = read_out_en ? read_out : `WORD_SIZE'hz;
    assign data_bus = data_out_en ? data_out : `WORD_SIZE'hz;
    assign write_bus = write_out_en ? write_out : `WORD_SIZE'hz;

    export "DPI-C" task set_read_bus;
    export "DPI-C" task set_data_bus;
    export "DPI-C" task set_write_bus;

    export "DPI-C" function get_read_bus;
    export "DPI-C" function get_data_bus;
    export "DPI-C" function get_write_bus;

    function int get_read_bus();
        return latest_read_bus;
    endfunction

    function int get_data_bus();
        return latest_data_bus;
    endfunction

    function int get_write_bus();
        return latest_write_bus;
    endfunction

    task set_read_bus(input int value);
        read_out = value;
        read_out_en = 1;
    endtask

    task set_data_bus(input int value);
        data_out = value;
        data_out_en = 1;
    endtask

    task set_write_bus(input int value);
        write_out = value;
        write_out_en = 1;
    endtask
endmodule
