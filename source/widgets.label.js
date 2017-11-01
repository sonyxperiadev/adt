/**
 * Module implementing an interactive bar chart.
 * Part of the Analytics Dashboard Tools.
 *
 * A label is a static piece of text.
 * Part of the Analytics Office map dashboard utils.
 *
 * @copyright Copyright (C) 2017 Sony Mobile Communications AB.
 * All rights, including trade secret rights, reserved.
 * @author Enys Mones (enys.mones@sony.com)
 * @module widgets.label
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
        throw new Error("adt.widgets.label Error: widgets module is not exported");
    }

    /**
     * The label widget class.
     *
     * @class Label
     * @memberOf adt.widgets.label
     * @param {string} name Identifier of the label.
     * @param {object=} parent Parent element to append widget to. If not specified, widget is appended to body.
     * @constructor
     */
    function Label(name, parent) {
        var _w = widgets.Widget.call(this, name, "label", "div", parent);

        /**
         * Sets text of the label.
         *
         * @method text
         * @memberOf adt.widgets.label.Label
         * @param {string} label Text of the label.
         */
        _w.attr.add(this, "text", "");

        /**
         * Sets label text alignment.
         * Default is center.
         *
         * @method align
         * @memberOf adt.widgets.label.Label
         * @param {string} alignment The alignment to set.
         */
        _w.attr.add(this, "align", "center");

        // Rendering methods.
        _w.render.build = function() {};

        _w.render.update = function() {};

        _w.render.style = function() {
            _w.widget
                .style("color", _w.attr.fontColor)
                .style("font-size", _w.attr.fontSize + "px")
                .style("font-weight", _w.attr.fontWeight)
                .style("text-align", _w.attr.align)
                .style("pointer-events", "none")
                .html(_w.attr.text);
            _.forOwn(_w.attr.margins, function(margin, side) {
                _w.widget.style("margin-" + side, margin + "px");
            });
            _.forOwn(_w.attr.borders, function(border, side) {
                _w.widget.style("border-" + side, border);
            });
            _w.widget.style("display", "block");
        };
    }

    Label.prototype = Object.create(widgets.Widget.prototype);
    exports.widgets.Label = Label;
})));