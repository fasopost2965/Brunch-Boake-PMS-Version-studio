import React, { useState } from 'react';
import { MaintenanceTicket, Room } from '../types';
import { Wrench } from 'lucide-react';

interface MaintenanceScreenProps {
  maintenance: MaintenanceTicket[];
  rooms: Room[];
  setMaintenance: React.Dispatch<React.SetStateAction<MaintenanceTicket[]>>;
  setRooms: React.Dispatch<React.SetStateAction<Room[]>>;
  triggerToast: (msg: string) => void;
}

export const MaintenanceScreen: React.FC<MaintenanceScreenProps> = ({
  maintenance,
  rooms,
  setMaintenance,
  setRooms,
  triggerToast
}) => {
  // Form states
  const [maintRoom, setMaintRoom] = useState('101');
  const [maintIssue, setMaintIssue] = useState('');
  const [maintPriority, setMaintPriority] = useState<'Basse' | 'Moyenne' | 'Haute'>('Moyenne');

  const handleAddTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!maintIssue) {
      alert('Veuillez décrire le problème technique.');
      return;
    }

    const nextId = `MAINT-${String(maintenance.length + 1).padStart(3, '0')}`;
    const newTicket: MaintenanceTicket = {
      id: nextId,
      roomNumber: maintRoom,
      issue: maintIssue,
      priority: maintPriority,
      status: 'Reçu',
      createdAt: '2026-07-11 17:00'
    };

    // Update maintenance state
    setMaintenance(prev => [newTicket, ...prev]);

    // Mark corresponding room as "Maintenance" in state!
    setRooms(prev => prev.map(r => r.id === maintRoom ? { ...r, status: 'Maintenance' } : r));

    triggerToast(`Ticket ouvert ! La chambre ${maintRoom} est bloquée et marquée en Maintenance.`);
    setMaintIssue('');
  };

  const handleResolveTicket = (ticketId: string, roomNumber: string) => {
    // 1. Mark ticket as "Résolu"
    setMaintenance(prev => prev.map(t => t.id === ticketId ? { ...t, status: 'Résolu' } : t));
    
    // 2. Mark room back to "Libre" (requires cleaning? Or Libre. Let's make it Libre)
    setRooms(prev => prev.map(r => r.id === roomNumber ? { ...r, status: 'Libre' } : r));

    triggerToast(`Incident résolu ! La chambre ${roomNumber} est libérée et de nouveau propre.`);
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in" id="maintenance_screen">
      <div>
        <h2 className="text-xl font-bold text-[#423d38] tracking-tight">Maintenance & Entretien technique</h2>
        <p className="text-xs text-[#797067]">Signaler les pannes, suivre les interventions des techniciens et bloquer les chambres défectueuses.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 1 Column: Create Ticket Form */}
        <div className="lg:col-span-1">
          <div className="bg-white p-5 rounded-xl border border-[#e3e0dd] shadow-sm flex flex-col gap-4 text-xs h-full">
            <h3 className="font-bold text-[#423d38] text-sm border-b border-[#e3e0dd] pb-2 flex items-center gap-2">
              <Wrench className="w-4.5 h-4.5 text-[#fe6e00]" /> Ouvrir un Ticket Incident
            </h3>

            <form onSubmit={handleAddTicket} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Chambre concernée :</label>
                <select
                  value={maintRoom}
                  onChange={(e) => setMaintRoom(e.target.value)}
                  className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-2.5 focus:outline-none text-[#423d38] font-bold"
                >
                  {rooms.map(r => (
                    <option key={r.id} value={r.id}>
                      CH {r.id} ({r.type} - {r.status})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Description de l'anomalie :</label>
                <textarea 
                  required 
                  rows={3}
                  placeholder="Ex: Poignée de porte cassée ou climatiseur bruyant..."
                  value={maintIssue}
                  onChange={(e) => setMaintIssue(e.target.value)}
                  className="bg-white border border-[#e3e0dd] rounded-md p-2.5 focus:outline-none focus:border-[#fe6e00] text-[#423d38]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Niveau d'Urgence / Priorité :</label>
                <div className="flex gap-2">
                  {(['Basse', 'Moyenne', 'Haute'] as const).map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setMaintPriority(p)}
                      className={`flex-1 py-2 rounded-lg font-bold border transition-all text-[10px] cursor-pointer text-center ${
                        maintPriority === p 
                          ? 'bg-[#fe6e00] border-[#fe6e00] text-white shadow-sm' 
                          : 'bg-[#f3f4f6] border-[#e3e0dd] text-[#423d38] hover:bg-[#f3f4f6]/80'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="bg-[#fe6e00] hover:bg-[#ff6b00] text-white font-bold py-2.5 rounded-lg transition-all shadow-sm text-center flex items-center justify-center gap-1 text-xs cursor-pointer mt-1"
              >
                Ouvrir l'Ordre de Travail
              </button>
            </form>
          </div>
        </div>

        {/* Right 2 Columns: Maintenance Ledger */}
        <div className="lg:col-span-2">
          <div className="bg-white p-5 rounded-xl border border-[#e3e0dd] shadow-sm flex flex-col gap-4 text-xs h-full">
            <h3 className="font-bold text-[#423d38] text-sm border-b border-[#e3e0dd] pb-2">Liste de Suivi des Incidents</h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#fe6e00]/5 border-b border-[#e3e0dd] text-[#fe6e00] font-bold uppercase tracking-widest text-[10px]">
                    <th className="p-4">Réf.</th>
                    <th className="p-4">Chambre</th>
                    <th className="p-4">Anomalie signalée</th>
                    <th className="p-4">Priorité</th>
                    <th className="p-4">Statut</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e3e0dd]">
                  {maintenance.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-[#797067] italic">
                        Aucun ticket incident ouvert.
                      </td>
                    </tr>
                  ) : (
                    maintenance.map(ticket => (
                      <tr key={ticket.id} className="hover:bg-[#f3f4f6]/50 transition-colors">
                        <td className="p-4 font-bold text-[#423d38]">{ticket.id}</td>
                        <td className="p-4">
                          <span className="font-extrabold text-[#423d38] bg-[#f3f4f6] border border-[#e3e0dd] px-2.5 py-1 rounded-md text-[10px]">
                            CH {ticket.roomNumber}
                          </span>
                        </td>
                        <td className="p-4 font-medium text-[#423d38] max-w-xs truncate">{ticket.issue}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded font-bold text-[9px] border ${
                            ticket.priority === 'Haute' 
                              ? 'bg-[#fef2f2] text-[#fb2c36] border-[#fb2c36]/10' 
                              : ticket.priority === 'Moyenne'
                              ? 'bg-[#fef9c2] text-[#874b00] border-[#fe6e00]/20'
                              : 'bg-[#f3f4f6] text-[#423d38] border-[#e3e0dd]'
                          }`}>
                            {ticket.priority}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`font-bold flex items-center gap-1.5 ${ticket.status === 'Résolu' ? 'text-[#016630]' : 'text-[#fe6e00]'}`}>
                            <span className={`w-2 h-2 rounded-full ${ticket.status === 'Résolu' ? 'bg-[#016630]' : 'bg-[#fe6e00] animate-pulse'}`}></span>
                            {ticket.status}
                          </span>
                        </td>
                        <td className="p-4">
                          {ticket.status !== 'Résolu' ? (
                            <button
                              onClick={() => handleResolveTicket(ticket.id, ticket.roomNumber)}
                              className="bg-[#dcfce7] hover:bg-[#bbf7d0] text-[#016630] border border-[#016630]/10 font-bold px-3 py-1 rounded-md text-[10px] transition-colors cursor-pointer"
                            >
                              Marquer Résolu
                            </button>
                          ) : (
                            <span className="text-[#797067] italic">Incident clôturé</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
