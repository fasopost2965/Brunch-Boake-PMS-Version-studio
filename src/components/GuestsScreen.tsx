import React, { useState } from 'react';
import { Guest, Reservation, Payment } from '../types';
import { 
  Search, 
  UserPlus, 
  Phone, 
  Mail, 
  CalendarDays, 
  User, 
  Shield, 
  Info, 
  Receipt, 
  Edit2, 
  Globe, 
  Sparkles, 
  AlertCircle
} from 'lucide-react';

interface GuestsScreenProps {
  guests: Guest[];
  reservations: Reservation[];
  payments: Payment[];
  setGuests: React.Dispatch<React.SetStateAction<Guest[]>>;
  triggerToast: (msg: string) => void;
}

export const GuestsScreen: React.FC<GuestsScreenProps> = ({
  guests,
  reservations,
  payments,
  setGuests,
  triggerToast
}) => {
  const [search, setSearch] = useState('');
  
  // Selected guest for showing details
  const [selectedGuestId, setSelectedGuestId] = useState<string | null>(guests[0]?.id || null);

  // Active detail tab: 'identity' | 'stays' | 'payments' | 'notes'
  const [activeDetailTab, setActiveDetailTab] = useState<'identity' | 'stays' | 'payments' | 'notes'>('identity');

  // Edit states for guest profile
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editStatus, setEditStatus] = useState<'Régulier' | 'VIP' | 'Corporate' | 'Nouveau'>('Nouveau');
  const [editNotes, setEditNotes] = useState('');
  const [editGender, setEditGender] = useState('');
  const [editBirthDate, setEditBirthDate] = useState('');
  const [editNationality, setEditNationality] = useState('');
  const [editIdType, setEditIdType] = useState('');
  const [editIdNumber, setEditIdNumber] = useState('');

  // Add guest form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('+225 ');
  const [newStatus, setNewStatus] = useState<'Régulier' | 'VIP' | 'Corporate' | 'Nouveau'>('Nouveau');
  const [newNotes, setNewNotes] = useState('');
  const [newGender, setNewGender] = useState('M.');
  const [newBirthDate, setNewBirthDate] = useState('');
  const [newNationality, setNewNationality] = useState('Ivoirienne');
  const [newIdType, setNewIdType] = useState('CNI');
  const [newIdNumber, setNewIdNumber] = useState('');

  // Fetch reservation history for a guest
  const getGuestReservations = (guestEmail: string) => {
    return reservations.filter(res => res.guestEmail.toLowerCase() === guestEmail.toLowerCase());
  };

  // Fetch payments history for a guest
  const getGuestPayments = (guestName: string, guestEmail: string) => {
    const guestResIds = reservations
      .filter(res => res.guestEmail.toLowerCase() === guestEmail.toLowerCase())
      .map(res => res.id);
    return payments.filter(p => 
      p.guestName.toLowerCase() === guestName.toLowerCase() || 
      guestResIds.includes(p.reservationId)
    );
  };

  // Search logic: name, phone, document number, reservation ID
  const filteredGuests = guests.filter(g => {
    const q = search.toLowerCase();
    const guestRes = getGuestReservations(g.email);
    
    const matchesName = g.name.toLowerCase().includes(q);
    const matchesEmail = g.email.toLowerCase().includes(q);
    const matchesPhone = g.phone.toLowerCase().includes(q);
    
    // Check document numbers
    const matchesDocNumber = (g.idNumber && g.idNumber.toLowerCase().includes(q)) || 
                             guestRes.some(r => r.idNumber && r.idNumber.toLowerCase().includes(q));
                             
    // Check reservation IDs
    const matchesResId = guestRes.some(r => r.id.toLowerCase().includes(q));
    
    return matchesName || matchesEmail || matchesPhone || matchesDocNumber || matchesResId;
  });

  const activeGuest = guests.find(g => g.id === selectedGuestId) || guests[0];
  const activeHistory = activeGuest ? getGuestReservations(activeGuest.email) : [];
  const activePayments = activeGuest ? getGuestPayments(activeGuest.name, activeGuest.email) : [];

  const handleAddGuest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) {
      alert('Veuillez remplir le nom et l’email.');
      return;
    }

    const emailExists = guests.some(g => g.email.toLowerCase() === newEmail.toLowerCase());
    if (emailExists) {
      alert('Un client avec cet email existe déjà.');
      return;
    }

    const newGuest: Guest = {
      id: `GST-${String(guests.length + 1).padStart(3, '0')}`,
      name: newName,
      email: newEmail,
      phone: newPhone,
      status: newStatus,
      notes: newNotes || undefined,
      gender: newGender,
      birthDate: newBirthDate || undefined,
      nationality: newNationality,
      idType: newIdType,
      idNumber: newIdNumber || undefined
    };

    setGuests(prev => [...prev, newGuest]);
    triggerToast(`Fiche client créée pour ${newName} !`);
    setSelectedGuestId(newGuest.id);
    
    // Reset form states
    setNewName('');
    setNewEmail('');
    setNewPhone('+225 ');
    setNewStatus('Nouveau');
    setNewNotes('');
    setNewGender('M.');
    setNewBirthDate('');
    setNewNationality('Ivoirienne');
    setNewIdType('CNI');
    setNewIdNumber('');
    setShowAddForm(false);
  };

  const startEditing = () => {
    if (!activeGuest) return;
    setEditName(activeGuest.name);
    setEditEmail(activeGuest.email);
    setEditPhone(activeGuest.phone);
    setEditStatus(activeGuest.status);
    setEditNotes(activeGuest.notes || '');
    setEditGender(activeGuest.gender || 'M.');
    setEditBirthDate(activeGuest.birthDate || '');
    setEditNationality(activeGuest.nationality || 'Ivoirienne');
    setEditIdType(activeGuest.idType || 'CNI');
    setEditIdNumber(activeGuest.idNumber || '');
    setIsEditingProfile(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGuest) return;

    setGuests(prev => prev.map(g => {
      if (g.id === activeGuest.id) {
        return {
          ...g,
          name: editName,
          email: editEmail,
          phone: editPhone,
          status: editStatus,
          notes: editNotes || undefined,
          gender: editGender,
          birthDate: editBirthDate || undefined,
          nationality: editNationality,
          idType: editIdType,
          idNumber: editIdNumber || undefined
        };
      }
      return g;
    }));

    triggerToast(`Fiche client de ${editName} mise à jour avec succès !`);
    setIsEditingProfile(false);
  };

  const toggleVipStatus = () => {
    if (!activeGuest) return;
    const newStatus = activeGuest.status === 'VIP' ? 'Régulier' : 'VIP';
    setGuests(prev => prev.map(g => {
      if (g.id === activeGuest.id) {
        return { ...g, status: newStatus };
      }
      return g;
    }));
    triggerToast(`${activeGuest.name} est maintenant marqué comme ${newStatus}.`);
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in text-xs" id="guests_screen">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#423d38] tracking-tight">Base Centrale de Fichier Clients</h2>
          <p className="text-xs text-[#797067]">Administration centrale de l'identité, historique des nuitées, notes internes et états de comptes.</p>
        </div>

        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-[#fe6e00] hover:bg-[#ff6b00] text-white text-xs font-semibold px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-sm transition-all cursor-pointer self-start"
        >
          <UserPlus className="w-4 h-4" />
          {showAddForm ? 'Fermer le formulaire' : 'Enregistrer un Nouveau Client'}
        </button>
      </div>

      {/* ADD NEW CLIENT FORM */}
      {showAddForm && (
        <div className="bg-[#f3f4f6] border border-[#e3e0dd] p-5 rounded-xl shadow-sm animate-fade-in text-xs">
          <h3 className="font-bold text-[#423d38] text-sm mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#fe6e00]" /> Créer une Fiche d'Identité Client Initiale
          </h3>
          <form onSubmit={handleAddGuest} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            
            {/* Identity fields */}
            <div className="flex flex-col gap-1">
              <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Civilité / Genre :</label>
              <select
                value={newGender}
                onChange={(e) => setNewGender(e.target.value)}
                className="bg-white border border-[#e3e0dd] rounded-md p-2 focus:outline-none focus:border-[#fe6e00] text-[#423d38]"
              >
                <option value="M.">Monsieur (M.)</option>
                <option value="Mme">Madame (Mme)</option>
                <option value="Autre">Autre</option>
              </select>
            </div>

            <div className="flex flex-col gap-1 md:col-span-2">
              <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Nom complet :</label>
              <input 
                type="text" 
                required 
                placeholder="Yao Koffi Marc"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="bg-white border border-[#e3e0dd] rounded-md p-2 focus:outline-none focus:border-[#fe6e00] text-[#423d38]"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Date de naissance :</label>
              <input 
                type="date" 
                value={newBirthDate}
                onChange={(e) => setNewBirthDate(e.target.value)}
                className="bg-white border border-[#e3e0dd] rounded-md p-2 focus:outline-none focus:border-[#fe6e00] text-[#423d38]"
              />
            </div>

            {/* Contacts & Nationality */}
            <div className="flex flex-col gap-1">
              <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Adresse Email :</label>
              <input 
                type="email" 
                required 
                placeholder="marc@koffi.ci"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="bg-white border border-[#e3e0dd] rounded-md p-2 focus:outline-none focus:border-[#fe6e00] text-[#423d38]"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Téléphone :</label>
              <input 
                type="text" 
                placeholder="+225 07 01 02 03"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                className="bg-white border border-[#e3e0dd] rounded-md p-2 focus:outline-none focus:border-[#fe6e00] text-[#423d38]"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Nationalité :</label>
              <input 
                type="text" 
                placeholder="Ivoirienne"
                value={newNationality}
                onChange={(e) => setNewNationality(e.target.value)}
                className="bg-white border border-[#e3e0dd] rounded-md p-2 focus:outline-none focus:border-[#fe6e00] text-[#423d38]"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Statut initial :</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as any)}
                className="bg-white border border-[#e3e0dd] rounded-md p-2 focus:outline-none focus:border-[#fe6e00] text-[#423d38] font-bold"
              >
                <option value="Nouveau">Nouveau</option>
                <option value="Régulier">Régulier</option>
                <option value="VIP">VIP</option>
                <option value="Corporate">Corporate / Entreprise</option>
              </select>
            </div>

            {/* Document scan section */}
            <div className="flex flex-col gap-1">
              <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Type de pièce :</label>
              <select
                value={newIdType}
                onChange={(e) => setNewIdType(e.target.value)}
                className="bg-white border border-[#e3e0dd] rounded-md p-2 focus:outline-none focus:border-[#fe6e00] text-[#423d38]"
              >
                <option value="CNI">CNI Ivoirienne</option>
                <option value="Passeport">Passeport</option>
                <option value="Carte Consulaire">Carte Consulaire</option>
                <option value="Permis">Permis de Conduire</option>
                <option value="Autre">Autre document</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Numéro de pièce :</label>
              <input 
                type="text" 
                placeholder="Ex: C010827139"
                value={newIdNumber}
                onChange={(e) => setNewIdNumber(e.target.value)}
                className="bg-white border border-[#e3e0dd] rounded-md p-2 focus:outline-none focus:border-[#fe6e00] text-[#423d38] font-mono uppercase"
              />
            </div>

            <div className="md:col-span-2 flex flex-col gap-1">
              <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Observations & Notes Internes :</label>
              <input 
                type="text" 
                placeholder="Ex: Préfère les boissons locales, allergique, etc."
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                className="bg-white border border-[#e3e0dd] rounded-md p-2 focus:outline-none focus:border-[#fe6e00] text-[#423d38]"
              />
            </div>

            <div className="md:col-span-4 flex justify-end gap-2 pt-2">
              <button
                type="submit"
                className="bg-[#fe6e00] hover:bg-[#ff6b00] text-white font-bold px-6 py-2 rounded-lg transition-colors cursor-pointer"
              >
                Enregistrer la Fiche Client
              </button>
            </div>
          </form>
        </div>
      )}

      {/* INTERACTIVE DATA LAYOUT CONTAINER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: GUESTS LIST (width: 5 cols on large screen) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          
          {/* SEARCH BAR - Supports multi-queries */}
          <div className="bg-white p-4 rounded-xl border border-[#e3e0dd] shadow-sm flex flex-col gap-2">
            <div className="flex items-center gap-2 bg-[#f3f4f6] px-3 py-2 rounded-lg border border-[#e3e0dd]">
              <Search className="w-4 h-4 text-[#797067]" />
              <input 
                type="text"
                placeholder="Rechercher par nom, téléphone, pièce ou n° de réservation..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent flex-1 focus:outline-none text-xs text-[#423d38] placeholder:text-[#797067]"
              />
            </div>
            <div className="text-[10px] text-[#797067] flex gap-2 justify-between">
              <span>{filteredGuests.length} client(s) trouvé(s)</span>
              <span>Recherche instantanée intégrée</span>
            </div>
          </div>

          {/* GUESTS TABLE CARD */}
          <div className="bg-white rounded-xl border border-[#e3e0dd] shadow-sm overflow-hidden flex-1 max-h-[500px] overflow-y-auto">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#fe6e00]/5 border-b border-[#e3e0dd] text-[#fe6e00] font-bold uppercase tracking-widest text-[9px]">
                    <th className="p-3">Client</th>
                    <th className="p-3">Statut</th>
                    <th className="p-3 text-right">Séjours</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e3e0dd]">
                  {filteredGuests.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-[#797067] italic">
                        Aucun client correspondant à cette recherche.
                      </td>
                    </tr>
                  ) : (
                    filteredGuests.map(g => {
                      const countStays = getGuestReservations(g.email).length;
                      
                      let tagClass = 'bg-[#f3f4f6] text-[#423d38] border-[#e3e0dd]';
                      if (g.status === 'VIP') tagClass = 'bg-[#fef9c2] text-[#874b00] border-[#fe6e00]/20';
                      else if (g.status === 'Corporate') tagClass = 'bg-[#dbeafe] text-[#1447e6] border-[#1447e6]/20';
                      else if (g.status === 'Régulier') tagClass = 'bg-[#dcfce7] text-[#016630] border-[#016630]/20';

                      return (
                        <tr 
                          key={g.id} 
                          className={`hover:bg-[#f3f4f6]/50 transition-colors cursor-pointer ${
                            selectedGuestId === g.id ? 'bg-[#fe6e00]/5 font-semibold border-l-2 border-l-[#fe6e00]' : ''
                          }`}
                          onClick={() => {
                            setSelectedGuestId(g.id);
                            setIsEditingProfile(false);
                          }}
                        >
                          <td className="p-3">
                            <div className="flex flex-col">
                              <span className="font-extrabold text-[#423d38]">{g.name}</span>
                              <span className="text-[10px] text-[#797067] font-mono">{g.id} • {g.phone}</span>
                            </div>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full font-bold text-[8px] border ${tagClass}`}>
                              {g.status}
                            </span>
                          </td>
                          <td className="p-3 text-right font-bold text-[#423d38]">
                            {countStays} séjour(s)
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

        {/* RIGHT COLUMN: COMPLETE GUEST FILE CARD & TABS (width: 7 cols) */}
        <div className="lg:col-span-7">
          {activeGuest ? (
            <div className="bg-white rounded-xl border border-[#e3e0dd] shadow-md flex flex-col overflow-hidden h-full min-h-[500px]">
              
              {/* Profile Card Header Banner */}
              <div className="bg-[#fe6e00]/5 border-b border-[#e3e0dd] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#fe6e00] text-white flex items-center justify-center font-black text-lg shadow-inner">
                    {activeGuest.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-[#423d38] text-base">{activeGuest.name}</h3>
                      {activeGuest.status === 'VIP' && (
                        <span className="bg-[#fef9c2] border border-[#fe6e00]/20 text-[#874b00] px-1.5 py-0.2 rounded font-black text-[8px]">
                          ⭐ VIP
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-[#797067] font-semibold">{activeGuest.id} • Enregistré dans la base</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={toggleVipStatus}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                      activeGuest.status === 'VIP' 
                        ? 'bg-[#fef9c2] hover:bg-[#fef08a] text-[#874b00] border-[#fe6e00]/20'
                        : 'bg-white hover:bg-gray-50 text-[#797067] border-[#e3e0dd]'
                    }`}
                  >
                    {activeGuest.status === 'VIP' ? '❌ Retirer Statut VIP' : '⭐ Marquer VIP'}
                  </button>
                  
                  <button
                    onClick={startEditing}
                    className="bg-white hover:bg-gray-50 border border-[#e3e0dd] text-[#423d38] font-bold px-3 py-1.5 rounded-lg text-[10px] flex items-center gap-1 transition-all cursor-pointer"
                  >
                    <Edit2 className="w-3 h-3" />
                    Modifier Fiche
                  </button>
                </div>
              </div>

              {/* DETAIL PROFILE EDIT MODE */}
              {isEditingProfile ? (
                <form onSubmit={handleSaveProfile} className="p-6 flex-1 flex flex-col gap-4 text-xs">
                  <h4 className="font-bold text-[#fe6e00] text-sm border-b border-[#e3e0dd] pb-1">Édition des coordonnées administratives</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Civilité / Genre :</label>
                      <select
                        value={editGender}
                        onChange={(e) => setEditGender(e.target.value)}
                        className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-2 focus:outline-none focus:border-[#fe6e00]"
                      >
                        <option value="M.">Monsieur (M.)</option>
                        <option value="Mme">Madame (Mme)</option>
                        <option value="Autre">Autre</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Nom complet :</label>
                      <input 
                        type="text" 
                        required 
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-2 focus:outline-none focus:border-[#fe6e00]"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Téléphone :</label>
                      <input 
                        type="text" 
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-2 focus:outline-none focus:border-[#fe6e00]"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Email :</label>
                      <input 
                        type="email" 
                        required 
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-2 focus:outline-none focus:border-[#fe6e00]"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Nationalité :</label>
                      <input 
                        type="text" 
                        value={editNationality}
                        onChange={(e) => setEditNationality(e.target.value)}
                        className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-2 focus:outline-none focus:border-[#fe6e00]"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Date de naissance :</label>
                      <input 
                        type="date" 
                        value={editBirthDate}
                        onChange={(e) => setEditBirthDate(e.target.value)}
                        className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-2 focus:outline-none focus:border-[#fe6e00]"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Type de Pièce d'Identité :</label>
                      <select
                        value={editIdType}
                        onChange={(e) => setEditIdType(e.target.value)}
                        className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-2 focus:outline-none focus:border-[#fe6e00]"
                      >
                        <option value="CNI">CNI Ivoirienne</option>
                        <option value="Passeport">Passeport</option>
                        <option value="Carte Consulaire">Carte Consulaire</option>
                        <option value="Permis">Permis de Conduire</option>
                        <option value="Autre">Autre document</option>
                      </select>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">N° de Pièce :</label>
                      <input 
                        type="text" 
                        value={editIdNumber}
                        onChange={(e) => setEditIdNumber(e.target.value)}
                        className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-2 focus:outline-none focus:border-[#fe6e00] font-mono uppercase"
                      />
                    </div>

                    <div className="flex flex-col gap-1 md:col-span-2">
                      <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Observations / Notes Internes :</label>
                      <textarea
                        rows={2}
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-2.5 focus:outline-none focus:border-[#fe6e00]"
                        placeholder="Allergies, préférences de literie, etc."
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 mt-auto pt-4 border-t border-[#e3e0dd]">
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(false)}
                      className="bg-white hover:bg-gray-50 border border-[#e3e0dd] text-[#797067] font-bold px-4 py-2 rounded-lg transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="bg-[#fe6e00] hover:bg-[#ff6b00] text-white font-bold px-5 py-2 rounded-lg shadow-sm transition-colors"
                    >
                      Enregistrer les modifications
                    </button>
                  </div>
                </form>
              ) : (
                // NORMAL PROFILE CARD VIEW (WITH TABS)
                <div className="flex-1 flex flex-col">
                  
                  {/* Tabs selector */}
                  <div className="bg-gray-50 border-b border-[#e3e0dd] flex overflow-x-auto">
                    <button
                      onClick={() => setActiveDetailTab('identity')}
                      className={`px-4 py-3 font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                        activeDetailTab === 'identity' 
                          ? 'border-[#fe6e00] text-[#fe6e00] bg-white font-extrabold' 
                          : 'border-transparent text-[#797067] hover:bg-[#f3f4f6] hover:text-[#423d38]'
                      }`}
                    >
                      <User className="w-3.5 h-3.5" />
                      Fiche Identité
                    </button>
                    
                    <button
                      onClick={() => setActiveDetailTab('stays')}
                      className={`px-4 py-3 font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                        activeDetailTab === 'stays' 
                          ? 'border-[#fe6e00] text-[#fe6e00] bg-white font-extrabold' 
                          : 'border-transparent text-[#797067] hover:bg-[#f3f4f6] hover:text-[#423d38]'
                      }`}
                    >
                      <CalendarDays className="w-3.5 h-3.5" />
                      Historique Séjours ({activeHistory.length})
                    </button>

                    <button
                      onClick={() => setActiveDetailTab('payments')}
                      className={`px-4 py-3 font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                        activeDetailTab === 'payments' 
                          ? 'border-[#fe6e00] text-[#fe6e00] bg-white font-extrabold' 
                          : 'border-transparent text-[#797067] hover:bg-[#f3f4f6] hover:text-[#423d38]'
                      }`}
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      Factures & Règlements ({activePayments.length})
                    </button>

                    <button
                      onClick={() => setActiveDetailTab('notes')}
                      className={`px-4 py-3 font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                        activeDetailTab === 'notes' 
                          ? 'border-[#fe6e00] text-[#fe6e00] bg-white font-extrabold' 
                          : 'border-transparent text-[#797067] hover:bg-[#f3f4f6] hover:text-[#423d38]'
                      }`}
                    >
                      <Info className="w-3.5 h-3.5" />
                      Observations Internes
                    </button>
                  </div>

                  {/* Tab contents panel */}
                  <div className="p-6 flex-1 flex flex-col">
                    
                    {/* TAB 1: GUEST IDENTITY DATA */}
                    {activeDetailTab === 'identity' && (
                      <div className="flex flex-col gap-5 animate-fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          
                          <div className="bg-[#f3f4f6]/50 p-3 rounded-lg border border-[#e3e0dd] flex flex-col gap-1">
                            <span className="text-[10px] text-[#797067] uppercase font-bold tracking-wider">Identité Civile</span>
                            <span className="text-sm font-bold text-[#423d38]">
                              {activeGuest.gender || 'M.'} {activeGuest.name}
                            </span>
                          </div>

                          <div className="bg-[#f3f4f6]/50 p-3 rounded-lg border border-[#e3e0dd] flex flex-col gap-1">
                            <span className="text-[10px] text-[#797067] uppercase font-bold tracking-wider">Date de naissance</span>
                            <span className="text-sm font-semibold text-[#423d38] font-mono">
                              {activeGuest.birthDate ? new Date(activeGuest.birthDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Non renseignée'}
                            </span>
                          </div>

                          <div className="bg-[#f3f4f6]/50 p-3 rounded-lg border border-[#e3e0dd] flex flex-col gap-1">
                            <span className="text-[10px] text-[#797067] uppercase font-bold tracking-wider">Téléphone Principal</span>
                            <span className="text-sm font-bold text-[#423d38] flex items-center gap-1.5">
                              <Phone className="w-4 h-4 text-[#797067]" /> {activeGuest.phone}
                            </span>
                          </div>

                          <div className="bg-[#f3f4f6]/50 p-3 rounded-lg border border-[#e3e0dd] flex flex-col gap-1">
                            <span className="text-[10px] text-[#797067] uppercase font-bold tracking-wider">Adresse Électronique</span>
                            <span className="text-sm font-semibold text-[#423d38] flex items-center gap-1.5">
                              <Mail className="w-4 h-4 text-[#797067]" /> {activeGuest.email}
                            </span>
                          </div>

                          <div className="bg-[#f3f4f6]/50 p-3 rounded-lg border border-[#e3e0dd] flex flex-col gap-1">
                            <span className="text-[10px] text-[#797067] uppercase font-bold tracking-wider">Nationalité</span>
                            <span className="text-sm font-bold text-[#423d38] flex items-center gap-1.5">
                              <Globe className="w-4 h-4 text-[#797067]" /> {activeGuest.nationality || 'Ivoirienne'}
                            </span>
                          </div>

                          <div className="bg-[#f3f4f6]/50 p-3 rounded-lg border border-[#e3e0dd] flex flex-col gap-1">
                            <span className="text-[10px] text-[#797067] uppercase font-bold tracking-wider">Pièce d'Identité administrative</span>
                            <span className="text-sm font-bold text-[#423d38] font-mono">
                              {activeGuest.idType || 'CNI'} : {activeGuest.idNumber || 'Non renseignée'}
                            </span>
                          </div>
                        </div>

                        {/* Status notification box if some properties are empty */}
                        {(!activeGuest.nationality || !activeGuest.idNumber) && (
                          <div className="bg-[#fe6e00]/5 border border-[#fe6e00]/20 p-3 rounded-lg flex items-start gap-2 text-[#797067]">
                            <AlertCircle className="w-4 h-4 text-[#fe6e00] shrink-0 mt-0.5" />
                            <p className="text-[11px] leading-normal">
                              Cette fiche est incomplète au niveau administratif pour le Front Desk. Veuillez cliquer sur <strong>"Modifier Fiche"</strong> pour compléter le type de pièce d'identité et la nationalité afin de faciliter le Night Audit et l'enregistrement de police.
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* TAB 2: STAY HISTORY */}
                    {activeDetailTab === 'stays' && (
                      <div className="flex flex-col gap-4 animate-fade-in flex-1">
                        <div className="flex items-center justify-between border-b border-[#e3e0dd] pb-2">
                          <h4 className="font-bold text-[#423d38] uppercase text-[10px] tracking-wider">Chronologie des Réservations et Nuitées</h4>
                          <span className="text-[11px] font-bold text-[#fe6e00]">{activeHistory.length} séjour(s) enregistré(s)</span>
                        </div>

                        {activeHistory.length === 0 ? (
                          <div className="text-center py-10 bg-gray-50 border border-dashed border-[#e3e0dd] rounded-xl flex flex-col items-center justify-center gap-2 text-[#797067]">
                            <CalendarDays className="w-6 h-6 text-[#797067]" />
                            <p className="font-bold">Aucun séjour historique</p>
                            <p className="text-[10px] max-w-xs">Ce client n'a pas encore séjourné ou n'a pas de réservation planifiée.</p>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
                            {activeHistory.map(res => {
                              const checkInDate = new Date(res.checkIn);
                              const checkOutDate = new Date(res.checkOut);
                              const nights = Math.max(1, Math.round((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 3600 * 24)));
                              
                              let stateBadge = 'bg-[#f3f4f6] text-[#423d38] border-[#e3e0dd]';
                              if (res.status === 'En Cours') stateBadge = 'bg-[#dcfce7] text-[#016630] border-[#016630]/20';
                              else if (res.status === 'Confirmé') stateBadge = 'bg-[#dbeafe] text-[#1447e6] border-[#1447e6]/20';

                              return (
                                <div key={res.id} className="bg-[#f3f4f6]/50 border border-[#e3e0dd] p-3 rounded-lg flex justify-between items-center hover:border-[#fe6e00]/20 transition-all">
                                  <div className="flex flex-col gap-0.5">
                                    <span className="font-extrabold text-[#423d38]">Chambre {res.roomNumber} ({res.id})</span>
                                    <span className="text-[10px] text-[#797067] font-semibold">
                                      Du {res.checkIn} au {res.checkOut} • <strong>{nights} nuitée(s)</strong>
                                    </span>
                                  </div>
                                  
                                  <div className="flex flex-col items-end gap-1">
                                    <span className="font-black text-[#423d38]">{res.totalBill.toLocaleString()} F</span>
                                    <span className={`text-[8px] font-extrabold px-1.5 py-0.2 rounded border uppercase tracking-wider ${stateBadge}`}>
                                      {res.status}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {/* TAB 3: INVOICES & PAYMENTS */}
                    {activeDetailTab === 'payments' && (
                      <div className="flex flex-col gap-4 animate-fade-in flex-1">
                        <div className="flex items-center justify-between border-b border-[#e3e0dd] pb-2">
                          <h4 className="font-bold text-[#423d38] uppercase text-[10px] tracking-wider">Historique Financier & Factures</h4>
                          <span className="text-[11px] font-bold text-[#016630]">{activePayments.length} règlement(s) enregistré(s)</span>
                        </div>

                        {activePayments.length === 0 ? (
                          <div className="text-center py-10 bg-gray-50 border border-dashed border-[#e3e0dd] rounded-xl flex flex-col items-center justify-center gap-2 text-[#797067]">
                            <Receipt className="w-6 h-6 text-[#797067]" />
                            <p className="font-bold">Aucune transaction de caisse</p>
                            <p className="text-[10px] max-w-xs">Aucun encaissement n'a encore été saisi pour ce client.</p>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
                            {activePayments.map(pay => {
                              let badgeType = 'bg-[#dcfce7] text-[#016630] border-[#016630]/20';
                              if (pay.method.includes('Money') || pay.method.includes('Momo')) {
                                badgeType = 'bg-[#fef9c2] text-[#874b00] border-[#fe6e00]/20';
                              } else if (pay.method === 'Carte Bancaire' || pay.method === 'Virement') {
                                badgeType = 'bg-[#dbeafe] text-[#1447e6] border-[#1447e6]/20';
                              }

                              return (
                                <div key={pay.id} className="bg-white border border-[#e3e0dd] p-3 rounded-lg flex justify-between items-center shadow-sm">
                                  <div className="flex flex-col gap-0.5">
                                    <div className="flex items-center gap-2">
                                      <span className="font-extrabold text-[#423d38]">{pay.id}</span>
                                      <span className="text-[9px] text-[#797067] font-mono">Folio: {pay.reservationId}</span>
                                    </div>
                                    <span className="text-[10px] text-[#797067] font-semibold">{pay.date} • Réf: <strong>{pay.reference}</strong></span>
                                  </div>

                                  <div className="flex items-center gap-3">
                                    <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded border uppercase ${badgeType}`}>
                                      {pay.method}
                                    </span>
                                    <span className="font-black text-[#016630] text-sm">+{pay.amount.toLocaleString()} F</span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {/* TAB 4: INTERNAL NOTES & PREFERENCES */}
                    {activeDetailTab === 'notes' && (
                      <div className="flex flex-col gap-4 animate-fade-in flex-1">
                        <div className="flex items-center justify-between border-b border-[#e3e0dd] pb-2">
                          <h4 className="font-bold text-[#423d38] uppercase text-[10px] tracking-wider">Observations Internes & Profiling</h4>
                        </div>

                        <div className="bg-[#f3f4f6]/50 p-4 rounded-xl border border-[#e3e0dd] flex flex-col gap-3">
                          <div className="flex items-center gap-1.5 text-sm font-bold text-[#423d38]">
                            <Shield className="w-4 h-4 text-[#fe6e00]" />
                            <span>Remarques de Service (Front Desk)</span>
                          </div>
                          
                          <p className="text-xs text-[#797067] leading-relaxed italic">
                            {activeGuest.notes ? `"${activeGuest.notes}"` : 'Aucun commentaire ou préférence spéciale de service n\'a encore été ajoutée.'}
                          </p>

                          <div className="h-px bg-[#e3e0dd] my-2"></div>
                          
                          <div className="flex flex-col gap-1.5 text-[11px] text-[#797067]">
                            <span className="font-bold uppercase tracking-wider text-[9px] text-[#fe6e00]">Consignes d'accueil standards :</span>
                            <ul className="list-disc list-inside flex flex-col gap-1">
                              <li>Si VIP : Assurer un accueil de bienvenue avec jus de gingembre ou de mangue frais offert.</li>
                              <li>Toujours vérifier la validité de la pièce d'identité enregistrée ({activeGuest.idType || 'CNI'}).</li>
                              <li>Vérifier si des commandes de brunchs sont en attente d'imputation de facturation.</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="bg-white border border-[#e3e0dd] p-12 text-center rounded-xl flex flex-col items-center justify-center gap-3 h-full min-h-[500px] shadow-sm">
              <User className="w-10 h-10 text-[#797067]" />
              <span className="font-bold text-[#423d38] text-sm">Sélectionnez un client</span>
              <p className="text-[11px] text-[#797067] max-w-xs leading-relaxed">
                Consultez, modifiez et explorez les dossiers complets de vos clients à l'aide de la liste latérale gauche.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
