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
            var url = "https://edge1.salomtv.uz:11610/auth-streaming/3,4f6401171fa250c921e7496b96477673c08388b5,1706966224,nauman,0-A4674-hls-UNIQCAST,8,8,8,8,8,8,8,8,DESKTOP,318,all,none,default,87.201.183.110/hls/vod/0-A4674-hls-UNIQCAST/playlist.m3u8";
            var license = "https://edge2.salomtv.uz:11610/drmproxy/wv/license?lat=n2wSNPubbFa3KJEJKdI2QuqEKSBe8h8AXiLPm%2B%2BhEGoPTVnF9GmIN%2FZAUDONkJ3nmVFRb8YEWtV92N4qrxaaQD%2FIwuCFWPGb2IYzXaAOQNmXgjL9d%2BHNq0eT6BuFssXlE5af2CR0emte%2B6mKZ%2FWovHLm65hxdwP01miqL4eyg0k8G11L13%2B%2BEkwYE1Hoxpla91A4gYg6eNSU5pikhzCXKJqQmkvWQ%2BXI6Hq%2Bh%2B9R%2FUdpIcgLXmJwhDZpUiZNQnpt";
            var jwt = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MDY4ODE2MTksImlhdCI6MTcwNjg3OTgxOSwiaXNzIjoidW5pcUNhc3QiLCJzdWIiOiJhY2Nlc3MiLCJkaWQiOjMxOCwiZHVpZCI6IjJhOTJkM2UwLWI1MmYtMTFlZS05NGFjLTQzYTlmYzVjOWE0NCIsIm9pZCI6MSwib3VpZCI6ImRlZmF1bHQiLCJyaWQiOjEsInJvbGUiOlsic3Vic2NyaWJlciJdLCJydWlkIjoiZGVmYXVsdCIsInVpZCI6MSwidmVyc2lvbiI6Mn0.BRd9yz7ODH7MPYA5FeffF3eB6cEDr9894Xsg-YBxXGc";
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
var castReceiverOptions = new cast.framework.CastReceiverOptions();
castReceiverOptions.skipPlayersLoad = true;
context.start(castReceiverOptions);
