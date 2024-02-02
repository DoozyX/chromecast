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
        "https://edge3.salomtv.uz:11610/auth-streaming/3,f048c2f0141b30e3fab1a382d2693db34a50ae1a,1706941571,nauman,0-A4684-hls-UNIQCAST,8,8,8,8,8,8,8,8,DESKTOP,318,all,none,default,87.201.183.110/hls/vod/0-A4684-hls-UNIQCAST/playlist.m3u8";
      const license =
        "https://edge3.salomtv.uz:11610/drmproxy/wv/license?lat=IkAuKAFqUQmA8j0mvclAkIDxWY6zX0id6Clbv20%2BCm8WoGUNdR9jhdUXYBJjZG0udKDceFXUVRB3WUtICkJPHMJZWggBptDLRYki%2BqBSgox82Sbq7LuQ8UaS91EmuKwGecpauLof2tpfGy1RnSj2Y9yJw3V05ahPjK3IqN0Gv8K2SOcotRDrTmz6YgLBn0HRH3HWzkDOG5rQmx2U6%2FJe1zkuIpjFINMSeSsYAP1M8XAEsX468oMUD1nRqnM%2BEo1l";
      const jwt =
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MDY4NTY1NjAsImlhdCI6MTcwNjg1NDc2MCwiaXNzIjoidW5pcUNhc3QiLCJzdWIiOiJhY2Nlc3MiLCJkaWQiOjMxOCwiZHVpZCI6IjJhOTJkM2UwLWI1MmYtMTFlZS05NGFjLTQzYTlmYzVjOWE0NCIsIm9pZCI6MSwib3VpZCI6ImRlZmF1bHQiLCJyaWQiOjEsInJvbGUiOlsic3Vic2NyaWJlciJdLCJydWlkIjoiZGVmYXVsdCIsInVpZCI6MSwidmVyc2lvbiI6Mn0.fjOc2IeMxSyF3My_ZZVQE8u5AJMrXSM1W8nF3-HxrMM";
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

context.start();
