import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  doc as fbDoc,
  collection as fbCollection,
  setDoc as fbSetDoc,
  updateDoc as fbUpdateDoc,
  deleteDoc as fbDeleteDoc,
  onSnapshot as fbOnSnapshot,
  writeBatch as fbWriteBatch,
  getDocs as fbGetDocs,
  query as fbQuery,
  where as fbWhere,
  limit as fbLimit,
} from 'firebase/firestore';
import config from '../../firebase-applet-config.json';

const app = initializeApp(config);
const firestore = getFirestore(app, '(default)');

export const auth = { currentUser: null };
export const db = firestore;

export function doc(_db: any, col: string, id: string) {
  return fbDoc(_db, col, id);
}

export function collection(_db: any, name: string) {
  return fbCollection(_db, name);
}

export async function setDoc(ref: any, data: any, options?: any) {
  return fbSetDoc(ref, data, options);
}

export async function updateDoc(ref: any, data: any) {
  return fbUpdateDoc(ref, data);
}

export async function deleteDoc(ref: any) {
  return fbDeleteDoc(ref);
}

export function onSnapshot(ref: any, onNext: (snap: any) => void, onError?: (e: any) => void) {
  return fbOnSnapshot(
    ref,
    (snapshot: any) => {
      onNext({
        docs: snapshot.docs.map((d: any) => ({ id: d.id, data: () => ({ id: d.id, ...d.data() }), exists: d.exists })),
        forEach: (fn: any) => snapshot.docs.forEach((d: any) => fn({ id: d.id, data: () => ({ id: d.id, ...d.data() }), exists: d.exists })),
      });
    },
    onError,
  );
}

export function writeBatch(_db: any) {
  const batch = fbWriteBatch(_db);
  return {
    set(ref: any, data: any, opts?: any) { batch.set(ref, data, opts); },
    async commit() { await batch.commit(); },
  };
}

export async function signInWithEmailAndPassword(_auth: any, _email: string, _password: string) {
  return { user: { email: _email, uid: _email.replace(/[^a-zA-Z0-9]/g, '_') } };
}

export async function createUserWithEmailAndPassword(_auth: any, _email: string, _password: string) {
  return { user: { email: _email, uid: _email.replace(/[^a-zA-Z0-9]/g, '_') } };
}

export async function signOut(_auth: any) {}

export { fbGetDocs as getDocs, fbQuery as query, fbWhere as where, fbLimit as limit };
