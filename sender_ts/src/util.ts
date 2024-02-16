/**
 * @param {?number} timestamp Linux timestamp
 * @return {?string} media time string. Null if time is invalid.
 */
export function getMediaTimeString(timestamp: number) {
  if (timestamp == undefined || timestamp == null) {
    return null;
  }

  let isNegative = false;
  if (timestamp < 0) {
    isNegative = true;
    timestamp *= -1;
  }

  let hours = Math.floor(timestamp / 3600);
  let minutes = Math.floor((timestamp - hours * 3600) / 60);
  let seconds = Math.floor(timestamp - hours * 3600 - minutes * 60);

  let hoursText = hours.toString();
  let minutesText = minutes.toString();
  let secondsText = seconds.toString();

  if (hours < 10) hoursText = "0" + hours;
  if (minutes < 10) minutesText = "0" + minutes;
  if (seconds < 10) secondsText = "0" + seconds;

  return (isNegative ? "-" : "") + hoursText + ":" + minutesText + ":" + secondsText;
}

/**
 * @param {number} timestamp Linux timestamp
 * @return {?string} ClockTime string. Null if time is invalid.
 */
export function getClockTimeString(timestamp: number) {
  if (!timestamp) return "0:00:00";

  let date = new Date(timestamp * 1000);
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let seconds = date.getSeconds();
  let ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  // Hour '0' should be '12'
  hours = hours ? hours : 12;
  const minutesText = ("0" + minutes).slice(-2);
  const secondsText = ("0" + seconds).slice(-2);
  let clockTime = hours + ":" + minutesText + ":" + secondsText + " " + ampm;
  return clockTime;
}

/**
 * Makes human-readable message from chrome.cast.Error
 * @param {chrome.cast.Error} error
 * @return {string} error message
 */
export function getErrorMessage(error: chrome.cast.Error) {
  switch (error.code) {
    case chrome.cast.ErrorCode.API_NOT_INITIALIZED:
      return "The API is not initialized." + (error.description ? " :" + error.description : "");
    case chrome.cast.ErrorCode.CANCEL:
      return "The operation was canceled by the user" + (error.description ? " :" + error.description : "");
    case chrome.cast.ErrorCode.CHANNEL_ERROR:
      return "A channel to the receiver is not available." + (error.description ? " :" + error.description : "");
    case chrome.cast.ErrorCode.EXTENSION_MISSING:
      return "The Cast extension is not available." + (error.description ? " :" + error.description : "");
    case chrome.cast.ErrorCode.INVALID_PARAMETER:
      return "The parameters to the operation were not valid." + (error.description ? " :" + error.description : "");
    case chrome.cast.ErrorCode.RECEIVER_UNAVAILABLE:
      return (
        "No receiver was compatible with the session request." + (error.description ? " :" + error.description : "")
      );
    case chrome.cast.ErrorCode.SESSION_ERROR:
      return (
        "A session could not be created, or a session was invalid." +
        (error.description ? " :" + error.description : "")
      );
    case chrome.cast.ErrorCode.TIMEOUT:
      return "The operation timed out." + (error.description ? " :" + error.description : "");
    default:
      return error;
  }
}
