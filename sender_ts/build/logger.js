var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var LoggerWriter = /** @class */ (function () {
    function LoggerWriter() {
    }
    LoggerWriter.prototype.debug = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        console.debug.apply(console, args);
    };
    LoggerWriter.prototype.error = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        console.error.apply(console, args);
    };
    LoggerWriter.prototype.info = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        console.info.apply(console, args);
    };
    LoggerWriter.prototype.warn = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        console.warn.apply(console, args);
    };
    return LoggerWriter;
}());
var Logger = /** @class */ (function () {
    function Logger(name) {
        this.name = name;
    }
    Logger.init = function () {
        Logger.logger = new LoggerWriter();
    };
    Logger.prototype.debug = function () {
        var _a;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        console.log.apply(console, __spreadArray([this.name], args, false));
        (_a = Logger.logger).debug.apply(_a, __spreadArray([this.name], args, false));
    };
    Logger.prototype.error = function () {
        var _a;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        (_a = Logger.logger).error.apply(_a, __spreadArray([this.name], args, false));
    };
    Logger.prototype.info = function () {
        var _a;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        (_a = Logger.logger).info.apply(_a, __spreadArray([this.name], args, false));
    };
    Logger.prototype.warn = function () {
        var _a;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        (_a = Logger.logger).warn.apply(_a, __spreadArray([this.name], args, false));
    };
    return Logger;
}());
