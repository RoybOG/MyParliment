import { doc, getDoc } from 'firebase/firestore'
import app_db, { FSDocumentHandler, colName } from '.'

export async function createDocument(meetingID, hostUUID) {}

export async function getDocument(meetingID) {
  meetingID.replace('/', '')
  const docRef = doc(app_db, colName, meetingID)
  const docSnapshot = await getDoc(citiesCol)
  console.log(docSnapshot.data())
}

export class MeetingDoc extends FSDocumentHandler {
  static async createMeetingDoc(meetingID, hostUUID) {
    let meetingData = {
      hostUUID,
      startTime: serverTimestamp(),
    }
    return await FSDocumentHandler.createDocument(
      colName,
      meetingData,
      meetingID,
    )
  }

  constructor(meetingID) {
    console.log('creating meeting!')
    super({ docCollection: colName, docID: meetingID })
  }

  CanParticipantSpeak(participantUUID) {
    if (!this.fileExists) {
      return false
    }
    return (
      participantUUID == this.data?.hostUUID ||
      participantUUID == this.data?.speakingParticipantUUID
    )
  }

  async setSpeakingParticipant(participantUUID) {
    await this.updateDocument({ speakingParticipantUUID: participantUUID })
  }
}

;(async () => {
  let g = await MeetingDoc.loadDocument('rxh-btca-nrw')
  console.log(g.CanParticipantSpeak('abcdefg'))
  console.log(g.CanParticipantSpeak('abcdefg'))
  console.log(g.CanParticipantSpeak('abcdefg'))
  console.log(g.CanParticipantSpeak('abcdefg'))
  console.log(g.CanParticipantSpeak('5t3'))
  //g.setSpeakingParticipant('helloeveryonemyturn')
})()
