"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = exports.LoggerLevel = void 0;
var os_1 = __importDefault(require("os"));
// RFC5424 https://tools.ietf.org/html/rfc5424
var LoggerLevel;
(function (LoggerLevel) {
    LoggerLevel[LoggerLevel["ERROR"] = 0] = "ERROR";
    LoggerLevel[LoggerLevel["WARN"] = 1] = "WARN";
    LoggerLevel[LoggerLevel["INFO"] = 2] = "INFO";
    LoggerLevel[LoggerLevel["HTTP"] = 3] = "HTTP";
    LoggerLevel[LoggerLevel["TRACE"] = 4] = "TRACE";
    LoggerLevel[LoggerLevel["VERBOSE"] = 5] = "VERBOSE";
    LoggerLevel[LoggerLevel["DEBUG"] = 6] = "DEBUG";
    LoggerLevel[LoggerLevel["SILLY"] = 7] = "SILLY";
})(LoggerLevel = exports.LoggerLevel || (exports.LoggerLevel = {}));
var LoggerLevelKeys = ['ERROR', 'WARN', 'INFO', 'HTTP', 'VERBOSE', 'DEBUG', 'SILLY', 'TRACE'];
var CURRENT_LOGGER_LEVEL = process.env.LOGGER_LEVEL || LoggerLevel.VERBOSE;
console.log("CURRENT LOG LEVEL: " + CURRENT_LOGGER_LEVEL);
var Logger = /** @class */ (function () {
    function Logger() {
    }
    Logger.print = function (level, message, category) {
        if (category === void 0) { category = 'Server'; }
        if (level > CURRENT_LOGGER_LEVEL) {
            return;
        }
        var date = new Date();
        var dateISO = date.toISOString(); // ISO 8601
        console.log("[" + dateISO + "][" + LoggerLevelKeys[level] + "][" + category + "] " + message);
    };
    Logger.error = function (message, category) {
        if (category === void 0) { category = 'Server'; }
        this.print(LoggerLevel.ERROR, message, category);
    };
    Logger.warn = function (message, category) {
        if (category === void 0) { category = 'Server'; }
        this.print(LoggerLevel.WARN, message, category);
    };
    Logger.info = function (message, category) {
        if (category === void 0) { category = 'Server'; }
        this.print(LoggerLevel.INFO, message, category);
    };
    Logger.http = function (message, category) {
        if (category === void 0) { category = 'Server'; }
        this.print(LoggerLevel.HTTP, message, category);
    };
    Logger.log = function (message, category) {
        if (category === void 0) { category = 'Server'; }
        this.print(LoggerLevel.VERBOSE, message, category);
    };
    Logger.debug = function (message, category) {
        if (category === void 0) { category = 'Server'; }
        this.print(LoggerLevel.DEBUG, message, category);
    };
    Logger.os = function (category, msgPrefix) {
        if (category === void 0) { category = 'Memory'; }
        if (msgPrefix === void 0) { msgPrefix = ""; }
        var osMemTotal = Math.round((os_1.default.totalmem() / 1024 / 1024) * 100) / 100;
        var osMemFree = Math.round((os_1.default.freemem() / 1024 / 1024) * 100) / 100;
        this.print(LoggerLevel.TRACE, msgPrefix + "Memory Free: " + osMemFree + " / " + osMemTotal + " Mb", category);
        this.print(LoggerLevel.TRACE, msgPrefix + "CPU: " + os_1.default.cpus().length + " Cores", category);
    };
    Logger.traceStart = function () {
        return process.hrtime();
    };
    return Logger;
}());
exports.Logger = Logger;
