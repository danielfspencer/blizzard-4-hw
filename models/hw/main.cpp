#include <stdlib.h>
#include <verilated.h>
#include <verilated_vcd_c.h>

#include "obj_dir/Vblizzard_4.h"
#include "obj_dir/Vblizzard_4__Dpi.h"

#define PRINT_EVERY_CYCLE false
#define TRACE_ENABLED true
#define TRACE_DEPTH 100

Vblizzard_4 *top;
VerilatedVcdC* trace;

int cycle;
int test_num;

void tick(void);
void print_buses(void);
void step(int cycles);
void send_ps2_bit(int bit);

extern "C" void init(void);
extern "C" void destroy(void);
extern "C" void reset(void);

extern "C" void _step(int cycles);
extern "C" void _send_ps2_byte(int byte);
extern "C" int _read(int addr);
extern "C" void _write(int value, int addr);
extern "C" void _copy(int source, int dest);

// automatically extern "C" (DPI functions from verilog bridge module)
// int get_read_bus(void);
// int get_data_bus(void);
// int get_write_bus(void);
// void set_read_bus(int);
// void set_data_bus(int);
// void set_write_bus(int);

// external functions

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
    top->ctrl_enable = 1;
    top->ps2_clock = 1;
    top->ps2_data = 0;

    // async reset
    reset();

    // printf("init model: waves=%d\n", TRACE_ENABLED);
}

void reset(void) {
    tick();
    top->reset = 1;
    tick();
    top->reset = 0;
    tick();
}

void destroy(void) {
    if (TRACE_ENABLED) {
        // catch last tick
        tick();
        trace->close();
    }
    // printf("destroy model: %d cycles run\n", test_num);
}

void _step(int cycles) {
    step(cycles);
}

int _read(int addr) {
    top->ctrl_enable = false;
    set_read_bus(addr);
    step(1);
    top->ctrl_enable = true;
    return get_data_bus();
}


void _write(int value, int addr) {
    top->ctrl_enable = false;
    set_data_bus(value);
    set_write_bus(addr);
    step(1);
    top->ctrl_enable = true;
}

void _copy(int source, int dest) {
    top->ctrl_enable = false;
    set_read_bus(source);
    set_write_bus(dest);
    step(1);
    top->ctrl_enable = true;
}

void _send_ps2_byte(int byte) {
    // start bit
    send_ps2_bit(0);

    for (int i = 0; i < 8; i++) {
        send_ps2_bit(byte & 1);
        byte >>= 1;
    }

    // parity bit, nothing actually uses this so make it 0
    send_ps2_bit(0);
    // stop bit
    send_ps2_bit(1);
}

// internal functions

int main(int argc, char **argv) {
    Verilated::commandArgs(argc, argv);

    init();

    step(200);

    destroy();
    print_buses();
    exit(EXIT_SUCCESS);
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

void send_ps2_bit(int bit) {
    top->ps2_clock = 0;
    top->ps2_data = bit;
    tick();
    top->ps2_clock = 1;
    top->ps2_data = 0;
    tick();
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
