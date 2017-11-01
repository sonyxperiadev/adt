/**
 * Module implementing various statistical methods.
 * Part of the Analytics Dashboard Tools.
 *
 * @copyright Copyright (C) 2017 Sony Mobile Communications AB.
 * All rights, including trade secret rights, reserved.
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