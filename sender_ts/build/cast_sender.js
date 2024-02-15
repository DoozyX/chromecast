// const APP_ID = "72A0DA66";
var APP_ID = "CE104983";
/**
 * @param {?number} timestamp Linux timestamp
 * @return {?string} media time string. Null if time is invalid.
 */
function getMediaTimeString(timestamp) {
    if (timestamp == undefined || timestamp == null) {
        return null;
    }
    var isNegative = false;
    if (timestamp < 0) {
        isNegative = true;
        timestamp *= -1;
    }
    var hours = Math.floor(timestamp / 3600);
    var minutes = Math.floor((timestamp - hours * 3600) / 60);
    var seconds = Math.floor(timestamp - hours * 3600 - minutes * 60);
    var hoursText = hours.toString();
    var minutesText = minutes.toString();
    var secondsText = seconds.toString();
    if (hours < 10)
        hoursText = "0" + hours;
    if (minutes < 10)
        minutesText = "0" + minutes;
    if (seconds < 10)
        secondsText = "0" + seconds;
    return (isNegative ? "-" : "") + hoursText + ":" + minutesText + ":" + secondsText;
}
/**
 * @param {number} timestamp Linux timestamp
 * @return {?string} ClockTime string. Null if time is invalid.
 */
function getClockTimeString(timestamp) {
    if (!timestamp)
        return "0:00:00";
    var date = new Date(timestamp * 1000);
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();
    var ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    // Hour '0' should be '12'
    hours = hours ? hours : 12;
    var minutesText = ("0" + minutes).slice(-2);
    var secondsText = ("0" + seconds).slice(-2);
    var clockTime = hours + ":" + minutesText + ":" + secondsText + " " + ampm;
    return clockTime;
}
var PlayerHandler = /** @class */ (function () {
    function PlayerHandler(castPlayer) {
        this.target = null;
        this.castPlayer = castPlayer;
        this.logger = new Logger("PlayerHandler");
    }
    PlayerHandler.prototype.setTarget = function (target) {
        this.logger.debug("setTarget: ", target);
        this.target = target;
    };
    PlayerHandler.prototype.play = function () {
        this.logger.debug("play");
        this.target.play();
    };
    PlayerHandler.prototype.pause = function () {
        this.logger.debug("pause");
        this.target.pause();
    };
    PlayerHandler.prototype.stop = function () {
        this.logger.debug("stop");
        this.target.stop();
    };
    PlayerHandler.prototype.load = function (url) {
        if (url === void 0) { url = null; }
        this.logger.debug("load: ", url);
        this.target.load(url);
    };
    /**
     * Check if media has been loaded on the target player.
     * @param {number?} mediaIndex The desired media index. If null, verify if
     *  any media is loaded.
     */
    PlayerHandler.prototype.isMediaLoaded = function (mediaIndex) {
        return this.target.isMediaLoaded(mediaIndex);
    };
    /**
     * Called after media has been successfully loaded and is ready to start playback.
     * When local, will start playing the video, start the timer, and update the UI.
     * When remote, will set the UI to PLAYING and start the timer to update the
     *   UI based on remote playback.
     */
    PlayerHandler.prototype.prepareToPlay = function () {
        this.castPlayer.mediaDuration = this.getMediaDuration();
        this.castPlayer.playerHandler.updateDurationDisplay();
        this.play();
        this.castPlayer.startProgressTimer();
        this.updateDisplay();
    };
    PlayerHandler.prototype.getCurrentMediaTime = function () {
        return this.target.getCurrentMediaTime();
    };
    PlayerHandler.prototype.getMediaDuration = function () {
        return this.target.getMediaDuration();
    };
    PlayerHandler.prototype.updateDisplay = function () {
        // Update local variables
        this.currentMediaTime = this.target.getCurrentMediaTime();
        this.mediaDuration = this.target.getMediaDuration();
        this.target.updateDisplay();
    };
    PlayerHandler.prototype.updateCurrentTimeDisplay = function () {
        this.target.updateCurrentTimeDisplay();
    };
    PlayerHandler.prototype.updateDurationDisplay = function () {
        this.target.updateDurationDisplay();
    };
    /**
     * Determines the correct time string (media or clock) and sets it for the given element.
     */
    PlayerHandler.prototype.setTimeString = function (time) {
        this.target.setTimeString(time);
    };
    PlayerHandler.prototype.setVolume = function (volumeSliderPosition) {
        this.target.setVolume(volumeSliderPosition);
    };
    PlayerHandler.prototype.mute = function () {
        this.target.mute();
    };
    PlayerHandler.prototype.unMute = function () {
        this.target.unMute();
    };
    PlayerHandler.prototype.isMuted = function () {
        return this.target.isMuted();
    };
    PlayerHandler.prototype.seekTo = function (time) {
        this.target.seekTo(time);
    };
    return PlayerHandler;
}());
/**
 * Controls if Live stream is played. Controlled by radio button.
 * @type {boolean}
 */
