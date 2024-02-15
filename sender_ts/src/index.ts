declare module SmartWebPlayer {
  export function getSmartPlayer(): any;
}

Logger.init();

let castPlayer = new CastPlayer();
window["__onGCastApiAvailable"] = function (isAvailable) {
  if (isAvailable) {
    castPlayer.initializeCastPlayer();
  }
};

window.onload = function () {
  document.getElementById("load").addEventListener("click", () => {
    const url = (document.getElementById("url") as HTMLInputElement).value;
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

  document.getElementById("play").addEventListener("click", () => {
    castPlayer.playerHandler.play();
  });
};
