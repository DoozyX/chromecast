import { CastPlayer } from "./cast_sender";
import { Logger } from "./logger";

Logger.init();

let castPlayer = new CastPlayer();
window["__onGCastApiAvailable"] = function (isAvailable: boolean) {
  if (isAvailable) {
    castPlayer.initializeCastPlayer();
  }
};

window.onload = function () {
  document.getElementById("load")?.addEventListener("click", () => {
    const url = (document.getElementById("url") as HTMLInputElement).value;
    const license = (document.getElementById("license") as HTMLInputElement).value;
    const jwt = (document.getElementById("jwt") as HTMLInputElement).value;
    if (license.length > 0 && jwt.length > 0) {
      // castPlayer.playerHandler.load(url, {
      //   type: "widevine",
      //   data: {
      //     licenseUrl: license,
      //   },
      //   headers: {
      //     Authorization: jwt,
      //   },
      // });
    }
    castPlayer.playerHandler.load(url);
  });

  document.getElementById("play")?.addEventListener("click", () => {
    castPlayer.playerHandler.play();
  });

  document.getElementById("pause")?.addEventListener("click", () => {
    castPlayer.playerHandler.pause();
  });

  document.getElementById("seek")?.addEventListener("click", () => {
    const position = (document.getElementById("position") as HTMLInputElement).value;

    castPlayer.playerHandler.seekTo(parseInt(position));
  });
};
