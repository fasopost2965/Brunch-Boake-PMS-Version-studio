import { useState, useEffect } from 'react';
import { 
  Building2, 
  Calendar, 
  Utensils, 
  Sparkles, 
  Database, 
  CheckCircle2, 
  TrendingUp, 
  Wrench, 
  Clock, 
  UserCheck, 
  Home, 
  Receipt, 
  CreditCard, 
  Users,
  Settings,
  Boxes,
  LogOut,
  Lock,
  Menu,
  X,
  ChevronDown,
  ChevronRight
} from 'lucide-react';

// Import Types
import { Room, Reservation, BrunchOrder, MaintenanceTicket, Guest, Payment } from './types';
import { SkeletonScreen } from './components/SkeletonScreen';

// Import Default Seed Data
import { 
  DEFAULT_ROOMS, 
  DEFAULT_RESERVATIONS, 
  DEFAULT_ORDERS, 
  DEFAULT_MAINTENANCE, 
  DEFAULT_GUESTS, 
  DEFAULT_PAYMENTS 
} from './data';

// Import Modular Screens
import { FrontDeskScreen } from './components/FrontDeskScreen';
import { DashboardScreen } from './components/DashboardScreen';
import { ReservationsScreen } from './components/ReservationsScreen';
import { ArrivalsScreen } from './components/ArrivalsScreen';
import { CheckInScreen } from './components/CheckInScreen';
import { RoomsScreen } from './components/RoomsScreen';
import { GuestsScreen } from './components/GuestsScreen';
import { InHouseScreen } from './components/InHouseScreen';
import { BillingScreen } from './components/BillingScreen';
import { PaymentsScreen } from './components/PaymentsScreen';
import { HousekeepingScreen } from './components/HousekeepingScreen';
import { MaintenanceScreen } from './components/MaintenanceScreen';
import { ReportsScreen } from './components/ReportsScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { DatabaseScreen } from './components/DatabaseScreen';
import { BrunchScreen } from './components/BrunchScreen';
import { BrunchLogo } from './components/BrunchLogo';
import { InventoryScreen } from './components/InventoryScreen';

type TabType = 
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
  requiredRoles?: ('admin' | 'receptionist' | 'accountant')[];
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

