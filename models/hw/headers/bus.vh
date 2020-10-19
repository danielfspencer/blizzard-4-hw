`include "headers/types.vh"

`define BUSES input `WORD read_bus, \
    inout `WORD data_bus, \
    input `WORD write_bus \

`define BUSES_FOR_PRIMARY inout `WORD read_bus, \
    inout `WORD data_bus, \
    inout `WORD write_bus \
