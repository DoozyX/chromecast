import { Drm } from "./drm";
import { PlayerTarget } from "./player_target";
import { getErrorMessage, getMediaTimeString } from "./util";

export class RemoteTarget implements PlayerTarget {
  private remotePlayer: cast.framework.RemotePlayer;
  private remotePlayerController: cast.framework.RemotePlayerController;
  private currentMediaTime: number;
  private mediaInfo: chrome.cast.media.MediaInfo | null;
  private isLiveContent: boolean;
  public target?: PlayerTarget;
  public currentMediaInfo?: any;
  public context: cast.framework.CastContext;

  constructor(
    remotePlayer: cast.framework.RemotePlayer,
    remotePlayerController: cast.framework.RemotePlayerController,
    context: cast.framework.CastContext,
  ) {
    this.remotePlayer = remotePlayer;
    this.remotePlayerController = remotePlayerController;
    this.currentMediaTime = 0;
    this.mediaInfo = null;
    this.isLiveContent = false;
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
  public load(url: string, drm?: Drm) {
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

    this.context
      .getCurrentSession()
      ?.loadMedia(request)
      .then(
        () => {
          console.log("Remote media loaded");
        },
        (errorCode) => {
          console.log("Remote media load error: " + getErrorMessage(errorCode));
          //   this.playerHandler.updateDisplay();
        },
      );
  }

  public isMediaLoaded(url: string) {
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
    if (this.isLiveContent && this.mediaInfo?.metadata && this.mediaInfo.metadata.sectionStartTimeInMedia) {
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
        this.mediaInfo?.metadata == undefined ||
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
    if (castSession && castSession.getMediaSession() && castSession.getMediaSession()?.media) {
      let media = castSession.getMediaSession();
      let mediaInfo = media?.media;

      // image placeholder for video view
      let previewImage: string | null = null;
      if (mediaInfo?.metadata && mediaInfo.metadata.images && mediaInfo.metadata.images.length > 0) {
        previewImage = mediaInfo.metadata.images[0].url;
      } else {
        previewImage = null;
      }

      let mediaTitle = "";
      let mediaEpisodeTitle = "";
      let mediaSubtitle = "";

      let mediaState = mediaTitle + " on " + castSession.getCastDevice().friendlyName;

      if (mediaInfo?.metadata) {
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
    this.setTimeString(this.getCurrentMediaTime() ?? 0);
  }

  public updateDurationDisplay() {
    this.setTimeString(this.getMediaDuration() ?? 0);
  }

  public setTimeString(time: number) {
    let currentTimeString = getMediaTimeString(time);
    // TODO
  }

  // 0 to 1
  public setVolume(volume: number) {
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

  public seekTo(time: number) {
    this.remotePlayer.currentTime = time;
    this.remotePlayerController.seek();
  }
}