export default function App() {
  // ==========================================
  // STATE MANAGEMENT WITH LOCALSTORAGE
  // ==========================================
  const [rooms, setRooms] = useState<Room[]>(() => {
    const saved = localStorage.getItem('bouake_pms_rooms');
    return saved ? JSON.parse(saved) : DEFAULT_ROOMS;
  });

  const [reservations, setReservations] = useState<Reservation[]>(() => {
    const saved = localStorage.getItem('bouake_pms_reservations');
    return saved ? JSON.parse(saved) : DEFAULT_RESERVATIONS;
  });

  const [orders, setOrders] = useState<BrunchOrder[]>(() => {
    const saved = localStorage.getItem('bouake_pms_orders');
    return saved ? JSON.parse(saved) : DEFAULT_ORDERS;
  });

  const [maintenance, setMaintenance] = useState<MaintenanceTicket[]>(() => {
    const saved = localStorage.getItem('bouake_pms_maintenance');
    return saved ? JSON.parse(saved) : DEFAULT_MAINTENANCE;
  });

  const [guests, setGuests] = useState<Guest[]>(() => {
    const saved = localStorage.getItem('bouake_pms_guests');
    return saved ? JSON.parse(saved) : DEFAULT_GUESTS;
  });

  const [payments, setPayments] = useState<Payment[]>(() => {
    const saved = localStorage.getItem('bouake_pms_payments');
    return saved ? JSON.parse(saved) : DEFAULT_PAYMENTS;
  });

  const [hotelConfig, setHotelConfig] = useState(() => {
    const saved = localStorage.getItem('bouake_pms_config');
    return saved ? JSON.parse(saved) : {
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
  });

  const [activeTab, setActiveTab] = useState<TabType>('frontdesk');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isSlowNetwork, setIsSlowNetwork] = useState<boolean>(false);
  const [isTabLoading, setIsTabLoading] = useState<boolean>(false);

  const [currentUserRole, setCurrentUserRole] = useState<'admin' | 'receptionist' | 'accountant'>(() => {
    return (localStorage.getItem('bouake_pms_user_role') as any) || 'admin';
  });

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    return { pms: true };
  });

  // Sync role to localStorage
  useEffect(() => {
    localStorage.setItem('bouake_pms_user_role', currentUserRole);
  }, [currentUserRole]);

  // Auto-expand the group of the active tab
  useEffect(() => {
    const parentGroup = NAVIGATION_STRUCTURE.find(group => 
      group.items.some(subItem => subItem.id === activeTab)
    );
    if (parentGroup) {
      setOpenGroups(prev => ({
        ...prev,
        [parentGroup.id]: true
      }));
    }
  }, [activeTab]);

  const toggleGroup = (groupId: string) => {
    setOpenGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const handleTabChange = (tab: TabType) => {
    setIsMobileMenuOpen(false);
    setIsTabLoading(true);
    const delay = isSlowNetwork ? 1000 : 350;
    setActiveTab(tab);
    setTimeout(() => {
      setIsTabLoading(false);
    }, delay);
  };

  const [selectedCheckInReservationId, setSelectedCheckInReservationId] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Authentication State & Handlers
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('bouake_pms_authenticated') === 'true';
  });
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginUsername.trim().toLowerCase() === 'admin' && loginPassword === 'admin') {
      localStorage.setItem('bouake_pms_authenticated', 'true');
      setIsAuthenticated(true);
      setLoginError('');
      triggerToast('Bienvenue sur le PMS de Brunch Bouaké !');
    } else {
      setLoginError('Identifiant ou mot de passe incorrect.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('bouake_pms_authenticated');
    setIsAuthenticated(false);
    setLoginUsername('');
    setLoginPassword('');
    triggerToast('Déconnexion réussie.');
  };

  // Sync state to localstorage
  useEffect(() => {
    localStorage.setItem('bouake_pms_rooms', JSON.stringify(rooms));
  }, [rooms]);

  useEffect(() => {
    localStorage.setItem('bouake_pms_reservations', JSON.stringify(reservations));
  }, [reservations]);

  useEffect(() => {
    localStorage.setItem('bouake_pms_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('bouake_pms_maintenance', JSON.stringify(maintenance));
  }, [maintenance]);

  useEffect(() => {
    localStorage.setItem('bouake_pms_guests', JSON.stringify(guests));
  }, [guests]);

  useEffect(() => {
    localStorage.setItem('bouake_pms_payments', JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem('bouake_pms_config', JSON.stringify(hotelConfig));
  }, [hotelConfig]);

  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  // Header quick KPI calculations
  const occupiedCount = rooms.filter(r => r.status === 'Occupé').length;
  const dirtyCount = rooms.filter(r => r.status === 'Sale').length;
  const totalRevenues = payments.reduce((sum, p) => sum + p.amount, 0);

  // Helper to render the complete navigation hierarchy
  const renderNavigationItems = () => {
    return (
      <div className="flex flex-col gap-2 overflow-y-auto max-h-[calc(100vh-210px)] pr-1 scrollbar-thin">
        {/* Profile / Permission Simulator Panel */}
        <div className="mb-3 px-3 py-2.5 bg-white/5 rounded-xl border border-white/10 flex flex-col gap-1.5 shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-[9px] uppercase font-bold tracking-widest text-white/50">Rôle Actuel :</span>
            <span className={`px-1.5 py-0.5 text-[8px] font-black rounded uppercase tracking-wider ${
              currentUserRole === 'admin' ? 'bg-[#fe6e00]/20 text-[#fe6e00] border border-[#fe6e00]/20' :
              currentUserRole === 'receptionist' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/20' :
              'bg-emerald-500/20 text-emerald-300 border border-emerald-500/20'
            }`}>
              {currentUserRole === 'admin' ? 'Super Admin' : currentUserRole === 'receptionist' ? 'Réception' : 'Comptabilité'}
            </span>
          </div>
          <select
            value={currentUserRole}
            onChange={(e) => {
              setCurrentUserRole(e.target.value as any);
              triggerToast(`Mode simulation de rôle : ${e.target.value === 'admin' ? 'Administrateur' : e.target.value === 'receptionist' ? 'Réceptionniste' : 'Comptable'}`);
            }}
            className="w-full bg-black/60 text-white/90 border border-white/15 rounded-lg p-2 text-xs font-bold focus:outline-none focus:border-[#fe6e00] cursor-pointer"
          >
            <option value="admin">Administrateur (Tout)</option>
            <option value="receptionist">Réceptionniste (Accueil/PMS)</option>
            <option value="accountant">Comptable (Finance/Rapports)</option>
          </select>
        </div>

        {NAVIGATION_STRUCTURE.map((group) => {
          const isOpen = !!openGroups[group.id];
          const GroupIcon = group.icon;
          
          // Count active items in group to highlight parent group if collapsed but has an active child
          const hasActiveChild = group.items.some(item => activeTab === item.id);
          
          return (
            <div key={group.id} className="flex flex-col gap-1 border-b border-white/5 pb-2 last:border-b-0">
              {/* Group Header Button */}
              <button
                onClick={() => toggleGroup(group.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs font-bold uppercase tracking-wide transition-all duration-200 cursor-pointer ${
                  hasActiveChild 
                    ? 'text-[#fe6e00] bg-white/5 font-extrabold' 
                    : 'text-white/80 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <GroupIcon className="w-3.5 h-3.5 shrink-0" />
                  <span className="text-[10px] tracking-wider">{group.title}</span>
                </div>
                {isOpen ? (
                  <ChevronDown className="w-3.5 h-3.5 text-white/40" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-white/40" />
                )}
              </button>

              {/* Group Sub-Items */}
              {isOpen && (
                <div className="flex flex-col gap-0.5 pl-3 mt-1 transition-all duration-200">
                  {group.items.map((item) => {
                    const IconComp = item.icon;
                    const isActive = activeTab === item.id;
                    
                    // Permission Check
                    const hasPermission = !item.requiredRoles || item.requiredRoles.includes(currentUserRole);
                    
                    const handleItemClick = () => {
                      if (item.disabled) {
                        triggerToast(`Le module "${item.label}" est en cours de développement.`);
                        return;
                      }
                      if (!hasPermission) {
                        triggerToast(`Accès restreint au module "${item.label}" pour votre rôle.`);
                        return;
                      }
                      handleTabChange(item.id);
                    };

                    return (
                      <button
                        key={item.id}
                        onClick={handleItemClick}
                        className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-semibold transition-all relative ${
                          isActive 
                            ? 'bg-[#fe6e00] text-white font-bold shadow-xs' 
                            : !hasPermission 
                              ? 'text-white/30 cursor-not-allowed hover:bg-white/5'
                              : item.disabled
                                ? 'text-white/40 cursor-not-allowed hover:bg-white/5'
                                : item.accent 
                                  ? 'text-[#fe6e00] bg-[#fe6e00]/5 hover:bg-[#fe6e00] hover:text-white border border-[#fe6e00]/25'
                                  : 'text-white/70 hover:bg-[#fe6e00] hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <IconComp className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </div>

                        {/* Status badge / lock indicator */}
                        {item.badge ? (
                          <span className="bg-[#fe6e00]/10 text-[#fe6e00] border border-[#fe6e00]/20 text-[7px] font-extrabold px-1 py-0.5 rounded-sm tracking-wider uppercase shrink-0">
                            {item.badge}
                          </span>
                        ) : !hasPermission ? (
                          <span className="text-[8px] bg-red-500/20 text-red-300 font-extrabold px-1 py-0.5 rounded-sm border border-red-500/20 flex items-center gap-0.5 shrink-0">
                            <Lock className="w-2.5 h-2.5" /> Verrouillé
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#fcfaf7] text-[#423d38] flex flex-col justify-center items-center p-4 antialiased font-sans">
        {/* SUCCESS TOAST NOTIFICATION */}
        {successToast && (
          <div className="fixed bottom-5 right-5 bg-[#00c758] text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-bounce">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-semibold text-sm">{successToast}</span>
          </div>
        )}

        <div className="w-full max-w-md bg-white border border-[#e3e0dd] rounded-2xl p-8 shadow-sm flex flex-col gap-6">
          <div className="flex flex-col items-center text-center gap-3">
            <div className="p-3 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center">
              <BrunchLogo size={80} />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight">{hotelConfig.name} PMS</h2>
              <p className="text-xs text-[#797067] mt-1 font-medium">Système de Gestion Hôtelière Professionnelle</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Identifiant :</label>
              <input 
                type="text" 
                required 
                placeholder="admin" 
                value={loginUsername} 
                onChange={(e) => setLoginUsername(e.target.value)}
                className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-lg p-2.5 w-full text-sm focus:outline-none font-semibold text-gray-800"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Mot de Passe :</label>
              <input 
                type="password" 
                required 
                placeholder="••••••••" 
                value={loginPassword} 
                onChange={(e) => setLoginPassword(e.target.value)}
                className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-lg p-2.5 w-full text-sm focus:outline-none font-mono text-gray-800"
              />
            </div>

            {loginError && (
              <p className="text-xs text-[#fb2c36] font-bold bg-red-50 p-2.5 rounded-lg border border-red-100 text-center animate-shake">
                {loginError}
              </p>
            )}

            <button 
              type="submit"
              className="bg-[#fe6e00] hover:bg-[#d55c00] text-white font-extrabold py-3 rounded-lg transition-all uppercase text-xs tracking-wider cursor-pointer shadow-sm shadow-[#fe6e00]/20 flex items-center justify-center gap-1.5 mt-2"
            >
              <Lock className="w-3.5 h-3.5" />
              S'authentifier
            </button>
          </form>

          <div className="border-t border-dashed border-[#e3e0dd] pt-4 text-center">
            <span className="text-[10px] text-[#797067] font-semibold">Brunch Bouaké PMS Secured Terminal</span>
            <p className="text-[9px] text-[#797067]/80 mt-0.5">Identifiants par défaut: <strong className="font-mono text-gray-800">admin / admin</strong></p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfaf7] text-[#423d38] flex flex-col antialiased font-sans">
      
      {/* SUCCESS TOAST NOTIFICATION */}
      {successToast && (
        <div className="fixed bottom-5 right-5 bg-[#00c758] text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-semibold text-sm">{successToast}</span>
        </div>
      )}

      {/* TOP HEADER BAR */}
      <header className="bg-black/70 backdrop-blur-md border-b border-white/10 sticky top-0 z-30 px-4 md:px-6 h-16 flex items-center justify-between text-white rounded-none">
        <div className="flex items-center gap-2 md:gap-3">
          {/* Hamburger toggle for mobile */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className="md:hidden text-white hover:text-[#fe6e00] p-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-white/20 shrink-0"
            title="Menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <div className="bg-white p-1 rounded-lg flex items-center justify-center shadow-lg shadow-[#fe6e00]/25 border border-white/10 shrink-0">
            <BrunchLogo size={32} />
          </div>
          <div>
            <h1 className="text-sm md:text-base font-bold tracking-tight text-white">{hotelConfig.name} PMS</h1>
            <p className="text-[9px] md:text-[11px] text-white/60 font-medium flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#00c758] animate-pulse"></span>
              <span className="hidden sm:inline">Gestion de l'Etablissement • Bouaké, CI</span>
              <span className="sm:hidden">Bouaké, CI</span>
            </p>
          </div>
        </div>

        {/* Quick KPI stats banner */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Slow connection simulator */}
          <button 
            onClick={() => {
              setIsSlowNetwork(!isSlowNetwork);
              triggerToast(!isSlowNetwork ? "Mode Connexion Lente (3G simulée) activé." : "Connexion normale rétablie.");
            }}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-bold tracking-wider uppercase transition-all border shrink-0 ${
              isSlowNetwork 
                ? 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse' 
                : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isSlowNetwork ? 'bg-red-500' : 'bg-green-500'}`}></span>
            <span className="hidden xs:inline">{isSlowNetwork ? "LENT" : "RÉSEAU NORM."}</span>
            <span className="xs:hidden">{isSlowNetwork ? "3G" : "Normal"}</span>
          </button>

          <div className="hidden lg:flex items-center gap-6 bg-white/5 border border-white/10 rounded-lg px-4 py-1.5 text-xs text-white">
            <div>
              <span className="text-white/50 block uppercase font-bold tracking-widest text-[9px]">Chambres Occ.</span>
              <span className="font-bold text-white text-sm">{occupiedCount} / {rooms.length}</span>
            </div>
            <div className="h-6 w-px bg-white/10"></div>
            <div>
              <span className="text-white/50 block uppercase font-bold tracking-widest text-[9px]">Revenus encaissés</span>
              <span className="font-bold text-[#fe6e00] text-sm">{totalRevenues.toLocaleString()} F</span>
            </div>
            <div className="h-6 w-px bg-white/10"></div>
            <div>
              <span className="text-white/50 block uppercase font-bold tracking-widest text-[9px]">Entretien</span>
              <span className="font-bold text-[#fe6e00] text-sm">{dirtyCount} sales</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs shrink-0">
            <div className="text-right hidden sm:block">
              <span className="font-semibold text-white block">Opérateur local</span>
              <span className="text-white/60 text-[10px]">fasopost24@gmail.com</span>
            </div>
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-white/10 flex items-center justify-center text-white font-bold border border-white/10 text-xs md:text-sm">
              FP
            </div>
          </div>
        </div>
      </header>

      {/* CORE WORKSPACE SECTION */}
      <div className="flex-1 flex flex-col md:flex-row relative">
        
        {/* MOBILE OVERLAY DRAWER */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
            <aside 
              className="w-72 max-w-[85vw] h-full bg-black/95 border-r border-white/10 p-4 flex flex-col gap-1 text-white shadow-2xl overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-3 mb-4 border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="bg-white p-1 rounded-md">
                    <BrunchLogo size={20} />
                  </div>
                  <span className="font-extrabold text-xs tracking-wider text-[#fe6e00]">BRUNCH BOUAKÉ</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-white/60 hover:text-white p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                {renderNavigationItems()}
              </div>

              <div className="h-px bg-white/10 my-4 shrink-0"></div>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-3 rounded-lg text-xs font-semibold text-red-400 hover:bg-[#fb2c36] hover:text-white transition-all cursor-pointer shrink-0"
              >
                <LogOut className="w-4 h-4" />
                Déconnexion Admin
              </button>
            </aside>
          </div>
        )}
        
        {/* DESKTOP SIDEBAR NAVIGATION */}
        <aside className="hidden md:flex w-64 bg-black/70 backdrop-blur-md border-r border-white/10 p-4 flex-col gap-1 shrink-0 text-white rounded-none">
          <div className="flex items-center gap-2 px-3 mb-4 border-b border-white/10 pb-3 shrink-0">
            <div className="bg-white p-1 rounded-md">
              <BrunchLogo size={18} />
            </div>
            <span className="font-extrabold text-xs tracking-wider text-[#fe6e00]">BRUNCH BOUAKÉ</span>
          </div>

          <div className="flex-1 overflow-y-auto">
            {renderNavigationItems()}
          </div>

          <div className="h-px bg-white/10 my-2 shrink-0"></div>

          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold text-red-400 hover:bg-[#fb2c36] hover:text-white transition-all cursor-pointer shrink-0"
          >
            <LogOut className="w-4 h-4" />
            Déconnexion Admin
          </button>
        </aside>

        {/* MAIN BODY LAYOUT */}
        <main className="flex-1 p-4 md:p-8 flex flex-col gap-6 overflow-y-auto max-w-full">
          
          {isTabLoading ? (
            <SkeletonScreen tab={activeTab} />
          ) : (
            <>
              {activeTab === 'dashboard' && (
            <DashboardScreen 
              rooms={rooms}
              reservations={reservations}
              maintenance={maintenance}
              guests={guests}
              payments={payments}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'frontdesk' && (
            <FrontDeskScreen 
              rooms={rooms}
              reservations={reservations}
              payments={payments}
              setRooms={setRooms}
              setReservations={setReservations}
              setPayments={setPayments}
              triggerToast={triggerToast}
              setActiveTab={setActiveTab}
              setSelectedCheckInReservationId={setSelectedCheckInReservationId}
            />
          )}

          {activeTab === 'reservations' && (
            <ReservationsScreen 
              reservations={reservations}
              rooms={rooms}
              setReservations={setReservations}
              setRooms={setRooms}
              triggerToast={triggerToast}
              hotelConfig={hotelConfig}
            />
          )}

          {activeTab === 'arrivals' && (
            <ArrivalsScreen 
              reservations={reservations}
              rooms={rooms}
              setReservations={setReservations}
              setRooms={setRooms}
              triggerToast={triggerToast}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'checkin' && (
            <CheckInScreen 
              rooms={rooms}
              reservations={reservations}
              guests={guests}
              payments={payments}
              setRooms={setRooms}
              setReservations={setReservations}
              setGuests={setGuests}
              setPayments={setPayments}
              triggerToast={triggerToast}
              setActiveTab={setActiveTab}
              selectedCheckInReservationId={selectedCheckInReservationId}
              setSelectedCheckInReservationId={setSelectedCheckInReservationId}
              hotelConfig={hotelConfig}
            />
          )}

          {activeTab === 'rooms' && (
            <RoomsScreen 
              rooms={rooms}
              setRooms={setRooms}
              triggerToast={triggerToast}
            />
          )}

          {activeTab === 'guests' && (
            <GuestsScreen 
              guests={guests}
              reservations={reservations}
              payments={payments}
              setGuests={setGuests}
              triggerToast={triggerToast}
            />
          )}

          {activeTab === 'inhouse' && (
            <InHouseScreen 
              reservations={reservations}
              rooms={rooms}
              payments={payments}
              setReservations={setReservations}
              setRooms={setRooms}
              setPayments={setPayments}
              triggerToast={triggerToast}
            />
          )}

          {activeTab === 'billing' && (
            <BillingScreen 
              reservations={reservations}
              orders={orders}
              rooms={rooms}
              payments={payments}
              setReservations={setReservations}
              setPayments={setPayments}
              triggerToast={triggerToast}
              setActiveTab={setActiveTab}
              hotelConfig={hotelConfig}
            />
          )}

          {activeTab === 'payments' && (
            <PaymentsScreen 
              payments={payments}
              reservations={reservations}
              setPayments={setPayments}
              setReservations={setReservations}
              triggerToast={triggerToast}
            />
          )}

          {activeTab === 'housekeeping' && (
            <HousekeepingScreen 
              rooms={rooms}
              setRooms={setRooms}
              triggerToast={triggerToast}
            />
          )}

          {activeTab === 'maintenance' && (
            <MaintenanceScreen 
              maintenance={maintenance}
              rooms={rooms}
              setMaintenance={setMaintenance}
              setRooms={setRooms}
              triggerToast={triggerToast}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryScreen 
              triggerToast={triggerToast}
            />
          )}

          {activeTab === 'brunch' && (
            <BrunchScreen 
              rooms={rooms}
              orders={orders}
              setOrders={setOrders}
              setReservations={setReservations}
              triggerToast={triggerToast}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsScreen 
              reservations={reservations}
              orders={orders}
              payments={payments}
              rooms={rooms}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsScreen 
              hotelConfig={hotelConfig}
              setHotelConfig={setHotelConfig}
              triggerToast={triggerToast}
              reservations={reservations}
              setReservations={setReservations}
              rooms={rooms}
              setRooms={setRooms}
            />
          )}

          {activeTab === 'database' && (
            <DatabaseScreen 
              triggerToast={triggerToast}
            />
          )}

            </>
          )}

        </main>
      </div>
    </div>
  );
}
