//--------------------general -----------------------------------------------------
const meetURLRegex = /(?<id>[a-z0-9]{3,}\-[a-z0-9]{3,}\-[a-z0-9]{3,})/;
const convertToBoolean = str => str === 'true';
function getUrl(url, path) {
  if (path) {
    url = new URL(path, url).toString();
  }
  return url;
}
function simulateMute() {
  const OSName = navigator.appVersion.indexOf('Mac') != -1 ? 'MacOS' : 'Other';
  if (OSName == 'MacOS') {
    document.dispatchEvent(new KeyboardEvent('keydown', {
      bubbles: true,
      cancelable: true,
      metaKey: true,
      keyCode: 68,
      code: 'KeyD'
    }));
  } else {
    document.dispatchEvent(new KeyboardEvent('keydown', {
      bubbles: true,
      cancelable: true,
      ctrlKey: true,
      keyCode: 68,
      code: 'KeyD'
    }));
  }
}

export { convertToBoolean as c, getUrl as g, meetURLRegex as m, simulateMute as s };
