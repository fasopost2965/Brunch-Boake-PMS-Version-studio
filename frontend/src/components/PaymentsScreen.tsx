import React, { useState } from 'react';
import { Payment, Reservation } from '../types';
import { api } from '../api';
import { CreditCard, Search, Plus, Calendar, Coins, ArrowUpRight } from 'lucide-react';

interface PaymentsScreenProps {
  payments: Payment[];
  reservations: Reservation[];
  onPaymentsUpdate: () => void;
  onReservationsUpdate: () => void;
}

export const PaymentsScreen: React.FC<PaymentsScreenProps> = ({
  payments,
  reservations,
  onPaymentsUpdate,
  onReservationsUpdate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Form State
  const [selectedResId, setSelectedResId] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [method, setMethod] = useState<Payment['method']>('Orange Money');
  const [reference, setReference] = useState('');

  const activeReservations = reservations.filter(r => r.status === 'En Cours' || r.status === 'Confirmé');

  const filteredPayments = payments.filter((p) => {
    const q = searchQuery.toLowerCase();
    return p.guestName.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || (p.reference && p.reference.toLowerCase().includes(q));
  });

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResId || amount <= 0) {
      alert('Champs obligatoires manquants.');
      return;
    }

    try {
      const resData = reservations.find(r => r.id === selectedResId);
      if (!resData) return;

      const newPay: Payment = {
        id: `PAY-${Math.floor(1000 + Math.random() * 9000)}`,
        reservationId: selectedResId,
        guestName: resData.guestName,
        amount,
        method,
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        reference: reference || undefined,
      };

      // 1. Create payment
      await api.payments.create(newPay);

      // 2. Update paid amount on reservation
      const nextPaidAmount = resData.paidAmount + amount;
      await api.reservations.update(selectedResId, {
        paidAmount: nextPaidAmount,
      });

      alert('Règlement enregistré avec succès !');
      onPaymentsUpdate();
      onReservationsUpdate();
      
      // Clear form
      setSelectedResId('');
      setAmount(0);
      setReference('');
      setShowAddForm(false);
    } catch (err) {
      console.error(err);
      alert('Échec de validation du règlement.');
    }
  };

  const totalCollected = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div id="payments-screen" className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-outfit font-medium text-gray-900 tracking-tight flex items-center gap-2">
            <Coins className="w-6 h-6 text-[#fe6e00]" />
            Grand Livre des Règlements
          </h1>
          <p className="text-sm text-gray-500 font-outfit">Suivi des encaissements réels, transactions Mobile Money (Orange, MTN, Moov) et espèces</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 bg-[#fe6e00] hover:bg-[#ff6b00] text-white px-4 py-2 rounded-xl font-medium text-xs transition-all shadow-sm active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Enregistrer un Règlement
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payments ledger table (Col 2) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par client, reçu ou référence transaction..."
              className="w-full bg-white border border-gray-200 text-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:ring-1 focus:ring-[#fe6e00] outline-none shadow-sm"
            />
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase font-medium tracking-wider text-[10px]">
                    <th className="p-3">Identifiant Reçu</th>
                    <th className="p-3">Client / Réservation</th>
                    <th className="p-3">Mode</th>
                    <th className="p-3">Montant</th>
                    <th className="p-3">Référence / Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-6 text-center text-gray-400 italic">Aucune transaction enregistrée</td>
                    </tr>
                  ) : (
                    filteredPayments.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50 transition-all">
                        <td className="p-3 font-semibold font-mono text-gray-900">{p.id}</td>
                        <td className="p-3">
                          <p className="font-semibold text-gray-800">{p.guestName}</p>
                          <p className="text-[10px] text-gray-400 font-mono">Rés: {p.reservationId}</p>
                        </td>
                        <td className="p-3 font-semibold">{p.method}</td>
                        <td className="p-3 font-mono font-bold text-emerald-600">+{p.amount.toLocaleString()} FCFA</td>
                        <td className="p-3 space-y-0.5">
                          <p className="font-medium font-mono text-gray-600">{p.reference || 'Aucune réf.'}</p>
                          <p className="text-[9px] text-gray-400">{p.date}</p>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Totals & Add Form (Col 1) */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-3">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Trésorerie cumulée reçue</span>
            <div className="text-2xl font-bold font-mono text-[#00c758] flex items-center gap-1.5">
              <Coins className="w-6 h-6" />
              {totalCollected.toLocaleString()} FCFA
            </div>
            <p className="text-[10px] text-gray-500">Mise à jour en temps réel à chaque transaction validée.</p>
          </div>

          {showAddForm && (
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4 animate-fade-in">
              <div className="flex justify-between items-center border-b pb-2">
                <h2 className="text-base font-outfit font-semibold text-gray-900">Enregistrer un Règlement</h2>
                <button onClick={() => setShowAddForm(false)} className="text-xs text-gray-400 hover:text-gray-600">Annuler</button>
              </div>

              <form onSubmit={handleAddPayment} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="block font-medium text-gray-600">Dossier / Réservation active :</label>
                  <select
                    required
                    value={selectedResId}
                    onChange={(e) => setSelectedResId(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-700 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#fe6e00] outline-none"
                  >
                    <option value="">-- Choisir un client --</option>
                    {activeReservations.map(r => (
                      <option key={r.id} value={r.id}>{r.guestName} (Rés: {r.id} - CH {r.roomNumber})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block font-medium text-gray-600">Montant encaissé (FCFA) :</label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={amount || ''}
                    onChange={(e) => setAmount(parseInt(e.target.value, 10))}
                    placeholder="Ex: 50000"
                    className="w-full bg-gray-50 border border-gray-200 text-gray-700 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#fe6e00] outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-medium text-gray-600">Moyen de paiement :</label>
                  <select
                    value={method}
                    onChange={(e) => setMethod(e.target.value as Payment['method'])}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-700 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#fe6e00] outline-none font-semibold"
                  >
                    <option value="Espèces">Espèces</option>
                    <option value="Orange Money">Orange Money</option>
                    <option value="MTN Momo">MTN Momo</option>
                    <option value="Moov Money">Moov Money</option>
                    <option value="Carte Bancaire">Carte Bancaire</option>
                    <option value="Virement">Virement</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block font-medium text-gray-600">ID Référence Transaction (Mobile Money / C.B) :</label>
                  <input
                    type="text"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="Ex: REF-OM-88273917"
                    className="w-full bg-gray-50 border border-gray-200 text-gray-700 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#fe6e00] outline-none font-mono"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-xl text-xs font-semibold shadow-sm transition-all active:scale-95"
                >
                  Valider l'encaissement
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
