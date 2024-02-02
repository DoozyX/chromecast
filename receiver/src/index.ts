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
      const url =
        "https://edge1.salomtv.uz:11610/auth-streaming/3,4f6401171fa250c921e7496b96477673c08388b5,1706966224,nauman,0-A4674-hls-UNIQCAST,8,8,8,8,8,8,8,8,DESKTOP,318,all,none,default,87.201.183.110/hls/vod/0-A4674-hls-UNIQCAST/playlist.m3u8";
      const license =
        "https://edge1.salomtv.uz:11610/drmproxy/wv/license?lat=IkAuKAFqUQmA8j0mvclAkO5NLygYpPGYNH%2FHik%2FMDakObuEApWxbOjRM13HTpYtZHiC4Kp%2FScVH0Md%2FVbd4cbqW2imywRqD4RSOCIOq4TRY4ZIzM0Aiejq6LH%2BrEsDbESa4QtvzLtEH%2Bz5AAFmQGPtQTpY2ePugl5rb0z5Eno3JrchfN%2BdXMHeEwJ2rm1Naej3nLb8biV2U2HHEFS0V9lZA%2BOwxp1jZYX1ySaHUio6%2Fg8ILFG3wUh3Kma219Fjpk";
      const jwt =
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MDY4ODE2MTksImlhdCI6MTcwNjg3OTgxOSwiaXNzIjoidW5pcUNhc3QiLCJzdWIiOiJhY2Nlc3MiLCJkaWQiOjMxOCwiZHVpZCI6IjJhOTJkM2UwLWI1MmYtMTFlZS05NGFjLTQzYTlmYzVjOWE0NCIsIm9pZCI6MSwib3VpZCI6ImRlZmF1bHQiLCJyaWQiOjEsInJvbGUiOlsic3Vic2NyaWJlciJdLCJydWlkIjoiZGVmYXVsdCIsInVpZCI6MSwidmVyc2lvbiI6Mn0.BRd9yz7ODH7MPYA5FeffF3eB6cEDr9894Xsg-YBxXGc";
      player
        .setSrc(url, {
          type: "widevine",
          data: {
            licenseUrl: license,
          },
          headers: {
            Authorization: jwt,
          },
        })
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
castReceiverOptions.skipPlayersLoad = true;

context.start(castReceiverOptions);
