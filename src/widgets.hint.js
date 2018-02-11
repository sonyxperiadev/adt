/**
 * Module implementing a smart hint.
 * Part of the Analytics Office map dashboard utils.
 *
 * A hint is a positioned label of information that disappears once the user interacts with the page.
 * It is always added to body as parent.
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
 * @module hint
 * @memberOf adt.widgets
 * @requires d3@v4
 * @requires adt.widgets.Widget
 */
(function (global, factory) {
    if (typeof exports === "object" && typeof module !== "undefined") {
        module.exports = factory(require('d3'), require('./widgets'), exports);
    } else if (typeof define === 'function' && define.amd) {
        define(['d3', 'widgets', 'exports'], factory);
    } else {
        global.adt = global.adt || {};
        global.adt.widgets = global.adt.widgets || {};
        global.adt.widgets.hint.Hint = factory(global.d3, global.adt.widgets.Widget, global);
    }
} (this, function (d3, Widget) {
    "use strict";

    /**
     * The hint widget class.
     *
     * @class Hint
     * @memberOf adt.widgets.hint
     * @param {string} name Identifier of the widget.
     * @constructor
     */
    var Hint = (function() {
        /**
         * List of visible hints.
         *
         * @var {object} _hints
         * @memberOf adt.widgets.hint.Hint
         * @private
         */
        var _hints = {};

        /**
         * Clears hints list.
         *
         * @method _clear
         * @memberOf adt.widgets.hint.Hint
         * @private
         */
        function _clear() {
            for (var id in _hints) {
                if (_hints.hasOwnProperty(id)) {
                    delete _hints[id];
                }
            }
            _hints = {};
        }

        /**
         * The actual hint class.
         *
         * @class _Hint
         * @memberOf adt.widgets.hint.Hint
         * @param {string} name Name of the hint.
         * @private
         */
        function _Hint(name) {
            // Hint IDs
            var _idBase = "adt-widgets-hint-";
            var _id = _idBase + name;
            var _styleId = _idBase + "css";
            var _class = _idBase + "class";
            var _detectorId = _idBase + "detector";

            // Avoid duplicates
            if (_hints.hasOwnProperty(_id)) {
                return _hints[_id];
            } else {
                var _w = Widget.call(this, name, "hint", "div");
                var that = this;
            }

            /**
             * @property {string} text The hint text.
             * @memberOf adt.widgets.hint.Hint
             */
            _w.attr.add(this, "text", "");

            // Add missing CSS for hint
            try {
                if (d3.select("#" + _styleId).empty()) {
                    d3.select("head").append("style")
                        .attr("id", _styleId)
                        .text("." + _class + ":after{content:' ';position:absolute;width:0;height:0;left:20.5px;top:40px;border:7px solid;border-color:#000 transparent transparent #000;}");
                }

                // Setup mouse interaction
                if (d3.select("#" + _detectorId).empty()) {
                    d3.select("body")
                        .append("div")
                        .attr("id", _detectorId)
                        .style("position", "absolute")
                        .style("top", 0)
                        .style("bottom", 0)
                        .style("left", 0)
                        .style("right", 0)
                        .on("mousemove", function () {
                            d3.selectAll("." + _class).remove();
                            d3.select(this).remove();
                            _clear();
                        });
                }
            } catch (e) {
                console.error("MissingDOMException: there is no DOM, could not add widget");
            }

            // Rendering methods.
            _w.render.build = function () {
                // Add hint class
                _w.widget.attr("class", _class)
                    .style("position", "absolute")
                    .style("display", "block")
                    .style("padding", "15px")
                    .style("text-align", "center")
                    .style("line-height", "0.9em")
                    .style("background-color", "black")
                    .style("border-radius", "4px")
                    .style("color", "white")
                    .style("font-size", "0.9em")
                    .style("font-weight", "bold")
                    .style("pointer-events", "none");
            };

            _w.render.update = function () {};

            _w.render.style = function (duration) {
                _w.widget
                    .style("width", "auto")
                    .style("height", null)
                    .html(_w.attr.text);

                // Show animation if first time created
                if (!_hints[_id]) {
                    _hints[_id] = that;
                    _w.widget
                        .style("opacity", 0)
                        .transition().duration(duration)
                        .style("opacity", 1);
                }
            };
        }

        return _Hint;
    })();

    // Export
    Hint.prototype = Object.create(Widget.prototype);
    return Hint;
}));