/**
 * Module implementing various statistical methods.
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
 * @module ml
 * @memberOf adt
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

    // Add system module if not exists
    if (!exports.ml) exports.ml = {};

    exports.ml = (function() {
        // TODO implement loess
        // TODO implement STL
        // TODO implement ESD

        /**
         * Performs anomaly detection using a variant of the Seasonal ESD used by Twitter.
         * Suitable for time series data.
         * Sources:
         *  https://arxiv.org/pdf/1704.07706.pdf
         *  https://www.wessa.net/download/stl.pdf
         *
         * @method anomalies
         * @memberOf adt.ml
         * @param {Array} data Array containing {x: number, y: number} objects of the time series data.
         * @returns {object} Object containing two arrays of data points that were detected as local/global anomalies.
         */
        function anomalies(data){
            // TODO calculate STL
            // TODO find global anomalies by removing trend only
            // TODO find local anomalies by removing trend and season
        }

        // Public methods
        return {
            anomalies: anomalies
        };
    })();
})));