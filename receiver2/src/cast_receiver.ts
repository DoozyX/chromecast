import { CastReceiverContext, PlaybackConfig, PlayerManager } from "chromecast-caf-receiver/cast.framework";
import {
  ErrorData,
  ErrorReason,
  ErrorType,
  LoadRequestData,
  MessageType,
  RequestData,
  SeekRequestData,
} from "chromecast-caf-receiver/cast.framework.messages";
import { EventType, MediaElementEvent, ErrorEvent } from "chromecast-caf-receiver/cast.framework.events";
import { CastDebugLogger } from "chromecast-caf-receiver/cast.debug";
// import { framework } from "chromecast-caf-receiver";
import { Logger } from "./logger";

import SmartWebPlayer from "../external/smart-web-player";

export class CastReceiver {
  private readonly _context: CastReceiverContext;
  private readonly _playerManager: PlayerManager;

  private readonly logger: Logger;
  private readonly _player: SmartWebPlayer.BasePlayer;

  constructor() {
    this._context = CastReceiverContext.getInstance();
    this._playerManager = this._context.getPlayerManager();
    this._player = SmartWebPlayer.getSmartPlayer();
    this._player.init();

    this.logger = new Logger("UCast Receiver", CastDebugLogger.getInstance());

    // Provide an interceptor for LOAD messages.
    this._playerManager.setMessageInterceptor(MessageType.LOAD, this.handleLoad);
    this._playerManager.setMessageInterceptor(MessageType.PAUSE, this.handlePause);
    this._playerManager.setMessageInterceptor(MessageType.PLAY, this.handlePlay);
    this._playerManager.setMessageInterceptor(MessageType.SEEK, this.handleSeek);

    // Add basic event listeners
    this._playerManager.addEventListener(EventType.PLAY, this.handlePlayEvent);
    this._playerManager.addEventListener(EventType.PAUSE, this.handlePauseEvent);
    this._playerManager.addEventListener(EventType.ERROR, this.handleErrorEvent);
  }

  // Start receiving requests from senders.
  public start() {
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

  // Setup playbackConfig with a sourceDescription license information passed by loadRequestData.
  private readonly handleLoad = (loadRequestData: LoadRequestData) => {
    this.logger.debug("LOAD event received", loadRequestData);
    // If the loadRequestData is incomplete, return an error message
    if (!loadRequestData || !loadRequestData.media) {
      const error = new ErrorData(ErrorType.LOAD_FAILED);
      error.reason = ErrorReason.INVALID_REQUEST;
      this.logger.error("LOAD_FAILED: Verify the load request is set up properly and the media is able to play.");
      return error;
    }

    const contentId = loadRequestData.media.contentId;
    const contentUrl = loadRequestData.media.contentUrl;
    this.logger.debug("received contentId", contentId, "contentUrl", contentUrl);
    return this._player.setSrc(contentId);

    // Check for sourceDescription
    // const sourceDescription = loadRequestData?.customData?.sourceDescription;
    // const selectedSource = sourceDescription?.sources?.find((source: any) => {
    //   return source.src === loadRequestData.media.contentId || source.src === loadRequestData.media.contentUrl;
    // });
    // if (selectedSource) {
    //   const playbackConfig = Object.assign(new PlaybackConfig(), this._playerManager.getPlaybackConfig());

    //   // Check for contentProtection (DRM)
    //   const contentProtection = selectedSource.contentProtection ?? selectedSource.drm;
    //   if (contentProtection) {
    //     // Enrich playbackConfig with contentProtection properties.
    //     // createContentProtectionConfigEnricher(contentProtection)?.enrich(playbackConfig); TODO
    //   }

    //   // Set an optional manifest request handler
    //   playbackConfig.manifestRequestHandler = (_request: framework.NetworkRequestInfo) => {
    //     // request.url = `<proxy>${request.url}`;
    //   };

    //   // Set an optional segment request handler
    //   playbackConfig.segmentRequestHandler = (_request: framework.NetworkRequestInfo) => {
    //     // request.url = `<proxy>${request.url}`;
    //   };

    //   this._playerManager.setPlaybackConfig(playbackConfig);
    // }

    // return loadRequestData;
  };

  private readonly handlePlay = (event: RequestData): any => {
    this.logger.debug("PLAY received");
    this._player.play();
    return null;
  };

  private readonly handlePause = (event: RequestData): any => {
    this.logger.debug("PAUSE received");
    this._player.pause();
    return null;
  };

  private readonly handleSeek = (event: SeekRequestData): any => {
    this.logger.debug("SEEK  received", event.currentTime);
    this._player.seekTo(event.currentTime ?? 0);
  };

  private readonly handlePlayEvent = (event: MediaElementEvent): void => {
    this.logger.debug("PLAY event received", event.currentMediaTime);
    this._player.play();
  };

  private readonly handlePauseEvent = (event: MediaElementEvent): void => {
    this.logger.debug("PAUSE event received", event.currentMediaTime);
  };

  private readonly handleErrorEvent = (event: ErrorEvent): void => {
    this.logger.error("Detailed Error Code - " + event.detailedErrorCode);
  };
}
