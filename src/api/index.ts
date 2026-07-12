import { 
  Room, 
  Reservation, 
  BrunchOrder, 
  MaintenanceTicket, 
  Guest, 
  Payment, 
  User, 
  InventoryArticle,
  InventoryEmplacement,
  InventorySupplier,
  InventoryMovement
} from '../types';

import { 
  DEFAULT_ROOMS, 
  DEFAULT_RESERVATIONS, 
  DEFAULT_ORDERS, 
  DEFAULT_MAINTENANCE, 
  DEFAULT_GUESTS, 
  DEFAULT_PAYMENTS,
  DEFAULT_USERS
} from '../data';

// ==========================================
// INVENTORY INITIAL DEFAULTS (MATCHING InventoryScreen)
// ==========================================
const DEFAULT_EMPLACEMENTS: InventoryEmplacement[] = [
  { id: 'EMP-001', name: 'Stock Central - Réception', description: 'Stock principal près de l\'accueil pour consommables immédiats.' },
  { id: 'EMP-002', name: 'Réserve Cuisine / Minibar', description: 'Espace sécurisé à température contrôlée pour boissons et ingrédients.' },
  { id: 'EMP-003', name: 'Dépôt Housekeeping & Linge', description: 'Grande armoire de stockage pour draps, serviettes, et savons.' },
  { id: 'EMP-004', name: 'Atelier Maintenance', description: 'Dépôt des outils, ampoules, peinture et pièces de rechange.' }
];

const DEFAULT_SUPPLIERS: InventorySupplier[] = [
  { id: 'SP-001', name: 'SODEFOR & Alimentation Bouaké', contactName: 'M. Touré K.', phone: '+225 07 11 22 33 44', email: 'toure@alimentation-bke.ci' },
  { id: 'SP-002', name: 'Blanchisserie Pro du Centre', contactName: 'Mme Konan Marie', phone: '+225 01 02 03 04 05', email: 'contact@blanchisserie-centre.ci' },
  { id: 'SP-003', name: 'Quincaillerie Kénédou', contactName: 'Jean-Marc B.', phone: '+225 05 55 66 77 88', email: 'jmb@kenedou.ci' }
];

const DEFAULT_ARTICLES: InventoryArticle[] = [
  { id: 'ART-001', name: 'Savonnette d\'accueil 15g', sku: 'HK-SAV-01', category: 'housekeeping', emplacementId: 'EMP-003', minStock: 100, priceUnit: 150, supplierId: 'SP-001', isActive: true, unit: 'Unité', description: 'Petite savonnette individuelle parfumée.' },
  { id: 'ART-002', name: 'Shampoing d\'accueil 30ml', sku: 'HK-SHA-01', category: 'housekeeping', emplacementId: 'EMP-003', minStock: 100, priceUnit: 200, supplierId: 'SP-001', isActive: true, unit: 'Unité', description: 'Flacon individuel de shampoing.' },
  { id: 'ART-003', name: 'Café Arabica grains 1kg', sku: 'CU-CAF-01', category: 'cuisine', emplacementId: 'EMP-002', minStock: 5, priceUnit: 6500, supplierId: 'SP-001', isActive: true, unit: 'Kg', description: 'Café de Côte d\'Ivoire torréfié de qualité supérieure.' },
  { id: 'ART-004', name: 'Jus d\'Ananas local 1L', sku: 'CU-JUS-01', category: 'cuisine', emplacementId: 'EMP-002', minStock: 15, priceUnit: 1200, supplierId: 'SP-001', isActive: true, unit: 'Bouteille', description: 'Jus pur d\'ananas de pays pressé.' },
  { id: 'ART-005', name: 'Bière Bock nationale 33cl', sku: 'MB-BIE-01', category: 'minibar', emplacementId: 'EMP-002', minStock: 24, priceUnit: 800, supplierId: 'SP-001', isActive: true, unit: 'Bouteille', description: 'Boisson rafraîchissante pour réapprovisionnement minibar.' },
  { id: 'ART-006', name: 'Eau minérale AWA 1.5L', sku: 'MB-EAU-01', category: 'minibar', emplacementId: 'EMP-002', minStock: 30, priceUnit: 400, supplierId: 'SP-001', isActive: true, unit: 'Bouteille', description: 'Eau de table plate.' },
  { id: 'ART-007', name: 'Ampoule LED E27 9W', sku: 'MA-AMP-01', category: 'maintenance', emplacementId: 'EMP-004', minStock: 10, priceUnit: 1500, supplierId: 'SP-003', isActive: true, unit: 'Unité', description: 'Ampoule à économie d\'énergie.' },
  { id: 'ART-008', name: 'Drap double coton blanc', sku: 'LI-DRA-01', category: 'linge', emplacementId: 'EMP-003', minStock: 15, priceUnit: 9500, supplierId: 'SP-002', isActive: true, unit: 'Unité', description: 'Drap hôtelier haut de gamme à forte résistance.' },
  { id: 'ART-009', name: 'Taie d\'oreiller blanche', sku: 'LI-TAI-01', category: 'linge', emplacementId: 'EMP-003', minStock: 20, priceUnit: 2500, supplierId: 'SP-002', isActive: true, unit: 'Unité', description: 'Taie assortie aux draps de chambre.' },
  { id: 'ART-010', name: 'Papier thermique caisse 80mm', sku: 'RE-PAP-01', category: 'réception', emplacementId: 'EMP-001', minStock: 12, priceUnit: 850, supplierId: 'SP-003', isActive: true, unit: 'Rouleau', description: 'Papier pour imprimantes de facture rapide.' }
];

