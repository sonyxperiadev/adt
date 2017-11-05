/**
 * Module implementing a line chart.
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
 * @module widgets.linechart
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
        throw new Error("adt.widgets.linechart Error: widgets module is not exported");
    }

    /**
     * The line chart widget class.
     *
     * @class LineChart
     * @memberOf adt.widgets.linechart
     * @param {string} name Identifier of the widget.
     * @param {object=} parent Parent element to append widget to. If not specified, widget is appended to body.
     * @constructor
     */
    function LineChart(name, parent) {
        var _w = widgets.Widget.call(this, name, "lineChart", "svg", parent);

        /**
         * Sets the X label.
         *
         * @method xLabel
         * @memberOf adt.widgets.linechart.LineChart
         * @param {string} label Text to set label to.
         */
        _w.attr.add(this, "xLabel", "");

        /**
         * Sets the Y label.
         *
         * @method yLabel
         * @memberOf adt.widgets.linechart.LineChart
         * @param {string} label Text to set label to.
         */
        _w.attr.add(this, "yLabel", "");

        /**
         * Sets the type of the X axis.
         * Supported values are: number, time, string.
         * Default is number.
         *
         * @method xType
         * @memberOf adt.widgets.linechart.LineChart
         * @param {string} type Type of the X axis.
         */
        _w.attr.add(this, "xType", "number");

        /**
         * Sets the formatting function of the y ticks.
         * Default is a float with two decimals.
         *
         * @method yTIckFormat
         * @memberOf adt.widgets.linechart.LineChart
         * @param {function} format Formatting function.
         */
        _w.attr.add(this, "yTickFormat", d3.format(".2s"));

        /**
         * Sets the color of the lines.
         * Default is grey.
         *
         * @method colors
         * @memberOf adt.widgets.linechart.LineChart
         * @param {(string|object)} color Single color string or an object containing colors for each plot.
         */
        _w.attr.add(this, "colors", "grey");

        /**
         * Sets lowe boundary of the Y axis.
         * Default is 0.
         *
         * @method yMin
         * @memberOf adt.widgets.linechart.LineChart
         * @param {number} value Value to set lower boundary to.
         */
        _w.attr.add(this, "yMin", 0);

        // Widget elements.
        var _svg = null;
        var _data = [];
        var _scaleFactor = 1.0;

        /**
         * Binds data to the line plot.
         * Data must be an array of {x: number, y: object} where y is an object containing the Y values for each line
         * to plot. The data can optionally contain a {dy} property that corresponds to the error drawn around the line.
         * Error is only drawn for lines that are defined as property in {dy}.
         *
         * @method data
         * @memberOf adt.widgets.linechart.LineChart
         * @param {Array} data Array of data points.
         * @param {number} scale Optional scaling parameter. Each data point is divided by this value.
         */
        this.data = function(data, scale) {
            _data = _.cloneDeep(data);

            // Sort if number / date
            if (_w.attr.xType === "number" || _w.attr.xType === "time") {
                _data.sort(function(a, b) {
                    return a.x - b.x;
                });
            }

            // Scale data
            if (typeof scale === "number" && scale > 0)
                _scaleFactor = scale;
            return this;
        };

        /**
         * Highlights the specified plot.
         *
         * @method highlight
         * @memberOf adt.widgets.linechart.LineChart
         * @param {string} key Key of the line to highlight.
         */
        this.highlight = function(key) {
            _w.utils.highlight(_svg, ".line", key);
        };

        // Rendering methods.
        _w.render.build = function() {
            if (_svg !== null)
                return;
            _svg = {};

            // Add chart itself
            _svg.g = _w.widget.append("g");

            // Add axes
            _svg.axisFn = {
                x: d3.axisBottom()
                    .ticks(7),
                y: d3.axisLeft()
                    .ticks(5)
                    .tickFormat(_w.attr.yTickFormat)
            };
            _svg.axes = {
                x: _svg.g.append("g")
                    .attr("class", "x axis"),
                y: _svg.g.append("g")
                    .attr("class", "y axis")
            };

            // Add labels
            _svg.labels = {
                x: _svg.g.append("text")
                    .attr("class", "x axis-label")
                    .attr("text-anchor", "end")
                    .attr("stroke-width", 0),
                y: _svg.g.append("text")
                    .attr("class", "y axis-label")
                    .attr("text-anchor", "begin")
                    .attr("stroke-width", 0)
            };

            // Add error bands
            _svg.errors = {};
            _.forOwn(_data[0].y, function(yk, k) {
                _svg.errors[k] = _svg.g.append("path")
                    .attr("class", "error " + _w.utils.encode(k))
                    .style("fill-opacity", 0.2)
                    .style("stroke-width", "0px")
                    .style("shape-rendering", "geometricPrecision");
            });

            // Add lines
            _svg.lines = {};
            _.forOwn(_data[0].y, function(yk, k) {
                _svg.lines[k] = _svg.g.append("path")
                    .attr("class", "line " + _w.utils.encode(k))
                    .style("fill", "none")
                    .style("stroke-width", "2px")
                    .style("shape-rendering", "geometricPrecision");
            });
        };

        _w.render.update = function(duration) {
            // Make scaled copy of data
            var data = _.cloneDeep(_data);
            for (var i = 0; i < data.length; i++) {
                for (var y in data[i].y) {
                    if (data[i].y.hasOwnProperty(y))
                        data[i].y[y] /= _scaleFactor;

                    // Check if we have error
                    if (data[i].hasOwnProperty('dy')) {
                        if (data[i].dy.hasOwnProperty(y))
                            data[i].dy[y] /= _scaleFactor;
                    }
                }
            }

            // Scale and axes
            var scale = _w.utils.scale(_w.utils.boundary(data),
                _w.attr.width - _w.attr.margins.left - _w.attr.margins.right,
                _w.attr.height - _w.attr.margins.top - _w.attr.margins.bottom,
                {x: {type: _w.attr.xType}});
            _svg.axes.x
                .transition().duration(duration)
                .call(_svg.axisFn.x.scale(scale.x));
            _svg.axes.y
                .transition().duration(duration)
                .call(_svg.axisFn.y.scale(scale.y));

            // Lines and error bands
            _.forOwn(data[0].y, function(yk, k) {
                if (data[0].hasOwnProperty('dy') && data[0].dy.hasOwnProperty(k)) {
                    var error = d3.area()
                        .x(function (d) {
                            return scale.x(d.x) + 2;
                        }).y0(function (d) {
                            return scale.y(d.y[k]-d.dy[k]);
                        }).y1(function (d) {
                            return scale.y(d.y[k]+d.dy[k]);
                        });
                    _svg.errors[k]
                        .transition().duration(duration)
                        .attr("d", error(data));
                }
                var line = d3.line()
                    .x(function (d) {
                        return scale.x(d.x) + 2;
                    }).y(function (d) {
                        return scale.y(d.y[k]);
                    });
                _svg.lines[k]
                    .transition().duration(duration)
                    .attr("d", line(data));
            });
        };

        _w.render.style = function() {
            // Inner dimensions
            var innerWidth = _w.attr.width - _w.attr.margins.left - _w.attr.margins.right,
                innerHeight = _w.attr.height - _w.attr.margins.top - _w.attr.margins.bottom;

            // Chart (using conventional margins)
            _svg.g
                .attr("width", innerWidth + "px")
                .attr("height", innerHeight + "px")
                .attr("transform", "translate(" + _w.attr.margins.left + "," + _w.attr.margins.top + ")")
                .style("pointer-events", "all");

            // Axes
            _svg.axes.x
                .attr("transform", "translate(0," + innerHeight + ")");
            _svg.axisFn.y.tickFormat(_w.attr.yTickFormat);
            _svg.axes.y
                .attr("transform", "translate(0," + 1 + ")");
            _svg.g.selectAll(".axis path")
                .style("fill", "none")
                .style("stroke", _w.attr.fontColor)
                .style("stroke-width", "2px")
                .style("shape-rendering", "crispEdges");
            _svg.g.selectAll(".tick > line")
                .style("stroke", _w.attr.fontColor)
                .style("stroke-width", "2px");
            _svg.g.selectAll(".tick > text")
                .attr("stroke-width", 0)
                .style("font-size", _w.attr.fontSize + "px")
                .style("fill", _w.attr.fontColor);

            // Labels
            _svg.labels.x
                .attr("x", innerWidth + "px")
                .attr("y", (innerHeight + 35) + "px")
                .style("font-size", _w.attr.fontSize + "px")
                .style("fill", _w.attr.fontColor)
                .text(_w.attr.xLabel);
            _svg.labels.y
                .attr("x", 5 + "px")
                .attr("y", (-5) + "px")
                .style("font-size", _w.attr.fontSize + "px")
                .style("fill", _w.attr.fontColor)
                .text(_w.attr.yLabel);

            // Plot
            _.forOwn(_svg.errors, function(lk, k) {
                _svg.errors[k].style("fill", typeof _w.attr.colors === "string" ? _w.attr.colors : _w.attr.colors[k]);
            });
            _.forOwn(_svg.lines, function(lk, k) {
                _svg.lines[k].style("stroke", typeof _w.attr.colors === "string" ? _w.attr.colors : _w.attr.colors[k]);
            });

            _w.widget.style("display", "block");
        };
    }

    LineChart.prototype = Object.create(widgets.Widget.prototype);
    exports.widgets.LineChart = LineChart;
})));