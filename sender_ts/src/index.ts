import { CastPlayer } from "./cast_sender";
import { Logger } from "./logger";

Logger.init();

let castPlayer = new CastPlayer();
window["__onGCastApiAvailable"] = function (isAvailable: boolean) {
  if (isAvailable) {
    castPlayer.initializeCastPlayer();
  }
};

export { castPlayer, CastPlayer };
