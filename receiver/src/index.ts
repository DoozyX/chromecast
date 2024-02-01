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
        "https://edge2.salomtv.uz:11610/auth-streaming/3,1682b6c258dc5ff0b0309c90f857c3a44a86f5cb,1706866124,nauman,0-A4684-hls-UNIQCAST,8,8,8,8,8,8,8,8,DESKTOP,318,all,none,default,2.51.51.90/hls/vod/0-A4684-hls-UNIQCAST/playlist.m3u8";
      const license =
        "https://edge2.salomtv.uz:11610/drmproxy/wv/license?lat=IkAuKAFqUQmA8j0mvclAkIDxWY6zX0id6Clbv20%2BCm8WoGUNdR9jhdUXYBJjZG0udKDceFXUVRB3WUtICkJPHMJZWggBptDLRYki%2BqBSgox82Sbq7LuQ8UaS91EmuKwGn%2FWz0WzDD6QpXqP%2Bfq5Rx4K6c1BxvUUgLT4YyfkKXwTFWpMQAgTvj4XJ2zaxOPhWkdSZFQ5ZS2PP%2BNAFTy2wc7G%2FsdKeJB0%2FRlPce6eIC%2Frr%2F4ihvg0oc7Z66t%2Fd66Pb";
      const jwt =
        "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MDY3ODEzODEsImlhdCI6MTcwNjc3OTU4MSwiaXNzIjoidW5pcUNhc3QiLCJzdWIiOiJhY2Nlc3MiLCJkaWQiOjMxOCwiZHVpZCI6IjJhOTJkM2UwLWI1MmYtMTFlZS05NGFjLTQzYTlmYzVjOWE0NCIsIm9pZCI6MSwib3VpZCI6ImRlZmF1bHQiLCJyaWQiOjEsInJvbGUiOlsic3Vic2NyaWJlciJdLCJydWlkIjoiZGVmYXVsdCIsInVpZCI6MSwidmVyc2lvbiI6Mn0.uiFp0epW5_ssY3_khtbxm89Yl6Oo1uHkQH-QYWrmino";
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
