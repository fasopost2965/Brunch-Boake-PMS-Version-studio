import React, { useState } from 'react';
import { Room } from '../types';
import { Check, CheckSquare, Plus, AlertTriangle } from 'lucide-react';

interface HousekeepingScreenProps {
  rooms: Room[];
  setRooms: React.Dispatch<React.SetStateAction<Room[]>>;
  triggerToast: (msg: string) => void;
}

export const HousekeepingScreen: React.FC<HousekeepingScreenProps> = ({
  rooms,
  setRooms,
  triggerToast
}) => {
  // Housekeeper custom task checklists
  const [tasks, setTasks] = useState([
    { id: 'tsk-1', description: 'Changer les draps de la Suite Royale 201', done: false, priority: 'Haute' },
    { id: 'tsk-2', description: 'Désinfecter la salle de bain de la Chambre Standard 102', done: true, priority: 'Moyenne' },
    { id: 'tsk-3', description: 'Approvisionner les savons & bouteilles d\'eau au Pavillon Brunch 203', done: false, priority: 'Basse' },
    { id: 'tsk-4', description: 'Ménage quotidien de la Deluxe CH 103 occupée', done: false, priority: 'Moyenne' }
  ]);
  const [newTaskText, setNewTaskText] = useState('');

  const dirtyRooms = rooms.filter(r => r.status === 'Sale');
  const cleanRoomsCount = rooms.filter(r => r.status === 'Libre').length;

  const handleCleanRoom = (roomId: string) => {
    setRooms(prev => prev.map(r => r.id === roomId ? { ...r, status: 'Libre' } : r));
    triggerToast(`Ménage validé ! La chambre ${roomId} est désormais propre et Libre.`);
  };

  const toggleTask = (taskId: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, done: !t.done } : t));
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText) return;

    const newTask = {
      id: `tsk-${Date.now()}`,
      description: newTaskText,
      done: false,
      priority: 'Moyenne'
    };
    setTasks(prev => [...prev, newTask]);
    setNewTaskText('');
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in" id="housekeeping_screen">
      <div>
        <h2 className="text-xl font-bold text-[#423d38] tracking-tight">Gouvernance & Housekeeping</h2>
        <p className="text-xs text-[#797067]">Planifier le nettoyage quotidien, attribuer les tâches et libérer les chambres propres.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Dirty Rooms requiring urgent cleaning */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="bg-white p-5 rounded-xl border border-[#e3e0dd] shadow-sm flex flex-col gap-4 text-xs">
            <h3 className="font-bold text-[#423d38] text-sm border-b border-[#e3e0dd] pb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-4.5 h-4.5 text-[#fe6e00]" /> Chambres nécessitant un ménage ({dirtyRooms.length})
            </h3>

            {dirtyRooms.length === 0 ? (
              <div className="text-center py-10 bg-[#f3f4f6] rounded-lg border border-dashed border-[#e3e0dd]">
                <span className="text-[#423d38] font-bold block text-xs">Toutes les chambres sont propres !</span>
                <p className="text-[11px] text-[#797067] mt-0.5">Le plan d'entretien est entièrement à jour. {cleanRoomsCount} chambres prêtes pour check-in.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {dirtyRooms.map(room => (
                  <div key={room.id} className="p-4 bg-[#fef9c2]/50 border border-[#fe6e00]/20 rounded-lg flex justify-between items-center">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-black text-[#423d38]">Chambre CH {room.id}</span>
                      <span className="text-[10px] font-semibold text-[#797067] uppercase">{room.type}</span>
                    </div>
                    <button
                      onClick={() => handleCleanRoom(room.id)}
                      className="bg-[#016630] hover:bg-[#015226] text-white font-bold py-1.5 px-3 rounded-lg text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Ménage fait
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Full rooms overview block */}
          <div className="bg-white p-5 rounded-xl border border-[#e3e0dd] shadow-sm flex flex-col gap-3 text-xs">
            <h3 className="font-bold text-[#423d38] text-sm">Vue d'ensemble entretien hôtel</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {rooms.map(r => {
                let statusColor = 'bg-[#dcfce7] text-[#016630] border border-[#016630]/10';
                if (r.status === 'Sale') statusColor = 'bg-[#fef9c2] text-[#874b00] border border-[#fe6e00]/20 animate-pulse';
                else if (r.status === 'Occupé') statusColor = 'bg-[#fef2f2] text-[#fb2c36] border border-[#fb2c36]/15';
                else if (r.status === 'Maintenance') statusColor = 'bg-[#f3e8ff] text-[#6b21a8] border border-[#6b21a8]/15';

                return (
                  <div key={r.id} className="bg-[#f3f4f6]/50 border border-[#e3e0dd] rounded-lg p-3 flex flex-col justify-between items-center text-center">
                    <span className="font-extrabold text-sm text-[#423d38]">CH {r.id}</span>
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] uppercase mt-2 border ${statusColor}`}>
                      {r.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Housekeeping daily checklists */}
        <div className="lg:col-span-1">
          <div className="bg-white p-5 rounded-xl border border-[#e3e0dd] shadow-sm flex flex-col gap-4 text-xs h-full">
            <h3 className="font-bold text-[#423d38] text-sm border-b border-[#e3e0dd] pb-2 flex items-center gap-2">
              <CheckSquare className="w-4.5 h-4.5 text-[#fe6e00]" /> Tâches d'Entretien du Jour
            </h3>

            {/* List */}
            <div className="flex flex-col gap-2 overflow-y-auto max-h-80 pr-1">
              {tasks.map(t => (
                <div 
                  key={t.id} 
                  onClick={() => toggleTask(t.id)}
                  className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition-all ${
                    t.done 
                      ? 'bg-[#f3f4f6] border-[#e3e0dd] opacity-60 line-through text-[#797067]' 
                      : 'bg-white border-[#e3e0dd] hover:border-[#fe6e00]/50 text-[#423d38]'
                  }`}
                >
                  <input 
                    type="checkbox" 
                    checked={t.done}
                    onChange={() => {}} // handled by div click
                    className="mt-0.5 accent-[#fe6e00]"
                  />
                  <div className="flex flex-col">
                    <span className="font-medium text-[11px] leading-relaxed">{t.description}</span>
                    <span className={`text-[8px] font-bold w-fit px-1.5 py-0.2 rounded mt-1 border ${
                      t.priority === 'Haute' 
                        ? 'bg-[#fef2f2] text-[#fb2c36] border-[#fb2c36]/10' 
                        : 'bg-[#f3f4f6] text-[#423d38] border border-[#e3e0dd]'
                    }`}>
                      {t.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Add */}
            <form onSubmit={handleAddTask} className="flex gap-1.5 mt-auto pt-4 border-t border-[#e3e0dd]">
              <input 
                type="text" 
                placeholder="Nouvelle consigne..."
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-2 focus:outline-none focus:border-[#fe6e00] flex-1 text-xs text-[#423d38]"
              />
              <button
                type="submit"
                className="bg-[#fe6e00] hover:bg-[#ff6b00] text-white font-bold p-2 rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
