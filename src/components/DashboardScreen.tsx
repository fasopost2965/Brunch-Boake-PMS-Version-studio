import React from 'react';
import { Room, Reservation, MaintenanceTicket, Guest, Payment } from '../types';
import { TrendingUp, Percent, ClipboardList, Wrench, Users, Sparkles, Plus, CreditCard, ChevronRight } from 'lucide-react';

interface DashboardScreenProps {
  rooms: Room[];
  reservations: Reservation[];
  maintenance: MaintenanceTicket[];
  guests: Guest[];
  payments: Payment[];
  setActiveTab: (tab: any) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  rooms,
  reservations,
  maintenance,
  guests,
  payments,
  setActiveTab
}) => {
  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter(r => r.status === 'Occupé').length;
  const dirtyRooms = rooms.filter(r => r.status === 'Sale').length;
  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

  // Today's arrivals (check-in is today: 2026-07-11 and reservation is Confirmed)
  const todayStr = '2026-07-11';
  const todayArrivals = reservations.filter(res => res.checkIn === todayStr && res.status === 'Confirmé');
  const activeStaysCount = reservations.filter(res => res.status === 'En Cours').length;

  // Financial summary
  const totalReceived = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalPendingBill = reservations.reduce((sum, res) => {
    if (res.status === 'En Cours' || res.status === 'Confirmé') {
      return sum + (res.totalBill - res.paidAmount);
    }
    return sum;
  }, 0);

  // Unresolved maintenance
  const openMaintenance = maintenance.filter(m => m.status !== 'Résolu').length;

  return (
    <div className="flex flex-col gap-6 animate-fade-in" id="dashboard_screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#423d38] tracking-tight" id="dashboard_title">Tableau de Bord Général</h2>
          <p className="text-xs text-[#797067]">Aperçu en temps réel de Brunch Bouaké • Aujourd'hui : 11 Juillet 2026</p>
        </div>
        <div className="flex gap-2">
          <button 
            id="quick_add_res_btn"
            onClick={() => setActiveTab('reservations')}
            className="bg-[#fe6e00] hover:bg-[#ff6b00] text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Nouvelle Réservation
          </button>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="kpi_grid">
        {/* Occupancy Card */}
        <div 
          onClick={() => setActiveTab('rooms')}
          className="bg-white/80 backdrop-blur-md p-5 rounded-xl border border-[#e3e0dd]/80 shadow-sm flex items-center justify-between hover:shadow-md hover:scale-[1.01] transition-all cursor-pointer"
          id="kpi_occupancy"
        >
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-[#797067] uppercase tracking-widest">Taux d'Occupation</span>
            <span className="text-2xl font-extrabold text-[#423d38]">{occupancyRate}%</span>
            <span className="text-[11px] text-[#797067]">{occupiedRooms} / {totalRooms} Chambres occupées</span>
          </div>
          <div className="bg-[#fe6e00]/10 p-3 rounded-xl text-[#fe6e00]">
            <Percent className="w-5 h-5" />
          </div>
        </div>

        {/* Today's Arrivals Card */}
        <div 
          onClick={() => setActiveTab('arrivals')}
          className="bg-white/80 backdrop-blur-md p-5 rounded-xl border border-[#e3e0dd]/80 shadow-sm flex items-center justify-between hover:shadow-md hover:scale-[1.01] transition-all cursor-pointer"
          id="kpi_arrivals"
        >
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-[#797067] uppercase tracking-widest">Arrivées du Jour</span>
            <span className="text-2xl font-extrabold text-[#423d38]">{todayArrivals.length}</span>
            <span className="text-[11px] text-[#797067]">{activeStaysCount} Séjours en cours</span>
          </div>
          <div className="bg-[#3080ff]/10 p-3 rounded-xl text-[#3080ff]">
            <ClipboardList className="w-5 h-5" />
          </div>
        </div>

        {/* Revenues Card */}
        <div 
          onClick={() => setActiveTab('payments')}
          className="bg-white/80 backdrop-blur-md p-5 rounded-xl border border-[#e3e0dd]/80 shadow-sm flex items-center justify-between hover:shadow-md hover:scale-[1.01] transition-all cursor-pointer"
          id="kpi_revenues"
        >
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-[#797067] uppercase tracking-widest">Revenus Encaissés</span>
            <span className="text-2xl font-extrabold text-[#423d38]">{totalReceived.toLocaleString()} F</span>
            <span className="text-[11px] text-[#797067]">Encours factures : {totalPendingBill.toLocaleString()} F</span>
          </div>
          <div className="bg-[#00c758]/10 p-3 rounded-xl text-[#00c758]">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Housekeeping/Maintenance Card */}
        <div 
          onClick={() => setActiveTab('maintenance')}
          className="bg-white/80 backdrop-blur-md p-5 rounded-xl border border-[#e3e0dd]/80 shadow-sm flex items-center justify-between hover:shadow-md hover:scale-[1.01] transition-all cursor-pointer"
          id="kpi_housekeeping"
        >
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-[#797067] uppercase tracking-widest">Ménage & Maintenance</span>
            <span className="text-2xl font-extrabold text-[#423d38]">{dirtyRooms + openMaintenance}</span>
            <span className="text-[11px] text-[#797067]">{dirtyRooms} Sales • {openMaintenance} Tickets</span>
          </div>
          <div className="bg-[#fb2c36]/10 p-3 rounded-xl text-[#fb2c36]">
            <Wrench className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* QUICK OPERATIONS DASHBOARD ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="dashboard_sections">
        {/* Left Column: Quick Actions & Today's arrivals list */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white/80 backdrop-blur-md p-5 rounded-xl border border-[#e3e0dd]/80 shadow-sm flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-[#423d38] text-sm">Arrivées attendues aujourd'hui</h3>
              <button 
                onClick={() => setActiveTab('arrivals')}
                className="text-[#fe6e00] hover:text-[#ff6b00] text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                Tout voir <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {todayArrivals.length === 0 ? (
              <div className="text-center py-6 bg-[#f3f4f6]/50 rounded-xl border border-dashed border-[#e3e0dd]/60">
                <span className="text-[#797067] text-xs">Aucune arrivée enregistrée pour aujourd'hui.</span>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {todayArrivals.map(arr => (
                  <div key={arr.id} className="flex justify-between items-center p-3 bg-[#f3f4f6]/50 rounded-xl hover:bg-[#f3f4f6]/80 hover:scale-[1.005] transition-all border border-[#e3e0dd]/80">
                    <div className="flex flex-col">
                      <span className="font-bold text-[#423d38] text-xs">{arr.guestName}</span>
                      <span className="text-[10px] text-[#797067]">{arr.guestEmail} • Chambre {arr.roomNumber}</span>
                    </div>
                    <button
                      onClick={() => setActiveTab('checkin')}
                      className="bg-[#fe6e00] hover:bg-[#ff6b00] text-white text-[10px] font-bold px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                    >
                      Check-In
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions Panel */}
          <div className="bg-white/80 backdrop-blur-md p-5 rounded-xl border border-[#e3e0dd]/80 shadow-sm flex flex-col gap-4">
            <h3 className="font-bold text-[#423d38] text-sm">Raccourcis Opérations PMS</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => setActiveTab('checkin')}
                className="bg-white/40 hover:bg-[#fe6e00]/5 hover:text-[#fe6e00] p-4 rounded-xl border border-[#e3e0dd]/80 hover:border-[#fe6e00]/30 transition-all flex flex-col gap-2 group cursor-pointer text-left shadow-sm hover:shadow"
              >
                <span className="bg-[#fe6e00]/10 text-[#fe6e00] p-2 rounded-xl w-fit group-hover:bg-[#fe6e00]/20 transition-colors">
                  <Plus className="w-4 h-4" />
                </span>
                <span className="font-bold text-[#423d38] text-xs block group-hover:text-[#fe6e00]">Arrivée Walk-In</span>
                <span className="text-[10px] text-[#797067]">Enregistrer un client direct sans réservation préalable.</span>
              </button>

              <button
                onClick={() => setActiveTab('billing')}
                className="bg-white/40 hover:bg-[#fe6e00]/5 hover:text-[#fe6e00] p-4 rounded-xl border border-[#e3e0dd]/80 hover:border-[#fe6e00]/30 transition-all flex flex-col gap-2 group cursor-pointer text-left shadow-sm hover:shadow"
              >
                <span className="bg-[#fe6e00]/10 text-[#fe6e00] p-2 rounded-xl w-fit group-hover:bg-[#fe6e00]/20 transition-colors">
                  <CreditCard className="w-4 h-4" />
                </span>
                <span className="font-bold text-[#423d38] text-xs block group-hover:text-[#fe6e00]">Facturer Extra / Brunch</span>
                <span className="text-[10px] text-[#797067]">Enregistrer une commande de brunch ou boisson sur un folio.</span>
              </button>

              <button
                onClick={() => setActiveTab('housekeeping')}
                className="bg-white/40 hover:bg-[#fe6e00]/5 hover:text-[#fe6e00] p-4 rounded-xl border border-[#e3e0dd]/80 hover:border-[#fe6e00]/30 transition-all flex flex-col gap-2 group cursor-pointer text-left shadow-sm hover:shadow"
              >
                <span className="bg-[#fe6e00]/10 text-[#fe6e00] p-2 rounded-xl w-fit group-hover:bg-[#fe6e00]/20 transition-colors">
                  <Sparkles className="w-4 h-4" />
                </span>
                <span className="font-bold text-[#423d38] text-xs block group-hover:text-[#fe6e00]">Gouvernance & Ménage</span>
                <span className="text-[10px] text-[#797067]">Consulter l'état des chambres et affecter les équipes de ménage.</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Key performance and list of rooms status */}
        <div className="flex flex-col gap-6">
          <div className="bg-white/80 backdrop-blur-md p-5 rounded-xl border border-[#e3e0dd]/80 shadow-sm flex flex-col gap-4">
            <h3 className="font-bold text-[#423d38] text-sm">Chambres par Statut</h3>
            <div className="flex flex-col gap-2.5 text-xs text-[#423d38]">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-[#00c758]"></span> Propre (Libre)
                </span>
                <span className="font-bold text-[#423d38]">{rooms.filter(r => r.status === 'Libre').length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-[#fb2c36]"></span> Occupée
                </span>
                <span className="font-bold text-[#423d38]">{rooms.filter(r => r.status === 'Occupé').length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-[#fe6e00]"></span> Sale / À nettoyer
                </span>
                <span className="font-bold text-[#423d38]">{rooms.filter(r => r.status === 'Sale').length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-[#8200da]"></span> En Maintenance
                </span>
                <span className="font-bold text-[#423d38]">{rooms.filter(r => r.status === 'Maintenance').length}</span>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('rooms')}
              className="w-full bg-[#423d38] hover:bg-[#423d38]/90 text-white font-bold py-2 rounded-xl text-xs transition-colors cursor-pointer text-center"
            >
              Voir le plan de l'hôtel
            </button>
          </div>

          <div className="bg-white/80 backdrop-blur-md p-5 rounded-xl border border-[#e3e0dd]/80 shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-2.5">
              <Users className="w-5 h-5 text-[#fe6e00]" />
              <h3 className="font-bold text-[#423d38] text-sm">Registre Clients</h3>
            </div>
            <p className="text-xs text-[#797067] leading-relaxed">
              Il y a actuellement <strong>{guests.length} clients uniques</strong> enregistrés dans le PMS, dont {guests.filter(g => g.status === 'VIP').length} VIP.
            </p>
            <button
              onClick={() => setActiveTab('guests')}
              className="w-full bg-[#edebe9] hover:bg-[#edebe9]/80 text-[#423d38] font-bold py-2 rounded-xl text-xs transition-colors cursor-pointer text-center"
            >
              Gérer la base clients
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
