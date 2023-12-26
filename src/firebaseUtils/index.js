import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyDQ2YdNfoOKyoOYYNF_c9LfPtuQOFK6L6w',
  authDomain: 'my-parliment.firebaseapp.com',
  projectId: 'my-parliment',
  storageBucket: 'my-parliment.appspot.com',
  messagingSenderId: '169128924060',
  appId: '1:169128924060:web:a0ae3f156b5a499cf7ae59',
}

export const app = initializeApp(firebaseConfig)
export const app_db = getFirestore(app)
