/**
 * Module implementing a colored legend.
 * Part of the Analytics Dashboard Tools.
 *
 * A legend is a static label together with a colored square.
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
 * @module widgets.Legend
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
        global.adt.widgets.Legend = factory(global.d3, global.adt.widgets.Widget, global);
    }
} (this, function (d3, Widget) {
    "use strict";

    /**
     * The legend widget class.
     *
     * @class Legend
     * @memberOf adt.widgets
     * @param {string} name Identifier of the legend.
     * @param {object=} parent Parent element to append widget to. If not specified, widget is appended to body.
     * @constructor
     */
    function Legend(name, parent) {
        var _w = Widget.call(this, name, "legend", "div", parent);

        /**
         * Sets legend text.
         *
         * @method text
         * @memberOf adt.widgets.Legend
         * @param {string} label Text of the legend.
         */
        _w.attr.add(this, "text", "");

        /**
         * Sets legend color.
         * Default is white.
         *
         * @method color
         * @memberOf adt.widgets.Legend
         * @param {string} color Color to use.
         */
        _w.attr.add(this, "color", "white");

        /**
         * Sets callback for mouse over on the legend.
         *
         * @method mouseover
         * @memberOf adt.widgets.Legend
         * @param {function} callback Callback to set.
         */
        _w.attr.add(this, "mouseover", null);

        /**
         * Sets callback for mouse leave on the legend.
         *
         * @method mouseleave
         * @memberOf adt.widgets.Legend
         * @param {function} callback Callback to set.
         */
        _w.attr.add(this, "mouseleave", null);

        /**
         * Sets callback for click on the legend.
         *
         * @method click
         * @memberOf adt.widgets.Legend
         * @param {function} callback Callback to set.
         */
        _w.attr.add(this, "click", null);

        // Widget elements.
        var _square = null;
        var _text = null;

        /**
         * Highlights legend. A highlighted legend has a bold text.
         *
         * @method highlight
         * @memberOf adt.widgets.Legend
         * @param {boolean} on Whether to turn highlight on or off.
         */
        this.highlight = function(on) {
            _text.style("font-weight", on ? "900" : "normal");
        };

        // Rendering methods.
        _w.render.build = function() {
            if (!_square) {
                _square = _w.widget.append("div")
                    .style("position", "relative")
                    .style("float", "left")
                    .style("display", "block")
                    .style("background-color", "white")
                    .style("cursor", "pointer");
            }
            if (!_text) {
                _text = _w.widget.append("div")
                    .style("position", "relative")
                    .style("float", "left")
                    .style("color", "white")
                    .style("font-size", "16px")
                    .style("text-align", "left")
                    .style("cursor", "pointer");
            }
        };

        _w.render.update = function() {};

        _w.render.style = function() {
            _w.widget.style("pointer-events", "all");
            _.forOwn(_w.attr.margins, function(margin, side) {
                _w.widget.style("margin-" + side, margin + "px");
            });
            _text.style("color", _w.attr.fontColor)
                .style("font-size", _w.attr.fontSize + "px")
                .html(_w.attr.text);
            if (_w.attr.mouseover)
                _text.on("mouseover", _w.attr.mouseover);
            if (_w.attr.mouseleave)
                _text.on("mouseleave", _w.attr.mouseleave);
            if (_w.attr.click)
                _text.on("click", _w.attr.click);
            _square.style("width", 0.8*_w.attr.fontSize + "px")
                .style("height", 0.8*_w.attr.fontSize + "px")
                .style("margin-right", 0.4*_w.attr.fontSize + "px")
                .style("margin-top", 0.2*_w.attr.fontSize + "px")
                .style("background-color", _w.attr.color);
            _w.widget.style("display", "block");
        }
    }

    // Export
    Legend.prototype = Object.create(Widget.prototype);
    return Legend;
}));