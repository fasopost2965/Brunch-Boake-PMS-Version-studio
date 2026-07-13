import React from 'react';
import { Room, Reservation, Payment } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { BarChart3, TrendingUp, Users, DollarSign, CreditCard } from 'lucide-react';

interface ReportsScreenProps {
  rooms: Room[];
  reservations: Reservation[];
  payments: Payment[];
}

const COLORS = ['#fe6e00', '#3080ff', '#00c758', '#edb200', '#fb2c36', '#8884d8'];

export const ReportsScreen: React.FC<ReportsScreenProps> = ({ rooms, reservations, payments }) => {
  // 1. Calculate financials
  const totalReceived = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalProjected = reservations.reduce((sum, r) => sum + r.totalBill, 0);
  const totalUnpaid = Math.max(0, totalProjected - totalReceived);

  // 2. Occupancy metrics
  const occupiedCount = rooms.filter(r => r.status === 'Occupé').length;
  const occupancyRate = rooms.length > 0 ? Math.round((occupiedCount / rooms.length) * 100) : 0;

  // 3. Channels distribution
  const channelDataMap: { [key: string]: number } = {};
  reservations.forEach((r) => {
    const channel = r.channelName || r.bookingSource || 'Direct';
    channelDataMap[channel] = (channelDataMap[channel] || 0) + 1;
  });
  const channelData = Object.entries(channelDataMap).map(([name, value]) => ({ name, value }));

  // 4. Payment methods
  const paymentMethodsMap: { [key: string]: number } = {};
  payments.forEach((p) => {
    const method = p.method || 'Espèces';
    paymentMethodsMap[method] = (paymentMethodsMap[method] || 0) + p.amount;
  });
  const paymentMethodsData = Object.entries(paymentMethodsMap).map(([name, value]) => ({ name, value }));

  // 5. General stats summary
  const summaryCards = [
    { label: 'Revenus Encaissés', value: `${totalReceived.toLocaleString()} FCFA`, desc: 'Total cumulé des transactions réelles', icon: DollarSign, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Revenus Projetés', value: `${totalProjected.toLocaleString()} FCFA`, desc: 'Facturation totale des séjours', icon: TrendingUp, color: 'text-[#fe6e00] bg-[#fe6e00]/10' },
    { label: 'Taux d\'Occupation', value: `${occupancyRate}%`, desc: `${occupiedCount} chambres occupées sur ${rooms.length}`, icon: Users, color: 'text-blue-600 bg-blue-50' },
    { label: 'Reste à Encaisser', value: `${totalUnpaid.toLocaleString()} FCFA`, desc: 'Factures en attente de règlement', icon: CreditCard, color: 'text-amber-600 bg-amber-50' }
  ];

  return (
    <div id="reports-screen" className="space-y-6 animate-fade-in">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-outfit font-medium text-gray-900 tracking-tight flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-[#fe6e00]" />
          Rapports & Statistiques Financières
        </h1>
        <p className="text-sm text-gray-500 font-outfit">Analyse de l'occupation, des flux de trésorerie en FCFA et des canaux d'acquisition</p>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{card.label}</span>
                <div className={`p-2 rounded-xl ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <p className="text-xl font-bold font-mono text-gray-900 leading-tight">{card.value}</p>
                <p className="text-[10px] text-gray-500 mt-1">{card.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Methods Chart */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold text-gray-800 border-b pb-2">Répartition des encaissements par Moyen de Règlement (FCFA)</h2>
          <div className="h-64">
            {paymentMethodsData.length === 0 ? (
              <p className="text-center text-xs text-gray-400 pt-28">Données de paiement insuffisantes</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={paymentMethodsData} margin={{ left: 10, right: 10, top: 10, bottom: 5 }}>
                  <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `${(val / 1000).toLocaleString()}k`} />
                  <Tooltip formatter={(value: any) => [`${Number(value).toLocaleString()} FCFA`, 'Montant']} />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {paymentMethodsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Acquisition Channels Chart */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold text-gray-800 border-b pb-2">Origine des Réservations (Canaux d'Acquisition)</h2>
          <div className="h-64 flex items-center justify-center">
            {channelData.length === 0 ? (
              <p className="text-center text-xs text-gray-400">Données de réservation insuffisantes</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={channelData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {channelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => [`${value} réservations`, 'Volume']} />
                  <Legend verticalAlign="bottom" height={36} iconSize={10} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
