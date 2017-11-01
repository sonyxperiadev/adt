/**
 * Module implementing an status widget.
 * Part of the Analytics Dashboard Tools.
 *
 * A status is a 'label: status' pair.
 *
 * @copyright Copyright (C) 2017 Sony Mobile Communications AB.
 * All rights, including trade secret rights, reserved.
 * @author Enys Mones (enys.mones@sony.com)
 * @module widgets.status
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
        throw new Error("adt.widgets.status Error: widgets module is not exported");
    }

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
        var _w = widgets.Widget.call(this, name, "status", "div", parent);

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

    Status.prototype = Object.create(widgets.Widget.prototype);
    exports.widgets.Status = Status;
})));