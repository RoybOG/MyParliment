/*-------------------FIREBASE---------------------------- */

import { collection, doc, getDoc } from 'firebase/firestore'
import { app_db } from '../firebaseUtils'
import { meetURLRegex } from '../utils'

async function getCities() {
  const citiesCol = doc(app_db, 'Meetings', 'rxh-btca-nrw')
  const citySnapshot = await getDoc(citiesCol)
  console.log(citySnapshot.data())
}

getCities()
/* ---------- basic function ---------------------------- */

function getUrl(url, path) {
  if (path) {
    url = new URL(path, url).toString()
  }

  return url
}
/* ---------- basic cookie functions -------------------- */
function formatCookieValue(v) {
  return JSON.stringify(v)
}

function readCookieValue(v) {
  try {
    return JSON.parse(v)
  } catch {
    return v
  }
}

async function getCookie(name, url, path = null) {
  const domainCookies = await chrome.cookies.getAll({
    name,
    url: getUrl(url, path),
  })
  const savedCookie = domainCookies.find((c) => c.path == path)
  console.log(savedCookie)
  if (savedCookie) {
    savedCookie.value = readCookieValue(savedCookie.value)
  }
  return savedCookie
}

async function setCookie(newDetails) {
  console.log(newDetails)
  newDetails.value = formatCookieValue(newDetails.value)

  await chrome.cookies.set(newDetails)
}

async function updateCookie(
  newDetails,
  mergeFunc = (old_v, new_v) => ({ ...old_v, ...new_v }),
) {
  const currentDetails = await getCookie(
    newDetails.name,
    newDetails.url,
    newDetails.path,
  )
  console.log(currentDetails)
  if (currentDetails) {
    newDetails.value = mergeFunc(currentDetails.value, newDetails.value)
    console.log(newDetails)
    await setCookie(newDetails)
  } else {
    await createCookie(
      newDetails.name,
      newDetails.url,
      newDetails.value,
      newDetails.path,
    )
  }
}

async function createCookie(name, url, value, path = null) {
  let currentDate = new Date()
  currentDate.setDate(currentDate.getDate() + 1)
  await setCookie({
    name,
    url,
    value,
    path,
    httpOnly: true,
    secure: true,
    expirationDate: Math.floor(currentDate.getTime() / 1000),
  })
}

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

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  ;(async () => {
    const meetingID = sender.url.match(meetURLRegex).groups.id
    console.log(message.type)
    const cookieValue = await getParticipantCookie(meetingID)
    console.log(canParticipantSpeak(cookieValue))
    switch (message.type) {
      case 'CHECKPERMISSION':
        sendResponse({
          canSpeak: canParticipantSpeak(cookieValue),
        })
        break
      case 'COOKIES-GET':
        sendResponse(cookieValue)
        break
    }
  })()
  return true //https://stackoverflow.com/questions/44056271/chrome-runtime-onmessage-response-with-async-await
})
