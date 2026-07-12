import React from 'react';
import { Reservation, Room } from '../types';
import { ClipboardList, ArrowRight, CheckCircle2 } from 'lucide-react';

interface ArrivalsScreenProps {
  reservations: Reservation[];
  rooms: Room[];
  setReservations: React.Dispatch<React.SetStateAction<Reservation[]>>;
  setRooms: React.Dispatch<React.SetStateAction<Room[]>>;
  triggerToast: (msg: string) => void;
  setActiveTab: (tab: any) => void;
}

export const ArrivalsScreen: React.FC<ArrivalsScreenProps> = ({
  reservations,
  rooms,
  setReservations,
  setRooms,
  triggerToast,
  setActiveTab
}) => {
  const todayStr = '2026-07-11';
  
  // Filter confirmed reservations arriving today (or past due confirmed ones!)
  const arrivingToday = reservations.filter(res => res.checkIn <= todayStr && res.status === 'Confirmé');

  const handlePerformCheckIn = (resId: string, roomNumber: string, guestName: string) => {
    // 1. Update reservation status to "En Cours"
    setReservations(prev => prev.map(res => res.id === resId ? { ...res, status: 'En Cours' } : res));
    
    // 2. Update Room status to "Occupé"
    setRooms(prev => prev.map(r => r.id === roomNumber ? { ...r, status: 'Occupé' } : r));

    triggerToast(`Check-in réussi ! ${guestName} est maintenant installé en Chambre ${roomNumber}.`);
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in" id="arrivals_screen">
      <div>
        <h2 className="text-xl font-bold text-[#423d38] tracking-tight">Arrivées du Jour</h2>
        <p className="text-xs text-[#797067]">Liste des clients attendus aujourd'hui ({todayStr}) pour enregistrement.</p>
      </div>

      {arrivingToday.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-[#e3e0dd] shadow-sm flex flex-col items-center gap-3">
          <div className="bg-[#fe6e00]/10 p-4 rounded-full text-[#fe6e00]">
            <ClipboardList className="w-8 h-8" />
          </div>
          <span className="font-bold text-[#423d38] text-sm">Aucune arrivée en attente</span>
          <p className="text-xs text-[#797067] max-w-sm leading-relaxed">
            Tous les clients arrivant aujourd'hui ont été enregistrés, ou aucune réservation n'est planifiée pour cette date.
          </p>
          <button
            onClick={() => setActiveTab('checkin')}
            className="mt-2 bg-[#423d38] hover:bg-[#423d38]/90 text-white font-bold px-4 py-2 rounded-lg text-xs transition-colors cursor-pointer"
          >
            Créer un Check-in de passage (Walk-in)
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {arrivingToday.map(res => {
            const room = rooms.find(r => r.id === res.roomNumber);
            const nights = Math.ceil((new Date(res.checkOut).getTime() - new Date(res.checkIn).getTime()) / (1000 * 3600 * 24)) || 1;
            
            return (
              <div 
                key={res.id} 
                className="bg-white border border-[#e3e0dd] rounded-xl p-5 shadow-sm flex flex-col justify-between gap-4 hover:shadow-md transition-all"
              >
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-[#fe6e00] tracking-wider uppercase bg-[#fe6e00]/10 px-2 py-0.5 rounded-md w-fit">
                      Ref: {res.id}
                    </span>
                    <h3 className="font-bold text-[#423d38] text-base mt-1">{res.guestName}</h3>
                    <p className="text-xs text-[#797067]">{res.guestEmail}</p>
                  </div>
                  
                  <div className="flex flex-col items-end gap-1">
                    <span className="font-bold text-[#423d38] text-sm bg-[#f3f4f6] border border-[#e3e0dd] px-2.5 py-1 rounded-md">
                      Chambre {res.roomNumber}
                    </span>
                    <span className="text-[10px] text-[#797067] font-semibold">{room?.type}</span>
                  </div>
                </div>

                <div className="h-px bg-[#f3f4f6] my-1"></div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[#797067] block text-[10px] font-bold uppercase">Dates du Séjour</span>
                    <span className="font-semibold text-[#423d38] flex items-center gap-1">
                      {res.checkIn} <ArrowRight className="w-3 h-3 text-[#797067]" /> {res.checkOut}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#797067] block text-[10px] font-bold uppercase">Durée & Facture</span>
                    <span className="font-semibold text-[#423d38]">
                      {nights} nuitée(s) • {res.totalBill.toLocaleString()} F
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 justify-end mt-2">
                  <button
                    onClick={() => handlePerformCheckIn(res.id, res.roomNumber, res.guestName)}
                    className="bg-[#fe6e00] hover:bg-[#ff6b00] text-white font-bold px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Valider le Check-In
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
