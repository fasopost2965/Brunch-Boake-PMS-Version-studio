import React, { useState, useEffect } from 'react';
import { api } from './api';
import { Room, Reservation, BrunchOrder, MaintenanceTicket, Guest, Payment, User } from './types';

// Import sub-screens
import { DashboardScreen } from './components/DashboardScreen';
import { ReservationsScreen } from './components/ReservationsScreen';
import { RoomsScreen } from './components/RoomsScreen';
import { HousekeepingScreen } from './components/HousekeepingScreen';
import { BrunchScreen } from './components/BrunchScreen';
import { InventoryScreen } from './components/InventoryScreen';
import { PaymentsScreen } from './components/PaymentsScreen';
import { GuestsScreen } from './components/GuestsScreen';
import { ReportsScreen } from './components/ReportsScreen';
import { DatabaseScreen } from './components/DatabaseScreen';
import { SettingsScreen } from './components/SettingsScreen';

// Lucide icons
import {
  LayoutDashboard,
  CalendarDays,
  BedDouble,
  Sparkles,
  Coffee,
  PackageCheck,
  Coins,
  Users2,
  BarChart4,
  Database,
  Settings as SettingsIcon,
  LogOut,
  RefreshCw,
  Lock,
  ChevronRight,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // PMS Data States
  const [rooms, setRooms] = useState<Room[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [orders, setOrders] = useState<BrunchOrder[]>([]);
  const [maintenanceTickets, setMaintenanceTickets] = useState<MaintenanceTicket[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  // Navigation & UI States
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [loading, setLoading] = useState<boolean>(true);
  const [dbMode, setDbMode] = useState<'production' | 'simulation'>('simulation');
  const [currentTime, setCurrentTime] = useState<string>('');

  // Check Session on mount
  useEffect(() => {
    const sessionUser = sessionStorage.getItem('pms_user');
    if (sessionUser) {
      try {
        setCurrentUser(JSON.parse(sessionUser));
      } catch {
        sessionStorage.removeItem('pms_user');
      }
    }

    // Tick current time
    const tick = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch all PMS data from API
  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Check database connection mode
      try {
        const healthRes = await fetch('/api/health');
        if (healthRes.ok) {
          const health = await healthRes.json();
          setDbMode(health.database.mode);
        }
      } catch {
        setDbMode('simulation');
      }

      const [rList, resList, ordList, maintList, gList, payList] = await Promise.all([
        api.rooms.getAll(),
        api.reservations.getAll(),
        api.orders.getAll(),
        api.maintenance.getAll(),
        api.guests.getAll(),
        api.payments.getAll()
      ]);

      setRooms(rList);
      setReservations(resList);
      setOrders(ordList);
      setMaintenanceTickets(maintList);
      setGuests(gList);
      setPayments(payList);
    } catch (err) {
      console.error('[SYSTEM] Échec de chargement des données:', err);
    } finally {
      setLoading(false);
    }
  };

  // Trigger fetch when user is authenticated
  useEffect(() => {
    if (currentUser) {
      fetchAllData();
    }
  }, [currentUser]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const users = await api.users.getAll();
      const matched = users.find(u => u.username === username && u.password === password);
      
      if (matched) {
        setCurrentUser(matched);
        sessionStorage.setItem('pms_user', JSON.stringify(matched));
      } else {
        setLoginError('Identifiant ou mot de passe incorrect.');
      }
    } catch (err) {
      setLoginError('Impossible de contacter le serveur d\'authentification.');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem('pms_user');
  };

  // Render Login Screen if not authenticated
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#fcfaf7] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl border border-gray-200 p-8 shadow-lg space-y-6 animate-fade-in">
          {/* Logo Brand */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center bg-[#fe6e00]/10 border border-[#fe6e00]/30 w-16 h-16 rounded-2xl shadow-sm">
              <span className="text-3xl">🥐</span>
            </div>
            <h1 className="text-2xl font-outfit font-extrabold text-gray-900 tracking-tight">PMS Brunch Bouaké</h1>
            <p className="text-xs text-gray-400 font-medium">Système d'administration hôtelière (Evreghen Command Center)</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {loginError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl text-center font-medium">
                {loginError}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500">Nom d'utilisateur :</label>
              <input
                required
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Ex: admin"
                className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-xs focus:ring-1 focus:ring-[#fe6e00] outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500">Mot de passe :</label>
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-xs focus:ring-1 focus:ring-[#fe6e00] outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#fe6e00] hover:bg-[#ff6b00] text-white font-semibold py-3 rounded-xl text-xs transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              S'authentifier
            </button>
          </form>

          {/* Hints for user convenience */}
          <div className="bg-[#fcfaf7] border border-gray-100 rounded-2xl p-4 text-[10px] text-gray-400 space-y-1 leading-normal">
            <p className="font-bold text-gray-500 uppercase tracking-wider mb-1">Identifiants d'accès démo :</p>
            <p>● Gérant : <span className="font-mono text-gray-600 font-semibold">gerant</span> / mot de passe : <span className="font-mono text-gray-600 font-semibold">gerant</span></p>
            <p>● Admin : <span className="font-mono text-gray-600 font-semibold">admin</span> / mot de passe : <span className="font-mono text-gray-600 font-semibold">admin</span></p>
          </div>
        </div>
      </div>
    );
  }

  // Navigation Items definitions
  const navItems = [
    { id: 'dashboard', label: 'Command Center', icon: LayoutDashboard },
    { id: 'reservations', label: 'Cahier Réservations', icon: CalendarDays },
    { id: 'rooms', label: 'Inventaire Chambres', icon: BedDouble },
    { id: 'housekeeping', label: 'Propreté / Ménage', icon: Sparkles },
    { id: 'brunch', label: 'Cuisine / Brunch', icon: Coffee },
    { id: 'inventory', label: 'Gestion Stocks', icon: PackageCheck },
    { id: 'payments', label: 'Règlements (FCFA)', icon: Coins },
    { id: 'guests', label: 'Fichier Clients', icon: Users2 },
    { id: 'reports', label: 'Analyses & Rapports', icon: BarChart4 },
    { id: 'database', label: 'Diagnostics Base', icon: Database },
    { id: 'settings', label: 'Configuration', icon: SettingsIcon }
  ];

  return (
    <div className="min-h-screen bg-[#fcfaf7] flex text-[#423d38] font-sans antialiased selection:bg-[#fe6e00]/20 selection:text-[#fe6e00]">
      {/* Sidebar navigation drawer */}
      <aside className="w-64 border-r border-gray-200 bg-white flex flex-col justify-between shrink-0 hidden md:flex">
        <div className="space-y-6 py-6">
          {/* Brand header */}
          <div className="px-5 flex items-center gap-3">
            <div className="bg-[#fe6e00]/10 border border-[#fe6e00]/30 w-10 h-10 rounded-xl flex items-center justify-center">
              <span className="text-xl">🥐</span>
            </div>
            <div>
              <h2 className="text-sm font-outfit font-extrabold text-gray-900 tracking-tight leading-none">Brunch Bouaké</h2>
              <span className="text-[10px] text-gray-400 font-medium">PMS hôtelier d'excellence</span>
            </div>
          </div>

          {/* Navigation links */}
          <nav className="px-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              // Compute counting badges dynamically
              let badge: number | null = null;
              if (item.id === 'brunch') badge = orders.length;
              if (item.id === 'housekeeping') badge = rooms.filter(r => r.status === 'Sale').length;

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold tracking-tight transition-all active:scale-98 ${isActive ? 'bg-[#fe6e00] text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    {item.label}
                  </span>
                  {badge !== null && badge > 0 && (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${isActive ? 'bg-white text-[#fe6e00]' : 'bg-red-100 text-red-600'}`}>
                      {badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer info & Logout */}
        <div className="p-4 border-t border-gray-100 space-y-3">
          <div className="flex items-center gap-2.5 px-1.5">
            <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold font-mono text-gray-700">G</span>
            </div>
            <div className="truncate">
              <p className="text-[11px] font-bold text-gray-800 leading-tight truncate">{currentUser.name}</p>
              <p className="text-[9px] text-gray-400 uppercase font-mono tracking-wider">{currentUser.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-50 transition-all active:scale-95"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Se déconnecter
          </button>
        </div>
      </aside>

      {/* Main dynamic container */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top bar header */}
        <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
            {/* Live GMT clock */}
            <div className="text-xs text-gray-400 font-semibold font-mono flex items-center gap-1">
              <span>GMT :</span>
              <span className="text-gray-800 bg-[#fcfaf7] border border-gray-100 px-2.5 py-1 rounded-lg">
                {currentTime || '00:00:00'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Data sync state */}
            <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
              {dbMode === 'production' ? (
                <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-lg">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#00c758]" />
                  MySQL connecté
                </span>
              ) : (
                <span className="flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-lg">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#edb200]" />
                  Mode simulation de secours
                </span>
              )}
            </div>

            <button
              onClick={fetchAllData}
              disabled={loading}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors bg-[#fcfaf7] hover:bg-gray-100 rounded-lg border border-gray-100"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </header>

        {/* Dynamic Screen View with Loading Overlay */}
        <section className="flex-1 overflow-y-auto p-6 md:p-8 relative">
          {loading ? (
            <div className="absolute inset-0 bg-[#fcfaf7]/70 flex items-center justify-center z-10">
              <div className="flex flex-col items-center gap-2">
                <RefreshCw className="w-8 h-8 text-[#fe6e00] animate-spin" />
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest font-outfit">PMS Synchronisation...</p>
              </div>
            </div>
          ) : null}

          {activeTab === 'dashboard' && (
            <DashboardScreen
              rooms={rooms}
              reservations={reservations}
              orders={orders}
              maintenanceTickets={maintenanceTickets}
              payments={payments}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'reservations' && (
            <ReservationsScreen
              reservations={reservations}
              rooms={rooms}
              guests={guests}
              onReservationsUpdate={fetchAllData}
              onRoomsUpdate={fetchAllData}
              onPaymentsUpdate={fetchAllData}
              onGuestsUpdate={fetchAllData}
            />
          )}

          {activeTab === 'rooms' && (
            <RoomsScreen
              rooms={rooms}
              onRoomsUpdate={fetchAllData}
            />
          )}

          {activeTab === 'housekeeping' && (
            <HousekeepingScreen
              rooms={rooms}
              maintenanceTickets={maintenanceTickets}
              onRoomsUpdate={fetchAllData}
              onMaintenanceUpdate={fetchAllData}
            />
          )}

          {activeTab === 'brunch' && (
            <BrunchScreen
              rooms={rooms}
              orders={orders}
              onOrdersUpdate={fetchAllData}
              onPaymentsUpdate={fetchAllData}
              onRoomsUpdate={fetchAllData}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryScreen
              onDataRefresh={fetchAllData}
            />
          )}

          {activeTab === 'payments' && (
            <PaymentsScreen
              payments={payments}
              reservations={reservations}
              onPaymentsUpdate={fetchAllData}
              onReservationsUpdate={fetchAllData}
            />
          )}

          {activeTab === 'guests' && (
            <GuestsScreen
              guests={guests}
              onGuestsUpdate={fetchAllData}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsScreen
              rooms={rooms}
              reservations={reservations}
              payments={payments}
            />
          )}

          {activeTab === 'database' && (
            <DatabaseScreen
              onDataRefresh={fetchAllData}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsScreen
              currentUser={currentUser}
              onLogout={handleLogout}
            />
          )}
        </section>
      </main>
    </div>
  );
}
