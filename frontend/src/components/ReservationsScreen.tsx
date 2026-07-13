import React, { useState, useRef, useEffect } from 'react';
import { Reservation, Room, Payment, Guest } from '../types';
import { api } from '../api';
import { Calendar, Search, Plus, Check, LogOut, ArrowRight, UserCheck, ShieldAlert, PenTool, Upload, FileText, User } from 'lucide-react';

interface ReservationsScreenProps {
  reservations: Reservation[];
  rooms: Room[];
  guests: Guest[];
  onReservationsUpdate: () => void;
  onRoomsUpdate: () => void;
  onPaymentsUpdate: () => void;
  onGuestsUpdate: () => void;
}

export const ReservationsScreen: React.FC<ReservationsScreenProps> = ({
  reservations,
  rooms,
  guests,
  onReservationsUpdate,
  onRoomsUpdate,
  onPaymentsUpdate,
  onGuestsUpdate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [activePoliceFormRes, setActivePoliceFormRes] = useState<Reservation | null>(null);

  // New Reservation Form State
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [pricePerNight, setPricePerNight] = useState<number>(35000);
  const [bookingSource, setBookingSource] = useState('Direct');
  const [channelName, setChannelName] = useState('Site Direct');
  const [otaReference, setOtaReference] = useState('');
  const [adults, setAdults] = useState<number>(1);
  const [children, setChildren] = useState<number>(0);
  const [notes, setNotes] = useState('');

  // Police Form States
  const [gender, setGender] = useState('M');
  const [birthDate, setBirthDate] = useState('');
  const [nationality, setNationality] = useState('Ivoirienne');
  const [idType, setIdType] = useState('CNI');
  const [idNumber, setIdNumber] = useState('');
  const [originCountry, setOriginCountry] = useState('Côte d\'Ivoire');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [docScanUrl, setDocScanUrl] = useState<string>('');
  const [signatureData, setSignatureData] = useState<string>('');

  // Signature drawing states
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Update price when room changes
  useEffect(() => {
    if (roomNumber) {
      const selectedRoom = rooms.find(r => r.id === roomNumber);
      if (selectedRoom) {
        setPricePerNight(selectedRoom.price);
      }
    }
  }, [roomNumber, rooms]);

  // Set up signature canvas drawing handlers
  useEffect(() => {
    if (activePoliceFormRes && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#423d38';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
      }
    }
  }, [activePoliceFormRes]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    
    // Support touch and mouse
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    if (canvasRef.current) {
      setSignatureData(canvasRef.current.toDataURL());
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSignatureData('');
  };

  const handleIdUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDocScanUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Create booking
  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName || !guestPhone || !roomNumber || !checkIn || !checkOut) {
      alert('Veuillez remplir les informations requises.');
      return;
    }

    // Compute total bills
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const nights = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 3600 * 24)));
    const totalBill = nights * pricePerNight;

    try {
      const newRes: Reservation = {
        id: `RES-${Math.floor(100 + Math.random() * 900)}`,
        guestName,
        guestEmail,
        roomNumber,
        checkIn,
        checkOut,
        totalBill,
        paidAmount: 0,
        status: 'Confirmé',
        bookingSource,
        channelType: bookingSource === 'OTA' ? 'OTA' : 'Direct',
        channelName: bookingSource === 'OTA' ? channelName : 'Site Direct',
        otaReference: bookingSource === 'OTA' ? otaReference : undefined,
        originCountry: 'Côte d\'Ivoire',
        createdFrom: 'PMS',
        adults,
        children,
        notes
      };

      // 1. Create reservation
      await api.reservations.create(newRes);

      // 2. Add as Guest if not exists
      const guestExists = guests.some(g => g.name.toLowerCase() === guestName.toLowerCase() || g.phone === guestPhone);
      if (!guestExists) {
        const newGuest: Guest = {
          id: `GST-${Math.floor(100 + Math.random() * 900)}`,
          name: guestName,
          email: guestEmail || 'guest@bouake.ci',
          phone: guestPhone,
          status: 'Nouveau'
        };
        await api.guests.create(newGuest);
        onGuestsUpdate();
      }

      alert('Réservation créée avec succès !');
      onReservationsUpdate();
      
      // Clear Form
      setGuestName('');
      setGuestEmail('');
      setGuestPhone('');
      setRoomNumber('');
      setCheckIn('');
      setCheckOut('');
      setShowAddForm(false);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Impossible de créer la réservation.');
    }
  };

  // Execute Check-In with Police Form
  const handleCheckInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePoliceFormRes) return;
    if (!agreedToTerms) {
      alert('Veuillez cocher la case d\'acceptation des règlements intérieurs.');
      return;
    }

    try {
      // 1. Update reservation status, save police details, signature, scan Base64
      await api.reservations.update(activePoliceFormRes.id, {
        status: 'En Cours',
        gender,
        birthDate,
        nationality,
        idType,
        idNumber,
        originCountry,
        agreedToTerms,
        docScanUrl,
        signatureData
      });

      // 2. Update room status to Occupé
      await api.rooms.update(activePoliceFormRes.roomNumber, {
        status: 'Occupé'
      });

      alert('Arrivée (Check-In) validée avec succès ! La chambre est désormais occupée.');
      onReservationsUpdate();
      onRoomsUpdate();
      
      // Reset police form state
      setActivePoliceFormRes(null);
      setGender('M');
      setBirthDate('');
      setNationality('Ivoirienne');
      setIdType('CNI');
      setIdNumber('');
      setOriginCountry('Côte d\'Ivoire');
      setAgreedToTerms(false);
      setDocScanUrl('');
      setSignatureData('');
    } catch (err) {
      console.error(err);
      alert('Échec de validation de l\'arrivée.');
    }
  };

  // Checkout Guest
  const handleCheckOut = async (res: Reservation) => {
    const outstanding = res.totalBill - res.paidAmount;
    if (outstanding > 0) {
      if (!confirm(`Attention : Ce client a un solde restant de ${outstanding.toLocaleString()} FCFA à régler. Souhaitez-vous procéder au départ quand même ?`)) {
        return;
      }
    }

    try {
      // 1. Update reservation to Terminé
      await api.reservations.update(res.id, {
        status: 'Terminé'
      });

      // 2. Set Room to Sale (Dirty) for Housekeeping
      await api.rooms.update(res.roomNumber, {
        status: 'Sale'
      });

      alert('Départ (Check-Out) effectué. La chambre est maintenant marquée à nettoyer (Sale).');
      onReservationsUpdate();
      onRoomsUpdate();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredReservations = reservations.filter((r) => {
    const q = searchQuery.toLowerCase();
    const nameMatch = r.guestName.toLowerCase().includes(q) || r.id.toLowerCase().includes(q);
    
    if (filterStatus === 'all') return nameMatch;
    if (filterStatus === 'confirmed') return nameMatch && r.status === 'Confirmé';
    if (filterStatus === 'active') return nameMatch && r.status === 'En Cours';
    if (filterStatus === 'finished') return nameMatch && r.status === 'Terminé';
    return nameMatch;
  });

  return (
    <div id="reservations-screen" className="space-y-6 animate-fade-in">
      {/* Header controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-outfit font-medium text-gray-900 tracking-tight flex items-center gap-2">
            <Calendar className="w-6 h-6 text-[#fe6e00]" />
            Cahier de Réservations & Arrivées
          </h1>
          <p className="text-sm text-gray-500 font-outfit">Suivi des séjours, fiches de police administratives et validation de départ</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 bg-[#fe6e00] hover:bg-[#ff6b00] text-white px-4 py-2 rounded-xl font-medium text-xs transition-all shadow-sm active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Créer un Séjour
          </button>
        </div>
      </div>

      {/* Booking list grids */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Table list (Col 2) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher par nom client ou ID réservation..."
                className="w-full bg-white border border-gray-200 text-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-xs focus:ring-1 focus:ring-[#fe6e00] outline-none shadow-sm"
              />
            </div>
            <div className="flex gap-1.5">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filterStatus === 'all' ? 'bg-gray-800 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
              >
                Tout
              </button>
              <button
                onClick={() => setFilterStatus('confirmed')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filterStatus === 'confirmed' ? 'bg-[#fe6e00] text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
              >
                Confirmé
              </button>
              <button
                onClick={() => setFilterStatus('active')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filterStatus === 'active' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
              >
                En Cours
              </button>
              <button
                onClick={() => setFilterStatus('finished')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filterStatus === 'finished' ? 'bg-gray-600 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}
              >
                Terminé
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase font-medium tracking-wider text-[10px]">
                    <th className="p-3">Client / ID</th>
                    <th className="p-3">Chambre</th>
                    <th className="p-3">Dates</th>
                    <th className="p-3">Facturation (FCFA)</th>
                    <th className="p-3">État</th>
                    <th className="p-3 text-right">Opérations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {filteredReservations.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-gray-400 italic">Aucun dossier trouvé</td>
                    </tr>
                  ) : (
                    filteredReservations.map((res) => {
                      let statusBadge = 'bg-gray-100 text-gray-600';
                      if (res.status === 'Confirmé') statusBadge = 'bg-amber-50 text-amber-700 border border-amber-200';
                      else if (res.status === 'En Cours') statusBadge = 'bg-blue-50 text-blue-700 border border-blue-200';
                      else if (res.status === 'Terminé') statusBadge = 'bg-emerald-50 text-emerald-700 border border-emerald-200';

                      const outstanding = res.totalBill - res.paidAmount;

                      return (
                        <tr key={res.id} className="hover:bg-gray-50 transition-all">
                          <td className="p-3">
                            <p className="font-semibold text-gray-900">{res.guestName}</p>
                            <p className="text-[10px] text-gray-400 font-mono flex items-center gap-1">
                              <span>{res.id}</span>
                              {res.bookingSource === 'OTA' && (
                                <span className="text-[9px] bg-blue-100 text-blue-800 px-1.5 rounded">OTA: {res.channelName}</span>
                              )}
                            </p>
                          </td>
                          <td className="p-3 font-mono font-bold">CH {res.roomNumber}</td>
                          <td className="p-3">
                            <div className="flex items-center gap-1 font-mono text-[11px]">
                              <span>{res.checkIn}</span>
                              <ArrowRight className="w-3 h-3 text-gray-400" />
                              <span>{res.checkOut}</span>
                            </div>
                          </td>
                          <td className="p-3 space-y-0.5">
                            <p className="font-mono font-semibold text-gray-800">Total: {res.totalBill.toLocaleString()}</p>
                            <p className="font-mono text-[10px] text-emerald-600">Payé: {res.paidAmount.toLocaleString()}</p>
                            {outstanding > 0 && (
                              <p className="font-mono text-[10px] text-red-600 font-medium">Reste: {outstanding.toLocaleString()}</p>
                            )}
                          </td>
                          <td className="p-3">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${statusBadge}`}>
                              {res.status}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            {res.status === 'Confirmé' && (
                              <button
                                onClick={() => setActivePoliceFormRes(res)}
                                className="flex items-center gap-1 bg-[#fe6e00] hover:bg-[#ff6b00] text-white px-2.5 py-1.5 rounded-lg text-[10px] font-semibold shadow-sm transition-all active:scale-95"
                              >
                                <UserCheck className="w-3.5 h-3.5" />
                                Check-In
                              </button>
                            )}
                            {res.status === 'En Cours' && (
                              <button
                                onClick={() => handleCheckOut(res)}
                                className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white px-2.5 py-1.5 rounded-lg text-[10px] font-semibold shadow-sm transition-all active:scale-95"
                              >
                                <LogOut className="w-3.5 h-3.5" />
                                Départ
                              </button>
                            )}
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

        {/* Sidebar Creation & Police Cards (Col 1) */}
        <div>
          {/* Add Stay Form */}
          {showAddForm && (
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4 animate-fade-in">
              <div className="flex justify-between items-center border-b pb-2">
                <h2 className="text-base font-outfit font-semibold text-gray-900">Nouveau Dossier de Séjour</h2>
                <button onClick={() => setShowAddForm(false)} className="text-xs text-gray-400 hover:text-gray-600">Fermer</button>
              </div>

              <form onSubmit={handleCreateBooking} className="space-y-4 text-xs text-gray-600">
                <div className="space-y-1">
                  <label className="block font-medium">Nom complet du client principal :</label>
                  <input
                    required
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Ex: Kouamé Yao"
                    className="w-full bg-gray-50 border border-gray-200 text-gray-700 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#fe6e00] outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block font-medium">Téléphone :</label>
                    <input
                      required
                      type="text"
                      value={guestPhone}
                      onChange={(e) => setGuestPhone(e.target.value)}
                      placeholder="Ex: +225 07..."
                      className="w-full bg-gray-50 border border-gray-200 text-gray-700 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#fe6e00] outline-none font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block font-medium">Email (Optionnel) :</label>
                    <input
                      type="email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      placeholder="Ex: yaok@gmail.com"
                      className="w-full bg-gray-50 border border-gray-200 text-gray-700 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#fe6e00] outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block font-medium">Attribuer Chambre :</label>
                    <select
                      required
                      value={roomNumber}
                      onChange={(e) => setRoomNumber(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 text-gray-700 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#fe6e00] outline-none font-bold"
                    >
                      <option value="">-- Choisir --</option>
                      {rooms.filter(r => r.status === 'Libre').map(r => (
                        <option key={r.id} value={r.id}>CH {r.id} ({r.type})</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block font-medium">Canal :</label>
                    <select
                      value={bookingSource}
                      onChange={(e) => setBookingSource(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 text-gray-700 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#fe6e00] outline-none"
                    >
                      <option value="Direct">Direct Desk</option>
                      <option value="Téléphone">Téléphone</option>
                      <option value="OTA">OTA (En ligne)</option>
                    </select>
                  </div>
                </div>

                {bookingSource === 'OTA' && (
                  <div className="grid grid-cols-2 gap-3 bg-blue-50/50 p-2.5 rounded-xl border border-blue-100">
                    <div className="space-y-1">
                      <label className="block font-medium text-blue-900">Plateforme :</label>
                      <select
                        value={channelName}
                        onChange={(e) => setChannelName(e.target.value)}
                        className="w-full bg-white border border-blue-200 text-gray-700 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-blue-400 outline-none"
                      >
                        <option value="Booking.com">Booking.com</option>
                        <option value="Expedia">Expedia</option>
                        <option value="Airbnb">Airbnb</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="block font-medium text-blue-900">Réf Booking :</label>
                      <input
                        type="text"
                        value={otaReference}
                        onChange={(e) => setOtaReference(e.target.value)}
                        placeholder="Ex: BKG-9921"
                        className="w-full bg-white border border-blue-200 text-gray-700 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-blue-400 outline-none font-mono"
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 font-mono">
                  <div className="space-y-1">
                    <label className="block font-medium text-gray-600">Arrivée :</label>
                    <input
                      required
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 text-gray-700 rounded-xl px-3 py-1.5 text-xs focus:ring-1 focus:ring-[#fe6e00] outline-none font-medium"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block font-medium text-gray-600">Départ :</label>
                    <input
                      required
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 text-gray-700 rounded-xl px-3 py-1.5 text-xs focus:ring-1 focus:ring-[#fe6e00] outline-none font-medium"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#fe6e00] hover:bg-[#ff6b00] text-white py-2 rounded-xl text-xs font-semibold shadow-sm transition-all active:scale-95"
                >
                  Enregistrer la réservation
                </button>
              </form>
            </div>
          )}

          {/* Active Police Form modal/view */}
          {activePoliceFormRes && (
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4 animate-fade-in">
              <div className="flex justify-between items-center border-b pb-2 border-gray-100">
                <div className="flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#fe6e00]" />
                  <h2 className="text-base font-outfit font-semibold text-gray-900">Fiche de Police Électronique</h2>
                </div>
                <button onClick={() => setActivePoliceFormRes(null)} className="text-xs text-gray-400 hover:text-gray-600">Annuler</button>
              </div>

              <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-[10px] text-amber-800 flex gap-1.5 leading-relaxed">
                <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold uppercase block mb-0.5">Réglementation Nationale Ivoirienne</span>
                  Conformément aux directives de sécurité à Bouaké, la fiche de police d'identité et la signature numérique sont obligatoires pour valider l'entrée au sein de l'établissement.
                </div>
              </div>

              <form onSubmit={handleCheckInSubmit} className="space-y-4 text-xs text-gray-600">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block font-medium">Sexe :</label>
                    <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 focus:ring-1 focus:ring-[#fe6e00] outline-none">
                      <option value="M">Masculin (M)</option>
                      <option value="F">Féminin (F)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block font-medium">Date de Naissance :</label>
                    <input type="date" required value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 focus:ring-1 focus:ring-[#fe6e00] outline-none font-mono" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block font-medium">Nationalité :</label>
                    <input type="text" required value={nationality} onChange={(e) => setNationality(e.target.value)} placeholder="Ex: Ivoirienne" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 focus:ring-1 focus:ring-[#fe6e00] outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="block font-medium">Pays d'Origine :</label>
                    <input type="text" required value={originCountry} onChange={(e) => setOriginCountry(e.target.value)} placeholder="Ex: Côte d'Ivoire" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 focus:ring-1 focus:ring-[#fe6e00] outline-none" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block font-medium">Type de pièce :</label>
                    <select value={idType} onChange={(e) => setIdType(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 focus:ring-1 focus:ring-[#fe6e00] outline-none font-medium">
                      <option value="CNI">Carte d'Identité Nationale</option>
                      <option value="Passport">Passeport International</option>
                      <option value="Permis">Permis de Conduire</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block font-medium">Numéro de pièce :</label>
                    <input type="text" required value={idNumber} onChange={(e) => setIdNumber(e.target.value)} placeholder="Ex: CI0029318" className="w-full bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 focus:ring-1 focus:ring-[#fe6e00] outline-none font-mono font-bold text-gray-900" />
                  </div>
                </div>

                {/* ID Scan Mock Attachment */}
                <div className="space-y-1.5">
                  <label className="block font-medium">Téléverser Scan / Photo de la Pièce :</label>
                  <div className="border border-dashed border-gray-200 rounded-xl p-3 bg-gray-50/50 flex flex-col items-center justify-center text-center cursor-pointer relative hover:bg-gray-100/65 transition-all">
                    <Upload className="w-5 h-5 text-gray-400 mb-1" />
                    <span className="text-[10px] text-gray-500 font-medium">Choisir un fichier d'image (CNI/Passport)</span>
                    <input type="file" accept="image/*" onChange={handleIdUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                  </div>
                  {docScanUrl && (
                    <div className="flex items-center gap-1 text-emerald-600 font-semibold text-[10px]">
                      <Check className="w-3.5 h-3.5" /> Pièce justificative chargée en cache
                    </div>
                  )}
                </div>

                {/* Signature Canvas */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="block font-medium">Signature numérique du client :</label>
                    <button type="button" onClick={clearSignature} className="text-[10px] text-gray-400 hover:text-red-500">Effacer</button>
                  </div>
                  <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                    <canvas
                      ref={canvasRef}
                      width={300}
                      height={100}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                      className="w-full h-24 cursor-crosshair"
                    />
                  </div>
                </div>

                <div className="flex items-start gap-2 py-1.5 border-t border-gray-50">
                  <input
                    type="checkbox"
                    required
                    id="policeTermsCheck"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="w-4 h-4 rounded text-[#fe6e00] focus:ring-[#fe6e00] shrink-0 mt-0.5"
                  />
                  <label htmlFor="policeTermsCheck" className="text-[10px] text-gray-500 leading-snug cursor-pointer select-none">
                    Je soussigné certifie sur l'honneur l'exactitude des renseignements ci-dessus et accepte les conditions générales du PMS Brunch Bouaké.
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#00c758] hover:bg-emerald-600 text-white py-2 rounded-xl text-xs font-semibold shadow-sm transition-all active:scale-95"
                >
                  Confirmer le Check-In de l'hôte
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
