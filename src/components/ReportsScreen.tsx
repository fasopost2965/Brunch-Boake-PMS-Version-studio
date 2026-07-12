import React, { useState } from 'react';
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
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';
import { 
  DollarSign, 
  Percent, 
  TrendingUp, 
  Users, 
  Download, 
  Calendar, 
  ArrowRight, 
  CreditCard 
} from 'lucide-react';

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
  // Date range state default to July 2026 (encompassing major mock data)
  const [startDate, setStartDate] = useState<string>('2026-07-01');
  const [endDate, setEndDate] = useState<string>('2026-07-31');

  // Overall statistics (unfiltered for static reference)
  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter(r => r.status === 'Occupé').length;
  const occupancyRate = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

  // Filter datasets by selected period
  const filteredReservations = reservations.filter(res => {
    if (!res.checkIn) return false;
    const d = res.checkIn.substring(0, 10);
    if (startDate && d < startDate) return false;
    if (endDate && d > endDate) return false;
    return true;
  });

  const filteredOrders = orders.filter(o => {
    if (!o.timestamp) return false;
    const d = o.timestamp.substring(0, 10);
    if (startDate && d < startDate) return false;
    if (endDate && d > endDate) return false;
    return true;
  });

  const filteredPayments = payments.filter(p => {
    if (!p.date) return false;
    const d = p.date.substring(0, 10);
    if (startDate && d < startDate) return false;
    if (endDate && d > endDate) return false;
    return true;
  });

  // Calculate stats for the selected period
  const totalRoomRevenue = filteredReservations.reduce((sum, res) => sum + res.totalBill, 0);
  const totalBrunchRevenue = filteredOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalRevenueCombined = totalRoomRevenue + totalBrunchRevenue;

  // Actual cash receipts for the selected period
  const cashReceived = filteredPayments.reduce((sum, p) => sum + p.amount, 0);

  // ADR (Average Daily Rate) for the selected period
  const roomCountInStays = filteredReservations.filter(r => r.status === 'En Cours').length;
  const activeRoomRevenue = filteredReservations.filter(r => r.status === 'En Cours').reduce((sum, r) => sum + r.totalBill, 0);
  const adr = roomCountInStays > 0 ? Math.round(activeRoomRevenue / roomCountInStays) : (filteredReservations.length > 0 ? Math.round(totalRoomRevenue / filteredReservations.length) : 35000);

  // Panier Moyen (Average basket per reservation) for the selected period
  const averageBasket = filteredReservations.length > 0 ? Math.round(totalRoomRevenue / filteredReservations.length) : 0;

  // Canal/Source analytics on filtered data
  const sourceStats = filteredReservations.reduce((acc, res) => {
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

  // Recharts Revenue types distribution data
  const revenueChartData = [
    { name: 'Chambres', value: totalRoomRevenue || 1, color: '#fe6e00' }, 
    { name: 'Brunch & Café', value: totalBrunchRevenue || 0, color: '#423d38' }, 
  ];

  // Daily revenue grouping for area chart
  const dailyRevenuesMap: Record<string, { chambres: number; brunch: number; total: number }> = {};
  
  // Seed the range if both dates are chosen to show continuous data
  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const temp = new Date(start);
    let limit = 0;
    while (temp <= end && limit < 31) { // cap at 31 days to avoid over-crowded axes
      const dStr = temp.toISOString().split('T')[0];
      dailyRevenuesMap[dStr] = { chambres: 0, brunch: 0, total: 0 };
      temp.setDate(temp.getDate() + 1);
      limit++;
    }
  }

  // Populate actual data
  filteredReservations.forEach(r => {
    const d = r.checkIn.substring(0, 10);
    if (dailyRevenuesMap[d] !== undefined || !startDate || !endDate) {
      if (!dailyRevenuesMap[d]) dailyRevenuesMap[d] = { chambres: 0, brunch: 0, total: 0 };
      dailyRevenuesMap[d].chambres += r.totalBill;
      dailyRevenuesMap[d].total += r.totalBill;
    }
  });

  filteredOrders.forEach(o => {
    const d = o.timestamp.substring(0, 10);
    if (dailyRevenuesMap[d] !== undefined || !startDate || !endDate) {
      if (!dailyRevenuesMap[d]) dailyRevenuesMap[d] = { chambres: 0, brunch: 0, total: 0 };
      dailyRevenuesMap[d].brunch += o.totalAmount;
      dailyRevenuesMap[d].total += o.totalAmount;
    }
  });

  const dailyChartData = Object.entries(dailyRevenuesMap)
    .map(([date, data]) => ({
      date: new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
      rawDate: date,
      Chambres: data.chambres,
      Brunch: data.brunch,
      Total: data.total
    }))
    .sort((a, b) => a.rawDate.localeCompare(b.rawDate));

  // Payment methods breakdown for pie chart
  const paymentMethodStats = filteredPayments.reduce((acc, p) => {
    const method = p.method || 'Autre';
    if (!acc[method]) {
      acc[method] = 0;
    }
    acc[method] += p.amount;
    return acc;
  }, {} as Record<string, number>);

  const paymentMethodChartData = Object.entries(paymentMethodStats).map(([name, value]) => ({
    name,
    value
  }));

  const getPaymentMethodColor = (method: string) => {
    switch (method) {
      case 'Espèces': return '#016630';
      case 'Orange Money': return '#fe6e00';
      case 'MTN Momo': return '#f3ba2f';
      case 'Moov Money': return '#00a5e3';
      case 'Carte Bancaire': return '#423d38';
      case 'Virement': return '#8200da';
      default: return '#797067';
    }
  };

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
    let csvContent = "\uFEFF"; 
    csvContent += "sep=;\n"; 

    // 1. Title & Metadata
    csvContent += "=== RAPPORT D'ACTIVITÉ COMPTABILITÉ & PMS ===\n";
    csvContent += `Établissement;Brunch Bouaké\n`;
    csvContent += `Période sélectionnée;Du ${startDate || 'Début'} au ${endDate || 'Fin'}\n`;
    csvContent += `Date d'exportation;${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}\n\n`;

    // 2. KPIs Section
    csvContent += "--- INDICATEURS CLÉS DE PERFORMANCE (KPIs) ---\n";
    csvContent += "Indicateur;Valeur;Unité\n";
    csvContent += `Chiffre d'Affaires Global (Hébergement + Brunch);${totalRevenueCombined};FCFA\n`;
    csvContent += `Nombre de Réservations;${filteredReservations.length};Unités\n`;
    csvContent += `Panier Moyen par Séjour;${averageBasket};FCFA\n`;
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
    filteredReservations.forEach(r => {
      const rest = Math.max(0, r.totalBill - r.paidAmount);
      csvContent += `"${r.id}";"${r.guestName.replace(/"/g, '""')}";"CH ${r.roomNumber}";"${r.checkIn}";"${r.checkOut}";"${r.status}";${r.totalBill};${r.paidAmount};${rest}\n`;
    });
    csvContent += "\n";

    // 6. Payment ledger details
    csvContent += "--- JOURNAL DE CAISSE ET ENCAISSEMENTS ---\n";
    csvContent += "ID Règlement;ID Réservation;Client;Montant Encaissé (FCFA);Mode de Règlement;Date d'Encaissement;Référence de Transaction\n";
    filteredPayments.forEach(p => {
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
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e3e0dd] pb-4">
        <div>
          <h2 className="text-xl font-bold text-[#423d38] tracking-tight">Rapports & Analyses PMS</h2>
          <p className="text-xs text-[#797067]">Statistiques financières, taux d'occupation et indicateurs de performance clés (KPI).</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="bg-[#fe6e00] hover:bg-[#ff6b00] text-white font-extrabold py-2 px-4 rounded-xl text-xs transition-all duration-200 flex items-center gap-2 shadow-sm self-start sm:self-center cursor-pointer border border-[#fe6e00]/20 hover:scale-102 shrink-0"
        >
          <Download className="w-4 h-4 shrink-0" />
          Exporter la sélection (CSV)
        </button>
      </div>

      {/* DATE RANGE FILTER PANEL */}
      <div className="bg-white p-4 rounded-xl border border-[#e3e0dd] shadow-sm flex flex-col md:flex-row md:items-end justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="font-bold text-[#797067] uppercase tracking-widest text-[9px] flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#fe6e00]" /> Date de début :
            </span>
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-lg p-2 font-semibold text-[#423d38] focus:outline-none focus:border-[#fe6e00] cursor-pointer"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="font-bold text-[#797067] uppercase tracking-widest text-[9px] flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#fe6e00]" /> Date de fin :
            </span>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-lg p-2 font-semibold text-[#423d38] focus:outline-none focus:border-[#fe6e00] cursor-pointer"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-auto pt-2 md:pt-0">
            <button
              onClick={() => {
                setStartDate('2026-07-01');
                setEndDate('2026-07-31');
              }}
              className="bg-white hover:bg-gray-50 border border-gray-200 text-[#423d38] hover:text-[#fe6e00] px-2.5 py-1.5 rounded-md font-bold text-[10px] transition-colors cursor-pointer"
            >
              Ce mois (Juillet 2026)
            </button>
            <button
              onClick={() => {
                setStartDate('2026-05-01');
                setEndDate('2026-07-31');
              }}
              className="bg-white hover:bg-gray-50 border border-gray-200 text-[#423d38] hover:text-[#fe6e00] px-2.5 py-1.5 rounded-md font-bold text-[10px] transition-colors cursor-pointer"
            >
              Tout (Mai - Juillet)
            </button>
            <button
              onClick={() => {
                setStartDate('');
                setEndDate('');
              }}
              className="bg-red-50 hover:bg-red-100 border border-red-100 text-red-600 px-2.5 py-1.5 rounded-md font-bold text-[10px] transition-colors cursor-pointer"
            >
              Effacer
            </button>
          </div>
        </div>
        <div className="text-[10px] text-[#797067] font-semibold flex items-center gap-1.5 bg-[#fcfaf7] border border-[#e3e0dd] px-3 py-2 rounded-lg self-start md:self-end">
          <span>Période hôtelière :</span>
          <span className="font-extrabold text-[#fe6e00]">
            {startDate ? new Date(startDate).toLocaleDateString('fr-FR') : 'Début historique'}
          </span>
          <ArrowRight className="w-3 h-3 text-[#797067]" />
          <span className="font-extrabold text-[#fe6e00]">
            {endDate ? new Date(endDate).toLocaleDateString('fr-FR') : 'Fin de période'}
          </span>
        </div>
      </div>

      {/* THREE-COLUMN SUMMARY CARD / PERIOD KPI PANEL */}
      <div className="bg-[#fe6e00]/5 rounded-xl border border-[#fe6e00]/25 p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-[#fe6e00]/15 pb-2">
          <span className="font-extrabold text-[10px] text-[#fe6e00] uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 shrink-0" />
            Récapitulatif de la Période Sélectionnée
          </span>
          <span className="text-[9px] font-bold text-[#797067] bg-[#fe6e00]/10 px-2 py-0.5 rounded-sm border border-[#fe6e00]/10">
            {startDate ? new Date(startDate).toLocaleDateString('fr-FR') : 'Origine'} à {endDate ? new Date(endDate).toLocaleDateString('fr-FR') : 'Aujourd\'hui'}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          {/* Total Revenues */}
          <div className="flex flex-col gap-1.5">
            <span className="font-bold text-[#797067] uppercase tracking-widest text-[9px] flex items-center gap-1"><DollarSign className="w-3 h-3 text-[#fe6e00]" /> Total des Revenus</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-[#423d38]">{totalRevenueCombined.toLocaleString()}</span>
              <span className="text-[10px] font-bold text-[#797067]">F CFA</span>
            </div>
            <div className="text-[10px] text-[#797067] flex flex-col gap-0.5">
              <span>Hébergement : <strong className="text-[#423d38]">{totalRoomRevenue.toLocaleString()} F</strong></span>
              <span>Brunch & Resto : <strong className="text-[#423d38]">{totalBrunchRevenue.toLocaleString()} F</strong></span>
            </div>
          </div>

          {/* Number of Reservations */}
          <div className="flex flex-col gap-1.5 border-t md:border-t-0 md:border-l md:border-r border-[#fe6e00]/15 pt-3 md:pt-0 md:px-6">
            <span className="font-bold text-[#797067] uppercase tracking-widest text-[9px] flex items-center gap-1"><Users className="w-3 h-3 text-[#fe6e00]" /> Réservations de la période</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-[#fe6e00]">{filteredReservations.length}</span>
              <span className="text-[10px] font-bold text-[#797067]">séjour{filteredReservations.length > 1 ? 's' : ''}</span>
            </div>
            <div className="text-[10px] text-[#797067] flex flex-col gap-0.5">
              <span>Confirmés : <strong className="text-[#423d38]">{filteredReservations.filter(r => r.status === 'Confirmé').length}</strong></span>
              <span>En cours / Finis : <strong className="text-[#423d38]">{filteredReservations.filter(r => r.status !== 'Confirmé').length}</strong></span>
            </div>
          </div>

          {/* Average Basket (Panier Moyen) */}
          <div className="flex flex-col gap-1.5 border-t md:border-t-0 pt-3 md:pt-0">
            <span className="font-bold text-[#797067] uppercase tracking-widest text-[9px] flex items-center gap-1"><CreditCard className="w-3 h-3 text-[#fe6e00]" /> Panier Moyen Séjour</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-[#423d38]">{averageBasket.toLocaleString()}</span>
              <span className="text-[10px] font-bold text-[#797067]">F CFA</span>
            </div>
            <p className="text-[10px] text-[#797067] leading-relaxed">
              Dépense moyenne des clients sur la partie hébergement uniquement pour chaque séjour sur cette période.
            </p>
          </div>
        </div>
      </div>

      {/* STAT CARDS - OVERALL METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-[#e3e0dd] shadow-sm flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-bold text-[#797067] uppercase tracking-widest">Revenus de la Sélection</span>
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
            <span className="text-[10px] text-[#797067]">{occupiedRooms} chambres occupées</span>
          </div>
          <div className="bg-[#fe6e00]/5 p-2.5 rounded-lg text-[#fe6e00]">
            <Percent className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#e3e0dd] shadow-sm flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-bold text-[#797067] uppercase tracking-widest">ADR Moyen de la Sélection</span>
            <span className="text-lg font-extrabold text-[#423d38]">{adr.toLocaleString()} F</span>
            <span className="text-[10px] text-[#797067]">Tarif journalier moyen</span>
          </div>
          <div className="bg-[#fe6e00]/5 p-2.5 rounded-lg text-[#fe6e00]">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#e3e0dd] shadow-sm flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <span className="text-[9px] font-bold text-[#797067] uppercase tracking-widest">Flux de Caisse Effectif</span>
            <span className="text-lg font-extrabold text-[#423d38]">{cashReceived.toLocaleString()} F</span>
            <span className="text-[10px] text-[#797067]">Paiements encaissés</span>
          </div>
          <div className="bg-[#fe6e00]/5 p-2.5 rounded-lg text-[#fe6e00]">
            <Users className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* NEW INTEGRATED CHARTS: DAILY REVENUES & PAYMENT DISTRIBUTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 1. Daily Revenues (Revenus Quotidiens) - AreaChart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-[#e3e0dd] shadow-sm flex flex-col gap-4 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-[#423d38] text-sm">Évolution Financière Quotidienne</h3>
              <p className="text-[#797067] text-[10px]">Chiffre d'affaires cumulé par jour sur la période sélectionnée.</p>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-bold">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-[#fe6e00] rounded-xs"></span> Chambres</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-[#423d38] rounded-xs"></span> Brunch</span>
            </div>
          </div>
          <div className="h-64">
            {dailyChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyChartData}>
                  <defs>
                    <linearGradient id="colorChambres" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#fe6e00" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#fe6e00" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorBrunch" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#423d38" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#423d38" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e3e0dd" />
                  <XAxis dataKey="date" stroke="#797067" fontSize={9} />
                  <YAxis stroke="#797067" fontSize={9} tickFormatter={(v) => `${v / 1000}k`} />
                  <Tooltip formatter={(value) => `${Number(value).toLocaleString()} F`} />
                  <Area type="monotone" dataKey="Chambres" stroke="#fe6e00" strokeWidth={2} fillOpacity={1} fill="url(#colorChambres)" />
                  <Area type="monotone" dataKey="Brunch" stroke="#423d38" strokeWidth={2} fillOpacity={1} fill="url(#colorBrunch)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-[#797067] font-semibold text-xs bg-gray-50 rounded-lg">
                Aucune donnée sur ce filtre de dates.
              </div>
            )}
          </div>
        </div>

        {/* 2. Payment Methods distribution (Répartition par mode de règlement) */}
        <div className="lg:col-span-1 bg-white p-5 rounded-xl border border-[#e3e0dd] shadow-sm flex flex-col gap-4 text-xs">
          <div>
            <h3 className="font-bold text-[#423d38] text-sm">Répartition des Règlements</h3>
            <p className="text-[#797067] text-[10px]">Part des encaissements par mode de paiement.</p>
          </div>
          <div className="h-44 flex items-center justify-center relative">
            {paymentMethodChartData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentMethodChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {paymentMethodChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getPaymentMethodColor(entry.name)} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${Number(value).toLocaleString()} F`} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Total indicators inside pie */}
                <div className="absolute text-center flex flex-col justify-center">
                  <span className="text-[8px] font-bold text-[#797067] uppercase tracking-wider">Trésorerie</span>
                  <span className="text-xs font-black text-[#423d38]">{cashReceived.toLocaleString()} F</span>
                </div>
              </>
            ) : (
              <div className="h-full w-full flex items-center justify-center text-[#797067] font-semibold text-xs bg-gray-50 rounded-lg">
                Aucun paiement encaissé
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1.5 max-h-32 overflow-y-auto pr-1 scrollbar-thin">
            {paymentMethodChartData.map((entry) => {
              const pct = cashReceived > 0 ? Math.round((entry.value / cashReceived) * 100) : 0;
              return (
                <div key={entry.name} className="flex justify-between items-center text-[10px] font-bold uppercase text-[#797067]">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getPaymentMethodColor(entry.name) }}></span>
                    {entry.name}
                  </span>
                  <span className="text-[#423d38]">{entry.value.toLocaleString()} F ({pct}%)</span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* MONTHLY FINANCIAL TRENDS & REVENUES SOURCE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Occupancy evolution line-bar chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-[#e3e0dd] shadow-sm flex flex-col gap-4 text-xs">
          <h3 className="font-bold text-[#423d38] text-sm">Évolution Financière Mensuelle (Historique)</h3>
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
          <h3 className="font-bold text-[#423d38] text-sm">Répartition Globale des Revenus</h3>
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
              <span className="text-[9px] font-bold text-[#797067] uppercase tracking-widest">Revenu Sélection</span>
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
          <h3 className="font-bold text-[#423d38] text-sm">Évolution du Taux d'Occupation Hebdomadaire (Estimation)</h3>
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
            <p className="text-[#797067] text-[11px] mt-0.5">Analyse comparative des flux, volumes de réservations et chiffre d'affaires par canal de distribution sur la sélection.</p>
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
