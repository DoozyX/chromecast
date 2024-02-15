// const APP_ID = "72A0DA66";
const APP_ID = "CE104983";

/** @enum {string} Constants of states for media for both local and remote playback */
/**
 * PlayerHandler
 *
 * This is a handler through which the application will interact
 * with both the RemotePlayer and LocalPlayer. Combining these two into
 * one interface is one approach to the dual-player nature of a Cast
 * Chrome application. Otherwise, the state of the RemotePlayer can be
 * queried at any time to decide whether to interact with the local
 * or remote players.
 *
 * To set the player used, implement the following methods for a target object
 * and call setTarget(target).
 *
 * Methods to implement:
 *  - play()
 *  - pause()
 *  - stop()
 *  - seekTo(time)
 *  - load(mediaIndex)
 *  - isMediaLoaded(mediaIndex)
 *  - getMediaDuration()
 *  - getCurrentMediaTime()
 *  - setVolume(volumeSliderPosition)
 *  - mute()
 *  - unMute()
 *  - isMuted()
 *  - updateDisplay()
 *  - updateCurrentTimeDisplay()
 *  - updateDurationDisplay()
 *  - setTimeString( time)
 */
interface PlayerTarget {
  play(): void;
  pause(): void;
  stop(): void;
  seekTo(time: number): void;
  load(url: string): void;
  isMediaLoaded(url: string): boolean;
  getMediaDuration(): number;
  getCurrentMediaTime(): number;
  setVolume(volumeSliderPosition: number): void;
  mute(): void;
  unMute(): void;
  isMuted(): boolean;
  updateDisplay(): void;
  updateCurrentTimeDisplay(): void;
  updateDurationDisplay(): void;
  setTimeString(time: number): void;
}

/**
 * @param {?number} timestamp Linux timestamp
 * @return {?string} media time string. Null if time is invalid.
 */
function getMediaTimeString(timestamp: number) {
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

  if (hours < 10) hoursText = "0" + hours;
  if (minutes < 10) minutesText = "0" + minutes;
  if (seconds < 10) secondsText = "0" + seconds;

  return (isNegative ? "-" : "") + hoursText + ":" + minutesText + ":" + secondsText;
}

/**
 * @param {number} timestamp Linux timestamp
 * @return {?string} ClockTime string. Null if time is invalid.
 */
function getClockTimeString(timestamp: number) {
  if (!timestamp) return "0:00:00";

  let date = new Date(timestamp * 1000);
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let seconds = date.getSeconds();
  let ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  // Hour '0' should be '12'
  hours = hours ? hours : 12;
  const minutesText = ("0" + minutes).slice(-2);
  const secondsText = ("0" + seconds).slice(-2);
  let clockTime = hours + ":" + minutesText + ":" + secondsText + " " + ampm;
  return clockTime;
}

class PlayerHandler {
  public castPlayer: CastPlayer;
  public target?: PlayerTarget;
  public currentMediaTime?: number;
  public mediaDuration?: number;
  public currentMediaInfo?: any;
  public logger: Logger;
  constructor(castPlayer: CastPlayer) {
    this.target = null;
    this.castPlayer = castPlayer;
    this.logger = new Logger("PlayerHandler");
  }

  public setTarget(target) {
    this.logger.debug("setTarget: ", target);
    this.target = target;
  }

  public play() {
    this.logger.debug("play");
    this.target.play();
  }

  public pause() {
    this.logger.debug("pause");
    this.target.pause();
  }

  public stop() {
    this.logger.debug("stop");
    this.target.stop();
  }

  public load(url = null) {
    this.logger.debug("load: ", url);
    this.target.load(url);
  }

  /**
   * Check if media has been loaded on the target player.
   * @param {number?} mediaIndex The desired media index. If null, verify if
   *  any media is loaded.
   */
  public isMediaLoaded(mediaIndex) {
    return this.target.isMediaLoaded(mediaIndex);
  }

  /**
   * Called after media has been successfully loaded and is ready to start playback.
   * When local, will start playing the video, start the timer, and update the UI.
   * When remote, will set the UI to PLAYING and start the timer to update the
   *   UI based on remote playback.
   */
  public prepareToPlay() {
    this.castPlayer.mediaDuration = this.getMediaDuration();
    this.castPlayer.playerHandler.updateDurationDisplay();

    this.play();
    this.castPlayer.startProgressTimer();
    this.updateDisplay();
  }

  public getCurrentMediaTime() {
    return this.target.getCurrentMediaTime();
  }

  public getMediaDuration() {
    return this.target.getMediaDuration();
  }

  public updateDisplay() {
    // Update local variables
    this.currentMediaTime = this.target.getCurrentMediaTime();
    this.mediaDuration = this.target.getMediaDuration();

    this.target.updateDisplay();
  }

