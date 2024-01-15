//--------------------general -----------------------------------------------------
export const meetURLRegex = /(?<id>[a-z0-9]{3,}\-[a-z0-9]{3,}\-[a-z0-9]{3,})/
export const convertToBoolean = (str) => str === 'true'

export function getUrl(url, path) {
  if (path) {
    url = new URL(path, url).toString()
  }

  return url
}

export function sendAndWait(type, data = {}, responceFunction = (d) => d) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ type, ...data }, (r) => {
      resolve(responceFunction(r))
    })
  })
}

export function simulateMute() {
  const OSName = navigator.appVersion.indexOf('Mac') != -1 ? 'MacOS' : 'Other'
  if (OSName == 'MacOS') {
    document.dispatchEvent(
      new KeyboardEvent('keydown', {
        bubbles: true,
        cancelable: true,
        metaKey: true,
        keyCode: 68,
        code: 'KeyD',
      }),
    )
  } else {
    document.dispatchEvent(
      new KeyboardEvent('keydown', {
        bubbles: true,
        cancelable: true,
        ctrlKey: true,
        keyCode: 68,
        code: 'KeyD',
      }),
    )
  }
}
