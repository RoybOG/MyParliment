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
function oldCanParticipantSpeak(participantDetails) {
  return (
    participantDetails.UUID == spreakingParticipant.UUID ||
    participantDetails.UUID == hostParticipant.UUID
  )
}

async function setUpDoc(meetingID) {
  //This function saves unnececery reads of the same doc by saveing it with closure. It creates a function environment to engage with the document and only when that document updates it will update the doc in the closure memory. This will save a lot of money down the road
  // const meetingID = 'nbn-gotf-izh'
  console.log(meetingID)
  let docObj = await MeetingDoc.loadDocument({ meetingID })
  console.log(docObj)
  return docObj
}

function timeout(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function setUpListener() {
  let docObj = null //Saves the docment object in a closure of this function
  let cookieValue = null
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    ;(async () => {
      const meetingID = sender.url.match(meetURLRegex).groups.id
      console.log(message.type)

      console.log(cookieValue)
      switch (message.type) {
        case 'init':
          cookieValue = await getParticipantCookie(meetingID) //Could be a case where a user sends a request to thid before a document is loaded, so an admin can create a document, becuase he pressed fast enough before it
          docObj = await setUpDoc(meetingID)
          sendResponse('Document Set!')
          break
        case 'CHECKPERMISSION':
          sendResponse({
            canSpeak: docObj.canParticipantSpeak(cookieValue.UUID),
            //oldCanParticipantSpeak(cookieValue),
          })
          break
        case 'COOKIES-GET':
          sendResponse(cookieValue)
          break
        case 'canCreateMeetDoc':
          console.log(docObj)
          console.log(docObj?.canControlMeeting(cookieValue.UUID))
          sendResponse(docObj?.canControlMeeting(cookieValue.UUID))
          break
        case 'createMeetDoc':
          if (docObj?.fileExists()) {
            sendResponse(false)
          } else {
            try {
              docObj = await MeetingDoc.createMeetingDoc(
                meetingID,
                cookieValue.UUID,
              )
              sendResponse(docObj?.fileExists())
            } catch (err) {
              console.log(err)
              sendResponse(false)
            }
          }
          break
      }
    })()
    return true //https://stackoverflow.com/questions/44056271/chrome-runtime-onmessage-response-with-async-await
  })
}

function setup() {
  setUpListener()
}

setup()
