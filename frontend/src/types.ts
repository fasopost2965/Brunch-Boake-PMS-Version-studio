export interface Room {
  id: string; // Numéro de chambre (ex: '101')
  type: string; // 'Standard', 'Deluxe', 'Suite Royale', 'Pavillon Brunch'
  status: 'Libre' | 'Occupé' | 'Sale' | 'Maintenance' | 'OOO' | 'OOS';
  price: number; // en FCFA
  capacity: number;
}

export interface Reservation {
  id: string; // 'RES-XXX'
  guestName: string;
  guestEmail: string;
  roomNumber: string;
  checkIn: string; // 'YYYY-MM-DD'
  checkOut: string; // 'YYYY-MM-DD'
  totalBill: number; // FCFA
  paidAmount: number; // FCFA
  status: 'Confirmé' | 'En Cours' | 'Terminé';
  gender?: string;
  birthDate?: string;
  nationality?: string;
  idType?: string;
  idNumber?: string;
  guestPhone?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  language?: string;
  emergencyContact?: string;
  adults?: number;
  children?: number;
  notes?: string;
  docScanUrl?: string; // Scan Base64 ou URL de fichier
  signatureData?: string; // Signature du client Base64
  agreedToTerms?: boolean;
  source?: string;
  bookingSource?: string;
  channelType?: string;
  channelName?: string;
  otaReference?: string;
  originCountry?: string;
  createdFrom?: string;
}

export interface BrunchOrder {
  id: string; // 'CMD-XXX'
  roomNumber: string;
  items: string[];
  totalAmount: number;
  timestamp: string;
  isChargedToRoom: boolean;
}

export interface MaintenanceTicket {
  id: string; // 'MAINT-XXX'
  roomNumber: string;
  issue: string;
  priority: 'Basse' | 'Moyenne' | 'Haute';
  status: 'En Attente' | 'En Cours' | 'Résolu';
  createdAt: string;
}

export interface Guest {
  id: string; // 'GST-XXX'
  name: string;
  email: string;
  phone: string;
  status: 'Régulier' | 'VIP' | 'Corporate' | 'Nouveau';
  notes?: string;
  gender?: string;
  birthDate?: string;
  nationality?: string;
  idType?: string;
  idNumber?: string;
}

export interface Payment {
  id: string; // 'PAY-XXX'
  reservationId: string;
  guestName: string;
  amount: number;
  method: 'Espèces' | 'Orange Money' | 'MTN Momo' | 'Moov Money' | 'Carte Bancaire' | 'Virement';
  date: string;
  reference?: string;
}

export interface User {
  id: string; // USR-XXX
  username: string;
  name: string;
  role: 'admin' | 'gerant' | 'receptionist' | 'accountant';
  password?: string;
  createdAt?: string;
}

export interface InventoryArticle {
  id: string;
  name: string;
  sku: string;
  category: string;
  emplacementId: string;
  minStock: number;
  priceUnit: number;
  supplierId: string;
  isActive: boolean;
  unit: string;
  description?: string;
}

export interface InventoryEmplacement {
  id: string;
  name: string;
  description?: string;
}

export interface InventorySupplier {
  id: string;
  name: string;
  contactName?: string;
  phone?: string;
  email?: string;
}

export interface InventoryMovement {
  id: string;
  articleId: string;
  type: 'Entrée' | 'Sortie' | 'Ajustement';
  quantity: number;
  fromEmplacementId?: string;
  toEmplacementId?: string;
  reason?: string;
  operator: string;
  timestamp: string;
}
