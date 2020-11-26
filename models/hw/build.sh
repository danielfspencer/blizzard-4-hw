#!/bin/bash
set -e
clear
#rm -rf obj_dir
verilator blizzard_4.v -Imodules -Igeneric --trace --cc -Wno-fatal --exe main.cpp -CFLAGS "-fpic" -O3 --x-initial unique
make -j OPT_FAST="-O3" -C obj_dir -f Vblizzard_4.mk
cd obj_dir
gcc -shared *.o -o blizzard_4.so
