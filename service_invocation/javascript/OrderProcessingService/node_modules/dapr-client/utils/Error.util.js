"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ErrorUtil = /** @class */ (function () {
    function ErrorUtil() {
    }
    ErrorUtil.serializeError = function (msg) {
        if (typeof msg === "string") {
            throw new Error(msg);
        }
        throw new Error(JSON.stringify(msg));
    };
    return ErrorUtil;
}());
exports.default = ErrorUtil;
