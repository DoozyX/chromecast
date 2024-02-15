var LOG_RECEIVER_TAG = "SampleReceiver";
var SampleReceiver = /** @class */ (function () {
    function SampleReceiver() {
        var _this = this;
        // Setup playbackConfig with a sourceDescription license information passed by loadRequestData.
        this._handleLoad = function (loadRequestData) {
            var _a, _b, _c, _d;
            // If the loadRequestData is incomplete, return an error message
            if (!loadRequestData || !loadRequestData.media) {
                var error = new ErrorData(ErrorType.LOAD_FAILED);
                error.reason = ErrorReason.INVALID_REQUEST;
                return error;
            }
            // Check for sourceDescription
            var sourceDescription = (_a = loadRequestData === null || loadRequestData === void 0 ? void 0 : loadRequestData.customData) === null || _a === void 0 ? void 0 : _a.sourceDescription;
            var selectedSource = (_b = sourceDescription === null || sourceDescription === void 0 ? void 0 : sourceDescription.sources) === null || _b === void 0 ? void 0 : _b.find(function (source) {
                return source.src === loadRequestData.media.contentId || source.src === loadRequestData.media.contentUrl;
            });
            if (selectedSource) {
                var playbackConfig = Object.assign(new PlaybackConfig(), _this._playerManager.getPlaybackConfig());
                // Check for contentProtection (DRM)
                var contentProtection = (_c = selectedSource.contentProtection) !== null && _c !== void 0 ? _c : selectedSource.drm;
                if (contentProtection) {
                    // Enrich playbackConfig with contentProtection properties.
                    (_d = createContentProtectionConfigEnricher(contentProtection)) === null || _d === void 0 ? void 0 : _d.enrich(playbackConfig);
                }
                // Set an optional manifest request handler
                playbackConfig.manifestRequestHandler = function (_request) {
                    // request.url = `<proxy>${request.url}`;
                };
                // Set an optional segment request handler
                playbackConfig.segmentRequestHandler = function (_request) {
                    // request.url = `<proxy>${request.url}`;
                };
                _this._playerManager.setPlaybackConfig(playbackConfig);
            }
            return loadRequestData;
        };
        this.handlePlayEvent_ = function (event) {
            _this._castDebugLogger.debug(LOG_RECEIVER_TAG, "PLAY event received", event.currentMediaTime);
        };
        this.handlePauseEvent_ = function (event) {
            _this._castDebugLogger.debug(LOG_RECEIVER_TAG, "PAUSE event received", event.currentMediaTime);
        };
        this.handleErrorEvent_ = function (event) {
            _this._castDebugLogger.error(LOG_RECEIVER_TAG, "Detailed Error Code - " + event.detailedErrorCode);
        };
        this._context = CastReceiverContext.getInstance();
        this._playerManager = this._context.getPlayerManager();
        this._castDebugLogger = CastDebugLogger.getInstance();
        this._castDebugLogger.setEnabled(true);
        this._castDebugLogger.loggerLevelByEvents = {
            "cast.framework.events.category.CORE": cast.framework.LoggerLevel.INFO,
            "cast.framework.events.EventType.MEDIA_STATUS": cast.framework.LoggerLevel.DEBUG,
        };
        if (!this._castDebugLogger.loggerLevelByTags) {
            this._castDebugLogger.loggerLevelByTags = {};
        }
        this._castDebugLogger.loggerLevelByTags[LOG_RECEIVER_TAG] = cast.framework.LoggerLevel.DEBUG;
        // Set to true to show debug overlay.
        this._castDebugLogger.showDebugLogs(false);
        // Provide an interceptor for LOAD messages.
        this._playerManager.setMessageInterceptor(MessageType.LOAD, this._handleLoad);
        // Add basic event listeners
        this._playerManager.addEventListener(EventType.PLAY, this.handlePlayEvent_);
        this._playerManager.addEventListener(EventType.PAUSE, this.handlePauseEvent_);
        this._playerManager.addEventListener(EventType.ERROR, this.handleErrorEvent_);
    }
    // Start receiving requests from senders.
    SampleReceiver.prototype.start = function () {
        this._context.start();
    };
    return SampleReceiver;
}());
export { SampleReceiver };
function integrationId(configuration) {
    var integration = configuration.integration, customIntegrationId = configuration.customIntegrationId;
    if (integration && integration.toLowerCase() === "custom") {
        return customIntegrationId;
    }
    return integration;
}
// Create an enricher to apply the contentProtection properties to a playbackConfig instance.
export function createContentProtectionConfigEnricher(contentProtection) {
    // Widevine DRM
    if (contentProtection.widevine) {
        switch (integrationId(contentProtection)) {
            case "vudrm":
                return new VudrmWidevineConfigEnricher(contentProtection, contentProtection);
            case "titaniumdrm":
                return new TitaniumDrmWidevineConfigEnricher(contentProtection, contentProtection);
            case "ezdrm":
            default:
                return new WidevineConfigEnricher(contentProtection);
        }
    }
    return undefined;
}
castReceiverOptions;
import { CastReceiverContext, PlaybackConfig } from "chromecast-caf-receiver/cast.framework";
import { ErrorData, ErrorReason, ErrorType, MessageType, } from "chromecast-caf-receiver/cast.framework.messages";
import { EventType } from "chromecast-caf-receiver/cast.framework.events";
import { VudrmWidevineConfigEnricher } from "./drm/vudrm/VudrmWidevineConfigEnricher";
import { WidevineConfigEnricher } from "./drm/WidevineConfigEnricher";
import { CastDebugLogger } from "chromecast-caf-receiver/cast.debug";
import { TitaniumDrmWidevineConfigEnricher } from "./drm/titanium/TitaniumDrmWidevineConfigEnricher";
var LOG_RECEIVER_TAG = "SampleReceiver";
var SampleReceiver = /** @class */ (function () {
    function SampleReceiver() {
        var _this = this;
        // Setup playbackConfig with a sourceDescription license information passed by loadRequestData.
        this._handleLoad = function (loadRequestData) {
            var _a, _b, _c, _d;
            // If the loadRequestData is incomplete, return an error message
            if (!loadRequestData || !loadRequestData.media) {
                var error = new ErrorData(ErrorType.LOAD_FAILED);
                error.reason = ErrorReason.INVALID_REQUEST;
                return error;
            }
            // Check for sourceDescription
            var sourceDescription = (_a = loadRequestData === null || loadRequestData === void 0 ? void 0 : loadRequestData.customData) === null || _a === void 0 ? void 0 : _a.sourceDescription;
            var selectedSource = (_b = sourceDescription === null || sourceDescription === void 0 ? void 0 : sourceDescription.sources) === null || _b === void 0 ? void 0 : _b.find(function (source) {
                return source.src === loadRequestData.media.contentId || source.src === loadRequestData.media.contentUrl;
            });
            if (selectedSource) {
                var playbackConfig = Object.assign(new PlaybackConfig(), _this._playerManager.getPlaybackConfig());
                // Check for contentProtection (DRM)
                var contentProtection = (_c = selectedSource.contentProtection) !== null && _c !== void 0 ? _c : selectedSource.drm;
                if (contentProtection) {
                    // Enrich playbackConfig with contentProtection properties.
                    (_d = createContentProtectionConfigEnricher(contentProtection)) === null || _d === void 0 ? void 0 : _d.enrich(playbackConfig);
                }
                // Set an optional manifest request handler
                playbackConfig.manifestRequestHandler = function (_request) {
                    // request.url = `<proxy>${request.url}`;
                };
                // Set an optional segment request handler
                playbackConfig.segmentRequestHandler = function (_request) {
                    // request.url = `<proxy>${request.url}`;
                };
                _this._playerManager.setPlaybackConfig(playbackConfig);
            }
            return loadRequestData;
        };
        this.handlePlayEvent_ = function (event) {
            _this._castDebugLogger.debug(LOG_RECEIVER_TAG, "PLAY event received", event.currentMediaTime);
        };
        this.handlePauseEvent_ = function (event) {
            _this._castDebugLogger.debug(LOG_RECEIVER_TAG, "PAUSE event received", event.currentMediaTime);
        };
        this.handleErrorEvent_ = function (event) {
            _this._castDebugLogger.error(LOG_RECEIVER_TAG, "Detailed Error Code - " + event.detailedErrorCode);
        };
        this._context = CastReceiverContext.getInstance();
        this._playerManager = this._context.getPlayerManager();
        this._castDebugLogger = CastDebugLogger.getInstance();
        this._castDebugLogger.setEnabled(true);
        this._castDebugLogger.loggerLevelByEvents = {
            "cast.framework.events.category.CORE": cast.framework.LoggerLevel.INFO,
            "cast.framework.events.EventType.MEDIA_STATUS": cast.framework.LoggerLevel.DEBUG,
        };
        if (!this._castDebugLogger.loggerLevelByTags) {
            this._castDebugLogger.loggerLevelByTags = {};
        }
        this._castDebugLogger.loggerLevelByTags[LOG_RECEIVER_TAG] = cast.framework.LoggerLevel.DEBUG;
        // Set to true to show debug overlay.
        this._castDebugLogger.showDebugLogs(false);
        // Provide an interceptor for LOAD messages.
        this._playerManager.setMessageInterceptor(MessageType.LOAD, this._handleLoad);
        // Add basic event listeners
        this._playerManager.addEventListener(EventType.PLAY, this.handlePlayEvent_);
        this._playerManager.addEventListener(EventType.PAUSE, this.handlePauseEvent_);
        this._playerManager.addEventListener(EventType.ERROR, this.handleErrorEvent_);
    }
    // Start receiving requests from senders.
    SampleReceiver.prototype.start = function () {
        this._context.start();
    };
    return SampleReceiver;
}());
export { SampleReceiver };
function integrationId(configuration) {
    var integration = configuration.integration, customIntegrationId = configuration.customIntegrationId;
    if (integration && integration.toLowerCase() === "custom") {
        return customIntegrationId;
    }
    return integration;
}
// Create an enricher to apply the contentProtection properties to a playbackConfig instance.
export function createContentProtectionConfigEnricher(contentProtection) {
    // Widevine DRM
    if (contentProtection.widevine) {
        switch (integrationId(contentProtection)) {
            case "vudrm":
                return new VudrmWidevineConfigEnricher(contentProtection, contentProtection);
            case "titaniumdrm":
                return new TitaniumDrmWidevineConfigEnricher(contentProtection, contentProtection);
            case "ezdrm":
            default:
                return new WidevineConfigEnricher(contentProtection);
        }
    }
    return undefined;
}
