"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.SQSWorker = exports.EVENTS = void 0;
var client_sqs_1 = require("@aws-sdk/client-sqs");
var events_1 = require("events");
var EVENTS;
(function (EVENTS) {
    EVENTS["INTIALIZED"] = "sqs-worker.initialized";
    EVENTS["STARTED"] = "sqs-worker.started";
    EVENTS["STOPPED"] = "sqs-worker.stopped";
    EVENTS["RECEIVED"] = "sqs-worker.messa-received";
    EVENTS["ERROR"] = "sqs-worker.error";
})(EVENTS = exports.EVENTS || (exports.EVENTS = {}));
var SQSWorker = /** @class */ (function (_super) {
    __extends(SQSWorker, _super);
    function SQSWorker(_a) {
        var queueUrl = _a.queueUrl, client = _a.client, handleMessage = _a.handleMessage, interval = _a.interval, logger = _a.logger;
        var _this = _super.call(this) || this;
        _this.queueUrl = queueUrl;
        _this.client = client;
        _this.messageHandler = handleMessage;
        _this.interval = interval;
        _this.logger = logger;
        _this.emit(EVENTS.INTIALIZED);
        return _this;
    }
    SQSWorker.forQueue = function (options) {
        var existingClient = options.client, region = options.region, endpoint = options.endpoint, queueUrl = options.queueUrl, handleMessage = options.handleMessage, loggerGiven = options.logger, intervalGiven = options.interval;
        var client = existingClient !== null && existingClient !== void 0 ? existingClient : new client_sqs_1.SQSClient({ region: region, endpoint: endpoint });
        var interval = intervalGiven !== null && intervalGiven !== void 0 ? intervalGiven : 3000;
        var logger = loggerGiven !== null && loggerGiven !== void 0 ? loggerGiven : console;
        return new SQSWorker({ queueUrl: queueUrl, client: client, handleMessage: handleMessage, interval: interval, logger: logger });
    };
    SQSWorker.prototype.listen = function () {
        return __awaiter(this, void 0, void 0, function () {
            var receiveCommand, _a, httpStatusCode, Messages, rawMessage, message, ReceiptHandle, e_1;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.emit(EVENTS.STARTED);
                        this.logger.info("Running SQS Worker");
                        receiveCommand = new client_sqs_1.ReceiveMessageCommand({
                            QueueUrl: this.queueUrl
                        });
                        return [4 /*yield*/, this.client.send(receiveCommand)];
                    case 1:
                        _a = _b.sent(), httpStatusCode = _a.$metadata.httpStatusCode, Messages = _a.Messages;
                        if (httpStatusCode >= 400) {
                            this.emit(EVENTS.ERROR, httpStatusCode);
                        }
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 6, 7, 8]);
                        if (!(Messages === null || Messages === void 0 ? void 0 : Messages.length)) return [3 /*break*/, 5];
                        rawMessage = Messages[0];
                        this.emit(EVENTS.RECEIVED, rawMessage);
                        this.logger.debug("message received", rawMessage);
                        message = rawMessage.Body, ReceiptHandle = rawMessage.ReceiptHandle;
                        return [4 /*yield*/, this.messageHandler(JSON.parse(message))];
                    case 3:
                        _b.sent();
                        return [4 /*yield*/, this.client.send(new client_sqs_1.DeleteMessageCommand({ QueueUrl: this.queueUrl, ReceiptHandle: ReceiptHandle }))];
                    case 4:
                        _b.sent();
                        _b.label = 5;
                    case 5: return [3 /*break*/, 8];
                    case 6:
                        e_1 = _b.sent();
                        this.emit(EVENTS.ERROR, e_1);
                        return [3 /*break*/, 8];
                    case 7:
                        this.runningInterval = setTimeout(function () { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, this.listen()];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); }, this.interval);
                        return [7 /*endfinally*/];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    SQSWorker.prototype.stop = function () {
        clearTimeout(this.runningInterval);
        this.logger.debug("stopping worker");
        this.emit(EVENTS.STOPPED);
    };
    return SQSWorker;
}(events_1.EventEmitter));
exports.SQSWorker = SQSWorker;
