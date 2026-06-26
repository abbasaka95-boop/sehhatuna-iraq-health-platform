import { createClient } from '@nhost/nhost-js';

const ADMIN_SECRET = 'gtjsvacviuhijgmdcsoy';

const nhost = createClient({
  subdomain: 'vhqngdaqsrovzmlmpbyx',
  region: 'ap-south-1',
});

async function run() {
  console.log('Connecting to Nhost...\n');

  // Try direct Hasura Metadata API via fetch
  const url = 'https://vhqngdaqsrovzmlmpbyx.hasura.ap-south-1.nhost.run/v2/query';
  
  const sql = `
CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY, "nameAr" TEXT NOT NULL DEFAULT '', "nameEn" TEXT NOT NULL DEFAULT '', grade TEXT NOT NULL DEFAULT '', "schoolId" TEXT NOT NULL DEFAULT '', "guardianEmail" TEXT NOT NULL DEFAULT '', "guardianName" TEXT NOT NULL DEFAULT '', "emergencyContact" TEXT NOT NULL DEFAULT '', "bloodType" TEXT NOT NULL DEFAULT '', allergies TEXT NOT NULL DEFAULT '', "chronicDiseases" TEXT NOT NULL DEFAULT '', "vaccineStatus" TEXT NOT NULL DEFAULT '', "lastCheckupDate" TEXT NOT NULL DEFAULT '', "qrCode" TEXT NOT NULL DEFAULT ''
);
CREATE TABLE IF NOT EXISTS schools (
  id TEXT PRIMARY KEY, "nameAr" TEXT NOT NULL DEFAULT '', "nameEn" TEXT NOT NULL DEFAULT '', email TEXT NOT NULL DEFAULT '', address TEXT NOT NULL DEFAULT '', phone TEXT NOT NULL DEFAULT '', password TEXT NOT NULL DEFAULT 'sehhati2026'
);
CREATE TABLE IF NOT EXISTS hospitals (
  id TEXT PRIMARY KEY, "nameAr" TEXT NOT NULL DEFAULT '', "nameEn" TEXT NOT NULL DEFAULT '', email TEXT NOT NULL DEFAULT '', address TEXT NOT NULL DEFAULT '', phone TEXT NOT NULL DEFAULT '', password TEXT NOT NULL DEFAULT 'sehhati2026'
);
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY, email TEXT NOT NULL DEFAULT '', password TEXT NOT NULL DEFAULT 'sehhati2026', role TEXT NOT NULL DEFAULT '', "nameAr" TEXT NOT NULL DEFAULT '', "nameEn" TEXT NOT NULL DEFAULT ''
);
CREATE TABLE IF NOT EXISTS appointments (
  id TEXT PRIMARY KEY, "studentId" TEXT NOT NULL DEFAULT '', "hospitalId" TEXT NOT NULL DEFAULT '', date TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT '', description TEXT NOT NULL DEFAULT '', "createdAt" TEXT NOT NULL DEFAULT ''
);
CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY, "studentId" TEXT NOT NULL DEFAULT '', "hospitalId" TEXT NOT NULL DEFAULT '', date TEXT NOT NULL DEFAULT '', type TEXT NOT NULL DEFAULT '', result TEXT NOT NULL DEFAULT '', notes TEXT NOT NULL DEFAULT '', "doctorName" TEXT NOT NULL DEFAULT ''
);
CREATE TABLE IF NOT EXISTS emergencies (
  id TEXT PRIMARY KEY, "studentId" TEXT NOT NULL DEFAULT '', "studentName" TEXT NOT NULL DEFAULT '', "studentGrade" TEXT NOT NULL DEFAULT '', "guardianPhone" TEXT NOT NULL DEFAULT '', location TEXT NOT NULL DEFAULT '', description TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT 'active', timestamp TEXT NOT NULL DEFAULT '', "hospitalId" TEXT NOT NULL DEFAULT ''
);
CREATE TABLE IF NOT EXISTS announcements (
  id TEXT PRIMARY KEY, "schoolId" TEXT NOT NULL DEFAULT '', "titleAr" TEXT NOT NULL DEFAULT '', "titleEn" TEXT NOT NULL DEFAULT '', "contentAr" TEXT NOT NULL DEFAULT '', "contentEn" TEXT NOT NULL DEFAULT '', date TEXT NOT NULL DEFAULT '', type TEXT NOT NULL DEFAULT '', "targetRole" TEXT NOT NULL DEFAULT 'all'
);`;

  const body = JSON.stringify({
    type: 'run_sql',
    args: { source: 'default', sql }
  });

  console.log('Sending SQL to Hasura...');
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-hasura-admin-secret': ADMIN_SECRET,
    },
    body,
  });

  const result = await response.json();
  console.log('Status:', response.status);
  
  if (response.ok) {
    console.log('✅ Tables created successfully!');
    console.log('Result:', JSON.stringify(result, null, 2));
  } else {
    console.log('❌ Failed:', JSON.stringify(result, null, 2));
    
    // Try with different secret
    console.log('\nTrying alternative endpoints...');
    
    const endpoints = [
      'https://vhqngdaqsrovzmlmpbyx.hasura.ap-south-1.nhost.run/v1/graphql',
      'https://vhqngdaqsrovzmlmpbyx.graphql.ap-south-1.nhost.run/v1/graphql',
    ];
    
    for (const ep of endpoints) {
      try {
        const testBody = JSON.stringify({ query: '{ __typename }' });
        const testRes = await fetch(ep, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-hasura-admin-secret': ADMIN_SECRET,
          },
          body: testBody,
        });
        const testResult = await testRes.json();
        console.log(`\n${ep}: status=${testRes.status}`);
        console.log(JSON.stringify(testResult, null, 2));
      } catch (e) {
        console.log(`${ep}: error - ${e.message}`);
      }
    }
  }
}

run().catch(console.error);
