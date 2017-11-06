#!/bin/bash

SRC_DIR="src"
DST_DIR="build"
AVAILABLE_MODULES=(
    "data"
    "rest"
    "signals"
    "system.log"
    "system.version"
    "user"
    "widgets"
    "widgets.areachart"
    "widgets.barchart"
    "widgets.chordchart"
    "widgets.grid"
    "widgets.hint"
    "widgets.image"
    "widgets.info"
    "widgets.label"
    "widgets.legend"
    "widgets.linechart"
    "widgets.map"
    "widgets.piechart"
    "widgets.slider"
    "widgets.status"
)

echo ""
echo "Building ADT"
echo "-----------------------"

# Build docs
echo "  building documentation"
python python/parser.py

# Build modules
echo "  compiling modules:"
for module in "${AVAILABLE_MODULES[@]}"; do
    echo "    $module"
    uglifyjs \
        ${SRC_DIR}/${module}.js \
        --mangle \
        --output ${DST_DIR}/${module}.min.js
done
