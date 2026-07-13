import { Room, Reservation, BrunchOrder, MaintenanceTicket, Guest, Payment, User } from './types';

export const DEFAULT_ROOMS: Room[] = [
  { id: '101', type: 'Chambre', status: 'Libre', price: 15000, capacity: 2 },
  { id: '102', type: 'Chambre', status: 'Sale', price: 15000, capacity: 2 },
  { id: '103', type: 'Chambre', status: 'Occupé', price: 15000, capacity: 2 },
  { id: '104', type: 'Chambre', status: 'Libre', price: 15000, capacity: 2 },
  { id: '201', type: 'Studio', status: 'Occupé', price: 25000, capacity: 4 },
  { id: '202', type: 'Studio', status: 'Maintenance', price: 25000, capacity: 4 },
  { id: '203', type: 'Studio', status: 'Libre', price: 25000, capacity: 4 },
  { id: '204', type: 'Studio', status: 'Occupé', price: 25000, capacity: 4 },
  { id: '301', type: 'Suite Royale', status: 'Occupé', price: 95000, capacity: 4 },
  { id: '302', type: 'Suite Royale', status: 'Libre', price: 95000, capacity: 4 },
  { id: 'PV-1', type: 'Pavillon Brunch', status: 'Occupé', price: 120000, capacity: 6 },
  { id: 'PV-2', type: 'Pavillon Brunch', status: 'Libre', price: 120000, capacity: 6 }
];

export const DEFAULT_RESERVATIONS: Reservation[] = [
  {
    id: 'RES-001',
    guestName: 'Mamadou Coulibaly',
    guestEmail: 'm.coulibaly@yahoo.fr',
    roomNumber: '103',
    checkIn: '2026-07-10',
    checkOut: '2026-07-14',
    totalBill: 76700,
    paidAmount: 76700,
    status: 'En Cours',
    bookingSource: 'OTA',
    channelType: 'OTA',
    channelName: 'Booking.com',
    otaReference: 'BKG-9928172',
    originCountry: 'Côte d\'Ivoire',
    createdFrom: 'Channel Manager'
  },
  {
    id: 'RES-002',
    guestName: 'Awa Koné',
    guestEmail: 'awa.kone@gmail.com',
    roomNumber: '204',
    checkIn: '2026-07-09',
    checkOut: '2026-07-12',
    totalBill: 96500,
    paidAmount: 50000,
    status: 'En Cours',
    bookingSource: 'Direct',
    channelType: 'Direct',
    channelName: 'Site Direct',
    originCountry: 'Côte d\'Ivoire',
    createdFrom: 'PMS'
  },
  {
    id: 'RES-003',
    guestName: 'Alain Koffi',
    guestEmail: 'koffi.alain@outlook.com',
    roomNumber: '201',
    checkIn: '2026-07-11',
    checkOut: '2026-07-13',
    totalBill: 53000,
    paidAmount: 0,
    status: 'Confirmé',
    bookingSource: 'Téléphone',
    channelType: 'Offline',
    channelName: 'Appel',
    originCountry: 'France',
    createdFrom: 'PMS'
  }
];

export const DEFAULT_GUESTS: Guest[] = [
  { id: 'GST-001', name: 'Mamadou Coulibaly', email: 'm.coulibaly@yahoo.fr', phone: '+225 07 48 29 11 00', status: 'VIP', notes: 'Préfère les chambres à l\'étage élevé.' },
  { id: 'GST-002', name: 'Awa Koné', email: 'awa.kone@gmail.com', phone: '+225 05 66 11 22 33', status: 'Nouveau', notes: 'Cliente Brunch habituelle.' },
  { id: 'GST-003', name: 'Alain Koffi', email: 'koffi.alain@outlook.com', phone: '+225 01 02 03 04 05', status: 'Corporate', notes: 'Séjour professionnel, facturation entreprise.' },
  { id: 'GST-004', name: 'Fatou Diallo', email: 'f.diallo@gmail.com', phone: '+225 07 12 34 56 78', status: 'Régulier' },
  { id: 'GST-005', name: 'Yao Kouassi', email: 'yao.kouassi@live.ci', phone: '+225 05 98 76 54 32', status: 'Régulier', notes: 'Allergique aux arachides.' }
];

export const DEFAULT_PAYMENTS: Payment[] = [
  { id: 'PAY-001', reservationId: 'RES-001', guestName: 'Mamadou Coulibaly', amount: 220000, method: 'Orange Money', date: '2026-07-10 14:32', reference: 'OM-99281729' },
  { id: 'PAY-002', reservationId: 'RES-002', guestName: 'Awa Koné', amount: 180000, method: 'MTN Momo', date: '2026-07-11 09:15', reference: 'MTN-8827161' }
];

export const DEFAULT_ORDERS: BrunchOrder[] = [
  {
    id: 'CMD-101',
    roomNumber: '204',
    items: ['Brunch Signature Ivoirien', 'Cocktail Bouaké Sun'],
    totalAmount: 17000,
    timestamp: '2026-07-11 10:30',
    isChargedToRoom: true
  },
  {
    id: 'CMD-102',
    roomNumber: '103',
    items: ['Pancakes de la Passion', 'Café de Man (Grand Cru)'],
    totalAmount: 11500,
    timestamp: '2026-07-11 11:15',
    isChargedToRoom: true
  }
];

export const DEFAULT_MAINTENANCE: MaintenanceTicket[] = [
  {
    id: 'MAINT-001',
    roomNumber: '202',
    issue: 'Problème de climatisation (ne refroidit pas)',
    priority: 'Haute',
    status: 'En Cours',
    createdAt: '2026-07-11 08:00'
  }
];

export const DEFAULT_USERS: User[] = [
  { id: 'USR-001', username: 'admin', name: 'Super Administrateur', role: 'admin', password: 'admin', createdAt: '2026-07-12 08:00' },
  { id: 'USR-002', username: 'gerant', name: 'Gérant Principal', role: 'gerant', password: 'gerant', createdAt: '2026-07-12 08:05' },
  { id: 'USR-003', username: 'reception', name: 'Réceptionniste Jour', role: 'receptionist', password: 'reception', createdAt: '2026-07-12 08:10' },
  { id: 'USR-004', username: 'compta', name: 'Comptable Senior', role: 'accountant', password: 'compta', createdAt: '2026-07-12 08:15' }
];