var ENABLE_LIVE = false;
/**
 * Buffer to decide if the live indicator should be displayed to show that
 * playback is at the playback head.
 * @const {number}
 */
var LIVE_INDICATOR_BUFFER = 50;
/**
 * Width of progress bar in pixels.
 * @const {number}
 */
var PROGRESS_BAR_WIDTH = 700;
/**
 * Time in milliseconds for minimal progress update.
 * @const {number}
 */
var TIMER_STEP = 1000;
/**
 * Cast volume upon initial connection.
 * @const {number}
 */
var DEFAULT_VOLUME = 0.5;
/**
 * Height, in pixels, of volume bar.
 * @const {number}
 */
var FULL_VOLUME_HEIGHT = 100;
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
var CastPlayer = /** @class */ (function () {
    function CastPlayer() {
        /**
         * Stops the timer to increment the media progress bar
         */
        this.stopProgressTimer = function () {
            if (this.timer) {
                clearInterval(this.timer);
                this.timer = null;
            }
        };
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
    CastPlayer.prototype.initializeCastPlayer = function () {
        var _this = this;
        this.logger.debug("initializeCastPlayer");
        this.context = cast.framework.CastContext.getInstance();
        var options = {
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
        this.remotePlayerController.addEventListener(cast.framework.RemotePlayerEventType.IS_CONNECTED_CHANGED, function (e) {
            _this.logger.debug("RemotePlayerController.IS_CONNECTED_CHANGED");
            _this.switchPlayer();
        });
    };
    /**
     * Switch between the remote and local players.
     */
    CastPlayer.prototype.switchPlayer = function () {
        this.logger.debug("switchPlayer");
        this.stopProgressTimer();
        // Session is active
        if (cast && cast.framework && this.remotePlayer.isConnected) {
            this.setupRemotePlayer();
        }
    };
    /**
     * Set the PlayerHandler target to use the remote player
     * Add event listeners for player changes which may occur outside sender app.
     */
    CastPlayer.prototype.setupRemotePlayer = function () {
        var _this = this;
        this.logger.debug("setupRemotePlayer");
        // Triggers when the media info or the player state changes
        this.remotePlayerController.addEventListener(cast.framework.RemotePlayerEventType.MEDIA_INFO_CHANGED, function (event) {
            _this.logger.debug("RemotePlayer.MEDIA_INFO_CHANGED", event);
            var session = _this.context.getCurrentSession();
            if (!session) {
                _this.mediaInfo = null;
                _this.isLiveContent = false;
                _this.playerHandler.updateDisplay();
                return;
            }
            var media = session.getMediaSession();
            if (!media) {
                _this.mediaInfo = null;
                _this.isLiveContent = false;
                _this.playerHandler.updateDisplay();
                return;
            }
            _this.mediaInfo = media.media;
            if (_this.mediaInfo) {
                _this.isLiveContent = _this.mediaInfo.streamType == chrome.cast.media.StreamType.LIVE;
            }
            else {
                _this.isLiveContent = false;
            }
            _this.playerHandler.prepareToPlay();
            _this.playerHandler.updateDisplay();
        });
        this.remotePlayerController.addEventListener(cast.framework.RemotePlayerEventType.CAN_SEEK_CHANGED, function (event) {
            _this.logger.debug("RemotePlayer.CAN_SEEK_CHANGED" + event);
        });
        this.remotePlayerController.addEventListener(cast.framework.RemotePlayerEventType.IS_PAUSED_CHANGED, function () {
            _this.logger.debug("RemotePlayer.IS_PAUSED_CHANGED", _this.remotePlayer.isPaused);
            if (_this.remotePlayer.isPaused) {
                _this.playerHandler.pause();
            }
            else {
                // If currently not playing, start to play.
                // This occurs if starting to play from local, but this check is
                // required if the state is changed remotely.
                _this.playerHandler.play();
            }
        });
        this.remotePlayerController.addEventListener(cast.framework.RemotePlayerEventType.IS_MUTED_CHANGED, function () {
            _this.logger.debug("RemotePlayer.IS_MUTED_CHANGED", _this.remotePlayer.isMuted);
            if (_this.remotePlayer.isMuted) {
                _this.playerHandler.mute();
            }
            else {
                _this.playerHandler.unMute();
            }
        });
        this.remotePlayerController.addEventListener(cast.framework.RemotePlayerEventType.VOLUME_LEVEL_CHANGED, function () {
            _this.logger.debug("RemotePlayer.VOLUME_LEVEL_CHANGED", _this.remotePlayer.volumeLevel);
        });
        this.remotePlayerController.addEventListener(cast.framework.RemotePlayerEventType.LIVE_SEEKABLE_RANGE_CHANGED, function (event) {
            console.log("LIVE_SEEKABLE_RANGE_CHANGED");
            _this.liveSeekableRange = event.value;
        });
        var RemoteTarget = /** @class */ (function () {
            function RemoteTarget(playerHandler, remotePlayer, remotePlayerController, context) {
                this.remotePlayer = remotePlayer;
                this.remotePlayerController = remotePlayerController;
                this.currentMediaTime = 0;
                this.mediaInfo = null;
                this.isLiveContent = false;
                this.playerHandler = playerHandler;
                this.context = context;
            }
            RemoteTarget.prototype.play = function () {
                if (this.remotePlayer.isPaused) {
                    this.remotePlayerController.playOrPause();
                }
            };
            RemoteTarget.prototype.pause = function () {
                if (!this.remotePlayer.isPaused) {
                    this.remotePlayerController.playOrPause();
                }
            };
            RemoteTarget.prototype.stop = function () {
                this.remotePlayerController.stop();
            };
            // Load request for local -> remote
            RemoteTarget.prototype.load = function (url) {
                console.log("Loading..." + url);
                var mediaInfo = new chrome.cast.media.MediaInfo(url, "video/mp4");
                mediaInfo.streamType = chrome.cast.media.StreamType.BUFFERED;
                mediaInfo.metadata = new chrome.cast.media.TvShowMediaMetadata();
                mediaInfo.metadata.title = "TODO TITLE";
                mediaInfo.metadata.subtitle = "TODO SUBTITLE";
                // mediaInfo.metadata.images = [
                //   {
                //     url: MEDIA_SOURCE_ROOT + this.mediaContents[mediaIndex]["thumb"],
                //   },
                // ];
                var request = new chrome.cast.media.LoadRequest(mediaInfo);
                request.currentTime = this.currentMediaTime;
                if (ENABLE_LIVE) {
                    // Change the streamType and add live specific metadata.
                    mediaInfo.streamType = chrome.cast.media.StreamType.LIVE;
                    // TODO: Set the metadata on the receiver side in your implementation.
                    // startAbsoluteTime and sectionStartTimeInMedia will be set for you.
                    // See https://developers.google.com/cast/docs/caf_receiver/live.
                    // TODO: Start time, is a fake timestamp. Use correct values for your implementation.
                    var currentTime = new Date();
                    // Convert from milliseconds to seconds.
                    var miliseconds = currentTime.getTime() / 1000;
                    var sectionStartAbsoluteTime = miliseconds;
                    // Duration should be -1 for live streams.
                    mediaInfo.duration = -1;
                    // TODO: Set on the receiver for your implementation.
                    //   mediaInfo.startAbsoluteTime = miliseconds; TODO
                    mediaInfo.metadata.sectionStartAbsoluteTime = sectionStartAbsoluteTime;
                    // TODO: Set on the receiver for your implementation.
                    mediaInfo.metadata.sectionStartTimeInMedia = 0;
                    mediaInfo.metadata.sectionDuration = 100; // TODO Duration;
                    // TODO no queue
                    //   let item = new chrome.cast.media.QueueItem(mediaInfo);
                    //   request.queueData = new chrome.cast.media.QueueData();
                    //   request.queueData.items = [item];
                    //   request.queueData.name = "Sample Queue for Live";
                }
                request.autoplay = true;
                this.context
                    .getCurrentSession()
                    .loadMedia(request)
                    .then(function () {
                    console.log("Remote media loaded");
                }, function (errorCode) {
                    console.log("Remote media load error: " + CastPlayer.getErrorMessage(errorCode));
                    //   this.playerHandler.updateDisplay();
                });
            };
            RemoteTarget.prototype.isMediaLoaded = function (mediaIndex) {
                var session = this.context.getCurrentSession();
                if (!session)
                    return false;
                var media = session.getMediaSession();
                if (!media)
                    return false;
                // No need to verify local mediaIndex content.
                return true;
            };
            /**
             * @return {number?} Current media time for the content. Always returns
             *      media time even if in clock time (conversion done when displaying).
             */
            RemoteTarget.prototype.getCurrentMediaTime = function () {
                if (this.isLiveContent && this.mediaInfo.metadata && this.mediaInfo.metadata.sectionStartTimeInMedia) {
                    return this.remotePlayer.currentTime - this.mediaInfo.metadata.sectionStartTimeInMedia;
                }
                else {
                    // VOD and live scenerios where live metadata is not provided.
                    return this.remotePlayer.currentTime;
                }
            };
            /**
             * @return {number?} media time duration for the content. Always returns
             *      media time even if in clock time (conversion done when displaying).
             */
            RemoteTarget.prototype.getMediaDuration = function () {
                if (this.isLiveContent) {
                    // Scenerios when live metadata is not provided.
                    if (this.mediaInfo.metadata == undefined ||
                        this.mediaInfo.metadata.sectionDuration == undefined ||
                        this.mediaInfo.metadata.sectionStartTimeInMedia == undefined) {
                        return null;
                    }
                    return this.mediaInfo.metadata.sectionDuration;
                }
                else {
                    return this.remotePlayer.duration;
                }
            };
            RemoteTarget.prototype.updateDisplay = function () {
                var castSession = this.context.getCurrentSession();
                if (castSession && castSession.getMediaSession() && castSession.getMediaSession().media) {
                    var media = castSession.getMediaSession();
                    var mediaInfo = media.media;
                    // image placeholder for video view
                    var previewImage = null;
                    if (mediaInfo.metadata && mediaInfo.metadata.images && mediaInfo.metadata.images.length > 0) {
                        previewImage = mediaInfo.metadata.images[0].url;
                    }
                    else {
                        previewImage = null;
                    }
                    var mediaTitle = "";
                    var mediaEpisodeTitle = "";
                    var mediaSubtitle = "";
                    var mediaState = mediaTitle + " on " + castSession.getCastDevice().friendlyName;
                    if (mediaInfo.metadata) {
                        mediaTitle = mediaInfo.metadata.title;
                        mediaEpisodeTitle = mediaInfo.metadata.episodeTitle;
                        // Append episode title if present
                        mediaTitle = mediaEpisodeTitle ? mediaTitle + ": " + mediaEpisodeTitle : mediaTitle;
                        // Do not display mediaTitle if not defined.
                        mediaTitle = mediaTitle ? mediaTitle + " " : "";
                        mediaSubtitle = mediaInfo.metadata.subtitle;
                        mediaSubtitle = mediaSubtitle ? mediaSubtitle + " " : "";
                    }
                }
            };
            RemoteTarget.prototype.updateCurrentTimeDisplay = function () {
                this.playerHandler.setTimeString(this.playerHandler.getCurrentMediaTime());
            };
            RemoteTarget.prototype.updateDurationDisplay = function () {
                this.playerHandler.setTimeString(this.playerHandler.getMediaDuration());
            };
            RemoteTarget.prototype.setTimeString = function (time) {
                var currentTimeString = getMediaTimeString(time);
                // TODO
            };
            // 0 to 1
            RemoteTarget.prototype.setVolume = function (volume) {
                this.remotePlayer.volumeLevel = volume;
                this.remotePlayerController.setVolumeLevel();
            };
            RemoteTarget.prototype.mute = function () {
                if (!this.remotePlayer.isMuted) {
                    this.remotePlayerController.muteOrUnmute();
                }
            };
            RemoteTarget.prototype.unMute = function () {
                if (this.remotePlayer.isMuted) {
                    this.remotePlayerController.muteOrUnmute();
                }
            };
            RemoteTarget.prototype.isMuted = function () {
                return this.remotePlayer.isMuted;
            };
            RemoteTarget.prototype.seekTo = function (time) {
                this.remotePlayer.currentTime = time;
                this.remotePlayerController.seek();
            };
            return RemoteTarget;
        }());
        // This object will implement PlayerHandler callbacks with
        // remotePlayerController, and makes necessary UI updates specific
        // to remote playback.
        var playerTarget = new RemoteTarget(this.playerHandler, this.remotePlayer, this.remotePlayerController, this.context);
        this.playerHandler.setTarget(playerTarget);
        // Setup remote player properties on setup
        if (this.remotePlayer.isMuted) {
            this.playerHandler.mute();
        }
        // The remote player may have had a volume set from previous playback
        // TODO update volume
        // If resuming a session, take the remote properties and continue the existing
        // playback. Otherwise, load local content.
        if (this.context.getCurrentSession().getSessionState() == cast.framework.SessionState.SESSION_RESUMED) {
            console.log("Resuming session");
            this.playerHandler.prepareToPlay();
        }
        else {
            this.playerHandler.load();
        }
    };
    /**
     * Select a media content
     * @param {number} mediaIndex A number for media index
     */
    CastPlayer.prototype.selectMedias = function (url) {
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
    };
    /**
     * Media seek function
     * @param {Event} event An event object from seek
     */
    CastPlayer.prototype.seekMedia = function (seekTime) {
        if (this.mediaDuration == null || (this.context.getCurrentSession() && !this.remotePlayer.canSeek)) {
            console.log("Error - Not seekable");
            return;
        }
        if (this.isLiveContent && !this.liveSeekableRange) {
            console.log("Live content has no seekable range.");
            return;
        }
        this.currentMediaTime = seekTime;
        if (this.isLiveContent) {
            seekTime += this.mediaInfo.metadata.sectionStartTimeInMedia;
        }
        this.playerHandler.seekTo(seekTime);
    };
    /**
     * Set current player volume
     * @param {Event} mouseEvent
     */
    CastPlayer.prototype.setVolume = function (pos) {
        this.playerHandler.setVolume(pos);
    };
    /**
     * Starts the timer to increment the media progress bar
     */
    CastPlayer.prototype.startProgressTimer = function () {
        this.stopProgressTimer();
        // Start progress timer
        this.timer = setInterval(this.incrementMediaTimeHandler, TIMER_STEP);
    };
    /**
     * Increment media current time depending on remote or local playback
     */
    CastPlayer.prototype.incrementMediaTime = function () {
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
    };
    /**
     * Update progress bar and currentTime based on timer
     */
    CastPlayer.prototype.updateProgressBarByTimer = function () {
        // Live situation where the progress and duration is unknown.
        if (this.mediaDuration == null) {
            if (!this.isLiveContent) {
                console.log("Error - Duration is not defined for a VOD stream.");
            }
            var progress = 0;
            return;
        }
        if (this.isLiveContent) {
            if (this.liveSeekableRange) {
                // Use the liveSeekableRange to draw the seekable and unseekable windows
                var seekableMediaPosition = Math.max(this.mediaInfo.metadata.sectionStartTimeInMedia, this.liveSeekableRange.end) -
                    this.mediaInfo.metadata.sectionStartTimeInMedia;
                var unseekableMediaPosition = Math.max(this.mediaInfo.metadata.sectionStartTimeInMedia, this.liveSeekableRange.start) -
                    this.mediaInfo.metadata.sectionStartTimeInMedia;
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
    };
    /**
     *  End playback. Called when media ends.
     */
    CastPlayer.prototype.endPlayback = function () {
        this.currentMediaTime = 0;
        this.stopProgressTimer();
        this.playerHandler.updateDisplay();
    };
    /**
     * Makes human-readable message from chrome.cast.Error
     * @param {chrome.cast.Error} error
     * @return {string} error message
     */
    CastPlayer.getErrorMessage = function (error) {
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
    };
    return CastPlayer;
}());
