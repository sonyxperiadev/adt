/**
 * Module implementing a chord chart.
 * Part of the Analytics Dashboard Tools.
 *
 * A chord chart displays directed relationship between groups of segments. Each segment is
 * represented by a slice in the chord and ribbons correspond to the flow between segments.
 * In case of a flow matrix <code>M</code>, the color of a ribbon from segment <code>i</code> to
 * segment <code>j</code> is always the color of the largest source. That is, if <code>M[i][j] = 3</code>
 * and <code>M[j][i] = 10</code>, there is 7 more flow from <code>j</code> to <code>i</code> and the color
 * of the ribbon between these segments is the same as the color of segment <code>j</code> (the target of
 * the larger flow).
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
 * @module chordchart
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
        global.adt.widgets.ChordChart = factory(global.d3, global.adt.widgets.Widget, global);
    }
} (this, function (d3, Widget) {
    "use strict";

    /**
     * The chord chart widget class.
     *
     * @class ChordChart
     * @memberOf adt.widgets.chordchart
     * @param {string} name Identifier of the widget.
     * @param {object=} parent Parent element to append widget to. If not specified, widget is appended to body.
     * @constructor
     */
    function ChordChart(name, parent) {
        var _w = Widget.call(this, name, "chordChart", "svg", parent);

        /**
         * Sets radius in pixels.
         * Default is 100.
         *
         * @method radius
         * @memberOf adt.widgets.chordchart.ChordChart
         * @param {number} size Size of the radius in pixels.
         */
        _w.attr.add(this, "radius", 100, "dim");

        /**
         * Sets the thickness of the segments.
         * Default is 10.
         *
         * @method thickness
         * @memberOf adt.widgets.chordchart.ChordChart
         * @param {number} size Size of the thickness in pixels.
         */
        _w.attr.add(this, "thickness", 10, "dim");

        /**
         * Whether to have ticks (labels on the segments).
         * Default is false.
         *
         * @method ticks
         * @memberOf adt.widgets.chordchart.ChordChart
         * @param {boolean} on Whether to have ticks or not.
         */
        _w.attr.add(this, "ticks", false);

        /**
         * Inverts the chord meaning the color of each chord now correspods to the largest
         * source instead of the largest target.
         *
         * @method invert
         * @memberOf adt.widgets.chordchart.ChordChart
         * @param {boolean} on If chord should be inverted.
         */
        _w.attr.add(this, "invert", false);

        // Widget elements.
        var _svg = {};
        var _data = [];
        var _indexByName = d3.map();
        var _nameByIndex = d3.map();
        var _aura = 10;
        var _prev_chord = null;

        /**
         * Binds data to the chord chart.
         *
         * @method data
         * @memberOf adt.widgets.chordchart.ChordChart
         * @param {Array} data Array of {source, target, value} objects denoting the size of chord from segment to
         * segment.
         */
        this.data = function(data) {
            _indexByName.clear();
            _nameByIndex.clear();
            _data = [];
            var n = 0,
                d = 0;

            // Build index/name mappings
            data.forEach(function(dd) {
                if (!_indexByName.has(d = dd.source)) {
                    _nameByIndex.set(n, d);
                    _indexByName.set(d, n++);
                }
                if (!_indexByName.has(d = dd.target)) {
                    _nameByIndex.set(n, d);
                    _indexByName.set(d, n++);
                }
            });

            // Build data matrix
            data.forEach(function(d) {
                var source = _indexByName.get(d.source),
                    target = _indexByName.get(d.target),
                    row = _data[source];
                if (!row) {
                    row = _data[source] = [];
                    for (var i=0; i<n; i++) row[i] = 0;
                }
                row[target] = d.value;
                if (!_data[target]) {
                    _data[target] = [];
                    for (i=0; i<n; i++) _data[target][i] = 0;
                }
            });

            // Get length of largest segment name
            _aura = d3.max(_nameByIndex.values(), function(d) {
                return d.length;
            });

            return this;
        };

        /**
         * Creates a default color scheme based on the groups.
         *
         * @method _makeColors
         * @memberOf adt.widgets.chordchart.ChordChart
         * @param {Array} groups Array containing the chord groups.
         * @returns {object} The color schemes.
         * @private
         */
        function _makeColors(groups) {
            var colors = {};
            var scheme = d3.scaleOrdinal(d3.schemeCategory10);
            groups.forEach(function(g) {
                colors[_nameByIndex.get(g.index)] = scheme(g.index);
            });
            return colors;
        }

        /**
         * Creates an identifier for a ribbon.
         *
         * @method _ribbonId
         * @memberOf adt.widgets.chordchart.ChordChart
         * @param {object} data Object describing the ribbon.
         * @returns {string} Identifier.
         * @private
         */
        function _ribbonId(data) {
            return (data.source.index < data.target.index) ?
                data.source.index + "-" + data.target.index :
                data.target.index + "-" + data.source.index;
        }

        /**
         * Calculates an arc tween function from a starting chord data.
         *
         * @method _arcTween
         * @memberOf adt.widgets.chordchart.ChordChart
         * @param {object} start Starting chord data.
         * @returns {function} The arc tween animation function.
         * @private
         */
        function _arcTween(start) {
            var groups = d3.map();
            if (start) {
                start.groups.forEach(function (groupData) {
                    groups.set(groupData.index, groupData);
                });
            }

            return function (d) {
                var tween;
                var old = groups.get(d.index);

                // Group exists
                if (old) {
                    tween = d3.interpolate(old, d);
                }
                else {
                    // Create new group with zero width
                    var emptyArc = {
                        startAngle: d.startAngle,
                        endAngle: d.startAngle
                    };
                    tween = d3.interpolate(emptyArc, d);
                }

                return function (t) {
                    return _svg.arc(tween(t));
                };
            };
        }

        /**
         * Calculates a ribbon tween from a starting chord data.
         *
         * @method _ribbonTween
         * @memberOf adt.widgets.chordchart.ChordChart
         * @param {object} start Starting chord data.
         * @returns {function} The ribbon tween animation function.
         * @private
         */
        function _ribbonTween(start) {
            var ribbons = d3.map();
            if (start) {
                start.forEach(function (ribbonData) {
                    ribbons.set(_ribbonId(ribbonData), ribbonData);
                });
            }

            return function (d) {
                var tween;
                var old = ribbons.get(_ribbonId(d));
                if (old) {
                    if (d.source.index !== old.source.index) {
                        old = {
                            source: old.target,
                            target: old.source
                        };
                    }
                    tween = d3.interpolate(old, d);
                }
                else {
                    if (start) {
                        var oldGroups = start.groups.filter(function (group) {
                            return ((group.index === d.source.index) || (group.index === d.target.index));
                        });
                        old = {
                            source: oldGroups[0],
                            target: oldGroups[1] || oldGroups[0]
                        };

                        if (old.source && d.source.index !== old.source.index) {
                            old = {
                                source: old.target,
                                target: old.source
                            };
                        }
                    }
                    else old = d;

                    var sourceStartAngle = old.source ? old.source.startAngle : 0;
                    var targetStartAngle = old.target ? old.target.startAngle : 0;
                    var emptyRibbon = {
                        source: {
                            startAngle: sourceStartAngle,
                            endAngle: sourceStartAngle
                        },
                        target: {
                            startAngle: targetStartAngle,
                            endAngle: targetStartAngle
                        }
                    };
                    tween = d3.interpolate(emptyRibbon, d);
                }

                return function (t) {
                    return _svg.ribbonFn(tween(t));
                };
            };
        }

        /**
         * Highlights the specified segment.
         *
         * @method highlight
         * @memberOf adt.widgets.chordchart.ChordChart
         * @param {string} key Key of the segment to highlight.
         */
        this.highlight = function(key) {
            _w.utils.highlight(_svg, ".ribbon", key);
        };

        // Builder
        _w.render.build = function() {
            // Add widget
            _svg.g = _w.widget.append("g");

            // Add chord function
            _svg.chordFn = d3.chord()
                .padAngle(0.05)
                .sortGroups(d3.descending)
                .sortSubgroups(d3.descending);

            // Path builders
            _svg.arc = d3.arc();
            _svg.ribbonFn = d3.ribbon();

            // Label
            _svg.label = _svg.g.append("text")
                .attr("text-anchor", "middle")
                .attr("stroke-width", "0px")
                .style("fill", "white");
        };

        // Data updater
        _w.render.update = function(duration) {
            // Calculate radii
            var innerRadius = _w.attr.radius - _w.attr.thickness - _w.attr.margins.left,
                outerRadius = _w.attr.radius - _w.attr.margins.left;

            // Stop all ongoing transitions
            if (_svg.groups)
                _svg.groups.transition();
            if (_svg.newGroups)
                _svg.newGroups.transition();
            if (_svg.ribbons)
                _svg.ribbons.transition();
            if (_svg.newRibbons)
                _svg.newRibbons.transition();

            // Update chord data
            _svg.chord = _svg.chordFn(_data);

            // Set up color
            if (_w.attr.colors === null) {
                _w.attr.colors = _makeColors(_svg.chord.groups);
            }

            // Entering groups
            _svg.arc
                .innerRadius(innerRadius)
                .outerRadius(outerRadius);
            _svg.groups = _svg.g.selectAll(".group")
                .data(_svg.chord.groups, function (d) {
                    return d.index;
                });
            _svg.newGroups = _svg.groups
                .enter().append("g")
                .each(function(d){ d.name = _nameByIndex.get(d.index); })
                .attr("class", "group")
                .style("pointer-events", "all")
                .on("mouseover", function(d, i) {
                    if (_w.attr.mouseover) {
                        _w.attr.mouseover(d.name, i);
                    }
                })
                .on("mouseleave", function(d, i) {
                    if (_w.attr.mouseleave) {
                        _w.attr.mouseleave(d.name, i);
                    }
                });
            _svg.newGroups.append("path")
                .attr("id", function (d) {
                    return "group" + d.index;
                })
                .style("fill", function (d) {
                    return _w.attr.colors[d.name];
                })
                .transition().duration(duration)
                .attrTween("d", _arcTween(_prev_chord));
            if (_w.attr.ticks) {
                _svg.newGroups.append("text")
                    .attr("xlink:href", function (d) {
                        return "#group" + d.index;
                    })
                    .attr("dy", ".35em")
                    .text(function (d) {
                        return d.name;
                    })
                    .attr("transform", function (d) {
                        d.angle = (d.startAngle + d.endAngle) / 2;
                        return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")" +
                            " translate(" + (_w.attr.radius - _w.attr.margins.left + 5) + ")" +
                            (d.angle > Math.PI ? " rotate(180)" : " rotate(0)");
                    })
                    .attr("text-anchor", function (d) {
                        return d.angle > Math.PI ? "end" : "begin";
                    })
                    .style("font-size", _w.attr.fontSize * 0.6 + "px")
                    .style("font-weight", _w.attr.fontWeight)
                    .style("fill", _w.attr.fontColor);
            }

            // Exiting groups
            _svg.groups.exit()
                .transition().duration(duration)
                .style("opacity", 0)
                .remove();

            // Update groups
            _svg.groups.select("path")
                .each(function(d){ d.name = _nameByIndex.get(d.index); })
                .attr("d", _svg.arc)
                .transition().duration(duration)
                .style("fill", function (d) {
                    return _w.attr.colors[d.name];
                })
                .attrTween("d", _arcTween(_prev_chord));
            if (_w.attr.ticks) {
                _svg.groups.select("text")
                    .transition().duration(duration)
                    .attr("transform", function (d) {
                        d.angle = (d.startAngle + d.endAngle) / 2;
                        return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")" +
                            " translate(" + (_w.attr.radius - _w.attr.margins.left + 5) + ")" +
                            (d.angle > Math.PI ? " rotate(180)" : " rotate(0)");
                    })
                    .attr("text-anchor", function (d) {
                        return d.angle > Math.PI ? "end" : "begin";
                    });
            }

            // Entering ribbons
            _svg.ribbonFn
                .radius(innerRadius);
            _svg.ribbons = _svg.g.selectAll(".ribbon")
                .data(_svg.chord, _ribbonId);
            _svg.newRibbons = _svg.ribbons.enter().append("path")
                .each(function(d){
                    d.source.name = _nameByIndex.get(d.source.index);
                    d.target.name = _nameByIndex.get(d.target.index);
                })
                .attr("class", function(d) {
                    return "ribbon " + _w.utils.encode(d.source.name);
                })
                .style("pointer-events", "all")
                .style("fill", function (d) {
                    return _w.attr.colors[_w.attr.invert ? d.source.name : d.target.name];
                })
                .style("stroke-width", "1px")
                .style("stroke", "white");
            _svg.newRibbons
                .transition().duration(duration)
                .attrTween("d", _ribbonTween(null));

            // Exiting ribbons
            _svg.ribbons.exit()
                .transition().duration(duration)
                .style("opacity", 0)
                .remove();

            // Update ribbons
            _svg.ribbons
                .each(function(d){
                    d.source.name = _nameByIndex.get(d.source.index);
                    d.target.name = _nameByIndex.get(d.target.index);
                })
                .attr("class", function(d) {
                    return "ribbon " + _w.utils.encode(d.source.name);
                })
                .transition().duration(duration)
                .style("fill", function (d) {
                    return _w.attr.colors[_w.attr.invert ? d.source.name : d.target.name];
                })
                .attrTween("d", _ribbonTween(_prev_chord));

            // Update previous chord
            _prev_chord = _svg.chord;
        };

        // Style updater
        _w.render.style = function() {
            // Widget
            _w.widget
                .style("width", 2*_w.attr.radius + "px")
                .style("height", 2*_w.attr.radius + "px");

            // Chart
            _svg.g
                .attr("transform", "translate(" + _w.attr.radius
                    + "," + _w.attr.radius + ")");

            // Label
            _svg.label
                .attr("transform", "translate(0," + (15 + _w.attr.radius + _w.attr.thickness) + ")")
                .style("width", 2*(_w.attr.radius + _w.attr.thickness) + "px")
                .attr("font-size", _w.attr.fontSize + "px")
                .style("fill", _w.attr.fontColor)
                .text(_w.attr.xLabel);
        };
    }

    // Export
    ChordChart.prototype = Object.create(Widget.prototype);
    return ChordChart;
}));