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
        "https://edge2.salomtv.uz:11610/auth-streaming/3,b7fa9376a92877a97c7e56eb63849d02e172113a,1706800362,nauman,0-A4654-hls-UNIQCAST,8,8,8,8,8,8,8,8,DESKTOP,318,all,none,default,2.51.51.90/hls/vod/0-A4654-hls-UNIQCAST/playlist.m3u8";
      const licence =
        "https://edge2.salomtv.uz:11610/drmproxy/wv/license?lat=n2wSNPubbFa3KJEJKdI2QuqEKSBe8h8AXiLPm%2B%2BhEGoPTVnF9GmIN%2FZAUDONkJ3nmVFRb8YEWtV92N4qrxaaQD%2FIwuCFWPGb2IYzXaAOQNmXgjL9d%2BHNq0eT6BuFssXlYbebHGJ40QrLir%2Fs5tWs%2FHBoGav1hKCzyJPWlhCI1RURXCZzoOZEuqA7zUB1tvbY5cG5sITCb4b0Mx2JZbCHsOqAEfWJmDX3EcquXx1MLrPl9gFfHeCIdT7h8caAegQ7";
      const jwt =
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MDY3MTU2NjksImlhdCI6MTcwNjcxMzg2OSwiaXNzIjoidW5pcUNhc3QiLCJzdWIiOiJhY2Nlc3MiLCJkaWQiOjMxOCwiZHVpZCI6IjJhOTJkM2UwLWI1MmYtMTFlZS05NGFjLTQzYTlmYzVjOWE0NCIsIm9pZCI6MSwib3VpZCI6ImRlZmF1bHQiLCJyaWQiOjEsInJvbGUiOlsic3Vic2NyaWJlciJdLCJydWlkIjoiZGVmYXVsdCIsInVpZCI6MSwidmVyc2lvbiI6Mn0.Rt7CRO-LW-PhpNrymzqdQ-Hyk81P-xuk4yU1Ikz9vyo";
      player
        .setSrc(url, {
          type: "widevine",
          data: {
            licenseUrl: licence,
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

context.start();