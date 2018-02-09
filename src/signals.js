/**
 * Module for managing event subscriptions and emissions.
 * Part of the Analytics Dashboard Tools.
 *
 * <br><br>Callbacks can be subscribed to signals and when an event of that signal is triggered,
 * all subscribed callbacks are called.
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
 * @module signals
 * @memberOf adt
 */
(function (global, factory) {
    if (typeof exports === "object" && typeof module !== "undefined") {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define(['exports'], factory);
    } else {
        global.adt = global.adt || {};
        global.adt.signals = factory();
    }
} (this, function () {
    "use strict";

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

    // Exports
    return {
        subscribe: subscribe,
        emit: emit
    };
}));