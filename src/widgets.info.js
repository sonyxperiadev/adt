/**
 * Module implementing an info notification.
 * Part of the Analytics Dashboard Tools.
 *
 * An info is a small window together with a transparent full-width background.
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
 * @module info
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
        global.adt.widgets.Info = factory(global.d3, global.adt.widgets.Widget, global);
    }
} (this, function (d3, Widget) {
    "use strict";

    /**
     * The info widget class.
     *
     * @class Info
     * @memberOf adt.widgets.info
     * @constructor
     */
    var Info = (function () {
        var _info = null;

        function _Info() {
            // If exists, remove it
            if (_info) {
                _info.remove();
            }

            var _w = Widget.call(this, "info", "info", "div");
            _info = _w.widget;

            /**
             * Sets the info box content.
             *
             * @method content
             * @memberOf adt.widgets.info.Info
             * @param {string} text Content of the info box. Can be HTML formatted.
             */
            _w.attr.add(this, "content", "");

            /**
             * Sets the background color of the info.
             * Default is black.
             *
             * @method backgroundColor
             * @memberOf adt.widgets.info.Info
             * @param {string} color Color to set background to.
             */
            _w.attr.add(this, "backgroundColor", "black");

            // Widget elements.
            var _box = null;
            var _content = null;

            // Builder
            _w.render.build = function (duration) {
                _w.widget
                    .style("display", "none")
                    .style("opacity", 0)
                    .on("click", function () {
                        d3.select(this)
                            .transition().duration(duration)
                            .style("opacity", 0)
                            .on("end", function () {
                                _info.remove();
                            });
                    });

                // Add box
                _box = _w.widget.append("div")
                    .style("position", "absolute")
                    .style("top", "50%")
                    .style("left", "50%")
                    .style("width", "600px")
                    .style("height", "400px")
                    .style("padding", "20px")
                    .style("margin-left", "-310px")
                    .style("margin-top", "-210px")
                    .style("height", "380px")
                    .style("box-shadow", "1px 1px 2px grey")
                    .style("border", "1px solid grey")
                    .style("border-radius", 2);

                // Add content
                _content = _box.append("div")
                    .style("padding", "10px")
                    .style("height", "360px")
                    .style("font-size", "14pt")
                    .style("color", "white")
                    .style("text-align", "justify")
                    .style("overflow", "scroll");
            };

            // Style updater
            _w.render.style = function (duration) {
                var bg = d3.color(_w.attr.backgroundColor);

                _w.widget
                    .style("width", "100%")
                    .style("height", "100%")
                    .style("top", "0")
                    .style("left", "0")
                    .style("pointer-events", "all")
                    .style("background-color", "rgba(" + bg.rgb().r + "," + bg.rgb().g + "," + bg.rgb().b + ",0.9)")
                    .style("color", "white");

                // Box
                _box
                    .style("background-color", _w.attr.backgroundColor);

                // Add content
                _content.html(_w.attr.content);

                // Show info
                _w.widget
                    .style("display", "block")
                    .transition().duration(duration)
                    .style("opacity", 1);
            };
        }

        return _Info;
    })();

    // Export
    Info.prototype = Object.create(Widget.prototype);
    return Info;
}));