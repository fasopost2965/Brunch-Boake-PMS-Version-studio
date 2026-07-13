import React, { useState } from 'react';
import { Room, MaintenanceTicket } from '../types';
import { api } from '../api';
import { Sparkles, Trash2, ShieldAlert, Check, RefreshCw, AlertTriangle, Filter, Wrench } from 'lucide-react';

interface HousekeepingScreenProps {
  rooms: Room[];
  maintenanceTickets: MaintenanceTicket[];
  onRoomsUpdate: () => void;
  onMaintenanceUpdate: () => void;
}

export const HousekeepingScreen: React.FC<HousekeepingScreenProps> = ({
  rooms,
  maintenanceTickets,
  onRoomsUpdate,
  onMaintenanceUpdate,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [updatingRoomId, setUpdatingRoomId] = useState<string | null>(null);

  // Filter rooms
  const filteredRooms = rooms.filter((r) => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'dirty') return r.status === 'Sale';
    if (filterStatus === 'clean') return r.status === 'Libre';
    if (filterStatus === 'occupied') return r.status === 'Occupé';
    if (filterStatus === 'maintenance') return r.status === 'Maintenance';
    return true;
  });

  const handleUpdateStatus = async (roomId: string, nextStatus: Room['status']) => {
    setUpdatingRoomId(roomId);
    try {
      await api.rooms.update(roomId, { status: nextStatus });
      onRoomsUpdate();
    } catch (err) {
      console.error("Échec de mise à jour de l'état de la chambre:", err);
    } finally {
      setUpdatingRoomId(null);
    }
  };

  const handleQuickClean = async (roomId: string) => {
    await handleUpdateStatus(roomId, 'Libre');
  };

  return (
    <div id="housekeeping-screen" className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-outfit font-medium text-gray-900 tracking-tight">Housekeeping & Propreté</h1>
          <p className="text-sm text-gray-500">Suivi et mise à jour de l'état de propreté et entretien des chambres</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterStatus === 'all' ? 'bg-[#fe6e00] text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
          >
            Tous ({rooms.length})
          </button>
          <button
            onClick={() => setFilterStatus('dirty')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterStatus === 'dirty' ? 'bg-[#edb200] text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
          >
            Sale ({rooms.filter(r => r.status === 'Sale').length})
          </button>
          <button
            onClick={() => setFilterStatus('clean')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterStatus === 'clean' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
          >
            Libre ({rooms.filter(r => r.status === 'Libre').length})
          </button>
          <button
            onClick={() => setFilterStatus('occupied')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterStatus === 'occupied' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
          >
            Occupé ({rooms.filter(r => r.status === 'Occupé').length})
          </button>
          <button
            onClick={() => setFilterStatus('maintenance')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterStatus === 'maintenance' ? 'bg-red-600 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
          >
            Maintenance ({rooms.filter(r => r.status === 'Maintenance').length})
          </button>
        </div>
      </div>

      {/* Grid of rooms */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredRooms.map((room) => {
          const isUpdating = updatingRoomId === room.id;
          const ticketCount = maintenanceTickets.filter(t => t.roomNumber === room.id && t.status !== 'Résolu').length;

          let statusBg = 'bg-gray-100 text-gray-800 border-gray-200';
          let statusLabel = room.status;

          if (room.status === 'Libre') {
            statusBg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
            statusLabel = 'Libre & Prête';
          } else if (room.status === 'Occupé') {
            statusBg = 'bg-blue-50 text-blue-700 border-blue-200';
            statusLabel = 'Occupée';
          } else if (room.status === 'Sale') {
            statusBg = 'bg-amber-50 text-amber-700 border-amber-200';
            statusLabel = 'À Nettoyer (Sale)';
          } else if (room.status === 'Maintenance') {
            statusBg = 'bg-red-50 text-red-700 border-red-200';
            statusLabel = 'Hors Service (Maint)';
          }

          return (
            <div key={room.id} className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4 hover:shadow-md transition-all flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold font-mono text-gray-900">CH {room.id}</h3>
                    <p className="text-xs text-gray-500 font-outfit">{room.type}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${statusBg}`}>
                    {statusLabel}
                  </span>
                </div>

                <div className="text-xs text-gray-500 space-y-1">
                  <div className="flex justify-between">
                    <span>Capacité :</span>
                    <span className="font-semibold text-gray-700">{room.capacity} pers.</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Prix :</span>
                    <span className="font-semibold font-mono text-gray-700">{room.price.toLocaleString()} FCFA</span>
                  </div>
                  {ticketCount > 0 && (
                    <div className="flex justify-between text-red-600 font-medium">
                      <span className="flex items-center gap-1"><Wrench className="w-3.5 h-3.5" /> Tickets :</span>
                      <span>{ticketCount} actifs</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="border-t border-gray-100 pt-3 flex flex-wrap gap-2">
                {room.status === 'Sale' && (
                  <button
                    onClick={() => handleQuickClean(room.id)}
                    disabled={isUpdating}
                    className="flex-1 flex items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium py-1.5 px-3 rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Nettoyer
                  </button>
                )}

                <div className="w-full flex gap-1">
                  <select
                    value={room.status}
                    onChange={(e) => handleUpdateStatus(room.id, e.target.value as Room['status'])}
                    disabled={isUpdating}
                    className="flex-1 bg-gray-50 border border-gray-200 text-gray-700 rounded-xl px-2.5 py-1.5 text-xs font-medium focus:ring-1 focus:ring-[#fe6e00] outline-none"
                  >
                    <option value="Libre">Libre / Propre</option>
                    <option value="Occupé">Occupé</option>
                    <option value="Sale">Sale / À faire</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
