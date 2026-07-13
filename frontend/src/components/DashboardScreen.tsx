import React from 'react';
import { Room, Reservation, BrunchOrder, MaintenanceTicket, Payment } from '../types';
import { Bed, Calendar, ClipboardList, Clock, Coffee, DollarSign, Sparkles, TrendingUp, Users, Wrench } from 'lucide-react';

interface DashboardScreenProps {
  rooms: Room[];
  reservations: Reservation[];
  orders: BrunchOrder[];
  maintenanceTickets: MaintenanceTicket[];
  payments: Payment[];
  setActiveTab: (tab: string) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  rooms,
  reservations,
  orders,
  maintenanceTickets,
  payments,
  setActiveTab,
}) => {
  // Statistics computation
  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter(r => r.status === 'Occupé').length;
  const dirtyRooms = rooms.filter(r => r.status === 'Sale').length;
  const maintenanceRooms = rooms.filter(r => r.status === 'Maintenance').length;
  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

  const activeBookingsCount = reservations.filter(r => r.status === 'En Cours').length;
  const pendingOrdersCount = orders.length;
  const activeMaintenanceCount = maintenanceTickets.filter(t => t.status !== 'Résolu').length;

  const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);

  const stats = [
    { label: 'Occupation', value: `${occupancyRate}%`, desc: `${occupiedRooms} / ${totalRooms} chambres occupées`, icon: Bed, color: 'text-blue-600 bg-blue-50 border-blue-100', tab: 'rooms' },
    { label: 'Règlements encaissés', value: `${totalCollected.toLocaleString()} FCFA`, desc: 'Total cumulé des dépôts réels', icon: DollarSign, color: 'text-emerald-600 bg-emerald-50 border-emerald-100', tab: 'payments' },
    { label: 'Brunchs en Cuisine', value: `${pendingOrdersCount}`, desc: 'Commandes actives à livrer', icon: Coffee, color: 'text-[#fe6e00] bg-[#fe6e00]/10 border-[#fe6e00]/20', tab: 'brunch' },
    { label: 'Chambres sales', value: `${dirtyRooms}`, desc: 'À nettoyer d\'urgence', icon: Sparkles, color: 'text-amber-600 bg-amber-50 border-amber-100', tab: 'housekeeping' }
  ];

  return (
    <div id="dashboard-screen" className="space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 select-none flex items-center pr-8 pointer-events-none">
          <span className="text-9xl">🥐</span>
        </div>
        <div className="space-y-2 relative">
          <span className="bg-[#fe6e00] text-white text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full">
            Evreghen Command Center
          </span>
          <h1 className="text-2xl md:text-3xl font-outfit font-bold tracking-tight">Bonjour, Gérant !</h1>
          <p className="text-sm text-gray-300 max-w-xl font-outfit">
            Bienvenue sur le PMS principal de l'établissement **Brunch Bouaké**. Contrôlez l'activité en temps réel avec le système de secours double persistance.
          </p>
        </div>
      </div>

      {/* Stats Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <button
              key={idx}
              onClick={() => setActiveTab(stat.tab)}
              className="text-left bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all space-y-4 hover:border-[#fe6e00]/40 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{stat.label}</span>
                <div className={`p-2 rounded-xl border ${stat.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-xl font-bold font-mono text-gray-900 leading-tight">{stat.value}</p>
                <p className="text-[10px] text-gray-500 mt-1">{stat.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Double grid content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Arrivals & In House (Col 2) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Active Bookings (In house) */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-[#fcfaf7]">
              <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-500" />
                Clients résidents actuels ({activeBookingsCount})
              </h2>
              <button onClick={() => setActiveTab('reservations')} className="text-xs text-[#fe6e00] font-semibold hover:underline">Voir les séjours</button>
            </div>
            <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
              {reservations.filter(r => r.status === 'En Cours').length === 0 ? (
                <p className="p-6 text-center text-xs text-gray-400 italic">Aucun client actuellement en séjour</p>
              ) : (
                reservations.filter(r => r.status === 'En Cours').map((res) => (
                  <div key={res.id} className="p-4 flex items-center justify-between text-xs hover:bg-gray-50/50 transition-all">
                    <div className="space-y-1">
                      <p className="font-semibold text-gray-900">{res.guestName}</p>
                      <p className="text-gray-500 text-[10px] font-mono">Dossier: {res.id} | Sortie prévue : {res.checkOut}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-mono font-bold bg-blue-50 text-blue-700 border border-blue-100 px-2 py-1 rounded-lg">
                        CH {res.roomNumber}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Pending Arrivals today */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-[#fcfaf7]">
              <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-amber-500" />
                Arrivées attendues aujourd'hui ({reservations.filter(r => r.status === 'Confirmé').length})
              </h2>
              <button onClick={() => setActiveTab('reservations')} className="text-xs text-[#fe6e00] font-semibold hover:underline">Cahier de réservations</button>
            </div>
            <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
              {reservations.filter(r => r.status === 'Confirmé').length === 0 ? (
                <p className="p-6 text-center text-xs text-gray-400 italic">Aucune arrivée programmée aujourd'hui</p>
              ) : (
                reservations.filter(r => r.status === 'Confirmé').map((res) => (
                  <div key={res.id} className="p-4 flex items-center justify-between text-xs hover:bg-gray-50/50 transition-all">
                    <div className="space-y-1">
                      <p className="font-semibold text-gray-900">{res.guestName}</p>
                      <p className="text-gray-500 text-[10px]">Durée du séjour : du {res.checkIn} au {res.checkOut}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-semibold bg-gray-50 text-gray-600 px-2 py-1 rounded-lg">
                        CH {res.roomNumber}
                      </span>
                      <button
                        onClick={() => setActiveTab('reservations')}
                        className="bg-[#fe6e00] hover:bg-[#ff6b00] text-white px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all active:scale-95"
                      >
                        Check-In
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Real-time signals & Diagnostics (Col 1) */}
        <div className="space-y-6">
          {/* Active Maintenance */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-semibold text-gray-800 border-b pb-2 flex items-center gap-1.5">
              <Wrench className="w-4 h-4 text-red-500" />
              Incidents techniques ({activeMaintenanceCount})
            </h2>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {maintenanceTickets.filter(t => t.status !== 'Résolu').length === 0 ? (
                <p className="text-center text-xs text-gray-400 py-4">Aucun incident de maintenance actif</p>
              ) : (
                maintenanceTickets.filter(t => t.status !== 'Résolu').map((t) => (
                  <div key={t.id} className="p-3 bg-red-50/50 border border-red-100 rounded-xl space-y-1.5 text-xs">
                    <div className="flex justify-between items-start">
                      <span className="font-mono text-[10px] font-bold text-red-600">{t.id} - CH {t.roomNumber}</span>
                      <span className="text-[9px] bg-red-100 text-red-800 px-1.5 rounded uppercase font-semibold">{t.priority}</span>
                    </div>
                    <p className="text-gray-700 leading-snug">{t.issue}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-3">
            <h2 className="text-sm font-semibold text-gray-800 border-b pb-2">Actions rapides PMS</h2>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => setActiveTab('reservations')}
                className="p-3 bg-[#fcfaf7] hover:bg-gray-100 rounded-xl transition-all border border-gray-100 text-left space-y-1"
              >
                <Plus className="w-4 h-4 text-[#fe6e00]" />
                <p className="font-semibold text-gray-900">Nouveau séjour</p>
                <p className="text-[10px] text-gray-400 leading-tight">Enregistrer Walk-In</p>
              </button>
              <button
                onClick={() => setActiveTab('brunch')}
                className="p-3 bg-[#fcfaf7] hover:bg-gray-100 rounded-xl transition-all border border-gray-100 text-left space-y-1"
              >
                <Coffee className="w-4 h-4 text-[#fe6e00]" />
                <p className="font-semibold text-gray-900">Commander Brunch</p>
                <p className="text-[10px] text-gray-400 leading-tight">Service cuisine direct</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
