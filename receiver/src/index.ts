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
        "https://edge2.salomtv.uz:11610/auth-streaming/3,1caf8af248219cda3f68c84c7cc22d4c06088861,1706944190,nauman,0-A4662-hls-UNIQCAST,8,8,8,8,8,8,8,8,DESKTOP,318,all,none,default,87.201.183.110/hls/vod/0-A4662-hls-UNIQCAST/playlist.m3u8";
      const license =
        "https://edge2.salomtv.uz:11610/drmproxy/wv/license?lat=IkAuKAFqUQmA8j0mvclAkFGBuC3oGgdwEKfdUCywMdg2ls1PK%2B%2FhEN%2FflG6sl64p8uOf5eOexzJAuZoQl1a3LYzOUc4yxSRS0GI4P5cOcnzlx4BSSNeH4%2BINun2VLzuR9MuS1UyhTGlx3XX1Dc0et7Vj89V5RFpD4wPX5DOzWv9unoAdHm811EwVVG0HvyZZpile0zOdXbkkoU0nSd4H32TgmA7Z%2FGXV8QS5PFQgedI%3D";
      const jwt =
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MDY4NTk1NjcsImlhdCI6MTcwNjg1Nzc2NywiaXNzIjoidW5pcUNhc3QiLCJzdWIiOiJhY2Nlc3MiLCJkaWQiOjMxOCwiZHVpZCI6IjJhOTJkM2UwLWI1MmYtMTFlZS05NGFjLTQzYTlmYzVjOWE0NCIsIm9pZCI6MSwib3VpZCI6ImRlZmF1bHQiLCJyaWQiOjEsInJvbGUiOlsic3Vic2NyaWJlciJdLCJydWlkIjoiZGVmYXVsdCIsInVpZCI6MSwidmVyc2lvbiI6Mn0.8dLhHFuzV5uraHfNbEU3Z5KY4kbjQ-0404PJkps_9T4";
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
