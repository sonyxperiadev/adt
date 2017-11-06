/**
 * Module implementing a dynamic tooltip.
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
 * @module widgets.tooltip
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
        throw new Error("adt.widgets.Tooltip Error: widgets module is not exported");
    }

    /**
     * The tooltip widget class.
     * A tooltip is a moving container of other widgets that can be removed instantly. It is always added to body as
     * parent.
     * Part of the Analytics Office map dashboard utils.
     *
     * @class Tooltip
     * @memberOf adt.widgets
     * @requires d3@v4
     * @requires adt.widgets
     * @constructor
     */
    function Tooltip() {
        // Tooltip ids
        var _id = "adt-widgets-tooltip-tooltip";

        // Remove existing tooltip
        d3.select("#" + _id).remove();
        var _w = widgets.Widget.call(this, "tooltip", "tooltip", "div");

        /**
         * @property {number} offsetX Horizontal offset to correct with.
         * @memberOf adt.widgets.Tooltip
         */
        _w.attr.add(this, "offsetX", 0);

        /**
         * @property {number} offsetY Vertical offset to correct with.
         * @memberOf adt.widgets.Tooltip
         */
        _w.attr.add(this, "offsetY", 0);

        /**
         * Widget elements.
         */
        var _content = d3.select(document.createElement("div"));

        this.content = function() {
            return _content;
        };

        /**
         * Rendering methods.
         */
        _w.render.build = function() {
            document.getElementById(_id).appendChild(_content.node());
        };

        _w.render.update = function() {};

        _w.render.style = function() {
            // Set position
            var dx = Math.max(_w.attr.offsetX, _w.attr.width);
            var dy = Math.max(_w.attr.offsetY, _w.attr.height);
            _w.widget.style("position", "absolute")
                .style("height", null)
                .style("border-radius", "2px")
                .style("background-color", "rgba(0, 0, 0, 0.7)")
                .style("box-shadow", "0 0 2px white")
                .style("pointer-events", "none")
                .style("left",
                    ((d3.event.pageX < window.innerWidth - dx ? d3.event.pageX : d3.event.pageX - dx) + 20) + "px")
                .style("top",
                    ((d3.event.pageY < window.innerHeight - dy ? d3.event.pageY : d3.event.pageY - dy) + 20) + "px");
            _w.widget.style("display", "block");
        };
    }

    Tooltip.prototype = Object.create(widgets.Widget.prototype);
    exports.widgets.Tooltip = Tooltip;
})));