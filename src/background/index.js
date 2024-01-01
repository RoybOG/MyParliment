/*-------------------FIREBASE---------------------------- */

import { doc, getDoc, onSnapshot } from 'firebase/firestore'
import app_db, { colName } from '../firebaseUtils/'
import { meetURLRegex } from '../utils'
import { createCookie, getCookie } from './cookieApi'
import { MeetingDoc } from '../firebaseUtils/utils'

/* ---------- basic function ---------------------------- */

/* ---------- functions for background -------------------- */
const PARTICIPANT_COOKIE_NAME = 'Participant'
const COOKIE_URL = 'https://meet.google.com'

async function getParticipantCookie(path) {
  if (path[0] != '/') path = '/' + path
  const currentDetails = await getCookie(
    PARTICIPANT_COOKIE_NAME,
    COOKIE_URL,
    path,
  )
  let participantData
  console.log(currentDetails)
  if (currentDetails) {
    participantData = currentDetails.value
  } else {
    //a new Participant!
    participantData = { UUID: crypto.randomUUID() }
    await createCookie(
      PARTICIPANT_COOKIE_NAME,
      COOKIE_URL,
      participantData,
      path,
    )
  }
  return participantData
}

const spreakingParticipant = {
  UUID: '40516d44-d010-407d-9eaa-84aa79564dcd',
}
const hostParticipant = {
  UUID: '8f288464-21a3-44ea-9192-b897c5264159',
}
function canParticipantSpeak(participantDetails) {
  return (
    participantDetails.UUID == spreakingParticipant.UUID ||
    participantDetails.UUID == hostParticipant.UUID
  )
}

async function setUpDoc() {
  //This function saves unnececery reads of the same doc by saveing it with closure. It creates a function environment to engage with the document and only when that document updates it will update the doc in the closure memory. This will save a lot of money down the road
  const meetingID = 'rxh-btca-nrw'
  let docObj = new MeetingDoc(meetingID)
  return docObj
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  ;(async () => {
    const meetingID = sender.url.match(meetURLRegex).groups.id
    console.log(message.type)
    const cookieValue = await getParticipantCookie(meetingID)
    let docObj
    console.log(canParticipantSpeak(cookieValue))
    switch (message.type) {
      case 'init':
        docObj = setUpDoc()
        sendResponse(true)
        break
      case 'CHECKPERMISSION':
        sendResponse({
          canSpeak: docObj ? docObj.canParticipantSpeak(cookieValue) : true,
        })
        break
      case 'COOKIES-GET':
        sendResponse(cookieValue)
        break
    }
  })()
  return true //https://stackoverflow.com/questions/44056271/chrome-runtime-onmessage-response-with-async-await
})
