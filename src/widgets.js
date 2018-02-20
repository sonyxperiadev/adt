/**
 * Module for creating and adding various widgets to an interactive dashboard.
 * Part of the Analytics Dashboard Tools.
 *
 * This module contains the base class for all widgets, and therefore it is required to be loaded.
 * All widgets come with some default functionality which are implemented in this module.
 * Furthermore, each widget has their own settings which are defined as properties of the widget. Each property of a
 * widget comes with a setter which is simply a function of the widget with the property name. For example, the
 * property <code>xLabel</code> is set by <code>Widget.xLabel("Some label")</code>.
 *
 * With a few exception, most of the widget methods return a reference to the widget itself for chaining.
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
 * @module widgets
 * @memberOf adt
 * @requires d3@v4
 * @requires lodash@4.17.4
 */
// TODO add example pages
// TODO add chart tooltip
// TODO add boxplot
// TODO add bubblechart
// TODO add violin plot
// TODO add scatter plot
// TODO add heat map
// TODO add calendar plot
// TODO make plot data modifiable
// TODO add placeholder as example
// TODO add description as an example
(function (global, factory) {
    if (typeof exports === "object" && typeof module !== "undefined") {
        module.exports = factory(require('d3'), require('lodash'), exports);
    } else if (typeof define === 'function' && define.amd) {
        define(['d3', '_', 'exports'], factory);
    } else {
        global.adt = global.adt || {};
        global.adt.widgets = global.adt.widgets || {};
        global.adt.widgets.Widget = factory(global.d3, global._);
    }
} (this, function (d3, _) {
    "use strict";

    /**
     * The base widget class, all widgets inherit this parent class.
     *
     * @class Widget
     * @memberOf adt.widgets
     * @param {string} name Name of the widget. This is used to identify the element.
     * @param {string} type Widget type, part of the generated widget ID.
     * @param {string=} element HTML element type to use in the widget. If not specified, SVG is used.
     * @param {object=} parent Parent element to append widget to. If not specified, it is attached to body.
     * @constructor
     */
    function Widget(name, type, element, parent) {
        /**
         * The widget DOM element.
         *
         * @var {object} _widget
         * @memberOf adt.widgets.Widget
         * @private
         */
        var _widget;
        try {
            if (parent) {
                _widget = d3.select(parent).append(element)
                    .attr("id", "adt-widget-" + type + "-" + name)
                    .attr("class", "adt-widget")
                    .style("display", "none")
                    .style("position", "absolute")
                    .style("pointer-events", "none");
            } else {
                _widget = d3.select("body").append(element)
                    .attr("id", "adt-widget-" + type + "-" + name)
                    .attr("class", "adt-widget")
                    .style("display", "none")
                    .style("position", "absolute")
                    .style("pointer-events", "none");
            }
        } catch (e) {
            console.error("MissingDOMException: there is no DOM, could not add widget");
        }

        /**
         * Default widget attributes.
         *
         * @var {object} _attr
         * @memberOf adt.widgets.Widget
         * @property {number} width Width in pixels.
         * @property {number} height Height in pixels.
         * @property {object} margins Object containing margins for each side.
         * @property {number} fontSize Font size in pixels.
         * @property {string} fontColor Font color. This also sets the axis color.
         * @property {string} fontWeight Font weight.
         * @private
         */
        var _attr = {
            xDim: "px",
            yDim: "px",
            fontWeight: "normal",

            /**
             * Attribute categories.
             *
             * @var {object} _categories
             * @memberOf adt.widgets.Widget._attr
             * @private
             */
            _categories: {
                /**
                 * Dimension attributes.
                 *
                 * @var {Array} _dim
                 * @memberOf adt.widgets.Widget._attr._categories
                 */
                dim: []
            },

            /**
             * Adds a new attribute to the widget.
             *
             * @method add
             * @memberOf adt.widgets.Widget._attr
             * @param {object} widget The widget to add the attribute to.
             * @param {string} name Name of the attribute.
             * @param {object} value Initial value of the attribute.
             * @param {string=} category Category to categorize attribute.
             * @param {function=} setter Optional setter function instead of a simple assignment.
             * @private
             */
            add: function (widget, name, value, category, setter) {
                // Set attribute
                _attr[name] = value;

                // Make setter
                widget[name] = function (attr) {
                    if (setter) {
                        setter(attr);
                    } else {
                        _attr[name] = attr;
                    }
                    return widget;
                };

                // Add category
                if (typeof category === "string" && _attr._categories.hasOwnProperty(category)) {
                    _attr._categories[category].push(name);
                }
            }
        };

        // Add default attributes
        /**
         * Whether to position widget relative to parent instead of absolute.
         * Default is false.
         *
         * @method relative
         * @memberOf adt.widgets.Widget
         * @param {boolean} on True if relative position should be turned on.
         */
        _attr.add(this, "relative", false);

        /**
         * Rescales widget and all of its dimension attributes by the specified factor.
         * Default is 1.
         *
         * @method resize
         * @memberOf adt.widgets.Widget
         * @param {boolean} scale Factor to resize widget with.
         */
        _attr.add(this, "resize", 1);

        /**
         * Sets the horizontal position of the widget.
         * Default is 0px.
         *
         * @method x
         * @memberOf adt.widgets.Widget
         * @param {number} x Position value.
         * @param {string} dim Dimension (unit) of the position. Supported values: px, %.
         */
        _attr.add(this, "x", 0, "dim", function(x, dim) {
            _attr.x = x;
            if (typeof dim === "string" && ["px", "%"].indexOf(dim) > -1)
                _attr.xDim = dim;
        });

        /**
         * Sets the vertical position of the widget.
         * Default is 0px.
         *
         * @method y
         * @memberOf adt.widgets.Widget
         * @param {number} y Position value.
         * @param {string} dim Dimension (unit) of the position. Supported values: px, %.
         */
        _attr.add(this, "y", 0, "dim", function(y, dim) {
            _attr.y = y;
            if (typeof dim === "string" && ["px", "%"].indexOf(dim) > -1)
                _attr.yDim = dim;
        });

        /**
         * Sets widget width in pixels. Default is 200.
         *
         * @method width
         * @memberOf adt.widgets.Widget
         * @param {number} w Width in pixels.
         */
        _attr.add(this, "width", 200, "dim");

        /**
         * Sets widget height in pixels. Default is 150.
         *
         * @method height
         * @memberOf adt.widgets.Widget
         * @param {number} h Height in pixels.
         */
        _attr.add(this, "height", 150, "dim");

        /**
         * Sets widget margins. Default is 0 for all sides.
         *
         * @method margins
         * @memberOf adt.widgets.Widget
         * @param {(number|object)} margins A single number to set all sides or an object specifying some of the sides.
         */
        _attr.add(this, "margins", {left: 0, right: 0, top: 0, bottom: 0}, "dim", function(margins) {
            if (typeof margins === "number") {
                ["top", "left", "bottom", "right"].forEach(function(m) {
                    _attr.margins[m] = margins;
                });
            } else {
                for (var side in margins) {
                    if (_attr.margins.hasOwnProperty(side))
                        _attr.margins[side] = margins[side];
                }
            }
        });

        /**
         * Sets widget borders. Default is null for all sides.
         *
         * @method borders
         * @memberOf adt.widgets.Widget
         * @param {object) borders An object specifying some of the sides.
         */
        _attr.add(this, "borders", {left: null, right: null, top: null, bottom: null}, null, function(borders) {
            for (var side in borders) {
                if (_attr.borders.hasOwnProperty(side))
                    _attr.borders[side] = borders[side];
            }
        });

        /**
         * Sets the font color of the widget. This color is used for axes and all other non-plot type elements.
         * Default is black.
         *
         * @method fontColor
         * @memberOf adt.widgets.Widget
         * @param {string} color Color to set font and axes to.
         */
        _attr.add(this, "fontColor", "black");

        /**
         * Sets font size of the widget in pixels.
         * Default is 10.
         *
         * @method fontSize.
         * @memberOf adt.widgets.Widget
         * @param {number} size Font size in pixels.
         */
        _attr.add(this, "fontSize", 10);

        /**
         * Sets font weight of the text elements in the widget.
         * Default is normal.
         *
         * @method fontWeight
         * @memberOf adt.widgets.Widget
         * @param {string} weight Font weight.
         */
        _attr.add(this, "fontWeight", "normal");

        /**
         * Sets the label of the widget.
         * Default is an empty string.
         *
         * @method label
         * @memberOf adt.widgets.Widget
         * @param {string} text Label text.
         */
        _attr.add(this, "label", null);

        /**
         * Sets the horizontal label of the widget.
         * Default is an empty string.
         *
         * @method xLabel
         * @memberOf adt.widgets.Widget
         * @param {string} text Label text.
         */
        _attr.add(this, "xLabel", null);

        /**
         * Sets the vertical label of the widget.
         * Default is an empty string.
         *
         * @method yLabel
         * @memberOf adt.widgets.Widget
         * @param {string} text Label text.
         */
        _attr.add(this, "yLabel", null);

        /**
         * Sets the format function for the ticks.
         * Default is an SI prefixed number
         *
         * @method tickFormat
         * @memberOf adt.widget.Widget
         * @param {function} format Function that converts a number to a string.
         */
        _attr.add(this, "tickFormat", function(x) {
            return x > 1 ? d3.format(".2s")(x) : x;
        });

        /**
         * Sets the format function for the vertical ticks.
         * Default is an SI prefixed number.
         *
         * @method yTickFormat
         * @memberOf adt.widgets.Widget
         * @param {function} format Function that converts a number to a string.
         */
        _attr.add(this, "yTickFormat", function(x) {
            return x > 1 ? d3.format(".2s")(x) : x;
        });

        /**
         * Sets the angle of the horizontal tick labels.
         * Default is 0.
         *
         * @method xTickAngle
         * @memberOf adt.widgets.Widget
         * @param {number} angle The angle to set.
         */
        _attr.add(this, "xTickAngle", null);

        /**
         * Sets vertical lower boundary of the widget.
         * Default is 0.
         *
         * @method yMin
         * @memberOf adt.widgets.Widget
         * @param {number} value Value to set vertical minimum to.
         */
        _attr.add(this, "yMin", 0);

        /**
         * Sets a callback when various elements of the widget are hovered.
         * The behavior of this callback is specific to each widget: for chart widgets, it is bound to the
         * plot elements (lines, bars, axis ticks), for the map it is bound to the countries, whereas for standalone
         * widgets such as a legend, it is bound to the widget itself.
         * Default is null.
         *
         * @method mouseover
         * @memberOf adt.widgets.Widget
         * @param {function} callback Callback to trigger on mouseover.
         */
        _attr.add(this, "mouseover", null);

        /**
         * Sets a callback when the mouse leaves various elements of the widget.
         * The behavior of this callback is specific to each widget: for chart widgets, it is bound to the
         * plot elements (lines, bars, axis ticks), for the map it is bound to the countries, whereas for standalone
         * widgets such as a legend, it is bound to the widget itself.
         * Default is null.
         *
         * @method mouseleave
         * @memberOf adt.widgets.Widget
         * @param {function} callback Callback to trigger on mouseleave.
         */
        _attr.add(this, "mouseleave", null);

        /**
         * Sets a callback when the various elements of the widget are clicked.
         * The behavior of this callback is specific to each widget: for chart widgets, it is bound to the
         * plot elements (lines, bars, axis ticks), for the map it is bound to the countries, whereas for standalone
         * widgets such as a legend, it is bound to the widget itself.
         * Default is null.
         *
         * @method click
         * @memberOf adt.widgets.Widget
         * @param {function} callback Callback to trigger on click.
         */
        _attr.add(this, "click", null);

        /**
         * Sets the color(s) of the widget plot elements.
         * Default is #888.
         *
         * @method colors
         * @memberOf adt.widgets.Widget
         * @param {(string|object)} color Single color to set all plot elements or an object specifying the color of
         * each plot.
         */
        _attr.add(this, "colors", "#888");

        /**
         * Collection of some convenience methods.
         *
         * @namespace _utils
         * @memberOf adt.widgets.Widget
         * @private
         */
        var _utils = (function () {
            /**
             * Encodes a plot key by replacing spaces with double underscore.
             *
             * @method encode
             * @memberOf adt.widgets.Widget.utils
             * @param {string} key Key to encode.
             * @returns {string} Encoded key if key is valid, empty string otherwise.
             * @private
             */
            function _encode(key) {
                if (!key)
                    return "";
                return key.replace(/ /g, '__');
            }

            /**
             * Calculates boundary for a data set.
             * If data is invalid, it returns (0, 1) for all axes.
             * Also calculates the sorted range of values for the X axis.
             *
             * @method boundary
             * @memberOf adt.widgets.Widget._utils
             * @param {Array} data Array of {x: number, y: object} pairs where y is an object containing various Y
             * values for different keys.
             * @param {{x: Array, y: Array}=} constraints Object containing additional constraints on the boundary.
             * @returns {object} Calculated boundary for each axis.
             * @private
             */
            function _boundary(data, constraints) {
                // If no data, return (0, 1), (0, 1)
                if (data === null || data === undefined || data.length < 1) {
                    return {
                        x: {min: 0, max: 1, domain: [0.5]},
                        y: {min: 0, max: 1, domain: []}
                    };
                }

                // X axis
                var x = [
                    d3.min(data, function (d) {
                        return d.x;
                    }),
                    d3.max(data, function (d) {
                        return d.x;
                    })
                ];
                var values = {};
                var xRange = [];
                data.forEach(function (d) {
                    if (!values.hasOwnProperty(d.x)) {
                        values[d.x] = 1;
                        xRange.push(d.x);
                    }
                });

                // Y axis
                var y = [];
                if (typeof data[0].y === "number") {
                    // Single data
                    y = [d3.min(data, function (d) {
                        return d.y;
                    }), d3.max(data, function (d) {
                        return d.y;
                    })];
                } else {
                    // Multiple Y values
                    var yMin = [],
                        yMax = [];
                    _.forOwn(data[0].y, function (yk, k) {
                        yMin.push(d3.min(data, function (d) {
                            return d.y[k];
                        }));
                        yMax.push(d3.max(data, function (d) {
                            return d.y[k];
                        }));
                    });
                    y = [d3.min(yMin), d3.max(yMax)];
                }

                // Read constraints
                var c = {x: [null, null], y: [null, null]};
                if (constraints) {
                    _.forOwn(c, function (ak, k) {
                        [0, 1].forEach(function (i) {
                            ak[i] = (constraints.hasOwnProperty(k) && constraints[k][i] !== null) ? constraints[k][i] : ak[i];
                        })
                    });
                }

                // Return boundary
                return {
                    x: {
                        min: c.x[0] !== null ? c.x[0] : x[0],
                        max: c.x[1] !== null ? c.x[1] : x[1],
                        domain: xRange.filter(function (d) {
                            return (!c.x[0] || d >= c.x[0]) && (!c.x[1] || d <= c.x[1])
                        })
                    },
                    y: {
                        min: c.y[0] !== null ? c.y[0] : y[0],
                        max: c.y[1] !== null ? c.y[1] : y[1],
                        domain: []
                    }
                };
            }

            /**
             * Calculates axis scales from a boundary.
             *
             * @method scale
             * @memberOf adt.widgets.Widget.utils
             * @param {{x: Array, y: Array}} boundary Object describing the boundary.
             * @param {number} width Width of the plotting area.
             * @param {number} height Height of the plotting area.
             * @param {{object=} axes Object containing axis types and reversals.
             * @returns {{x: function, y: function}} Object containing the scales for the axes.
             * @private
             */
            function _scale(boundary, width, height, axes) {
                function _setScale(type, b) {
                    var sc = null;
                    if (typeof type) {
                        switch (type) {
                            case "number":
                            default:
                                sc = d3.scaleLinear()
                                    .domain([b.min, b.max]);
                                break;
                            case "time":
                                sc = d3.scaleTime()
                                    .domain([b.min, b.max]);
                                break;
                            case "string":
                                sc = d3.scaleBand()
                                    .domain(b.domain)
                                    .padding(0.1);
                                break;
                        }
                    }
                    return sc;
                }

                // Make scales
                return {
                    x: _setScale(axes && axes.x ? axes.x.type : "number", boundary.x)
                        .range(axes && axes.x && axes.x.reverse ? [width, 0] : [0, width]),
                    y: _setScale(axes && axes.y ? axes.y.type : "number", boundary.y)
                        .range(axes && axes.y && axes.y.reverse ? [0, height] : [height, 0])
                };
            }

            /**
             * Highlights an element in the widget.
             *
             * @method highlight
             * @memberOf adt.widgets.Widget.utils
             * @param {object} svg The inner SVG of the widget.
             * @param {string} selector Selector of the widget elements.
             * @param {string} key Key of the element to highlight.
             * @param {number} duration Duration of the highlight animation.
             * @private
             */
            function _highlight(svg, selector, key, duration) {
                if (svg !== null) {
                    if (typeof key === "string") {
                        svg.g.selectAll(selector)
                            .transition().duration(duration ? duration : 0)
                            .style("opacity", function () {
                                return d3.select(this).classed(_encode(key)) ? 1 : 0.1;
                            });
                    } else {
                        svg.g.selectAll(selector)
                            .transition().duration(duration ? duration : 0)
                            .style("opacity", 1);
                    }
                }
            }

            // Exposed methods
            return {
                encode: _encode,
                boundary: _boundary,
                scale: _scale,
                highlight: _highlight
            };
        })();

        /**
         * Sets the class of the widget. Note that this method replaces existing class content (that is, it does not
         * simply add a class, but sets the entire content for the class attribute).
         *
         * @method addClass
         * @memberOf adt.widgets.Widget
         * @param {string} c Class to set the widget to.
         * @returns {adt.widgets.Widget} Reference to the current widget.
         */
        this.setClass = function (c) {
            _widget.attr("class", c);
            return this;
        };

        /**
         * The rendering methods of the widget.
         *
         * @namespace _render
         * @memberOf adt.widgets.Widget
         * @private
         */
        var _render = {
            /**
             * Builds widget if it is not yet created.
             * Must be overridden.
             *
             * @method build
             * @memberOf adt.widgets.Widget._render
             */
            build: function () {
                //throw new Error("adt.widgets.Widgets Error: build() is not implemented");
            },

            /**
             * Updates the widget data.
             * Must be overridden.
             *
             * @method update
             * @memberOf adt.widgets.Widget._render
             */
            update: function () {
                //throw new Error("adt.widgets.Widgets Error: update() is not implemented");
            },

            /**
             * Updates widget style.
             * Must be overridden.
             *
             * @method style
             * @memberOf adt.widgets.Widget._render
             */
            style: function () {
                //throw new Error("adt.widgets.Widgets Error: style() is not implemented");
            }
        };

        /**
         * Renders the widget. Note that without calling this method, the widget is not rendered at all.
         *
         * @method render
         * @memberOf adt.widgets.Widget
         * @param {number=} duration Duration of the rendering transition. If not specified, 500 ms is applied.
         * @returns {adt.widgets.Widget} Reference to the current widget.
         */
        this.render = function (duration) {
            // Calculate final duration to use
            var dur = typeof duration === "number" ? duration : 500;

            // Resize dimension attributes
            if (typeof _attr.resize === "number") {
                _attr._categories.dim.forEach(function (a) {
                    if (a === 'resize' || !_attr.hasOwnProperty(a))
                        return;

                    // Number attribute
                    switch (typeof _attr[a]) {
                        case "number":
                            if ((a !== "x" || _attr.xDim !== "%") && (a !== "y" || _attr.yDim !== "%"))
                                _attr[a] *= _attr.resize;
                            break;
                        case "object":
                            _.forOwn(_attr[a], function (attr, i) {
                                if (typeof attr === "number") {
                                    _attr[a][i] *= _attr.resize;
                                }
                            });
                            break;
                        default:
                            break;
                    }
                });
                _attr.resize = null;
            }

            // Build widget if first time render
            if (!this._isBuilt) {
                _render.build(dur);
                this._isBuilt = true;
            }

            // Update data
            _render.update(dur);

            // Widget position
            if (_attr.relative) {
                _widget.style("position", "relative")
                    .style("top", null)
                    .style("bottom", null)
                    .style("left", null)
                    .style("right", null);
            } else {
                _widget.style("position", "absolute")
                    .style(_attr.x >= 0 ? "left" : "right", Math.abs(_attr.x) + _attr.xDim)
                    .style(_attr.y >= 0 ? "top" : "bottom", Math.abs(_attr.y) + _attr.yDim)
            }

            // Widget size
            _widget.style("width", _attr.width + "px")
                .style("height", _attr.height + "px");

            // Axis and font styles
            _widget.selectAll(".axis path")
                .style("fill", "none")
                .style("stroke", _attr.fontColor)
                .style("stroke-width", "1px")
                .style("shape-rendering", "crispEdges");
            _widget.selectAll(".tick > line")
                .style("stroke", _attr.fontColor)
                .style("stroke-width", "1px")
                .style("shape-rendering", "crispEdges");
            _widget.selectAll(".tick > text")
                .attr("stroke-width", 0)
                .attr("font-family", "inherit")
                .style("font-size", _attr.fontSize + "px")
                .style("fill", _attr.fontColor);
            _widget
                .style("font-family", "inherit");
            _widget.selectAll("g")
                .attr("font-family", "inherit");

            // Additional styling
            _render.style();

            _widget.style("display", "block");
            return this;
        };

        /**
         * Adds a description for the widget.
         * A description is a tooltip that is shown if the user right-clicks on the widget.
         * After 15 second or if the user leaves the widget, the description disappears.
         *
         * @method describe
         * @memberOf adt.widgets.Widget
         * @param {string} content Content of the description. Can be HTML formatted.
         * @returns {adt.widgets.Widget} Reference to the current widget.
         */
        this.describe = function(content) {
            var _description = null;

            _widget
                .on("contextmenu", function () {
                    d3.event.preventDefault();
                    if (_description === null) {
                        _description = d3.select("body").append("div")
                            .style("position", "absolute")
                            .style("left", (d3.event.pageX + 20) + "px")
                            .style("top", (d3.event.pageY - 20) + "px")
                            .style("width", "auto")
                            .style("max-width", "500px")
                            .style("padding", "10px")
                            .style("background", "white")
                            .style("box-shadow", "0 0 1px black")
                            .style("border-radius", "3px")
                            .style("color", "black")
                            .style("font-size", "0.8em")
                            .html(content);

                        // Remove after a while
                        setTimeout(function () {
                            if (_description !== null) {
                                _description
                                    .transition().duration(2000)
                                    .style("opacity", 0)
                                    .on("end", function () {
                                        d3.select(this).remove();
                                        _description = null;
                                    });
                            }
                        }, 15000);
                    }
                })
                .on("mouseleave", function () {
                    // Remove description
                    if (_description !== null) {
                        _description.remove();
                        _description = null;
                    }
                });
            return this;
        };

        /**
         * Replaces the widget with a placeholder.
         * Useful for showing missing data.
         *
         * @method placeholder
         * @memberOf adt.widgets.Widget
         * @param {string} content Content to show in place of the widget. Can be HTML formatted. If nothing is passed,
         * the widget is shown again.
         */
        this.placeholder = function(content) {
            var duration = 300;
            var placeHolderId = "adt-widget-placeholder-" + name;
            if (content) {
                // Hide widget
                _widget
                    .transition().duration(duration)
                    .style("opacity", 0);

                // Show placeholder text
                if (d3.select("#" + placeHolderId).empty()) {
                    var realParent = parent ? parent : "body";
                    d3.select(realParent).append("div")
                        .attr("id", placeHolderId)
                        .style("position", "absolute")
                        .style("width", _attr.width + "px")
                        .style("height", _attr.height + "px")
                        .style("line-height", _attr.height + "px")
                        .style(_attr.x >= 0 ? "left" : "right", Math.abs(_attr.x) + _attr.xDim)
                        .style(_attr.y >= 0 ? "top" : "bottom", Math.abs(_attr.y) + _attr.yDim)
                        .style("text-align", "center")
                        .append("span")
                        .style("display", "inline-block")
                        .style("vertical-align", "middle")
                        .style("line-height", "normal")
                        .style("font-weight", _attr.fontWeight)
                        .style("font-size", _attr.fontSize)
                        .style("color", _attr.fontColor)
                        .style("opacity", 0)
                        .html(content)
                        .transition().duration(duration)
                        .style("opacity", 1);
                }
            } else {
                _widget.transition().duration();
                _widget
                    .transition().duration(duration)
                    .style("opacity", 1);
                var ph = d3.select("#" + placeHolderId);
                if (!ph.empty()) {
                    ph.remove();
                }
            }
        };

        /**
         * Removes widget from DOM.
         *
         * @method remove
         * @memberOf adt.widgets.Widget
         */
        this.remove = function() {
            _widget.remove();
        };

        // Return protected members
        return {
            widget: _widget,
            attr: _attr,
            utils: _utils,
            render: _render
        };
    }

    /*function Tooltip(content, width, offset) {
     var _id = makeId("tooltip", "tooltip");

     // If content is null, just remove tooltip
     if (!content) {
     d3.select("#" + _id).remove();
     }

     // Create and style it
     var tooltip = d3.select("body").append("div")
     .attr("id", _id)
     .style("position", "absolute")
     .style("width", (width ? width : 240) + "px")
     .style("padding", "8px")
     .style("border-radius", "2px")
     .style("background-color", "rgba(0, 0, 0, 0.7)")
     .style("box-shadow", "0 0 2px white")
     .style("color", "white")
     .style("font-size", "0.9em")
     .style("pointer-events", "none")
     .style("opacity", 0);
     d3.select("#" + _id).append("div")
     .attr("id", "widgets-tooltip-content")
     .attr("class", "content");
     document.getElementById("widgets-tooltip-content").appendChild(content);

     // Position it
     var dx = offset && typeof offset.x === "number" ? offset.x : (width ? width + 20 : 280);
     var dy = offset && typeof offset.y === "number" ? offset.y : 240;
     var tx = d3.event.pageX < window.innerWidth - dx ? d3.event.pageX : d3.event.pageX - dx;
     var ty = d3.event.pageY < window.innerHeight - dy ? d3.event.pageY : d3.event.pageY - dy;

     // Show tooltip
     tooltip.style("left", (tx + 20) + 'px')
     .style("top", (ty + 20) + 'px')
     .style("opacity", 1);
     }*/

    // Add to exports
    return Widget;
}));
