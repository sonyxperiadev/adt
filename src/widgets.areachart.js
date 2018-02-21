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
 * @module areachart
 * @memberOf adt.widgets
 * @requires d3@v4
 * @requires adt.widgets.Widget
 */
// TODO add transition to render methods
// TODO add mouse events
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
        var _w = Widget.call(this, name, "areachart", "svg", parent);

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
         * Sets the opacity of the area plots.
         * Default is 0.3.
         *
         * @method opacity
         * @memberOf adt.widgets.areachart.AreaChart
         * @param {number} value The opacity value to set.
         */
        _w.attr.add(this, "opacity", 0.3);

        // Widget elements.
        var _svg = {};
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
            _data = data;

            // Set scale
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
         * @param {number} duration Duration of the highlight animation.
         */
        this.highlight = function(key, duration) {
            _w.utils.highlight(_svg, ".area", key, duration);
        };

        // Builder
        _w.render.build = function() {
            // Add widget
            _svg.g = _w.widget.append("g");

            // Axes
            _svg.axisFn = {
                x: d3.axisBottom()
                    .ticks(7),
                y: d3.axisLeft()
                    .ticks(5)
            };
            _svg.axes = {
                x: _svg.g.append("g")
                    .attr("class", "x axis"),
                y: _svg.g.append("g")
                    .attr("class", "y axis")
            };

            // Labels
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
        };

        // Data updater
        _w.render.update = function(duration) {
            // Prepare data
            var data = _.cloneDeep(_data);
            data.sort(function (a, b) {
                return a.x - b.x;
            });
            for (var i = 0; i < data.length; i++) {
                for (var y in data[i].y) {
                    if (data[i].y.hasOwnProperty(y))
                        data[i].y[y] /= _scaleFactor;
                }
            }

            // Calculate scale
            var scale = _w.utils.scale(_w.utils.boundary(data),
                _w.attr.width - _w.attr.margins.left - _w.attr.margins.right,
                _w.attr.height - _w.attr.margins.top - _w.attr.margins.bottom,
                {x: {type: _w.attr.xType}});

            // Update axes
            _svg.axes.x
                .transition().duration(duration)
                .call(_svg.axisFn.x.scale(scale.x));
            _svg.axes.y
                .transition().duration(duration)
                .call(_svg.axisFn.y.scale(scale.y));

            // Update plots
            if (data.length > 0) {
                // Add areas if needed
                if (_svg.areas === undefined) {
                    _svg.areas = {};
                    _svg.lines = {}
                    _.forOwn(data[0].y, function (yk, k) {
                        _svg.areas[k] = _svg.g.append("path")
                            .attr("class", "area " + _w.utils.encode(k))
                            .style("shape-rendering", "geometricPrecision");
                    });
                }

                // Update data
                _.forOwn(data[0].y, function (yk, k) {
                    var area = d3.area()
                        .x(function (d) {
                            return scale.x(d.x) + 1;
                        })
                        .y0(_w.attr.height - _w.attr.margins.top - _w.attr.margins.bottom)
                        .y1(function (d) {
                            return scale.y(d.y[k]);
                        });
                    _svg.g.select(".area." + _w.utils.encode(k))
                        .transition().duration(duration)
                        .attr("d", area(data));
                });
            }
        };

        // Style updater
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

            // Labels
            _svg.labels.x
                .attr("x", innerWidth + "px")
                .attr("y", (innerHeight + 35) + "px")
                .attr("fill", _w.attr.fontColor)
                .style("font-size", _w.attr.fontSize + "px")
                .text(_w.attr.xLabel);
            _svg.labels.y
                .attr("x", 5 + "px")
                .attr("y", (-5) + "px")
                .attr("fill", _w.attr.fontColor)
                .style("font-size", _w.attr.fontSize + "px")
                .text(_w.attr.yLabel);

            // Plot
            _.forOwn(_svg.areas, function(ak, k) {
                _svg.areas[k]
                    .style("fill-opacity", _w.attr.opacity)
                    .style("fill", typeof _w.attr.colors === "string" ? _w.attr.colors : _w.attr.colors[k])
                    .on("mouseover", function() {
                        _w.attr.mouseover && _w.attr.mouseover(k);
                    })
                    .on("mouseleave", function() {
                        _w.attr.mouseleave && _w.attr.mouseleave(k);
                    })
                    .on("click", function() {
                        _w.attr.click && _w.attr.click(k);
                    });
            });
        };
    }

    // Export
    AreaChart.prototype = Object.create(Widget.prototype);
    return AreaChart;
}));