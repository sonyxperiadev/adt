#!/bin/bash

SRC_DIR="src"
DST_DIR="build"
DL_DIR="docs/dl"
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
python docs/python/parser.py

# Build modules
echo "  compiling modules:"
module_list=""
for module in "${AVAILABLE_MODULES[@]}"; do
    echo "    $module"
    module_list=${module_list}" "${SRC_DIR}/${module}.js
    uglifyjs \
        ${SRC_DIR}/${module}.js \
        --mangle \
        --output ${DST_DIR}/${module}.min.js
    cp ${DST_DIR}/${module}.min.js ${DL_DIR}/
done

# Build full library
uglifyjs ${module_list} --mangle --output somc-adt.min.js
