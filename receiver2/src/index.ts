declare module SmartWebPlayer {
  export function getSmartPlayer(): any;
}

const context = cast.framework.CastReceiverContext.getInstance();

const playerManager = context.getPlayerManager();

Logger.init(cast.debug.CastDebugLogger.getInstance());
setTimeout(() => {
  const playerLogger = new Logger("SmartTvPlayer");
  const player = SmartWebPlayer.getSmartPlayer();
  playerLogger.debug("player init");
  player.init().then(() => {
    playerLogger.debug("player initialized");
    setTimeout(() => {
      playerLogger.debug("set src");
      const url = "https://storage.googleapis.com/cpe-sample-media/content/big_buck_bunny/prog/big_buck_bunny_prog.mp4";
      player
        .setSrc(url)
        .then(() => {
          playerLogger.debug("play");
          setTimeout(() => {
            player
              .play()
              .then(() => playerLogger.debug("PLAYING"))
              .catch((e) => playerLogger.error(e));
          }, 1000);
        })
        .catch((e) => playerLogger.error(e));
    }, 1000);
  });
}, 1000);

const playerLogger = new Logger("CastPlayer");
/*
 * Example of how to listen for events on playerManager.
 */
playerManager.addEventListener(cast.framework.events.EventType.ERROR, (event) => {
  playerLogger.error("Detailed Error Code - " + event.detailedErrorCode);
  if (event && event.detailedErrorCode == 905) {
    playerLogger.error("LOAD_FAILED: Verify the load request is set up " + "properly and the media is able to play.");
  }
});

let castReceiverOptions = new cast.framework.CastReceiverOptions();
// Do not load unnecessary JS files for players we don't need.
castReceiverOptions.skipPlayersLoad = true;

// Disable the idle timeout. Note that this is something actually useful to have, but it should
// be easy to implement with some bookkeeping and `setTimeout`.
castReceiverOptions.disableIdleTimeout = true;

// Enable basic media commands.
castReceiverOptions.supportedCommands = cast.framework.messages.Command.ALL_BASIC_MEDIA;

// Optional, maximize the debug level to diagnose problems.
// context.setLoggerLevel(cast.framework.LoggerLevel.DEBUG);
context.start(castReceiverOptions);
