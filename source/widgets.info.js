/**
 * Module implementing an info notification.
 * Part of the Analytics Dashboard Tools.
 *
 * An info is a small window together with a transparent full-width background.
 *
 * @copyright Copyright (C) 2017 Sony Mobile Communications AB.
 * All rights, including trade secret rights, reserved.
 * @author Enys Mones (enys.mones@sony.com)
 * @module widgets.info
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
        throw new Error("adt.widgets.info Error: widgets module is not exported");
    }

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

            var _w = widgets.Widget.call(this, "info", "info", "div");
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

            // Rendering methods.
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

            _w.render.update = function () {
            };

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

    Info.prototype = Object.create(widgets.Widget.prototype);
    exports.widgets.Info = Info;
})));