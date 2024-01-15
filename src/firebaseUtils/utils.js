import { doc, getDoc, serverTimestamp } from 'firebase/firestore'
import app_db, { FSDocumentHandler, colName } from '.'

export async function createDocument(meetingID, hostUUID) {}

export async function getDocument(meetingID) {
  meetingID.replace('/', '')
  const docRef = doc(app_db, colName, meetingID)
  const docSnapshot = await getDoc(citiesCol)
  console.log(docSnapshot.data())
}

export class MeetingDoc extends FSDocumentHandler {
  /*static async createMeetingDoc(meetingID, hostUUID, updateListener) {
    let meetingStart = await serverTimestamp()
    let meetingData = {
      hostUUID,
      startTime: meetingStart,
    }
    return await FSDocumentHandler.createNewDocument(
      colName,
      meetingData,
      meetingID,
      { updateListener },
    )
  }*/

  constructor({ meetingID, ...extraDetails }) {
    console.log('creating meeting!')
    super({ docCollection: colName, docID: meetingID, ...extraDetails })
  }

  canParticipantSpeak(participantUUID) {
    if (!this.fileExists()) {
      return true
    }
    return (
      participantUUID == this.data?.hostUUID ||
      participantUUID == this.data?.speakingParticipantUUID
    )
  }
  canControlMeeting(UUID) {
    if (!this.fileExists()) {
      return true
    }
    return UUID == this.data.hostUUID
  }
  async initializeMeetingDoc(meetingID, hostUUID) {
    let meetingData = {
      hostUUID,
      startTime: serverTimestamp(),
    }
    await this.setDocument(meetingData)
  }
  async setSpeakingParticipant(participantUUID) {
    await this.updateDocument({ speakingParticipantUUID: participantUUID })
  }
}
