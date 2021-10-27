"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EStateConcurrency = void 0;
var EStateConcurrency;
(function (EStateConcurrency) {
    EStateConcurrency[EStateConcurrency["CONCURRENCY_UNSPECIFIED"] = 0] = "CONCURRENCY_UNSPECIFIED";
    EStateConcurrency[EStateConcurrency["CONCURRENCY_FIRST_WRITE"] = 1] = "CONCURRENCY_FIRST_WRITE";
    EStateConcurrency[EStateConcurrency["CONCURRENCY_LAST_WRITE"] = 2] = "CONCURRENCY_LAST_WRITE";
})(EStateConcurrency = exports.EStateConcurrency || (exports.EStateConcurrency = {}));
