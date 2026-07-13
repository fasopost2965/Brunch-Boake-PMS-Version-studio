import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
  console.log('Testing Maintenance Module (Multi-incidents)...');
  const API_URL = 'http://localhost:3001/api';

  // 1. Authenticate as Admin
  let token;
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@brunchbouake.com', password: 'admin_pass_2026' })
    });
    const data = (await res.json()) as any;
    token = data.access_token;
  } catch (err: any) {
    console.error('Login failed:', err.message);
    process.exit(1);
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  // Find Room 101 dynamically
  const roomObj = await prisma.room.findUnique({ where: { number: '101' } });
  if (!roomObj) {
    console.error('Room 101 not found in database');
    process.exit(1);
  }
  const roomId = roomObj.id;

  // Ensure Room 101 is OPERATIONAL before test
  await prisma.room.update({ where: { id: roomId }, data: { technicalStatus: 'OPERATIONAL' } });
  
  console.log(`Creating Incident #1 on Room 101 (ID: ${roomId})...`);
  const inc1Res = await fetch(`${API_URL}/maintenance/issues`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ roomId: roomId, description: 'AC is leaking' })
  });
  const inc1 = (await inc1Res.json()) as any;
  console.log('Incident #1 response:', inc1);

  let room = await prisma.room.findUnique({ where: { id: roomId } });
  console.log(`Room 101 technicalStatus after Incident #1: ${room?.technicalStatus}`);

  console.log(`Creating Incident #2 on Room 101 (ID: ${roomId})...`);
  const inc2Res = await fetch(`${API_URL}/maintenance/issues`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ roomId: roomId, description: 'TV is not working' })
  });
  const inc2 = (await inc2Res.json()) as any;
  console.log('Incident #2 response:', inc2);

  room = await prisma.room.findUnique({ where: { id: roomId } });
  console.log(`Room 101 technicalStatus after Incident #2: ${room?.technicalStatus}`);

  console.log('Resolving Incident #1...');
  await fetch(`${API_URL}/maintenance/issues/${inc1.id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ status: 'RESOLVED' })
  });

  room = await prisma.room.findUnique({ where: { id: roomId } });
  console.log(`Room 101 technicalStatus after resolving Incident #1: ${room?.technicalStatus}`);
  
  if (room?.technicalStatus === 'MAINTENANCE') {
    console.log('✅ TEST PASSED: Room is STILL in MAINTENANCE because Incident #2 is OPEN.');
  } else {
    console.error('❌ TEST FAILED: Room technicalStatus became OPERATIONAL too early!');
  }

  console.log('Resolving Incident #2...');
  await fetch(`${API_URL}/maintenance/issues/${inc2.id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ status: 'RESOLVED' })
  });

  room = await prisma.room.findUnique({ where: { id: roomId } });
  console.log(`Room 101 technicalStatus after resolving Incident #2: ${room?.technicalStatus}`);

  if (room?.technicalStatus === 'OPERATIONAL') {
    console.log('✅ TEST PASSED: Room is now OPERATIONAL since all incidents are RESOLVED.');
  } else {
    console.error('❌ TEST FAILED: Room technicalStatus is still MAINTENANCE!');
  }

  // Cleanup
  await prisma.maintenanceIssue.deleteMany({ where: { roomId } });
  await prisma.room.update({ where: { id: roomId }, data: { technicalStatus: 'OPERATIONAL' } });
}

run()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
