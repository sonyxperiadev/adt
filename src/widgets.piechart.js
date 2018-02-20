/**
 * Module implementing an interactive pie chart.
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
 * @module piechart
 * @memberOf adt.widgets
 * @requires d3@v4
 * @requires adt.widgets.Widget
 */
// TODO simplify class
(function (global, factory) {
    if (typeof exports === "object" && typeof module !== "undefined") {
        module.exports = factory(require('d3'), require('./widgets'), exports);
    } else if (typeof define === 'function' && define.amd) {
        define(['d3', 'widgets', 'exports'], factory);
    } else {
        global.adt = global.adt || {};
        global.adt.widgets = global.adt.widgets || {};
        global.adt.widgets.PieChart = factory(global.d3, global.adt.widgets.Widget, global);
    }
} (this, function (d3, Widget) {
    "use strict";

    /**
     * The pie chart widget class.
     *
     * @class PieChart
     * @memberOf adt.widgets.piechart
     * @param {string} name Identifier of the pie chart.
     * @param {object=} parent Parent element to append widget to. If not specified, widget is appended to body.
     * @constructor
     */
    function PieChart(name, parent) {
        var _w = Widget.call(this, name, "pieChart", "svg", parent);

        /**
         * Sets the inner radius in pixels.
         * Default is 0.
         *
         * @method innerRadius
         * @memberOf adt.widgets.piechart.PieChart
         * @param {number} size Size of the inner radius in pixels.
         */
        _w.attr.add(this, "innerRadius", 0, "dim");

        /**
         * Sets the outer radius in pixels.
         * Default is 50.
         *
         * @method outerRadius
         * @memberOf adt.widgets.piechart.PieChart
         * @param {number} size Size of the outer radius in pixels.
         */
        _w.attr.add(this, "outerRadius", 50, "dim");

        // Widget elements.
        var _svg = null;
        var _data = [{
            name: "data",
            value: 1,
            color: "white"
        }];

        /**
         * Binds new data to pie chart.
         *
         * @method data
         * @memberOf adt.widgets.piechart.PieChart
         * @param {Array} data Array of objects with keys 'name', 'value' and 'color'.
         */
        this.data = function (data) {
            _data = data;
            return this;
        };

        /**
         * Highlights the specified slice.
         *
         * @method highlight
         * @memberOf adt.widgets.piechart.PieChart
         * @param {string} key Key of the segment to highlight.
         * @param {number} duration Duration of the highlight animation.
         */
        this.highlight = function(key, duration) {
            _w.utils.highlight(_svg, "path", key, duration);
            _w.utils.highlight(_svg, "text", key, duration);
        };

        // Builder
        _w.render.build = function() {
            if (_svg !== null)
                return;
            _svg = {};

            // Add chart itself
            _svg.g = _w.widget.append("g");

            // Add label
            _svg.label = _svg.g.append("text")
                .attr("text-anchor", "middle")
                .attr("stroke-width", "0px")
                .style("fill", "white");

            // Add slices
            _svg.pie = d3.pie()
                .value(function (d) {
                    return d.value;
                })
                .sort(null);
            _svg.arc = d3.arc();

            _svg.arcs = _svg.g.selectAll(".arc")
                .data(_svg.pie(_data))
                .enter().append("g")
                .attr("class", "arc");
            _svg.paths = _svg.arcs.append("path")
                .attr("class", function (d) {
                    return _w.utils.encode(d.data.name);
                })
                .attr("fill", function (d) {
                    return d.data.color;
                })
                .style("shape-rendering", "geometricPrecision")
                .style("pointer-events", "all")
                .each(function (d) {
                    this._current = d;
                });
            _svg.labelArc = d3.arc()
                .outerRadius(_w.attr.outerRadius - 10)
                .innerRadius(_w.attr.innerRadius - 10);
            _svg.ticks = _svg.arcs.append("text")
                .attr("class", function (d) {
                    return _w.utils.encode(d.data.name);
                })
                .style("text-anchor", "middle")
                .attr("dy", "0.35em")
                .each(function (d) {
                    this._current = d;
                });
        };

        // Data updater
        _w.render.update = function (duration) {
            _svg.arcs.datum(_data);
            _svg.paths.data(_svg.pie(_data));
            _svg.paths
                .transition().duration(duration)
                .attrTween("d", function (a) {
                    var i = d3.interpolate(this._current, a);
                    this._current = i(0);
                    return function (t) {
                        return _svg.arc(i(t));
                    };
                });
            _svg.ticks.data(_svg.pie(data));
            _svg.ticks
                .text(function(d) {
                    return _w.attr.tickFormat(d.data.value);
                })
                .transition().duration(duration)
                .attrTween("transform", function(d) {
                    var i = d3.interpolate(this._current, d);
                    this._current = i(0);
                    return function (t) {
                        return "translate(" + _svg.labelArc.centroid(i(t)) + ")";
                    };
                });
        };

        // Style updater
        _w.render.style = function() {
            // Calculate radii
            var outerRadius = _w.attr.outerRadius - _w.attr.margins.left;
            _w.attr.width = 2*_w.attr.outerRadius;
            _w.attr.height = 2*_w.attr.outerRadius;

            // Widget
            _w.widget
                .style("width", _w.attr.width + "px")
                .style("height", _w.attr.height + "px");

            // Chart
            _svg.g
                .attr("transform", "translate(" + _w.attr.outerRadius + "," + _w.attr.outerRadius + ")");

            // Plot
            _svg.arc.outerRadius(outerRadius)
                .innerRadius(_w.attr.innerRadius);
            _svg.paths.attr("d", _svg.arc);

            // Ticks
            _svg.labelArc.outerRadius(outerRadius - 10)
                .innerRadius(_w.attr.innerRadius - 10);
            _svg.ticks
                .attr("d", _svg.labelArc)
                .attr("fill", _w.attr.fontColor);

            // Label
            _svg.label
                .attr("transform", "translate(0," + _w.attr.outerRadius + ")")
                .style("width", (10 + 2 * _w.attr.outerRadius) + "px")
                .style("font-size", Math.min(16, _w.attr.outerRadius*0.4) + "px")
                .style("fill", _w.attr.fontColor)
                .text(_w.attr.label);

            // Interactions
            _svg.paths
                .on("mouseover", function (d, i) {
                    _w.attr.mouseover && _w.attr.mouseover(d.data.name, i);
                });
            _svg.paths
                .on("mouseleave", function (d, i) {
                    _w.attr.mouseleave && _w.attr.mouseleave(d.data.name, i);
                });
            _svg.paths
                .on("click", function (d, i) {
                    _w.attr.click && _w.attr.click(d.data.name, i);
                });
        };
    }

    // Export
    PieChart.prototype = Object.create(Widget.prototype);
    return PieChart;
}));