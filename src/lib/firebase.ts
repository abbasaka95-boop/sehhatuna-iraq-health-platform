import { createClient } from '@nhost/nhost-js';

const nhost = createClient({
  subdomain: 'vhqngdaqsrovzmlmpbyx',
  region: 'ap-south-1',
});

nhost.auth.signInAnonymous();

const TABLE_COLUMNS: Record<string, string[]> = {
  students: ['id','nameAr','nameEn','grade','schoolId','guardianEmail','guardianName','emergencyContact','bloodType','allergies','chronicDiseases','vaccineStatus','lastCheckupDate','qrCode'],
  schools: ['id','nameAr','nameEn','email','address','phone','password'],
  hospitals: ['id','nameAr','nameEn','email','address','phone','password'],
  users: ['id','email','password','role','nameAr','nameEn'],
  appointments: ['id','studentId','hospitalId','date','status','description','createdAt'],
  reports: ['id','studentId','hospitalId','date','type','result','notes','doctorName'],
  emergencies: ['id','studentId','studentName','studentGrade','guardianPhone','location','description','status','timestamp','hospitalId'],
  announcements: ['id','schoolId','titleAr','titleEn','contentAr','contentEn','date','type','targetRole'],
};

class ColRef { constructor(public _name: string) {} }
class DocRef { constructor(public _col: string, public _id: string) {} }

export const auth = { currentUser: null };
export const db = {};

export function doc(_db: any, col: string, id: string) { return new DocRef(col, id); }
export function collection(_db: any, name: string) { return new ColRef(name); }

async function gql(query: string, variables?: Record<string, any>) {
  const result = await nhost.graphql.request({ query, variables });
  if (result.body.errors?.length) throw new Error(result.body.errors[0].message);
  return result.body.data;
}

const colListeners: Record<string, Set<() => void>> = {};
function notify(name: string) {
  colListeners[name]?.forEach(fn => fn());
}
function subscribe(name: string, fn: () => void) {
  if (!colListeners[name]) colListeners[name] = new Set();
  colListeners[name].add(fn);
  return () => { colListeners[name].delete(fn); };
}

export async function setDoc(ref: DocRef, data: any, _options?: any) {
  const table = ref._col;
  const cols = TABLE_COLUMNS[table];
  if (!cols) throw new Error(`Unknown table: ${table}`);
  const colsStr = cols.join(', ');
  const vars: Record<string, any> = {};
  for (const c of cols) vars[c] = data[c] ?? '';
  await gql(`mutation { insert_${table}(objects: [{${cols.map(c => `${c}: $${c}`).join(', ')}], on_conflict: {constraint: ${table}_pkey, update_columns: [${colsStr}]}) { affected_rows } }`, vars);
  notify(table);
}

export async function updateDoc(ref: DocRef, data: any) { return setDoc(ref, data); }

export async function deleteDoc(ref: DocRef) {
  const table = ref._col;
  await gql(`mutation { delete_${table}(where: {id: {_eq: $id}}) { affected_rows } }`, { id: ref._id });
  notify(table);
}

export function onSnapshot(ref: ColRef, onNext: (snap: any) => void, onError?: (e: any) => void) {
  const table = ref._name;
  const cols = TABLE_COLUMNS[table];
  const q = `query { ${table} { ${cols.join(' ')} } }`;
  let last = '';
  const fetch_ = async () => {
    try {
      const d = await gql(q);
      const items = d?.[table] || [];
      const s = JSON.stringify(items);
      if (s !== last) { last = s; onNext({ docs: items.map((i: any) => ({ id: i.id, data: () => i, exists: true })), forEach: (fn: Function) => items.forEach((i: any) => fn({ id: i.id, data: () => i, exists: true })) }); }
    } catch (e) { onError?.(e); }
  };
  fetch_();
  const unsub = subscribe(table, fetch_);
  const iv = setInterval(fetch_, 3000);
  return () => { clearInterval(iv); unsub(); };
}

export function writeBatch(_db: any) {
  const groups: Record<string, any[]> = {};
  return {
    set(ref: DocRef, data: any) {
      if (!groups[ref._col]) groups[ref._col] = [];
      groups[ref._col].push(data);
    },
    async commit() {
      const parts: string[] = [];
      const vars: Record<string, any> = {};
      for (const [table, objects] of Object.entries(groups)) {
        const cols = TABLE_COLUMNS[table];
        const vn = `o_${table}`;
        vars[vn] = objects;
        parts.push(`i${table}: insert_${table}(objects: $${vn}, on_conflict: {constraint: ${table}_pkey, update_columns: [${cols.join(', ')}]}) { affected_rows }`);
      }
      await gql(`mutation { ${parts.join('\n')} }`, vars);
      for (const col of Object.keys(groups)) notify(col);
    },
  };
}

export async function getDocs(ref: any) {
  const table = ref._name || ref._col;
  const cols = TABLE_COLUMNS[table];
  const d = await gql(`query { ${table} { ${cols.join(' ')} } }`);
  const items = d?.[table] || [];
  const docs = items.map((i: any) => ({ id: i.id, data: () => i, exists: true }));
  return { docs, empty: docs.length === 0, forEach: (fn: Function) => docs.forEach(fn) };
}

export function query(ref: ColRef, ..._: any[]) { return ref; }
export function where() { return {}; }
export function limit(..._: any[]) { return {}; }

export async function signInWithEmailAndPassword(_auth: any, _email: string, _password: string) {
  return { user: { email: _email, uid: _email.replace(/[^a-zA-Z0-9]/g, '_') } };
}
export async function signOut(_auth: any) {}
