/**
 * Module implementing an interactive pie chart.
 * Part of the Analytics Dashboard Tools.
 *
 * @copyright Copyright (C) 2017 Sony Mobile Communications AB.
 * All rights, including trade secret rights, reserved.
 * @author Enys Mones (enys.mones@sony.com)
 * @module widgets.piechart
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
        throw new Error("adt.widgets.piechart Error: widgets module is not exported");
    }

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
        var _w = widgets.Widget.call(this, name, "pieChart", "svg", parent);

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

        /**
         * Sets pie chart label.
         *
         * @method label
         * @memberOf adt.widgets.piechart.PieChart
         * @param {string} text Label text.
         */
        _w.attr.add(this, "label", "");

        /**
         * Sets callback for mouse over on a slice.
         *
         * @method mouseover
         * @memberOf adt.widgets.piechart.PieChart
         * @param {function} callback Callback to set.
         */
        _w.attr.add(this, "mouseover", null);

        /**
         * Sets callback for mouse leave on a slice.
         *
         * @method mouseleave
         * @memberOf adt.widgets.piechart.PieChart
         * @param {function} callback Callback to set.
         */
        _w.attr.add(this, "mouseleave", null);

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
         * @param {string} name Name of the slice to highlight.
         */
        this.highlight = function(name) {
            _w.utils.highlight(_svg, "path", name);
        };

        // Rendering methods.
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
            _svg.arc = d3.arc();
            _svg.pie = d3.pie()
                .value(function (d) {
                    return d.value;
                });
            _svg.paths = _svg.g
                .datum(_data).selectAll("path")
                .data(_svg.pie)
                .enter().append("path")
                .attr("class", function (d, i) {
                    return _w.utils.encode(_data[i].name);
                })
                .attr("fill", function (d, i) {
                    return _data[i].color;
                })
                .style("shape-rendering", "geometricPrecision")
                .style("pointer-events", "all")
                .attr("d", _svg.arc)
                .each(function (d) {
                    this._current = d;
                });
        };

        _w.render.update = function (duration) {
            _svg.g.datum(_data);
            _svg.path.data(_svg.pie);
            _svg.path
                .attr("d", _svg.arc)
                .transition().duration(duration)
                .attrTween("d", function (a) {
                    var i = d3.interpolate(this._current, a);
                    this._current = i(0);
                    return function (t) {
                        return _svg.arc(i(t));
                    };
                });
        };

        _w.render.style = function() {
            // Widget
            _w.widget
                .style("width", (10 + 2 * _w.attr.outerRadius) + "px")
                .style("height", (10 + 2 * _w.attr.outerRadius + 30) + "px");

            // Chart
            _svg.g
                .attr("transform", "translate(" + (5 + _w.attr.outerRadius) + "," + (5 + _w.attr.outerRadius) + ")");

            // Plot
            _svg.arc.outerRadius(_w.attr.outerRadius)
                .innerRadius(_w.attr.innerRadius);
            _svg.paths.attr("d", _svg.arc);

            // Label
            _svg.label
                .attr("transform", "translate(0," + (15 + _w.attr.outerRadius) + ")")
                .style("width", (10 + 2 * _w.attr.outerRadius) + "px")
                .style("font-size", Math.min(16, _w.attr.outerRadius*0.4) + "px")
                .style("fill", _w.attr.fontColor)
                .text(_w.attr.label);

            // Interactions
            if (_w.attr.mouseover) {
                _svg.paths
                    .on("mouseover", function (d, i) {
                        _w.attr.mouseover(_data[i], i);
                    });
            }
            if (_w.attr.mouseleave) {
                _svg.paths
                    .on("mouseleave", function (d, i) {
                        _w.attr.mouseleave(_data[i], i);
                    });
            }

            _w.widget.style("display", "block");
        };
    }

    PieChart.prototype = Object.create(widgets.Widget.prototype);
    exports.widgets.PieChart = PieChart;
})));