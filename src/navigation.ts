import { Building2, Calendar, Utensils, Sparkles, Database, TrendingUp, Wrench, Clock, UserCheck, Home, Receipt, CreditCard, Users, Settings, Boxes } from 'lucide-react';

export type TabType = 
  | 'dashboard' 
  | 'frontdesk'
  | 'reservations' 
  | 'arrivals' 
  | 'checkin' 
  | 'rooms' 
  | 'guests' 
  | 'inhouse' 
  | 'billing' 
  | 'payments' 
  | 'housekeeping' 
  | 'maintenance' 
  | 'inventory'
  | 'reports' 
  | 'settings' 
  | 'brunch' 
  | 'database'
  | 'pos_tables'
  | 'pos_kitchen';

export interface NavSubItem {
  id: TabType;
  label: string;
  icon: any;
  accent?: boolean;
  disabled?: boolean;
  badge?: string;
  requiredRoles?: ('admin' | 'receptionist' | 'accountant' | 'gerant')[];
}

export interface NavGroup {
  id: string;
  title: string;
  icon: any;
  items: NavSubItem[];
}

export const NAVIGATION_STRUCTURE: NavGroup[] = [
  {
    id: 'pms',
    title: 'Hébergement / PMS',
    icon: Building2,
    items: [
      { id: 'dashboard', label: 'Tableau de Bord', icon: TrendingUp, requiredRoles: ['admin', 'receptionist', 'accountant'] },
      { id: 'frontdesk', label: 'Front Desk (Parcours)', icon: UserCheck, accent: true, requiredRoles: ['admin', 'receptionist'] },
      { id: 'reservations', label: 'Réservations', icon: Calendar, requiredRoles: ['admin', 'receptionist'] },
      { id: 'arrivals', label: 'Arrivées du Jour', icon: Clock, requiredRoles: ['admin', 'receptionist'] },
      { id: 'checkin', label: 'Enregistrement (Check-In)', icon: UserCheck, requiredRoles: ['admin', 'receptionist'] },
      { id: 'rooms', label: 'Plan des Chambres', icon: Building2, requiredRoles: ['admin', 'receptionist'] },
      { id: 'guests', label: 'Fiches Clients', icon: Users, requiredRoles: ['admin', 'receptionist', 'accountant'] },
      { id: 'inhouse', label: 'Séjours en cours', icon: Home, requiredRoles: ['admin', 'receptionist'] },
      { id: 'housekeeping', label: 'Gouvernance & Ménage', icon: Sparkles, requiredRoles: ['admin', 'receptionist'] },
      { id: 'maintenance', label: 'Tickets Maintenance', icon: Wrench, requiredRoles: ['admin', 'receptionist'] },
    ]
  },
  {
    id: 'pos',
    title: 'POS / Maquis',
    icon: Utensils,
    items: [
      { id: 'brunch', label: 'Brunch & Café (PDV)', icon: Utensils, requiredRoles: ['admin', 'receptionist'] },
      { id: 'pos_tables', label: 'Gestion des Tables', icon: Database, disabled: true, badge: 'Bientôt', requiredRoles: ['admin'] },
      { id: 'pos_kitchen', label: 'Cuisine & Commandes', icon: Clock, disabled: true, badge: 'Bientôt', requiredRoles: ['admin'] },
    ]
  },
  {
    id: 'finance',
    title: 'Comptabilité & Facture',
    icon: Receipt,
    items: [
      { id: 'billing', label: 'Facturation & Folio', icon: Receipt, requiredRoles: ['admin', 'accountant'] },
      { id: 'payments', label: 'Journal de Caisse', icon: CreditCard, requiredRoles: ['admin', 'accountant'] },
    ]
  },
  {
    id: 'stocks',
    title: 'Stock / Inventaire',
    icon: Boxes,
    items: [
      { id: 'inventory', label: 'Gestion des Stocks', icon: Boxes, requiredRoles: ['admin'] },
    ]
  },
  {
    id: 'reports',
    title: 'Rapports d\'Activité',
    icon: TrendingUp,
    items: [
      { id: 'reports', label: "Rapports d'Activité", icon: TrendingUp, requiredRoles: ['admin', 'accountant'] },
    ]
  },
  {
    id: 'settings',
    title: 'Paramètres',
    icon: Settings,
    items: [
      { id: 'settings', label: 'Configuration Hôtel', icon: Settings, requiredRoles: ['admin'] },
      { id: 'database', label: 'Base de Données & MySQL', icon: Database, accent: true, requiredRoles: ['admin'] },
    ]
  }
];
