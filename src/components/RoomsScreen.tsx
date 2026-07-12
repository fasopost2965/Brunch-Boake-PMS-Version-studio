import React, { useState } from 'react';
import { Room } from '../types';
import { Wrench, Search, X } from 'lucide-react';

interface RoomsScreenProps {
  rooms: Room[];
  setRooms: React.Dispatch<React.SetStateAction<Room[]>>;
  triggerToast: (msg: string) => void;
}

export const RoomsScreen: React.FC<RoomsScreenProps> = ({
  rooms,
  setRooms,
  triggerToast
}) => {
  const [selectedType, setSelectedType] = useState<string>('Tous');
  const [selectedStatus, setSelectedStatus] = useState<string>('Tous');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredRooms = rooms.filter(room => {
    const matchType = selectedType === 'Tous' ? true : room.type === selectedType;
    const matchStatus = selectedStatus === 'Tous' ? true : room.status === selectedStatus;
    
    // Real-time search query matches room ID or category type
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const matchesSearch = normalizedQuery === '' || 
      room.id.toLowerCase().includes(normalizedQuery) || 
      room.type.toLowerCase().includes(normalizedQuery);

    return matchType && matchStatus && matchesSearch;
  });

  const handleUpdateStatus = (roomId: string, newStatus: 'Libre' | 'Occupé' | 'Sale' | 'Maintenance') => {
    setRooms(prev => prev.map(r => r.id === roomId ? { ...r, status: newStatus } : r));
    triggerToast(`Chambre ${roomId} marquée comme ${newStatus}.`);
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in" id="rooms_screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#423d38] tracking-tight">Plan des Chambres</h2>
          <p className="text-xs text-[#797067]">Suivre et changer l'état en temps réel des pavillons et suites.</p>
        </div>
      </div>

      {/* SEARCH AND FILTERS PANEL */}
      <div className="bg-white p-4 rounded-xl border border-[#e3e0dd] shadow-sm flex flex-col gap-4 text-xs">
        {/* Real-time search field */}
        <div className="relative w-full">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-[#797067]">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Rechercher par numéro de chambre ou catégorie (ex: 101, Deluxe, Suite...)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#f3f4f6] border border-[#e3e0dd] rounded-lg py-2.5 pl-10 pr-10 text-xs font-semibold text-[#423d38] placeholder-[#797067]/60 focus:outline-none focus:border-[#fe6e00] focus:bg-white transition-all duration-200"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-[#797067] hover:text-[#423d38] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Dropdown filters */}
        <div className="flex flex-wrap gap-4">
          <div className="flex flex-col gap-1 min-w-[160px] flex-1 sm:flex-initial">
            <span className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Catégorie de chambre :</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-2 focus:outline-none focus:border-[#fe6e00] font-semibold text-[#423d38]"
            >
              <option value="Tous">Toutes les catégories</option>
              <option value="Standard">Standard</option>
              <option value="Deluxe">Deluxe</option>
              <option value="Suite Royale">Suite Royale</option>
              <option value="Pavillon Brunch">Pavillon Brunch</option>
            </select>
          </div>

          <div className="flex flex-col gap-1 min-w-[160px] flex-1 sm:flex-initial">
            <span className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Statut actuel :</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-2 focus:outline-none focus:border-[#fe6e00] font-semibold text-[#423d38]"
            >
              <option value="Tous">Tous les statuts</option>
              <option value="Libre">Libre / Propre</option>
              <option value="Occupé">Occupé</option>
              <option value="Sale">Sale / À nettoyer</option>
              <option value="Maintenance">En Maintenance</option>
            </select>
          </div>
        </div>
      </div>

      {/* GRID DISPLAY */}
      {filteredRooms.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" id="rooms_grid">
          {filteredRooms.map(room => {
            let statusBg = 'bg-[#dcfce7] border-[#016630]/20 text-[#016630]';
            let statusDot = 'bg-[#00c758]';
            if (room.status === 'Occupé') {
              statusBg = 'bg-[#fef2f2] border-[#fb2c36]/20 text-[#fb2c36]';
              statusDot = 'bg-[#fb2c36]';
            } else if (room.status === 'Sale') {
              statusBg = 'bg-[#fef9c2] border-[#874b00]/20 text-[#874b00]';
              statusDot = 'bg-[#fe6e00]';
            } else if (room.status === 'Maintenance') {
              statusBg = 'bg-[#f3e8ff] border-[#8200da]/20 text-[#8200da]';
              statusDot = 'bg-[#8200da]';
            }

            return (
              <div 
                key={room.id} 
                className="bg-white border border-[#e3e0dd] rounded-xl p-5 shadow-sm flex flex-col gap-4 hover:shadow-md transition-all"
              >
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <span className="text-xl font-bold text-[#423d38] tracking-tight">CH {room.id}</span>
                    <span className="text-[10px] text-[#797067] font-bold uppercase">{room.type}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] flex items-center gap-1 border ${statusBg}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusDot}`}></span>
                    {room.status}
                  </span>
                </div>

                <div className="flex justify-between text-xs text-[#797067] font-medium border-t border-b border-[#f3f4f6] py-2">
                  <span>{room.price.toLocaleString()} F / nuit</span>
                  <span>Capacité : {room.capacity} pers.</span>
                </div>

                {/* Quick Status Control Panel */}
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-bold text-[#797067] uppercase tracking-widest block mb-1">Mise à jour statut</span>
                  <div className="grid grid-cols-2 gap-1.5 text-[9px] font-bold">
                    {room.status !== 'Libre' && (
                      <button
                        onClick={() => handleUpdateStatus(room.id, 'Libre')}
                        className="bg-[#dcfce7] hover:bg-[#dcfce7]/80 text-[#016630] border border-[#016630]/20 py-1.5 rounded-md transition-colors cursor-pointer text-center"
                      >
                        Propre (Libre)
                      </button>
                    )}
                    {room.status !== 'Sale' && (
                      <button
                        onClick={() => handleUpdateStatus(room.id, 'Sale')}
                        className="bg-[#fef9c2] hover:bg-[#fef9c2]/80 text-[#874b00] border border-[#874b00]/20 py-1.5 rounded-md transition-colors cursor-pointer text-center"
                      >
                        Mettre Sale
                      </button>
                    )}
                    {room.status !== 'Maintenance' && (
                      <button
                        onClick={() => handleUpdateStatus(room.id, 'Maintenance')}
                        className="bg-[#f3e8ff] hover:bg-[#f3e8ff]/80 text-[#8200da] border border-[#8200da]/20 py-1.5 rounded-md transition-colors cursor-pointer text-center flex items-center justify-center gap-1 col-span-2"
                      >
                        <Wrench className="w-2.5 h-2.5" /> Maintenance
                      </button>
                    )}
                    {room.status === 'Maintenance' && (
                      <button
                        onClick={() => handleUpdateStatus(room.id, 'Libre')}
                        className="bg-[#dcfce7] hover:bg-[#dcfce7]/80 text-[#016630] border border-[#016630]/20 py-1.5 rounded-md transition-colors cursor-pointer text-center col-span-2"
                      >
                        Libérer la chambre
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-[#e3e0dd] p-12 text-center rounded-xl flex flex-col items-center justify-center gap-3 shadow-xs">
          <Search className="w-10 h-10 text-[#797067]" />
          <span className="font-bold text-[#423d38] text-sm">Aucune chambre trouvée</span>
          <p className="text-[11px] text-[#797067] max-w-xs leading-relaxed">
            Aucune chambre ne correspond à votre recherche "<strong>{searchQuery}</strong>" ou aux filtres sélectionnés. Essayez d'ajuster les critères de filtrage.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedType('Tous');
              setSelectedStatus('Tous');
            }}
            className="mt-2 text-xs font-bold text-[#fe6e00] hover:underline cursor-pointer"
          >
            Réinitialiser tous les filtres
          </button>
        </div>
      )}
    </div>
  );
};