const DEFAULT_MOVEMENTS: InventoryMovement[] = [
  { id: 'MOV-001', articleId: 'ART-001', type: 'Entrée', quantity: 350, toEmplacementId: 'EMP-003', reason: 'Commande initiale fournisseur', operator: 'F. Touré (Directeur)', timestamp: '2026-07-01 09:15' },
  { id: 'MOV-002', articleId: 'ART-002', type: 'Entrée', quantity: 200, toEmplacementId: 'EMP-003', reason: 'Commande initiale fournisseur', operator: 'F. Touré (Directeur)', timestamp: '2026-07-01 09:20' },
  { id: 'MOV-003', articleId: 'ART-003', type: 'Entrée', quantity: 15, toEmplacementId: 'EMP-002', reason: 'Approvisionnement cuisine', operator: 'M. Koffi (Chef)', timestamp: '2026-07-02 10:00' },
  { id: 'MOV-004', articleId: 'ART-005', type: 'Entrée', quantity: 48, toEmplacementId: 'EMP-002', reason: 'Achat de pack de bières', operator: 'M. Koffi (Chef)', timestamp: '2026-07-03 14:30' },
  { id: 'MOV-005', articleId: 'ART-008', type: 'Entrée', quantity: 20, toEmplacementId: 'EMP-003', reason: 'Nouveau linge réceptionné', operator: 'A. Diallo (Gouvernante)', timestamp: '2026-07-04 11:15' },
  { id: 'MOV-006', articleId: 'ART-001', type: 'Sortie', quantity: 120, fromEmplacementId: 'EMP-003', reason: 'Consommation hebdomadaire chambres', operator: 'A. Diallo (Gouvernante)', timestamp: '2026-07-08 17:00' },
  { id: 'MOV-007', articleId: 'ART-002', type: 'Sortie', quantity: 110, fromEmplacementId: 'EMP-003', reason: 'Consommation hebdomadaire chambres', operator: 'A. Diallo (Gouvernante)', timestamp: '2026-07-08 17:02' },
  { id: 'MOV-008', articleId: 'ART-007', type: 'Entrée', quantity: 12, toEmplacementId: 'EMP-004', reason: 'Stock ampoules acheté', operator: 'S. Diabaté (Technicien)', timestamp: '2026-07-09 08:30' },
  { id: 'MOV-009', articleId: 'ART-007', type: 'Sortie', quantity: 3, fromEmplacementId: 'EMP-004', reason: 'Remplacement ampoules grillées CH 101, 102', operator: 'S. Diabaté (Technicien)', timestamp: '2026-07-10 11:20' },
  { id: 'MOV-010', articleId: 'ART-003', type: 'Sortie', quantity: 4, fromEmplacementId: 'EMP-002', reason: 'Préparation café petits déjeuners', operator: 'M. Koffi (Chef)', timestamp: '2026-07-11 11:50' },
  { id: 'MOV-011', articleId: 'ART-004', type: 'Ajustement', quantity: 10, toEmplacementId: 'EMP-002', reason: 'Inventaire physique et correction', operator: 'F. Touré (Directeur)', timestamp: '2026-07-11 15:00' }
];

