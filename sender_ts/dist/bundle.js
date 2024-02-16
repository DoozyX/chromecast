(function () {
    'use strict';

    class LoggerWriter {
        debug(...args) {
            console.debug(...args);
        }
        error(...args) {
            console.error(...args);
        }
        info(...args) {
            console.info(...args);
        }
        warn(...args) {
            console.warn(...args);
        }
    }
    class Logger {
        constructor(name) {
            this.name = name;
        }
        static init() {
            Logger.logger = new LoggerWriter();
        }
        debug(...args) {
            console.log(this.name, ...args);
            Logger.logger.debug(this.name, ...args);
        }
        error(...args) {
            Logger.logger.error(this.name, ...args);
        }
        info(...args) {
            Logger.logger.info(this.name, ...args);
        }
        warn(...args) {
            Logger.logger.warn(this.name, ...args);
        }
    }

    // export const APP_ID = "72A0DA66";
    const APP_ID = "CE104983";
    /**
     * Time in milliseconds for minimal progress update.
     * @const {number}
     */
    const TIMER_STEP = 1000;

    /**
     * @param {?number} timestamp Linux timestamp
     * @return {?string} media time string. Null if time is invalid.
     */
    function getMediaTimeString(timestamp) {
        if (timestamp == undefined || timestamp == null) {
            return null;
        }
        let isNegative = false;
        if (timestamp < 0) {
            isNegative = true;
            timestamp *= -1;
        }
        let hours = Math.floor(timestamp / 3600);
        let minutes = Math.floor((timestamp - hours * 3600) / 60);
        let seconds = Math.floor(timestamp - hours * 3600 - minutes * 60);
        let hoursText = hours.toString();
        let minutesText = minutes.toString();
        let secondsText = seconds.toString();
        if (hours < 10)
            hoursText = "0" + hours;
        if (minutes < 10)
            minutesText = "0" + minutes;
        if (seconds < 10)
            secondsText = "0" + seconds;
        return (isNegative ? "-" : "") + hoursText + ":" + minutesText + ":" + secondsText;
    }
    /**
     * Makes human-readable message from chrome.cast.Error
     * @param {chrome.cast.Error} error
     * @return {string} error message
     */
    function getErrorMessage(error) {
        switch (error.code) {
            case chrome.cast.ErrorCode.API_NOT_INITIALIZED:
                return "The API is not initialized." + (error.description ? " :" + error.description : "");
            case chrome.cast.ErrorCode.CANCEL:
                return "The operation was canceled by the user" + (error.description ? " :" + error.description : "");
            case chrome.cast.ErrorCode.CHANNEL_ERROR:
                return "A channel to the receiver is not available." + (error.description ? " :" + error.description : "");
            case chrome.cast.ErrorCode.EXTENSION_MISSING:
                return "The Cast extension is not available." + (error.description ? " :" + error.description : "");
            case chrome.cast.ErrorCode.INVALID_PARAMETER:
                return "The parameters to the operation were not valid." + (error.description ? " :" + error.description : "");
            case chrome.cast.ErrorCode.RECEIVER_UNAVAILABLE:
                return ("No receiver was compatible with the session request." + (error.description ? " :" + error.description : ""));
            case chrome.cast.ErrorCode.SESSION_ERROR:
                return ("A session could not be created, or a session was invalid." +
                    (error.description ? " :" + error.description : ""));
            case chrome.cast.ErrorCode.TIMEOUT:
                return "The operation timed out." + (error.description ? " :" + error.description : "");
            default:
                return error;
        }
    }

    class RemoteTarget {
        constructor(remotePlayer, remotePlayerController, context) {
            this.remotePlayer = remotePlayer;
            this.remotePlayerController = remotePlayerController;
            this.currentMediaTime = 0;
            this.mediaInfo = null;
            this.isLiveContent = false;
            this.context = context;
        }
        play() {
            if (this.remotePlayer.isPaused) {
                this.remotePlayerController.playOrPause();
            }
        }
        pause() {
            if (!this.remotePlayer.isPaused) {
                this.remotePlayerController.playOrPause();
            }
        }
        stop() {
            this.remotePlayerController.stop();
        }
        // Load request for local -> remote
        load(url, drm) {
            var _a;
            console.log("Loading...", url, drm);
            let mediaInfo = new chrome.cast.media.MediaInfo(url, "");
            if (drm) {
                mediaInfo.customData = { drm };
            }
            mediaInfo.metadata = new chrome.cast.media.GenericMediaMetadata();
            mediaInfo.metadata.title = "TODO TITLE";
            mediaInfo.metadata.subtitle = "TODO SUBTITLE";
            // mediaInfo.streamType = chrome.cast.media.StreamType.BUFFERED;
            // mediaInfo.metadata.images = [
            //   {
            //     url: MEDIA_SOURCE_ROOT + this.mediaContents[mediaIndex]["thumb"],
            //   },
            // ];
            // Change the streamType and add live specific metadata.
            // mediaInfo.streamType = chrome.cast.media.StreamType.LIVE;
            // TODO: Set the metadata on the receiver side in your implementation.
            // startAbsoluteTime and sectionStartTimeInMedia will be set for you.
            // See https://developers.google.com/cast/docs/caf_receiver/live.
            // TODO: Start time, is a fake timestamp. Use correct values for your implementation.
            // let currentTime = new Date();
            // Convert from milliseconds to seconds.
            // let miliseconds = currentTime.getTime() / 1000;
            // let sectionStartAbsoluteTime = miliseconds;
            // Duration should be -1 for live streams.
            // mediaInfo.duration = -1;
            // TODO: Set on the receiver for your implementation.
            //   mediaInfo.startAbsoluteTime = miliseconds; TODO
            // mediaInfo.metadata.sectionStartAbsoluteTime = sectionStartAbsoluteTime;
            // TODO: Set on the receiver for your implementation.
            // mediaInfo.metadata.sectionStartTimeInMedia = 0;
            // mediaInfo.metadata.sectionDuration = 100; // TODO Duration;
            let request = new chrome.cast.media.LoadRequest(mediaInfo);
            request.currentTime = this.currentMediaTime;
            request.autoplay = true;
            (_a = this.context
                .getCurrentSession()) === null || _a === void 0 ? void 0 : _a.loadMedia(request).then(() => {
                console.log("Remote media loaded");
            }, (errorCode) => {
                console.log("Remote media load error: " + getErrorMessage(errorCode));
                //   this.playerHandler.updateDisplay();
            });
        }
        isMediaLoaded(url) {
            let session = this.context.getCurrentSession();
            if (!session)
                return false;
            let media = session.getMediaSession();
            if (!media)
                return false;
            // No need to verify local mediaIndex content.
            return true;
        }
        /**
         * @return {number?} Current media time for the content. Always returns
         *      media time even if in clock time (conversion done when displaying).
         */
        getCurrentMediaTime() {
            var _a;
            if (this.isLiveContent && ((_a = this.mediaInfo) === null || _a === void 0 ? void 0 : _a.metadata) && this.mediaInfo.metadata.sectionStartTimeInMedia) {
                return this.remotePlayer.currentTime - this.mediaInfo.metadata.sectionStartTimeInMedia;
            }
            else {
                // VOD and live scenerios where live metadata is not provided.
                return this.remotePlayer.currentTime;
            }
        }
        /**
         * @return {number?} media time duration for the content. Always returns
         *      media time even if in clock time (conversion done when displaying).
         */
        getMediaDuration() {
            var _a;
            if (this.isLiveContent) {
                // Scenerios when live metadata is not provided.
                if (((_a = this.mediaInfo) === null || _a === void 0 ? void 0 : _a.metadata) == undefined ||
                    this.mediaInfo.metadata.sectionDuration == undefined ||
                    this.mediaInfo.metadata.sectionStartTimeInMedia == undefined) {
                    return null;
                }
                return this.mediaInfo.metadata.sectionDuration;
            }
            else {
                return this.remotePlayer.duration;
            }
        }
        updateDisplay() {
            var _a;
            let castSession = this.context.getCurrentSession();
            if (castSession && castSession.getMediaSession() && ((_a = castSession.getMediaSession()) === null || _a === void 0 ? void 0 : _a.media)) {
                let media = castSession.getMediaSession();
                let mediaInfo = media === null || media === void 0 ? void 0 : media.media;
                if ((mediaInfo === null || mediaInfo === void 0 ? void 0 : mediaInfo.metadata) && mediaInfo.metadata.images && mediaInfo.metadata.images.length > 0) {
                    mediaInfo.metadata.images[0].url;
                }
                let mediaTitle = "";
                let mediaEpisodeTitle = "";
                mediaTitle + " on " + castSession.getCastDevice().friendlyName;
                if (mediaInfo === null || mediaInfo === void 0 ? void 0 : mediaInfo.metadata) {
                    mediaTitle = mediaInfo.metadata.title;
                    mediaEpisodeTitle = mediaInfo.metadata.episodeTitle;
                    // Append episode title if present
                    mediaTitle = mediaEpisodeTitle ? mediaTitle + ": " + mediaEpisodeTitle : mediaTitle;
                    // Do not display mediaTitle if not defined.
                    mediaTitle = mediaTitle ? mediaTitle + " " : "";
                    mediaInfo.metadata.subtitle;
                }
            }
        }
        updateCurrentTimeDisplay() {
            var _a;
            this.setTimeString((_a = this.getCurrentMediaTime()) !== null && _a !== void 0 ? _a : 0);
        }
        updateDurationDisplay() {
            var _a;
            this.setTimeString((_a = this.getMediaDuration()) !== null && _a !== void 0 ? _a : 0);
        }
        setTimeString(time) {
            getMediaTimeString(time);
            // TODO
        }
        // 0 to 1
        setVolume(volume) {
            this.remotePlayer.volumeLevel = volume;
            this.remotePlayerController.setVolumeLevel();
        }
        mute() {
            if (!this.remotePlayer.isMuted) {
                this.remotePlayerController.muteOrUnmute();
            }
        }
        unMute() {
            if (this.remotePlayer.isMuted) {
                this.remotePlayerController.muteOrUnmute();
            }
        }
        isMuted() {
            return this.remotePlayer.isMuted;
        }
        seekTo(time) {
            this.remotePlayer.currentTime = time;
            this.remotePlayerController.seek();
        }
    }

    /**
     * Cast player object
     * Main variables:
     *  - PlayerHandler object for handling media playback
     *  - Cast player variables for controlling Cast mode media playback
     *  - Current media variables for transition between Cast and local modes
     *  - Current ad variables for controlling UI based on ad playback
     *  - Current live variables for controlling UI based on ad playback
     * @struct @constructor
     */
    class CastPlayer {
        constructor() {
            /** @type {PlayerHandler} Delegation proxy for media playback */
            // this.player = null;
            /* Cast player variables */
            /** @type {cast.framework.RemotePlayer} */
            this.remotePlayer = null;
            /** @type {cast.framework.RemotePlayerController} */
            this.remotePlayerController = null;
            /* Local+Remote player variables */
            /** @type {number} A number for current time in seconds. Maintained in media time. */
            this.currentMediaTime = 0;
            /**
             * @type {?number} A number for current duration in seconds. Maintained in media time.
             * Null if duration should not be shown.
             */
            this.mediaDuration = -1;
            /** @type {?number} A timer for tracking progress of media */
            this.timer = null;
            /** @type {function()} Listener for handling current time increments */
            this.incrementMediaTimeHandler = this.incrementMediaTime.bind(this);
            /** @type {function()} Listener to be added/removed for the seek action */
            this.seekMediaListener = this.seekMedia.bind(this);
            /* Local player variables */
            /** @type {number} A number for current media index */
            this.currentMediaUrl = "";
            /* Remote Player variables */
            /** @type {?chrome.cast.media.MediaInfo} Current mediaInfo */
            this.mediaInfo = null;
            /* Live variables */
            /** @type {?chrome.cast.media.LiveSeekableRange} Seekable range for live content */
            this.liveSeekableRange = null;
            /** @type {boolean} Remote player is playing live content. */
            this.isLiveContent = false;
            this.logger = new Logger("CastPlayer");
        }
        initializeCastPlayer() {
            this.logger.debug("initializeCastPlayer");
            this.context = cast.framework.CastContext.getInstance();
            const options = {
                // Set the receiver application ID to your own (created in the
                // Google Cast Developer Console), or optionally
                // use the chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID
                receiverApplicationId: APP_ID,
                // Auto join policy can be one of the following three:
                // ORIGIN_SCOPED - Auto connect from same appId and page origin
                // TAB_AND_ORIGIN_SCOPED - Auto connect from same appId, page origin, and tab
                // PAGE_SCOPED - No auto connect
                autoJoinPolicy: chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED,
            };
            this.context.setOptions(options);
            this.remotePlayer = new cast.framework.RemotePlayer();
            this.remotePlayerController = new cast.framework.RemotePlayerController(this.remotePlayer);
            this.remotePlayerController.addEventListener(cast.framework.RemotePlayerEventType.IS_CONNECTED_CHANGED, (e) => {
                var _a;
                this.logger.debug("RemotePlayerController.IS_CONNECTED_CHANGED");
                this.stopProgressTimer();
                // Session is active
                if (cast && cast.framework && ((_a = this.remotePlayer) === null || _a === void 0 ? void 0 : _a.isConnected)) {
                    this.setupRemotePlayer();
                }
            });
            this.player = new RemoteTarget(this.remotePlayer, this.remotePlayerController, this.context);
        }
        prepareToPlay() {
            this.mediaDuration = this.player.getMediaDuration();
            this.player.updateDurationDisplay();
            this.player.play();
            this.startProgressTimer();
            this.player.updateDisplay();
        }
        /**
         * Set the PlayerHandler target to use the remote player
         * Add event listeners for player changes which may occur outside sender app.
         */
        setupRemotePlayer() {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            this.logger.debug("setupRemotePlayer");
            // Triggers when the media info or the player state changes
            (_a = this.remotePlayerController) === null || _a === void 0 ? void 0 : _a.addEventListener(cast.framework.RemotePlayerEventType.MEDIA_INFO_CHANGED, (event) => {
                this.logger.debug("RemotePlayer.MEDIA_INFO_CHANGED", event);
                let session = this.context.getCurrentSession();
                if (!session) {
                    this.mediaInfo = null;
                    this.isLiveContent = false;
                    this.player.updateDisplay();
                    return;
                }
                let media = session.getMediaSession();
                if (!media) {
                    this.mediaInfo = null;
                    this.isLiveContent = false;
                    this.player.updateDisplay();
                    return;
                }
                this.mediaInfo = media.media;
                if (this.mediaInfo) {
                    this.isLiveContent = this.mediaInfo.streamType == chrome.cast.media.StreamType.LIVE;
                }
                else {
                    this.isLiveContent = false;
                }
                this.prepareToPlay();
                this.player.updateDisplay();
            });
            (_b = this.remotePlayerController) === null || _b === void 0 ? void 0 : _b.addEventListener(cast.framework.RemotePlayerEventType.CAN_SEEK_CHANGED, (event) => {
                this.logger.debug("RemotePlayer.CAN_SEEK_CHANGED", event);
            });
            (_c = this.remotePlayerController) === null || _c === void 0 ? void 0 : _c.addEventListener(cast.framework.RemotePlayerEventType.IS_PAUSED_CHANGED, () => {
                var _a, _b;
                this.logger.debug("RemotePlayer.IS_PAUSED_CHANGED", (_a = this.remotePlayer) === null || _a === void 0 ? void 0 : _a.isPaused);
                if ((_b = this.remotePlayer) === null || _b === void 0 ? void 0 : _b.isPaused) {
                    this.player.pause();
                }
                else {
                    // If currently not playing, start to play.
                    // This occurs if starting to play from local, but this check is
                    // required if the state is changed remotely.
                    this.player.play();
                }
            });
            (_d = this.remotePlayerController) === null || _d === void 0 ? void 0 : _d.addEventListener(cast.framework.RemotePlayerEventType.IS_MUTED_CHANGED, () => {
                var _a, _b;
                this.logger.debug("RemotePlayer.IS_MUTED_CHANGED", (_a = this.remotePlayer) === null || _a === void 0 ? void 0 : _a.isMuted);
                if ((_b = this.remotePlayer) === null || _b === void 0 ? void 0 : _b.isMuted) {
                    this.player.mute();
                }
                else {
                    this.player.unMute();
                }
            });
            (_e = this.remotePlayerController) === null || _e === void 0 ? void 0 : _e.addEventListener(cast.framework.RemotePlayerEventType.VOLUME_LEVEL_CHANGED, () => {
                var _a;
                this.logger.debug("RemotePlayer.VOLUME_LEVEL_CHANGED", (_a = this.remotePlayer) === null || _a === void 0 ? void 0 : _a.volumeLevel);
            });
            (_f = this.remotePlayerController) === null || _f === void 0 ? void 0 : _f.addEventListener(cast.framework.RemotePlayerEventType.LIVE_SEEKABLE_RANGE_CHANGED, (event) => {
                console.log("LIVE_SEEKABLE_RANGE_CHANGED");
                this.liveSeekableRange = event.value;
            });
            // Setup remote player properties on setup
            if ((_g = this.remotePlayer) === null || _g === void 0 ? void 0 : _g.isMuted) {
                this.player.mute();
            }
            // The remote player may have had a volume set from previous playback
            // TODO update volume
            // If resuming a session, take the remote properties and continue the existing
            // playback. Otherwise, load local content.
            if (((_h = this.context.getCurrentSession()) === null || _h === void 0 ? void 0 : _h.getSessionState()) == cast.framework.SessionState.SESSION_RESUMED) {
                console.log("Resuming session");
                this.prepareToPlay();
            }
        }
        /**
         * Select a media content
         * @param {number} mediaIndex A number for media index
         */
        selectMedias(url) {
            console.log("Media index selected: " + url);
            this.currentMediaUrl = url;
            // Stop timer and reset time displays
            this.stopProgressTimer();
            this.currentMediaTime = 0;
            this.player.setTimeString(0);
            this.player.setTimeString(0);
            this.player.play();
        }
        /**
         * Media seek function
         * @param {Event} event An event object from seek
         */
        seekMedia(seekTime) {
            var _a, _b;
            if (this.mediaDuration == null || (this.context.getCurrentSession() && !((_a = this.remotePlayer) === null || _a === void 0 ? void 0 : _a.canSeek))) {
                console.log("Error - Not seekable");
                return;
            }
            if (this.isLiveContent && !this.liveSeekableRange) {
                console.log("Live content has no seekable range.");
                return;
            }
            this.currentMediaTime = seekTime;
            if (this.isLiveContent) {
                seekTime += (_b = this.mediaInfo) === null || _b === void 0 ? void 0 : _b.metadata.sectionStartTimeInMedia;
            }
            this.player.seekTo(seekTime);
        }
        /**
         * Set current player volume
         * @param {Event} mouseEvent
         */
        setVolume(pos) {
            this.player.setVolume(pos);
        }
        /**
         * Starts the timer to increment the media progress bar
         */
        startProgressTimer() {
            this.stopProgressTimer();
            // Start progress timer
            this.timer = setInterval(this.incrementMediaTimeHandler, TIMER_STEP);
        }
        /**
         * Stops the timer to increment the media progress bar
         */
        stopProgressTimer() {
            if (this.timer) {
                clearInterval(this.timer);
                this.timer = null;
            }
        }
        /**
         * Increment media current time depending on remote or local playback
         */
        incrementMediaTime() {
            // First sync with the current player's time
            this.currentMediaTime = this.player.getCurrentMediaTime();
            this.mediaDuration = this.player.getMediaDuration();
            this.player.updateDurationDisplay();
            if (this.mediaDuration == null || this.currentMediaTime < this.mediaDuration || this.isLiveContent) {
                this.player.updateCurrentTimeDisplay();
                this.updateProgressBarByTimer();
            }
            else if (this.mediaDuration > 0) {
                this.endPlayback();
            }
        }
        /**
         * Update progress bar and currentTime based on timer
         */
        updateProgressBarByTimer() {
            var _a, _b, _c, _d;
            // Live situation where the progress and duration is unknown.
            if (this.mediaDuration == null) {
                if (!this.isLiveContent) {
                    console.log("Error - Duration is not defined for a VOD stream.");
                }
                return;
            }
            if (this.isLiveContent) {
                if (this.liveSeekableRange) {
                    // Use the liveSeekableRange to draw the seekable and unseekable windows
                    Math.max((_a = this.mediaInfo) === null || _a === void 0 ? void 0 : _a.metadata.sectionStartTimeInMedia, this.liveSeekableRange.end) -
                        ((_b = this.mediaInfo) === null || _b === void 0 ? void 0 : _b.metadata.sectionStartTimeInMedia);
                    Math.max((_c = this.mediaInfo) === null || _c === void 0 ? void 0 : _c.metadata.sectionStartTimeInMedia, this.liveSeekableRange.start) -
                        ((_d = this.mediaInfo) === null || _d === void 0 ? void 0 : _d.metadata.sectionStartTimeInMedia);
                }
            }
            var pp = Math.floor(this.currentMediaTime / this.mediaDuration);
            if (pp > 1) {
                pp = 1;
            }
            else if (pp < 0) {
                pp = 0;
            }
            if (pp >= 1 && !this.isLiveContent) {
                this.endPlayback();
            }
        }
        /**
         *  End playback. Called when media ends.
         */
        endPlayback() {
            this.currentMediaTime = 0;
            this.stopProgressTimer();
            this.player.updateDisplay();
        }
    }

    Logger.init();
    let castPlayer = new CastPlayer();
    window["__onGCastApiAvailable"] = function (isAvailable) {
        if (isAvailable) {
            castPlayer.initializeCastPlayer();
        }
    };
    window.onload = function () {
        var _a, _b, _c, _d;
        (_a = document.getElementById("load")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => {
            const url = document.getElementById("url").value;
            const license = document.getElementById("license").value;
            const jwt = document.getElementById("jwt").value;
            if (license.length > 0 && jwt.length > 0) {
                castPlayer.player.load(url, {
                    licenseUrl: license,
                    jwt,
                });
            }
            else {
                castPlayer.player.load(url);
            }
        });
        (_b = document.getElementById("play")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", () => {
            castPlayer.player.play();
        });
        (_c = document.getElementById("pause")) === null || _c === void 0 ? void 0 : _c.addEventListener("click", () => {
            castPlayer.player.pause();
        });
        (_d = document.getElementById("seek")) === null || _d === void 0 ? void 0 : _d.addEventListener("click", () => {
            const position = document.getElementById("position").value;
            castPlayer.player.seekTo(parseInt(position));
        });
    };

})();
//# sourceMappingURL=bundle.js.map
