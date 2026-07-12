import React, { useState } from 'react';
import { Reservation, Room, Payment } from '../types';
import { Home, ArrowRight, LogOut } from 'lucide-react';

interface InHouseScreenProps {
  reservations: Reservation[];
  rooms: Room[];
  payments: Payment[];
  setReservations: React.Dispatch<React.SetStateAction<Reservation[]>>;
  setRooms: React.Dispatch<React.SetStateAction<Room[]>>;
  setPayments: React.Dispatch<React.SetStateAction<Payment[]>>;
  triggerToast: (msg: string) => void;
}

export const InHouseScreen: React.FC<InHouseScreenProps> = ({
  reservations,
  rooms: _rooms,
  payments,
  setReservations,
  setRooms,
  setPayments,
  triggerToast
}) => {
  const inHouseStays = reservations.filter(res => res.status === 'En Cours');
  const todayStr = '2026-07-11';

  // Modal / Confirm state for active check-out
  const [selectedResForCheckOut, setSelectedResForCheckOut] = useState<Reservation | null>(null);
  const [settlementMethod, setSettlementMethod] = useState<'Espèces' | 'Orange Money' | 'MTN Momo' | 'Moov Money' | 'Carte Bancaire'>('Espèces');

  const initiateCheckOut = (res: Reservation) => {
    setSelectedResForCheckOut(res);
  };

  const handleCompleteCheckOut = (payRemaining: boolean) => {
    if (!selectedResForCheckOut) return;

    const res = selectedResForCheckOut;
    const unpaid = res.totalBill - res.paidAmount;

    // 1. Mark reservation as Terminé, update paidAmount if paid now
    setReservations(prev => prev.map(r => {
      if (r.id === res.id) {
        return {
          ...r,
          status: 'Terminé',
          paidAmount: payRemaining ? r.totalBill : r.paidAmount
        };
      }
      return r;
    }));

    // 2. Set room status to "Sale" (requires cleaning)
    setRooms(prev => prev.map(room => room.id === res.roomNumber ? { ...room, status: 'Sale' } : room));

    // 3. Register payment if remaining balance paid now
    if (payRemaining && unpaid > 0) {
      const newPay: Payment = {
        id: `PAY-${String(payments.length + 1).padStart(3, '0')}`,
        reservationId: res.id,
        guestName: res.guestName,
        amount: unpaid,
        method: settlementMethod,
        date: `${todayStr} 17:15`,
        reference: `OUT-${Math.floor(100000 + Math.random() * 900000)}`
      };
      setPayments(prev => [newPay, ...prev]);
    }

    triggerToast(`Check-Out validé pour ${res.guestName}. La chambre ${res.roomNumber} est libérée et marquée comme Sale.`);
    setSelectedResForCheckOut(null);
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in" id="inhouse_screen">
      <div>
        <h2 className="text-xl font-bold text-[#423d38] tracking-tight">Séjours en Cours</h2>
        <p className="text-xs text-[#797067]">Liste des clients actuellement présents dans l'établissement (In-House).</p>
      </div>

      {inHouseStays.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-[#e3e0dd] shadow-sm flex flex-col items-center gap-2">
          <div className="bg-[#fe6e00]/10 p-4 rounded-full text-[#fe6e00]">
            <Home className="w-8 h-8" />
          </div>
          <span className="font-bold text-[#423d38] text-sm">Aucun client en séjour actuellement</span>
          <p className="text-xs text-[#797067] max-w-sm leading-relaxed">
            Toutes les chambres occupées ont fait leur check-out, ou aucun check-in n'est actif pour le moment.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {inHouseStays.map(res => {
            const unpaid = res.totalBill - res.paidAmount;
            return (
              <div 
                key={res.id} 
                className="bg-white border border-[#e3e0dd] rounded-xl p-5 shadow-sm flex flex-col justify-between gap-4 hover:shadow-md transition-all relative overflow-hidden"
              >
                {/* Visual indicator corner */}
                <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#fe6e00] rounded-bl-lg"></span>

                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] font-extrabold text-[#fe6e00] uppercase bg-[#fe6e00]/10 border border-[#fe6e00]/20 px-2 py-0.5 rounded w-fit">
                      CH {res.roomNumber}
                    </span>
                    <h3 className="font-bold text-[#423d38] text-sm mt-1">{res.guestName}</h3>
                    <span className="text-[10px] text-[#797067]">{res.guestEmail}</span>
                  </div>
                  
                  <span className="text-[10px] font-bold text-[#797067] font-mono">
                    {res.id}
                  </span>
                </div>

                <div className="h-px bg-[#e3e0dd]"></div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[#797067] block text-[9px] font-bold uppercase tracking-wider">Séjour</span>
                    <span className="font-semibold text-[#423d38] flex items-center gap-1">
                      {res.checkIn} <ArrowRight className="w-3 h-3 text-[#797067]" /> {res.checkOut}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#797067] block text-[9px] font-bold uppercase tracking-wider">Solde Restant</span>
                    <span className={`font-extrabold ${unpaid > 0 ? 'text-[#fb2c36]' : 'text-[#016630]'}`}>
                      {unpaid > 0 ? `${unpaid.toLocaleString()} F` : 'Solder / Payé'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => initiateCheckOut(res)}
                  className="w-full bg-[#fe6e00] hover:bg-[#ff6b00] text-white font-bold py-2 rounded-md text-xs flex items-center justify-center gap-2 transition-all cursor-pointer mt-1"
                >
                  <LogOut className="w-4 h-4" />
                  Procéder au Check-Out
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* CHECK-OUT CONFIRMATION / SETTLEMENT MODAL */}
      {selectedResForCheckOut && (
        <div className="fixed inset-0 bg-[#423d38]/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md border border-[#e3e0dd] shadow-2xl flex flex-col overflow-hidden animate-scale-up text-xs">
            
            <div className="bg-[#fe6e00]/5 border-b border-[#e3e0dd] px-5 py-4 flex items-center justify-between">
              <h3 className="font-bold text-[#423d38] text-sm flex items-center gap-2">
                <LogOut className="w-5 h-5 text-[#fe6e00]" /> Règlement & Départ (Check-Out)
              </h3>
              <button 
                onClick={() => setSelectedResForCheckOut(null)}
                className="text-[#797067] hover:text-[#423d38] font-bold p-1 hover:bg-[#f3f4f6] rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-5 flex flex-col gap-4">
              <div className="flex flex-col gap-1 text-[#423d38] bg-[#f3f4f6] p-4 rounded-lg border border-[#e3e0dd]">
                <span className="text-[10px] font-bold text-[#797067] uppercase tracking-wider">Fiche Client de départ</span>
                <span className="font-bold text-[#423d38] text-sm">{selectedResForCheckOut.guestName}</span>
                <span>Chambre : <strong>CH {selectedResForCheckOut.roomNumber}</strong></span>
                <span>Période : {selectedResForCheckOut.checkIn} au {selectedResForCheckOut.checkOut}</span>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between font-semibold border-b border-[#e3e0dd] pb-1.5 text-[#797067]">
                  <span>Facture Globale de séjour :</span>
                  <span className="text-[#423d38] font-bold">{selectedResForCheckOut.totalBill.toLocaleString()} F</span>
                </div>
                <div className="flex justify-between font-semibold border-b border-[#e3e0dd] pb-1.5 text-[#797067]">
                  <span>Montant déjà versé :</span>
                  <span className="text-[#016630] font-bold">{selectedResForCheckOut.paidAmount.toLocaleString()} F</span>
                </div>
                <div className="flex justify-between font-black text-sm pt-1 text-[#423d38]">
                  <span>Reste dû :</span>
                  <span className={(selectedResForCheckOut.totalBill - selectedResForCheckOut.paidAmount) > 0 ? 'text-[#fb2c36]' : 'text-[#016630]'}>
                    {(selectedResForCheckOut.totalBill - selectedResForCheckOut.paidAmount).toLocaleString()} F
                  </span>
                </div>
              </div>

              {(selectedResForCheckOut.totalBill - selectedResForCheckOut.paidAmount) > 0 ? (
                <div className="bg-[#fef2f2] border border-[#fb2c36]/20 p-4 rounded-lg flex flex-col gap-3">
                  <span className="font-bold text-[#fb2c36]">Règlement du solde restant :</span>
                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-[#fb2c36] text-[9px] uppercase tracking-wider">Mode de paiement du solde :</label>
                    <select
                      value={settlementMethod}
                      onChange={(e) => setSettlementMethod(e.target.value as any)}
                      className="bg-white border border-[#fb2c36]/20 rounded-md p-2 focus:outline-none focus:border-[#fe6e00] text-[#423d38] font-semibold"
                    >
                      <option value="Espèces">Espèces (Cash)</option>
                      <option value="Orange Money">Orange Money</option>
                      <option value="MTN Momo">MTN Momo</option>
                      <option value="Moov Money">Moov Money</option>
                      <option value="Carte Bancaire">Carte Bancaire</option>
                    </select>
                  </div>

                  <button
                    onClick={() => handleCompleteCheckOut(true)}
                    className="bg-[#fe6e00] hover:bg-[#ff6b00] text-white font-bold py-2 rounded-md transition-colors cursor-pointer text-center text-xs"
                  >
                    Enregistrer le solde et Libérer la chambre
                  </button>
                </div>
              ) : (
                <div className="bg-[#dcfce7] border border-[#016630]/20 p-4 rounded-lg text-center text-[#016630] font-bold">
                  Aucun solde restant dû ! Ce client est entièrement à jour.
                </div>
              )}

              <div className="flex gap-2 justify-end mt-2">
                <button
                  type="button"
                  onClick={() => setSelectedResForCheckOut(null)}
                  className="bg-[#f3f4f6] hover:bg-[#e3e0dd] text-[#423d38] font-bold px-4 py-2 rounded-md transition-all cursor-pointer"
                >
                  Fermer
                </button>
                {(selectedResForCheckOut.totalBill - selectedResForCheckOut.paidAmount) === 0 && (
                  <button
                    onClick={() => handleCompleteCheckOut(false)}
                    className="bg-[#fe6e00] hover:bg-[#ff6b00] text-white font-bold px-5 py-2 rounded-md transition-colors cursor-pointer"
                  >
                    Confirmer le Départ
                  </button>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};
