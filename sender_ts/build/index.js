Logger.init();
var castPlayer = new CastPlayer();
window["__onGCastApiAvailable"] = function (isAvailable) {
    if (isAvailable) {
        castPlayer.initializeCastPlayer();
    }
};
window.onload = function () {
    document.getElementById("load").addEventListener("click", function () {
        var url = document.getElementById("url").value;
        // const license = document.getElementById("license").value;
        // const jwt = document.getElementById("jwt").value;
        castPlayer.playerHandler.load(url);
        // castPlayer.playerHandler.load(url, {
        //   type: "widevine",
        //   data: {
        //     licenseUrl: license,
        //   },
        //   headers: {
        //     Authorization: jwt,
        //   },
    });
    document.getElementById("play").addEventListener("click", function () {
        castPlayer.playerHandler.play();
    });
};
