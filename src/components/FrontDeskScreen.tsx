import React, { useState } from 'react';
import { Room, Reservation, Payment } from '../types';
import { 
  Users, 
  Calendar, 
  Search, 
  Coffee, 
  LogOut, 
  Sparkles, 
  Wrench, 
  Clock, 
  Plus, 
  CheckCircle,
  TrendingUp,
  UserCheck,
  Settings,
  BarChart2,
  FileText,
  RefreshCw
} from 'lucide-react';

interface FrontDeskScreenProps {
  rooms: Room[];
  reservations: Reservation[];
  payments: Payment[];
  setRooms: React.Dispatch<React.SetStateAction<Room[]>>;
  setReservations: React.Dispatch<React.SetStateAction<Reservation[]>>;
  setPayments: React.Dispatch<React.SetStateAction<Payment[]>>;
  triggerToast: (msg: string) => void;
  setActiveTab: (tab: any) => void;
  setSelectedCheckInReservationId: (id: string | null) => void;
}

export const FrontDeskScreen: React.FC<FrontDeskScreenProps> = ({
  rooms,
  reservations,
  payments,
  setRooms,
  setReservations,
  setPayments,
  triggerToast,
  setActiveTab,
  setSelectedCheckInReservationId
}) => {
  const todayStr = '2026-07-11';

  // Search filter state for reservation searches
  const [searchQuery, setSearchQuery] = useState('');

  // Active stay modal states for adding extras
  const [selectedStayIdForExtras, setSelectedStayIdForExtras] = useState<string | null>(null);
  const [extraItemName, setExtraItemName] = useState('Brunch Signature');
  const [extraAmount, setExtraAmount] = useState('12000');
  const [extraPaymentMethod, setExtraPaymentMethod] = useState<'Chambre' | 'Espèces' | 'Orange Money' | 'MTN Momo' | 'Carte'>('Chambre');

  // Checkout modal states
  const [selectedStayForCheckout, setSelectedStayForCheckout] = useState<Reservation | null>(null);
  const [checkoutPaymentMethod, setCheckoutPaymentMethod] = useState<'Espèces' | 'Orange Money' | 'MTN Momo' | 'Carte Bancaire'>('Espèces');

  // Sub-navigation active tab for Front Desk
  const [activeTabFD, setActiveTabFD] = useState<'pipeline' | 'stats' | 'historique'>('pipeline');

  // "Changer / Modifier" Modal States
  const [selectedResForChange, setSelectedResForChange] = useState<Reservation | null>(null);
  const [changeRoomNumber, setChangeRoomNumber] = useState('');
  const [changeCheckIn, setChangeCheckIn] = useState('');
  const [changeCheckOut, setChangeCheckOut] = useState('');
  const [changeGuestName, setChangeGuestName] = useState('');
  const [changeGuestEmail, setChangeGuestEmail] = useState('');
  const [changeBookingSource, setChangeBookingSource] = useState('Direct');
  const [changeChannelName, setChangeChannelName] = useState('Site Direct');
  const [changeOriginCountry, setChangeOriginCountry] = useState("Côte d'Ivoire");
  const [changePaidAmount, setChangePaidAmount] = useState<number>(0);

  // Filter reservations based on search query
  const filteredReservations = reservations.filter(res => {
    const query = searchQuery.toLowerCase();
    return (
      res.guestName.toLowerCase().includes(query) ||
      res.id.toLowerCase().includes(query) ||
      res.roomNumber.toLowerCase().includes(query)
    );
  });

  // Stage 1 & 2: Reservas awaiting arrival
  const upcomingReservations = filteredReservations.filter(res => res.status === 'Confirmé');

  // Stage 3: Séjour en cours (Active stays)
  const activeStays = filteredReservations.filter(res => res.status === 'En Cours');

  // Housekeeping: Dirty rooms
  const dirtyRooms = rooms.filter(r => r.status === 'Sale');
  const cleanRooms = rooms.filter(r => r.status === 'Libre');
  const maintenanceRooms = rooms.filter(r => r.status === 'Maintenance');

  // Action: Launch pre-filled Check-In
  const handleStartCheckIn = (resId: string) => {
    setSelectedCheckInReservationId(resId);
    setActiveTab('checkin');
    triggerToast(`Formulaire de Check-In prérempli pour le dossier ${resId}.`);
  };

  // Action: Save quick extra order (Brunch / Drinks / Consommations)
  const handleAddExtra = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStayIdForExtras) return;

    const amountNum = Number(extraAmount) || 0;
    if (amountNum <= 0) {
      alert("Veuillez renseigner un montant valide.");
      return;
    }

    // 1. Find reservation
    const targetRes = reservations.find(r => r.id === selectedStayIdForExtras);
    if (!targetRes) return;

    // 2. If charged to room, increase total bill. If paid cash, register as payment
    if (extraPaymentMethod === 'Chambre') {
      setReservations(prev => prev.map(res => {
        if (res.id === selectedStayIdForExtras) {
          return {
            ...res,
            totalBill: res.totalBill + amountNum,
            notes: res.notes ? `${res.notes}\n+ Extra: ${extraItemName} (${amountNum.toLocaleString()} F)` : `+ Extra: ${extraItemName} (${amountNum.toLocaleString()} F)`
          };
        }
        return res;
      }));
      triggerToast(`Extra "${extraItemName}" d'un montant de ${amountNum.toLocaleString()} FCFA imputé sur le Folio de la chambre ${targetRes.roomNumber} !`);
    } else {
      // Direct payment
      const methodLabel = extraPaymentMethod === 'Orange Money' || extraPaymentMethod === 'MTN Momo' ? extraPaymentMethod : 'Espèces';
      const newPay: Payment = {
        id: `PAY-${String(payments.length + 1).padStart(3, '0')}`,
        reservationId: targetRes.id,
        guestName: targetRes.guestName,
        amount: amountNum,
        method: methodLabel as any,
        date: `${todayStr} 18:00`,
        reference: `EXTR-${Math.floor(100000 + Math.random() * 900000)}`
      };
      setPayments(prev => [newPay, ...prev]);

      setReservations(prev => prev.map(res => {
        if (res.id === selectedStayIdForExtras) {
          return {
            ...res,
            totalBill: res.totalBill + amountNum,
            paidAmount: res.paidAmount + amountNum,
            notes: res.notes ? `${res.notes}\n+ Extra Payé: ${extraItemName} (${amountNum.toLocaleString()} F)` : `+ Extra Payé: ${extraItemName} (${amountNum.toLocaleString()} F)`
          };
        }
        return res;
      }));
      triggerToast(`Extra "${extraItemName}" de ${amountNum.toLocaleString()} F payé directement via ${extraPaymentMethod} !`);
    }

    // Reset state
    setSelectedStayIdForExtras(null);
    setExtraAmount('12000');
    setExtraItemName('Brunch Signature');
  };

  // Action: Open checkout simulation
  const handleOpenCheckout = (res: Reservation) => {
    setSelectedStayForCheckout(res);
  };

  // Action: Complete check-out, release room, and send to housekeeping
  const handleConfirmCheckout = () => {
    if (!selectedStayForCheckout) return;

    const resId = selectedStayForCheckout.id;
    const roomNo = selectedStayForCheckout.roomNumber;
    const pendingBalance = selectedStayForCheckout.totalBill - selectedStayForCheckout.paidAmount;

    // 1. Register payment for outstanding balance if any
    if (pendingBalance > 0) {
      const newPay: Payment = {
        id: `PAY-${String(payments.length + 1).padStart(3, '0')}`,
        reservationId: resId,
        guestName: selectedStayForCheckout.guestName,
        amount: pendingBalance,
        method: checkoutPaymentMethod,
        date: `${todayStr} 18:30`,
        reference: `COUT-${Math.floor(100000 + Math.random() * 900000)}`
      };
      setPayments(prev => [newPay, ...prev]);
    }

    // 2. Set Reservation status to "Terminé" and set paidAmount = totalBill
    setReservations(prev => prev.map(res => {
      if (res.id === resId) {
        return {
          ...res,
          status: 'Terminé',
          paidAmount: res.totalBill
        };
      }
      return res;
    }));

    // 3. Set Room status to "Sale" (Dirty)
    setRooms(prev => prev.map(r => r.id === roomNo ? { ...r, status: 'Sale' } : r));

    triggerToast(`Check-Out effectué avec succès ! Chambre CH ${roomNo} libérée et ENVOYÉE AU MÉNAGE.`);
    setSelectedStayForCheckout(null);
  };

  // Action: Mark Room Clean
  const handleMarkClean = (roomId: string) => {
    setRooms(prev => prev.map(r => r.id === roomId ? { ...r, status: 'Libre' } : r));
    triggerToast(`Chambre CH ${roomId} nettoyée et prête pour le prochain check-in.`);
  };

  // Action: Open reservation modification modal and pre-populate fields
  const handleOpenChangeModal = (res: Reservation) => {
    setSelectedResForChange(res);
    setChangeRoomNumber(res.roomNumber);
    setChangeCheckIn(res.checkIn);
    setChangeCheckOut(res.checkOut);
    setChangeGuestName(res.guestName);
    setChangeGuestEmail(res.guestEmail);
    setChangeBookingSource(res.bookingSource || 'Direct');
    setChangeChannelName(res.channelName || 'Site Direct');
    setChangeOriginCountry(res.originCountry || "Côte d'Ivoire");
    setChangePaidAmount(res.paidAmount);
  };

  // Action: Save modified reservation and update room status if room changed
  const handleSaveModifiedReservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResForChange) return;

    const originalRoom = selectedResForChange.roomNumber;
    const originalStatus = selectedResForChange.status;

    // If reservation is active ('En Cours'), and we are changing room number, we must change room status
    if (originalStatus === 'En Cours' && changeRoomNumber !== originalRoom) {
      setRooms(prev => prev.map(r => {
        if (r.id === originalRoom) {
          return { ...r, status: 'Libre' };
        }
        if (r.id === changeRoomNumber) {
          return { ...r, status: 'Occupé' };
        }
        return r;
      }));
    }

    setReservations(prev => prev.map(res => {
      if (res.id === selectedResForChange.id) {
        return {
          ...res,
          roomNumber: changeRoomNumber,
          checkIn: changeCheckIn,
          checkOut: changeCheckOut,
          guestName: changeGuestName,
          guestEmail: changeGuestEmail,
          bookingSource: changeBookingSource,
          channelName: changeChannelName,
          originCountry: changeOriginCountry,
          paidAmount: Number(changePaidAmount) || 0
        };
      }
      return res;
    }));

    triggerToast(`Dossier de réservation ${selectedResForChange.id} modifié avec succès !`);
    setSelectedResForChange(null);
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in" id="frontdesk_screen">
      
      {/* SCREEN TOP HEADER */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-[#e3e0dd] pb-4">
        <div>
          <div className="flex items-center gap-2 text-[#fe6e00]">
            <TrendingUp className="w-5 h-5" />
            <span className="text-[10px] uppercase font-bold tracking-widest bg-[#fe6e00]/10 px-2.5 py-1 rounded-md">PMS Central Hub</span>
          </div>
          <h2 className="text-xl font-bold text-[#423d38] mt-1 tracking-tight">Front Desk & Parcours Client</h2>
          <p className="text-xs text-[#797067]">Le cockpit de gestion de l'accueil de l'arrivée au départ des clients de l'hôtel.</p>
        </div>

        {/* Global Pipeline Stats Banner */}
        <div className="flex flex-wrap gap-2 text-[11px] font-semibold text-[#423d38]">
          <button 
            onClick={() => { setActiveTabFD('pipeline'); }}
            className={`bg-[#fe6e00]/10 border border-[#fe6e00]/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95 transition-all duration-150 ${activeTabFD === 'pipeline' ? 'ring-2 ring-[#fe6e00]' : ''}`}
          >
            <Calendar className="w-3.5 h-3.5 text-[#fe6e00]" />
            <span>{upcomingReservations.length} Réservation(s)</span>
          </button>
          <button 
            onClick={() => { setActiveTabFD('pipeline'); }}
            className={`bg-[#00c758]/10 border border-[#00c758]/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95 transition-all duration-150 ${activeTabFD === 'pipeline' ? 'ring-2 ring-[#00c758]' : ''}`}
          >
            <Users className="w-3.5 h-3.5 text-[#00c758]" />
            <span>{activeStays.length} En Séjour</span>
          </button>
          <button 
            onClick={() => setActiveTab('housekeeping')}
            className="bg-[#fb2c36]/10 border border-[#fb2c36]/20 px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95 transition-all duration-150"
            title="Aller à la page Ménage & Entretien"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#fb2c36]" />
            <span>{dirtyRooms.length} À nettoyer</span>
          </button>
        </div>
      </div>

      {/* FRONT DESK SUB-NAVIGATION TABS */}
      <div className="flex bg-[#edebe9] p-1.5 rounded-xl w-full sm:w-fit self-start gap-1">
        <button
          onClick={() => setActiveTabFD('pipeline')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs transition-all cursor-pointer ${
            activeTabFD === 'pipeline'
              ? 'bg-[#fe6e00] text-white shadow-sm'
              : 'text-[#797067] hover:text-[#423d38] hover:bg-white/40'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Tableau de Bord / Pipeline Actif</span>
        </button>
        <button
          onClick={() => setActiveTabFD('stats')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs transition-all cursor-pointer ${
            activeTabFD === 'stats'
              ? 'bg-[#fe6e00] text-white shadow-sm'
              : 'text-[#797067] hover:text-[#423d38] hover:bg-white/40'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span>Statistiques Express</span>
        </button>
        <button
          onClick={() => setActiveTabFD('historique')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-xs transition-all cursor-pointer ${
            activeTabFD === 'historique'
              ? 'bg-[#fe6e00] text-white shadow-sm'
              : 'text-[#797067] hover:text-[#423d38] hover:bg-white/40'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Historique des Départs</span>
        </button>
      </div>

      {/* FILTER SEARCH BAR */}
      {activeTabFD !== 'stats' && (
        <div className="bg-white p-4 rounded-xl border border-[#e3e0dd] shadow-xs flex items-center gap-3">
          <div className="bg-[#f3f4f6] px-3 py-2 rounded-lg flex-1 flex items-center gap-2 border border-[#e3e0dd] focus-within:border-[#fe6e00]">
            <Search className="w-4 h-4 text-[#797067]" />
            <input
              type="text"
              placeholder={activeTabFD === 'historique' ? "Rechercher un départ archivé par nom, chambre..." : "Rechercher par nom de client, numéro de chambre, référence de réservation..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent flex-1 text-xs text-[#423d38] focus:outline-none"
            />
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-[#797067] hover:text-[#423d38] font-bold"
            >
              Réinitialiser
            </button>
          )}
        </div>
      )}

      {/* THREE-COLUMN PIPELINE BOARD */}
      {activeTabFD === 'pipeline' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* COLUMN 1: ARRIVÉES & DOSSIERS (STEPS 1-5) */}
          <div className="bg-[#edebe9]/40 border border-[#e3e0dd] rounded-xl p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#e3e0dd] pb-2">
              <div className="flex items-center gap-2 text-[#423d38]">
                <Calendar className="w-4 h-4 text-[#fe6e00]" />
                <span className="font-bold text-xs uppercase tracking-wider">1. Réservation ➔ Arrivée</span>
              </div>
              <span className="bg-[#fe6e00] text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                {upcomingReservations.length}
              </span>
            </div>
            
            <div className="flex flex-col gap-3 overflow-y-auto max-h-[500px] pr-1">
              {upcomingReservations.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-lg border border-dashed border-[#e3e0dd] flex flex-col items-center gap-2">
                  <Clock className="w-6 h-6 text-[#797067] opacity-60" />
                  <span className="text-[11px] text-[#797067]">Aucune réservation en attente.</span>
                  <button
                    onClick={() => setActiveTab('reservations')}
                    className="mt-1 text-[10px] text-[#fe6e00] font-bold hover:underline cursor-pointer"
                  >
                    + Créer une réservation
                  </button>
                </div>
              ) : (
                upcomingReservations.map(res => {
                  const room = rooms.find(r => r.id === res.roomNumber);
                  return (
                    <div key={res.id} className="bg-white p-4 rounded-xl border border-[#e3e0dd] shadow-xs hover:border-[#fe6e00] hover:shadow-md transition-all flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[9px] font-mono text-[#fe6e00] font-bold uppercase bg-[#fe6e00]/10 px-1.5 py-0.5 rounded-md">
                            {res.id}
                          </span>
                          <h4 className="font-bold text-[#423d38] text-xs mt-1.5">{res.guestName}</h4>
                          <span className="text-[10px] text-[#797067] block">{res.guestEmail}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-extrabold text-[#423d38] text-[11px] bg-[#f3f4f6] px-2 py-1 rounded-md border border-[#e3e0dd] block">
                            CH {res.roomNumber}
                          </span>
                          <span className="text-[9px] text-[#797067] font-semibold">{room?.type}</span>
                        </div>
                      </div>

                      <div className="h-px bg-[#f3f4f6]"></div>

                      <div className="grid grid-cols-2 gap-1 text-[10px] text-[#423d38]">
                        <div>
                          <span className="text-[#797067] uppercase text-[8px] font-bold block">Séjour</span>
                          <span className="font-semibold">{res.checkIn} ➔ {res.checkOut}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[#797067] uppercase text-[8px] font-bold block">Facture Estimée</span>
                          <span className="font-bold">{res.totalBill.toLocaleString()} F</span>
                        </div>
                      </div>

                      <div className="flex justify-between gap-1.5 mt-1 border-t border-[#f3f4f6] pt-2.5">
                        <button
                          onClick={() => handleOpenChangeModal(res)}
                          className="bg-[#fcfaf7] border border-[#e3e0dd] hover:bg-gray-100 text-[#423d38] text-[10px] font-bold py-1.5 px-2.5 rounded-md flex items-center justify-center gap-1 transition-all cursor-pointer shadow-xs"
                          title="Changer de chambre / Modifier les informations"
                        >
                          <Settings className="w-3.5 h-3.5 text-[#797067]" />
                          Modifier
                        </button>
                        <button
                          onClick={() => handleStartCheckIn(res.id)}
                          className="flex-1 bg-[#fe6e00] hover:bg-[#ff6b00] text-white text-[10px] font-bold py-1.5 px-3 rounded-md flex items-center justify-center gap-1 transition-all cursor-pointer shadow-sm"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          Check-In
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Quick Walk-In Button */}
            <button
              onClick={() => { setSelectedCheckInReservationId(null); setActiveTab('checkin'); }}
              className="w-full bg-[#423d38] hover:bg-[#423d38]/90 text-white font-bold py-2 rounded-lg text-[11px] flex items-center justify-center gap-1.5 transition-all mt-auto cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Enregistrer Client Direct (Walk-In)
            </button>
          </div>

          {/* COLUMN 2: SÉJOURS EN COURS (STEPS 6-11) */}
          <div className="bg-[#edebe9]/40 border border-[#e3e0dd] rounded-xl p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#e3e0dd] pb-2">
              <div className="flex items-center gap-2 text-[#423d38]">
                <Users className="w-4 h-4 text-[#00c758]" />
                <span className="font-bold text-xs uppercase tracking-wider">2. Séjours & Consommations</span>
              </div>
              <span className="bg-[#00c758] text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                {activeStays.length}
              </span>
            </div>

            <div className="flex flex-col gap-3 overflow-y-auto max-h-[500px] pr-1">
              {activeStays.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-lg border border-dashed border-[#e3e0dd] flex flex-col items-center gap-2">
                  <Coffee className="w-6 h-6 text-[#797067] opacity-60" />
                  <span className="text-[11px] text-[#797067]">Aucun séjour actif en ce moment.</span>
                </div>
              ) : (
                activeStays.map(stay => {
                  const pendingBalance = stay.totalBill - stay.paidAmount;
                  const roomObj = rooms.find(r => r.id === stay.roomNumber);
                  return (
                    <div key={stay.id} className="bg-white p-4 rounded-xl border border-[#e3e0dd] shadow-xs flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[9px] font-bold text-[#00c758] uppercase bg-[#00c758]/10 px-1.5 py-0.5 rounded-md">
                            En Séjour • CH {stay.roomNumber}
                          </span>
                          <h4 className="font-bold text-[#423d38] text-xs mt-1.5">{stay.guestName}</h4>
                          <span className="text-[10px] text-[#797067] block">Départ prévu: {stay.checkOut}</span>
                        </div>
                        
                        <div className="flex flex-col items-end gap-2">
                          <span className="text-[9px] font-bold text-white bg-[#00c758] px-2 py-0.5 rounded-sm">
                            {roomObj?.status || 'Occupé'}
                          </span>
                          <button
                            onClick={() => handleOpenChangeModal(stay)}
                            className="bg-gray-100 hover:bg-gray-200 text-[#423d38] p-1.5 rounded-md border border-[#e3e0dd] transition-all cursor-pointer shadow-xs"
                            title="Changer de chambre / Modifier le séjour"
                          >
                            <Settings className="w-3.5 h-3.5 text-[#797067]" />
                          </button>
                        </div>
                      </div>

                      <div className="bg-[#edebe9]/40 p-2.5 rounded-lg border border-[#e3e0dd] flex flex-col gap-1.5">
                        <div className="flex justify-between text-[10px] text-[#423d38]">
                          <span>Facture totale (Folio):</span>
                          <span className="font-bold">{stay.totalBill.toLocaleString()} F</span>
                        </div>
                        <div className="flex justify-between text-[10px] text-[#00c758] font-semibold">
                          <span>Acomptes versés :</span>
                          <span>{stay.paidAmount.toLocaleString()} F</span>
                        </div>
                        <div className="h-px bg-[#e3e0dd]"></div>
                        <div className="flex justify-between text-[11px] font-bold">
                          <span>Solde dû :</span>
                          <span className={pendingBalance > 0 ? "text-[#fb2c36]" : "text-[#00c758]"}>
                            {pendingBalance.toLocaleString()} FCFA
                          </span>
                        </div>
                      </div>

                      {/* Guest Journey Actions */}
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <button
                          onClick={() => setSelectedStayIdForExtras(stay.id)}
                          className="bg-white border border-[#e3e0dd] hover:bg-[#fe6e00]/5 hover:border-[#fe6e00]/40 text-[#423d38] hover:text-[#fe6e00] font-bold py-1.5 px-2 rounded-md flex items-center justify-center gap-1 transition-all cursor-pointer text-[10px]"
                        >
                          <Coffee className="w-3 h-3" />
                          + Consommation
                        </button>

                        <button
                          onClick={() => handleOpenCheckout(stay)}
                          className="bg-[#fb2c36] hover:bg-[#d91620] text-white font-bold py-1.5 px-2 rounded-md flex items-center justify-center gap-1 transition-all cursor-pointer text-[10px] shadow-sm"
                        >
                          <LogOut className="w-3 h-3" />
                          Facture & Départ
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* COLUMN 3: MÉNAGE & RETOUR EN VENTE (STEPS 12-13) */}
          <div className="bg-[#edebe9]/40 border border-[#e3e0dd] rounded-xl p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[#e3e0dd] pb-2">
              <div className="flex items-center gap-2 text-[#423d38]">
                <Sparkles className="w-4 h-4 text-[#fb2c36]" />
                <span className="font-bold text-xs uppercase tracking-wider">3. Entretien & Retour</span>
              </div>
              <span className="bg-[#fb2c36] text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                {dirtyRooms.length + maintenanceRooms.length}
              </span>
            </div>

            <div className="flex flex-col gap-3 overflow-y-auto max-h-[500px] pr-1">
              
              {/* Dirty Rooms Section */}
              <div className="flex flex-col gap-2">
                <span className="text-[9px] font-bold text-[#797067] uppercase tracking-wider block">Chambres Sales (Ménage requis) :</span>
                {dirtyRooms.length === 0 ? (
                  <div className="text-center py-6 bg-white rounded-lg border border-dashed border-[#e3e0dd] text-[#797067] text-[10px] italic">
                    Toutes les chambres libérées sont propres et prêtes !
                  </div>
                ) : (
                  dirtyRooms.map(rm => (
                    <div key={rm.id} className="bg-white p-3 rounded-lg border border-[#e3e0dd] shadow-xs flex items-center justify-between gap-2 hover:border-[#fb2c36]/40 transition-colors">
                      <div>
                        <span className="font-extrabold text-[#423d38] text-xs">CH {rm.id}</span>
                        <span className="text-[10px] text-[#797067] block font-semibold">{rm.type}</span>
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-bold text-[#fb2c36] bg-[#fb2c36]/10 px-2 py-0.5 rounded-md">
                          Sale
                        </span>
                        <button
                          onClick={() => handleMarkClean(rm.id)}
                          className="bg-[#00c758] hover:bg-[#00b04c] text-white p-1.5 rounded-md transition-colors cursor-pointer"
                          title="Marquer comme Propre & Prête"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Maintenance Rooms Section */}
              <div className="flex flex-col gap-2 mt-4">
                <span className="text-[9px] font-bold text-[#797067] uppercase tracking-wider block">Chambres en maintenance :</span>
                {maintenanceRooms.length === 0 ? (
                  <div className="text-center py-4 text-[#797067] text-[10px] italic">
                    Aucun blocage technique en cours.
                  </div>
                ) : (
                  maintenanceRooms.map(rm => (
                    <div key={rm.id} className="bg-white p-3 rounded-lg border border-[#e3e0dd] shadow-xs flex items-center justify-between gap-2">
                      <div>
                        <span className="font-extrabold text-[#423d38] text-xs">CH {rm.id}</span>
                        <span className="text-[10px] text-[#797067] block">{rm.type}</span>
                      </div>
                      
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-bold text-[#8200da] bg-[#8200da]/10 px-2 py-0.5 rounded-md">
                          Maintenance
                        </span>
                        <button
                          onClick={() => handleMarkClean(rm.id)}
                          className="bg-[#edebe9] hover:bg-[#e3e0dd] text-[#423d38] p-1.5 rounded-md transition-colors cursor-pointer"
                          title="Terminer maintenance"
                        >
                          <Wrench className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Ready Clean Rooms Quick List */}
              <div className="flex flex-col gap-2 mt-4 bg-white p-3.5 rounded-xl border border-[#e3e0dd]">
                <span className="text-[9px] font-bold text-[#797067] uppercase tracking-wider block">Chambres disponibles à la vente ({cleanRooms.length}) :</span>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {cleanRooms.map(cr => (
                    <span 
                      key={cr.id} 
                      className="bg-[#00c758]/10 text-[#00c758] border border-[#00c758]/20 font-bold px-2 py-1 rounded-md text-[10px] hover:scale-105 transition-transform"
                      title={`${cr.type} - ${cr.price.toLocaleString()} F`}
                    >
                      CH {cr.id}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STATS EXPRESS VIEW */}
      {activeTabFD === 'stats' && (
        <div className="flex flex-col gap-6 animate-scale-up">
          {/* Main indicators Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-[#e3e0dd] shadow-sm flex flex-col gap-1">
              <span className="text-[#797067] uppercase font-bold text-[9px] tracking-widest block">Taux d'Occupation</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-extrabold text-[#fe6e00]">
                  {rooms.length > 0 ? Math.round((rooms.filter(r => r.status === 'Occupé').length / rooms.length) * 100) : 0}%
                </span>
                <span className="text-[10px] text-[#797067] font-semibold">
                  ({rooms.filter(r => r.status === 'Occupé').length} / {rooms.length} chambres)
                </span>
              </div>
              <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden mt-3">
                <div 
                  className="bg-[#fe6e00] h-full rounded-full transition-all duration-500" 
                  style={{ width: `${rooms.length > 0 ? (rooms.filter(r => r.status === 'Occupé').length / rooms.length) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl border border-[#e3e0dd] shadow-sm flex flex-col gap-1">
              <span className="text-[#797067] uppercase font-bold text-[9px] tracking-widest block">Chambres Libres</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-extrabold text-[#00c758]">
                  {rooms.filter(r => r.status === 'Libre').length}
                </span>
                <span className="text-[10px] text-[#797067] font-semibold">prêtes à la vente</span>
              </div>
              <p className="text-[10px] text-[#797067] mt-3">Rapport ménage optimal</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-[#e3e0dd] shadow-sm flex flex-col gap-1">
              <span className="text-[#797067] uppercase font-bold text-[9px] tracking-widest block">Flux des Arrivées</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-extrabold text-blue-500">
                  {reservations.filter(res => res.status === 'Confirmé').length}
                </span>
                <span className="text-[10px] text-[#797067] font-semibold">réservations en attente</span>
              </div>
              <p className="text-[10px] text-[#797067] mt-3">Check-ins restants</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-[#e3e0dd] shadow-sm flex flex-col gap-1">
              <span className="text-[#797067] uppercase font-bold text-[9px] tracking-widest block">Restant à encaisser</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-extrabold text-[#fb2c36]">
                  {reservations.filter(res => res.status === 'En Cours').reduce((sum, r) => sum + (r.totalBill - r.paidAmount), 0).toLocaleString()} F
                </span>
              </div>
              <p className="text-[10px] text-[#797067] mt-3">Soldes clients en séjour</p>
            </div>
          </div>

          {/* Details Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#fcfaf7] p-5 rounded-xl border border-[#e3e0dd] shadow-xs flex flex-col gap-4">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#423d38] border-b pb-2 flex items-center gap-2">
                🏠 État du Parc des Chambres
              </h3>
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#00c758]"></span>
                    <span className="font-semibold text-[#423d38]">Libres & Prêtes (Vente)</span>
                  </div>
                  <span className="font-bold text-sm">{rooms.filter(r => r.status === 'Libre').length}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                    <span className="font-semibold text-[#423d38]">Occupées (En séjour)</span>
                  </div>
                  <span className="font-bold text-sm">{rooms.filter(r => r.status === 'Occupé').length}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#fb2c36]"></span>
                    <span className="font-semibold text-[#423d38]">Sales (Ménage requis)</span>
                  </div>
                  <span className="font-bold text-sm">{rooms.filter(r => r.status === 'Sale').length}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-[#8200da]"></span>
                    <span className="font-semibold text-[#423d38]">En Maintenance technique</span>
                  </div>
                  <span className="font-bold text-sm">{rooms.filter(r => r.status === 'Maintenance').length}</span>
                </div>
              </div>
            </div>

            <div className="bg-[#fcfaf7] p-5 rounded-xl border border-[#e3e0dd] shadow-xs flex flex-col gap-4">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#423d38] border-b pb-2 flex items-center gap-2">
                📈 Performance Financière En Cours
              </h3>
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-[#797067]">Facturation totale active :</span>
                  <span className="font-extrabold text-[#423d38] text-sm">
                    {reservations.filter(res => res.status === 'En Cours').reduce((sum, r) => sum + r.totalBill, 0).toLocaleString()} FCFA
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-[#797067]">Acomptes encaissés :</span>
                  <span className="font-extrabold text-[#00c758] text-sm">
                    {reservations.filter(res => res.status === 'En Cours').reduce((sum, r) => sum + r.paidAmount, 0).toLocaleString()} FCFA
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs border-t pt-2.5">
                  <span className="font-bold text-[#423d38]">Reste à percevoir au Check-Out :</span>
                  <span className="font-extrabold text-[#fb2c36] text-sm">
                    {reservations.filter(res => res.status === 'En Cours').reduce((sum, r) => sum + (r.totalBill - r.paidAmount), 0).toLocaleString()} FCFA
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HISTORIQUE DES DEPARTS VIEW */}
      {activeTabFD === 'historique' && (
        <div className="bg-white rounded-xl border border-[#e3e0dd] shadow-xs overflow-hidden animate-scale-up flex flex-col">
          <div className="p-4 bg-[#fcfaf7] border-b border-[#e3e0dd] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#423d38]">
                📜 Historique & Archives des Mouvements
              </h3>
              <p className="text-[10px] text-[#797067]">Registre chronologique des dossiers de séjour finalisés ou archivés.</p>
            </div>
            <span className="text-[10px] font-extrabold text-[#797067] uppercase bg-gray-100 px-2 py-1 rounded border">
              Total : {reservations.filter(r => r.status === 'Terminé').length} séjour(s) terminés
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#fcfaf7] border-b border-[#e3e0dd] font-bold text-[#797067] uppercase tracking-wider text-[9px]">
                  <th className="p-4">Réf. / Dossier</th>
                  <th className="p-4">Voyageur / Client</th>
                  <th className="p-4">Chambre</th>
                  <th className="p-4">Séjour</th>
                  <th className="p-4">Total Facturé</th>
                  <th className="p-4">Payé / Encaissé</th>
                  <th className="p-4">Origine / Canal</th>
                  <th className="p-4">Statut</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e3e0dd]">
                {reservations
                  .filter(r => r.status === 'Terminé')
                  .filter(r => {
                    if (!searchQuery) return true;
                    const query = searchQuery.toLowerCase();
                    return (
                      r.guestName.toLowerCase().includes(query) ||
                      r.id.toLowerCase().includes(query) ||
                      r.roomNumber.toLowerCase().includes(query)
                    );
                  })
                  .map(res => (
                    <tr key={res.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 font-mono font-bold text-[#fe6e00]">{res.id}</td>
                      <td className="p-4">
                        <span className="font-bold text-[#423d38] block">{res.guestName}</span>
                        <span className="text-[10px] text-[#797067] block">{res.guestEmail}</span>
                      </td>
                      <td className="p-4 font-bold text-[#423d38]">CH {res.roomNumber}</td>
                      <td className="p-4 font-medium text-[#797067]">
                        du {res.checkIn} au {res.checkOut}
                      </td>
                      <td className="p-4 font-bold text-[#423d38]">
                        {res.totalBill.toLocaleString()} F
                      </td>
                      <td className="p-4 font-bold text-[#00c758]">
                        {res.paidAmount.toLocaleString()} F
                      </td>
                      <td className="p-4">
                        <span className="text-[10px] font-semibold text-[#423d38] block">{res.bookingSource || 'Direct'}</span>
                        <span className="text-[9px] text-[#797067] block">{res.channelName || 'Site Direct'}</span>
                      </td>
                      <td className="p-4">
                        <span className="bg-[#00c758]/10 text-[#00c758] text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Terminé
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => {
                            setActiveTab('billing');
                          }}
                          className="bg-[#fe6e00]/10 hover:bg-[#fe6e00]/20 text-[#fe6e00] font-bold py-1 px-2 rounded text-[10px] transition-colors cursor-pointer"
                        >
                          Consulter Folio / Facture
                        </button>
                      </td>
                    </tr>
                  ))}
                {reservations.filter(r => r.status === 'Terminé').length === 0 && (
                  <tr>
                    <td colSpan={9} className="text-center py-10 text-[#797067] text-[11px] italic">
                      Aucun dossier de séjour terminé ou archivé dans l'historique pour le moment.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* QUICK ADD EXTRA MODAL DIALOG */}
      {selectedStayIdForExtras && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-xl border border-[#e3e0dd] shadow-xl max-w-sm w-full p-6 flex flex-col gap-4 animate-scale-in">
            <div className="flex items-center gap-2 border-b border-[#f3f4f6] pb-3 text-[#423d38] font-bold">
              <Coffee className="w-5 h-5 text-[#fe6e00]" />
              <h3 className="text-sm">Ajouter une Consommation / Extra</h3>
            </div>

            <form onSubmit={handleAddExtra} className="flex flex-col gap-4 text-xs">
              <div className="flex flex-col gap-1">
                <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Description de l'Extra :</label>
                <select
                  value={extraItemName}
                  onChange={(e) => {
                    setExtraItemName(e.target.value);
                    // Match default price if possible
                    if (e.target.value === 'Brunch Signature') setExtraAmount('12000');
                    if (e.target.value === 'Brunch Classique') setExtraAmount('8000');
                    if (e.target.value === 'Café & Viennoiserie') setExtraAmount('3500');
                    if (e.target.value === 'Bière Ivoire 50cl') setExtraAmount('1500');
                    if (e.target.value === 'Champagne Veuve Clicquot') setExtraAmount('85000');
                  }}
                  className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-2 focus:outline-none focus:border-[#fe6e00] font-bold text-[#423d38]"
                >
                  <option value="Brunch Signature">Brunch Signature (12 000 F)</option>
                  <option value="Brunch Classique">Brunch Classique (8 000 F)</option>
                  <option value="Café & Viennoiserie">Café & Viennoiserie (3 500 F)</option>
                  <option value="Bière Ivoire 50cl">Bière Ivoire (1 500 F)</option>
                  <option value="Champagne Veuve Clicquot">Champagne Veuve Clicquot (85 000 F)</option>
                  <option value="Autre Extra">Autre consommation (Montant personnalisé)</option>
                </select>
              </div>

              {extraItemName === 'Autre Extra' && (
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Libellé personnalisé :</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Navette Aéroport, Massage..."
                    onChange={(e) => setExtraItemName(e.target.value)}
                    className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-2 focus:outline-none focus:border-[#fe6e00] text-[#423d38] font-semibold"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Tarif (FCFA) :</label>
                  <input
                    type="number"
                    required
                    value={extraAmount}
                    onChange={(e) => setExtraAmount(e.target.value)}
                    className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-2 focus:outline-none focus:border-[#fe6e00] font-bold text-[#423d38]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Mode de règlement :</label>
                  <select
                    value={extraPaymentMethod}
                    onChange={(e) => setExtraPaymentMethod(e.target.value as any)}
                    className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-2 focus:outline-none focus:border-[#fe6e00] font-semibold text-[#423d38]"
                  >
                    <option value="Chambre">Imputer sur la Chambre</option>
                    <option value="Espèces">Espèces (Payé direct)</option>
                    <option value="Orange Money">Orange Money</option>
                    <option value="MTN Momo">MTN Momo</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 justify-end mt-2">
                <button
                  type="button"
                  onClick={() => setSelectedStayIdForExtras(null)}
                  className="bg-[#edebe9] hover:bg-[#edebe9]/80 text-[#423d38] font-bold px-4 py-2 rounded-lg cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="bg-[#fe6e00] hover:bg-[#ff6b00] text-white font-bold px-4 py-2 rounded-lg cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Ajouter l'Extra
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DETAILED CHECKOUT & PAY MODAL DIALOG */}
      {selectedStayForCheckout && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-xl border border-[#e3e0dd] shadow-xl max-w-md w-full p-6 flex flex-col gap-4 animate-scale-in">
            <div className="flex items-center gap-2 border-b border-[#f3f4f6] pb-3 text-[#423d38] font-bold">
              <LogOut className="w-5 h-5 text-[#fb2c36]" />
              <h3 className="text-sm">Enregistrement du Check-Out • CH {selectedStayForCheckout.roomNumber}</h3>
            </div>

            <div className="text-xs text-[#423d38] flex flex-col gap-3">
              <div className="bg-[#f3f4f6] p-3 rounded-lg border border-[#e3e0dd] flex flex-col gap-2">
                <div className="flex justify-between font-bold">
                  <span>Client :</span>
                  <span>{selectedStayForCheckout.guestName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Séjour :</span>
                  <span className="font-semibold">{selectedStayForCheckout.checkIn} au {selectedStayForCheckout.checkOut}</span>
                </div>
              </div>

              {/* Invoice Breakdown */}
              <div className="flex flex-col gap-2 border border-[#e3e0dd] p-3 rounded-lg bg-white">
                <span className="font-bold text-[#797067] uppercase tracking-widest text-[9px] block border-b pb-1">Détail du folio</span>
                <div className="flex justify-between font-semibold">
                  <span>Total facturé (Hébergement + Extras) :</span>
                  <span>{selectedStayForCheckout.totalBill.toLocaleString()} F</span>
                </div>
                <div className="flex justify-between text-[#00c758] font-semibold">
                  <span>Total déjà payé (Acomptes) :</span>
                  <span>{selectedStayForCheckout.paidAmount.toLocaleString()} F</span>
                </div>
                
                <div className="h-px bg-[#e3e0dd] my-1"></div>
                
                <div className="flex justify-between text-sm font-extrabold text-[#fb2c36]">
                  <span>Solde restant dû :</span>
                  <span>{(selectedStayForCheckout.totalBill - selectedStayForCheckout.paidAmount).toLocaleString()} FCFA</span>
                </div>
              </div>

              {/* Outstanding payment register */}
              {(selectedStayForCheckout.totalBill - selectedStayForCheckout.paidAmount) > 0 && (
                <div className="bg-[#fe6e00]/5 border border-[#fe6e00]/20 p-3.5 rounded-lg flex flex-col gap-2">
                  <span className="font-bold text-[#fe6e00] text-[10px] uppercase">Règlement du Solde Requis</span>
                  <p className="text-[10px] text-[#797067]">
                    Le client doit régler le montant restant de <strong>{((selectedStayForCheckout.totalBill - selectedStayForCheckout.paidAmount)).toLocaleString()} F</strong> pour finaliser son départ.
                  </p>
                  <div className="flex items-center justify-between gap-2 mt-1">
                    <span className="font-bold text-[9px] uppercase text-[#797067]">Mode de règlement :</span>
                    <select
                      value={checkoutPaymentMethod}
                      onChange={(e) => setCheckoutPaymentMethod(e.target.value as any)}
                      className="bg-white border border-[#e3e0dd] rounded-md p-1.5 font-semibold text-[#423d38] text-[11px]"
                    >
                      <option value="Espèces">Espèces (Cash)</option>
                      <option value="Orange Money">Orange Money</option>
                      <option value="MTN Momo">MTN Momo (Momo)</option>
                      <option value="Moov Money">Moov Money</option>
                      <option value="Carte Bancaire">Carte Bancaire</option>
                      <option value="Virement">Virement</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="bg-[#fb2c36]/5 border border-[#fb2c36]/10 p-3 rounded-lg text-[#797067] text-[10px] leading-relaxed">
                <strong>Attention administrative :</strong> La validation libère la chambre et change automatiquement son état à <strong>"Sale"</strong>. Elle est envoyée au ménage et retirée de la vente jusqu'au nettoyage.
              </div>

              <div className="flex gap-2 justify-end mt-2">
                <button
                  type="button"
                  onClick={() => setSelectedStayForCheckout(null)}
                  className="bg-[#edebe9] hover:bg-[#edebe9]/80 text-[#423d38] font-bold px-4 py-2 rounded-lg cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCheckout}
                  className="bg-[#fb2c36] hover:bg-[#d91620] text-white font-bold px-4 py-2 rounded-lg cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <CheckCircle className="w-4 h-4" />
                  Encaisser & Libérer la Chambre
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CHANGER / MODIFIER RESERVATION MODAL DIALOG */}
      {selectedResForChange && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-xl border border-[#e3e0dd] shadow-xl max-w-lg w-full p-6 flex flex-col gap-4 animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-2 border-b border-[#f3f4f6] pb-3 text-[#423d38] font-bold">
              <RefreshCw className="w-5 h-5 text-[#fe6e00]" />
              <h3 className="text-sm">Modifier le Dossier de Séjour : {selectedResForChange.id}</h3>
            </div>

            <form onSubmit={handleSaveModifiedReservation} className="flex flex-col gap-4 text-xs">
              
              {/* Section: Voyageur */}
              <div className="flex flex-col gap-2">
                <span className="font-extrabold text-[#797067] uppercase tracking-widest text-[9px] block">Informations Client</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-[#423d38]">Nom & Prénom :</label>
                    <input
                      type="text"
                      required
                      value={changeGuestName}
                      onChange={(e) => setChangeGuestName(e.target.value)}
                      className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-2 focus:outline-none focus:border-[#fe6e00] text-[#423d38] font-medium"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-[#423d38]">Email de contact :</label>
                    <input
                      type="email"
                      required
                      value={changeGuestEmail}
                      onChange={(e) => setChangeGuestEmail(e.target.value)}
                      className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-2 focus:outline-none focus:border-[#fe6e00] text-[#423d38] font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Section: Dates & Chambre */}
              <div className="flex flex-col gap-2">
                <span className="font-extrabold text-[#797067] uppercase tracking-widest text-[9px] block">Séjour & Attribution</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-[#423d38]">Chambre attribuée :</label>
                    <select
                      value={changeRoomNumber}
                      onChange={(e) => setChangeRoomNumber(e.target.value)}
                      className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-2 focus:outline-none focus:border-[#fe6e00] text-[#423d38] font-bold"
                    >
                      {rooms.map(rm => (
                        <option key={rm.id} value={rm.id}>
                          CH {rm.id} ({rm.type} - {rm.status})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-[#423d38]">Arrivée (Check-In) :</label>
                    <input
                      type="date"
                      required
                      value={changeCheckIn}
                      onChange={(e) => setChangeCheckIn(e.target.value)}
                      className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-1.5 focus:outline-none focus:border-[#fe6e00] text-[#423d38] font-medium"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-[#423d38]">Départ (Check-Out) :</label>
                    <input
                      type="date"
                      required
                      value={changeCheckOut}
                      onChange={(e) => setChangeCheckOut(e.target.value)}
                      className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-1.5 focus:outline-none focus:border-[#fe6e00] text-[#423d38] font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Section: Origine de la réservation (OTA Connecteurs) */}
              <div className="flex flex-col gap-2">
                <span className="font-extrabold text-[#797067] uppercase tracking-widest text-[9px] block">Source & Distribution (OTA / iCal Connectors)</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-[#423d38]">Source globale :</label>
                    <select
                      value={changeBookingSource}
                      onChange={(e) => {
                        setChangeBookingSource(e.target.value);
                        if (e.target.value === 'Direct') {
                          setChangeChannelName('Site Direct');
                        } else {
                          setChangeChannelName('Booking.com');
                        }
                      }}
                      className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-2 focus:outline-none focus:border-[#fe6e00] text-[#423d38] font-medium"
                    >
                      <option value="Direct">Direct (Sans commissions)</option>
                      <option value="OTA">OTA / Distributeur en ligne</option>
                      <option value="iCal">Synchronisation iCal / Flux</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-[#423d38]">Nom du canal :</label>
                    <select
                      value={changeChannelName}
                      onChange={(e) => setChangeChannelName(e.target.value)}
                      className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-2 focus:outline-none focus:border-[#fe6e00] text-[#423d38] font-medium"
                    >
                      <option value="Site Direct">Site Direct (Moteur de recherche)</option>
                      <option value="Walk-In Direct">Walk-In Direct (Accueil physique)</option>
                      <option value="Booking.com">Booking.com (Sandbox)</option>
                      <option value="Expedia">Expedia (Partner Hub)</option>
                      <option value="Airbnb">Airbnb (Direct Sync)</option>
                      <option value="Channex Sandbox">Channex Sandbox Connector</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-[#423d38]">Pays d'origine :</label>
                    <input
                      type="text"
                      value={changeOriginCountry}
                      onChange={(e) => setChangeOriginCountry(e.target.value)}
                      placeholder="Ex: Côte d'Ivoire, France, USA..."
                      className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-2 focus:outline-none focus:border-[#fe6e00] text-[#423d38] font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Section: Finances */}
              <div className="flex flex-col gap-2">
                <span className="font-extrabold text-[#797067] uppercase tracking-widest text-[9px] block">Finances & Acomptes</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1 bg-amber-50 border border-amber-200 p-2.5 rounded-lg">
                    <span className="font-semibold text-[#423d38] block text-[10px]">Facturation hébergement estimée :</span>
                    <span className="font-bold text-sm text-[#fe6e00] block mt-0.5">{selectedResForChange.totalBill.toLocaleString()} F</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-semibold text-[#423d38]">Acompte déjà versé (FCFA) :</label>
                    <input
                      type="number"
                      value={changePaidAmount}
                      onChange={(e) => setChangePaidAmount(Number(e.target.value) || 0)}
                      className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-2 focus:outline-none focus:border-[#fe6e00] text-[#423d38] font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 justify-end mt-2 border-t pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedResForChange(null)}
                  className="bg-[#edebe9] hover:bg-[#edebe9]/80 text-[#423d38] font-bold px-4 py-2 rounded-lg cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="bg-[#fe6e00] hover:bg-[#ff6b00] text-white font-bold px-5 py-2 rounded-lg cursor-pointer flex items-center gap-1.5 shadow-sm"
                >
                  <CheckCircle className="w-4 h-4" /> Enregistrer les Modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
