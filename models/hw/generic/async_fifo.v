module async_fifo(
    input areset,

    input [DATA_WIDTH-1:0] write_data,
    input write_clk,
    input write_en,
    output full,

    output [DATA_WIDTH-1:0] read_data,
    input read_clk,
    input read_en,
    output empty
    );

    parameter DATA_WIDTH = 8;
    parameter ADDR_WIDTH = 11;
    parameter FIFO_DEPTH = 2 ** ADDR_WIDTH;

    reg [DATA_WIDTH-1:0] mem [0:FIFO_DEPTH-1];
    reg [ADDR_WIDTH-1:0] read_index;
    reg [ADDR_WIDTH-1:0] write_index;

    always @ (posedge areset) begin
        read_index <= 0;
        write_index <= 0;
    end

    always @ (posedge read_clk) begin
        if (read_en && !empty) begin
            read_index <= read_index + 1;
        end
    end

    always @ (posedge write_clk) begin
        if (write_en && !full) begin
            mem[write_index] <= write_data;
            write_index <= write_index + 1;
        end
    end

    assign full = read_index == (write_index + 1);
    assign empty = read_index == write_index;
    assign read_data = mem[read_index];
endmodule
