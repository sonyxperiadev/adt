/**
 * Module that generates code blocks from script content.
 *
 * @module codifyjs
 * @author Enys Mones
 *
 */
(function (global, factory) {
    if (typeof exports === "object" && typeof module !== "undefined") {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define(['exports'], factory);
    } else {
        global.codeDoc = factory();
    }
} (this, function () {
    "use strict";

    /**
     * Class for the script tags to copy code from.
     * Default is 'doc'.
     *
     * @var {string} _from
     * @memberOf
     * @private
     */
    var _from = ".doc";

    /**
     * Id of the container element for the code blocks.
     * Default is 'code-doc'.
     *
     * @var {string} _into
     * @private
     */
    var _into = "code-doc";

    /**
     * Callback to trigger once the code is generated.
     * Default is null.
     *
     * @var {(null|Function)} _callback.
     * @private
     */
    var _callback = null;

    /**
     * Sets callback function.
     *
     * @param cb {Function} Function to set callback to.
     */
    function callback(cb) {
        _callback = cb;
    }

    /**
     * Copies the code from selected script tags into code blocks in DOM.
     * Each code has to start with a comment that is used as heading for the code block.
     */
    function copy() {
        if (typeof document !== undefined) {
            // Clear container
            document.getElementById(_into).innerHTML = "";

            // Copy code
            document.body.querySelectorAll("script" + _from).forEach(function (script) {
                // Read content
                var lines = script.innerHTML.trim().split('\n');
                var title = lines[0].substring(3);
                var code = lines.slice(1, lines.length).join('\n').trim();

                // Add heading
                var heading = document.createElement("h1")
                heading.innerHTML = title;
                document.getElementById(_into).appendChild(heading);

                // Add code
                var codeTag = document.createElement("code");
                codeTag.className = "javascript";
                codeTag.innerHTML = code;
                var preTag = document.createElement('pre');
                preTag.appendChild(codeTag);
                document.getElementById(_into).appendChild(preTag);
            });

            _callback && _callback();
        } else {
            console.error("NoDOMError: DOM is not detected, cannot add code blocks");
        }
    }

    // Attach _copy to onload
    window.addEventListener("load", function() {
        copy(_from, _into, _callback);
    });

    // Return public methods
    return {
        callback: callback,
        copy: copy
    };
}));