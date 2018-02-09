/**
 * Module implementing an status widget.
 * Part of the Analytics Dashboard Tools.
 *
 * A status is a 'label: status' pair.
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
 * @module widgets.status
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
        global.adt.widgets.Status = factory(global.d3, global.adt.widgets.Widget);
    }
} (this, function (d3, Widget) {
    "use strict";

    /**
     * The status widget class.
     *
     * @class Status
     * @memberOf adt.widgets.status
     * @param {string} name Identifier of the status widget.
     * @param {object=} parent Parent element to append widget to. If not specified, widget is appended to body.
     * Accepts HTML formatting.
     * @constructor
     */
    function Status(name, parent) {
        var _w = Widget.call(this, name, "status", "div", parent);

        /**
         * Sets the status label (description of the status).
         *
         * @method label
         * @memberOf adt.widgets.status.Status
         * @param {string} text Label text.
         */
        _w.attr.add(this, "label", "");

        /**
         * Sets the status value (current status).
         *
         * @method status
         * @memberOf adt.widgets.status.Status
         * @param {string} text Status value text.
         */
        _w.attr.add(this, "status", "");

        // Widget elements.
        var _label = null;
        var _status = null;

        // Rendering methods.
        _w.render.build = function() {
            if (_label === null) {
                _label = _w.widget.append("span")
                    .style("position", "relative")
                    .style("display", "inline-block")
                    .style("float", "left")
                    .style("width", "25%")
                    .style("color", "white")
                    .style("font-weight", "normal");
                _status = _w.widget.append("span")
                    .style("position", "relative")
                    .style("display", "inline-block")
                    .style("float", "right")
                    .style("width", "75%")
                    .style("text-align", "right");
            }
        };

        _w.render.update = function() {};

        _w.render.style = function() {
            _w.widget
                .style("font-size", _w.attr.fontSize + "px")
                .style("pointer-events", "none");

            _.forOwn(_w.attr.margins, function(margin, side) {
                _w.widget.style("margin-" + side, margin + "px");
            });
            _.forOwn(_w.attr.borders, function(border, side) {
                _w.widget.style("border-" + side, border);
            });
            _label
                .style("color", _w.attr.fontColor)
                .style("font-weight", _w.attr.fontWeight)
                .style("pointer-events", "none")
                .html(_w.attr.label);
            _status
                .style("color", _w.attr.fontColor)
                .style("font-weight", _w.attr.fontWeight)
                .style("pointer-events", "none")
                .html(_w.attr.status);
            _w.widget.style("display", "block");
        };

    }

    // Export
    Status.prototype = Object.create(Widget.prototype);
    return Status;
}));