  public updateCurrentTimeDisplay() {
    this.target.updateCurrentTimeDisplay();
  }

  public updateDurationDisplay() {
    this.target.updateDurationDisplay();
  }

  /**
   * Determines the correct time string (media or clock) and sets it for the given element.
   */
  public setTimeString(time) {
    this.target.setTimeString(time);
  }

  public setVolume(volumeSliderPosition) {
    this.target.setVolume(volumeSliderPosition);
  }

  public mute() {
    this.target.mute();
  }

  public unMute() {
    this.target.unMute();
  }

  public isMuted() {
    return this.target.isMuted();
  }

  public seekTo(time) {
    this.target.seekTo(time);
  }
}

/**
 * Controls if Live stream is played. Controlled by radio button.
 * @type {boolean}
 */
let ENABLE_LIVE = false;

/**
 * Buffer to decide if the live indicator should be displayed to show that
 * playback is at the playback head.
 * @const {number}
 */
const LIVE_INDICATOR_BUFFER = 50;

/**
 * Width of progress bar in pixels.
 * @const {number}
 */
const PROGRESS_BAR_WIDTH = 700;

/**
 * Time in milliseconds for minimal progress update.
 * @const {number}
 */
const TIMER_STEP = 1000;

/**
 * Cast volume upon initial connection.
 * @const {number}
 */
const DEFAULT_VOLUME = 0.5;

/**
 * Height, in pixels, of volume bar.
 * @const {number}
 */
