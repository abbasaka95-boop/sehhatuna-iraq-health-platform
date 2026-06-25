// LOCAL STORAGE DATABASE ENGINE — replaces Firebase entirely
// No accounts, no config, zero cost, works offline

// ==================== Storage Layer ====================
function getCol<T = any>(name: string): T[] {
  try {
    const raw = localStorage.getItem('_db_' + name);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveCol(name: string, data: any[]): void {
  localStorage.setItem('_db_' + name, JSON.stringify(data));
}

// ==================== Listener System ====================
const colListeners: Record<string, Set<() => void>> = {};

function notify(name: string) {
  const set = colListeners[name];
  if (set) set.forEach(fn => fn());
}

function subscribe(name: string, fn: () => void) {
  if (!colListeners[name]) colListeners[name] = new Set();
  colListeners[name].add(fn);
  return () => { colListeners[name].delete(fn); };
}

// ==================== Mock Refs ====================
class DocRef {
  constructor(public _col: string, public _id: string) {}
}
class ColRef {
  constructor(public _name: string) {}
}

// ==================== Public Exports ====================
export const app = {};
export const auth = { currentUser: null };
export const db = {};

// ==================== Firestore Functions ====================
export function doc(_db: any, col: string, id: string) {
  return new DocRef(col, id);
}

export function collection(_db: any, name: string) {
  return new ColRef(name);
}

export async function setDoc(ref: DocRef, data: any, options?: { merge?: boolean }) {
  const col = getCol(ref._col);
  const idx = col.findIndex((item: any) => item.id === ref._id);
  if (idx >= 0) {
    col[idx] = options?.merge ? { ...col[idx], ...data } : { ...data, id: ref._id };
  } else {
    col.push({ ...data, id: ref._id });
  }
  saveCol(ref._col, col);
  notify(ref._col);
}

export async function updateDoc(ref: DocRef, data: any) {
  return setDoc(ref, data, { merge: true });
}

export async function deleteDoc(ref: DocRef) {
  const col = getCol(ref._col);
  saveCol(ref._col, col.filter((item: any) => item.id !== ref._id));
  notify(ref._col);
}

export function onSnapshot(colRef: ColRef, callback: Function, _error?: Function) {
  const run = () => {
    const data = getCol(colRef._name);
    callback({
      docs: data.map((item: any) => ({ id: item.id, data: () => item, exists: true })),
      forEach: (fn: Function) => data.forEach((item: any) => fn({ id: item.id, data: () => item, exists: true })),
    });
  };
  run();
  return subscribe(colRef._name, run);
}

export function writeBatch(_db: any) {
  const ops: Array<{ col: string; id: string; data: any; merge?: boolean }> = [];
  return {
    set(ref: DocRef, data: any, opts?: { merge?: boolean }) {
      ops.push({ col: ref._col, id: ref._id, data, merge: opts?.merge });
    },
    async commit() {
      for (const op of ops) {
        const col = getCol(op.col);
        const idx = col.findIndex((item: any) => item.id === op.id);
        if (idx >= 0) {
          col[idx] = op.merge ? { ...col[idx], ...op.data } : { ...op.data, id: op.id };
        } else {
          col.push({ ...op.data, id: op.id });
        }
        saveCol(op.col, col);
        notify(op.col);
      }
    },
  };
}

// ==================== Auth Mocks ====================
export async function signInWithEmailAndPassword(_auth: any, _email: string, _password: string) {
  return { user: { email: _email, uid: _email.replace(/[^a-zA-Z0-9]/g, '_') } };
}

export async function createUserWithEmailAndPassword(_auth: any, _email: string, _password: string) {
  return { user: { email: _email, uid: _email.replace(/[^a-zA-Z0-9]/g, '_') } };
}

export async function signOut(_auth: any) {}
