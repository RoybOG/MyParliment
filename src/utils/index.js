//--------------------general -----------------------------------------------------
export const meetURLRegex = /(?<id>[a-z0-9]{3,}\-[a-z0-9]{3,}\-[a-z0-9]{3,})/
export const convertToBoolean = (str) => str === 'true'

export function waitForElementToExist(selector, ifNotExists = () => {}) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector))
    }
    ifNotExists()
    // setTimeout(reject, 30000);
    const observer = new MutationObserver(() => {
      if (document.querySelector(selector)) {
        resolve(document.querySelector(selector))
        observer.disconnect()
      }
    })

    observer.observe(document.body, {
      subtree: true,
      childList: true,
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
