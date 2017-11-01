/**
 * Module for making queries to a REST API.
 * Part of the Analytics Dashboard Tools.
 *
 * @copyright Copyright (C) 2017 Sony Mobile Communications AB.
 * All rights, including trade secret rights, reserved.
 * @author Enys Mones (enys.mones@sony.com)
 * @module rest
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

    /**
     * Class representing an access point to a REST API.
     * Endpoint URL, database and table must be set at object construction and cannot be changed later on.
     * This is to ensure that one {Rest} object connects to a single table.
     *
     * @class REST
     * @memberOf adt.rest
     * @param {string} endpoint Endpoint of the REST API.
     * @param {string} database Database to use.
     * @param {string} table Table name.
     * @constructor
     */
    exports.REST = function(endpoint, database, table) {
        /**
         * Performs a query to the connected table.
         *
         * @method _query
         * @memberOf adt.rest.REST
         * @param {object=} params Object containing the parameters of the query.
         * @param {function} exec Function to call in order to execute the query.
         * @param {function=} onSuccess Callback to perform if the query was successful. Must accept the response
         * content of the query.
         * @param {function=} onFailure Callback to perform if the query has failed. Must accept the error response.
         * @param {object=} settings Optional settings before sending (e.g., for CORS).
         * @private
         */
        function _query(params, exec, onSuccess, onFailure, settings) {
            // Build query URL
            var url = endpoint + "/" + database + "/" + table;

            // Get parameter keys
            var keys = d3.keys(params).sort();

            // Add first parameters
            if (keys.length > 0) {
                url += "?" + keys[0] + "=" + params[keys[0]];
            }
            // Add remaining parameters
            for (var i=1; i<keys.length; i++) {
                url += "&" + keys[i] + "=" + params[keys[i]];
            }

            // Perform query
            exec(url)
            .on("beforesend", function (request) {
                if (settings) {
                    for (var key in settings) {
                        if (request.hasOwnProperty(key))
                            request[key] = settings[key];
                    }
                }
            })
            .get(function(error, data) {
                if (error) {
                    if (onFailure)
                        onFailure(error);
                    return;
                }

                if (onSuccess)
                    onSuccess(data);
            });
        }

        /**
         * Performs a query to a REST API that is expected to return a JSON file.
         *
         * @method json
         * @memberOf adt.rest.REST
         * @param {object} params Object containing the parameters of the query.
         * @param {function=} onSuccess Callback to perform if the query was successful. Must accept the JSON response
         * of the query.
         * @param {function=} onFailure Callback to perform if the query has failed. Must accept the error response.
         * @param {boolean=} settings Optional settings before sending (e.g., for CORS).
         */
        function json(params, onSuccess, onFailure, settings) {
            _query(params, d3.json, onSuccess, onFailure, settings);
        }

        /**
         * Performs a query to a REST API that is expected to return a CSV file.
         *
         * @method csv
         * @memberOf adt.rest.REST
         * @param {object} params Object containing the parameters of the query.
         * @param {function=} onSuccess Callback to perform if the query was successful. Must accept the CSV response
         * of the query.
         * @param {function=} onFailure Callback to perform if the query has failed. Must accept the error response.
         * @param {boolean=} settings Optional settings before sending (e.g., for CORS).
         */
        function csv(params, onSuccess, onFailure, settings) {
            _query(params, d3.csv, onSuccess, onFailure, settings);
        }

        // Public methods
        return {
            json: json,
            csv: csv
        };
    };
})));
