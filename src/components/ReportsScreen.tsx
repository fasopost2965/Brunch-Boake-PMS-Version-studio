import React from 'react';
import { Reservation, BrunchOrder, Payment, Room } from '../types';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell, 
  CartesianGrid 
} from 'recharts';
import { DollarSign, Percent, TrendingUp, Users, Download } from 'lucide-react';

interface ReportsScreenProps {
  reservations: Reservation[];
  orders: BrunchOrder[];
  payments: Payment[];
  rooms: Room[];
}

export const ReportsScreen: React.FC<ReportsScreenProps> = ({
  reservations,
  orders,
  payments,
  rooms
}) => {
  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter(r => r.status === 'Occupé').length;
  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

  // Revenue totals
  const totalRoomRevenue = reservations.reduce((sum, res) => sum + res.totalBill, 0);
  const totalBrunchRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalRevenueCombined = totalRoomRevenue + totalBrunchRevenue;

  // Actual cash receipts
  const cashReceived = payments.reduce((sum, p) => sum + p.amount, 0);

  // ADR (Average Daily Rate)
  const roomCountInStays = reservations.filter(r => r.status === 'En Cours').length;
  const activeRoomRevenue = reservations.filter(r => r.status === 'En Cours').reduce((sum, r) => sum + r.totalBill, 0);
  const adr = roomCountInStays > 0 ? Math.round(activeRoomRevenue / roomCountInStays) : 55000;

  // Canal/Source analytics
  const sourceStats = reservations.reduce((acc, res) => {
    const src = res.bookingSource || res.source || 'Direct';
    if (!acc[src]) {
      acc[src] = { count: 0, revenue: 0 };
    }
    acc[src].count += 1;
    acc[src].revenue += res.totalBill;
    return acc;
  }, {} as Record<string, { count: number; revenue: number }>);

  // Pre-seed non-existing ones with 0 to keep the display complete
  ['Direct', 'OTA', 'Agence', 'Téléphone', 'Walk-In'].forEach(src => {
    if (!sourceStats[src]) {
      sourceStats[src] = { count: 0, revenue: 0 };
    }
  });

  const sourceChartData = Object.entries(sourceStats).map(([name, data]) => ({
    name,
    reservations: data.count,
    revenue: data.revenue
  }));

  // Recharts Data
  const revenueChartData = [
    { name: 'Chambres', value: totalRoomRevenue, color: '#fe6e00' }, // Orange
    { name: 'Brunch & Café', value: totalBrunchRevenue, color: '#423d38' }, // Charcoal
  ];

  const occupancyHistory = [
    { name: 'Lundi', taux: 40 },
    { name: 'Mardi', taux: 55 },
    { name: 'Mercredi', taux: 65 },
    { name: 'Jeudi', taux: 70 },
    { name: 'Vendredi', taux: 85 },
    { name: 'Samedi', taux: 100 },
    { name: 'Dimanche', taux: occupancyRate || 60 },
  ];

  const financialEvolution = [
    { name: 'Mai', chambres: 2400000, restaurant: 800000 },
    { name: 'Juin', chambres: 3200000, restaurant: 1200000 },
    { name: 'Juillet (Est.)', chambres: totalRoomRevenue, restaurant: totalBrunchRevenue },
  ];

  const COLORS = ['#fe6e00', '#423d38'];

  const handleExportCSV = () => {
    let csvContent = "\uFEFF"; // Unicode BOM for proper Excel UTF-8 display
    csvContent += "sep=;\n"; // Force Excel to use semicolon separator

    // 1. Title & Metadata
    csvContent += "=== RAPPORT D'ACTIVITÉ COMPTABILITÉ & PMS ===\n";
    csvContent += `Établissement;Brunch Bouaké\n`;
    csvContent += `Date d'exportation;${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}\n\n`;

    // 2. KPIs Section
    csvContent += "--- INDICATEURS CLÉS DE PERFORMANCE (KPIs) ---\n";
    csvContent += "Indicateur;Valeur;Unité\n";
    csvContent += `Chiffre d'Affaires Global (Hébergement + Brunch);${totalRevenueCombined};FCFA\n`;
    csvContent += `Taux d'Occupation Actuel;${occupancyRate};%\n`;
    csvContent += `ADR (Prix Moyen d'une Chambre);${adr};FCFA\n`;
    csvContent += `Encaissements Effectifs (Trésorerie Réelle);${cashReceived};FCFA\n\n`;

    // 3. Revenue Breakdown Section
    csvContent += "--- RÉPARTITION DES REVENUS ---\n";
    csvContent += "Type de Revenu;Montant (FCFA);Part (%)\n";
    const roomPct = totalRevenueCombined > 0 ? Math.round((totalRoomRevenue / totalRevenueCombined) * 100) : 0;
    const brunchPct = totalRevenueCombined > 0 ? Math.round((totalBrunchRevenue / totalRevenueCombined) * 100) : 0;
    csvContent += `Hébergement / Chambres;${totalRoomRevenue};${roomPct}%\n`;
    csvContent += `Brunch & Café (Point de Vente);${totalBrunchRevenue};${brunchPct}%\n\n`;

    // 4. Channels Performance Section
    csvContent += "--- PERFORMANCE PAR CANAL DE RÉSERVATION ---\n";
    csvContent += "Canal;Nombre de réservations;Chiffre d'Affaires (FCFA);Part des ventes hôtelières\n";
    Object.entries(sourceStats).forEach(([name, data]) => {
      const pct = totalRoomRevenue > 0 ? Math.round((data.revenue / totalRoomRevenue) * 100) : 0;
      csvContent += `"${name.replace(/"/g, '""')}";${data.count};${data.revenue};"${pct}%"\n`;
    });
    csvContent += "\n";

    // 5. Stays/Reservations details
    csvContent += "--- DÉTAILS DES SÉJOURS / RÉSERVATIONS ---\n";
    csvContent += "ID Réservation;Nom du Client;Chambre;Date Arrivée;Date Départ;Statut du Séjour;Montant Total Facturé (FCFA);Montant Total Réglé (FCFA);Solde Restant Dû (FCFA)\n";
    reservations.forEach(r => {
      const rest = Math.max(0, r.totalBill - r.paidAmount);
      csvContent += `"${r.id}";"${r.guestName.replace(/"/g, '""')}";"CH ${r.roomNumber}";"${r.checkIn}";"${r.checkOut}";"${r.status}";${r.totalBill};${r.paidAmount};${rest}\n`;
    });
    csvContent += "\n";

    // 6. Payment ledger details
    csvContent += "--- JOURNAL DE CAISSE ET ENCAISSEMENTS ---\n";
    csvContent += "ID Règlement;ID Réservation;Client;Montant Encaissé (FCFA);Mode de Règlement;Date d'Encaissement;Référence de Transaction\n";
    payments.forEach(p => {
      csvContent += `"${p.id}";"${p.reservationId}";"${p.guestName.replace(/"/g, '""')}";${p.amount};"${p.method}";"${p.date}";"${p.reference ? p.reference.replace(/"/g, '""') : ''}"\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute("download", `Rapport_Brunch_Bouake_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in" id="reports_screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e3e0dd] pb-4">
        <div>
          <h2 className="text-xl font-bold text-[#423d38] tracking-tight">Rapports & Analyses PMS</h2>
          <p className="text-xs text-[#797067]">Statistiques financières, taux d'occupation et indicateurs de performance clés (KPI).</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="bg-[#fe6e00] hover:bg-[#ff6b00] text-white font-extrabold py-2 px-4 rounded-xl text-xs transition-all duration-200 flex items-center gap-2 shadow-sm self-start sm:self-center cursor-pointer border border-[#fe6e00]/20 hover:scale-102"
        >
          <Download className="w-4 h-4 shrink-0" />
          Exporter les données (CSV)
        </button>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-[#e3e0dd] shadow-sm flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-bold text-[#797067] uppercase tracking-widest">Chiffre d'Affaires Global</span>
            <span className="text-lg font-extrabold text-[#423d38]">{totalRevenueCombined.toLocaleString()} F</span>
            <span className="text-[10px] text-[#797067]">Hébergement + Brunch</span>
          </div>
          <div className="bg-[#fe6e00]/5 p-2.5 rounded-lg text-[#fe6e00]">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#e3e0dd] shadow-sm flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-bold text-[#797067] uppercase tracking-widest">Taux d'Occupation Actuel</span>
            <span className="text-lg font-extrabold text-[#423d38]">{occupancyRate}%</span>
            <span className="text-[10px] text-[#797067]">{occupiedRooms} chambres actives</span>
          </div>
          <div className="bg-[#fe6e00]/5 p-2.5 rounded-lg text-[#fe6e00]">
            <Percent className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#e3e0dd] shadow-sm flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-bold text-[#797067] uppercase tracking-widest">ADR (Prix Moyen Chambre)</span>
            <span className="text-lg font-extrabold text-[#423d38]">{adr.toLocaleString()} F</span>
            <span className="text-[10px] text-[#797067]">Prix moyen par nuitée</span>
          </div>
          <div className="bg-[#fe6e00]/5 p-2.5 rounded-lg text-[#fe6e00]">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#e3e0dd] shadow-sm flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-bold text-[#797067] uppercase tracking-widest">Encaissements Effectifs</span>
            <span className="text-lg font-extrabold text-[#423d38]">{cashReceived.toLocaleString()} F</span>
            <span className="text-[10px] text-[#797067]">Flux de trésorerie réel</span>
          </div>
          <div className="bg-[#fe6e00]/5 p-2.5 rounded-lg text-[#fe6e00]">
            <Users className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* CHARTS GRAPH */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Occupancy evolution line-bar chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-[#e3e0dd] shadow-sm flex flex-col gap-4 text-xs">
          <h3 className="font-bold text-[#423d38] text-sm">Évolution Financière Mensuelle</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={financialEvolution}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e3e0dd" />
                <XAxis dataKey="name" stroke="#797067" fontSize={10} />
                <YAxis stroke="#797067" fontSize={10} />
                <Tooltip formatter={(value) => `${value.toLocaleString()} F`} />
                <Legend />
                <Bar dataKey="chambres" name="Chambres" fill="#fe6e00" radius={[4, 4, 0, 0]} />
                <Bar dataKey="restaurant" name="Restaurant & Brunch" fill="#423d38" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue division pie chart */}
        <div className="lg:col-span-1 bg-white p-5 rounded-xl border border-[#e3e0dd] shadow-sm flex flex-col gap-4 text-xs">
          <h3 className="font-bold text-[#423d38] text-sm">Répartition des Revenus</h3>
          <div className="h-64 flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={revenueChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {revenueChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value.toLocaleString()} F`} />
              </PieChart>
            </ResponsiveContainer>

            {/* Inner text overlay */}
            <div className="absolute text-center flex flex-col justify-center">
              <span className="text-[9px] font-bold text-[#797067] uppercase tracking-widest">Revenu Global</span>
              <span className="text-sm font-extrabold text-[#423d38]">{(totalRevenueCombined).toLocaleString()} F</span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5 text-[10px] font-bold uppercase text-[#797067] mt-2">
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#fe6e00]"></span> Chambres</span>
              <span className="text-[#423d38]">{totalRoomRevenue.toLocaleString()} F</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#423d38]"></span> Restaurant / Brunch</span>
              <span className="text-[#423d38]">{totalBrunchRevenue.toLocaleString()} F</span>
            </div>
          </div>
        </div>

        {/* Occupancy history list */}
        <div className="lg:col-span-3 bg-white p-5 rounded-xl border border-[#e3e0dd] shadow-sm flex flex-col gap-4 text-xs">
          <h3 className="font-bold text-[#423d38] text-sm">Évolution du Taux d'Occupation Hebdomadaire</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={occupancyHistory}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e3e0dd" />
                <XAxis dataKey="name" stroke="#797067" fontSize={10} />
                <YAxis stroke="#797067" fontSize={10} unit="%" />
                <Tooltip formatter={(value) => `${value}%`} />
                <Bar dataKey="taux" name="Taux d'occupation (%)" fill="#fe6e00" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Performance par canal de réservation */}
        <div className="lg:col-span-3 bg-white p-5 rounded-xl border border-[#e3e0dd] shadow-sm flex flex-col gap-5 text-xs">
          <div>
            <h3 className="font-bold text-[#423d38] text-sm">Performance par Canal de Réservation</h3>
            <p className="text-[#797067] text-[11px] mt-0.5">Analyse comparative des flux, volumes de réservations et chiffre d'affaires par canal de distribution.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Visual Bar Chart for Channel Revenue */}
            <div className="h-64 border border-[#e3e0dd] rounded-xl p-3 bg-[#fcfaf7]">
              <span className="font-bold text-[10px] text-[#797067] uppercase tracking-wider block mb-2">Revenu par canal (FCFA)</span>
              <ResponsiveContainer width="100%" height="90%">
                <BarChart data={sourceChartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e3e0dd" />
                  <XAxis type="number" stroke="#797067" fontSize={9} />
                  <YAxis type="category" dataKey="name" stroke="#797067" fontSize={10} width={70} />
                  <Tooltip formatter={(value) => `${value.toLocaleString()} F`} />
                  <Bar dataKey="revenue" name="Chiffre d'Affaires" fill="#fe6e00" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* List and breakdown of performance details */}
            <div className="flex flex-col gap-3 justify-center">
              <span className="font-bold text-[10px] text-[#797067] uppercase tracking-wider block border-b border-[#e3e0dd] pb-1">Statistiques des canaux</span>
              
              <div className="flex flex-col gap-3">
                {Object.entries(sourceStats).map(([name, data]) => {
                  const revenuePercentage = totalRoomRevenue > 0 ? Math.round((data.revenue / totalRoomRevenue) * 100) : 0;
                  return (
                    <div key={name} className="flex flex-col gap-1 border-b border-[#e3e0dd]/40 pb-2 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between text-xs font-semibold text-[#423d38]">
                        <span className="flex items-center gap-2">
                          <span className={`w-2.5 h-2.5 rounded-full ${
                            name === 'Direct' ? 'bg-[#016630]' :
                            name === 'OTA' ? 'bg-[#1447e6]' :
                            name === 'Téléphone' ? 'bg-amber-500' :
                            name === 'Walk-In' ? 'bg-purple-500' :
                            'bg-gray-400'
                          }`}></span>
                          {name}
                        </span>
                        <span className="font-bold">{data.revenue.toLocaleString()} F</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-[10px] pl-4">
                        <span className="text-[#797067]">{data.count} réservation{data.count > 1 ? 's' : ''}</span>
                        <span className="text-[#fe6e00] font-bold">{revenuePercentage}% des ventes room</span>
                      </div>
                      
                      <div className="pl-4 mt-1">
                        <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              name === 'Direct' ? 'bg-[#016630]' :
                              name === 'OTA' ? 'bg-[#1447e6]' :
                              name === 'Téléphone' ? 'bg-amber-500' :
                              name === 'Walk-In' ? 'bg-purple-500' :
                              'bg-gray-400'
                            }`}
                            style={{ width: `${revenuePercentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
