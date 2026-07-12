import React, { useState } from 'react';
import { Payment, Reservation } from '../types';
import { Search, Plus, CreditCard } from 'lucide-react';

interface PaymentsScreenProps {
  payments: Payment[];
  reservations: Reservation[];
  setPayments: React.Dispatch<React.SetStateAction<Payment[]>>;
  setReservations: React.Dispatch<React.SetStateAction<Reservation[]>>;
  triggerToast: (msg: string) => void;
}

export const PaymentsScreen: React.FC<PaymentsScreenProps> = ({
  payments,
  reservations,
  setPayments,
  setReservations,
  triggerToast
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('Tous');
  
  // Form states
  const [selectedResId, setSelectedResId] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<'Espèces' | 'Orange Money' | 'MTN Momo' | 'Moov Money' | 'Carte Bancaire' | 'Virement'>('Espèces');
  const [reference, setReference] = useState('');
  const [showPayForm, setShowPayForm] = useState(false);

  const unpaidReservations = reservations.filter(res => (res.totalBill - res.paidAmount) > 0);

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResId || !amount) {
      alert('Veuillez sélectionner une réservation et spécifier le montant.');
      return;
    }

    const res = reservations.find(r => r.id === selectedResId);
    if (!res) return;

    const parsedAmount = Number(amount) || 0;
    const unpaid = res.totalBill - res.paidAmount;

    if (parsedAmount > unpaid) {
      if (!confirm(`Le montant saisi (${parsedAmount.toLocaleString()} F) excède le solde restant dû (${unpaid.toLocaleString()} F). Confirmez-vous ce sur-paiement ?`)) {
        return;
      }
    }

    // 1. Create payment entry
    const newPaymentId = `PAY-${String(payments.length + 1).padStart(3, '0')}`;
    const newPayment: Payment = {
      id: newPaymentId,
      reservationId: res.id,
      guestName: res.guestName,
      amount: parsedAmount,
      method,
      date: '2026-07-11 17:30',
      reference: reference || `MAN-${Math.floor(100000 + Math.random() * 900000)}`
    };

    // 2. Add to payments
    setPayments(prev => [newPayment, ...prev]);

    // 3. Update reservation paidAmount in state
    setReservations(prev => prev.map(r => {
      if (r.id === res.id) {
        return {
          ...r,
          paidAmount: Math.min(r.totalBill, r.paidAmount + parsedAmount)
        };
      }
      return r;
    }));

    triggerToast(`Encaissement de ${parsedAmount.toLocaleString()} F enregistré pour ${res.guestName}.`);
    
    // reset
    setSelectedResId('');
    setAmount('');
    setReference('');
    setShowPayForm(false);
  };

  const filteredPayments = payments.filter(p => {
    const matchSearch = p.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.reservationId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.reference.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchMethod = methodFilter === 'Tous' ? true : p.method === methodFilter;

    return matchSearch && matchMethod;
  });

  return (
    <div className="flex flex-col gap-6 animate-fade-in" id="payments_screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#423d38] tracking-tight">Journal de Caisse & Paiements</h2>
          <p className="text-xs text-[#797067]">Consulter et enregistrer les encaissements (Espèces, Mobile Money et Cartes).</p>
        </div>

        <button 
          onClick={() => setShowPayForm(!showPayForm)}
          className="bg-[#fe6e00] hover:bg-[#ff6b00] text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-all cursor-pointer self-start"
        >
          <Plus className="w-4 h-4" />
          {showPayForm ? 'Masquer' : 'Enregistrer un Encaissement'}
        </button>
      </div>

      {showPayForm && (
        <div className="bg-[#f3f4f6] border border-[#e3e0dd] p-5 rounded-xl shadow-sm animate-fade-in text-xs">
          <h3 className="font-bold text-[#423d38] text-sm mb-3">Saisir un encaissement manuel</h3>
          <form onSubmit={handleRecordPayment} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="flex flex-col gap-1">
              <label className="font-bold text-[#797067] uppercase tracking-widest text-[10px]">Sélectionner le Client débiteur :</label>
              <select
                required
                value={selectedResId}
                onChange={(e) => {
                  setSelectedResId(e.target.value);
                  const selectedRes = reservations.find(r => r.id === e.target.value);
                  if (selectedRes) {
                    setAmount(String(selectedRes.totalBill - selectedRes.paidAmount));
                  }
                }}
                className="bg-white border border-[#e3e0dd] rounded-md p-2.5 focus:outline-none focus:border-[#fe6e00] text-[#423d38] font-semibold"
              >
                <option value="">-- Choisir une facture --</option>
                {unpaidReservations.map(res => (
                  <option key={res.id} value={res.id}>
                    {res.guestName} (CH {res.roomNumber} - Solde: {(res.totalBill - res.paidAmount).toLocaleString()} F)
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold text-[#797067] uppercase tracking-widest text-[10px]">Montant de l'encaissement (F) :</label>
              <input 
                type="number" 
                required 
                placeholder="Montant"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-white border border-[#e3e0dd] rounded-md p-2.5 focus:outline-none focus:border-[#fe6e00] text-[#423d38] font-bold text-sm"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold text-[#797067] uppercase tracking-widest text-[10px]">Moyen de Paiement :</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as any)}
                className="bg-white border border-[#e3e0dd] rounded-md p-2.5 focus:outline-none focus:border-[#fe6e00] text-[#423d38] font-semibold"
              >
                <option value="Espèces">Espèces (Cash)</option>
                <option value="Orange Money">Orange Money</option>
                <option value="MTN Momo">MTN Momo (Momo)</option>
                <option value="Moov Money">Moov Money</option>
                <option value="Carte Bancaire">Carte Bancaire</option>
                <option value="Virement">Virement Bancaire</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold text-[#797067] uppercase tracking-widest text-[10px]">ID / Référence de transaction :</label>
              <input 
                type="text" 
                placeholder="Ex: TXN-998129038"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="bg-white border border-[#e3e0dd] rounded-md p-2.5 focus:outline-none focus:border-[#fe6e00] text-[#423d38]"
              />
            </div>

            <div className="md:col-span-4 flex justify-end gap-2">
              <button
                type="submit"
                className="bg-[#fe6e00] hover:bg-[#ff6b00] text-white font-bold px-6 py-2 rounded-lg transition-colors cursor-pointer text-xs"
              >
                Valider l'Encaissement
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SEARCH AND FILTERS */}
      <div className="bg-white p-4 rounded-xl border border-[#e3e0dd] shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="flex-1 bg-[#f3f4f6] border border-[#e3e0dd] rounded-lg px-3 py-2 flex items-center gap-2">
          <Search className="w-4 h-4 text-[#797067]" />
          <input 
            type="text"
            placeholder="Rechercher par client, référence, transaction..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent flex-1 focus:outline-none text-xs text-[#423d38] placeholder:text-[#797067]"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Méthode :</span>
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-2 focus:outline-none focus:border-[#fe6e00] text-[#423d38] font-semibold"
          >
            <option value="Tous">Toutes les méthodes</option>
            <option value="Espèces">Espèces</option>
            <option value="Orange Money">Orange Money</option>
            <option value="MTN Momo">MTN Momo</option>
            <option value="Moov Money">Moov Money</option>
            <option value="Carte Bancaire">Carte Bancaire</option>
            <option value="Virement">Virement</option>
          </select>
        </div>
      </div>

      {/* LEDGER TABLE */}
      <div className="bg-white rounded-xl border border-[#e3e0dd] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#fe6e00]/5 border-b border-[#e3e0dd] text-[#fe6e00] font-bold uppercase tracking-widest text-[10px]">
                <th className="p-4">N° Reçu</th>
                <th className="p-4">Fiche Réservation</th>
                <th className="p-4">Client</th>
                <th className="p-4">Mode de Paiement</th>
                <th className="p-4">Date de dépôt</th>
                <th className="p-4">Référence Txn</th>
                <th className="p-4 text-right">Montant Encaissé</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e3e0dd]">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[#797067] italic">
                    Aucun paiement enregistré dans le journal.
                  </td>
                </tr>
              ) : (
                filteredPayments.map(p => {
                  let payMethodBadge = 'bg-[#f3f4f6] text-[#423d38] border-[#e3e0dd]';
                  if (p.method.includes('Money') || p.method.includes('Momo')) {
                    payMethodBadge = 'bg-[#fef9c2] text-[#874b00] border border-[#fe6e00]/20';
                  } else if (p.method === 'Espèces') {
                    payMethodBadge = 'bg-[#dcfce7] text-[#016630] border border-[#016630]/20';
                  } else {
                    payMethodBadge = 'bg-[#dbeafe] text-[#1447e6] border border-[#1447e6]/20';
                  }

                  return (
                    <tr key={p.id} className="hover:bg-[#f3f4f6]/50 transition-colors">
                      <td className="p-4 font-extrabold text-[#423d38] flex items-center gap-1.5">
                        <CreditCard className="w-4 h-4 text-[#797067]" />
                        {p.id}
                      </td>
                      <td className="p-4">
                        <span className="bg-[#f3f4f6] text-[#423d38] border border-[#e3e0dd] px-2 py-0.5 rounded font-bold text-[10px]">
                          {p.reservationId}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-[#423d38]">{p.guestName}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] border ${payMethodBadge}`}>
                          {p.method}
                        </span>
                      </td>
                      <td className="p-4 text-[#797067]">{p.date}</td>
                      <td className="p-4 font-mono text-[#797067] font-semibold">{p.reference}</td>
                      <td className="p-4 text-right font-extrabold text-[#016630] text-sm">
                        + {p.amount.toLocaleString()} F
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
