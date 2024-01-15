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
  static async createMeetingDoc(meetingID, hostUUID, updateListener) {
    let meetingData = {
      hostUUID,
      startTime: serverTimestamp(),
    }
    return await FSDocumentHandler.createNewDocument(
      colName,
      meetingData,
      meetingID,
      { updateListener },
    )
  }

  constructor(meetingID) {
    console.log('creating meeting!')
    super({ docCollection: colName, docID: meetingID })
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
  async setSpeakingParticipant(participantUUID) {
    await this.updateDocument({ speakingParticipantUUID: participantUUID })
  }
}

;(async () => {
  let g = await MeetingDoc.loadDocument('rxh-btca-nrw')
  console.log(g.canParticipantSpeak('abcdefg'))
  console.log(g.canParticipantSpeak('abcdefg'))
  console.log(g.canParticipantSpeak('abcdefg'))
  console.log(g.canParticipantSpeak('abcdefg'))
  console.log(g.canParticipantSpeak('5t3'))
  //g.setSpeakingParticipant('helloeveryonemyturn')
})()
