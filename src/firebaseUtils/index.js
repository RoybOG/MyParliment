import { initializeApp } from 'firebase/app'
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  addDoc,
  setDoc,
  onSnapshot,
  Firestore,
  FieldValue,
  updateDoc,
} from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyDQ2YdNfoOKyoOYYNF_c9LfPtuQOFK6L6w',
  authDomain: 'my-parliment.firebaseapp.com',
  projectId: 'my-parliment',
  storageBucket: 'my-parliment.appspot.com',
  messagingSenderId: '169128924060',
  appId: '1:169128924060:web:a0ae3f156b5a499cf7ae59',
}
const colName = 'Meetings'
const app = initializeApp(firebaseConfig)
const app_db = getFirestore(app)

export class FSDocumentHandler {
  #docRef
  static dbRef = app_db

  static async loadDocument(docDetails) {
    console.log(docDetails)
    let docObj = new this(docDetails) //waits till the object gets it's first
    await docObj.loads
    return docObj
  }
  static async createNewDocument(
    docCollection,
    data,
    docID = null,
    extraDetails = {},
  ) {
    let docRef
    if (!docCollection) throw 'no collection specified!'

    if (docID) {
      docRef = doc(FSDocumentHandler.dbRef, docCollection, docID)
      await setDoc(docRef, data)
    } else {
      docRef = await addDoc(
        collection(FSDocumentHandler.dbRef, docCollection),
        data,
      )
    }
    let docObj = await FSDocumentHandler.loadDocument({
      docRef,
      ...extraDetails,
    })
    await docObj.loads
    return docObj
  }

  constructor({ docCollection, docID, docRef, updateListener }) {
    this.#docRef = docRef || doc(FSDocumentHandler.dbRef, docCollection, docID)
    // console.log(this.#docRef)
    this.data = null
    this.loaded = false
    this.loads = new Promise((resolve, reject) => {
      onSnapshot(this.#docRef, (st) => {
        console.log(st.data())
        this.data = st.data()
        if (updateListener) {
          updateListener(st, this)
        }
        this.loaded = true
        resolve(st.data())
      })
    })
  }

  fileExists() {
    console.log('file Exists!!!!')
    return Boolean(this.data)
  }
  async updateDocument(newData) {
    await updateDoc(this.#docRef, newData)
  }

  async setDocument(newData) {
    await setDoc(this.#docRef, newData)
  }

  select(selector) {
    return selector(this.data)
  }
}

/*const test = FSDocumentHandler.createDocument('Meetings', {
  MeetingStarted: serverTimestamp(),

  HOSTUUID: 'dsgwetgegrear',
})*/

export default app_db
export { app, colName }