const FULL_VOLUME_HEIGHT = 100;

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
  public logger: Logger;
  public playerHandler: PlayerHandler;
  public remotePlayer?: cast.framework.RemotePlayer;
  public remotePlayerController?: cast.framework.RemotePlayerController;
  public currentMediaTime?: number;
  public mediaDuration?: number;
  public timer?: number;
  public incrementMediaTimeHandler?: Function;
  public seekMediaListener?: Function;
  public currentMediaUrl?: string;

  public mediaInfo?: chrome.cast.media.MediaInfo;
  public liveSeekableRange?: chrome.cast.media.LiveSeekableRange;
  public isLiveContent?: boolean;
  public context: cast.framework.CastContext;

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

  public initializeCastPlayer() {
    this.logger.debug("initializeCastPlayer");
    this.context = cast.framework.CastContext.getInstance();
    const options: cast.framework.CastOptions = {
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
  public switchPlayer() {
    this.logger.debug("switchPlayer");

    this.stopProgressTimer();

    // Session is active
    if (cast && cast.framework && this.remotePlayer.isConnected) {
      this.setupRemotePlayer();
    }
  }

  /**
   * Set the PlayerHandler target to use the remote player
   * Add event listeners for player changes which may occur outside sender app.
   */
  public setupRemotePlayer() {
    this.logger.debug("setupRemotePlayer");
    // Triggers when the media info or the player state changes
    this.remotePlayerController.addEventListener(cast.framework.RemotePlayerEventType.MEDIA_INFO_CHANGED, (event) => {
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
      } else {
        this.isLiveContent = false;
      }

      this.playerHandler.prepareToPlay();

      this.playerHandler.updateDisplay();
    });

    this.remotePlayerController.addEventListener(cast.framework.RemotePlayerEventType.CAN_SEEK_CHANGED, (event) => {
      this.logger.debug("RemotePlayer.CAN_SEEK_CHANGED" + event);
    });

    this.remotePlayerController.addEventListener(cast.framework.RemotePlayerEventType.IS_PAUSED_CHANGED, () => {
      this.logger.debug("RemotePlayer.IS_PAUSED_CHANGED", this.remotePlayer.isPaused);
      if (this.remotePlayer.isPaused) {
        this.playerHandler.pause();
      } else {
        // If currently not playing, start to play.
        // This occurs if starting to play from local, but this check is
        // required if the state is changed remotely.
        this.playerHandler.play();
      }
    });

    this.remotePlayerController.addEventListener(cast.framework.RemotePlayerEventType.IS_MUTED_CHANGED, () => {
      this.logger.debug("RemotePlayer.IS_MUTED_CHANGED", this.remotePlayer.isMuted);
      if (this.remotePlayer.isMuted) {
        this.playerHandler.mute();
      } else {
        this.playerHandler.unMute();
      }
    });

    this.remotePlayerController.addEventListener(cast.framework.RemotePlayerEventType.VOLUME_LEVEL_CHANGED, () => {
      this.logger.debug("RemotePlayer.VOLUME_LEVEL_CHANGED", this.remotePlayer.volumeLevel);
    });

    this.remotePlayerController.addEventListener(
      cast.framework.RemotePlayerEventType.LIVE_SEEKABLE_RANGE_CHANGED,
      (event) => {
        console.log("LIVE_SEEKABLE_RANGE_CHANGED");
        this.liveSeekableRange = event.value;
      },
    );

    class RemoteTarget implements PlayerTarget {
      private remotePlayer: cast.framework.RemotePlayer;
      private remotePlayerController: cast.framework.RemotePlayerController;
      private currentMediaTime: number;
      private mediaInfo: chrome.cast.media.MediaInfo;
      private isLiveContent: boolean;
      public castPlayer: CastPlayer;
      public target?: PlayerTarget;
      public currentMediaInfo?: any;
      public playerHandler: PlayerHandler;
      public context: cast.framework.CastContext;

      constructor(
        playerHandler: PlayerHandler,
        remotePlayer: cast.framework.RemotePlayer,
        remotePlayerController: cast.framework.RemotePlayerController,
        context: cast.framework.CastContext,
      ) {
        this.remotePlayer = remotePlayer;
        this.remotePlayerController = remotePlayerController;
        this.currentMediaTime = 0;
        this.mediaInfo = null;
        this.isLiveContent = false;
        this.playerHandler = playerHandler;
        this.context = context;
      }

      public play() {
        if (this.remotePlayer.isPaused) {
          this.remotePlayerController.playOrPause();
        }
      }

      public pause() {
        if (!this.remotePlayer.isPaused) {
          this.remotePlayerController.playOrPause();
        }
      }

      public stop() {
        this.remotePlayerController.stop();
      }

      // Load request for local -> remote
      public load(url: string) {
        console.log("Loading..." + url);

        let mediaInfo = new chrome.cast.media.MediaInfo(
          url,
          "video/mp4", // TODO: fix type
        );
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

        if (ENABLE_LIVE) {
          // Change the streamType and add live specific metadata.
          mediaInfo.streamType = chrome.cast.media.StreamType.LIVE;
          // TODO: Set the metadata on the receiver side in your implementation.
          // startAbsoluteTime and sectionStartTimeInMedia will be set for you.
          // See https://developers.google.com/cast/docs/caf_receiver/live.

          // TODO: Start time, is a fake timestamp. Use correct values for your implementation.
          let currentTime = new Date();
          // Convert from milliseconds to seconds.
          let miliseconds = currentTime.getTime() / 1000;
          let sectionStartAbsoluteTime = miliseconds;

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
          .then(
            () => {
              console.log("Remote media loaded");
            },
            (errorCode) => {
              console.log("Remote media load error: " + CastPlayer.getErrorMessage(errorCode));
              //   this.playerHandler.updateDisplay();
            },
          );
      }

      public isMediaLoaded(mediaIndex) {
        let session = this.context.getCurrentSession();
        if (!session) return false;

        let media = session.getMediaSession();
        if (!media) return false;

        // No need to verify local mediaIndex content.
        return true;
      }

      /**
       * @return {number?} Current media time for the content. Always returns
       *      media time even if in clock time (conversion done when displaying).
       */
      public getCurrentMediaTime() {
        if (this.isLiveContent && this.mediaInfo.metadata && this.mediaInfo.metadata.sectionStartTimeInMedia) {
          return this.remotePlayer.currentTime - this.mediaInfo.metadata.sectionStartTimeInMedia;
        } else {
          // VOD and live scenerios where live metadata is not provided.
          return this.remotePlayer.currentTime;
        }
      }

      /**
       * @return {number?} media time duration for the content. Always returns
       *      media time even if in clock time (conversion done when displaying).
       */
      public getMediaDuration() {
        if (this.isLiveContent) {
          // Scenerios when live metadata is not provided.
          if (
            this.mediaInfo.metadata == undefined ||
            this.mediaInfo.metadata.sectionDuration == undefined ||
            this.mediaInfo.metadata.sectionStartTimeInMedia == undefined
          ) {
            return null;
          }

          return this.mediaInfo.metadata.sectionDuration;
        } else {
          return this.remotePlayer.duration;
        }
      }

      public updateDisplay() {
        let castSession = this.context.getCurrentSession();
        if (castSession && castSession.getMediaSession() && castSession.getMediaSession().media) {
          let media = castSession.getMediaSession();
          let mediaInfo = media.media;

          // image placeholder for video view
          let previewImage: string = null;
          if (mediaInfo.metadata && mediaInfo.metadata.images && mediaInfo.metadata.images.length > 0) {
            previewImage = mediaInfo.metadata.images[0].url;
          } else {
            previewImage = null;
          }

          let mediaTitle = "";
          let mediaEpisodeTitle = "";
          let mediaSubtitle = "";

          let mediaState = mediaTitle + " on " + castSession.getCastDevice().friendlyName;

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
      }

      public updateCurrentTimeDisplay() {
        this.playerHandler.setTimeString(this.playerHandler.getCurrentMediaTime());
      }

      public updateDurationDisplay() {
        this.playerHandler.setTimeString(this.playerHandler.getMediaDuration());
      }

      public setTimeString(time) {
        let currentTimeString = getMediaTimeString(time);
        // TODO
      }

      // 0 to 1
      public setVolume(volume) {
        this.remotePlayer.volumeLevel = volume;
        this.remotePlayerController.setVolumeLevel();
      }

      public mute() {
        if (!this.remotePlayer.isMuted) {
          this.remotePlayerController.muteOrUnmute();
        }
      }

      public unMute() {
        if (this.remotePlayer.isMuted) {
          this.remotePlayerController.muteOrUnmute();
        }
      }

      public isMuted() {
        return this.remotePlayer.isMuted;
      }

      public seekTo(time) {
        this.remotePlayer.currentTime = time;
        this.remotePlayerController.seek();
      }
    }

    // This object will implement PlayerHandler callbacks with
    // remotePlayerController, and makes necessary UI updates specific
    // to remote playback.
    var playerTarget = new RemoteTarget(
      this.playerHandler,
      this.remotePlayer,
      this.remotePlayerController,
      this.context,
    );

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
    } else {
      this.playerHandler.load();
    }
  }

  /**
   * Select a media content
   * @param {number} mediaIndex A number for media index
   */
  public selectMedias(url: string) {
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
  public seekMedia(seekTime: number) {
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
  }

  /**
   * Set current player volume
   * @param {Event} mouseEvent
   */
  public setVolume(pos: number) {
    this.playerHandler.setVolume(pos);
  }

  /**
   * Starts the timer to increment the media progress bar
   */
  public startProgressTimer() {
    this.stopProgressTimer();

    // Start progress timer
    this.timer = setInterval(this.incrementMediaTimeHandler, TIMER_STEP);
  }

  /**
   * Stops the timer to increment the media progress bar
   */
  public stopProgressTimer = function () {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  };

  /**
   * Increment media current time depending on remote or local playback
   */
  public incrementMediaTime() {
    // First sync with the current player's time
    this.currentMediaTime = this.playerHandler.getCurrentMediaTime();
    this.mediaDuration = this.playerHandler.getMediaDuration();

    this.playerHandler.updateDurationDisplay();

    if (this.mediaDuration == null || this.currentMediaTime < this.mediaDuration || this.isLiveContent) {
      this.playerHandler.updateCurrentTimeDisplay();
      this.updateProgressBarByTimer();
    } else if (this.mediaDuration > 0) {
      this.endPlayback();
    }
  }

  /**
   * Update progress bar and currentTime based on timer
   */
  public updateProgressBarByTimer() {
    // Live situation where the progress and duration is unknown.
    if (this.mediaDuration == null) {
      if (!this.isLiveContent) {
        console.log("Error - Duration is not defined for a VOD stream.");
      }

      const progress = 0;
      return;
    }

    if (this.isLiveContent) {
      if (this.liveSeekableRange) {
        // Use the liveSeekableRange to draw the seekable and unseekable windows
        let seekableMediaPosition =
          Math.max(this.mediaInfo.metadata.sectionStartTimeInMedia, this.liveSeekableRange.end) -
          this.mediaInfo.metadata.sectionStartTimeInMedia;

        let unseekableMediaPosition =
          Math.max(this.mediaInfo.metadata.sectionStartTimeInMedia, this.liveSeekableRange.start) -
          this.mediaInfo.metadata.sectionStartTimeInMedia;
      }
    }

    var pp = Math.floor(this.currentMediaTime / this.mediaDuration);
    if (pp > 1) {
      pp = 1;
    } else if (pp < 0) {
      pp = 0;
    }

    if (pp >= 1 && !this.isLiveContent) {
      this.endPlayback();
    }
  }

  /**
   *  End playback. Called when media ends.
   */
  public endPlayback() {
    this.currentMediaTime = 0;
    this.stopProgressTimer();
    this.playerHandler.updateDisplay();
  }

  /**
   * Makes human-readable message from chrome.cast.Error
   * @param {chrome.cast.Error} error
   * @return {string} error message
   */
  public static getErrorMessage(error) {
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
        return (
          "No receiver was compatible with the session request." + (error.description ? " :" + error.description : "")
        );
      case chrome.cast.ErrorCode.SESSION_ERROR:
        return (
          "A session could not be created, or a session was invalid." +
          (error.description ? " :" + error.description : "")
        );
      case chrome.cast.ErrorCode.TIMEOUT:
        return "The operation timed out." + (error.description ? " :" + error.description : "");
      default:
        return error;
    }
  }
}
