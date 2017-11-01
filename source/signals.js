/**
 * Module for managing event subscriptions and emissions.
 * Part of the Analytics Dashboard Tools.
 *
 * <br><br>Callbacks can be subscribed to signals and when an event of that signal is triggered,
 * all subscribed callbacks are called.
 *
 * @copyright Copyright (C) 2017 Sony Mobile Communications AB.
 * All rights, including trade secret rights, reserved.
 * @author Enys Mones (enys.mones@sony.com)
 * @module signals
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

    exports.signals = (function() {
        /**
         * The list of signal subscriptions.
         * Contains a list of functions for each added signal.
         *
         * @var {object} _subscriptions
         * @memberOf adt.signals
         * @private
         */
        var _subscriptions = {};

        /**
         * Adds a single callback to a signal. If the signal does not exist yet, it is also created.
         *
         * @method _add
         * @memberOf adt.signals
         * @param {string} signal Identifier of the signal to add callback to.
         * @param {function} callback The callback to append to signal list.
         * @private
         */
        function _add(signal, callback) {
            // Add signal to subscriptions
            if (!_subscriptions.hasOwnProperty(signal))
                _subscriptions[signal] = [];

            // Check if callback is added already
            for (var i=0; i<_subscriptions[signal].length; i++) {
                if (_subscriptions[signal][i] === callback) {
                    return;
                }
            }

            // Add callback
            _subscriptions[signal].push(callback);
        }

        /**
         * Subscribes a callback to one or multiple signal lists.
         * If the signal does not exists yet, it is created as well.
         *
         * @method subscribe
         * @memberOf adt.signals
         * @param {(string|Array)} signals Single signal identifier or an array of signal identifiers.
         * @param {function} callback Callback to subscribe to signal list(s).
         */
        function subscribe(signals, callback) {
            if (typeof signals === "string") {
                _add(signals, callback);
            } else {
                if (signals.constructor === Array) {
                    for (var i=0; i< signals.length; i++) {
                        _add(signals[i], callback);
                    }
                }
            }
        }

        /**
         * Emits a signal and calls all subscribed callbacks.
         *
         * @method emit
         * @memberOf adt.signals
         * @param {string} signal Identifier of the signal to emit.
         * @param {object=} args Arguments to pass to the triggered callbacks.
         */
        function emit(signal, args) {
            var list = _subscriptions[signal];
            if (list !== undefined && list !== null && list.length > 0) {
                for (var i=0; i<list.length; i++) {
                    list[i](args);
                }
            }
        }

        // Public methods
        return {
            subscribe: subscribe,
            emit: emit
        };
    })();
})));