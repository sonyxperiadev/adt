/**
 * Module implementing the image widget.
 * Part of the Analytics Office map dashboard utils.
 *
 * The image widget is just simply an absolutely positioned image.
 *
 * @copyright Copyright (C) 2017 Sony Mobile Communications AB.
 * All rights, including trade secret rights, reserved.
 * @author Enys Mones (enys.mones@sony.com)
 * @module widgets.image
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
        throw new Error("adt.widgets.image Error: widgets module is not exported");
    }

    /**
     * The image widget class.
     *
     * @class Image
     * @memberOf adt.widgets.image
     * @param {string} name Identifier of the widget.
     * @param {object=} parent Parent element to append widget to. If not specified, widget is appended to body.
     * @constructor
     */
    function Image(name, parent) {
        var _w = widgets.Widget.call(this, name, "image", "img", parent);

        /**
         * Sets the image source path.
         *
         * @method src
         * @memberOf adt.widgets.image.Image
         * @param {string} path Path to the image source.
         */
        _w.attr.add(this, "src", "");

        // Rendering methods.
        _w.render.build = function() {};

        _w.render.update = function() {};

        _w.render.style = function() {
            _w.widget
                .style("width", null)
                .style("height", null)
                .attr("width", _w.attr.width)
                .attr("height", null)
                .style("pointer-events", "none");
            if (typeof _w.attr.src === "string" && _w.attr.src !== "") {
                _w.widget.attr("src", _w.attr.src)
                    .style("display", "block");
            } else {
                _w.widget.style("display", "none");
            }
        };
    }

    Image.prototype = Object.create(widgets.Widget.prototype);
    exports.widgets.Image = Image;
})));