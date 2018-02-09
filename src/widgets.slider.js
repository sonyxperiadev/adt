/**
 * Module implementing a slider.
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
 * @module widgets.slider
 * @memberOf adt
 * @requires d3@v4
 * @requires adt.widgets
 */
(function (global, factory) {
    if (typeof exports === "object" && typeof module !== "undefined") {
        module.exports = factory(require('d3'), require('./widgets'), exports);
    } else if (typeof define === 'function' && define.amd) {
        define(['d3', 'widgets', 'exports'], factory);
    } else {
        global.adt = global.adt || {};
        global.adt.widgets = global.adt.widgets || {};
        global.adt.widgets.Slider = factory(global.d3, global.adt.widgets.Widget, global);
    }
} (this, function (d3, Widget) {
    "use strict";

    /**
     * The slider widget class.
     *
     * @class Slider
     * @memberOf adt.widgets.slider
     * @param {string} name Identifier of the widget.
     * @param {object=} parent Parent element to append widget to. If not specified, widget is appended to body.
     * @constructor
     */
    function Slider(name, parent) {
        var _w = Widget.call(this, name, "slider", "svg", parent);

        /**
         * Sets the lower boundary of the slider.
         *
         * @method min
         * @memberOf adt.widgets.slider.Slider
         * @param {number} value Lower boundary.
         */
        _w.attr.add(this, "min", 0);

        /**
         * Sets the upper boundary of the slider.
         *
         * @method max
         * @memberOf adt.widgets.slider.Slider
         * @param {number} value Upper boundary.
         */
        _w.attr.add(this, "max", 1);

        /**
         * Sets the step of the slider scale for ordinal scale.
         * If zero is passed, a continuous scale is used.
         * Default is 0 (continuous scale).
         *
         * @method step
         * @memberOf adt.widgets.slider.Slider
         * @param {number} value Step size.
         */
        _w.attr.add(this, "step", 0);

        /**
         * Sets the label for the slider.
         * The label is shown on the left side of the slider.
         *
         * @method label
         * @memberOf adt.widgets.slider.Slider
         * @param {string} text Label text.
         */
        _w.attr.add(this, "label", "");

        /**
         * Sets callback attached to the slider. Must accept one parameter describing the value of the slider.
         *
         * @method callback
         * @memberOf adt.widgets.slider.Slider
         * @param {function} func The callback to call on value change.
         */
        _w.attr.add(this, "callback", null);

        // Widget elements
        var _svg = null;
        var _margins = {right: 20, left: 20};
        var _ordinalScale = false;
        var _domain = [];
        var _scale = null;

        // Rendering methods.
        _w.render.build = function () {
            if (_svg !== null)
                return;
            _svg = {};

            // Create continuous slider as default
            _domain = [_w.attr.min, _w.attr.max];
            _scale = d3.scaleLinear()
                .domain(_domain)
                .range([0, _w.attr.width - _margins.left - _margins.right])
                .clamp(true);

            // If step is specified, update to ordinal
            if (_w.attr.step) {
                _ordinalScale = true;

                // Update domain
                _domain = [];
                for (var i=_w.attr.min; i<=_w.attr.max; i+=_w.attr.step) {
                    _domain.push(i);
                }

                // Update scale
                _scale = d3.scalePoint()
                    .domain(_domain)
                    .range([0, _w.attr.width - _margins.left - _margins.right]);
            }

            _svg.g = _w.widget.append("g")
                .attr("transform", "translate(" + _margins.left + ",20)");

            _svg.g.append("line")
                .attr("stroke-linecap", "round")
                .attr("stroke", _w.attr.fontColor)
                .attr("stroke-width", "10px")
                .attr("x1", _scale.range()[0])
                .attr("x2", _scale.range()[1])
                .select(function () {
                    return this.parentNode.appendChild(this.cloneNode(true));
                })
                .style("stroke", "#eee")
                .style("stroke-width", "8px")
                .select(function () {
                    return this.parentNode.appendChild(this.cloneNode(true));
                })
                .style("cursor", "pointer")
                .style("pointer-events", "stroke")
                .style("stroke", "transparent")
                .style("stroke-width", "50px")
                .call(d3.drag()
                    .on("start drag", function () {
                        var value = null;
                        if (_ordinalScale) {
                            var ex = d3.event.x;
                            value = _domain.reduce(function(prev, curr) {
                                return (Math.abs(_scale(curr) - ex) < Math.abs(_scale(prev) - ex) ? curr : prev);
                            });
                        } else {
                            value = _scale.invert(d3.event.x);
                        }
                        _svg.handle.attr("cx", _scale(value));
                        if (_w.attr.callback) {
                            _w.attr.callback(value);
                        }
                    }));

            _svg.g.insert("g", ".track-overlay")
                .style("font", "10px sans-serif")
                .attr("transform", "translate(0," + 18 + ")")
                .selectAll("text")
                .data(_ordinalScale ? _domain : _scale.ticks(5))
                .enter().append("text")
                .attr("x", _scale)
                .attr("text-anchor", "middle")
                .attr("fill", _w.attr.fontColor)
                .text(function (d) {
                    return d;
                });

            _svg.handle = _svg.g.insert("circle", ".track-overlay")
                .style("fill", "white")
                .style("stroke", _w.attr.fontColor)
                .style("stroke-width", "1.2px")
                .attr("r", 8);
        };

        _w.render.update = function (duration) {
        };

        _w.render.style = function () {
            _w.widget.style("width", (_w.attr.width) + "px");
            _w.widget.style("height", 50 + "px");
            _w.widget.style("display", "block");
        };
    }

    // Export
    Slider.prototype = Object.create(Widget.prototype);
    return Slider;
}));