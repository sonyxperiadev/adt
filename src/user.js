/**
 * Module for managing user interactions.
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
 * @module user
 * @memberOf adt
 * @requires d3@v4
 */
(function (global, factory) {
    if (typeof exports === "object" && typeof module !== "undefined") {
        module.exports = factory(require('d3'));
    } else if (typeof define === 'function' && define.amd) {
        define(['d3', 'exports'], factory);
    } else {
        global.adt = global.adt || {};
        global.adt.user = factory(global.d3);
    }
} (this, function (d3) {
    "use strict";

    /**
     * Class representing a cheat code, that is, a lowercase string that once is typed in, triggers an event.
     *
     * @class CheatCode
     * @memberOf adt.user
     * @private
     */
    var CheatCode = (function() {
        /**
         * Array of available codes.
         *
         * @var {Array} codes
         * @memberOf adt.user.CheatCode
         * @private
         */
        var _codes = [];

        // Bind key listener to body
        window.addEventListener("load", function() {
            try {
                d3.select("body")
                .on("keydown", function () {
                    // Get key
                    var char = String.fromCharCode(d3.event.keyCode);
                    if (!char)
                        return;

                    // Check each cheat
                    for (var i = 0; i < _codes.length; i++) {
                        // If a cheat is activated, reset all other
                        if (_codes[i]._check(char)) {
                            _codes.forEach(function (c) {
                                c._reset();
                            });
                            break;
                        }
                    }
                });
            } catch (e) {
                console.error("No DOM, could not attach event listener");
            }
        });


        /**
         * Class implementing the cheat code.
         *
         * @class CheatCode
         * @memberOf adt.user.CheatCode
         * @param {string} code Code to type in order to trigger cheat.
         * @param {function} cheat Callback to perform once the code is entered.
         * @constructor
         * @private
         */
        function _CheatCode(code, cheat) {
            // Add cheat code to the container.
            _codes.push(this);

            /**
             * The cheat code in lowercase.
             *
             * @var {string} _code
             * @memberOf adt.user.CheatCode._CheatCode
             * @private
             */
            var _code = code.toLowerCase();

            /**
             * Index of the current character in the cheat code.
             * Once this reaches the length of the cheat code, the cheat is triggered.
             *
             * @var {number} _index
             * @memberOf adt.user.CheatCode._CheatCode
             * @private
             */
            this._index = 0;

            /**
             * Resets index to start.
             *
             * @method reset
             * @memberOf adt.user.CheatCode._CheatCode
             * @private
             */
            this._reset = function () {
                this._index = 0;
            };

            /**
             * Checks if pressed key is the next in code. If code is completely entered, cheat is called.
             *
             * @method check
             * @memberOf adt.user.CheatCode._CheatCode
             * @param {string} char Key pressed.
             * @returns {boolean} True if code typed completely, false otherwise.
             * @private
             */
            this._check = function (char) {
                if (char.toLowerCase() === _code.charAt(this._index)) {
                    this._index++;
                } else {
                    // Otherwise, just reset index.
                    this._index = 0;
                }

                // If we reached the end of the code, call cheat.
                if (this._index === _code.length) {
                    // Perform cheat.
                    cheat();
                    return true;
                }
                return false;
            };
        }

        return _CheatCode;
    })();

    /**
     * Milliseconds elapsed from the last observed user interaction.
     * Initialized to 0.
     *
     * @var {number} idle
     * @memberOf adt.user
     * @private
     */
    var _idle = 0;

    // Some initialization:
    // - increment _idle every 10 seconds
    // - bind mousemove listener to <body>, which resets counter
    setInterval(function() {
        _idle += 10000;
    }, 10000);
    window.addEventListener("load", function() {
        try {
            d3.select("body")
                .on("mousemove", function () {
                    _idle = 0;
                });
        } catch (e) {
            console.error("No DOM, could not attach event listener");
        }
    });

    /**
     * Adds an idle action, that is, a callback function that is triggered once the user have not interacted
     * with the page for some time.
     *
     * @method idle
     * @memberOf adt.user
     * @param {number} period Time duration between consecutive calls.
     * @param {function} action Action to trigger once the waiting time elapsed.
     */
    function idle(period, action) {
        setInterval(function() {
            if (_idle > period) {
                action();
            }
        }, period);
    }

    /**
     * Triggers a callback once the browser tab of the dashboard is out of focus.
     *
     * @method leave
     * @memberOf adt.user
     * @param {function} callback Callback to call when browser tab is out of focus.
     */
    function leave(callback) {
        window.onblur = callback;
    }

    /**
     * Triggers a callback once the browser tab of the dashboard is in focus.
     *
     * @method enter
     * @memberOf adt.user
     * @param {function} callback Callback to call when browser tab is in focus.
     */
    function enter(callback) {
        window.onfocus = callback;
    }

    /**
     * Enables user interactions by removing the pointer-event restriction on <body>.
     *
     * @method enable
     * @memberOf adt.user
     */
    function enable() {
        d3.select("svg")
            .style("pointer-events", null);
    }

    /**
     * Disables user interaction by setting pointer-events to none on <body>.
     *
     * @method disable
     * @memberOf adt.user
     */
    function disable() {
        try {
            d3.select("svg")
                .style("pointer-events", "none");
        } catch (e) {
            console.error("No DOM, could not attach event listener");
        }
    }

    /**
     * Namespace for cheat codes that trigger some events.
     *
     * @namespace cheats
     * @memberOf adt.user
     */
    var cheats = {
        /**
         * Adds a single Easter egg. An Ester egg is a one-time irreversible cheat. Once activated, it will be persistent
         * until page reload.
         *
         * @method egg
         * @memberOf adt.user.cheats
         * @param {string} name Code to activate egg with.
         * @param {function} cheat Cheat to call once activated.
         */
        egg: function (name, cheat) {
            new CheatCode(name, cheat);
        },

        /**
         * Adds a feature. A feature is a cheat that can be enabled/disabled.
         * To enable the feature type the code name starting with "enable".
         * To disable the feature, type the code name starting with "disable".
         *
         * @method feature
         * @memberOf adt.user.cheats
         * @param {string} name Name of the feature. Code to activate is enable+<name>, code to deactivate is
         * disable+<name>.
         * @param {function} enable Callback once feature is enabled.
         * @param {function} disable Callback once feature is disabled.
         */
        feature: function (name, enable, disable) {
            new CheatCode("enable" + name, enable);
            new CheatCode("disable" + name, disable);
        }
    };

    // Return public methods
    return {
        enable: enable,
        disable: disable,
        idle: idle,
        leave: leave,
        enter: enter,
        cheats: cheats
    };
}));