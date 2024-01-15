import { convertToBoolean, sendAndWait } from '.'
import '../content/injectedStyles.css'
export const getHostButton = () =>
  document.querySelector('div[jscontroller="upoJje"] button')

export const getMuteButton = () =>
  document.querySelector(
    'div.Tmb7Fd button[data-is-muted][aria-label*="מיקרופון" i],button[data-is-muted][aria-label*="microphone" i]', //להוסיף לשפות אחרות
  )

function createFullElement(element, attributes, inner) {
  console.log(element)
  let el = document.createElement(element)
  if (typeof attributes === 'object') {
    for (let key in attributes) {
      el.setAttribute(key, attributes[key])
    }
  }
  if (typeof inner == 'string') {
    el.innerText = inner
  } else if (Array.isArray(inner)) {
    let innerEl

    for (let innerElDetails of inner) {
      console.log(innerElDetails)
      console.log(typeof innerElDetails)
      if (typeof innerElDetails == 'object') {
        innerEl = createFullElement(
          innerElDetails.element,
          innerElDetails.attributes,
          innerElDetails.inner,
        )
      } else {
        innerEl = document.createElement(innerElDetails)
      }
      el.appendChild(innerEl)
    }
  }

  return el
}

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

async function startMeeting() {
  if (await sendAndWait('createMeetDoc')) {
    alert('הדיון התחיל בהצלחה! אתה מנחה הדיון!')
  } else {
    alert(
      'לא הצלחת להתחיל את הדיון, או שמנחה אחר כבר התחיל או שהמערכת לא הצליחה! נסה מאוחר יותר!',
    )
  }
}

async function setHostControls() {
  if (!(await sendAndWait('canCreateMeetDoc'))) {
    console.log('file does exist')
    return
  }
  const hostControlsButton = getHostButton()
  if (!hostControlsButton) return null
  let extControls = createFullElement(
    'section',
    {
      id: 'ExtHostControls',
    },
    [
      {
        element: 'div',
        attributes: { class: 'qNFnn', style: 'text-align: left;' },
        inner: 'My Parliment',
      },
      {
        element: 'button',
        inner: 'להתחלת הדיון',
      },
    ],
  )
  extControls.querySelector('button').addEventListener('click', startMeeting)
  hostControlsButton.addEventListener('click', async function (e) {
    if (convertToBoolean(this.getAttribute('aria-pressed'))) return
    console.log('opening')
    let hostControlsPanel = await waitForElementToExist('div.ddBMJb')
    console.log(hostControlsPanel)
    console.log('creating')
    await setTimeout(() => {
      //tHIS AWWAIT
      hostControlsPanel.appendChild(extControls)
    }, 500)
    console.log(extControls)
  })
}

function injectHead() {
  const docHead = document.querySelector('head')
  docHead.innerHTML +=
    '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=David+Libre:wght@700&display=swap" rel="stylesheet">'
}

export function injectHTML() {
  injectHead()
  setHostControls()
}

export async function extractParticipantDetails() {
  try {
    let participentList = await waitForElementToExist(
      'div.m3Uzve.RJRKn',
      () => {
        document.querySelector('button[data-promo-anchor-id="GEUYHe"]').click()
      },
    )

    let youLabel = await waitForElementToExist(
      'div.m3Uzve.RJRKn div.VfPpkd-aGsRMb span.NnTWjc',
      () => {
        participentList.querySelector('div[role="button"]').click()
      },
    )
    let youItem = youLabel.closest('div[role="listitem"]')
    return {
      participantDetails: {
        username: youLabel.previousSibling?.textContent,
        profileLink: youItem.querySelector('img')?.src,
        googleID: youItem.getAttribute('data-participant-id'),
      },
      isHost: Boolean(getHostButton()),
      muteSymbol: youItem.querySelector('div[jscontroller="mUJV5"]'),
    }
  } catch (err) {
    alert('This page is corrupted, can you please refresh the page?')
    console.log(err)
    return {
      participantDetails: null,
    }
    //Later when I'll read the username and password from the storage, if I don't find it or it is deleted, I'll show the same message and ask the user to refresh the page. I won't read again, only when the original DOM is loaded to prevent the user from corrupting the DOM and thus the save.
  }
}
/*

*/