const DEFAULT_CONFIG = {
  name: 'Brunch Bouaké',
  address: 'Quartier Kennedy, Bouaké, Côte d\'Ivoire',
  email: 'contact@brunch-bouake.ci',
  currency: 'FCFA',
  prices: {
    'Standard': 35000,
    'Deluxe': 55000,
    'Suite Royale': 95000,
    'Pavillon Brunch': 120000,
    'Chambre': 15000,
    'Studio': 25000
  }
};

// ==========================================
// UTILS FOR SIMULATING REST NETWORK CALLS
// ==========================================
const SIMULATED_LATENCY_MS = 120; // Slight realistic response delay

const delay = <T>(value: T): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), SIMULATED_LATENCY_MS);
  });
};

const logApiCall = (method: string, endpoint: string, body?: any, status = 200) => {
  console.log(
    `%c[REST API SIMULATOR] %c${method} %c${endpoint} %c- Status ${status} (OK)`,
    'color: #fe6e00; font-weight: bold;',
    'color: #0088cc; font-weight: bold;',
    'color: #555; font-family: monospace;',
    status >= 200 && status < 300 ? 'color: #2e7d32; font-weight: bold;' : 'color: #c62828; font-weight: bold;'
  );
  if (body) {
    console.log('%cPayload/Body:', 'color: #999; font-style: italic;', body);
  }
};

// ==========================================
// GENERIC STORAGE REPO FOR LESS BOILERPLATE
// ==========================================
class LocalStorageRepo<T extends { id: string | number }> {
  private key: string;
  private defaultData: T[];

  constructor(key: string, defaultData: T[]) {
    this.key = key;
    this.defaultData = defaultData;
  }

  get(): T[] {
    const saved = localStorage.getItem(this.key);
    if (!saved) {
      localStorage.setItem(this.key, JSON.stringify(this.defaultData));
      return this.defaultData;
    }
    return JSON.parse(saved);
  }

  save(data: T[]): void {
    localStorage.setItem(this.key, JSON.stringify(data));
  }

  findOne(id: string | number): T | undefined {
    return this.get().find((item) => String(item.id) === String(id));
  }

  insert(item: T): T {
    const data = this.get();
    data.push(item);
    this.save(data);
    return item;
  }

  update(id: string | number, item: Partial<T>): T {
    const data = this.get();
    let updatedItem!: T;
    const nextData = data.map((existing) => {
      if (String(existing.id) === String(id)) {
        updatedItem = { ...existing, ...item };
        return updatedItem;
      }
      return existing;
    });
    this.save(nextData);
    return updatedItem;
  }

  delete(id: string | number): boolean {
    const data = this.get();
    const initialLength = data.length;
    const nextData = data.filter((existing) => String(existing.id) !== String(id));
    this.save(nextData);
    return nextData.length < initialLength;
  }
}

// Instantiate repositories with exactly the correct keys used in the app
const roomsRepo = new LocalStorageRepo<Room>('bouake_pms_rooms', DEFAULT_ROOMS);
const reservationsRepo = new LocalStorageRepo<Reservation>('bouake_pms_reservations', DEFAULT_RESERVATIONS);
const ordersRepo = new LocalStorageRepo<BrunchOrder>('bouake_pms_orders', DEFAULT_ORDERS);
const maintenanceRepo = new LocalStorageRepo<MaintenanceTicket>('bouake_pms_maintenance', DEFAULT_MAINTENANCE);
const guestsRepo = new LocalStorageRepo<Guest>('bouake_pms_guests', DEFAULT_GUESTS);
const paymentsRepo = new LocalStorageRepo<Payment>('bouake_pms_payments', DEFAULT_PAYMENTS);
const usersRepo = new LocalStorageRepo<User>('bouake_pms_users', DEFAULT_USERS);

