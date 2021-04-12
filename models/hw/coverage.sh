#!/bin/bash
shopt -s nullglob

OPTIONS=-Q

set -ex

for file in traces/*.vcd
do
    covered $OPTIONS score \
        -i TOP -t blizzard_4 -v blizzard_4.v \
        -I . \
        -e bridge -e ps2_interface -e async_fifo \
        -vcd $file \
        -o $file.cdd
done

cd traces

covered $OPTIONS merge \
    *.vcd.cdd \
    -o merged.cdd

rm *.vcd.cdd
