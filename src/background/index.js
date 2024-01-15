/*-------------------FIREBASE---------------------------- */

import { doc, getDoc, onSnapshot } from 'firebase/firestore'
import app_db, { colName } from '../firebaseUtils/'
import { getUrl, meetURLRegex } from '../utils'
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

function _setUpListener() {
  let docObj = null //Saves the docment object in a closure of this function
  let cookieValue = null
  let meetingTabID = null
  async function setUpDoc(meetingID, participantUUID) {
    //This function saves unnececery reads of the same doc by saveing it with closure. It creates a function environment to engage with the document and only when that document updates it will update the doc in the closure memory. This will save a lot of money down the road
    // const meetingID = 'nbn-gotf-izh'
    console.log(meetingID)
    const tabURL = getUrl('https://meet.google.com', meetingID)
    let docObj = await MeetingDoc.loadDocument({
      meetingID,
      updateListener: async (st, obj) => {
        // const [tab] = await chrome.tabs.query({
        //   //Right now there's a bug that this doesn't work in incognito mode!! FIX!!!!! also a bug where scripts don't work when the window is too small!
        //   url: [tabURL, tabURL + '?*'],
        // })
        console.log(meetingTabID)
        await chrome.tabs.sendMessage(meetingTabID, {
          type: 'documentUpdated',
          canSpeak: obj?.canParticipantSpeak(participantUUID),
        })
      },
    })
    console.log(docObj)
    return docObj
  }

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    ;(async () => {
      const meetingID = sender.url.match(meetURLRegex).groups.id
      console.log(sender.tab.id)
      switch (message.type) {
        case 'init':
          meetingTabID = sender.tab.id //Everytime "init" is always called the user is on the tab where the google meeting is. so if a participant closes the tab and opens it from a new one, "init" will be called again and the tab id will be updated
          cookieValue = await getParticipantCookie(meetingID) //Could be a case where a user sends a request to thid before a document is loaded, so an admin can create a document, becuase he pressed fast enough before it
          docObj = await setUpDoc(meetingID, cookieValue.UUID)

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
              await docObj.initializeMeetingDoc(meetingID, cookieValue.UUID)
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
  _setUpListener()
}

setup()
