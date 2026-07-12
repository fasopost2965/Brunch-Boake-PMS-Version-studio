import React, { useState } from 'react';
import { Reservation, Room } from '../types';
import { Search, Plus, Trash2, ChevronRight, Filter, Edit, CheckCircle, X } from 'lucide-react';

interface ReservationsScreenProps {
  reservations: Reservation[];
  rooms: Room[];
  setReservations: React.Dispatch<React.SetStateAction<Reservation[]>>;
  setRooms: React.Dispatch<React.SetStateAction<Room[]>>;
  triggerToast: (msg: string) => void;
}

export const ReservationsScreen: React.FC<ReservationsScreenProps> = ({
  reservations,
  rooms,
  setReservations,
  setRooms,
  triggerToast
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Tous' | 'Confirmé' | 'En Cours' | 'Terminé'>('Tous');
  const [sourceFilter, setSourceFilter] = useState<string>('Tous');
  
  // Embedded Form States
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGuestName, setNewGuestName] = useState('');
  const [newGuestEmail, setNewGuestEmail] = useState('');
  const [newRoomNumber, setNewRoomNumber] = useState(rooms[0]?.id || '');
  const [newCheckIn, setNewCheckIn] = useState('2026-07-11');
  const [newCheckOut, setNewCheckOut] = useState('2026-07-12');
  const [newPaidAmount, setNewPaidAmount] = useState('0');

  // Booking Source Form States
  const [newBookingSource, setNewBookingSource] = useState('Direct');
  const [newChannelName, setNewChannelName] = useState('Site Direct');
  const [newOtaReference, setNewOtaReference] = useState('');
  const [newOriginCountry, setNewOriginCountry] = useState("Côte d'Ivoire");

  // Editing Modal States
  const [editingRes, setEditingRes] = useState<Reservation | null>(null);
  const [editGuestName, setEditGuestName] = useState('');
  const [editGuestEmail, setEditGuestEmail] = useState('');
  const [editRoomNumber, setEditRoomNumber] = useState('');
  const [editCheckIn, setEditCheckIn] = useState('');
  const [editCheckOut, setEditCheckOut] = useState('');
  const [editPaidAmount, setEditPaidAmount] = useState('0');
  const [editStatus, setEditStatus] = useState<'Confirmé' | 'En Cours' | 'Terminé'>('Confirmé');
  const [editBookingSource, setEditBookingSource] = useState('Direct');
  const [editChannelType, setEditChannelType] = useState('Direct');
  const [editChannelName, setEditChannelName] = useState('Site Direct');
  const [editOtaReference, setEditOtaReference] = useState('');
  const [editOriginCountry, setEditOriginCountry] = useState("Côte d'Ivoire");

  const handleStartEdit = (res: Reservation) => {
    setEditingRes(res);
    setEditGuestName(res.guestName || '');
    setEditGuestEmail(res.guestEmail || '');
    setEditRoomNumber(res.roomNumber || '');
    setEditCheckIn(res.checkIn || '');
    setEditCheckOut(res.checkOut || '');
    setEditPaidAmount(String(res.paidAmount || 0));
    setEditStatus(res.status || 'Confirmé');
    setEditBookingSource(res.bookingSource || res.source || 'Direct');
    setEditChannelType(res.channelType || 'Direct');
    setEditChannelName(res.channelName || 'Site Direct');
    setEditOtaReference(res.otaReference || '');
    setEditOriginCountry(res.originCountry || "Côte d'Ivoire");
  };

  const handleSaveEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRes) return;

    const start = new Date(editCheckIn);
    const end = new Date(editCheckOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    const room = rooms.find(r => r.id === editRoomNumber);
    const price = room ? room.price : 35000;
    const totalBill = price * diffDays;

    setReservations(prev => prev.map(res => {
      if (res.id === editingRes.id) {
        return {
          ...res,
          guestName: editGuestName,
          guestEmail: editGuestEmail,
          roomNumber: editRoomNumber,
          checkIn: editCheckIn,
          checkOut: editCheckOut,
          paidAmount: Number(editPaidAmount) || 0,
          totalBill: totalBill,
          status: editStatus,
          source: editBookingSource,
          bookingSource: editBookingSource,
          channelType: editChannelType,
          channelName: editChannelName,
          otaReference: editBookingSource === 'OTA' ? editOtaReference : '',
          originCountry: editOriginCountry
        };
      }
      return res;
    }));

    triggerToast(`Réservation ${editingRes.id} mise à jour avec succès.`);
    setEditingRes(null);
  };

  const filteredReservations = reservations.filter(res => {
    const matchSearch = res.guestName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        res.roomNumber.includes(searchQuery) ||
                        res.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchStatus = statusFilter === 'Tous' ? true : res.status === statusFilter;
    const matchSource = sourceFilter === 'Tous' ? true : res.bookingSource === sourceFilter;
    
    return matchSearch && matchStatus && matchSource;
  });

  const handleDelete = (id: string, guestName: string) => {
    if (confirm(`Voulez-vous vraiment supprimer la réservation de ${guestName} ?`)) {
      setReservations(prev => prev.filter(res => res.id !== id));
      triggerToast(`Réservation ${id} supprimée.`);
    }
  };

  const handleSettlePayment = (id: string, total: number, guestName: string) => {
    setReservations(prev => prev.map(res => {
      if (res.id === id) {
        return { ...res, paidAmount: total };
      }
      return res;
    }));
    triggerToast(`Paiement complet de ${total.toLocaleString()} F enregistré pour ${guestName}.`);
  };

  const handleAddReservationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuestName || !newGuestEmail) {
      alert('Veuillez remplir le nom et l’email.');
      return;
    }

    const room = rooms.find(r => r.id === newRoomNumber);
    if (!room) return;

    // Calculate nights
    const start = new Date(newCheckIn);
    const end = new Date(newCheckOut);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    const totalBill = room.price * diffDays;

    const channelTypeMap: Record<string, string> = {
      'Direct': 'Direct',
      'OTA': 'OTA',
      'Agence': 'Offline',
      'Téléphone': 'Offline',
      'Walk-In': 'Offline'
    };

    const newRes: Reservation = {
      id: `RES-${String(reservations.length + 1).padStart(3, '0')}`,
      guestName: newGuestName,
      guestEmail: newGuestEmail,
      roomNumber: newRoomNumber,
      checkIn: newCheckIn,
      checkOut: newCheckOut,
      totalBill: totalBill,
      paidAmount: Number(newPaidAmount) || 0,
      status: 'Confirmé',
      source: newBookingSource,
      bookingSource: newBookingSource,
      channelType: channelTypeMap[newBookingSource] || 'Offline',
      channelName: newChannelName,
      otaReference: newBookingSource === 'OTA' ? newOtaReference : '',
      originCountry: newOriginCountry,
      createdFrom: 'PMS'
    };

    setReservations(prev => [newRes, ...prev]);

    // Update room status if checking in today
    const todayStr = '2026-07-11';
    if (newCheckIn <= todayStr && newCheckOut >= todayStr) {
      setRooms(prev => prev.map(r => r.id === newRoomNumber ? { ...r, status: 'Occupé' } : r));
    }

    setShowAddForm(false);
    triggerToast(`Réservation ${newRes.id} créée avec succès pour ${newGuestName} !`);

    // Reset Form
    setNewGuestName('');
    setNewGuestEmail('');
    setNewPaidAmount('0');
    setNewOtaReference('');
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in" id="reservations_screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#423d38] tracking-tight">Planning & Réservations</h2>
          <p className="text-xs text-[#797067]">Enregistrer les nuitées et suivre le paiement des folios.</p>
        </div>

        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className={`text-xs font-bold px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-sm hover:shadow transition-all duration-300 ease-out cursor-pointer self-start transform hover:scale-[1.02] active:scale-[0.98] ${
            showAddForm 
              ? 'bg-[#797067] hover:bg-[#5a524c] text-white border border-[#797067]' 
              : 'bg-[#fe6e00] hover:bg-[#e05d00] text-white border border-[#fe6e00]'
          }`}
        >
          <Plus className={`w-4 h-4 transition-transform duration-300 ease-in-out ${showAddForm ? 'rotate-45' : ''}`} />
          {showAddForm ? 'Fermer le formulaire' : 'Créer une Réservation'}
        </button>
      </div>

      {/* EMBEDDED FORM */}
      {showAddForm && (
        <div className="bg-[#f3f4f6] border border-[#e3e0dd] p-5 rounded-xl shadow-sm animate-fade-in text-xs">
          <h3 className="font-bold text-[#423d38] text-sm mb-3">Enregistrer une Nouvelle Réservation</h3>
          <form onSubmit={handleAddReservationSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="flex flex-col gap-1">
              <label className="font-bold text-[#797067] uppercase tracking-widest text-[10px]">Nom du Client :</label>
              <input 
                type="text" 
                required 
                placeholder="Ex: Mamadou Coulibaly"
                value={newGuestName}
                onChange={(e) => setNewGuestName(e.target.value)}
                className="bg-white border border-[#e3e0dd] rounded-md p-2 focus:outline-none focus:border-[#fe6e00] text-[#423d38]"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-bold text-[#797067] uppercase tracking-widest text-[10px]">Email :</label>
              <input 
                type="email" 
                required 
                placeholder="Ex: m.coulibaly@yahoo.fr"
                value={newGuestEmail}
                onChange={(e) => setNewGuestEmail(e.target.value)}
                className="bg-white border border-[#e3e0dd] rounded-md p-2 focus:outline-none focus:border-[#fe6e00] text-[#423d38]"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-bold text-[#797067] uppercase tracking-widest text-[10px]">Chambre :</label>
              <select
                value={newRoomNumber}
                onChange={(e) => setNewRoomNumber(e.target.value)}
                className="bg-white border border-[#e3e0dd] rounded-md p-2 focus:outline-none focus:border-[#fe6e00] text-[#423d38]"
              >
                {rooms.map(r => (
                  <option key={r.id} value={r.id}>
                    CH {r.id} ({r.type} - {r.price.toLocaleString()} F)
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-bold text-[#797067] uppercase tracking-widest text-[10px]">Montant de l'Acompte (F) :</label>
              <input 
                type="number" 
                value={newPaidAmount}
                onChange={(e) => setNewPaidAmount(e.target.value)}
                className="bg-white border border-[#e3e0dd] rounded-md p-2 focus:outline-none focus:border-[#fe6e00] font-bold text-[#423d38]"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-bold text-[#797067] uppercase tracking-widest text-[10px]">Date de Check-In :</label>
              <input 
                type="date" 
                required
                value={newCheckIn}
                onChange={(e) => setNewCheckIn(e.target.value)}
                className="bg-white border border-[#e3e0dd] rounded-md p-2 focus:outline-none focus:border-[#fe6e00] text-[#423d38]"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-bold text-[#797067] uppercase tracking-widest text-[10px]">Date de Check-Out :</label>
              <input 
                type="date" 
                required
                value={newCheckOut}
                onChange={(e) => setNewCheckOut(e.target.value)}
                className="bg-white border border-[#e3e0dd] rounded-md p-2 focus:outline-none focus:border-[#fe6e00] text-[#423d38]"
              />
            </div>
            
            <div className="flex flex-col gap-1">
              <label className="font-bold text-[#797067] uppercase tracking-widest text-[10px]">Source de Réservation :</label>
              <select
                value={newBookingSource}
                onChange={(e) => {
                  const val = e.target.value;
                  setNewBookingSource(val);
                  if (val === 'Direct') setNewChannelName('Site Direct');
                  else if (val === 'OTA') setNewChannelName('Booking.com');
                  else if (val === 'Téléphone') setNewChannelName('Appel Téléphonique');
                  else if (val === 'Walk-In') setNewChannelName('Walk-In');
                  else setNewChannelName('Agence de voyage');
                }}
                className="bg-white border border-[#e3e0dd] rounded-md p-2 focus:outline-none focus:border-[#fe6e00] text-[#423d38]"
              >
                <option value="Direct">Direct (Site Internet)</option>
                <option value="OTA">OTA (Booking, Expedia, etc.)</option>
                <option value="Agence">Agence de Voyage</option>
                <option value="Téléphone">Appel Téléphonique</option>
                <option value="Walk-In">Walk-In (Présentation physique)</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold text-[#797067] uppercase tracking-widest text-[10px]">Nom du Canal / Détail :</label>
              <input 
                type="text" 
                required
                placeholder="Ex: Booking.com, Airbnb, Expedia"
                value={newChannelName}
                onChange={(e) => setNewChannelName(e.target.value)}
                className="bg-white border border-[#e3e0dd] rounded-md p-2 focus:outline-none focus:border-[#fe6e00] text-[#423d38]"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold text-[#797067] uppercase tracking-widest text-[10px] flex items-center gap-1">
                Réf. OTA / Canal {newBookingSource !== 'OTA' && <span className="text-[8px] text-[#797067] italic font-normal">(Opt.)</span>} :
              </label>
              <input 
                type="text" 
                placeholder={newBookingSource === 'OTA' ? "Ex: BKG-99182" : "Optionnel"}
                value={newOtaReference}
                onChange={(e) => setNewOtaReference(e.target.value)}
                className="bg-white border border-[#e3e0dd] rounded-md p-2 focus:outline-none focus:border-[#fe6e00] text-[#423d38]"
                required={newBookingSource === 'OTA'}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold text-[#797067] uppercase tracking-widest text-[10px]">Pays d'Origine :</label>
              <input 
                type="text" 
                placeholder="Ex: Côte d'Ivoire, France"
                value={newOriginCountry}
                onChange={(e) => setNewOriginCountry(e.target.value)}
                className="bg-white border border-[#e3e0dd] rounded-md p-2 focus:outline-none focus:border-[#fe6e00] text-[#423d38]"
              />
            </div>

            <div className="md:col-span-4 flex justify-end">
              <button
                type="submit"
                className="bg-[#fe6e00] hover:bg-[#ff6b00] text-white font-bold py-2.5 px-8 rounded-lg transition-colors cursor-pointer text-xs shadow-md"
              >
                Enregistrer la Réservation
              </button>
            </div>
          </form>
        </div>
      )}

      {/* SEARCH AND FILTERS */}
      <div className="bg-white p-4 rounded-xl border border-[#e3e0dd] shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="flex-1 bg-[#f3f4f6] border border-[#e3e0dd] rounded-md px-3 py-2 flex items-center gap-2">
          <Search className="w-4 h-4 text-[#797067]" />
          <input 
            type="text"
            placeholder="Rechercher par nom, chambre, réf (ex: RES-001)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent flex-1 focus:outline-none text-xs text-[#423d38] placeholder:text-[#797067]"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-bold text-[#797067]">Source:</span>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="bg-[#edebe9] text-[#423d38] font-bold text-xs rounded-md p-1.5 focus:outline-none border-none cursor-pointer"
          >
            <option value="Tous">Tous les canaux</option>
            <option value="Direct">Direct (Site)</option>
            <option value="OTA">OTA (Booking, etc.)</option>
            <option value="Agence">Agences</option>
            <option value="Téléphone">Téléphone</option>
            <option value="Walk-In">Walk-In</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#797067]" />
          <div className="flex bg-[#edebe9] p-0.5 rounded-lg text-xs font-semibold">
            {(['Tous', 'Confirmé', 'En Cours', 'Terminé'] as const).map(f => (
              <button
                key={f}
                onClick={() => setStatusFilter(f)}
                className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                  statusFilter === f ? 'bg-white text-[#423d38] shadow-sm' : 'text-[#797067] hover:text-[#423d38]'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl border border-[#e3e0dd] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#fe6e00]/5 border-b border-[#e3e0dd] text-[#fe6e00] font-bold uppercase tracking-widest text-[10px]">
                <th className="p-4">Réf.</th>
                <th className="p-4">Client</th>
                <th className="p-4">Chambre</th>
                <th className="p-4">Canal / Source</th>
                <th className="p-4">Dates de Séjour</th>
                <th className="p-4 text-right">Facture Totale</th>
                <th className="p-4 text-right">Montant Payé</th>
                <th className="p-4">Statut</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e3e0dd]">
              {filteredReservations.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-[#797067] italic">
                    Aucune réservation ne correspond aux critères.
                  </td>
                </tr>
              ) : (
                filteredReservations.map(res => {
                  const unpaid = res.totalBill - res.paidAmount;
                  return (
                    <tr key={res.id} className="hover:bg-[#f3f4f6]/50 transition-colors">
                      <td className="p-4 font-bold text-[#423d38]">{res.id}</td>
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-[#423d38] text-sm">{res.guestName}</span>
                          <span className="text-[#797067] text-[10px] flex items-center gap-1">
                            {res.guestEmail} 
                            {res.originCountry && <span className="text-gray-400">• {res.originCountry}</span>}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="bg-[#fe6e00]/10 text-[#fe6e00] font-bold px-2.5 py-1 rounded-md text-[10px]">
                          CH {res.roomNumber}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className={`text-[10px] font-extrabold uppercase tracking-wide px-1.5 py-0.5 rounded-md inline-block w-fit ${
                            res.bookingSource === 'Direct' ? 'bg-[#016630]/10 text-[#016630]' :
                            res.bookingSource === 'OTA' ? 'bg-[#1447e6]/10 text-[#1447e6]' :
                            'bg-gray-200 text-gray-700'
                          }`}>
                            {res.bookingSource || 'Direct'}
                          </span>
                          <span className="text-[#423d38] font-semibold text-[11px] mt-0.5">{res.channelName || 'Site Direct'}</span>
                          {res.otaReference && (
                            <span className="text-gray-400 text-[9px] font-mono leading-none select-all mt-0.5">Ref: {res.otaReference}</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 font-semibold text-[#423d38]">
                        <div className="flex items-center gap-1.5">
                          <span>{res.checkIn}</span>
                          <ChevronRight className="w-3 h-3 text-[#797067]" />
                          <span>{res.checkOut}</span>
                        </div>
                      </td>
                      <td className="p-4 text-right font-extrabold text-[#423d38] text-sm">
                        {res.totalBill.toLocaleString()} F
                      </td>
                      <td className="p-4 text-right font-semibold">
                        <span className={unpaid <= 0 ? 'text-[#016630]' : unpaid === res.totalBill ? 'text-[#fb2c36]' : 'text-[#fe6e00]'}>
                          {res.paidAmount.toLocaleString()} F
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                          res.status === 'En Cours' 
                            ? 'bg-[#fef2f2] text-[#fb2c36] border border-[#fb2c36]/20'
                            : res.status === 'Confirmé'
                            ? 'bg-[#dbeafe] text-[#1447e6] border border-[#1447e6]/20'
                            : 'bg-[#dcfce7] text-[#016630] border border-[#016630]/20'
                        }`}>
                          {res.status === 'En Cours' ? 'Occupée' : res.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-1.5">
                          {unpaid > 0 && (
                            <button
                              onClick={() => handleSettlePayment(res.id, res.totalBill, res.guestName)}
                              className="bg-[#dcfce7] hover:bg-[#dcfce7]/80 text-[#016630] font-bold px-2.5 py-1 rounded-md text-[10px] border border-[#016630]/20 transition-all cursor-pointer"
                            >
                              Solder
                            </button>
                          )}
                          <button
                            onClick={() => handleStartEdit(res)}
                            className="p-1 hover:bg-[#fe6e00]/10 text-[#fe6e00] rounded-md transition-all cursor-pointer"
                            title="Modifier la réservation"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(res.id, res.guestName)}
                            className="p-1 hover:bg-[#fb2c36]/10 text-[#fb2c36] rounded-md transition-all cursor-pointer"
                            title="Supprimer la réservation"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* EDIT MODAL OVERLAY */}
      {editingRes && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 text-xs animate-fade-in">
          <div className="bg-white rounded-xl border border-[#e3e0dd] shadow-xl max-w-lg w-full p-6 flex flex-col gap-4 max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex items-center justify-between border-b border-[#f3f4f6] pb-3 text-[#423d38]">
              <div className="flex items-center gap-2 font-bold text-sm">
                <Edit className="w-5 h-5 text-[#fe6e00]" />
                <h3>Modifier la Réservation : {editingRes.id}</h3>
              </div>
              <button 
                onClick={() => setEditingRes(null)}
                className="text-[#797067] hover:text-[#fb2c36] p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditSubmit} className="flex flex-col gap-4">
              
              {/* Section: Client */}
              <div className="flex flex-col gap-2">
                <span className="font-extrabold text-[#797067] uppercase tracking-widest text-[9px] block">Client</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Nom complet :</label>
                    <input
                      type="text"
                      required
                      value={editGuestName}
                      onChange={(e) => setEditGuestName(e.target.value)}
                      className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-2 focus:outline-none focus:border-[#fe6e00] text-[#423d38] font-semibold"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">E-mail :</label>
                    <input
                      type="email"
                      required
                      value={editGuestEmail}
                      onChange={(e) => setEditGuestEmail(e.target.value)}
                      className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-2 focus:outline-none focus:border-[#fe6e00] text-[#423d38]"
                    />
                  </div>
                </div>
              </div>

              {/* Section: Dates & Room */}
              <div className="flex flex-col gap-2">
                <span className="font-extrabold text-[#797067] uppercase tracking-widest text-[9px] block">Séjour & Attribution</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Chambre :</label>
                    <select
                      value={editRoomNumber}
                      onChange={(e) => setEditRoomNumber(e.target.value)}
                      className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-2 focus:outline-none focus:border-[#fe6e00] text-[#423d38] font-bold"
                    >
                      {rooms.map(rm => (
                        <option key={rm.id} value={rm.id}>
                          CH {rm.id} ({rm.type})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Arrivée :</label>
                    <input
                      type="date"
                      required
                      value={editCheckIn}
                      onChange={(e) => setEditCheckIn(e.target.value)}
                      className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-1.5 focus:outline-none focus:border-[#fe6e00] text-[#423d38] font-medium"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Départ :</label>
                    <input
                      type="date"
                      required
                      value={editCheckOut}
                      onChange={(e) => setEditCheckOut(e.target.value)}
                      className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-1.5 focus:outline-none focus:border-[#fe6e00] text-[#423d38] font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Section: Source de Réservation */}
              <div className="flex flex-col gap-2">
                <span className="font-extrabold text-[#797067] uppercase tracking-widest text-[9px] block">Source & Distribution</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Source globale :</label>
                    <select
                      value={editBookingSource}
                      onChange={(e) => {
                        const val = e.target.value;
                        setEditBookingSource(val);
                        
                        let type = 'Offline';
                        if (val === 'Direct') {
                          type = 'Direct';
                          setEditChannelName('Site Direct');
                        } else if (val === 'OTA') {
                          type = 'OTA';
                          setEditChannelName('Booking.com');
                        } else {
                          type = 'Offline';
                          if (val === 'Téléphone') setEditChannelName('Appel Téléphonique');
                          else if (val === 'Walk-In') setEditChannelName('Walk-In');
                          else setEditChannelName('Agence de voyage');
                        }
                        setEditChannelType(type);
                      }}
                      className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-2 focus:outline-none focus:border-[#fe6e00] text-[#423d38] font-semibold"
                    >
                      <option value="Direct">Direct (Site Internet)</option>
                      <option value="OTA">OTA (Booking, Expedia, etc.)</option>
                      <option value="Agence">Agence de Voyage</option>
                      <option value="Téléphone">Appel Téléphonique</option>
                      <option value="Walk-In">Walk-In (Physique)</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Type de canal :</label>
                    <select
                      value={editChannelType}
                      onChange={(e) => setEditChannelType(e.target.value)}
                      className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-2 focus:outline-none focus:border-[#fe6e00] text-[#423d38] font-semibold"
                    >
                      <option value="Direct">Direct</option>
                      <option value="OTA">OTA</option>
                      <option value="Offline">Offline</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Nom du canal :</label>
                    <input
                      type="text"
                      required
                      value={editChannelName}
                      onChange={(e) => setEditChannelName(e.target.value)}
                      placeholder="Ex: Booking.com, Airbnb"
                      className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-2 focus:outline-none focus:border-[#fe6e00] text-[#423d38] font-medium"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px] flex items-center gap-1">
                      Réf OTA {editBookingSource !== 'OTA' && <span className="text-[8px] text-[#797067] italic font-normal">(Opt.)</span>} :
                    </label>
                    <input
                      type="text"
                      value={editOtaReference}
                      onChange={(e) => setEditOtaReference(e.target.value)}
                      placeholder={editBookingSource === 'OTA' ? "Ex: BKG-2394" : "Optionnel"}
                      required={editBookingSource === 'OTA'}
                      className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-2 focus:outline-none focus:border-[#fe6e00] text-[#423d38] font-medium"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Pays d'origine :</label>
                    <input
                      type="text"
                      value={editOriginCountry}
                      onChange={(e) => setEditOriginCountry(e.target.value)}
                      placeholder="Ex: Côte d'Ivoire, France"
                      className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-2 focus:outline-none focus:border-[#fe6e00] text-[#423d38] font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Section: Finances & Statut */}
              <div className="flex flex-col gap-2">
                <span className="font-extrabold text-[#797067] uppercase tracking-widest text-[9px] block">Statut & Finances</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Statut :</label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as any)}
                      className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-2 focus:outline-none focus:border-[#fe6e00] text-[#423d38] font-bold"
                    >
                      <option value="Confirmé">Confirmé</option>
                      <option value="En Cours">En Cours (Occupée)</option>
                      <option value="Terminé">Terminé</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1 col-span-2">
                    <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Montant de l'acompte payé (F) :</label>
                    <input
                      type="number"
                      required
                      value={editPaidAmount}
                      onChange={(e) => setEditPaidAmount(e.target.value)}
                      className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-2 focus:outline-none focus:border-[#fe6e00] text-[#423d38] font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 justify-end mt-4 border-t pt-3">
                <button
                  type="button"
                  onClick={() => setEditingRes(null)}
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
