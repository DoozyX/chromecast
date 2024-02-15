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

    // const APP_ID = "72A0DA66";
    const APP_ID = "CE104983";
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
    class PlayerHandler {
        constructor(castPlayer) {
            this.target = null;
            this.castPlayer = castPlayer;
            this.logger = new Logger("PlayerHandler");
        }
        setTarget(target) {
            this.logger.debug("setTarget: ", target);
            this.target = target;
        }
        play() {
            var _a;
            this.logger.debug("play");
            (_a = this.target) === null || _a === void 0 ? void 0 : _a.play();
        }
        pause() {
            var _a;
            this.logger.debug("pause");
            (_a = this.target) === null || _a === void 0 ? void 0 : _a.pause();
        }
        stop() {
            var _a;
            this.logger.debug("stop");
            (_a = this.target) === null || _a === void 0 ? void 0 : _a.stop();
        }
        load(url) {
            var _a;
            this.logger.debug("load: ", url);
            (_a = this.target) === null || _a === void 0 ? void 0 : _a.load(url);
        }
        /**
         * Check if media has been loaded on the target player.
         * @param {number?} url The desired media url. If null, verify if
         *  any media is loaded.
         */
        isMediaLoaded(url) {
            var _a;
            return (_a = this.target) === null || _a === void 0 ? void 0 : _a.isMediaLoaded(url);
        }
        /**
         * Called after media has been successfully loaded and is ready to start playback.
         * When local, will start playing the video, start the timer, and update the UI.
         * When remote, will set the UI to PLAYING and start the timer to update the
         *   UI based on remote playback.
         */
        prepareToPlay() {
            this.castPlayer.mediaDuration = this.getMediaDuration();
            this.castPlayer.playerHandler.updateDurationDisplay();
            this.play();
            this.castPlayer.startProgressTimer();
            this.updateDisplay();
        }
        getCurrentMediaTime() {
            var _a;
            return (_a = this.target) === null || _a === void 0 ? void 0 : _a.getCurrentMediaTime();
        }
        getMediaDuration() {
            var _a;
            return (_a = this.target) === null || _a === void 0 ? void 0 : _a.getMediaDuration();
        }
        updateDisplay() {
            var _a, _b, _c;
            // Update local variables
            this.currentMediaTime = (_a = this.target) === null || _a === void 0 ? void 0 : _a.getCurrentMediaTime();
            this.mediaDuration = (_b = this.target) === null || _b === void 0 ? void 0 : _b.getMediaDuration();
            (_c = this.target) === null || _c === void 0 ? void 0 : _c.updateDisplay();
        }
        updateCurrentTimeDisplay() {
            var _a;
            (_a = this.target) === null || _a === void 0 ? void 0 : _a.updateCurrentTimeDisplay();
        }
        updateDurationDisplay() {
            var _a;
            (_a = this.target) === null || _a === void 0 ? void 0 : _a.updateDurationDisplay();
        }
        /**
         * Determines the correct time string (media or clock) and sets it for the given element.
         */
        setTimeString(time) {
            var _a;
            (_a = this.target) === null || _a === void 0 ? void 0 : _a.setTimeString(time);
        }
        setVolume(volumeSliderPosition) {
            var _a;
            (_a = this.target) === null || _a === void 0 ? void 0 : _a.setVolume(volumeSliderPosition);
        }
        mute() {
            var _a;
            (_a = this.target) === null || _a === void 0 ? void 0 : _a.mute();
        }
        unMute() {
            var _a;
            (_a = this.target) === null || _a === void 0 ? void 0 : _a.unMute();
        }
        isMuted() {
            var _a;
            return (_a = this.target) === null || _a === void 0 ? void 0 : _a.isMuted();
        }
        seekTo(time) {
            var _a;
            (_a = this.target) === null || _a === void 0 ? void 0 : _a.seekTo(time);
        }
    }
    /**
     * Time in milliseconds for minimal progress update.
     * @const {number}
     */
    const TIMER_STEP = 1000;
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
            this.playerHandler = new PlayerHandler(this);
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
                this.logger.debug("RemotePlayerController.IS_CONNECTED_CHANGED");
                this.switchPlayer();
            });
        }
        /**
         * Switch between the remote and local players.
         */
        switchPlayer() {
            var _a;
            this.logger.debug("switchPlayer");
            this.stopProgressTimer();
            // Session is active
            if (cast && cast.framework && ((_a = this.remotePlayer) === null || _a === void 0 ? void 0 : _a.isConnected)) {
                this.setupRemotePlayer();
            }
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
                    this.playerHandler.updateDisplay();
                    return;
                }
                let media = session.getMediaSession();
                if (!media) {
                    this.mediaInfo = null;
                    this.isLiveContent = false;
                    this.playerHandler.updateDisplay();
                    return;
                }
                this.mediaInfo = media.media;
                if (this.mediaInfo) {
                    this.isLiveContent = this.mediaInfo.streamType == chrome.cast.media.StreamType.LIVE;
                }
                else {
                    this.isLiveContent = false;
                }
                this.playerHandler.prepareToPlay();
                this.playerHandler.updateDisplay();
            });
            (_b = this.remotePlayerController) === null || _b === void 0 ? void 0 : _b.addEventListener(cast.framework.RemotePlayerEventType.CAN_SEEK_CHANGED, (event) => {
                this.logger.debug("RemotePlayer.CAN_SEEK_CHANGED" + event);
            });
            (_c = this.remotePlayerController) === null || _c === void 0 ? void 0 : _c.addEventListener(cast.framework.RemotePlayerEventType.IS_PAUSED_CHANGED, () => {
                var _a, _b;
                this.logger.debug("RemotePlayer.IS_PAUSED_CHANGED", (_a = this.remotePlayer) === null || _a === void 0 ? void 0 : _a.isPaused);
                if ((_b = this.remotePlayer) === null || _b === void 0 ? void 0 : _b.isPaused) {
                    this.playerHandler.pause();
                }
                else {
                    // If currently not playing, start to play.
                    // This occurs if starting to play from local, but this check is
                    // required if the state is changed remotely.
                    this.playerHandler.play();
                }
            });
            (_d = this.remotePlayerController) === null || _d === void 0 ? void 0 : _d.addEventListener(cast.framework.RemotePlayerEventType.IS_MUTED_CHANGED, () => {
                var _a, _b;
                this.logger.debug("RemotePlayer.IS_MUTED_CHANGED", (_a = this.remotePlayer) === null || _a === void 0 ? void 0 : _a.isMuted);
                if ((_b = this.remotePlayer) === null || _b === void 0 ? void 0 : _b.isMuted) {
                    this.playerHandler.mute();
                }
                else {
                    this.playerHandler.unMute();
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
            class RemoteTarget {
                constructor(playerHandler, remotePlayer, remotePlayerController, context) {
                    this.remotePlayer = remotePlayer;
                    this.remotePlayerController = remotePlayerController;
                    this.currentMediaTime = 0;
                    this.mediaInfo = null;
                    this.isLiveContent = false;
                    this.playerHandler = playerHandler;
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
                load(url) {
                    var _a;
                    console.log("Loading..." + url);
                    let mediaInfo = new chrome.cast.media.MediaInfo(url, "video/mp4");
                    mediaInfo.streamType = chrome.cast.media.StreamType.BUFFERED;
                    mediaInfo.metadata = new chrome.cast.media.TvShowMediaMetadata();
                    mediaInfo.metadata.title = "TODO TITLE";
                    mediaInfo.metadata.subtitle = "TODO SUBTITLE";
                    // mediaInfo.metadata.images = [
                    //   {
                    //     url: MEDIA_SOURCE_ROOT + this.mediaContents[mediaIndex]["thumb"],
                    //   },
                    // ];
                    let request = new chrome.cast.media.LoadRequest(mediaInfo);
                    request.currentTime = this.currentMediaTime;
                    request.autoplay = true;
                    (_a = this.context
                        .getCurrentSession()) === null || _a === void 0 ? void 0 : _a.loadMedia(request).then(() => {
                        console.log("Remote media loaded");
                    }, (errorCode) => {
                        console.log("Remote media load error: " + CastPlayer.getErrorMessage(errorCode));
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
                    this.playerHandler.setTimeString((_a = this.playerHandler.getCurrentMediaTime()) !== null && _a !== void 0 ? _a : 0);
                }
                updateDurationDisplay() {
                    var _a;
                    this.playerHandler.setTimeString((_a = this.playerHandler.getMediaDuration()) !== null && _a !== void 0 ? _a : 0);
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
            // This object will implement PlayerHandler callbacks with
            // remotePlayerController, and makes necessary UI updates specific
            // to remote playback.
            var playerTarget = new RemoteTarget(this.playerHandler, this.remotePlayer, this.remotePlayerController, this.context);
            this.playerHandler.setTarget(playerTarget);
            // Setup remote player properties on setup
            if ((_g = this.remotePlayer) === null || _g === void 0 ? void 0 : _g.isMuted) {
                this.playerHandler.mute();
            }
            // The remote player may have had a volume set from previous playback
            // TODO update volume
            // If resuming a session, take the remote properties and continue the existing
            // playback. Otherwise, load local content.
            if (((_h = this.context.getCurrentSession()) === null || _h === void 0 ? void 0 : _h.getSessionState()) == cast.framework.SessionState.SESSION_RESUMED) {
                console.log("Resuming session");
                this.playerHandler.prepareToPlay();
            }
        }
        /**
         * Select a media content
         * @param {number} mediaIndex A number for media index
         */
        selectMedias(url) {
            console.log("Media index selected: " + url);
            this.currentMediaUrl = url;
            // Clear currentMediaInfo when playing content from the sender.
            this.playerHandler.currentMediaInfo = undefined;
            // Stop timer and reset time displays
            this.stopProgressTimer();
            this.currentMediaTime = 0;
            this.playerHandler.setTimeString(0);
            this.playerHandler.setTimeString(0);
            this.playerHandler.play();
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
            this.playerHandler.seekTo(seekTime);
        }
        /**
         * Set current player volume
         * @param {Event} mouseEvent
         */
        setVolume(pos) {
            this.playerHandler.setVolume(pos);
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
            this.currentMediaTime = this.playerHandler.getCurrentMediaTime();
            this.mediaDuration = this.playerHandler.getMediaDuration();
            this.playerHandler.updateDurationDisplay();
            if (this.mediaDuration == null || this.currentMediaTime < this.mediaDuration || this.isLiveContent) {
                this.playerHandler.updateCurrentTimeDisplay();
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
            this.playerHandler.updateDisplay();
        }
        /**
         * Makes human-readable message from chrome.cast.Error
         * @param {chrome.cast.Error} error
         * @return {string} error message
         */
        static getErrorMessage(error) {
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
            if (license.length > 0 && jwt.length > 0) ;
            castPlayer.playerHandler.load(url);
        });
        (_b = document.getElementById("play")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", () => {
            castPlayer.playerHandler.play();
        });
        (_c = document.getElementById("pause")) === null || _c === void 0 ? void 0 : _c.addEventListener("click", () => {
            castPlayer.playerHandler.pause();
        });
        (_d = document.getElementById("seek")) === null || _d === void 0 ? void 0 : _d.addEventListener("click", () => {
            const position = document.getElementById("position").value;
            castPlayer.playerHandler.seekTo(parseInt(position));
        });
    };

})();
//# sourceMappingURL=bundle.js.map
