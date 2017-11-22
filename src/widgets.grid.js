/**
 * Module implementing a smart grid to store widgets.
 * Part of the Analytics Dashboard Tools.
 *
 * @copyright Copyright (C) 2017 Sony Mobile Communications Inc.
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * @author Enys Mones (enys.mones@sony.com)
 * @module widgets.grid
 * @memberOf adt
 * @requires d3@v4
 * @requires adt.widgets
 */
(function (global, factory) {
    if (typeof exports === "object" && typeof module !== "undefined") {
        factory(exports);
    } else if (typeof define === 'function' && define.amd) {
        define(['exports'], factory);
    } else {
        factory((global.adt = global.adt || {}));
    }
} (this, (function (exports) {
    "use strict";

    // Load widgets
    if (exports.widgets) {
        var widgets = exports.widgets;
    } else {
        throw new Error("adt.widgets.grid Error: widgets module is not exported");
    }

    /**
     * The grid class.
     *
     * @class Grid
     * @memberOf adt.widgets.grid
     * @param {string} name Identifier of the widget.
     * @param {object=} parent Parent element to append widget to. If not specified, widget is appended to body.
     * @constructor
     */
    function Grid(name, parent) {
        var _w = widgets.Widget.call(this, name, "grid", "div", parent);

        // Widget elements
        var _x = _w.attr.x;
        var _y = _w.attr.y;
        var _rows = 1;
        var _columns = 1;
        var _cells = [];
        var _widgets = [];
        var _show = false;
        var _resizeFinished = null;

        /**
         * Resize grid. Note that it also removes all widgets already in the grid.
         *
         * @method _resize
         * @memberOf adt.widgets.grid.Grid
         * @private
         */
        function _resize() {
            // Remove widgets
            _cells.forEach(function (row) {
                row.forEach(function (cell) {
                    if (cell) {
                        cell.remove();
                    }
                });
            });

            // Resize grid
            _cells = [];
            for (var x = 0; x < _columns; x++) {
                _cells.push([]);
                for (var y = 0; y < _rows; y++) {
                    _cells[x].push(null);
                }
            }
        }

        /**
         * Sets the X position of the widget.
         *
         * @method x
         * @memberOf adt.widgets.grid.Grid
         * @param {number} x Distance from the window side. If positive, position is measured from the left,
         * otherwise it is measured from the right.
         * @param {string=} dim Distance dimension. If not specified, pixels are used.
         * @returns {adt.widgets.Grid} Reference to the current widget.
         * @override {adt.widgets.Widget.x}
         */
        this.x = function (x, dim) {
            // Convert percentage to pixel
            _w.attr.x = dim !== "%" ? x : window.innerWidth * x / 100;
            _x = _w.attr.x;
            return this;
        };

        /**
         * Sets the Y position of the widget.
         *
         * @method y
         * @memberOf adt.widgets.grid.Grid
         * @param {number} y Distance from the window side. If positive, position is measured from the top,
         * otherwise it is measured from the bottom.
         * @param {string=} dim Distance dimension. If not specified, pixels are used.
         * @returns {adt.widgets.Grid} Reference to the current widget.
         * @override {adt.widgets.Widget.y}
         */
        this.y = function (y, dim) {
            // Convert percentage to pixel
            _w.attr.y = dim !== "%" ? y : window.innerHeight * y / 100;
            _y = _w.attr.y;
            return this;
        };

        /**
         * Sets the number of vertical size.
         * Default is 1.
         *
         * @method rows
         * @memberOf adt.widgets.grid.Grid
         * @param {number} size Number of rows.
         * @returns {adt.widgets.grid.Grid} Reference to the current grid.
         */
        this.rows = function (size) {
            _rows = size;
            _resize();
            return this;
        };

        /**
         * Sets the number of horizontal size.
         * Default is 1.
         *
         * @method cols
         * @memberOf adt.widgets.grid.Grid
         * @param {number} size Number of cols.
         * @returns {adt.widgets.grid.Grid} Reference to the current grid.
         */
        this.cols = function (size) {
            _columns = size;
            _resize();
            return this;
        };

        /**
         * Makes the grid flexible, that is, it rescales all contained widgets when
         * the window size is changed.
         * Note that this method overwrites {windows.onresize}.
         *
         * @method flexible
         * @memberOf adt.widgets.grid.Grid
         * @param {boolean} on Whether the grid should be flexible.
         * @returns {adt.widgets.grid.Grid} Reference to the current grid.
         */
        this.flexible = function (on) {
            function onresize() {
                // Only resize when resize operation has finished
                clearTimeout(_resizeFinished);
                _resizeFinished = setTimeout(function () {
                    // Get scale
                    var scaleX = _w.attr.width / window.innerWidth;
                    var scaleY = _w.attr.height / window.innerHeight;

                    // Resize grid
                    _w.attr.x = _x /= scaleX;
                    _w.attr.y = _y /= scaleY;
                    _w.attr.width /= scaleX;
                    _w.attr.height /= scaleY;
                    _w.widget
                        .style("position", "absolute")
                        .style(_w.attr.x > 0 ? "left" : "right", Math.abs(_w.attr.x) + _w.attr.xDim)
                        .style(_w.attr.y > 0 ? "top" : "bottom", Math.abs(_w.attr.y) + _w.attr.yDim)
                        .style("width", _w.attr.width + "px")
                        .style("height", _w.attr.height + "px");

                    // Adjust borders
                    _w.widget.selectAll(".grid-border-h")
                        .style("top", function () {
                            return (d3.select(this).attr("data-y") * _w.attr.height / _rows - 1) + "px";
                        })
                        .style("width", _w.attr.width + "px");
                    _w.widget.selectAll(".grid-border-v")
                        .style("left", function () {
                            return (d3.select(this).attr("data-x") * _w.attr.width / _columns - 1) + "px";
                        })
                        .style("height", _w.attr.height + "px");

                    // Rescale widgets
                    _widgets.forEach(function (widget) {
                        widget.widget
                            .x(widget.x * _w.attr.width / _columns + _w.attr.x)
                            .y(widget.y * _w.attr.height / _rows + _w.attr.y)
                            .width(widget.width * _w.attr.width / _columns)
                            .height(widget.height * _w.attr.height / _rows)
                            .render(0);
                    });
                }, 100);
            }

            if (on)
                window.addEventListener("resize", onresize);
            else
                window.removeEventListener("resize", onresize);

            return this;
        };

        /**
         * Shows/hides grid borders.
         *
         * @method show
         * @memberOf adt.widgets.grid.Grid
         * @param {boolean=} on True if grid should be shown, false otherwise.
         */
        function show(on) {
            if (on) {
                _show = true;

                // Border
                _w.widget.style("box-shadow", "0 0 1px black inset");

                // White stripes
                for (var y = 1; y < _rows; y++) {
                    _w.widget.append("div")
                        .attr("class", "grid-border-h")
                        .attr("data-y", y)
                        .style("position", "absolute")
                        .style("left", "0")
                        .style("top", (y * _w.attr.height / _rows - 1.5) + "px")
                        .style("width", _w.attr.width + "px")
                        .style("height", "3px")
                        .style("background-color", "white")
                }
                for (var x = 1; x < _columns; x++) {
                    _w.widget.append("div")
                        .attr("class", "grid-border-v")
                        .attr("data-x", x)
                        .style("position", "absolute")
                        .style("left", (x * _w.attr.width / _columns - 1.5) + "px")
                        .style("top", "0")
                        .style("width", "3px")
                        .style("height", _w.attr.height + "px")
                        .style("background-color", "white")
                }

                // Black lines
                for (y = 1; y < _rows; y++) {
                    _w.widget.append("div")
                        .attr("class", "grid-border-h")
                        .attr("data-y", y)
                        .style("position", "absolute")
                        .style("left", "0")
                        .style("top", (y * _w.attr.height / _rows - 0.5) + "px")
                        .style("width", _w.attr.width + "px")
                        .style("height", "1px")
                        .style("background-color", "black")
                }
                for (x = 1; x < _columns; x++) {
                    _w.widget.append("div")
                        .attr("class", "grid-border-v")
                        .attr("data-x", x)
                        .style("position", "absolute")
                        .style("left", (x * _w.attr.width / _columns - 0.5) + "px")
                        .style("top", "0")
                        .style("width", "1px")
                        .style("height", _w.attr.height + "px")
                        .style("background-color", "black")
                }
            } else {
                _show = false;
                _w.widget.style("border", null);
                _w.widget.selectAll(".grid-border-h")
                    .remove();
                _w.widget.selectAll(".grid-border-v")
                    .remove();
            }
        }
        this.show = show;

        /**
         * Adds a widget to the specified row and column.
         * If the specified cells are outside the grid or the cell is already occupied, it does not add the widget and
         * returns null. The widget does not need to be rendered while adding, and the grid also sets positioning and
         * size automatically.
         * Note that the rows are measured from the top.
         *
         * @method add
         * @memberOf adt.widgets.grid.Grid
         * @param {adt.widgets.Widget} widget Widget to add.
         * @param {number} column Column index of the cell to add widget to.
         * @param {number} row Row index of the cell to add widget to.
         * @param {number} width Number of columns to occupy.
         * @param {number} height Number of rows to occupy.
         * @returns {?adt.widgets.Widget} The added widget if cells are available and free, null pointer othetwise.
         */
        this.add = function (widget, column, row, width, height) {
            // Check if widget is inside grid
            if (column < 0 || width < 1 || column+width > _columns ||
                row < 0 || height < 1 || row+height > _rows) {
                widget.remove();
                return null;
            }

            // Check if cells are available
            for (var x = column; x < column + width; x++) {
                if (_cells[x]) {
                    for (var y = row; y < row + height; y++) {
                        if (_cells[x][y]) {
                            widget.remove();
                            return null;
                        }
                    }
                }
            }

            // Add widget and set cells refer to the added widget
            _widgets.push({
                x: column,
                y: row,
                width: width,
                height: height,
                widget: widget
            });
            for (x = column; x < column + width; x++) {
                for (y = row; y < row + height; y++) {
                    _cells[x][y] = widget;
                }
            }

            // Set up widget
            widget
                .x(column * _w.attr.width / _columns + _w.attr.x)
                .y(row * _w.attr.height / _rows + _w.attr.y)
                .width(width * _w.attr.width / _columns)
                .height(height * _w.attr.height / _rows)
                .render();
            return widget;
        };

        /**
         * Returns the widget occupying the cell at the specified row and column.
         *
         * @method get
         * @memberOf adt.widgets.grid.Grid
         * @param {number} row Row of the cell to get widget for.
         * @param {number} column Column of the cell to get widget for.
         * @returns {?adt.widgets.Widget} The widget in the specified cell if cell is in grid and it is not empty,
         * null pointer otherwise.
         */
        this.get = function(row, column) {
            if (_cells[column] && _cells[column][row]) {
                return _cells[column][row].widget;
            } else {
                return null;
            }
        };

        // Rendering methods.
        _w.render.build = function () {

        };

        _w.render.update = function (duration) {

        };

        _w.render.style = function () {
            _w.widget
                .style("width", _w.attr.width + "px")
                .style("height", _w.attr.height + "px");

            _w.widget.style("display", "block");
        };
    }

    Grid.prototype = Object.create(widgets.Widget.prototype);
    exports.widgets.Grid = Grid;
})));