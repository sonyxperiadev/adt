/**
 * Module for managing version checking and version updates.
 * Part of the Analytics Dashboard Tools.
 *
 * Version update is done by regularly checking the current version of the app (stored in the HTML5 local storage)
 * against a file that contains the latest version number. This requires a version file to be updated on version
 * update. The version file is a JSON with a single key 'version' and the version code in major.minor.patch
 * string format. Default path to the version file is 'data/version.json'.
 *
 * On first call, the constructor checks for version update right away.
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
 * @module system.version
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
    if (!exports.system) exports.system = {};

    // The module itself
    exports.system.version = (function(){
        /**
         * Path to the version file to update.
         *
         * @var {string} _VERSION_FILE
         * @memberOf adt.version
         * @private
         */
        var _VERSION_FILE = "data/version.json";

        /**
         * Key for the local storage to save/load current browser version.
         *
         * @var {string} _VERSION_KEY
         * @memberOf adt.version
         * @private
         */
        var _VERSION_KEY = "adt-version";

        /**
         * To check if we have regular checks turned on.
         *
         * @var {boolean} _REGULAR_ON
         * @memberOf adt.version
         * @private
         */
        var _REGULAR_ON = false;

        /**
         * Parses a version code.
         * If version code is invalid, it returns 0.0.1.
         *
         * @method parse
         * @memberOf adt.system.version
         * @param {string} version Version code to parse.
         * @returns {{major: number, minor: number, patch: number}} Object containing the major, minor and patch
         * numbers.
         * @private
         */
        function _parse(version) {
            // Invalid version code
            if (typeof version !== "string") {
                return {major: 0, minor: 0, patch: 1};
            }

            // Valid version code
            var v = version.split(".");
            return {
                major: v.length > 0 ? +v[0] : 0,
                minor: v.length > 1 ? +v[1] : 0,
                patch: v.length > 2 ? +v[2] : 1
            };
        }

        /**
         * Compares two version codes.
         * The new version is higher than the old one if:
         * - major number is higher
         * - major number is equal and minor number is higher
         * - major and minor numbers are equal but patch number is higher
         *
         * @method compare
         * @memberOf adt.system.version
         * @param {string} newVersion New (latest) version code.
         * @param {string} oldVersion Old (current) version code.
         * @returns {boolean} True if new version is higher than old one, false otherwise.
         * @private
         */
        function _compare(newVersion, oldVersion) {
            var v0 = _parse(oldVersion),
                v1 = _parse(newVersion);
            return v1.major > v0.major
                || (v1.major === v0.major && v1.minor > v0.minor)
                || (v1.major === v0.major && v1.minor === v0.minor && v1.patch > v0.patch);
        }

        /**
         * Sets the version resource file.
         *
         * @method file
         * @memberOf adt.system.version
         * @param {string} path Path to the version file.
         */
        function file(path) {
            _VERSION_FILE = path;
        }

        /**
         * Checks latest version and updates page if it is higher than current version.
         * If no version file is found, 0.0.1 is used (lowest possible).
         * Also, if delay is specified, regular check for version update is enabled.
         *
         * @method check
         * @memberOf adt.system.version
         * @param {function=} onUpdate Callback to perform on version update. The function must accept two parameters:
         * latest and current for the latest and current version numbers.
         * @param {boolean=} regular Turns on regular checks for version updates around every 30 minutes.
         */
        function check(onUpdate, regular) {
            // Get latest version, set 0.0.1 as default
            var latestVersion = "0.0.1";
            d3.json(_VERSION_FILE, function (error, json) {
                if (!error
                    && json.hasOwnProperty('version')
                    && typeof json.version === "string") {
                    latestVersion = json.version;
                }

                // Get current version
                var currentVersion = localStorage.getItem(_VERSION_KEY);
                if (currentVersion === null) currentVersion = "0.0.1";

                // Check current against latest
                if (_compare(latestVersion, currentVersion)) {
                    localStorage.setItem(_VERSION_KEY, latestVersion);
                    if (onUpdate) onUpdate(latestVersion, currentVersion);
                }
            });

            // Turn on regular if delay is specified
            if (regular && !_REGULAR_ON) {
                _REGULAR_ON = true;
                setInterval(function() {
                    check(onUpdate, false);
                }, 1810001);
            }
        }

        /**
         * Returns the current version.
         * If version is not yet set in local storage, it is initialized to 0.0.1.
         *
         * @method current
         * @memberOf adt.system.version
         * @returns {string} Current version in string format.
         */
        function current() {
            var version = localStorage.getItem(_VERSION_KEY);
            if (version === null) {
                version = "0.0.1";
                localStorage.setItem(_VERSION_KEY, version);
            }
            return version;
        }
        current();

        // Public methods
        return {
            file: file,
            current: current,
            check: check
        };
    })();
})));