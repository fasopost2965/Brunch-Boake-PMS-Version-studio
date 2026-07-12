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
  FileCheck,
  Lock,
  Smartphone,
  Copy,
  AlertTriangle,
  Radio,
  ExternalLink,
  RefreshCw,
  Clock
} from 'lucide-react';

export interface Caution {
  id: string;
  reservationId: string;
  amount: number;
  status: 'collected' | 'restituted' | 'retained';
  retainedAmount: number;
  reason: string;
  date: string;
}

export interface PartialInvoice {
  id: string;
  reservationId: string;
  label: string; // e.g. "Semaine 1", "Mois 1"
  amount: number;
  date: string;
  status: 'Payé' | 'Dû';
}

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
  
  // Custom sub-navigation for specialized long-stay/African market features
  const [activeSubSection, setActiveSubSection] = useState<'folio' | 'cautions' | 'fractional' | 'paylink'>('folio');
  
  // Caution / security deposits list
  const [cautions, setCautions] = useState<Caution[]>(() => {
    const saved = localStorage.getItem('bouake_pms_cautions');
    return saved ? JSON.parse(saved) : [
      { id: 'CAU-001', reservationId: 'RES-001', amount: 50000, status: 'collected', retainedAmount: 0, reason: '', date: '2026-07-10 14:20' }
    ];
  });

  // Partial / fractional invoices list
  const [partialInvoices, setPartialInvoices] = useState<PartialInvoice[]>(() => {
    const saved = localStorage.getItem('bouake_pms_partial_invoices');
    return saved ? JSON.parse(saved) : [];
  });

  // Selected partial invoice for filtering the invoice preview
  const [selectedPartialInvoiceId, setSelectedPartialInvoiceId] = useState<string>('');

  // Caution form states
  const [cautionAmount, setCautionAmount] = useState('50000');
  const [cautionRetainAmount, setCautionRetainAmount] = useState('');
  const [cautionRetainReason, setCautionRetainReason] = useState('');

  // Fractional invoice form states
  const [partialInvoiceLabel, setPartialInvoiceLabel] = useState('Facture Hebdomadaire (Semaine 1)');
  const [partialInvoiceAmount, setPartialInvoiceAmount] = useState('');

  // Mobile Money states
  const [momoPhone, setMomoPhone] = useState('+225 07 89 45 12 30');
  const [momoOperator, setMomoOperator] = useState<'Wave' | 'Orange Money' | 'MTN Momo' | 'Moov Money'>('Wave');
  const [isMomoProcessing, setIsMomoProcessing] = useState(false);

  // Webhook event logs
  const [webhookLogs, setWebhookLogs] = useState<{ id: string; event: string; url: string; timestamp: string; payload: string; status: number }[]>(() => {
    const saved = localStorage.getItem('bouake_pms_webhook_logs');
    return saved ? JSON.parse(saved) : [];
  });

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

  // Webhook event logger
  const dispatchWebhook = (event: string, payloadObj: any) => {
    const savedConfig = localStorage.getItem('bouake_pms_config');
    const config = savedConfig ? JSON.parse(savedConfig) : {};
    const webhookUrl = config?.integrations?.webhookUrl || 'https://my-dolibarr-erp.ci/api/webhook';
    
    const newLog = {
      id: `WH-${Date.now().toString().slice(-4)}`,
      event: event,
      url: webhookUrl,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      payload: JSON.stringify(payloadObj, null, 2),
      status: 200
    };
    
    setWebhookLogs(prev => {
      const updated = [newLog, ...prev];
      localStorage.setItem('bouake_pms_webhook_logs', JSON.stringify(updated));
      return updated;
    });
    
    triggerToast(`🔗 Webhook envoyé à Dolibarr: Événement ${event}`);
  };

  const updateCautionsInLocalStorage = (newCautions: Caution[]) => {
    setCautions(newCautions);
    localStorage.setItem('bouake_pms_cautions', JSON.stringify(newCautions));
  };

  const updatePartialInvoicesInLocalStorage = (newPartials: PartialInvoice[]) => {
    setPartialInvoices(newPartials);
    localStorage.setItem('bouake_pms_partial_invoices', JSON.stringify(newPartials));
  };

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

    // Trigger webhook dispatch for external ERP / Dolibarr sync
    dispatchWebhook('reservation.paid', {
      event: 'reservation.paid',
      timestamp: new Date().toISOString(),
      data: {
        reservationId: currentRes.id,
        guestName: currentRes.guestName,
        roomNumber: currentRes.roomNumber,
        amountPaid: parsedAmount,
        totalPaidAmount: currentRes.paidAmount + parsedAmount,
        paymentMethod: newPayment.method,
        reference: newPayment.reference,
        date: newPayment.date
      }
    });

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

            {currentRes && (
              <div className="flex flex-col gap-2 mt-1 pt-2 border-t border-[#e3e0dd]">
                <span className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Fonctions Résidence & Long Séjour :</span>
                
                {/* Horizontal tabs */}
                <div className="grid grid-cols-4 gap-1 bg-gray-100 p-1 rounded-lg text-[10px]">
                  <button 
                    type="button"
                    onClick={() => {
                      setActiveSubSection('folio');
                      setSelectedPartialInvoiceId('');
                    }}
                    className={`py-1 rounded font-bold transition-all text-center cursor-pointer ${
                      activeSubSection === 'folio' && !selectedPartialInvoiceId ? 'bg-white text-[#fe6e00] shadow-xs' : 'text-gray-500 hover:text-[#423d38]'
                    }`}
                    title="Extras et Folio Standard"
                  >
                    📄 Folio
                  </button>
                  <button 
                    type="button"
                    onClick={() => setActiveSubSection('cautions')}
                    className={`py-1 rounded font-bold transition-all text-center cursor-pointer ${
                      activeSubSection === 'cautions' ? 'bg-white text-[#fe6e00] shadow-xs' : 'text-gray-500 hover:text-[#423d38]'
                    }`}
                    title="Gestion des Dépôts de Garantie"
                  >
                    🔐 Caution
                  </button>
                  <button 
                    type="button"
                    onClick={() => setActiveSubSection('fractional')}
                    className={`py-1 rounded font-bold transition-all text-center cursor-pointer ${
                      activeSubSection === 'fractional' ? 'bg-white text-[#fe6e00] shadow-xs' : 'text-gray-500 hover:text-[#423d38]'
                    }`}
                    title="Facturation Fractionnée Récurrente"
                  >
                    📅 Fract.
                  </button>
                  <button 
                    type="button"
                    onClick={() => setActiveSubSection('paylink')}
                    className={`py-1 rounded font-bold transition-all text-center cursor-pointer ${
                      activeSubSection === 'paylink' ? 'bg-white text-[#fe6e00] shadow-xs' : 'text-gray-500 hover:text-[#423d38]'
                    }`}
                    title="Mobile Money & Liens WhatsApp"
                  >
                    📱 Mobile
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handlePrintFolio}
                  className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-sm text-center font-sans text-[10px]"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Imprimer la fiche courante (CH {currentRes.roomNumber})
                </button>
              </div>
            )}
          </div>

          {currentRes && (
            <>
              {/* ==================== TAB 1: STANDARD FOLIO EXTRAS ==================== */}
              {activeSubSection === 'folio' && (
                <div className="flex flex-col gap-6 animate-fade-in">
                  {/* FOLIO ITEM ADDITION FORM */}
                  <div className="bg-white p-5 rounded-xl border border-[#e3e0dd] shadow-sm flex flex-col gap-3">
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
                          className="bg-[#016630] hover:bg-[#025227] text-white font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-all shadow-sm text-xs"
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
                        className="bg-white hover:bg-gray-50 border border-[#e3e0dd] text-[#797067] hover:text-[#fb2c36] font-bold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 cursor-pointer transition-all text-xs"
                      >
                        <Undo2 className="w-4 h-4" />
                        Effectuer un remboursement
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ==================== TAB 2: ADVANCED DEPOSIT/CAUTION ==================== */}
              {activeSubSection === 'cautions' && (
                <div className="bg-white p-5 rounded-xl border border-[#e3e0dd] shadow-sm flex flex-col gap-4 animate-fade-in">
                  <div>
                    <h3 className="font-bold text-[#423d38] text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <Lock className="w-4 h-4 text-[#fe6e00]" /> Gestion des Cautions de Garantie
                    </h3>
                    <p className="text-[10px] text-[#797067] mt-0.5">Enregistrement, retenues pour dégâts matériels, et remboursements hors chiffre d'affaires.</p>
                  </div>

                  {/* Active or historical cautions for this reservation */}
                  {(() => {
                    const activeCautions = cautions.filter(c => c.reservationId === currentRes.id);
                    if (activeCautions.length === 0) {
                      return (
                        <div className="bg-amber-50/50 border border-amber-200/60 p-3.5 rounded-lg flex flex-col gap-3">
                          <div className="flex gap-2 text-amber-800">
                            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
                            <div className="flex flex-col gap-0.5">
                              <span className="font-extrabold text-[10px]">Aucune caution perçue</span>
                              <p className="text-[10px] text-amber-700/80 leading-relaxed">Il est recommandé de percevoir un dépôt de garantie pour les longs séjours.</p>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2 pt-1 border-t border-amber-200/40">
                            <div className="flex flex-col gap-1">
                              <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Montant à percevoir (F CFA) :</label>
                              <input 
                                type="number" 
                                value={cautionAmount}
                                onChange={(e) => setCautionAmount(e.target.value)}
                                className="bg-white border border-[#e3e0dd] rounded-md p-1.5 focus:outline-none focus:border-[#fe6e00] text-[#423d38] font-mono font-bold text-xs"
                              />
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                const amount = Number(cautionAmount) || 0;
                                if (amount <= 0) return alert('Veuillez spécifier un montant.');
                                const newC: Caution = {
                                  id: `CAU-${Math.floor(1000 + Math.random() * 9000)}`,
                                  reservationId: currentRes.id,
                                  amount,
                                  status: 'collected',
                                  retainedAmount: 0,
                                  reason: '',
                                  date: new Date().toISOString().replace('T', ' ').substring(0, 16)
                                };
                                const updated = [...cautions, newC];
                                updateCautionsInLocalStorage(updated);
                                triggerToast(`🔐 Caution de ${amount.toLocaleString()} F CFA perçue et consignée.`);
                                
                                // Dispatch Webhook
                                dispatchWebhook('caution.collected', {
                                  event: 'caution.collected',
                                  timestamp: new Date().toISOString(),
                                  data: newC
                                });
                              }}
                              className="bg-[#016630] hover:bg-[#025227] text-white font-extrabold py-2 px-3 rounded-lg text-[11px] cursor-pointer transition-colors text-center"
                            >
                              Enregistrer la perception
                            </button>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div className="flex flex-col gap-3">
                        {activeCautions.map(c => (
                          <div key={c.id} className="border border-[#e3e0dd] rounded-lg p-3 flex flex-col gap-3 bg-gray-50">
                            <div className="flex justify-between items-center border-b border-[#e3e0dd] pb-2">
                              <span className="font-mono font-bold text-[#fe6e00]">{c.id}</span>
                              <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                                c.status === 'collected' ? 'bg-[#dcfce7] text-[#016630]' :
                                c.status === 'restituted' ? 'bg-blue-100 text-blue-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {c.status === 'collected' ? 'En Consigne' :
                                 c.status === 'restituted' ? 'Restituée' : 'Retenue'}
                              </span>
                            </div>

                            <div className="flex justify-between text-xs font-mono">
                              <span className="text-[#797067]">Dépôt initial :</span>
                              <strong className="text-[#423d38]">{c.amount.toLocaleString()} F</strong>
                            </div>

                            {c.status === 'retained' && (
                              <div className="text-[10px] bg-red-50 p-2 rounded border border-red-200/50 text-red-800 flex flex-col gap-0.5">
                                <span className="font-bold font-sans">Retenue pour dégâts : {c.retainedAmount.toLocaleString()} F</span>
                                <span className="italic font-sans">Motif : {c.reason}</span>
                                <span className="font-bold text-blue-700 mt-1 font-sans">Reliquat remboursé : {(c.amount - c.retainedAmount).toLocaleString()} F</span>
                              </div>
                            )}

                            {c.status === 'restituted' && (
                              <div className="text-[10px] bg-blue-50 p-2 rounded border border-blue-200/50 text-blue-800 font-sans font-semibold">
                                ✓ Caution remboursée intégralement lors de l'état des lieux.
                              </div>
                            )}

                            {c.status === 'collected' && (
                              <div className="flex flex-col gap-2 pt-1 border-t border-[#e3e0dd]">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = cautions.map(item => {
                                      if (item.id === c.id) {
                                        return { ...item, status: 'restituted' as const };
                                      }
                                      return item;
                                    });
                                    updateCautionsInLocalStorage(updated);
                                    triggerToast(`✓ Caution ${c.id} restituée intégralement.`);
                                    
                                    dispatchWebhook('caution.restituted', {
                                      event: 'caution.restituted',
                                      timestamp: new Date().toISOString(),
                                      data: { ...c, status: 'restituted' }
                                    });
                                  }}
                                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1.5 rounded-lg text-[10px] cursor-pointer text-center"
                                >
                                  Restituer intégralement (R.A.S)
                                </button>

                                <div className="border-t border-[#e3e0dd] pt-2 mt-1 flex flex-col gap-1.5">
                                  <span className="font-extrabold text-[#797067] text-[9px] uppercase tracking-wider">Retenir partiellement (Dégâts) :</span>
                                  <div className="grid grid-cols-2 gap-1.5">
                                    <input 
                                      type="number" 
                                      placeholder="Montant (ex: 15000)"
                                      value={cautionRetainAmount}
                                      onChange={(e) => setCautionRetainAmount(e.target.value)}
                                      className="bg-white border border-[#e3e0dd] rounded p-1 text-xs font-mono font-bold"
                                    />
                                    <input 
                                      type="text" 
                                      placeholder="Raison (ex: Climatiseur cassé)"
                                      value={cautionRetainReason}
                                      onChange={(e) => setCautionRetainReason(e.target.value)}
                                      className="bg-white border border-[#e3e0dd] rounded p-1 text-xs"
                                    />
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const retAmt = Number(cautionRetainAmount) || 0;
                                      const reason = cautionRetainReason || 'Dégâts constatés lors de l\'état des lieux';
                                      if (retAmt <= 0 || retAmt > c.amount) {
                                        return alert(`Le montant de retenue doit être compris entre 1 et ${c.amount} F.`);
                                      }

                                      // 1. Update cautions state
                                      const updated = cautions.map(item => {
                                        if (item.id === c.id) {
                                          return {
                                            ...item,
                                            status: 'retained' as const,
                                            retainedAmount: retAmt,
                                            reason: reason
                                          };
                                        }
                                        return item;
                                      });
                                      updateCautionsInLocalStorage(updated);

                                      // 2. Automatically add damage fee to the reservation totalBill
                                      setReservations(prev => prev.map(res => {
                                        if (res.id === currentRes.id) {
                                          return {
                                            ...res,
                                            totalBill: res.totalBill + retAmt
                                          };
                                        }
                                        return res;
                                      }));

                                      triggerToast(`⚠️ Caution retenue à hauteur de ${retAmt.toLocaleString()} F CFA. Frais imputés au folio.`);
                                      setCautionRetainAmount('');
                                      setCautionRetainReason('');

                                      // 3. Dispatch Webhook
                                      dispatchWebhook('caution.retained', {
                                        event: 'caution.retained',
                                        timestamp: new Date().toISOString(),
                                        data: {
                                          id: c.id,
                                          reservationId: c.reservationId,
                                          totalAmount: c.amount,
                                          retainedAmount: retAmt,
                                          restitutionAmount: c.amount - retAmt,
                                          reason: reason
                                        }
                                      });
                                    }}
                                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-1.5 rounded-lg text-[10px] cursor-pointer text-center"
                                  >
                                    Confirmer la Retenue
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* ==================== TAB 3: FRACTIONAL / RECURRENT BILLING ==================== */}
              {activeSubSection === 'fractional' && (
                <div className="bg-white p-5 rounded-xl border border-[#e3e0dd] shadow-sm flex flex-col gap-4 animate-fade-in">
                  <div>
                    <h3 className="font-bold text-[#423d38] text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-[#fe6e00]" /> Facturation Fractionnée Récurrente
                    </h3>
                    <p className="text-[10px] text-[#797067] mt-0.5">Émettez des factures intermédiaires (hebdomadaires ou mensuelles) sans clore le séjour.</p>
                  </div>

                  {/* Fractional invoices list */}
                  {(() => {
                    const activePartials = partialInvoices.filter(pi => pi.reservationId === currentRes.id);
                    return (
                      <div className="flex flex-col gap-3">
                        <div className="bg-[#f3f4f6]/60 p-3.5 rounded-lg flex flex-col gap-2.5 border border-[#e3e0dd]">
                          <span className="font-extrabold text-[#797067] text-[9px] uppercase tracking-wider">Émettre une Facture Partielle :</span>
                          <div className="flex flex-col gap-2">
                            <div className="flex flex-col gap-0.5">
                              <label className="text-[9px] text-gray-500 font-bold uppercase">Période ou Intitulé :</label>
                              <input 
                                type="text" 
                                value={partialInvoiceLabel}
                                onChange={(e) => setPartialInvoiceLabel(e.target.value)}
                                className="bg-white border border-[#e3e0dd] rounded p-1.5 text-xs font-semibold text-gray-700"
                              />
                            </div>

                            <div className="flex flex-col gap-0.5">
                              <label className="text-[9px] text-gray-500 font-bold uppercase">Montant HT de la fraction (F CFA) :</label>
                              <input 
                                type="number" 
                                placeholder="Ex: 140000"
                                value={partialInvoiceAmount}
                                onChange={(e) => setPartialInvoiceAmount(e.target.value)}
                                className="bg-white border border-[#e3e0dd] rounded p-1.5 text-xs font-mono font-bold"
                              />
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                const amount = Number(partialInvoiceAmount) || 0;
                                if (amount <= 0) return alert('Veuillez spécifier un montant.');
                                
                                const newPI: PartialInvoice = {
                                  id: `FACT-PART-${Math.floor(100 + Math.random() * 900)}`,
                                  reservationId: currentRes.id,
                                  label: partialInvoiceLabel,
                                  amount,
                                  date: new Date().toISOString().replace('T', ' ').substring(0, 16),
                                  status: 'Dû'
                                };

                                const updated = [...partialInvoices, newPI];
                                updatePartialInvoicesInLocalStorage(updated);
                                triggerToast(`📅 Facture partielle "${partialInvoiceLabel}" émise avec succès.`);
                                setPartialInvoiceAmount('');
                                
                                // Dispatch Webhook
                                dispatchWebhook('invoice.partial_generated', {
                                  event: 'invoice.partial_generated',
                                  timestamp: new Date().toISOString(),
                                  data: newPI
                                });
                              }}
                              className="bg-[#fe6e00] hover:bg-[#ff6b00] text-white font-extrabold py-2 rounded-lg text-[10px] cursor-pointer text-center"
                            >
                              Générer et Enregistrer
                            </button>
                          </div>
                        </div>

                        {/* List display */}
                        {activePartials.length > 0 && (
                          <div className="flex flex-col gap-2">
                            <span className="font-extrabold text-[#797067] text-[9px] uppercase tracking-wider">Factures Partielles Émises :</span>
                            {activePartials.map(pi => (
                              <div key={pi.id} className="border border-[#e3e0dd] p-2.5 rounded-lg bg-gray-50 flex flex-col gap-2 text-xs">
                                <div className="flex justify-between items-center font-mono font-bold">
                                  <span className="text-gray-700">{pi.id}</span>
                                  <span className={`px-1.5 py-0.5 rounded text-[8px] uppercase ${pi.status === 'Payé' ? 'bg-[#dcfce7] text-[#016630]' : 'bg-red-100 text-red-700'}`}>
                                    {pi.status === 'Payé' ? 'QUITTANCÉE' : 'NON PAYÉE'}
                                  </span>
                                </div>

                                <div className="flex justify-between font-sans">
                                  <span className="text-[#797067] font-semibold">{pi.label}</span>
                                  <strong className="font-mono text-gray-800">{pi.amount.toLocaleString()} F</strong>
                                </div>

                                <div className="flex gap-1.5 pt-1 border-t border-dashed border-[#e3e0dd]">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      // If already selected, toggle off
                                      if (selectedPartialInvoiceId === pi.id) {
                                        setSelectedPartialInvoiceId('');
                                      } else {
                                        setSelectedPartialInvoiceId(pi.id);
                                        triggerToast(`Aperçu filtré pour la facture partielle ${pi.id}`);
                                      }
                                    }}
                                    className={`flex-1 font-bold py-1 rounded text-[9px] cursor-pointer text-center border ${
                                      selectedPartialInvoiceId === pi.id 
                                        ? 'bg-amber-100 border-amber-300 text-amber-700' 
                                        : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-100'
                                    }`}
                                  >
                                    {selectedPartialInvoiceId === pi.id ? '✓ Filtré (Invoice)' : '👁 Aperçu Facture'}
                                  </button>

                                  {pi.status === 'Dû' && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        // 1. Set partial status to paid
                                        const updated = partialInvoices.map(item => {
                                          if (item.id === pi.id) {
                                            return { ...item, status: 'Payé' as const };
                                          }
                                          return item;
                                        });
                                        updatePartialInvoicesInLocalStorage(updated);

                                        // 2. Register a payment transaction
                                        const newPId = `PAY-${String(payments.length + 1).padStart(3, '0')}`;
                                        const newP: Payment = {
                                          id: newPId,
                                          reservationId: currentRes.id,
                                          guestName: currentRes.guestName,
                                          amount: pi.amount,
                                          method: 'Virement',
                                          date: new Date().toISOString().replace('T', ' ').substring(0, 16),
                                          reference: `REFP-${pi.id}`
                                        };
                                        setPayments(prev => [newP, ...prev]);

                                        // 3. Update reservation paid amount
                                        setReservations(prev => prev.map(res => {
                                          if (res.id === currentRes.id) {
                                            return {
                                              ...res,
                                              paidAmount: res.paidAmount + pi.amount
                                            };
                                          }
                                          return res;
                                        }));

                                        triggerToast(`Facture partielle ${pi.id} quittancée (+${pi.amount.toLocaleString()} F)`);

                                        // 4. Webhook
                                        dispatchWebhook('invoice.partial_paid', {
                                          event: 'invoice.partial_paid',
                                          timestamp: new Date().toISOString(),
                                          data: {
                                            invoiceId: pi.id,
                                            amountPaid: pi.amount,
                                            reservationId: currentRes.id,
                                            guestName: currentRes.guestName
                                          }
                                        });
                                      }}
                                      className="flex-1 bg-[#016630] hover:bg-[#025227] text-white font-bold py-1 rounded text-[9px] cursor-pointer text-center"
                                    >
                                      Quittancer
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* ==================== TAB 4: PAYLINK & MOBILE MONEY SIMULATOR ==================== */}
              {activeSubSection === 'paylink' && (
                <div className="flex flex-col gap-6 animate-fade-in">
                  {/* GENERATE SECURE PAYMENT LINKS */}
                  <div className="bg-white p-5 rounded-xl border border-[#e3e0dd] shadow-sm flex flex-col gap-3">
                    <h3 className="font-bold text-[#423d38] text-xs uppercase tracking-wider border-b border-[#e3e0dd] pb-1.5 flex items-center gap-1.5">
                      <ExternalLink className="w-4 h-4 text-[#fe6e00]" /> Liens de Paiement Résidence
                    </h3>
                    
                    <div className="flex flex-col gap-2.5">
                      <div className="bg-[#f3f4f6] p-2.5 rounded border border-gray-200 font-mono text-[10px] break-all select-all flex flex-col gap-1">
                        <span className="text-[8px] font-bold text-gray-400 font-sans uppercase">URL Générée à envoyer :</span>
                        <span>https://pay.brunch-bouake.ci/folio/{currentRes.id}?amount={Math.max(0, displayedTotal - currentRes.paidAmount)}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const link = `https://pay.brunch-bouake.ci/folio/${currentRes.id}?amount=${Math.max(0, displayedTotal - currentRes.paidAmount)}`;
                            navigator.clipboard.writeText(link);
                            triggerToast("📋 Lien de paiement copié dans le presse-papiers !");
                          }}
                          className="bg-gray-100 hover:bg-gray-200 text-[#423d38] font-bold py-2 rounded-lg text-[10px] border border-gray-300 cursor-pointer flex items-center justify-center gap-1"
                        >
                          <Copy className="w-3.5 h-3.5 text-gray-500" /> Copier le Lien
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const remaining = Math.max(0, displayedTotal - currentRes.paidAmount);
                            const text = `Bonjour ${currentRes.guestName}, voici le lien de règlement sécurisé pour votre séjour à la Résidence (Chambre ${currentRes.roomNumber}). Montant dû : ${remaining.toLocaleString()} F CFA. Cliquez ici pour régler via Wave/Mobile Money : https://pay.brunch-bouake.ci/folio/${currentRes.id}?amount=${remaining}`;
                            const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
                            window.open(whatsappUrl, '_blank');
                            triggerToast("📱 Redirection WhatsApp initiée !");
                          }}
                          className="bg-[#25D366] hover:bg-[#20ba56] text-white font-bold py-2 rounded-lg text-[10px] cursor-pointer flex items-center justify-center gap-1"
                        >
                          <Share2 className="w-3.5 h-3.5" /> Partager WhatsApp
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* WEST-AFRICAN LOCAL MOBILE MONEY ENCAISSEMENT DIRECT */}
                  <div className="bg-white p-5 rounded-xl border border-[#e3e0dd] shadow-sm flex flex-col gap-3 relative overflow-hidden">
                    <h3 className="font-bold text-[#423d38] text-xs uppercase tracking-wider border-b border-[#e3e0dd] pb-1.5 flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-[#fe6e00]" /> Encaissement Mobile Money Direct
                    </h3>

                    {isMomoProcessing ? (
                      <div className="py-6 flex flex-col items-center justify-center gap-3 text-center animate-pulse">
                        <RefreshCw className="w-8 h-8 text-[#fe6e00] animate-spin" />
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-[#423d38] text-xs">Simulateur Mobile Money Actif</span>
                          <p className="text-[10px] text-[#797067] max-w-xs">
                            Envoi de la demande de débit USSD push au téléphone du client {momoPhone}... Veuillez valider avec votre code PIN secret sur votre mobile.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex flex-col gap-1">
                            <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Opérateur local :</label>
                            <select
                              value={momoOperator}
                              onChange={(e) => setMomoOperator(e.target.value as any)}
                              className="bg-[#f3f4f6] border border-[#e3e0dd] rounded p-1.5 focus:outline-none focus:border-[#fe6e00] text-[#423d38] font-bold text-xs"
                            >
                              <option value="Wave">Wave 🌊</option>
                              <option value="Orange Money">Orange Money 🍊</option>
                              <option value="MTN Momo">MTN MoMo 🟡</option>
                              <option value="Moov Money">Moov Money 🔵</option>
                            </select>
                          </div>

                          <div className="flex flex-col gap-1">
                            <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">N° de téléphone client :</label>
                            <input 
                              type="text" 
                              value={momoPhone}
                              onChange={(e) => setMomoPhone(e.target.value)}
                              className="bg-[#f3f4f6] border border-[#e3e0dd] rounded p-1.5 focus:outline-none focus:border-[#fe6e00] text-[#423d38] font-bold text-xs font-mono"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col gap-1">
                          <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Montant à encaisser :</label>
                          <input 
                            type="number" 
                            placeholder="Montant du règlement"
                            value={paymentAmount || String(Math.max(0, displayedTotal - currentRes.paidAmount))}
                            onChange={(e) => setPaymentAmount(e.target.value)}
                            className="bg-[#f3f4f6] border border-[#e3e0dd] rounded p-1.5 focus:outline-none focus:border-[#fe6e00] text-[#423d38] font-bold font-mono text-xs"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            const parsed = Number(paymentAmount) || Math.max(0, displayedTotal - currentRes.paidAmount);
                            if (parsed <= 0) return alert('Le montant doit être supérieur à 0.');
                            
                            setIsMomoProcessing(true);
                            setTimeout(() => {
                              setIsMomoProcessing(false);
                              
                              // Create Payment entry
                              const newPId = `PAY-MOMO-${Math.floor(100 + Math.random() * 900)}`;
                              const momoRef = `MM-${momoOperator.toUpperCase().substring(0,3)}-${Math.floor(100000 + Math.random() * 900000)}`;
                              
                              const newPayment: Payment = {
                                id: newPId,
                                reservationId: currentRes.id,
                                guestName: currentRes.guestName,
                                amount: parsed,
                                method: momoOperator as any,
                                date: new Date().toISOString().replace('T', ' ').substring(0, 16),
                                reference: momoRef
                              };

                              setPayments(prev => [newPayment, ...prev]);

                              setReservations(prev => prev.map(res => {
                                if (res.id === currentRes.id) {
                                  return { ...res, paidAmount: res.paidAmount + parsed };
                                }
                                return res;
                              }));

                              triggerToast(`📲 Encaissement direct ${momoOperator} de ${parsed.toLocaleString()} F CFA effectué avec succès !`);
                              setPaymentAmount('');

                              // Trigger webhook
                              dispatchWebhook('payment.momo_success', {
                                event: 'payment.momo_success',
                                timestamp: new Date().toISOString(),
                                data: {
                                  paymentId: newPId,
                                  reservationId: currentRes.id,
                                  guestName: currentRes.guestName,
                                  phoneNumber: momoPhone,
                                  operator: momoOperator,
                                  amount: parsed,
                                  reference: momoRef
                                }
                              });
                            }, 2200);
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-2 rounded-lg text-[10px] cursor-pointer text-center"
                        >
                          Déclencher l'encaissement direct
                        </button>
                      </div>
                    )}
                  </div>

                  {/* REAL-TIME SIMULATED WEBHOOK EVENT LOGS */}
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-xl border border-gray-800 flex flex-col gap-2.5 font-mono text-[9px] max-h-[190px] overflow-y-auto">
                    <div className="flex justify-between items-center border-b border-gray-800 pb-1.5 text-gray-400 font-sans">
                      <span className="font-extrabold flex items-center gap-1.5 uppercase tracking-wider text-[8px]">
                        <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" /> Logs de Webhooks (Dolibarr)
                      </span>
                      {webhookLogs.length > 0 && (
                        <button 
                          onClick={() => {
                            setWebhookLogs([]);
                            localStorage.removeItem('bouake_pms_webhook_logs');
                          }}
                          className="text-gray-500 hover:text-white transition-colors text-[8px] uppercase tracking-wider underline cursor-pointer"
                        >
                          Effacer
                        </button>
                      )}
                    </div>

                    {webhookLogs.length === 0 ? (
                      <span className="text-gray-500 italic py-2 font-sans">Aucun événement webhook n'a été déclenché pour le moment.</span>
                    ) : (
                      <div className="flex flex-col gap-2.5">
                        {webhookLogs.slice(0, 5).map(log => (
                          <div key={log.id} className="border-l border-emerald-500 pl-2 flex flex-col gap-0.5">
                            <span className="text-[#fe6e00] font-bold">[{log.timestamp}] POST {log.event}</span>
                            <span className="text-gray-400">Endpoint: {log.url}</span>
                            <pre className="text-emerald-400/90 text-[8px] whitespace-pre-wrap mt-0.5 bg-black/30 p-1 rounded max-h-[80px] overflow-y-auto">
                              {log.payload}
                            </pre>
                            <span className="text-gray-500">Status: <strong className="text-emerald-400">{log.status} OK</strong></span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
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
                    <span className="text-[#797067] font-bold font-sans text-[10px] uppercase border-b border-[#e3e0dd] pb-1.5 tracking-wider">
                      {selectedPartialInvoiceId ? `Détail de la Facture Fractionnée : ${selectedPartialInvoiceId}` : "Détail des lignes de facturation"}
                    </span>
                    
                    {selectedPartialInvoiceId ? (
                      (() => {
                        const pi = partialInvoices.find(p => p.id === selectedPartialInvoiceId);
                        if (!pi) return null;
                        return (
                          <div className="flex justify-between items-start py-2 border-b border-dashed border-[#e3e0dd]">
                            <div className="flex flex-col">
                              <span>Hébergement partiel - {pi.label}</span>
                              <span className="text-[10px] text-[#797067] font-sans">Référence : {pi.id} • Date d'émission : {pi.date}</span>
                            </div>
                            <span className="font-bold text-[#423d38] font-mono">{pi.amount.toLocaleString()} F CFA</span>
                          </div>
                        );
                      })()
                    ) : (
                      <>
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
                      </>
                    )}
                  </div>

                  {/* INVOICE LEDGER TOTAL CALCULATIONS */}
                  {(() => {
                    const pi = selectedPartialInvoiceId ? partialInvoices.find(p => p.id === selectedPartialInvoiceId) : null;
                    const subtotal = pi ? pi.amount : (baseRoomTotal + ordersTotal + customExtrasAmount);
                    const taxes = pi ? 0 : defaultTaxesTotal;
                    const totalTTC = pi ? pi.amount : displayedTotal;
                    const paid = pi ? (pi.status === 'Payé' ? pi.amount : 0) : currentRes.paidAmount;
                    const due = Math.max(0, totalTTC - paid);

                    return (
                      <div className="flex flex-col gap-2 border-t border-[#e3e0dd] pt-4 max-w-xs ml-auto w-full text-right font-sans">
                        <div className="flex justify-between font-bold text-[#797067] text-[11px]">
                          <span>Sous-total HT :</span>
                          <span className="text-[#423d38] font-mono">{subtotal.toLocaleString()} F</span>
                        </div>
                        <div className="flex justify-between font-bold text-[#797067] text-[11px]">
                          <span>Taxes totales (Séjour + TVA) :</span>
                          <span className="text-[#423d38] font-mono">{taxes.toLocaleString()} F</span>
                        </div>
                        <div className="h-px bg-dashed bg-[#e3e0dd] my-1"></div>
                        <div className="flex justify-between font-black text-[#423d38] text-sm">
                          <span>Montant Total TTC :</span>
                          <span className="text-[#fe6e00] font-mono">{totalTTC.toLocaleString()} F CFA</span>
                        </div>
                        <div className="flex justify-between font-bold text-[#016630] text-[11px] bg-[#dcfce7]/40 px-2 py-0.5 rounded">
                          <span>Total déjà payé :</span>
                          <span className="font-mono">{paid.toLocaleString()} F</span>
                        </div>
                        <div className="flex justify-between font-bold text-[#fb2c36] text-[11px] bg-[#fef2f2] px-2 py-0.5 rounded">
                          <span>Solde restant dû :</span>
                          <span className="font-mono">{due.toLocaleString()} F</span>
                        </div>
                      </div>
                    );
                  })()}

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
