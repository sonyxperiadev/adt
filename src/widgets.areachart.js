/**
 * Module implementing an area chart.
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
 * @module widgets.areachart
 * @memberOf adt
 * @requires d3@v4
 * @requires adt.widgets
 */
(function (global, factory) {
    if (typeof exports === "object" && typeof module !== "undefined") {
        module.exports = factory(require('d3'), require('./widgets'));
    } else if (typeof define === 'function' && define.amd) {
        define(['d3', 'widgets', 'exports'], factory);
    } else {
        global.adt = global.adt || {};
        global.adt.widgets = global.adt.widgets || {};
        global.adt.widgets.AreaChart = factory(global.d3, global.adt.widgets.Widget);
    }
} (this, function (d3, Widget) {
    "use strict";

    /**
     * The area chart widget class.
     *
     * @class AreaChart
     * @memberOf adt.widgets.areachart
     * @param {string} name Identifier of the widget.
     * @param {object=} parent Parent element to append widget to. If not specified, widget is appended to body.
     * @constructor
     */
    function AreaChart(name, parent) {
        var _w = Widget.call(this, name, "areaChart", "svg", parent);

        /**
         * Sets the X label.
         *
         * @method xLabel
         * @memberOf adt.widgets.areachart.AreaChart
         * @param {string} label Text to set label to.
         */
        _w.attr.add(this, "xLabel", "");

        /**
         * Sets the Y label.
         *
         * @method yLabel
         * @memberOf adt.widgets.areachart.AreaChart
         * @param {string} label Text to set label to.
         */
        _w.attr.add(this, "yLabel", "");

        /**
         * Sets the type of the X axis.
         * Supported values are: number, time, string.
         * Default is number.
         *
         * @method xType
         * @memberOf adt.widgets.areachart.AreaChart
         * @param {string} type Type of the X axis.
         */
        _w.attr.add(this, "xType", "number");

        /**
         * Sets the formatting function of the y ticks.
         * Default is a float with two decimals.
         *
         * @method yTIckFormat
         * @memberOf adt.widgets.areachart.AreaChart
         * @param {function} format Formatting function.
         */
        _w.attr.add(this, "yTickFormat", d3.format(".2s"));

        /**
         * Sets the color of the area plots.
         * Default is grey.
         *
         * @method colors
         * @memberOf adt.widgets.areachart.AreaChart
         * @param {(string|object)} color Single color string or an object containing colors for each plot.
         */
        _w.attr.add(this, "colors", "grey");

        /**
         * Sets the opacity of the area plots.
         * Default is 0.3.
         *
         * @method opacity
         * @memberOf adt.widgets.areachart.AreaChart
         * @param {number} value The opacity value to set.
         */
        _w.attr.add(this, "opacity", 0.3);

        /**
         * Sets lowe boundary of the Y axis.
         * Default is 0.
         *
         * @method yMin
         * @memberOf adt.widgets.areachart.AreaChart
         * @param {number} value Value to set lower boundary to.
         */
        _w.attr.add(this, "yMin", 0);

        // Widget elements.
        var _svg = null;
        var _data = [];
        var _scaleFactor = 1.0;

        /**
         * Binds data to the area plot.
         *
         * @method data
         * @memberOf adt.widgets.areachart.AreaChart
         * @param {Array} data Array of {x, y} objects where X is a number or Date, Y is an object containing the y
         * values for each area to plot.
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
         * @memberOf adt.widgets.areachart.AreaChart
         * @param {string} key Key of the area to highlight.
         */
        this.highlight = function(key) {
            _w.utils.highlight(_svg, ".area", key);
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

            // Add areas
            _svg.areas = {};
            _.forOwn(_data[0].y, function(yk, k) {
                _svg.areas[k] = _svg.g.append("path")
                    .attr("class", "area " + _w.utils.encode(k))
                    .style("fill-opacity", _w.attr.opacity)
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
                }
            }

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
            _.forOwn(data[0].y, function(yk, k) {
                var area = d3.area()
                    .x(function (d) {
                        return scale.x(d.x) + 1;
                    })
                    .y0(_w.attr.height-_w.attr.margins.top-_w.attr.margins.bottom-1)
                    .y1(function (d) {
                        return scale.y(d.y[k]);
                    });
                _svg.g.select("." + _w.utils.encode(k))
                    .transition().duration(duration)
                    .attr("d", area(data));
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
            _.forOwn(_svg.areas, function(lk, k) {
                _svg.areas[k].style("fill", typeof _w.attr.colors === "string" ? _w.attr.colors : _w.attr.colors[k]);
            });

            _w.widget.style("display", "block");
        };
    }

    // Export
    AreaChart.prototype = Object.create(Widget.prototype);
    return AreaChart;
}));