const articlesRepo = new LocalStorageRepo<InventoryArticle>('pms_inventory_articles', DEFAULT_ARTICLES);
const emplacementsRepo = new LocalStorageRepo<InventoryEmplacement>('pms_inventory_emplacements', DEFAULT_EMPLACEMENTS);
const suppliersRepo = new LocalStorageRepo<InventorySupplier>('pms_inventory_suppliers', DEFAULT_SUPPLIERS);
const movementsRepo = new LocalStorageRepo<InventoryMovement>('pms_inventory_movements', DEFAULT_MOVEMENTS);

// ==========================================
// EXPORTED REST UTILITY ENDPOINTS
// ==========================================
export const api = {
  /**
   * CHAMBRES / ROOMS API (GET, POST, PUT, DELETE)
   */
  rooms: {
    getAll: async (): Promise<Room[]> => {
      logApiCall('GET', '/api/rooms');
      return delay(roomsRepo.get());
    },
    getById: async (id: string): Promise<Room | undefined> => {
      logApiCall('GET', `/api/rooms/${id}`);
      return delay(roomsRepo.findOne(id));
    },
    create: async (room: Room): Promise<Room> => {
      logApiCall('POST', '/api/rooms', room);
      return delay(roomsRepo.insert(room));
    },
    update: async (id: string, room: Partial<Room>): Promise<Room> => {
      logApiCall('PUT', `/api/rooms/${id}`, room);
      return delay(roomsRepo.update(id, room));
    },
    delete: async (id: string): Promise<boolean> => {
      logApiCall('DELETE', `/api/rooms/${id}`);
      return delay(roomsRepo.delete(id));
    }
  },

  /**
   * RÉSERVATIONS / RESERVATIONS API (GET, POST, PUT, DELETE)
   */
  reservations: {
    getAll: async (): Promise<Reservation[]> => {
      logApiCall('GET', '/api/reservations');
      return delay(reservationsRepo.get());
    },
    getById: async (id: string): Promise<Reservation | undefined> => {
      logApiCall('GET', `/api/reservations/${id}`);
      return delay(reservationsRepo.findOne(id));
    },
    create: async (res: Reservation): Promise<Reservation> => {
      logApiCall('POST', '/api/reservations', res);
      return delay(reservationsRepo.insert(res));
    },
    update: async (id: string, res: Partial<Reservation>): Promise<Reservation> => {
      logApiCall('PUT', `/api/reservations/${id}`, res);
      return delay(reservationsRepo.update(id, res));
    },
    delete: async (id: string): Promise<boolean> => {
      logApiCall('DELETE', `/api/reservations/${id}`);
      return delay(reservationsRepo.delete(id));
    }
  },

  /**
   * COMMANDES BRUNCH / BRUNCH ORDERS API (GET, POST, PUT, DELETE)
   */
  orders: {
    getAll: async (): Promise<BrunchOrder[]> => {
      logApiCall('GET', '/api/brunch-orders');
      return delay(ordersRepo.get());
    },
    getById: async (id: string): Promise<BrunchOrder | undefined> => {
      logApiCall('GET', `/api/brunch-orders/${id}`);
      return delay(ordersRepo.findOne(id));
    },
    create: async (order: BrunchOrder): Promise<BrunchOrder> => {
      logApiCall('POST', '/api/brunch-orders', order);
      return delay(ordersRepo.insert(order));
    },
    update: async (id: string, order: Partial<BrunchOrder>): Promise<BrunchOrder> => {
      logApiCall('PUT', `/api/brunch-orders/${id}`, order);
      return delay(ordersRepo.update(id, order));
    },
    delete: async (id: string): Promise<boolean> => {
      logApiCall('DELETE', `/api/brunch-orders/${id}`);
      return delay(ordersRepo.delete(id));
    }
  },

  /**
   * TICKETS DE MAINTENANCE / MAINTENANCE TICKETS API (GET, POST, PUT, DELETE)
   */
  maintenance: {
    getAll: async (): Promise<MaintenanceTicket[]> => {
      logApiCall('GET', '/api/maintenance');
      return delay(maintenanceRepo.get());
    },
    getById: async (id: string): Promise<MaintenanceTicket | undefined> => {
      logApiCall('GET', `/api/maintenance/${id}`);
      return delay(maintenanceRepo.findOne(id));
    },
    create: async (ticket: MaintenanceTicket): Promise<MaintenanceTicket> => {
      logApiCall('POST', '/api/maintenance', ticket);
      return delay(maintenanceRepo.insert(ticket));
    },
    update: async (id: string, ticket: Partial<MaintenanceTicket>): Promise<MaintenanceTicket> => {
      logApiCall('PUT', `/api/maintenance/${id}`, ticket);
      return delay(maintenanceRepo.update(id, ticket));
    },
    delete: async (id: string): Promise<boolean> => {
      logApiCall('DELETE', `/api/maintenance/${id}`);
      return delay(maintenanceRepo.delete(id));
    }
  },

  /**
   * FICHES CLIENTS / GUESTS API (GET, POST, PUT, DELETE)
   */
  guests: {
    getAll: async (): Promise<Guest[]> => {
      logApiCall('GET', '/api/guests');
      return delay(guestsRepo.get());
    },
    getById: async (id: string): Promise<Guest | undefined> => {
      logApiCall('GET', `/api/guests/${id}`);
      return delay(guestsRepo.findOne(id));
    },
    create: async (guest: Guest): Promise<Guest> => {
      logApiCall('POST', '/api/guests', guest);
      return delay(guestsRepo.insert(guest));
    },
    update: async (id: string, guest: Partial<Guest>): Promise<Guest> => {
      logApiCall('PUT', `/api/guests/${id}`, guest);
      return delay(guestsRepo.update(id, guest));
    },
    delete: async (id: string): Promise<boolean> => {
      logApiCall('DELETE', `/api/guests/${id}`);
      return delay(guestsRepo.delete(id));
    }
  },

  /**
   * FLUX FINANCIERS ET PAYEMENTS / PAYMENTS LEDGER API (GET, POST, PUT, DELETE)
   */
  payments: {
    getAll: async (): Promise<Payment[]> => {
      logApiCall('GET', '/api/payments');
      return delay(paymentsRepo.get());
    },
    getById: async (id: string): Promise<Payment | undefined> => {
      logApiCall('GET', `/api/payments/${id}`);
      return delay(paymentsRepo.findOne(id));
    },
    create: async (payment: Payment): Promise<Payment> => {
      logApiCall('POST', '/api/payments', payment);
      return delay(paymentsRepo.insert(payment));
    },
    update: async (id: string, payment: Partial<Payment>): Promise<Payment> => {
      logApiCall('PUT', `/api/payments/${id}`, payment);
      return delay(paymentsRepo.update(id, payment));
    },
    delete: async (id: string): Promise<boolean> => {
      logApiCall('DELETE', `/api/payments/${id}`);
      return delay(paymentsRepo.delete(id));
    }
  },

  /**
   * GESTIONNAIRE D'HABILITATIONS / USER ACCOUNTS & RBAC API (GET, POST, PUT, DELETE, LOGIN)
   */
  users: {
    getAll: async (): Promise<User[]> => {
      logApiCall('GET', '/api/users');
      return delay(usersRepo.get());
    },
    getById: async (id: string): Promise<User | undefined> => {
      logApiCall('GET', `/api/users/${id}`);
      return delay(usersRepo.findOne(id));
    },
    create: async (user: User): Promise<User> => {
      logApiCall('POST', '/api/users', user);
      return delay(usersRepo.insert(user));
    },
    update: async (id: string, user: Partial<User>): Promise<User> => {
      logApiCall('PUT', `/api/users/${id}`, user);
      return delay(usersRepo.update(id, user));
    },
    delete: async (id: string): Promise<boolean> => {
      logApiCall('DELETE', `/api/users/${id}`);
      return delay(usersRepo.delete(id));
    },
    login: async (username: string, password: string): Promise<User | null> => {
      logApiCall('POST', '/api/auth/login', { username });
      const found = usersRepo.get().find(
        (u) => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password
      );
      return delay(found || null);
    }
  },

  /**
   * CONFIGURATION DE L'HÔTEL / HOTEL CONFIG API (GET, PUT)
   */
  config: {
    get: async (): Promise<typeof DEFAULT_CONFIG> => {
      logApiCall('GET', '/api/config');
      const saved = localStorage.getItem('bouake_pms_config');
      if (!saved) {
        localStorage.setItem('bouake_pms_config', JSON.stringify(DEFAULT_CONFIG));
        return delay(DEFAULT_CONFIG);
      }
      return delay(JSON.parse(saved));
    },
    update: async (config: Partial<typeof DEFAULT_CONFIG>): Promise<typeof DEFAULT_CONFIG> => {
      logApiCall('PUT', '/api/config', config);
      const current = await api.config.get();
      const updated = { ...current, ...config };
      localStorage.setItem('bouake_pms_config', JSON.stringify(updated));
      return delay(updated);
    }
  },

  /**
   * GESTION DES STOCKS ET INVENTAIRE / INVENTORY API (ARTICLES, EMPLACEMENTS, SUPPLIERS, MOVEMENTS)
   */
  inventory: {
    articles: {
      getAll: async (): Promise<InventoryArticle[]> => {
        logApiCall('GET', '/api/inventory/articles');
        return delay(articlesRepo.get());
      },
      create: async (art: InventoryArticle): Promise<InventoryArticle> => {
        logApiCall('POST', '/api/inventory/articles', art);
        return delay(articlesRepo.insert(art));
      },
      update: async (id: string, art: Partial<InventoryArticle>): Promise<InventoryArticle> => {
        logApiCall('PUT', `/api/inventory/articles/${id}`, art);
        return delay(articlesRepo.update(id, art));
      },
      delete: async (id: string): Promise<boolean> => {
        logApiCall('DELETE', `/api/inventory/articles/${id}`);
        return delay(articlesRepo.delete(id));
      }
    },
    emplacements: {
      getAll: async (): Promise<InventoryEmplacement[]> => {
        logApiCall('GET', '/api/inventory/emplacements');
        return delay(emplacementsRepo.get());
      },
      create: async (emp: InventoryEmplacement): Promise<InventoryEmplacement> => {
        logApiCall('POST', '/api/inventory/emplacements', emp);
        return delay(emplacementsRepo.insert(emp));
      },
      update: async (id: string, emp: Partial<InventoryEmplacement>): Promise<InventoryEmplacement> => {
        logApiCall('PUT', `/api/inventory/emplacements/${id}`, emp);
        return delay(emplacementsRepo.update(id, emp));
      },
      delete: async (id: string): Promise<boolean> => {
        logApiCall('DELETE', `/api/inventory/emplacements/${id}`);
        return delay(emplacementsRepo.delete(id));
      }
    },
    suppliers: {
      getAll: async (): Promise<InventorySupplier[]> => {
        logApiCall('GET', '/api/inventory/suppliers');
        return delay(suppliersRepo.get());
      },
      create: async (sup: InventorySupplier): Promise<InventorySupplier> => {
        logApiCall('POST', '/api/inventory/suppliers', sup);
        return delay(suppliersRepo.insert(sup));
      },
      update: async (id: string, sup: Partial<InventorySupplier>): Promise<InventorySupplier> => {
        logApiCall('PUT', `/api/inventory/suppliers/${id}`, sup);
        return delay(suppliersRepo.update(id, sup));
      },
      delete: async (id: string): Promise<boolean> => {
        logApiCall('DELETE', `/api/inventory/suppliers/${id}`);
        return delay(suppliersRepo.delete(id));
      }
    },
    movements: {
      getAll: async (): Promise<InventoryMovement[]> => {
        logApiCall('GET', '/api/inventory/movements');
        return delay(movementsRepo.get());
      },
      create: async (mov: InventoryMovement): Promise<InventoryMovement> => {
        logApiCall('POST', '/api/inventory/movements', mov);
        return delay(movementsRepo.insert(mov));
      }
    }
  }
};
