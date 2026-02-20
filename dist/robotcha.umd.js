(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.robotcha = factory());
})(this, (function () { 'use strict';

    let nextId = 0;
    const responses = new Map();
    function resolveContainer(container) {
        if (typeof container === 'string') {
            return document.getElementById(container);
        }
        return container;
    }
    function render(container, options = {}) {
        var _a;
        const target = resolveContainer(container);
        if (!target) {
            (_a = options['error-callback']) === null || _a === void 0 ? void 0 : _a.call(options);
            return -1;
        }
        const id = ++nextId;
        responses.set(id, '');
        return id;
    }
    function reset(id) {
        if (typeof id === 'number') {
            responses.set(id, '');
            return;
        }
        responses.clear();
    }
    function getResponse(id) {
        var _a;
        if (typeof id !== 'number') {
            return '';
        }
        return (_a = responses.get(id)) !== null && _a !== void 0 ? _a : '';
    }
    const robotcha = {
        render,
        reset,
        getResponse
    };

    return robotcha;

}));
//# sourceMappingURL=robotcha.umd.js.map
