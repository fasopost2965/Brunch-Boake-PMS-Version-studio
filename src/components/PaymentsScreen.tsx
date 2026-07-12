import React, { useState } from 'react';
import { Payment, Reservation } from '../types';
import { 
  Search, 
  Plus, 
  CreditCard, 
  Trash2, 
  Printer, 
  TrendingUp, 
  Wallet, 
  Smartphone, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  X, 
  Coins, 
  Download,
  User,
  ArrowDownCircle,
  FileSpreadsheet
} from 'lucide-react';
import { BrunchLogo } from './BrunchLogo';

interface PaymentsScreenProps {
  payments: Payment[];
  reservations: Reservation[];
  setPayments: React.Dispatch<React.SetStateAction<Payment[]>>;
  setReservations: React.Dispatch<React.SetStateAction<Reservation[]>>;
  triggerToast: (msg: string) => void;
  currentUserRole?: string;
}

export const PaymentsScreen: React.FC<PaymentsScreenProps> = ({
  payments,
  reservations,
  setPayments,
  setReservations,
  triggerToast,
  currentUserRole = 'receptionist'
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('Tous');
  const [timeFilter, setTimeFilter] = useState<'Tous' | 'Récents' | 'Plus de 10k' | 'Moins de 10k'>('Tous');
  
  // Form states
  const [selectedResId, setSelectedResId] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<'Espèces' | 'Orange Money' | 'MTN Momo' | 'Moov Money' | 'Carte Bancaire' | 'Virement'>('Espèces');
  const [reference, setReference] = useState('');
  const [showPayForm, setShowPayForm] = useState(false);

  // Receipt Modal State
  const [selectedPaymentForReceipt, setSelectedPaymentForReceipt] = useState<Payment | null>(null);

  const unpaidReservations = reservations.filter(res => (res.totalBill - res.paidAmount) > 0);

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResId || !amount) {
      triggerToast('Erreur: Veuillez sélectionner une réservation et spécifier le montant.');
      return;
    }

    const res = reservations.find(r => r.id === selectedResId);
    if (!res) return;

    const parsedAmount = Number(amount) || 0;
    const unpaid = res.totalBill - res.paidAmount;

    if (parsedAmount <= 0) {
      triggerToast('Erreur: Le montant doit être supérieur à zéro.');
      return;
    }

    if (parsedAmount > unpaid) {
      if (!window.confirm(`Le montant saisi (${parsedAmount.toLocaleString()} F) excède le solde restant dû (${unpaid.toLocaleString()} F). Confirmez-vous ce sur-paiement ?`)) {
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
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      reference: reference || `OM-${Math.floor(100000 + Math.random() * 900000)}`
    };

    // 2. Add to payments
    setPayments(prev => [newPayment, ...prev]);

    // 3. Update reservation paidAmount in state
    setReservations(prev => prev.map(r => {
      if (r.id === res.id) {
        return {
          ...r,
          paidAmount: r.paidAmount + parsedAmount
        };
      }
      return r;
    }));

    triggerToast(`Encaissement de ${parsedAmount.toLocaleString()} FCFA enregistré pour ${res.guestName}.`);
    
    // reset
    setSelectedResId('');
    setAmount('');
    setReference('');
    setShowPayForm(false);
  };

  const handleDeletePayment = (paymentId: string) => {
    if (currentUserRole !== 'admin' && currentUserRole !== 'gerant') {
      triggerToast('Accès refusé : Seul un Administrateur ou un Gérant peut annuler un encaissement.');
      return;
    }

    const pay = payments.find(p => p.id === paymentId);
    if (!pay) return;

    if (!window.confirm(`Attention: Voulez-vous vraiment annuler l'encaissement ${pay.id} de ${pay.amount.toLocaleString()} F pour ${pay.guestName} ? Les comptes du client seront automatiquement réajustés.`)) {
      return;
    }

    // Update reservation's paidAmount in state
    setReservations(prev => prev.map(r => {
      if (r.id === pay.reservationId) {
        return {
          ...r,
          paidAmount: Math.max(0, r.paidAmount - pay.amount)
        };
      }
      return r;
    }));

    // Remove payment from state
    setPayments(prev => prev.filter(p => p.id !== paymentId));

    triggerToast(`L'encaissement ${pay.id} a été annulé avec succès.`);
  };

  // Filter Logic
  const filteredPayments = payments.filter(p => {
    const matchSearch = p.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.reservationId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchMethod = methodFilter === 'Tous' ? true : p.method === methodFilter;

    let matchTime = true;
    if (timeFilter === 'Récents') {
      // simulate checking recent entries (first 5 in list)
      const indexInBase = payments.findIndex(item => item.id === p.id);
      matchTime = indexInBase < 5;
    } else if (timeFilter === 'Plus de 10k') {
      matchTime = p.amount >= 10000;
    } else if (timeFilter === 'Moins de 10k') {
      matchTime = p.amount < 10000;
    }

    return matchSearch && matchMethod && matchTime;
  });

  // KPI calculations (all values calculated on actual unfiltered payments to keep drawer status correct)
  const totalAll = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalCash = payments.filter(p => p.method === 'Espèces').reduce((sum, p) => sum + p.amount, 0);
  const totalMobile = payments.filter(p => ['Orange Money', 'MTN Momo', 'Moov Money'].includes(p.method)).reduce((sum, p) => sum + p.amount, 0);
  const totalBank = payments.filter(p => ['Carte Bancaire', 'Virement'].includes(p.method)).reduce((sum, p) => sum + p.amount, 0);

  // Simulated export to CSV
  const handleExportCSV = () => {
    triggerToast('Journal de caisse exporté au format CSV (simulation de téléchargement).');
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in" id="payments_screen">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e3e0dd] pb-4">
        <div className="flex items-center gap-3">
          <div className="bg-white p-1 rounded-xl border border-gray-200 shadow-sm flex items-center justify-center shrink-0">
            <BrunchLogo size={55} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#423d38] tracking-tight">Journal de Caisse & Paiements</h2>
            <p className="text-xs text-[#797067]">
              Consulter, filtrer et comptabiliser les transactions en temps réel (Espèces, Mobile Money et Cartes).
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <button 
            onClick={handleExportCSV}
            className="bg-white border border-[#e3e0dd] hover:bg-gray-50 text-[#423d38] text-xs font-semibold px-3 py-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Exporter CSV
          </button>
          <button 
            onClick={() => setShowPayForm(!showPayForm)}
            className="bg-[#fe6e00] hover:bg-[#ff6b00] text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            {showPayForm ? 'Fermer le formulaire' : 'Nouvel Encaissement'}
          </button>
        </div>
      </div>

      {/* STATS HIGHLIGHTS (BENTO-STYLE) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block">Solde Caisse Global</span>
            <span className="text-lg font-extrabold text-[#423d38] font-mono block mt-1">
              {totalAll.toLocaleString()} FCFA
            </span>
            <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-0.5 mt-0.5">
              <TrendingUp className="w-3 h-3" /> {payments.length} transactions
            </span>
          </div>
          <div className="w-10 h-10 bg-[#fe6e00]/10 text-[#fe6e00] rounded-xl flex items-center justify-center shrink-0">
            <Coins className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block">Encaissements Cash</span>
            <span className="text-lg font-extrabold text-[#423d38] font-mono block mt-1">
              {totalCash.toLocaleString()} FCFA
            </span>
            <span className="text-[10px] text-[#797067] font-semibold block mt-0.5">
              Fonds de caisse physique
            </span>
          </div>
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
            <Wallet className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block">Mobile Money (CI)</span>
            <span className="text-lg font-extrabold text-[#423d38] font-mono block mt-1">
              {totalMobile.toLocaleString()} FCFA
            </span>
            <span className="text-[10px] text-[#fe6e00] font-semibold block mt-0.5">
              Orange / MTN / Moov
            </span>
          </div>
          <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
            <Smartphone className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block">Banque & Virements</span>
            <span className="text-lg font-extrabold text-[#423d38] font-mono block mt-1">
              {totalBank.toLocaleString()} FCFA
            </span>
            <span className="text-[10px] text-blue-600 font-semibold block mt-0.5">
              Cartes CB & Virocs
            </span>
          </div>
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
            <CreditCard className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* FORM: NEW PAYMENT */}
      {showPayForm && (
        <div className="bg-white border border-[#e3e0dd] p-5 rounded-xl shadow-md animate-fade-in text-xs">
          <div className="flex justify-between items-center border-b pb-2.5 mb-4">
            <h3 className="font-extrabold text-[#423d38] text-sm flex items-center gap-1.5">
              <ArrowDownCircle className="w-5 h-5 text-[#fe6e00]" />
              Enregistrer un encaissement manuel
            </h3>
            <button 
              onClick={() => setShowPayForm(false)} 
              className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleRecordPayment} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="flex flex-col gap-1">
              <label className="font-bold text-[#797067] uppercase tracking-wider text-[9px]">Sélectionner le Client débiteur :</label>
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
                className="bg-gray-50 border border-[#e3e0dd] rounded-lg p-2.5 focus:outline-none focus:border-[#fe6e00] text-[#423d38] font-semibold"
              >
                <option value="">-- Choisir une facture client --</option>
                {unpaidReservations.map(res => (
                  <option key={res.id} value={res.id}>
                    {res.guestName} (CH {res.roomNumber} - Solde: {(res.totalBill - res.paidAmount).toLocaleString()} F)
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold text-[#797067] uppercase tracking-wider text-[9px]">Montant de l'encaissement (FCFA) :</label>
              <input 
                type="number" 
                required 
                placeholder="Ex: 45000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-gray-50 border border-[#e3e0dd] rounded-lg p-2.5 focus:outline-none focus:border-[#fe6e00] text-[#423d38] font-black font-mono text-sm"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold text-[#797067] uppercase tracking-wider text-[9px]">Moyen de Paiement :</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as any)}
                className="bg-gray-50 border border-[#e3e0dd] rounded-lg p-2.5 focus:outline-none focus:border-[#fe6e00] text-[#423d38] font-bold"
              >
                <option value="Espèces">Espèces (Cash)</option>
                <option value="Orange Money">Orange Money</option>
                <option value="MTN Momo">MTN Momo</option>
                <option value="Moov Money">Moov Money</option>
                <option value="Carte Bancaire">Carte Bancaire</option>
                <option value="Virement">Virement Bancaire</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold text-[#797067] uppercase tracking-wider text-[9px]">Référence / ID de transaction :</label>
              <input 
                type="text" 
                placeholder="Ex: TXN-8921820"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="bg-gray-50 border border-[#e3e0dd] rounded-lg p-2.5 focus:outline-none focus:border-[#fe6e00] text-[#423d38] font-semibold"
              />
            </div>

            <div className="md:col-span-4 flex justify-end gap-2 border-t border-dashed border-[#e3e0dd] pt-3 mt-1">
              <button
                type="button"
                onClick={() => {
                  setSelectedResId('');
                  setAmount('');
                  setReference('');
                  setShowPayForm(false);
                }}
                className="bg-white border hover:bg-gray-50 text-[#797067] px-4 py-2 rounded-lg font-bold transition-all text-xs cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="bg-[#016630] hover:bg-[#025227] text-white font-bold px-5 py-2 rounded-lg transition-colors cursor-pointer text-xs"
              >
                Valider et Comptabiliser
              </button>
            </div>
          </form>
        </div>
      )}

      {/* FILTER CONTROLS */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-3">
        <div className="flex-1 bg-[#f3f4f6]/60 border border-[#e3e0dd] rounded-lg px-3 py-2 flex items-center gap-2">
          <Search className="w-4 h-4 text-[#797067]" />
          <input 
            type="text"
            placeholder="Rechercher par n° reçu, client, référence, n° réservation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent flex-1 focus:outline-none text-xs text-[#423d38] placeholder:text-[#797067]"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-600 text-xs">✕</button>
          )}
        </div>

        <div className="grid grid-cols-2 md:flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-[#797067] uppercase tracking-wider text-[8px] whitespace-nowrap">Mode de Paiement :</span>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="bg-[#f3f4f6]/60 border border-[#e3e0dd] rounded-md p-2 focus:outline-none focus:border-[#fe6e00] text-[#423d38] font-bold"
            >
              <option value="Tous">Tous</option>
              <option value="Espèces">Espèces</option>
              <option value="Orange Money">Orange Money</option>
              <option value="MTN Momo">MTN Momo</option>
              <option value="Moov Money">Moov Money</option>
              <option value="Carte Bancaire">Carte Bancaire</option>
              <option value="Virement">Virement</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-bold text-[#797067] uppercase tracking-wider text-[8px] whitespace-nowrap">Valeur :</span>
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value as any)}
              className="bg-[#f3f4f6]/60 border border-[#e3e0dd] rounded-md p-2 focus:outline-none focus:border-[#fe6e00] text-[#423d38] font-bold"
            >
              <option value="Tous">Tous montants</option>
              <option value="Récents">Dernières saisies (5)</option>
              <option value="Plus de 10k">≥ 10 000 F</option>
              <option value="Moins de 10k">&lt; 10 000 F</option>
            </select>
          </div>
        </div>
      </div>

      {/* RE-WORKED LEDGER TABLE */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-scale-up">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <span className="font-bold text-[#423d38] text-xs">
            Lignes d'écritures trouvées : <strong className="text-[#fe6e00] font-mono">{filteredPayments.length}</strong>
          </span>
          <span className="text-[10px] text-[#797067] font-semibold">
            Tri chronologique décroissant
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase tracking-wider text-[9px]">
                <th className="p-3.5">Réf Reçu</th>
                <th className="p-3.5">ID Réservation</th>
                <th className="p-3.5">Client & Hôte</th>
                <th className="p-3.5">Mode de Paiement</th>
                <th className="p-3.5">Date d'opération</th>
                <th className="p-3.5">Référence de Transaction</th>
                <th className="p-3.5 text-right">Montant Encaissé</th>
                <th className="p-3.5 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-sans">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-10 text-center text-gray-400 italic font-medium">
                    <div className="flex flex-col items-center gap-2 justify-center">
                      <AlertCircle className="w-8 h-8 text-gray-300" />
                      <span>Aucun paiement enregistré ne correspond à ces critères de recherche.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPayments.map(p => {
                  let payMethodBadge = 'bg-[#f3f4f6] text-[#423d38] border-gray-200';
                  if (p.method === 'Orange Money') {
                    payMethodBadge = 'bg-orange-50 text-orange-700 border-orange-200/50';
                  } else if (p.method === 'MTN Momo') {
                    payMethodBadge = 'bg-yellow-50 text-yellow-800 border-yellow-200/50';
                  } else if (p.method === 'Moov Money') {
                    payMethodBadge = 'bg-blue-50 text-blue-700 border-blue-200/50';
                  } else if (p.method === 'Espèces') {
                    payMethodBadge = 'bg-emerald-50 text-emerald-700 border-emerald-200/50';
                  } else {
                    payMethodBadge = 'bg-indigo-50 text-indigo-700 border-indigo-200/50';
                  }

                  return (
                    <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-[#fe6e00]">
                        <div className="flex items-center gap-1.5">
                          <CreditCard className="w-3.5 h-3.5 text-gray-400" />
                          <span>{p.id}</span>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span className="bg-gray-100 text-gray-700 font-mono border border-gray-200 px-2 py-0.5 rounded font-semibold text-[9px]">
                          {p.reservationId}
                        </span>
                      </td>
                      <td className="p-3.5 font-extrabold text-gray-800">
                        {p.guestName}
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] border ${payMethodBadge}`}>
                          {p.method}
                        </span>
                      </td>
                      <td className="p-3.5 text-gray-500 font-medium">
                        {p.date}
                      </td>
                      <td className="p-3.5 font-mono text-gray-600 font-semibold truncate max-w-[150px]" title={p.reference}>
                        {p.reference}
                      </td>
                      <td className="p-3.5 text-right font-black text-emerald-700 text-xs font-mono">
                        + {p.amount.toLocaleString()} F
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedPaymentForReceipt(p)}
                            className="bg-white border border-gray-200 hover:bg-gray-50 text-[#fe6e00] p-1.5 rounded-lg flex items-center justify-center transition-all cursor-pointer shadow-sm"
                            title="Consulter le reçu imprimable"
                          >
                            <FileText className="w-3.5 h-3.5" />
                          </button>
                          
                          <button
                            onClick={() => handleDeletePayment(p.id)}
                            className="bg-white border border-gray-200 hover:border-red-200 hover:bg-red-50 text-gray-400 hover:text-red-600 p-1.5 rounded-lg flex items-center justify-center transition-all cursor-pointer shadow-sm"
                            title="Annuler l'opération (Admin/Gérant)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PREMIUM PRINTABLE VOUCHER/RECEIPT MODAL */}
      {selectedPaymentForReceipt && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden animate-scale-up">
            
            {/* Modal Title & Actions Header */}
            <div className="bg-[#423d38] text-white px-4 py-3 flex justify-between items-center text-xs shrink-0">
              <span className="font-extrabold uppercase tracking-wider text-[10px] text-[#fe6e00] flex items-center gap-1.5">
                <Printer className="w-4 h-4" /> REÇU DE CAISSE PMS
              </span>
              <button 
                onClick={() => setSelectedPaymentForReceipt(null)}
                className="text-white hover:text-[#fe6e00] font-bold text-base cursor-pointer"
              >
                ×
              </button>
            </div>

            {/* Printable Frame Area */}
            <div id="printable-receipt" className="p-6 bg-[#fcfaf7] text-gray-800 font-sans text-xs flex flex-col gap-4 border-b border-gray-100 overflow-y-auto flex-1">
              
              {/* Receipt Header */}
              <div className="text-center flex flex-col items-center border-b border-dashed border-gray-300 pb-4">
                <BrunchLogo size={60} />
                <h4 className="text-sm font-black text-gray-900 tracking-tight uppercase mt-1">Brunch Bouaké</h4>
                <p className="text-[10px] text-gray-500 font-medium">Hôtel de Charme & Pavillons Brunch</p>
                <p className="text-[9px] text-gray-400 mt-0.5">Bouaké, Quartier Kennedy • Côte d'Ivoire</p>
                <p className="text-[9px] text-gray-400 font-mono">Tél: +225 07 08 09 10 11</p>
              </div>

              {/* Transaction Metadata */}
              <div className="grid grid-cols-2 gap-y-2 border-b border-dashed border-gray-300 pb-4 text-[10px]">
                <div>
                  <span className="text-gray-400 block uppercase tracking-wider text-[8px] font-bold">N° de Reçu :</span>
                  <strong className="text-gray-900 font-mono text-xs">{selectedPaymentForReceipt.id}</strong>
                </div>
                <div className="text-right">
                  <span className="text-gray-400 block uppercase tracking-wider text-[8px] font-bold">Date de Dépôt :</span>
                  <strong className="text-gray-900 font-mono">{selectedPaymentForReceipt.date}</strong>
                </div>
                <div>
                  <span className="text-gray-400 block uppercase tracking-wider text-[8px] font-bold">Fiche Réservation :</span>
                  <strong className="text-gray-700 font-mono bg-white px-1.5 py-0.5 border rounded">{selectedPaymentForReceipt.reservationId}</strong>
                </div>
                <div className="text-right">
                  <span className="text-gray-400 block uppercase tracking-wider text-[8px] font-bold">Méthode Utilisée :</span>
                  <strong className="text-gray-900 font-extrabold text-xs text-[#fe6e00]">{selectedPaymentForReceipt.method}</strong>
                </div>
              </div>

              {/* Guest & Voucher Description */}
              <div className="bg-white p-3 rounded-lg border border-gray-200">
                <span className="text-gray-400 block uppercase tracking-wider text-[8px] font-bold mb-1">Reçu de l'hôte / Client :</span>
                <div className="flex items-center gap-1.5 text-xs text-gray-900 font-extrabold">
                  <User className="w-4 h-4 text-[#fe6e00]" />
                  <span>{selectedPaymentForReceipt.guestName}</span>
                </div>
              </div>

              {/* Payment Bill item line */}
              <div className="flex flex-col gap-1 border-b border-dashed border-gray-300 pb-4">
                <div className="flex justify-between font-bold text-gray-600 uppercase text-[9px] tracking-wider mb-1">
                  <span>Désignation / Détails</span>
                  <span>Montant</span>
                </div>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-gray-800 font-bold block">Versement acompte / Règlement solde</span>
                    <span className="text-[10px] text-gray-400 block">Pour séjour hôtelier ({selectedPaymentForReceipt.reservationId})</span>
                  </div>
                  <strong className="text-gray-900 font-mono">{selectedPaymentForReceipt.amount.toLocaleString()} FCFA</strong>
                </div>
              </div>

              {/* Financial Summary Highlight */}
              <div className="bg-[#fe6e00]/5 border border-[#fe6e00]/20 p-3.5 rounded-lg flex justify-between items-center">
                <span className="font-extrabold uppercase text-[#fe6e00] text-[10px] tracking-widest">Somme Encaissée :</span>
                <span className="text-lg font-black text-[#fe6e00] font-mono">
                  {selectedPaymentForReceipt.amount.toLocaleString()} FCFA
                </span>
              </div>

              {/* Security Seal & Stamp */}
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-dashed border-gray-300 text-[10px]">
                <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-md">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-bold uppercase text-[8px] tracking-widest">TRANSACTION VALIDÉE</span>
                </div>
                <div className="text-right text-gray-400 italic">
                  <span>Ref: {selectedPaymentForReceipt.reference}</span>
                </div>
              </div>

              {/* Legal Notice Footer */}
              <div className="mt-2 pt-2 border-t border-gray-200 text-[8px] text-gray-400 text-center font-sans">
                <p className="font-bold">Brunch Bouaké VIP • Quartier Kennedy • Bouaké, Côte d'Ivoire</p>
                <p>N° CC: 2104567 T • RCCM: CI-BKE-2024-B-1289</p>
                <p className="italic mt-1">Merci de votre confiance ! Ce reçu certifie votre règlement.</p>
              </div>
            </div>

            {/* Print and Close Actions */}
            <div className="bg-gray-50 px-5 py-4 flex flex-wrap gap-2 justify-end shrink-0">
              <button
                onClick={() => {
                  triggerToast(`Impression en cours pour le reçu ${selectedPaymentForReceipt.id}`);
                  window.print();
                }}
                className="bg-[#fe6e00] hover:bg-[#ff6b00] text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-sm shadow-[#fe6e00]/10"
              >
                <Printer className="w-4 h-4" />
                Imprimer le ticket
              </button>
              <button
                onClick={() => {
                  triggerToast(`Génération du PDF pour le reçu ${selectedPaymentForReceipt.id} (veuillez choisir Enregistrer en PDF)`);
                  window.print();
                }}
                className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              >
                <Download className="w-4 h-4 text-emerald-600" />
                Télécharger PDF
              </button>
              <button
                onClick={() => setSelectedPaymentForReceipt(null)}
                className="bg-[#423d38] text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-black transition-all cursor-pointer"
              >
                Fermer
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
