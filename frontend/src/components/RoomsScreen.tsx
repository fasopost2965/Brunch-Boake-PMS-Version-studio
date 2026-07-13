import React, { useState } from 'react';
import { Room } from '../types';
import { api } from '../api';
import { Bed, Plus, ShieldAlert, RefreshCw, Edit, Trash2 } from 'lucide-react';

interface RoomsScreenProps {
  rooms: Room[];
  onRoomsUpdate: () => void;
}

export const RoomsScreen: React.FC<RoomsScreenProps> = ({ rooms, onRoomsUpdate }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [id, setId] = useState('');
  const [type, setType] = useState('Standard');
  const [price, setPrice] = useState<number>(35000);
  const [capacity, setCapacity] = useState<number>(2);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !type || price <= 0 || capacity <= 0) {
      alert('Veuillez renseigner tous les champs obligatoires.');
      return;
    }

    try {
      const newRoom: Room = {
        id,
        type,
        status: 'Libre',
        price,
        capacity,
      };

      await api.rooms.create(newRoom);
      alert(`La chambre n°${id} a été ajoutée avec succès !`);
      onRoomsUpdate();
      
      // Clear form
      setId('');
      setType('Standard');
      setPrice(35000);
      setCapacity(2);
      setShowAddForm(false);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Échec de la création de la chambre.');
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la chambre n°${roomId} ?`)) {
      try {
        await api.rooms.delete(roomId);
        alert(`Chambre ${roomId} supprimée.`);
        onRoomsUpdate();
      } catch (err: any) {
        console.error(err);
        alert(err.message || 'Impossible de supprimer cette chambre.');
      }
    }
  };

  return (
    <div id="rooms-screen" className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-outfit font-medium text-gray-900 tracking-tight flex items-center gap-2">
            <Bed className="w-6 h-6 text-[#fe6e00]" />
            Inventaire Physique des Chambres
          </h1>
          <p className="text-sm text-gray-500 font-outfit">Configuration tarifaire, types d'hébergement, capacités et suppression</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 bg-[#fe6e00] hover:bg-[#ff6b00] text-white px-4 py-2 rounded-xl font-medium text-xs transition-all shadow-sm active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Ajouter une Chambre
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rooms Table (Col 2) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase font-medium tracking-wider text-[10px]">
                  <th className="p-3">N° de Chambre</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Prix de Base</th>
                  <th className="p-3">Capacité</th>
                  <th className="p-3">Statut actuel</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {rooms.map((room) => {
                  let statusColor = 'text-gray-500 bg-gray-100';
                  if (room.status === 'Libre') statusColor = 'text-emerald-700 bg-emerald-50 border border-emerald-200';
                  else if (room.status === 'Occupé') statusColor = 'text-blue-700 bg-blue-50 border border-blue-200';
                  else if (room.status === 'Sale') statusColor = 'text-amber-700 bg-amber-50 border border-amber-200';
                  else if (room.status === 'Maintenance') statusColor = 'text-red-700 bg-red-50 border border-red-200';

                  return (
                    <tr key={room.id} className="hover:bg-gray-50 transition-all">
                      <td className="p-3 font-semibold font-mono text-gray-900">CH {room.id}</td>
                      <td className="p-3">{room.type}</td>
                      <td className="p-3 font-mono font-medium">{room.price.toLocaleString()} FCFA</td>
                      <td className="p-3 font-semibold text-gray-800">{room.capacity} pers.</td>
                      <td className="p-3">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColor}`}>
                          {room.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => handleDeleteRoom(room.id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add room form (Col 1) */}
        <div>
          {showAddForm && (
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4 animate-fade-in">
              <h2 className="text-base font-outfit font-semibold text-gray-900 border-b pb-2">Créer une Chambre</h2>
              
              <form onSubmit={handleCreateRoom} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="block font-medium text-gray-600">Numéro de chambre / ID :</label>
                  <input
                    required
                    type="text"
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                    placeholder="Ex: 105 ou PV-3"
                    className="w-full bg-gray-50 border border-gray-200 text-gray-700 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#fe6e00] outline-none font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-medium text-gray-600">Type de chambre :</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-700 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#fe6e00] outline-none"
                  >
                    <option value="Standard">Chambre Standard</option>
                    <option value="Deluxe">Chambre Deluxe</option>
                    <option value="Suite Royale">Suite Royale</option>
                    <option value="Pavillon Brunch">Pavillon Brunch</option>
                    <option value="Chambre">Chambre</option>
                    <option value="Studio">Studio</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block font-medium text-gray-600">Prix par nuitée (FCFA) :</label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={price || ''}
                    onChange={(e) => setPrice(parseInt(e.target.value, 10))}
                    placeholder="Ex: 35000"
                    className="w-full bg-gray-50 border border-gray-200 text-gray-700 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#fe6e00] outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-medium text-gray-600">Capacité maximale d'occupation :</label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={capacity || ''}
                    onChange={(e) => setCapacity(parseInt(e.target.value, 10))}
                    placeholder="Ex: 2"
                    className="w-full bg-gray-50 border border-gray-200 text-gray-700 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#fe6e00] outline-none font-mono font-bold"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#fe6e00] hover:bg-[#ff6b00] text-white py-2 rounded-xl text-xs font-semibold shadow-sm transition-all active:scale-95"
                >
                  Ajouter la chambre au système
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
