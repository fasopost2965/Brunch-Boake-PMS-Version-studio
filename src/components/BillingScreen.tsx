import React, { useState } from 'react';
import { Reservation, BrunchOrder, Room, Payment } from '../types';
import { BrunchLogo } from './BrunchLogo';
import { 
  Receipt, 
  Plus, 
  Printer, 
  FileText, 
  CreditCard, 
  CheckCircle2, 
  DollarSign, 
  Share2, 
  Undo2, 
  FileCheck
} from 'lucide-react';

interface BillingScreenProps {
  reservations: Reservation[];
  orders: BrunchOrder[];
  rooms: Room[];
  payments: Payment[];
  setReservations: React.Dispatch<React.SetStateAction<Reservation[]>>;
  setPayments: React.Dispatch<React.SetStateAction<Payment[]>>;
  triggerToast: (msg: string) => void;
  setActiveTab?: (tab: any) => void;
  hotelConfig?: any;
}

export const BillingScreen: React.FC<BillingScreenProps> = ({
  reservations,
  orders,
  rooms,
  payments,
  setReservations,
  setPayments,
  triggerToast,
  setActiveTab,
  hotelConfig
}) => {
  // We can choose from all active or completed reservations
  const activeAndPastStays = reservations.filter(res => res.status === 'En Cours' || res.status === 'Terminé');
  
  const [selectedResId, setSelectedResId] = useState<string>(activeAndPastStays[0]?.id || '');
  const [invoiceMode, setInvoiceMode] = useState<'proforma' | 'final'>('proforma');

  // Form states for adding custom folio extra charge
  const [chargeCategory, setChargeCategory] = useState<'Restaurant' | 'Blanchisserie' | 'Transport' | 'Taxes' | 'Autre'>('Restaurant');
  const [chargeDesc, setChargeDesc] = useState('');
  const [chargeAmount, setChargeAmount] = useState('');

  // Payment drawer/modal states
  const [showPaymentDrawer, setShowPaymentDrawer] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Espèces' | 'Orange Money' | 'MTN Momo' | 'Moov Money' | 'Carte Bancaire' | 'Virement' | 'Paiement Mixte'>('Espèces');
  const [paymentRef, setPaymentRef] = useState('');
  const [mixedMethodDetails, setMixedMethodDetails] = useState('Ex: 50% Espèces, 50% Orange Money');

  const currentRes = reservations.find(r => r.id === selectedResId);
  const currentRoom = currentRes ? rooms.find(rm => rm.id === currentRes.roomNumber) : null;

  // Calculate nights
  const calculateNights = (checkIn: string, checkOut: string) => {
    const cin = new Date(checkIn);
    const cout = new Date(checkOut);
    return Math.max(1, Math.round((cout.getTime() - cin.getTime()) / (1000 * 3600 * 24)));
  };

  const nights = currentRes ? calculateNights(currentRes.checkIn, currentRes.checkOut) : 0;
  
  // Base room price is based on the room's set price
  const roomPricePerNight = currentRoom ? currentRoom.price : (currentRes ? 35000 : 0);
  const baseRoomTotal = roomPricePerNight * nights;

  // Taxes calculations:
  // Check if taxes should be applied based on configuration
  const shouldApplyTaxes = hotelConfig?.fiscal?.applyTaxes !== false;

  // In Côte d'Ivoire, standard tourist tax is 1,000 F CFA per night
  const touristTaxPerNight = shouldApplyTaxes ? 1000 : 0;
  const totalTouristTax = touristTaxPerNight * nights;
  
  // Local service tax or VAT (e.g. 2% representing standard local municipal tax)
  const serviceTaxAmount = shouldApplyTaxes ? Math.round(baseRoomTotal * 0.02) : 0;
  const defaultTaxesTotal = totalTouristTax + serviceTaxAmount;

  // Dynamic Brunch / POS orders charged to the room
  const roomOrders = currentRes ? orders.filter(o => o.roomNumber === currentRes.roomNumber && o.isChargedToRoom) : [];
  const ordersTotal = roomOrders.reduce((sum, ord) => sum + ord.totalAmount, 0);

  // Folio custom extras (we subtract room price and base taxes to find what's extra)
  // Or we can let custom charges be appended dynamically.
  // Let's assume currentRes.totalBill holds the entire current state,
  // and we show the breakdown nicely. If totalBill is smaller than baseRoomTotal, 
  // we adjust totalBill to represent room + taxes + extras.
  const customExtrasAmount = currentRes ? Math.max(0, currentRes.totalBill - baseRoomTotal - (shouldApplyTaxes ? (1000 * nights + Math.round(baseRoomTotal * 0.02)) : 0)) : 0;

  // Calculate true displayed total reflecting active tax options
  const displayedTotal = baseRoomTotal + defaultTaxesTotal + ordersTotal + customExtrasAmount;

  // Let's get the payment status on the fly
  const getInvoicePaymentStatus = (res: Reservation, totalAmount: number) => {
    if (res.paidAmount <= 0) return 'Non Payé';
    if (res.paidAmount < totalAmount) return 'Partiellement Payé';
    if (res.paidAmount >= totalAmount) return 'Payé';
    return 'Non Payé';
  };

  const paymentStatus = currentRes ? getInvoicePaymentStatus(currentRes, displayedTotal) : 'Non Payé';

  // Get payments specifically made for this reservation
  const associatedPayments = payments.filter(p => p.reservationId === selectedResId);

  const handleAddExtraCharge = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRes) return;
    if (!chargeDesc || !chargeAmount) {
      alert('Veuillez remplir la description et le montant.');
      return;
    }

    const amount = Number(chargeAmount) || 0;

    // Add extra charge directly to reservation totalBill
    setReservations(prev => prev.map(res => {
      if (res.id === currentRes.id) {
        return {
          ...res,
          totalBill: res.totalBill + amount
        };
      }
      return res;
    }));

    triggerToast(`Frais folio ajouté : ${chargeDesc} (+${amount.toLocaleString()} F)`);
    setChargeDesc('');
    setChargeAmount('');
  };

  // Record a payment directly from the billing screen
  const handleRecordInvoicePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRes) return;

    const parsedAmount = Number(paymentAmount) || 0;
    if (parsedAmount <= 0) {
      alert('Veuillez spécifier un montant supérieur à 0.');
      return;
    }

    // 1. Create a payment record
    const newPaymentId = `PAY-${String(payments.length + 1).padStart(3, '0')}`;
    const newPayment: Payment = {
      id: newPaymentId,
      reservationId: currentRes.id,
      guestName: currentRes.guestName,
      amount: parsedAmount,
      method: paymentMethod === 'Paiement Mixte' ? 'Espèces' : paymentMethod, // Mixed uses primary or Cash for simple type compatibility
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      reference: paymentRef || `REFC-${Math.floor(100000 + Math.random() * 900000)}`
    };

    // 2. Add to payment list
    setPayments(prev => [newPayment, ...prev]);

    // 3. Update reservation paidAmount
    setReservations(prev => prev.map(res => {
      if (res.id === currentRes.id) {
        const updatedPaid = res.paidAmount + parsedAmount;
        return {
          ...res,
          paidAmount: updatedPaid
        };
      }
      return res;
    }));

    triggerToast(`Règlement de ${parsedAmount.toLocaleString()} F enregistré ! Statut mis à jour.`);
    setShowPaymentDrawer(false);
    setPaymentAmount('');
    setPaymentRef('');
  };

  // Perform a full refund
  const handleRefundInvoice = () => {
    if (!currentRes) return;
    if (currentRes.paidAmount <= 0) {
      alert('Aucun montant n\'a été réglé sur cette facture pour pouvoir la rembourser.');
      return;
    }

    if (!confirm(`Confirmez-vous le remboursement intégral de ${currentRes.paidAmount.toLocaleString()} F pour ${currentRes.guestName} ?`)) {
      return;
    }

    const refundAmount = -currentRes.paidAmount;

    // 1. Log the refund transaction
    const newPaymentId = `REF-${String(payments.length + 1).padStart(3, '0')}`;
    const refundTx: Payment = {
      id: newPaymentId,
      reservationId: currentRes.id,
      guestName: currentRes.guestName,
      amount: refundAmount,
      method: 'Espèces',
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      reference: `REMB-${Math.floor(100000 + Math.random() * 900000)}`
    };

    setPayments(prev => [refundTx, ...prev]);

    // 2. Set paidAmount to 0 on the reservation
    setReservations(prev => prev.map(res => {
      if (res.id === currentRes.id) {
        return {
          ...res,
          paidAmount: 0 // Reset
        };
      }
      return res;
    }));

    triggerToast(`Facture remboursée ! Un montant de ${(-refundAmount).toLocaleString()} F a été décaissé.`);
  };

  const handlePrintFolio = () => {
    if (!currentRes) return;
    const documentType = invoiceMode === 'proforma' ? 'PROFORMA' : 'COMMERCIALE DÉFINITIVE';
    triggerToast(`Lancement de l'impression PDF pour la facture ${documentType} de ${currentRes.guestName}...`);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in text-xs" id="billing_screen">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#423d38] tracking-tight">Gestion de la Facturation & Folios</h2>
          <p className="text-xs text-[#797067]">Génération des devis pré-factures, gestion des taxes réglementaires de Bouaké, extras de séjours, et encaissements direct.</p>
        </div>

        {/* View mode toggle */}
        <div className="bg-[#f3f4f6] border border-[#e3e0dd] p-1 rounded-lg flex self-start">
          <button 
            onClick={() => setInvoiceMode('proforma')}
            className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
              invoiceMode === 'proforma' 
                ? 'bg-[#fe6e00] text-white shadow-sm' 
                : 'text-[#797067] hover:text-[#423d38]'
            }`}
          >
            📋 Pré-Facture (Proforma)
          </button>
          <button 
            onClick={() => setInvoiceMode('final')}
            className={`px-3 py-1.5 rounded-md font-bold transition-all cursor-pointer ${
              invoiceMode === 'final' 
                ? 'bg-[#fe6e00] text-white shadow-sm' 
                : 'text-[#797067] hover:text-[#423d38]'
            }`}
          >
            🧾 Facture Finale
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: SELECTION & FOLIO ADDITIONS (width: 4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* SELECTOR WORKSPACE */}
          <div className="bg-white p-5 rounded-xl border border-[#e3e0dd] shadow-sm flex flex-col gap-3">
            <h3 className="font-bold text-[#423d38] text-xs uppercase tracking-wider border-b border-[#e3e0dd] pb-2">Choix de la Fiche de Séjour</h3>
            
            <div className="flex flex-col gap-1">
              <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Sélectionner un séjour :</label>
              <select
                value={selectedResId}
                onChange={(e) => {
                  setSelectedResId(e.target.value);
                  setShowPaymentDrawer(false);
                }}
                className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-2.5 focus:outline-none focus:border-[#fe6e00] text-[#423d38] font-bold"
              >
                <option value="">-- Choisir un séjour actif/passé --</option>
                {activeAndPastStays.map(res => (
                  <option key={res.id} value={res.id}>
                    {res.guestName} (CH {res.roomNumber} - {res.status})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {currentRes && (
            <>
              {/* FOLIO ITEM ADDITION FORM */}
              <div className="bg-white p-5 rounded-xl border border-[#e3e0dd] shadow-sm flex flex-col gap-3 animate-fade-in">
                <h3 className="font-bold text-[#423d38] text-xs uppercase tracking-wider border-b border-[#e3e0dd] pb-2 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-[#fe6e00]" /> Ajouter un Frais / Extra au Folio
                </h3>

                <form onSubmit={handleAddExtraCharge} className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Catégorie de charge :</label>
                    <select
                      value={chargeCategory}
                      onChange={(e) => setChargeCategory(e.target.value as any)}
                      className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-2 focus:outline-none focus:border-[#fe6e00] text-[#423d38] font-semibold"
                    >
                      <option value="Restaurant">Restaurant & Bar</option>
                      <option value="Blanchisserie">Blanchisserie (Laundry)</option>
                      <option value="Transport">Navette / Chauffeur privé</option>
                      <option value="Taxes">Taxes de séjour additionnelle</option>
                      <option value="Autre">Autre extra / Service</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Libellé de la ligne :</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="Ex: 1x Repassage costume ou Pressing"
                      value={chargeDesc}
                      onChange={(e) => setChargeDesc(e.target.value)}
                      className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-2 focus:outline-none focus:border-[#fe6e00] text-[#423d38]"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Montant de l'extra (F CFA) :</label>
                    <input 
                      type="number" 
                      required 
                      placeholder="Ex: 8000"
                      value={chargeAmount}
                      onChange={(e) => setChargeAmount(e.target.value)}
                      className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-2 focus:outline-none focus:border-[#fe6e00] text-[#423d38] font-mono font-bold"
                    />
                  </div>

                  <button
                    type="submit"
                    className="bg-[#fe6e00] hover:bg-[#ff6b00] text-white font-bold py-2 rounded-lg transition-colors cursor-pointer text-center flex items-center justify-center gap-1"
                  >
                    <Plus className="w-4 h-4" /> Ajouter la ligne au Folio
                  </button>
                </form>
              </div>

              {/* ADMINISTRATIVE STAMP AND QUICK PAYMENT TRIGGER */}
              <div className="bg-[#f3f4f6]/60 p-5 rounded-xl border border-[#e3e0dd] flex flex-col gap-3">
                <span className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Comptabilité Client</span>
                
                <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-[#e3e0dd]">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-[#797067] font-semibold">Reste à solder :</span>
                    <strong className="text-base text-[#fb2c36] font-mono">
                      {Math.max(0, displayedTotal - currentRes.paidAmount).toLocaleString()} F
                    </strong>
                  </div>
                  
                  <span className={`px-2 py-0.5 rounded-full font-black text-[9px] border uppercase ${
                    paymentStatus === 'Payé' ? 'bg-[#dcfce7] text-[#016630] border-[#016630]/20' :
                    paymentStatus === 'Partiellement Payé' ? 'bg-[#fef9c2] text-[#874b00] border-[#fe6e00]/20' :
                    'bg-[#fef2f2] text-[#fb2c36] border-[#fb2c36]/20'
                  }`}>
                    {paymentStatus}
                  </span>
                </div>

                <div className="flex flex-col gap-2 pt-1">
                  {paymentStatus !== 'Payé' ? (
                    <button
                      onClick={() => {
                        setPaymentAmount(String(Math.max(0, displayedTotal - currentRes.paidAmount)));
                        setShowPaymentDrawer(true);
                      }}
                      className="bg-[#016630] hover:bg-[#025227] text-white font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-sm"
                    >
                      <CreditCard className="w-4 h-4" />
                      Encaisser un règlement
                    </button>
                  ) : (
                    <div className="bg-[#dcfce7] border border-[#016630]/20 text-[#016630] font-bold p-3 rounded-lg text-center flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      Solde intégralement réglé !
                    </div>
                  )}

                  <button
                    onClick={handleRefundInvoice}
                    className="bg-white hover:bg-gray-50 border border-[#e3e0dd] text-[#797067] hover:text-[#fb2c36] font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-all"
                  >
                    <Undo2 className="w-4 h-4" />
                    Effectuer un remboursement
                  </button>
                </div>
              </div>
            </>
          )}

        </div>

        {/* RIGHT COLUMN: INVOICE PREVIEW / QUICK PAY DRAWER (width: 8 cols) */}
        <div className="lg:col-span-8 flex flex-col h-full">
          
          {currentRes ? (
            <div className="flex flex-col gap-4 flex-1">
              
              {/* PAY DRAWER MODE */}
              {showPaymentDrawer ? (
                <div className="bg-white rounded-xl border border-[#e3e0dd] p-6 shadow-md flex flex-col gap-5 animate-scale-up">
                  <div className="flex items-center justify-between border-b border-[#e3e0dd] pb-3">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-[#016630]" />
                      <h3 className="font-extrabold text-[#423d38] text-sm uppercase tracking-wider">Enregistrement de l'Encaissement de Séjour</h3>
                    </div>
                    <button 
                      onClick={() => setShowPaymentDrawer(false)}
                      className="text-[#797067] hover:text-red-500 font-extrabold cursor-pointer"
                    >
                      Fermer X
                    </button>
                  </div>

                  <form onSubmit={handleRecordInvoicePayment} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    <div className="flex flex-col gap-1 md:col-span-2">
                      <div className="bg-[#fe6e00]/5 p-3 rounded-lg border border-[#fe6e00]/10 flex justify-between items-center text-xs">
                        <span>Fiche concernée : <strong>{currentRes.id}</strong> (CH {currentRes.roomNumber})</span>
                        <span>Client : <strong>{currentRes.guestName}</strong></span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Mode de règlement :</label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value as any)}
                        className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-2.5 focus:outline-none focus:border-[#fe6e00] font-semibold text-[#423d38]"
                      >
                        <option value="Espèces">Espèces (Cash)</option>
                        <option value="Orange Money">Orange Money (Orange)</option>
                        <option value="MTN Momo">MTN Momo (Momo)</option>
                        <option value="Moov Money">Moov Money (Moov)</option>
                        <option value="Carte Bancaire">Carte Bancaire (VISA/MC)</option>
                        <option value="Virement">Virement Bancaire</option>
                        <option value="Paiement Mixte">Paiement Mixte (Mixte)</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Montant à enregistrer (F CFA) :</label>
                      <input 
                        type="number" 
                        required 
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-2.5 focus:outline-none focus:border-[#fe6e00] font-mono font-bold text-[#423d38] text-sm"
                      />
                    </div>

                    {paymentMethod === 'Paiement Mixte' && (
                      <div className="flex flex-col gap-1 md:col-span-2">
                        <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Détails du paiement mixte :</label>
                        <input 
                          type="text" 
                          value={mixedMethodDetails}
                          onChange={(e) => setMixedMethodDetails(e.target.value)}
                          className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-2 focus:outline-none focus:border-[#fe6e00] text-[#423d38]"
                        />
                      </div>
                    )}

                    <div className="flex flex-col gap-1 md:col-span-2">
                      <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Référence de transaction / Reçu :</label>
                      <input 
                        type="text" 
                        placeholder="Ex: TXN-OM-12093812 ou Cash Desk #1"
                        value={paymentRef}
                        onChange={(e) => setPaymentRef(e.target.value)}
                        className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-2 focus:outline-none focus:border-[#fe6e00] text-[#423d38]"
                      />
                    </div>

                    <div className="md:col-span-2 flex justify-end gap-2 pt-4 border-t border-[#e3e0dd] mt-4">
                      <button
                        type="button"
                        onClick={() => setShowPaymentDrawer(false)}
                        className="bg-white hover:bg-gray-50 border border-[#e3e0dd] text-[#797067] font-bold px-4 py-2 rounded-lg"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        className="bg-[#016630] hover:bg-[#025227] text-white font-bold px-5 py-2 rounded-lg flex items-center gap-1.5 shadow-sm"
                      >
                        <FileCheck className="w-4 h-4" /> Enregistrer le reçu de règlement
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                
                // INVOICE PREVIEW WORKSPACE
                <div id="printable-invoice" className="bg-white rounded-xl border border-[#e3e0dd] p-4 sm:p-8 shadow-md flex flex-col gap-6 animate-scale-up text-xs font-mono relative overflow-hidden">
                  
                  {/* Watermark / Stamp overlay depending on status */}
                  <div className="absolute top-4 right-4 sm:top-6 sm:right-6 flex flex-col items-end pointer-events-none select-none z-10 opacity-80 scale-90 sm:scale-100 origin-top-right">
                    <Receipt className="w-10 h-10 text-[#797067]/30" />
                    {invoiceMode === 'proforma' ? (
                      <span className="text-[9px] font-black bg-[#fe6e00]/10 text-[#fe6e00] border border-[#fe6e00]/20 px-2 py-0.5 rounded-md mt-1 tracking-widest uppercase font-sans">
                        PRÉ-FACTURE (PROFORMA)
                      </span>
                    ) : (
                      <span className="text-[9px] font-black bg-[#016630]/10 text-[#016630] border border-[#016630]/20 px-2 py-0.5 rounded-md mt-1 tracking-widest uppercase font-sans">
                        FACTURE COMMERCIALE DÉFINITIVE
                      </span>
                    )}
 
                    {/* Stamp payment indicator */}
                    <div className={`mt-3 border-2 transform rotate-12 px-3 py-1.5 rounded text-xs font-black tracking-widest font-sans ${
                      paymentStatus === 'Payé' ? 'border-[#016630] text-[#016630] bg-[#016630]/5' :
                      paymentStatus === 'Partiellement Payé' ? 'border-[#fe6e00] text-[#fe6e00] bg-[#fe6e00]/5' :
                      'border-[#fb2c36] text-[#fb2c36] bg-[#fb2c36]/5'
                    }`}>
                      {paymentStatus === 'Payé' ? 'QUITTANCÉ / PAYÉ' :
                       paymentStatus === 'Partiellement Payé' ? 'ACOMPTE PAYÉ' : 'DÛ / NON PAYÉ'}
                    </div>
                  </div>
 
                  {/* HOTEL GREETINGS HEADER */}
                  <div className="flex items-center gap-4 border-b border-[#e3e0dd] pb-4">
                    {(!hotelConfig || hotelConfig.templates?.showLogo !== false) && (
                      <div className="bg-white p-1 rounded-lg border border-gray-200 shrink-0">
                        <BrunchLogo size={52} />
                      </div>
                    )}
                    <div className="flex flex-col gap-0.5">
                      <h4 className="text-sm font-extrabold text-[#fe6e00] font-sans tracking-widest uppercase">
                        {hotelConfig?.name ? `${hotelConfig.name} PMS` : 'BRUNCH BOUAKÉ PMS'}
                      </h4>
                      {hotelConfig?.legal?.slogan && (
                        <p className="text-[9px] text-[#797067] font-sans italic font-semibold">{hotelConfig.legal.slogan}</p>
                      )}
                      <p className="text-[#797067] font-sans text-[10px]">
                        {hotelConfig?.address || 'Quartier Kennedy, Bouaké, Côte d\'Ivoire'}
                      </p>
                      {(!hotelConfig || hotelConfig.templates?.showLegalNo !== false) && (
                        <p className="text-[#797067] font-sans text-[10px]">
                          RCCM: {hotelConfig?.legal?.rccm || 'CI-BKE-2026-B-129'} 
                          {hotelConfig?.legal?.nif ? ` • NIF: ${hotelConfig.legal.nif}` : ' • IFU-21004892Y'} 
                          • Tél: {hotelConfig?.legal?.phone || '+225 07 00 11 22 33'}
                        </p>
                      )}
                    </div>
                  </div>
 
                  {/* CLIENT AND INVOICE METADATA */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-[#e3e0dd] pb-4">
                    <div className="flex flex-col gap-1 text-[#423d38]">
                      <span className="text-[#fe6e00] font-bold font-sans text-[9px] uppercase tracking-wider">Facturé à :</span>
                      <span className="font-extrabold text-[#423d38] font-sans text-sm">{currentRes.guestName}</span>
                      <span>Email : {currentRes.guestEmail}</span>
                      {currentRes.originCountry && <span>Pays d'origine : <strong>{currentRes.originCountry}</strong></span>}
                      <span>Chambre de séjour : <strong>CH {currentRes.roomNumber} ({currentRoom?.type || 'Standard'})</strong></span>
                    </div>
 
                    <div className="flex flex-col gap-1 text-[#423d38] text-left sm:text-right">
                      <span className="text-[#fe6e00] font-bold font-sans text-[9px] uppercase tracking-wider">Identifiants comptables :</span>
                      <span>N° Facture : <strong>FACT-{currentRes.id}</strong></span>
                      <span>Dates du séjour : du {currentRes.checkIn} au {currentRes.checkOut} ({nights} nuits)</span>
                      {currentRes.bookingSource && (
                        <span>Source de réservation : <strong>{currentRes.bookingSource} ({currentRes.channelName})</strong></span>
                      )}
                      {currentRes.otaReference && (
                        <span>Référence OTA : <strong className="font-mono text-[10px] bg-gray-100 px-1 py-0.5 rounded">{currentRes.otaReference}</strong></span>
                      )}
                      <span className="font-sans">Statut du séjour : <strong className="text-[#fe6e00]">{currentRes.status}</strong></span>
                    </div>
                  </div>

                  {/* INVOICE DETAILED ROWS */}
                  <div className="flex flex-col gap-2">
                    <span className="text-[#797067] font-bold font-sans text-[10px] uppercase border-b border-[#e3e0dd] pb-1.5 tracking-wider">Détail des lignes de facturation</span>
                    
                    {/* 1. Base stay lodging rows */}
                    <div className="flex justify-between items-start py-2 border-b border-dashed border-[#e3e0dd]">
                      <div className="flex flex-col">
                        <span>Hébergement - Chambre {currentRes.roomNumber} ({currentRoom?.type || 'Standard'})</span>
                        <span className="text-[10px] text-[#797067] font-sans">Tarif de base : {roomPricePerNight.toLocaleString()} F / nuitée • {nights} nuitée(s)</span>
                      </div>
                      <span className="font-bold text-[#423d38] font-mono">{baseRoomTotal.toLocaleString()} F CFA</span>
                    </div>

                    {/* 2. Regulatory local taxes breakdown */}
                    <div className="flex justify-between items-start py-2 border-b border-dashed border-[#e3e0dd] text-[11px]">
                      <div className="flex flex-col">
                        <span>Taxes de séjour réglementaire (Bouaké)</span>
                        <span className="text-[10px] text-[#797067] font-sans">Taxe municipale fixe : 1 000 F / nuitée • {nights} nuitée(s)</span>
                      </div>
                      <span className="font-semibold text-[#423d38] font-mono">{totalTouristTax.toLocaleString()} F CFA</span>
                    </div>

                    <div className="flex justify-between items-start py-2 border-b border-dashed border-[#e3e0dd] text-[11px]">
                      <div className="flex flex-col">
                        <span>Taxe de développement touristique & Services</span>
                        <span className="text-[10px] text-[#797067] font-sans">Réglementation hôtelière locale (2% sur l'hébergement)</span>
                      </div>
                      <span className="font-semibold text-[#423d38] font-mono">{serviceTaxAmount.toLocaleString()} F CFA</span>
                    </div>

                    {/* 3. Orders dynamic POS Brunch extras */}
                    {roomOrders.length > 0 && (
                      <div className="flex justify-between items-start py-2 border-b border-dashed border-[#e3e0dd]">
                        <div className="flex flex-col">
                          <span>Prestations Brunch & Restauration (POS Room-Charge)</span>
                          <span className="text-[10px] text-[#797067] font-sans">Commandes rattachées à la chambre {currentRes.roomNumber} : {roomOrders.map(o => `#${o.id}`).join(', ')}</span>
                        </div>
                        <span className="font-bold text-[#423d38] font-mono">{ordersTotal.toLocaleString()} F CFA</span>
                      </div>
                    )}

                    {/* 4. Custom Extras Folio row */}
                    {customExtrasAmount > 0 && (
                      <div className="flex justify-between items-start py-2 border-b border-dashed border-[#e3e0dd]">
                        <div className="flex flex-col">
                          <span>Prestations Extras Folio de séjour</span>
                          <span className="text-[10px] text-[#797067] font-sans">Blanchisserie, boissons ou navettes manuelles enregistrées</span>
                        </div>
                        <span className="font-bold text-[#423d38] font-mono">{customExtrasAmount.toLocaleString()} F CFA</span>
                      </div>
                    )}
                  </div>

                  {/* INVOICE LEDGER TOTAL CALCULATIONS */}
                  <div className="flex flex-col gap-2 border-t border-[#e3e0dd] pt-4 max-w-xs ml-auto w-full text-right font-sans">
                    <div className="flex justify-between font-bold text-[#797067] text-[11px]">
                      <span>Sous-total HT :</span>
                      <span className="text-[#423d38] font-mono">{(baseRoomTotal + ordersTotal + customExtrasAmount).toLocaleString()} F</span>
                    </div>
                    <div className="flex justify-between font-bold text-[#797067] text-[11px]">
                      <span>Taxes totales (Séjour + TVA) :</span>
                      <span className="text-[#423d38] font-mono">{defaultTaxesTotal.toLocaleString()} F</span>
                    </div>
                    <div className="h-px bg-dashed bg-[#e3e0dd] my-1"></div>
                    <div className="flex justify-between font-black text-[#423d38] text-sm">
                      <span>Montant Total TTC :</span>
                      <span className="text-[#fe6e00] font-mono">{displayedTotal.toLocaleString()} F CFA</span>
                    </div>
                    <div className="flex justify-between font-bold text-[#016630] text-[11px] bg-[#dcfce7]/40 px-2 py-0.5 rounded">
                      <span>Total déjà payé :</span>
                      <span className="font-mono">{currentRes.paidAmount.toLocaleString()} F</span>
                    </div>
                    <div className="flex justify-between font-bold text-[#fb2c36] text-[11px] bg-[#fef2f2] px-2 py-0.5 rounded">
                      <span>Solde restant dû :</span>
                      <span className="font-mono">{Math.max(0, displayedTotal - currentRes.paidAmount).toLocaleString()} F</span>
                    </div>
                  </div>

                  {/* ASSOCIATED PAYMENTS LOG FOR DETAILS AND RECEIPT SLIPS */}
                  {associatedPayments.length > 0 && (
                    <div className="mt-4 border-t border-[#e3e0dd] pt-4 flex flex-col gap-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[#797067] font-bold font-sans text-[9px] uppercase tracking-wider">Justificatifs des règlements encaissés</span>
                        {setActiveTab && (
                          <button 
                            type="button"
                            onClick={() => setActiveTab('payments')}
                            className="text-[#fe6e00] hover:underline font-bold text-[9px] uppercase tracking-wider font-sans cursor-pointer"
                          >
                            Consulter le journal de caisse →
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 font-sans">
                        {associatedPayments.map(p => (
                          <div key={p.id} className="bg-[#f3f4f6]/60 p-2.5 rounded border border-[#e3e0dd] flex justify-between items-center text-[11px]">
                            <div className="flex flex-col">
                              <span className="font-bold text-[#423d38]">{p.id} • {p.method}</span>
                              <span className="text-[10px] text-[#797067] font-mono">Date: {p.date} • Réf: {p.reference}</span>
                            </div>
                            <span className="font-black text-[#016630] font-mono">{p.amount.toLocaleString()} F</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* BOTTOM FOOTER DISCLAIMER AND SIGNATURES */}
                  <div className="border-t border-[#e3e0dd] pt-4 flex flex-col md:flex-row justify-between items-center text-[10px] font-sans text-[#797067] gap-4">
                    <div className="text-left flex-1">
                      {invoiceMode === 'proforma' ? (
                        <p className="italic text-[#fe6e00] font-bold">
                          📋 Ce document est une Pré-Facture Proforma estimative (valable {hotelConfig?.templates?.proformaValidity || '15'} jours).
                        </p>
                      ) : (
                        <p className="font-semibold text-gray-500">
                          🤝 {hotelConfig?.templates?.thankYouMessage || 'Merci pour votre séjour au Brunch Bouaké ! Document de Facture Commerciale certifié conforme par le PMS.'}
                        </p>
                      )}
                    </div>
                    {hotelConfig?.printing?.showSignature !== false && (
                      <div className="text-right border-l border-gray-200 pl-4 font-sans shrink-0">
                        <span className="text-[9px] uppercase font-bold text-gray-400 block">Signé pour l'Établissement</span>
                        <div className="h-8 font-serif italic text-gray-700 pt-1 text-xs">
                          {hotelConfig?.printing?.signatureName || 'La Direction - Brunch Bouaké'}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* PRINT & ACTIONS MENU */}
                  <div className="flex gap-2 justify-end border-t border-[#e3e0dd] pt-4 font-sans">
                    <button
                      onClick={handlePrintFolio}
                      className="bg-[#fe6e00] hover:bg-[#ff6b00] text-white font-bold py-2 px-4 rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                    >
                      <Printer className="w-4 h-4" />
                      Imprimer ({invoiceMode === 'proforma' ? 'Proforma' : 'Facture'})
                    </button>
                    
                    <button
                      onClick={() => triggerToast(`L'envoi de la facture par e-mail à ${currentRes.guestEmail} a été initié.`)}
                      className="bg-white hover:bg-gray-50 border border-[#e3e0dd] text-[#797067] font-bold py-2 px-4 rounded-lg text-xs transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <Share2 className="w-4 h-4" />
                      Envoyer par Email
                    </button>
                  </div>

                </div>
              )}

            </div>
          ) : (
            <div className="bg-white border border-[#e3e0dd] p-12 text-center rounded-xl flex flex-col items-center justify-center gap-3 h-full min-h-[500px] shadow-sm">
              <FileText className="w-10 h-10 text-[#797067]" />
              <span className="font-bold text-[#423d38] text-sm">Sélectionnez une facture</span>
              <p className="text-[11px] text-[#797067] max-w-xs leading-relaxed">
                Choisissez un client ayant un séjour actif ou terminé dans la liste latérale gauche pour générer et manipuler son devis pré-facture ou sa facture définitive.
              </p>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
