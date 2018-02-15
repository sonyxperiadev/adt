/**
 * Module implementing the image widget.
 * Part of the Analytics Office map dashboard utils.
 *
 * The image widget is just simply an absolutely positioned image.
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
 * @module image
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
        global.adt.widgets.Image = factory(global.d3, global.adt.widgets.Widget, global);
    }
} (this, function (d3, Widget) {
    "use strict";

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
        var _w = Widget.call(this, name, "image", "img", parent);

        /**
         * Sets the image source path.
         *
         * @method src
         * @memberOf adt.widgets.image.Image
         * @param {string} path Path to the image source.
         */
        _w.attr.add(this, "src", "");

        // Style updater
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

    // Export
    Image.prototype = Object.create(Widget.prototype);
    return Image;
}));