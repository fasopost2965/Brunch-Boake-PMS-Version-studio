import React, { useState } from 'react';
import { Guest } from '../types';
import { api } from '../api';
import { Users, Search, Plus, Phone, Mail, FileText } from 'lucide-react';

interface GuestsScreenProps {
  guests: Guest[];
  onGuestsUpdate: () => void;
}

export const GuestsScreen: React.FC<GuestsScreenProps> = ({ guests, onGuestsUpdate }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);

  const filteredGuests = guests.filter((g) => {
    const q = searchQuery.toLowerCase();
    return g.name.toLowerCase().includes(q) || g.email.toLowerCase().includes(q) || g.phone.includes(q);
  });

  return (
    <div id="guests-screen" className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-outfit font-medium text-gray-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-[#fe6e00]" />
            Fichier Général des Clients
          </h1>
          <p className="text-sm text-gray-500">Registre d'identité, historique et fiches de police administratives</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Guest list (Col 2) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par nom, email, ou téléphone..."
              className="w-full bg-white border border-gray-200 text-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:ring-1 focus:ring-[#fe6e00] outline-none shadow-sm"
            />
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase font-medium tracking-wider text-[10px]">
                    <th className="p-3">Client</th>
                    <th className="p-3">Coordonnées</th>
                    <th className="p-3">Statut</th>
                    <th className="p-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {filteredGuests.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-gray-400 italic">Aucun client trouvé</td>
                    </tr>
                  ) : (
                    filteredGuests.map((g) => {
                      let statusBadge = 'bg-gray-50 text-gray-600';
                      if (g.status === 'VIP') statusBadge = 'bg-amber-50 text-amber-700 border border-amber-200';
                      else if (g.status === 'Corporate') statusBadge = 'bg-blue-50 text-blue-700 border border-blue-200';
                      else if (g.status === 'Régulier') statusBadge = 'bg-emerald-50 text-emerald-700 border border-emerald-200';

                      return (
                        <tr key={g.id} className="hover:bg-gray-50 transition-all">
                          <td className="p-3">
                            <p className="font-semibold text-gray-900">{g.name}</p>
                            <p className="text-[10px] text-gray-400 font-mono">{g.id}</p>
                          </td>
                          <td className="p-3 space-y-0.5">
                            <p className="flex items-center gap-1"><Phone className="w-3 h-3 text-gray-400" /> {g.phone}</p>
                            <p className="flex items-center gap-1"><Mail className="w-3 h-3 text-gray-400" /> {g.email}</p>
                          </td>
                          <td className="p-3">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusBadge}`}>
                              {g.status}
                            </span>
                          </td>
                          <td className="p-3">
                            <button
                              onClick={() => setSelectedGuest(g)}
                              className="text-xs text-[#fe6e00] hover:underline font-semibold"
                            >
                              Fiche d'identité
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Selected Guest Details (Col 1) */}
        <div>
          {selectedGuest ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4 animate-fade-in">
              <div className="flex justify-between items-start border-b pb-3">
                <div>
                  <h2 className="text-base font-outfit font-semibold text-gray-900">{selectedGuest.name}</h2>
                  <p className="text-xs text-gray-400 font-mono">{selectedGuest.id}</p>
                </div>
                <button
                  onClick={() => setSelectedGuest(null)}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  Fermer
                </button>
              </div>

              <div className="space-y-3 text-xs text-gray-600">
                <div className="grid grid-cols-2 gap-3 border-b pb-3 border-gray-50">
                  <div>
                    <span className="block text-gray-400 text-[10px] uppercase">Téléphone</span>
                    <span className="font-medium text-gray-800">{selectedGuest.phone}</span>
                  </div>
                  <div>
                    <span className="block text-gray-400 text-[10px] uppercase">Email</span>
                    <span className="font-medium text-gray-800 truncate block">{selectedGuest.email}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 border-b pb-3 border-gray-50">
                  <div>
                    <span className="block text-gray-400 text-[10px] uppercase">Nationalité</span>
                    <span className="font-medium text-gray-800">{selectedGuest.nationality || 'Non spécifiée'}</span>
                  </div>
                  <div>
                    <span className="block text-gray-400 text-[10px] uppercase">Type de Pièce</span>
                    <span className="font-medium text-gray-800">{selectedGuest.idType || 'Non spécifiée'}</span>
                  </div>
                </div>

                <div>
                  <span className="block text-gray-400 text-[10px] uppercase">Numéro de pièce</span>
                  <span className="font-medium font-mono text-gray-800">{selectedGuest.idNumber || 'Non spécifié'}</span>
                </div>

                {selectedGuest.notes && (
                  <div className="p-3 bg-[#fcfaf7] border border-gray-100 rounded-xl mt-2">
                    <span className="block text-gray-400 text-[10px] uppercase mb-1">Notes / Préférences</span>
                    <p className="text-xs text-gray-700 leading-normal">{selectedGuest.notes}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-2xl border border-dashed border-gray-200 p-8 text-center text-xs text-gray-400">
              <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              Sélectionnez un client de la liste pour visualiser sa fiche d'identité complète.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
