/**
 * Module implementing an interactive bar chart.
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
 * @module barchart
 * @memberOf adt.widgets
 * @requires d3@v4
 * @requires adt.widgets.Widget
 */
(function (global, factory) {
    if (typeof exports === "object" && typeof module !== "undefined") {
        module.exports = factory(require('d3'), require('./widgets'));
    } else if (typeof define === 'function' && define.amd) {
        define(['d3', 'widgets', 'exports'], factory);
    } else {
        global.adt = global.adt || {};
        global.adt.widgets = global.adt.widgets || {};
        global.adt.widgets.BarChart = factory(global.d3, global.adt.widgets.Widget);
    }
} (this, function (d3, Widget) {
    "use strict";

    /**
     * The bar chart widget class.
     *
     * @class BarChart
     * @memberOf adt.widgets.barchart
     * @param {string} name Identifier of the widget.
     * @param {object=} parent Parent element to append widget to. If not specified, widget is appended to body.
     * @constructor
     */
    function BarChart(name, parent) {
        var _w = Widget.call(this, name, "bar-chart", "svg", parent);

        /**
         * Makes the bar chart vertical, effectively swapping the axes.
         * Default is false.
         *
         * @method vertical
         * @memberOf adt.widgets.barchart.BarChart
         * @param {boolean} vertical Whether to set bar chart to vertical.
         */
        _w.attr.add(this, "vertical", false);

        // Widget elements
        var _svg = {};
        var _data = [];

        /**
         * Binds data to the bar chart.
         *
         * @method data
         * @memberOf adt.widgets.barchart.BarChart
         * @param {Array} data Array of {x: (number|string), y: number} objects.
         * @returns {adt.widgets.barchart.BarChart} Reference to the current bar chart.
         */
        this.data = function(data) {
            _data = data;
            return this;
        };

        /**
         * Highlights the specified plot.
         *
         * @method highlight
         * @memberOf adt.widgets.barchart.BarChart
         * @param {string} key Key of the line to highlight.
         * @param {number} duration Duration of the highlight animation.
         * @returns {adt.widgets.barchart.BarChart} Reference to the current bar chart.
         */
        this.highlight = function(key, duration) {
            _w.utils.highlight(_svg, ".bar", key, duration);
            return this;
        };

        // Builder
        _w.render.build = function() {
            // Add chart itself
            _svg.g = _w.widget.append("g");

            // Axes
            _svg.axisFn = {
                x: d3.axisBottom()
                    .ticks(4),
                y: d3.axisLeft()
                    .ticks(4)
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
            // Calculate scale
            var scale;
            if (_w.attr.vertical) {
                scale = _w.utils.scale(_w.utils.boundary(_data, {y: [0, null]}),
                    _w.attr.height - _w.attr.margins.top - _w.attr.margins.bottom,
                    _w.attr.width - _w.attr.margins.left - _w.attr.margins.right,
                    {x: {type: "string"}, y: {reverse: true}});
            } else {
                scale = _w.utils.scale(_w.utils.boundary(_data, {y: [0, null]}),
                    _w.attr.width - _w.attr.margins.left - _w.attr.margins.right,
                    _w.attr.height - _w.attr.margins.top - _w.attr.margins.bottom,
                    {x: {type: "string"}});
            }

            // Axes
            _svg.axes.x
                .transition().duration(duration)
                .call(_svg.axisFn.x.scale(_w.attr.vertical ? scale.y : scale.x));
            _svg.axes.y
                .transition().duration(duration)
                .call(_svg.axisFn.y.scale(_w.attr.vertical ? scale.x : scale.y));

            // Plot
            if (_data.length > 0) {
                // Add bars if needed
                if (_svg.bars === undefined) {
                    _svg.bars = _svg.g.selectAll(".bar")
                        .data(data)
                        .enter().append("rect")
                        .attr("class", function(d) { return "bar " + _w.utils.encode("" + d.x); })
                        .style("pointer-events", "all")
                        .style("stroke", "none")
                        .style("shape-rendering", "geometricPrecision");
                    if (_w.attr.vertical) {
                        _svg.bars
                            .attr("x", 2)
                            .attr("width", 0);
                    } else {
                        _svg.bars
                            .attr("y", _w.attr.height-_w.attr.margins.top-_w.attr.margins.bottom-1)
                            .attr("height", 0);
                    }
                }

                // Update data
                _svg.bars.data(_data);
                if (_w.attr.vertical) {
                    _svg.bars
                        .attr("y", function(d) { return scale.x(d.x); })
                        .attr("height", scale.x.bandwidth())
                        .transition().duration(duration)
                        .attr("x", 2)
                        .attr("width", function(d) { return scale.y(d.y); });
                } else {
                    _svg.bars
                        .attr("x", function(d) { return scale.x(d.x); })
                        .attr("width", scale.x.bandwidth())
                        .transition().duration(duration)
                        .attr("y", function(d) { return scale.y(d.y); })
                        .attr("height", function(d) { return _w.attr.height-_w.attr.margins.top-_w.attr.margins.bottom - scale.y(d.y); });
                }
            }
        };

        // Style updater
        _w.render.style = function() {
            // Inner dimensions
            var innerWidth = _w.attr.width - _w.attr.margins.left - _w.attr.margins.right,
                innerHeight = _w.attr.height - _w.attr.margins.top - _w.attr.margins.bottom;

            // Chart
            _svg.g
                .style("width", innerWidth + "px")
                .style("height", innerHeight + "px")
                .attr("transform", "translate(" + _w.attr.margins.left + "," + _w.attr.margins.top + ")")
                .style("pointer-events", "all");

            // Axes
            if (_w.attr.vertical) {
                _svg.axisFn.x.tickFormat(_w.attr.yTickFormat);
            } else {
                _svg.axisFn.y.tickFormat(_w.attr.yTickFormat);
            }
            _svg.axes.x
                .attr("transform", "translate(0," + innerHeight + ")");
            _svg.axes.y
                .attr("transform", "translate(0," + 1 + ")");
            _svg.g.selectAll(".tick > text")
                .attr("cursor", "default")
                .style("pointer-events", "all");
            if (_w.attr.vertical) {
                _svg.g.selectAll(".y.axis .tick > line")
                    .style("display", "none");
            }
            if (typeof _w.attr.xTickAngle === "number") {
                _svg.g.selectAll(".x.axis .tick > text")
                    .attr("transform", "rotate(" + _w.attr.xTickAngle + ")")
                    .style("text-anchor", "start");
            }

            // Labels
            _svg.labels.x
                .attr("x", innerWidth + "px")
                .attr("y", (innerHeight + 2.6*_w.attr.fontSize) + "px")
                .style("font-size", _w.attr.fontSize + "px")
                .style("fill", _w.attr.fontColor)
                .text(_w.attr.vertical ? _w.attr.yLabel : _w.attr.xLabel);
            _svg.labels.y
                .attr("x", 5 + "px")
                .attr("y", (-5) + "px")
                .style("font-size", _w.attr.fontSize + "px")
                .style("fill", _w.attr.fontColor)
                .text(_w.attr.vertical ? _w.attr.xLabel : _w.attr.yLabel);

            // Plot
            if (_svg.bars !== undefined) {
                _svg.bars
                    .style("fill", function (d) {
                        return typeof _w.attr.colors === "string" ? _w.attr.colors : _w.attr.colors[d.x];
                    });

                // Interactions (for ticks as well)
                if (_w.attr.mouseover) {
                    _svg.bars
                        .on("mouseover", function (d, i) {
                            _w.attr.mouseover(d.x, i);
                        });
                    _svg.g.selectAll("." + (_w.attr.vertical ? "y" : "x") + ".axis .tick")
                        .on("mouseover", function (d, i) {
                            _w.attr.mouseover(_data[i].x, i);
                        });
                }
                if (_w.attr.mouseleave) {
                    _svg.bars
                        .on("mouseleave", function (d, i) {
                            _w.attr.mouseleave(d.x, i);
                        });
                    _svg.g.selectAll("." + (_w.attr.vertical ? "y" : "x") + ".axis .tick")
                        .on("mouseleave", function (d, i) {
                            _w.attr.mouseleave(_data[i].x, i);
                        });
                }
                if (_w.attr.click) {
                    _svg.bars
                        .on("click", function (d, i) {
                            _w.attr.click(d.x, i);
                        });
                    _svg.g.selectAll("." + (_w.attr.vertical ? "y" : "x") + ".axis .tick")
                        .on("click", function (d, i) {
                            _w.attr.click(_data[i].x, i);
                        });
                }
            }
        };
    }

    // Export
    BarChart.prototype = Object.create(Widget.prototype);
    return BarChart;
}));
