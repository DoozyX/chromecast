var CastReceiver = (function (exports, cast_debug, cast_framework, cast_framework_events, cast_framework_messages, SmartWebPlayer) {
    'use strict';

    class Logger {
        constructor(name, logger) {
            this.name = name;
            this.logger = logger;
            this.logger.setEnabled(true);
            this.logger.loggerLevelByEvents = {
                "cast.framework.events.category.CORE": cast.framework.LoggerLevel.INFO,
                "cast.framework.events.EventType.MEDIA_STATUS": cast.framework.LoggerLevel.DEBUG,
            };
            if (!this.logger.loggerLevelByTags) {
                this.logger.loggerLevelByTags = {};
            }
            this.logger.loggerLevelByTags[this.name] = cast.framework.LoggerLevel.DEBUG;
            // Set to true to show debug overlay.
            // this.logger.showDebugLogs(true);
        }
        debug(...args) {
            // console.log(`[${this.name}]`, ...args);
            this.logger.info(this.name, ...args);
        }
        error(...args) {
            this.logger.error(this.name, ...args);
        }
        info(...args) {
            this.logger.info(this.name, ...args);
        }
        warn(...args) {
            this.logger.warn(this.name, ...args);
        }
    }

    class CastReceiver {
        constructor() {
            // Setup playbackConfig with a sourceDescription license information passed by loadRequestData.
            this.handleLoad = (loadRequestData) => {
                var _a;
                this.logger.debug("LOAD event received", loadRequestData);
                // If the loadRequestData is incomplete, return an error message
                if (!loadRequestData || !loadRequestData.media) {
                    const error = new cast_framework_messages.ErrorData(cast_framework_messages.ErrorType.LOAD_FAILED);
                    error.reason = cast_framework_messages.ErrorReason.INVALID_REQUEST;
                    this.logger.error("LOAD_FAILED: Verify the load request is set up properly and the media is able to play.");
                    return null;
                }
                const contentId = loadRequestData.media.contentId;
                const contentUrl = loadRequestData.media.contentUrl;
                this.logger.debug("received contentId", contentId, "contentUrl", contentUrl);
                const drm = (_a = loadRequestData === null || loadRequestData === void 0 ? void 0 : loadRequestData.media.customData) === null || _a === void 0 ? void 0 : _a.drm;
                this.logger.debug("received drm", loadRequestData === null || loadRequestData === void 0 ? void 0 : loadRequestData.customData, drm);
                this._player
                    .setSrc(contentId, drm
                    ? {
                        type: "widevine",
                        data: { licenseUrl: drm.licenseUrl },
                        headers: {
                            Authorization: drm.jwt,
                        },
                    }
                    : undefined)
                    .then(() => {
                    var _a;
                    if (loadRequestData.currentTime !== undefined) {
                        this._player.seekTo((_a = loadRequestData.currentTime * 1000) !== null && _a !== void 0 ? _a : 0);
                    }
                });
                return null;
            };
            this.handlePlay = (event) => {
                this.logger.debug("PLAY received");
                this._player.play();
                return null;
            };
            this.handlePause = (event) => {
                this.logger.debug("PAUSE received");
                this._player.pause();
                return null;
            };
            this.handleSeek = (event) => {
                var _a;
                this.logger.debug("SEEK  received", event.currentTime);
                if (event.currentTime !== undefined) {
                    this._player.seekTo((_a = event.currentTime * 1000) !== null && _a !== void 0 ? _a : 0);
                }
                return null;
            };
            this.handlePlayEvent = (event) => {
                this.logger.debug("PLAY event received", event.currentMediaTime);
                this._player.play();
            };
            this.handlePauseEvent = (event) => {
                this.logger.debug("PAUSE event received", event.currentMediaTime);
            };
            this.handleErrorEvent = (event) => {
                this.logger.error("Detailed Error Code - " + event.detailedErrorCode);
            };
            this._context = cast_framework.CastReceiverContext.getInstance();
            this._playerManager = this._context.getPlayerManager();
            this._player = SmartWebPlayer.getSmartPlayer();
            this._player.init();
            this.logger = new Logger("UCast Receiver", cast_debug.CastDebugLogger.getInstance());
            // Provide an interceptor for LOAD messages.
            this._playerManager.setMessageInterceptor(cast_framework_messages.MessageType.LOAD, this.handleLoad);
            this._playerManager.setMessageInterceptor(cast_framework_messages.MessageType.PAUSE, this.handlePause);
            this._playerManager.setMessageInterceptor(cast_framework_messages.MessageType.PLAY, this.handlePlay);
            this._playerManager.setMessageInterceptor(cast_framework_messages.MessageType.SEEK, this.handleSeek);
            // Add basic event listeners
            this._playerManager.addEventListener(cast_framework_events.EventType.PLAY, this.handlePlayEvent);
            this._playerManager.addEventListener(cast_framework_events.EventType.PAUSE, this.handlePauseEvent);
            this._playerManager.addEventListener(cast_framework_events.EventType.ERROR, this.handleErrorEvent);
        }
        // Start receiving requests from senders.
        start() {
            let castReceiverOptions = new cast.framework.CastReceiverOptions();
            // Do not load unnecessary JS files for players we don't need.
            castReceiverOptions.skipPlayersLoad = true;
            // Disable the idle timeout. Note that this is something actually useful to have, but it should
            // be easy to implement with some bookkeeping and `setTimeout`.
            castReceiverOptions.disableIdleTimeout = true;
            // Enable basic media commands.
            castReceiverOptions.supportedCommands = cast.framework.messages.Command.ALL_BASIC_MEDIA;
            // Optional, maximize the debug level to diagnose problems.
            this._context.setLoggerLevel(cast.framework.LoggerLevel.DEBUG);
            this._context.start(castReceiverOptions);
        }
    }

    exports.CastReceiver = CastReceiver;

    return exports;

})({}, cast.debug, cast.framework, cast.framework.events, cast.framework.messages, SmartWebPlayer);
//# sourceMappingURL=bundle.js.map
