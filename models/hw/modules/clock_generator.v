module clock_generator
    # (
    parameter PHASES = 1
    ) (
    input clk,
    input reset,
    output [PHASES-1:0] out
    );

    reg [PHASES-1:0] counter;

    always @ (posedge reset) counter <= 0;

    always @ (posedge clk or negedge clk) begin
        if (counter != {PHASES{1'b1}}) begin
            counter <= 1 + (counter << 1);
        end else begin
            counter <= 0;
        end
    end

    assign out = counter;
endmodule
