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
            var url = "https://edge1.salomtv.uz:11610/auth-streaming/3,125141f2cea7377d4b7e0a35f6c5faeeeb7d2b2b,1706862317,nauman,0-A4674-hls-UNIQCAST,8,8,8,8,8,8,8,8,DESKTOP,318,all,none,default,2.51.51.90/hls/vod/0-A4674-hls-UNIQCAST/playlist.m3u8";
            var license = "https://edge1.salomtv.uz:11610/drmproxy/wv/license?lat=IkAuKAFqUQmA8j0mvclAkO5NLygYpPGYNH%2FHik%2FMDakObuEApWxbOjRM13HTpYtZHiC4Kp%2FScVH0Md%2FVbd4cbqW2imywRqD4RSOCIOq4TRY4ZIzM0Aiejq6LH%2BrEsDbE80PpfVfx1iAlQPlPfW86egBKDFHORaS773NaTzV8Et7xP8VmEzm8oLYIsljV5KFOe5bRaN9L7KrinvUYEO3kXGrT9q3VfhAYhFjqx0oIvGv9UTk7BHgeX3Th6F7htPe4";
            var jwt = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MDY3Nzc2ODYsImlhdCI6MTcwNjc3NTg4NiwiaXNzIjoidW5pcUNhc3QiLCJzdWIiOiJhY2Nlc3MiLCJkaWQiOjMxOCwiZHVpZCI6IjJhOTJkM2UwLWI1MmYtMTFlZS05NGFjLTQzYTlmYzVjOWE0NCIsIm9pZCI6MSwib3VpZCI6ImRlZmF1bHQiLCJyaWQiOjEsInJvbGUiOlsic3Vic2NyaWJlciJdLCJydWlkIjoiZGVmYXVsdCIsInVpZCI6MSwidmVyc2lvbiI6Mn0.QYVUoz11GKk0lCmi60dhTQzRz1_SDoQvKaSAl1ratsE";
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
