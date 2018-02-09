/**
 * Module implementing various data structures and data manipulation methods.
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
 * @module data
 * @memberOf adt
 * @requires lodash@4.17.4
 */
(function (global, factory) {
    if (typeof exports === "object" && typeof module !== "undefined") {
        module.exports = factory(require('lodash'), exports);
    } else if (typeof define === 'function' && define.amd) {
        define(['_', 'exports'], factory);
    } else {
        global.adt = global.adt || {};
        global.adt.data = factory(global._);
    }
} (this, function (_) {
    "use strict";

    /**
     * Collection of string and number formatting methods.
     *
     * @namespace format
     * @memberOf adt.data
     */
    var format = {
        /**
         * Formats a number using SI prefixes.
         *
         * @method si
         * @memberOf adt.data.format
         * @param {number} x Number to format.
         * @returns {string} Number formatted with SI prefixes if valid, 'N/A' otherwise.
         */
        si: (function () {
            var _prefixes = "yzafpnμm kMGTPEZY";
            var _bMid = (_prefixes.length - 1) / 2;
            var _bMax = _bMid;
            var _bMin = -_bMid;

            function _si(x) {
                // Number is invalid
                if (x === null || x === undefined || isNaN(x))
                    return "N/A";

                // If zero, just do nothing
                if (x === 0)
                    return "0";

                // Get absolute value, order and shown digit
                var a = Math.abs(x);
                var b = Math.max(
                    Math.min(
                        parseInt(Math.floor(Math.log(a) / Math.log(1000))),
                        _bMax
                    ), _bMin
                );
                var d = a / Math.pow(1000, b);

                // Return formatted number
                return (x < 0 ? "-" : "")
                    + (b === _bMin || b === _bMax ? d.toExponential(2) : d.toPrecision(3)).replace(/e\+0$/, '')
                    + _prefixes.charAt(_bMid + b).trim();
            }

            return _si;
        })(),

        /**
         * Converts a name into a valid identifier.
         *
         * @method idfy
         * @memberOf adt.data.format
         * @param {string} name Name to convert.
         * @returns {string} The converted ID.
         */
        idfy: function(name) {
            return name ? name.replace(/ /g, '__') : "";
        },

        /**
         * Converts an identifier back into a name.
         *
         * @method namify
         * @memberOf adt.data.format
         * @param {string} id Identifier to convert.
         * @returns {string} Converted name.
         */
        namify: function(id) {
            return id ? id.replace(/__/g, ' ') : "";
        }
    };

    /**
     * Namespace for manipulating the content of a CSV file .
     *
     * @namespace explore
     * @memberOf adt.data
     */
    var explore ={
        /**
         * Calculates the sum of a column grouped by some segments.
         * Returns the sorted rows in descending order.
         *
         * @method sum
         * @memberOf adt.data.explore
         * @param {Array} data Array of data to calculate sum for. Content of a CSV file.
         * @param {(number|string)} column Column index or name of the column to sum.
         * @param {(number|string|Array)} segments Single index/name of the columns to group by or an array of column
         * indices/names.
         * @returns {Array} Sorted rows of sums with keys of the unique segment column names/ids separated by '.'.
         */
        sum: function(data, column, segments) {
            var sums = {};
            var segmentCols = [];
            if (Array.isArray(segments)) {
                segmentCols = segments;
            } else {
                segmentCols = [segments];
            }
            var nCols = segmentCols.length;
            data.forEach(function(d) {
                // Make key
                var key = [];
                segmentCols.forEach(function(s) {
                    if (d.hasOwnProperty(s)) {
                        key.push(d[s]);
                    }
                });
                if (key.length !== nCols)
                    return;
                var keyStr = key.join('.');

                // Aggregate data
                if (!sums.hasOwnProperty(keyStr))
                    sums[keyStr] = +d[column];
                else
                    sums[keyStr] += +d[column];
            });

            // Convert into an array
            var res = [];
            _.forOwn(sums, function(v, k) {
                res.push({key: k, value: v});
            });

            // Return sorted values
            return res.sort(function(a, b) {
                return b.value - a.value;
            });
        }
    };

    /**
     * Collection of smart data structures.
     *
     * @namespace structures
     * @memberOf adt.data
     */
    var structures = {
        /**
         * Class representing a histogram. A histogram is an array of (value, frequency) pairs.
         *
         * @class Histogram
         * @memberOf adt.data.structures
         * @param {Array} data Array to initialize histogram with.
         * @constructor
         */
        Histogram: function(data) {
            /**
             * The histogram data.
             *
             * @var {Array} _data
             * @memberOf adt.data.structures.Histogram
             * @private
             */
            var _data = data ? data : [];

            /**
             * Assigns histogram data to the passed Array.
             *
             * @method set
             * @memberOf adt.data.structures.Histogram
             * @param {Array} data Array containing {x: number, y: number} objects.
             * @returns {adt.data.structures.Histogram} Reference to the current histogram.
             */
            this.set = function(data) {
                _data = data;
                return this;
            };

            /**
             * Returns a copy of the underlying histogram data.
             *
             * @method get
             * @memberOf adt.data.structures.Histogram
             * @returns {Array} The histogram data.
             */
            function get() {
                return _.cloneDeep(_data);
            }

            /**
             * Adds an (x, y) pair to the histogram.
             * The new data point is added to the tail of the histogram.
             *
             * @method add
             * @memberOf adt.data.structures.Histogram
             * @param {number} x Value of the data point.
             * @param {number} y Frequency of the data point.
             * @returns {adt.data.structures.Histogram} Reference to the current histogram.
             */
            function add(x, y) {
                _data.push({x: x, y: y, index: _data.length});
                return this;
            }

            /**
             * Multiplies  all frequencies by the specified factor.
             *
             * @method scale
             * @memberOf adt.data.structures.Histogram
             * @param {number} factor Multiplying factor.
             * @returns {adt.data.structures.Histogram} Reference to the current histogram.
             */
            function scale(factor) {
                _data.forEach(function(d) {
                    d.y *= factor;
                });
                return this;
            }

            /**
             * Normalizes histogram to have a sum of frequencies equal to unit.
             *
             * @method normalize
             * @memberOf adt.data.structures.Histogram
             * @returns {adt.data.structures.Histogram} Reference to the current histogram.
             */
            function normalize() {
                var s = d3.sum(_data, function (d) {
                    return d.y;
                });
                _data.forEach(function(d) {
                    d.y /= s;
                });
                return this;
            }

            /**
             * Sorts histogram by its values.
             *
             * @method sortByX
             * @memberOf adt.data.structures.Histogram
             * @param {boolean} descending Whether histogram should be sorted in descending instead of ascending order.
             * @returns {adt.data.structures.Histogram} Reference to the current histogram.
             */
            function sortByX(descending) {
                _data.sort(function(a, b) {
                    return descending ? b.x - a.x : a.x - b.x;
                });
                return this;
            }

            /**
             * Sorts histogram by its frequencies.
             *
             * @method sortByY
             * @memberOf adt.data.structures.Histogram
             * @param {boolean} descending Whether histogram should be sorted in descending instead of ascending order.
             * @returns {adt.data.structures.Histogram} Reference to the current histogram.
             */
            function sortByY(descending) {
                _data.sort(function(a, b) {
                    return descending ? b.y - a.y : a.y - b.y;
                });
                return this;
            }

            /**
             * Restores original order of the histogram data.
             *
             * @method unsort
             * @memberOf adt.data.structures.Histogram
             * @returns {adt.data.structures.Histogram} Reference to the current histogram.
             */
            function unsort() {
                _data.sort(function(a, b) {
                    return a.index - b.index;
                });
                return this;
            }

            // Public methods
            return {
                set: set,
                get: get,
                add: add,
                scale: scale,
                normalize: normalize,
                sortByX: sortByX,
                sortByY: sortByY,
                unsort: unsort
            };
        },

        /**
         * Data structure representing historical data.
         * Each data point is a (x, y) pair where y values are dates, y values are objects containing multiple
         * dimensions.
         *
         * @class TimeSeries
         * @memberOf adt.data.structures
         * @param {Array} dimensions Array of keys for the different y values.
         * @constructor
         */
        TimeSeries: function(dimensions) {
            /**
             * The actual historical data.
             * Initialized to an empty array.
             *
             * @var {Array} _data
             * @memberOf adt.data.structures.TimeSeries
             * @private
             */
            var _data = [];

            /**
             * Clears history and re-allocates it based on the starting time.
             *
             * @method clear
             * @memberOf adt.data.structures.TimeSeries
             * @param {Date} start Start time of the history.
             * @returns {adt.data.structures.TimeSeries} Reference to the current history.
             */
            function clear(start) {
                _data = [];
                var i = 0;
                if (start !== null) {
                    var t = new Date(start);
                    while (t <= new Date()) {
                        _data.push({x: new Date(t), y: {}});
                        dimensions.forEach(function(d) {
                            _data[i].y[d] = 0;
                        });
                        t.setDate(t.getDate() + 1);
                        i++;
                    }
                }
                return this;
            }

            /**
             * Updates history at a specific point.
             *
             * @method update
             * @memberOf adt.data.structures.TimeSeries
             * @param {number} idx Temporal id of the data.
             * @param {Date} x Temporal value of the data.
             * @param {string} idy Y id of the data.
             * @param {number} y Y value of the data.
             * @returns {adt.data.structures.TimeSeries} Reference to the current history.
             */
            function update(idx, x, idy, y) {
                _data[idx].x = x;
                _data[idx].y[idy] += y;
            }

            /**
             * Returns a sub history cut from the end.
             *
             * @method sub
             * @memberOf adt.data.structures.TimeSeries
             * @param {number=} length Length of the sub history to cut. If not specified, the total history is returned.
             * @param {number=} offset Offset measured from the end of the history. If not specified, 0 is used.
             * @returns {Array} The sliced history array.
             */
            function sub(length, offset) {
                if (!length)
                    return _data;
                else {
                    var o = offset ? offset : 0;
                    return _data.slice(-o-length, -o);
                }
            }

            /**
             * Returns the sum of the last several bins.
             *
             * @method sum
             * @memberOf adt.data.structures.TimeSeries
             * @param {number=} length Number of bins to take sum over. If not specified, the last element is returned.
             * @param {number=} offset Offset measured from the end of the history. If not specified, 0 is used.
             * @returns {object} Object containing the sum for each y dimension.
             */
            function sum(length, offset) {
                if (_data.length < 1)
                    return {};

                var count = {};
                _.forOwn(_data[0].y, function(di, d) {
                    count[d] = 0;
                });
                sub(length ? length : 1, offset).forEach(function(h) {
                    _.forOwn(_data[0].y, function(di, d) {
                        count[d] += h.y[d];
                    });
                });
                return count;
            }

            /**
             * Calculates the peak level in the specified slice of history.
             *
             * @method peak
             * @memberOf adt.data.structures.TimeSeries
             * @param {number=} length Number of bins to calculate peak over. If not specified, the entire history is
             * considered.
             * @param {number=} offset Offset measured from the end of the history. If not specified, 0 is used.
             * @returns {number} Peak level in the last n bins.
             */
            function peak(length, offset) {
                var p = 0;
                if (_data.length > 0) {
                    var history = sub(length, offset);
                    _.forOwn(_data[0].y, function(di, d) {
                        p = Math.max(d3.max(history, function(h) {
                            return h.y.hasOwnProperty(d) ? h.y[d] : 0;
                        }), p);
                    });
                }
                return p;
            }

            /**
             * Calculates the trend in the last two bins.
             * The trend is simply the change from the bin before last and the last one.
             *
             * @method trend
             * @memberOf adt.data.structures.TimeSeries
             * @returns {object} Object containing the relative changes for each y dimensions.
             */
            function trend(offset) {
                if (_data.length < 1)
                    return {};

                var last = sum(1, offset);
                var prev = sum(2, offset);
                var trend = {};
                _.forOwn(_data[0].y, function(di, d) {
                    prev[d] -= last[d];
                    if (prev[d] >= 10 && last[d] > 0) {
                        trend[d] = (last[d] - prev[d]) / prev[d];
                    }
                });
                return trend;
            }

            /**
             * Returns a distribution of y values in the specified interval.
             *
             * @method yDist
             * @memberOf adt.data.structures.TimeSeries
             * @param {number=} length Number of bins to calculate distribution over. If not specified, the entire history is
             * considered.
             * @param {number=} offset Offset measured from the end of the history. If not specified, 0 is used.
             * @returns {object} Object containing the relative frequency of y dimensions.
             */
            function yDist(length, offset) {
                var counts = sum(length, offset);
                var total = 0;
                _.forOwn(counts, function(c) {
                    total += c;
                });
                _.forOwn(counts, function(c, i) {
                    counts[i] /= total > 0 ? total : 1;
                });
                return counts;
            }

            // Public methods
            return {
                clear: clear,
                update: update,
                sub: sub,
                sum: sum,
                peak: peak,
                trend: trend,
                yDist: yDist
            };
        },

        /**
         * Data structure representing a data in a tabular form.
         * Tables can be segmented, grouped, etc.
         *
         * @class Table
         * @memberOf adt.data.structures
         * @param {Array=} data Array of objects to initialize table with. Each element in the array is a row, and
         * each column must be present in every row as a property.
         * @constructor
         */
        Table: function(data) {
            /**
             * Content of the table.
             *
             * @var {Array} _data
             * @memberOf adt.data.structures.Table
             * @private
             */
            var _data = [];

            /**
             * Table row indices.
             *
             * @var {Array} _index
             * @memberOf adt.data.structures.Table
             * @private
             */
            var _index = [];

            // Initialize data and index
            if (data) {
                _data = _.cloneDeep(data);
                _data.forEach(function(d, i) {
                    _index.push(i);
                });
            }

            /**
             * Creates a low dimension data set by slicing the table.
             * The result is an array that can be used by the chart widgets.
             *
             * @method slice
             * @memberOf adt.data.structures.Table
             * @param {string} x Column for the X values.
             * @param {(string|Array)} y Column or array of columns for the Y values.
             * @returns {Array} Array of {x, y} data points for using in charts.
             */
            function slice(x, y) {
                var slicedData = [];
                _data.forEach(function(d) {
                    var yRow;
                    if (typeof y === "string") {
                        yRow = d[y];
                    } else {
                        yRow = {};
                        y.forEach(function(yi) {
                            yRow[yi] = d[yi];
                        });
                    }
                    slicedData.push({
                        x: d[x], y: yRow
                    });
                });
                return slicedData;
            }

            /**
             * Segments the table by a column value. If value is a number, all rows are included within a 10% of
             * error of the distance between the closest row and the specified value.
             *
             * @method segment
             * @memberOf adt.data.structures.Table
             * @param {string} column Column to segment table by.
             * @param {(string|number)} value Value to use for segmentation.
             * @returns {adt.data.structures.Table} The segmented table.
             */
            function segment(column, value) {
                // Create segmented table data
                var segmentedData = null;
                switch (typeof value) {
                    case "number":
                        // Init distances
                        var dist = d3.min(_data, function(d) {
                            return Math.abs((value - d[column]) / value);
                        });

                        // Segment is a number: filter by relative difference
                        segmentedData = _data.filter(function(d) {
                            return Math.abs((d[column] - value) / value) <= dist*1.01;
                        });
                        break;
                    case "string":
                    default:
                        // Segment is a string, filter by exact match
                        segmentedData = _data.filter(function(d) {
                            return d[column] === value;
                        });
                }

                // Return new table
                return new adt.data.structures.Table(segmentedData);
            }

            /**
             * Sorts the table by a column.
             *
             * @method sort
             * @memberOf adt.data.structures.Table
             * @param {number} column Column to sort table by.
             * @returns {adt.data.structures.Table} The segmented table.
             */
            function sort(column) {
                _data.sort(function(a, b) {
                    return a[column] - b[column];
                });
                return this;
            }

            /**
             * Reverses any sorting previously performed on the table.
             *
             * @method unsort
             * @memberOf adt.data.structures.Table
             */
            function unsort() {
                var unsortedData = [];
                _index.forEach(function(i) {
                    unsortedData.push(_data[i]);
                });
                _data = unsortedData;
            }

            // Public methods
            return {
                slice: slice,
                segment: segment,
                sort: sort,
                unsort: unsort
            };
        }
    };

    // Exports
    return {
        format: format,
        explore: explore,
        structures: structures
    };
}));
