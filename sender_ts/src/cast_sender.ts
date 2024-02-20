import "chromecast-caf-sender";
import { Logger } from "./logger";
import { APP_ID, TIMER_STEP } from "./config";
import { RemoteTarget } from "./remote_target";
import { PlayerTarget } from "./player_target";

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
export class CastPlayer {
  public logger: Logger;
  public player!: PlayerTarget;
  public remotePlayer?: cast.framework.RemotePlayer | null;
  public remotePlayerController?: cast.framework.RemotePlayerController | null;
  public currentMediaTime?: number | null;
  public mediaDuration?: number | null;
  public timer?: number | null;
  public incrementMediaTimeHandler?: Function | null;
  public seekMediaListener?: Function | null;
  public currentMediaUrl?: string | null;

  public mediaInfo?: chrome.cast.media.MediaInfo | null;
  public liveSeekableRange?: chrome.cast.media.LiveSeekableRange | null;
  public isLiveContent?: boolean | null;
  public context!: cast.framework.CastContext;

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

  public viewElement() {
    this.logger.debug("[Player viewElement]");
    const castButton = document.createElement("google-cast-launcher");
    castButton.id = "cast_button";

    return castButton;
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
      this.stopProgressTimer();
      // Session is active
      if (cast && cast.framework && this.remotePlayer?.isConnected) {
        this.setupRemotePlayer();
      }
    });
    this.player = new RemoteTarget(this.remotePlayer, this.remotePlayerController, this.context);
  }

  public prepareToPlay() {
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
  public setupRemotePlayer() {
    this.logger.debug("setupRemotePlayer");
    // Triggers when the media info or the player state changes
    this.remotePlayerController?.addEventListener(cast.framework.RemotePlayerEventType.MEDIA_INFO_CHANGED, (event) => {
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
      } else {
        this.isLiveContent = false;
      }

      this.prepareToPlay();

      this.player.updateDisplay();
    });

    this.remotePlayerController?.addEventListener(cast.framework.RemotePlayerEventType.CAN_SEEK_CHANGED, (event) => {
      this.logger.debug("RemotePlayer.CAN_SEEK_CHANGED", event);
    });

    this.remotePlayerController?.addEventListener(cast.framework.RemotePlayerEventType.IS_PAUSED_CHANGED, () => {
      this.logger.debug("RemotePlayer.IS_PAUSED_CHANGED", this.remotePlayer?.isPaused);
      if (this.remotePlayer?.isPaused) {
        this.player.pause();
      } else {
        // If currently not playing, start to play.
        // This occurs if starting to play from local, but this check is
        // required if the state is changed remotely.
        this.player.play();
      }
    });

    this.remotePlayerController?.addEventListener(cast.framework.RemotePlayerEventType.IS_MUTED_CHANGED, () => {
      this.logger.debug("RemotePlayer.IS_MUTED_CHANGED", this.remotePlayer?.isMuted);
      if (this.remotePlayer?.isMuted) {
        this.player.mute();
      } else {
        this.player.unMute();
      }
    });

    this.remotePlayerController?.addEventListener(cast.framework.RemotePlayerEventType.VOLUME_LEVEL_CHANGED, () => {
      this.logger.debug("RemotePlayer.VOLUME_LEVEL_CHANGED", this.remotePlayer?.volumeLevel);
    });

    this.remotePlayerController?.addEventListener(
      cast.framework.RemotePlayerEventType.LIVE_SEEKABLE_RANGE_CHANGED,
      (event) => {
        console.log("LIVE_SEEKABLE_RANGE_CHANGED");
        this.liveSeekableRange = event.value;
      },
    );

    // Setup remote player properties on setup
    if (this.remotePlayer?.isMuted) {
      this.player.mute();
    }

    // The remote player may have had a volume set from previous playback
    // TODO update volume

    // If resuming a session, take the remote properties and continue the existing
    // playback. Otherwise, load local content.
    if (this.context.getCurrentSession()?.getSessionState() == cast.framework.SessionState.SESSION_RESUMED) {
      console.log("Resuming session");
      this.prepareToPlay();
    } else {
      // this.playerHandler.load(url);
    }
  }

  /**
   * Select a media content
   * @param {number} mediaIndex A number for media index
   */
  public selectMedias(url: string) {
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
  public seekMedia(seekTime: number) {
    if (this.mediaDuration == null || (this.context.getCurrentSession() && !this.remotePlayer?.canSeek)) {
      console.log("Error - Not seekable");
      return;
    }

    if (this.isLiveContent && !this.liveSeekableRange) {
      console.log("Live content has no seekable range.");
      return;
    }

    this.currentMediaTime = seekTime;

    if (this.isLiveContent) {
      seekTime += this.mediaInfo?.metadata.sectionStartTimeInMedia;
    }

    this.player.seekTo(seekTime);
  }

  /**
   * Set current player volume
   * @param {Event} mouseEvent
   */
  public setVolume(pos: number) {
    this.player.setVolume(pos);
  }

  /**
   * Starts the timer to increment the media progress bar
   */
  public startProgressTimer() {
    this.stopProgressTimer();

    // Start progress timer
    this.timer = setInterval(this.incrementMediaTimeHandler!, TIMER_STEP);
  }

  /**
   * Stops the timer to increment the media progress bar
   */
  public stopProgressTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  /**
   * Increment media current time depending on remote or local playback
   */
  public incrementMediaTime() {
    // First sync with the current player's time
    this.currentMediaTime = this.player.getCurrentMediaTime();
    this.mediaDuration = this.player.getMediaDuration();

    this.player.updateDurationDisplay();

    if (this.mediaDuration == null || this.currentMediaTime! < this.mediaDuration || this.isLiveContent) {
      this.player.updateCurrentTimeDisplay();
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
          Math.max(this.mediaInfo?.metadata.sectionStartTimeInMedia, this.liveSeekableRange.end!) -
          this.mediaInfo?.metadata.sectionStartTimeInMedia;

        let unseekableMediaPosition =
          Math.max(this.mediaInfo?.metadata.sectionStartTimeInMedia, this.liveSeekableRange.start!) -
          this.mediaInfo?.metadata.sectionStartTimeInMedia;
      }
    }

    var pp = Math.floor(this.currentMediaTime! / this.mediaDuration);
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
    this.player.updateDisplay();
  }
}
