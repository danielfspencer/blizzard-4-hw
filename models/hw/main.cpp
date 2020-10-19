#include <stdlib.h>
#include <verilated.h>
#include <verilated_vcd_c.h>

#include "obj_dir/Vblizzard_4.h"
#include "obj_dir/Vblizzard_4__Dpi.h"

#define PRINT_EVERY_CYCLE false
#define TRACE_ENABLED false
#define TRACE_DEPTH 100

Vblizzard_4 *top;
VerilatedVcdC* trace;

int cycle;
int test_num;

void tick(void);
void print_buses(void);

extern "C" void init(void);
extern "C" void destroy(void);
extern "C" void step(int cycles);
extern "C" void set_control_status(bool state);

// automatically extern "C" (DPI functions from verilog bridge module)
// int get_read_bus(void);
// int get_data_bus(void);
// int get_write_bus(void);
// void set_read_bus(int);
// void set_data_bus(int);
// void set_write_bus(int);

void init(void) {
    top = new Vblizzard_4;

    // init trace dump
    #if (TRACE_ENABLED)
        Verilated::traceEverOn(true);
        trace = new VerilatedVcdC;

        top->trace(trace, TRACE_DEPTH);
        trace->open("out.vcd");
    #endif

    // setup DPI calls (set_x_bus/get_x_bus)
    svSetScope(svGetScopeFromName("TOP.blizzard_4.bridge"));

    // init top level inputs
    top->clk = 0;
    top->reset = 0;
    set_control_status(false);

    // async reset
    tick();
    top->reset = 1;
    tick();
    top->reset = 0;
    tick();

    // printf("init model: waves=%d\n", TRACE_ENABLED);
}

void destroy(void) {
    if (TRACE_ENABLED) {
        // catch last tick
        tick();
        trace->close();
    }
    // printf("destroy model: %d cycles run\n", test_num);
}

int main(int argc, char **argv) {
    Verilated::commandArgs(argc, argv);

    // create an instance of the computer
    init();

    set_control_status(true);
    // while (cycle < 1000000) {
    //     step(1);
    // }

    step(10000000);

    destroy();
    print_buses();
    exit(EXIT_SUCCESS);
}

void set_control_status(bool state) {
    top->ctrl_enable = state;
}

void step(int cycles) {
    while (cycles--) {
        for (int i = 0; i < 4; i++) {
            top->clk = !top->clk;
            tick();
        }

        if (PRINT_EVERY_CYCLE) {
            print_buses();
        }
        test_num++;
    }
}

void print_buses(void) {
    printf("r %04x ", get_read_bus());
    printf("d %04x ", get_data_bus());
    printf("w %04x ", get_write_bus());
    printf("\n");
}

void tick(void) {
    top->eval();
    if (TRACE_ENABLED) {
        trace->dump(cycle);
    }
    cycle++;
}
