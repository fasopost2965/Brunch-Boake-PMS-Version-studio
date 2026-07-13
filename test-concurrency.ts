import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
  console.log('Testing Concurrency for Reservation Creation...');
  const API_URL = 'http://localhost:3001/api';

  // 1. Authenticate as Admin
  let token;
  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@brunchbouake.com',
        password: 'admin_pass_2026',
      })
    });
    const data = (await res.json()) as any;
    if (!res.ok) throw new Error(data.message || 'Login failed');
    token = data.access_token;
  } catch (err: any) {
    console.error('Failed to login:', err.message);
    process.exit(1);
  }

  // Find Room 101
  const room = await prisma.room.findUnique({ where: { number: '101' } });
  if (!room) {
    console.error('Room 101 not found');
    process.exit(1);
  }

  // 2. Setup the reservation payload
  // Using Room 101 and Guest John Doe (id: 1)
  const reservationPayload = {
    guestId: 1,
    roomId: room.id,
    checkInDate: '2026-08-01T14:00:00Z',
    checkOutDate: '2026-08-05T12:00:00Z',
    agreedRate: 200000,
    source: 'DIRECT',
  };

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  // 3. Fire two requests SIMULTANEOUSLY using Promise.all
  console.log('Firing two simultaneous requests...');
  
  const makeRequest = async () => {
    const res = await fetch(`${API_URL}/reservations`, {
      method: 'POST',
      headers,
      body: JSON.stringify(reservationPayload)
    });
    const data = (await res.json()) as any;
    return { status: res.status, data };
  };

  const [res1, res2] = await Promise.all([makeRequest(), makeRequest()]);

  console.log('--- Result 1 ---');
  console.log(`Status: ${res1.status}`);
  console.log(res1.data);

  console.log('--- Result 2 ---');
  console.log(`Status: ${res2.status}`);
  console.log(res2.data);

  // 4. Verify that one succeeded (201) and one failed (409)
  const statuses = [res1.status, res2.status];
  if (statuses.includes(201) && statuses.includes(409)) {
    console.log('✅ TEST PASSED: Transactional lock prevented double booking successfully!');
  } else {
    console.error('❌ TEST FAILED: Overlap lock did not work as expected.');
  }

  // Clean up any created reservation
  const createdIds = [res1.data?.id, res2.data?.id].filter(Boolean);
  for (const id of createdIds) {
    await prisma.folioLine.deleteMany({ where: { folio: { reservationId: id } } });
    await prisma.folio.deleteMany({ where: { reservationId: id } });
    await prisma.reservation.delete({ where: { id } });
    console.log(`Cleaned up reservation ${id}`);
  }
}

run()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
