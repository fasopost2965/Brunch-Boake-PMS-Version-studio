export interface Room {
  id: string; // Room number (e.g., '101')
  type: string; // 'Standard', 'Deluxe', 'Suite Royale', 'Pavillon Brunch'
  status: 'Libre' | 'Occupé' | 'Sale' | 'Maintenance' | 'OOO' | 'OOS';
  price: number; // in FCFA
  capacity: number;
}

export interface Reservation {
  id: string; // 'RES-XXX'
  guestName: string;
  guestEmail: string;
  roomNumber: string;
  checkIn: string;
  checkOut: string;
  totalBill: number; // FCFA
  paidAmount: number; // FCFA
  status: 'Confirmé' | 'En Cours' | 'Terminé';
  
  // Extended administrative check-in fields
  gender?: string; // Sexe/Civilité
  birthDate?: string; // Date de naissance
  nationality?: string; // Nationalité
  idType?: string; // Type de pièce (CNI, Passeport, etc.)
  idNumber?: string; // Numéro de pièce
  guestPhone?: string; // Téléphone
  
  address?: string; // Adresse
  city?: string; // Ville
  country?: string; // Pays
  postalCode?: string; // Code postal
  language?: string; // Langue
  emergencyContact?: string; // Contact d'urgence
  
  adults?: number; // Nombre d'adultes
  children?: number; // Nombre d'enfants
  notes?: string; // Notes particulières
  
  docScanUrl?: string; // Photo ou scan du document (Base64 or placeholder)
  signatureData?: string; // Signature du client (Canvas drawing Base64 string)
  agreedToTerms?: boolean; // Acceptation des conditions

  // Booking source fields
  source?: string; // e.g., 'Direct', 'OTA', 'Agence', 'Téléphone', 'Walk-In'
  bookingSource?: string; // e.g., 'Direct', 'OTA', 'Agence', 'Téléphone', 'Walk-In'
  channelType?: string; // e.g., 'Direct', 'OTA', 'Offline'
  channelName?: string; // e.g., 'Booking.com', 'Expedia', 'Airbnb', 'Site Direct', 'Appel', 'Walk-In'
  otaReference?: string; // OTA reference if applicable
  originCountry?: string; // Pays d'origine du voyageur
  createdFrom?: string; // e.g., 'PMS', 'Channel Manager Sandbox'
}

export interface BrunchOrder {
  id: string;
  roomNumber: string;
  items: string[];
  totalAmount: number; // FCFA
  timestamp: string;
  isChargedToRoom: boolean;
}

export interface MaintenanceTicket {
  id: string;
  roomNumber: string;
  issue: string;
  priority: 'Basse' | 'Moyenne' | 'Haute';
  status: 'Reçu' | 'En Cours' | 'Résolu';
  createdAt: string;
}

export interface Guest {
  id: string;
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
  id: string;
  reservationId: string;
  guestName: string;
  amount: number;
  method: 'Espèces' | 'Orange Money' | 'MTN Momo' | 'Moov Money' | 'Carte Bancaire' | 'Virement';
  date: string;
  reference: string;
}

// ==========================================
// INVENTORY & STOCK MANAGEMENT TYPES
// ==========================================
export interface InventoryArticle {
  id: string;
  name: string;
  sku: string;
  category: 'housekeeping' | 'cuisine' | 'minibar' | 'maintenance' | 'réception' | 'linge';
  emplacementId: string; // default or current location
  minStock: number;
  priceUnit: number; // cost/purchase price per unit (FCFA)
  supplierId: string;
  isActive: boolean; // For soft deletion
  unit: string; // 'Unité', 'Litre', 'Kg', 'Bouteille', 'Paquet', etc.
  description?: string;
}

export interface InventoryEmplacement {
  id: string;
  name: string;
  description: string;
}

export interface InventorySupplier {
  id: string;
  name: string;
  contactName: string;
  phone: string;
  email: string;
}

export interface InventoryMovement {
  id: string;
  articleId: string;
  type: 'Entrée' | 'Sortie' | 'Ajustement' | 'Transfert';
  quantity: number; // absolute value
  fromEmplacementId?: string;
  toEmplacementId?: string;
  reason: string;
  operator: string;
  timestamp: string;
}

// ==========================================
// USER ACCOUNTS & RBAC MANAGEMENT TYPES
// ==========================================
export type UserRole = 'admin' | 'gerant' | 'receptionist' | 'accountant';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  password?: string;
  createdAt: string;
}

