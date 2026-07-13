import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
  console.log('Testing Check-in Logic...');
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
    token = data.access_token;
  } catch (err: any) {
    console.error('Failed to login:', err.message);
    process.exit(1);
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  // Find Room 101
  const room = await prisma.room.findUnique({ where: { number: '101' } });
  if (!room) {
    console.error('Room 101 not found in database');
    process.exit(1);
  }

  // Create a temporary reservation
  const reservation = await prisma.reservation.create({
    data: {
      guestId: 1,
      roomId: room.id,
      checkInDate: new Date(),
      checkOutDate: new Date(Date.now() + 24 * 3600 * 1000), // tomorrow
      agreedRate: 50000,
      source: 'DIRECT',
      createdById: 1,
      status: 'CONFIRMED'
    }
  });

  const reservationId = reservation.id;
  console.log(`Created reservation ID ${reservationId}`);

  // 2. Room 101 starts as CLEAN and OPERATIONAL by default, let's mark it as DIRTY
  console.log('Setting Room 101 to DIRTY...');
  await fetch(`${API_URL}/settings/rooms/${room.id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify({ cleanlinessStatus: 'DIRTY' })
  });

  // 3. Try to check-in without override (Should FAIL)
  console.log('Trying check-in without override...');
  const resFail = await fetch(`${API_URL}/reservations/${reservationId}/checkin`, {
    method: 'POST',
    headers,
    body: JSON.stringify({})
  });
  console.log(`Status: ${resFail.status} (Expected 400)`);
  console.log(await resFail.json());

  // 4. Try to check-in with override (Should SUCCEED)
  console.log('Trying check-in with override...');
  const resSuccess = await fetch(`${API_URL}/reservations/${reservationId}/checkin`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ override: true, overrideReason: 'Client insisted, room is almost clean' })
  });
  console.log(`Status: ${resSuccess.status} (Expected 200/201)`);
  console.log(await resSuccess.json());

  // Clean up
  await prisma.folioLine.deleteMany({ where: { folio: { reservationId } } });
  await prisma.folio.deleteMany({ where: { reservationId } });
  await prisma.reservation.delete({ where: { id: reservationId } });
  await prisma.room.update({ where: { id: room.id }, data: { cleanlinessStatus: 'CLEAN' } });
}

run()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
