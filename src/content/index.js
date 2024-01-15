//------------------------------------ injecting--------------------------------------

import {
  extractParticipantDetails,
  getHostButton,
  getMuteButton,
  injectHTML,
  waitForElementToExist,
} from '../utils/domManipulationUtils'
import { convertToBoolean, sendAndWait, simulateMute } from '../utils'

const injectContent = () => {
  const middleToolBar = document.querySelector('div.lefKC + div>div')
  if (!middleToolBar) return false
  const muteButton = middleToolBar.querySelector(
    'button[aria-label~="microphone" i]',
  )

  if (!muteButton) return false
}

//

async function initializePopUp(participantDetails) {}

//------------------------------------muting--------------------------------------

function updateMuteButton(hasPermission) {
  const muteButton = getMuteButton()
  muteButton.disabled = !hasPermission
  if (
    !convertToBoolean(muteButton.getAttribute('data-is-muted')) &&
    !hasPermission
  ) {
    simulateMute()
  }
}

async function checkParticipant() {
  //This function needs to run on 3 different occations: on loading page, on changing speaking and on changing who has permission
  /* await chrome.runtime.sendMessage({ type: 'getDoc' }, (res) => {
    console.log(res)
  })*/

  await chrome.runtime.sendMessage(
    { type: 'CHECKPERMISSION', participantDetails: {} },
    (res) => {
      console.log(res)
      updateMuteButton(res.canSpeak)
    },
  )
}

function setupMuteObserver(target) {
  const config = {
    attribute: true,
    attributeOldValue: true,
    //attributeFilter: ["data-is-muted"],
  }

  const observer = new MutationObserver(async (l) => {
    console.log(l)
    // observer.disconnect();
    await checkParticipant()
    /* await setTimeout(async () => { //In slower computers this can be exploited. I prefer double reads(that anyway with be alot becuase they will try a lot to press the mute so I anyways need to find a a way to cache reads)
        console.log("g");
        observer.observe(target, config);
      }, 70);*/
  })
  window.onbeforeunload = () => {
    //This makes sure when not too many observers will be created on the browser
    observer.disconnect()
  }
  observer.observe(target, config)

  return observer
}

//-----------------------------------the main function------------------------------------------------------
async function setup() {
  console.log(await sendAndWait('init')) //Waits for the background script to load the document from FS
  console.log('set up!')
  console.log(Boolean(getHostButton()))
  let { participantDetails, isHost, muteSymbol } =
    await extractParticipantDetails()
  console.log(participantDetails)
  console.log(muteSymbol)
  if (participantDetails && muteSymbol) {
    await chrome.runtime.sendMessage(
      { type: 'COOKIES-GET', details: {} },
      (res) => {
        participantDetails.UUID = res.UUID
      },
    )
    console.log(participantDetails)
    await checkParticipant()
    setupMuteObserver(muteSymbol)
    injectHTML() // this will asyncronysly wait until the host opens up the host controls

    await chrome.runtime.sendMessage({ type: 'COOKIES-GET' }, console.log)

    console.log('moving on...')
  } else {
    alert('יש בעיה בדף שלכם, כדאי לטעון מחדש')
  }
}

;(async () => {
  try {
    console.log('b')
    await waitForElementToExist('button[jsname="A5il2e"]')
    console.log('e')
    await setup()
  } catch (err) {
    console.log('failed')
    console.log(err)
  }

  // `tab` will either be a `tabs.Tab` instance or `undefined`.
})()
