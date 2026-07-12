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
  Boxes
} from 'lucide-react';

// Import Types
import { Room, Reservation, BrunchOrder, MaintenanceTicket, Guest, Payment } from './types';

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
  | 'database';

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
        'Pavillon Brunch': 120000
      }
    };
  });

  const [activeTab, setActiveTab] = useState<TabType>('frontdesk');
  const [selectedCheckInReservationId, setSelectedCheckInReservationId] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

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
      <header className="bg-black/70 backdrop-blur-md border-b border-white/10 sticky top-0 z-30 px-6 h-16 flex items-center justify-between text-white rounded-none">
        <div className="flex items-center gap-3">
          <div className="bg-white p-1 rounded-lg flex items-center justify-center shadow-lg shadow-[#fe6e00]/25 border border-white/10 shrink-0">
            <BrunchLogo size={36} />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white">{hotelConfig.name} PMS</h1>
            <p className="text-[11px] text-white/60 font-medium flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#00c758] animate-pulse"></span>
              Gestion de l'Etablissement • Bouaké, CI
            </p>
          </div>
        </div>

        {/* Quick KPI stats banner */}
        <div className="flex items-center gap-4">
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

          <div className="flex items-center gap-2 text-xs">
            <div className="text-right">
              <span className="font-semibold text-white block">Opérateur local</span>
              <span className="text-white/60 text-[10px]">fasopost24@gmail.com</span>
            </div>
            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center text-white font-bold border border-white/10">
              FP
            </div>
          </div>
        </div>
      </header>

      {/* CORE WORKSPACE SECTION */}
      <div className="flex-1 flex flex-col md:flex-row">
        
        {/* SIDEBAR NAVIGATION */}
        <aside className="w-full md:w-64 bg-black/70 backdrop-blur-md border-r border-white/10 p-4 flex flex-col gap-1 shrink-0 text-white rounded-none">
          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest px-3 mb-2">Navigation Générale</p>
          
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'dashboard' 
                ? 'bg-[#fe6e00] text-white font-bold shadow-sm' 
                : 'text-white/70 hover:bg-[#fe6e00] hover:text-white'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Tableau de Bord
          </button>

          <button 
            onClick={() => setActiveTab('frontdesk')}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'frontdesk' 
                ? 'bg-[#fe6e00] text-white font-bold shadow-sm' 
                : 'text-white/70 hover:bg-[#fe6e00] hover:text-white bg-white/5 border border-white/10'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            Front Desk (Parcours)
          </button>

          <button 
            onClick={() => setActiveTab('reservations')}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'reservations' 
                ? 'bg-[#fe6e00] text-white font-bold shadow-sm' 
                : 'text-white/70 hover:bg-[#fe6e00] hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Réservations
          </button>

          <button 
            onClick={() => setActiveTab('arrivals')}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'arrivals' 
                ? 'bg-[#fe6e00] text-white font-bold shadow-sm' 
                : 'text-white/70 hover:bg-[#fe6e00] hover:text-white'
            }`}
          >
            <Clock className="w-4 h-4" />
            Arrivées du Jour
          </button>

          <button 
            onClick={() => setActiveTab('checkin')}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'checkin' 
                ? 'bg-[#fe6e00] text-white font-bold shadow-sm' 
                : 'text-white/70 hover:bg-[#fe6e00] hover:text-white'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            Enregistrement (Check-In)
          </button>

          <button 
            onClick={() => setActiveTab('rooms')}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'rooms' 
                ? 'bg-[#fe6e00] text-white font-bold shadow-sm' 
                : 'text-white/70 hover:bg-[#fe6e00] hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Plan des Chambres
          </button>

          <button 
            onClick={() => setActiveTab('guests')}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'guests' 
                ? 'bg-[#fe6e00] text-white font-bold shadow-sm' 
                : 'text-white/70 hover:bg-[#fe6e00] hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            Fiches Clients
          </button>

          <button 
            onClick={() => setActiveTab('inhouse')}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'inhouse' 
                ? 'bg-[#fe6e00] text-white font-bold shadow-sm' 
                : 'text-white/70 hover:bg-[#fe6e00] hover:text-white'
            }`}
          >
            <Home className="w-4 h-4" />
            Séjours en cours
          </button>

          <button 
            onClick={() => setActiveTab('billing')}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'billing' 
                ? 'bg-[#fe6e00] text-white font-bold shadow-sm' 
                : 'text-white/70 hover:bg-[#fe6e00] hover:text-white'
            }`}
          >
            <Receipt className="w-4 h-4" />
            Facturation & Folio
          </button>

          <button 
            onClick={() => setActiveTab('payments')}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'payments' 
                ? 'bg-[#fe6e00] text-white font-bold shadow-sm' 
                : 'text-white/70 hover:bg-[#fe6e00] hover:text-white'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            Journal de Caisse
          </button>

          <button 
            onClick={() => setActiveTab('housekeeping')}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'housekeeping' 
                ? 'bg-[#fe6e00] text-white font-bold shadow-sm' 
                : 'text-white/70 hover:bg-[#fe6e00] hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Gouvernance & Ménage
          </button>

          <button 
            onClick={() => setActiveTab('maintenance')}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'maintenance' 
                ? 'bg-[#fe6e00] text-white font-bold shadow-sm' 
                : 'text-white/70 hover:bg-[#fe6e00] hover:text-white'
            }`}
          >
            <Wrench className="w-4 h-4" />
            Tickets Maintenance
          </button>

          <button 
            onClick={() => setActiveTab('inventory')}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'inventory' 
                ? 'bg-[#fe6e00] text-white font-bold shadow-sm' 
                : 'text-white/70 hover:bg-[#fe6e00] hover:text-white'
            }`}
          >
            <Boxes className="w-4 h-4" />
            Gestion des Stocks
          </button>

          <button 
            onClick={() => setActiveTab('brunch')}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'brunch' 
                ? 'bg-[#fe6e00] text-white font-bold shadow-sm' 
                : 'text-white/70 hover:bg-[#fe6e00] hover:text-white'
            }`}
          >
            <Utensils className="w-4 h-4" />
            Brunch & Café (PDV)
          </button>

          <button 
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'reports' 
                ? 'bg-[#fe6e00] text-white font-bold shadow-sm' 
                : 'text-white/70 hover:bg-[#fe6e00] hover:text-white'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Rapports d'Activité
          </button>

          <button 
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'settings' 
                ? 'bg-[#fe6e00] text-white font-bold shadow-sm' 
                : 'text-white/70 hover:bg-[#fe6e00] hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4" />
            Configuration Hôtel
          </button>

          <div className="h-px bg-white/10 my-2"></div>
          
          <button 
            onClick={() => setActiveTab('database')}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'database' 
                ? 'bg-[#fe6e00] text-white font-bold shadow-sm' 
                : 'text-white/70 hover:bg-[#fe6e00] hover:text-white bg-white/5 border border-white/10'
            }`}
          >
            <Database className="w-4 h-4" />
            Base de Données & MySQL
          </button>
        </aside>

        {/* MAIN BODY LAYOUT */}
        <main className="flex-1 p-6 md:p-8 flex flex-col gap-6 overflow-y-auto">
          
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

        </main>
      </div>
    </div>
  );
}
