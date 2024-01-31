var context = cast.framework.CastReceiverContext.getInstance();
var playerManager = context.getPlayerManager();
Logger.init(cast.debug.CastDebugLogger.getInstance());
setTimeout(function () {
    var playerLogger = new Logger("SmartTvPlayer");
    var player = SmartWebPlayer.getSmartPlayer();
    playerLogger.debug("player init");
    player.init().then(function () {
        playerLogger.debug("player initialized");
        setTimeout(function () {
            playerLogger.debug("set src");
            var url = "https://edge1.salomtv.uz:11610/auth-streaming/3,1e40dbf0de37cb046fb5eb566a4728b8ddd1902c,1706805078,nauman,0-A4654-hls-UNIQCAST,8,8,8,8,8,8,8,8,DESKTOP,318,all,none,default,2.51.51.90/hls/vod/0-A4654-hls-UNIQCAST/playlist.m3u8";
            var licence = "https://edge1.salomtv.uz:11610/drmproxy/wv/license?lat=n2wSNPubbFa3KJEJKdI2QuqEKSBe8h8AXiLPm%2B%2BhEGoPTVnF9GmIN%2FZAUDONkJ3nmVFRb8YEWtV92N4qrxaaQD%2FIwuCFWPGb2IYzXaAOQNmXgjL9d%2BHNq0eT6BuFssXlMerxOJQqJGIa6FLNAKvYP4oFgk2NUluEdKWbc%2Flmh7cTitGBzpCENjqCbW2Y1R6WbFXpw%2Bmfydxydz%2F9oygrQT03q50K3QcYVrITQULRJfyT9C9f%2F3eEi5%2BYBFCv72vy";
            var jwt = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MDY3MjA1MDYsImlhdCI6MTcwNjcxODcwNiwiaXNzIjoidW5pcUNhc3QiLCJzdWIiOiJhY2Nlc3MiLCJkaWQiOjMxOCwiZHVpZCI6IjJhOTJkM2UwLWI1MmYtMTFlZS05NGFjLTQzYTlmYzVjOWE0NCIsIm9pZCI6MSwib3VpZCI6ImRlZmF1bHQiLCJyaWQiOjEsInJvbGUiOlsic3Vic2NyaWJlciJdLCJydWlkIjoiZGVmYXVsdCIsInVpZCI6MSwidmVyc2lvbiI6Mn0.lR2xLytB9CxOGPRh2YuEx6YCx15sxHOWQuxSJTrHeAM";
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
                .then(function () {
                playerLogger.debug("play");
                setTimeout(function () {
                    player
                        .play()
                        .then(function () { return playerLogger.debug("PLAYING"); })
                        .catch(function (e) { return playerLogger.error(e); });
                }, 1000);
            })
                .catch(function (e) { return playerLogger.error(e); });
        }, 1000);
    });
}, 1000);
var playerLogger = new Logger("CastPlayer");
/*
 * Example of how to listen for events on playerManager.
 */
playerManager.addEventListener(cast.framework.events.EventType.ERROR, function (event) {
    playerLogger.error("Detailed Error Code - " + event.detailedErrorCode);
    if (event && event.detailedErrorCode == 905) {
        playerLogger.error("LOAD_FAILED: Verify the load request is set up " + "properly and the media is able to play.");
    }
});
context.start();
