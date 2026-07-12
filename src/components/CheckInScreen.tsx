import React, { useState, useEffect, useRef } from 'react';
import { Room, Reservation, Guest, Payment } from '../types';
import { 
  UserCheck, 
  User, 
  CheckCircle, 
  MapPin, 
  Camera, 
  Phone, 
  Mail, 
  Search, 
  FileImage, 
  Eraser, 
  Languages
} from 'lucide-react';

interface CheckInScreenProps {
  rooms: Room[];
  reservations: Reservation[];
  guests: Guest[];
  payments: Payment[];
  setRooms: React.Dispatch<React.SetStateAction<Room[]>>;
  setReservations: React.Dispatch<React.SetStateAction<Reservation[]>>;
  setGuests: React.Dispatch<React.SetStateAction<Guest[]>>;
  setPayments: React.Dispatch<React.SetStateAction<Payment[]>>;
  triggerToast: (msg: string) => void;
  setActiveTab: (tab: any) => void;
  selectedCheckInReservationId?: string | null;
  setSelectedCheckInReservationId?: (id: string | null) => void;
}

export const CheckInScreen: React.FC<CheckInScreenProps> = ({
  rooms,
  reservations,
  guests,
  payments,
  setRooms,
  setReservations,
  setGuests,
  setPayments,
  triggerToast,
  setActiveTab,
  selectedCheckInReservationId = null,
  setSelectedCheckInReservationId
}) => {
  const todayStr = '2026-07-11';
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Selector state: Walk-In or Reservation check-in
  const [checkInMode, setCheckInMode] = useState<'walkin' | 'reservation'>(
    selectedCheckInReservationId ? 'reservation' : 'walkin'
  );
  const [selectedResId, setSelectedResId] = useState<string>(selectedCheckInReservationId || '');

  // Block A: Identité du client
  const [guestName, setGuestName] = useState('');
  const [gender, setGender] = useState('M'); // Sexe ou civilité: M, F, Autre
  const [birthDate, setBirthDate] = useState('1995-01-01');
  const [nationality, setNationality] = useState('Ivoirienne');
  const [idType, setIdType] = useState('CNI'); // CNI, Passeport, Permis, Autre
  const [idNumber, setIdNumber] = useState('');
  const [guestPhone, setGuestPhone] = useState('+225 ');
  const [guestEmail, setGuestEmail] = useState('');

  // Block B: Adresse et contact
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Bouaké');
  const [country, setCountry] = useState('Côte d\'Ivoire');
  const [postalCode, setPostalCode] = useState('');
  const [language, setLanguage] = useState('Français');
  const [emergencyContact, setEmergencyContact] = useState(''); // Nom et Téléphone

  // Block C: Données séjour
  const [roomNumber, setRoomNumber] = useState('');
  const [checkInDate, setCheckInDate] = useState(todayStr);
  const [checkOutDate, setCheckOutDate] = useState('2026-07-12');
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [notes, setNotes] = useState('');

  // Block E: Source & Distribution
  const [bookingSource, setBookingSource] = useState('Direct');
  const [channelType, setChannelType] = useState('Direct');
  const [channelName, setChannelName] = useState('Site Direct');
  const [otaReference, setOtaReference] = useState('');
  const [originCountry, setOriginCountry] = useState("Côte d'Ivoire");

  // Block D: Vérification et validation
  const [docScanUrl, setDocScanUrl] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [signatureData, setSignatureData] = useState('');

  // Signature canvas state
  const [isDrawing, setIsDrawing] = useState(false);

  // Available clean rooms
  const cleanRooms = rooms.filter(r => r.status === 'Libre' || r.id === roomNumber);

  // Financial simulation
  const selectedRoomObj = rooms.find(r => r.id === roomNumber);
  const nights = selectedRoomObj 
    ? Math.max(1, Math.ceil((new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 3600 * 24)))
    : 0;
  const simulatedTotalBill = selectedRoomObj ? selectedRoomObj.price * nights : 0;
  const [advancePaid, setAdvancePaid] = useState('0');
  const [paymentMethod, setPaymentMethod] = useState<'Espèces' | 'Orange Money' | 'MTN Momo' | 'Moov Money' | 'Carte Bancaire'>('Espèces');

  // Trigger pre-filling when a reservation is selected or passed as a prop
  useEffect(() => {
    const resId = selectedResId || selectedCheckInReservationId;
    if (resId && checkInMode === 'reservation') {
      const res = reservations.find(r => r.id === resId);
      if (res) {
        setGuestName(res.guestName);
        setGuestEmail(res.guestEmail);
        setRoomNumber(res.roomNumber);
        setCheckInDate(res.checkIn);
        setCheckOutDate(res.checkOut);
        setNotes(res.notes || '');
        setAdults(res.adults || 1);
        setChildren(res.children || 0);

        setBookingSource(res.bookingSource || res.source || 'Direct');
        setChannelType(res.channelType || 'Direct');
        setChannelName(res.channelName || 'Site Direct');
        setOtaReference(res.otaReference || '');
        setOriginCountry(res.originCountry || "Côte d'Ivoire");

        // Prefill contact if guest exists
        const matchingGuest = guests.find(g => g.email.toLowerCase() === res.guestEmail.toLowerCase());
        if (matchingGuest) {
          setGuestPhone(matchingGuest.phone);
          if (matchingGuest.notes) {
            setNotes(prev => prev ? `${prev}\n${matchingGuest.notes}` : matchingGuest.notes || '');
          }
        }
      }
    } else if (checkInMode === 'walkin') {
      setBookingSource('Walk-In');
      setChannelType('Offline');
      setChannelName('Walk-In (Physique)');
      setOtaReference('');
      setOriginCountry("Côte d'Ivoire");
    }
  }, [selectedResId, selectedCheckInReservationId, checkInMode, reservations, guests]);

  // Canvas drawing handlers for touch and mouse
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    let clientX = 0;
    let clientY = 0;
    
    if ('touches' in e) {
      if (e.touches.length === 0) return null;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const coords = getCanvasCoords(e);
    if (!ctx || !coords) return;

    ctx.strokeStyle = '#423d38';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const coords = getCanvasCoords(e);
    if (!ctx || !coords) return;

    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveSignature();
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

  const generateAutoSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = 'italic bold 24px "Playfair Display", "Brush Script MT", Georgia, serif';
    ctx.fillStyle = '#423d38';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const nameToSign = guestName || 'Client';
    ctx.fillText(nameToSign, canvas.width / 2, canvas.height / 2);
    
    // Add decorative underline loop
    ctx.strokeStyle = '#fe6e00';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(canvas.width * 0.15, canvas.height * 0.7);
    ctx.bezierCurveTo(canvas.width * 0.4, canvas.height * 0.85, canvas.width * 0.7, canvas.height * 0.55, canvas.width * 0.85, canvas.height * 0.7);
    ctx.stroke();

    saveSignature();
  };

  const saveSignature = () => {
    if (canvasRef.current) {
      setSignatureData(canvasRef.current.toDataURL());
    }
  };

  // Document Scan Simulator
  const handleSimulateScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      // Generate a mock base64/placeholder of an elegant scan
      const idTypesMap: Record<string, string> = {
        CNI: 'Carte Nationale d\'Identité',
        Passeport: 'Passeport International',
        Permis: 'Permis de Conduire',
        Autre: 'Document Officiel'
      };
      const typeLabel = idTypesMap[idType] || 'ID Document';
      
      const canvas = document.createElement('canvas');
      canvas.width = 400;
      canvas.height = 250;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Draw card background
        ctx.fillStyle = '#f3f4f6';
        ctx.fillRect(0, 0, 400, 250);
        
        // Border
        ctx.strokeStyle = '#e3e0dd';
        ctx.lineWidth = 6;
        ctx.strokeRect(3, 3, 394, 244);
        
        // Header
        ctx.fillStyle = '#fe6e00';
        ctx.fillRect(6, 6, 388, 40);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText(`RÉPUBLIQUE DE CÔTE D'IVOIRE • ${typeLabel.toUpperCase()}`, 20, 30);
        
        // Photo placeholder
        ctx.fillStyle = '#e3e0dd';
        ctx.fillRect(25, 65, 100, 120);
        ctx.strokeStyle = '#797067';
        ctx.lineWidth = 1;
        ctx.strokeRect(25, 65, 100, 120);
        ctx.fillStyle = '#797067';
        ctx.font = '10px sans-serif';
        ctx.fillText('PHOTO CLIENT', 35, 125);
        
        // Details
        ctx.fillStyle = '#423d38';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText(`Nom: ${guestName || 'KOUAMÉ YAO'}`, 140, 80);
        ctx.fillText(`Né(e) le: ${birthDate}`, 140, 100);
        ctx.fillText(`Nationalité: ${nationality}`, 140, 120);
        ctx.fillText(`Numéro: ${idNumber || 'CI-0038491823'}`, 140, 140);
        ctx.fillText(`Date d'émission: 12/03/2024`, 140, 160);
        
        // Footer bar
        ctx.fillStyle = '#797067';
        ctx.font = 'bold 8px monospace';
        ctx.fillText(`ID_CI<<${(guestName || 'GUEST').toUpperCase().replace(/\s+/g, '<')}<<<<<<<<<<<<<<<<<<`, 20, 215);
        ctx.fillText(`NUM<<${idNumber || '0038491823'}<<9501017M202607117<<<<<<<<`, 20, 230);
        
        setDocScanUrl(canvas.toDataURL());
        triggerToast(`Document d'identité (${idType}) scanné avec succès !`);
      }
    }, 1500);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!guestName) {
      alert("Veuillez renseigner le nom complet du client.");
      return;
    }
    if (!roomNumber) {
      alert("Veuillez attribuer une chambre.");
      return;
    }
    if (!agreedToTerms) {
      alert("Le client doit accepter les conditions générales de séjour.");
      return;
    }

    const targetRoom = rooms.find(r => r.id === roomNumber);
    if (!targetRoom) {
      alert("Chambre introuvable.");
      return;
    }

    const parsedAdvance = Number(advancePaid) || 0;
    let finalResId = '';

    // Create or update Reservation
    if (checkInMode === 'reservation' && selectedResId) {
      // Check-in on existing reservation
      finalResId = selectedResId;
      setReservations(prev => prev.map(res => {
        if (res.id === selectedResId) {
          return {
            ...res,
            status: 'En Cours',
            // Save extended fields
            gender,
            birthDate,
            nationality,
            idType,
            idNumber,
            guestPhone,
            address,
            city,
            country,
            postalCode,
            language,
            emergencyContact,
            adults,
            children,
            notes: notes ? `${res.notes ? res.notes + '\n' : ''}${notes}` : res.notes,
            docScanUrl: docScanUrl || undefined,
            signatureData: signatureData || undefined,
            agreedToTerms: true,
            paidAmount: res.paidAmount + parsedAdvance,
            totalBill: simulatedTotalBill > 0 ? simulatedTotalBill : res.totalBill,
            // Source & Distribution
            source: bookingSource,
            bookingSource: bookingSource,
            channelType,
            channelName,
            otaReference,
            originCountry
          };
        }
        return res;
      }));
    } else {
      // Walk-in direct
      finalResId = `RES-${String(reservations.length + 1).padStart(3, '0')}`;
      const newRes: Reservation = {
        id: finalResId,
        guestName,
        guestEmail: guestEmail || `${guestName.toLowerCase().replace(/\s+/g, '')}@example.com`,
        roomNumber,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        totalBill: simulatedTotalBill,
        paidAmount: parsedAdvance,
        status: 'En Cours',
        // Extended fields
        gender,
        birthDate,
        nationality,
        idType,
        idNumber,
        guestPhone,
        address,
        city,
        country,
        postalCode,
        language,
        emergencyContact,
        adults,
        children,
        notes,
        docScanUrl: docScanUrl || undefined,
        signatureData: signatureData || undefined,
        agreedToTerms: true,
        // Source & Distribution
        source: bookingSource,
        bookingSource: bookingSource,
        channelType,
        channelName,
        otaReference,
        originCountry
      };
      setReservations(prev => [newRes, ...prev]);
    }

    // 2. Manage Guest profile
    const existingGuestIndex = guests.findIndex(g => g.email.toLowerCase() === (guestEmail || '').toLowerCase());
    if (existingGuestIndex === -1) {
      const newGuest: Guest = {
        id: `GST-${String(guests.length + 1).padStart(3, '0')}`,
        name: guestName,
        email: guestEmail || `${guestName.toLowerCase().replace(/\s+/g, '')}@example.com`,
        phone: guestPhone,
        status: 'Nouveau',
        notes: `Enregistré via Check-In administrative (Chambre ${roomNumber})`
      };
      setGuests(prev => [...prev, newGuest]);
    } else {
      // Update guest notes and phone
      setGuests(prev => prev.map((g, idx) => idx === existingGuestIndex ? {
        ...g,
        phone: guestPhone,
        notes: notes ? `${g.notes ? g.notes + ' | ' : ''}${notes}` : g.notes
      } : g));
    }

    // 3. Register payment if any
    if (parsedAdvance > 0) {
      const newPay: Payment = {
        id: `PAY-${String(payments.length + 1).padStart(3, '0')}`,
        reservationId: finalResId,
        guestName,
        amount: parsedAdvance,
        method: paymentMethod,
        date: `${todayStr} 17:30`,
        reference: `CHKIN-${Math.floor(100000 + Math.random() * 900000)}`
      };
      setPayments(prev => [newPay, ...prev]);
    }

    // 4. Set Room as Occupied
    setRooms(prev => prev.map(r => r.id === roomNumber ? { ...r, status: 'Occupé' } : r));

    triggerToast(`Check-In administrative validé pour ${guestName} en chambre ${roomNumber} !`);

    // Reset temporary checkin reservation ID
    if (setSelectedCheckInReservationId) {
      setSelectedCheckInReservationId(null);
    }

    // Navigate to inhouse stay
    setActiveTab('inhouse');
  };

  const handleClosePrefill = () => {
    if (setSelectedCheckInReservationId) {
      setSelectedCheckInReservationId(null);
    }
    setSelectedResId('');
  };

  // Find confirmed reservations to check-in
  const confirmedReservations = reservations.filter(r => r.status === 'Confirmé');

  return (
    <div className="flex flex-col gap-6 animate-fade-in text-xs" id="checkin_screen">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#423d38] tracking-tight">Formulaire d'Enregistrement Administratif</h2>
          <p className="text-xs text-[#797067]">Parcours d'accueil complet en 4 blocs avec conformité, scanner et signature électronique.</p>
        </div>
        
        {/* Toggle between walk-in and check-in on reservation */}
        <div className="flex bg-[#edebe9] p-1 rounded-lg border border-[#e3e0dd]">
          <button
            onClick={() => { setCheckInMode('walkin'); handleClosePrefill(); }}
            className={`px-4 py-1.5 rounded-md font-bold text-[11px] transition-all cursor-pointer ${
              checkInMode === 'walkin' ? 'bg-white text-[#fe6e00] shadow-xs' : 'text-[#797067] hover:text-[#423d38]'
            }`}
          >
            Arrivée Directe (Walk-In)
          </button>
          <button
            onClick={() => setCheckInMode('reservation')}
            className={`px-4 py-1.5 rounded-md font-bold text-[11px] transition-all cursor-pointer ${
              checkInMode === 'reservation' ? 'bg-white text-[#fe6e00] shadow-xs' : 'text-[#797067] hover:text-[#423d38]'
            }`}
          >
            Check-In sur Réservation
          </button>
        </div>
      </div>

      {/* CONFIRMED RESERVATION DROPDOWN SELECTOR */}
      {checkInMode === 'reservation' && (
        <div className="bg-[#fe6e00]/5 border border-[#fe6e00]/20 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-[#fe6e00]/10 p-2 rounded-lg text-[#fe6e00]">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-[#423d38] text-xs block">Recherche du dossier client</span>
              <p className="text-[10px] text-[#797067]">Associer une réservation existante pour importer les informations.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedResId}
              onChange={(e) => setSelectedResId(e.target.value)}
              className="bg-white border border-[#e3e0dd] rounded-md p-2 w-full sm:w-64 font-semibold text-[#423d38] focus:border-[#fe6e00] focus:outline-none"
            >
              <option value="">-- Sélectionner un dossier (Réservation) --</option>
              {confirmedReservations.map(r => (
                <option key={r.id} value={r.id}>
                  {r.guestName} ({r.id}) • CH {r.roomNumber} ({r.checkIn})
                </option>
              ))}
            </select>
            {selectedResId && (
              <button
                onClick={handleClosePrefill}
                className="text-xs text-[#797067] hover:text-[#fb2c36] font-bold px-2 py-1 cursor-pointer"
              >
                Vider
              </button>
            )}
          </div>
        </div>
      )}

      {/* COMPREHENSIVE 4-BLOCK FORM GRID */}
      <form onSubmit={handleFormSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Main Form Sections A, B, C */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* BLOCK A: IDENTITÉ DU CLIENT */}
          <div className="bg-white p-5 rounded-xl border border-[#e3e0dd] shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-[#f3f4f6] pb-2 text-[#423d38] font-bold">
              <span className="w-5 h-5 rounded-full bg-[#fe6e00]/10 text-[#fe6e00] flex items-center justify-center font-extrabold text-[11px]">A</span>
              <h3 className="text-sm">Identité du Client</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Nom complet :</label>
                <div className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md px-3 py-2 flex items-center gap-2 focus-within:border-[#fe6e00]">
                  <User className="w-3.5 h-3.5 text-[#797067]" />
                  <input
                    type="text"
                    required
                    placeholder="Nom et Prénoms du client"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="bg-transparent flex-1 focus:outline-none font-bold text-[#423d38]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Civilité / Sexe :</label>
                <div className="flex gap-4 mt-1.5">
                  <label className="flex items-center gap-1.5 font-semibold text-[#423d38] cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value="M"
                      checked={gender === 'M'}
                      onChange={() => setGender('M')}
                      className="accent-[#fe6e00]"
                    />
                    Homme
                  </label>
                  <label className="flex items-center gap-1.5 font-semibold text-[#423d38] cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value="F"
                      checked={gender === 'F'}
                      onChange={() => setGender('F')}
                      className="accent-[#fe6e00]"
                    />
                    Femme
                  </label>
                  <label className="flex items-center gap-1.5 font-semibold text-[#423d38] cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value="Autre"
                      checked={gender === 'Autre'}
                      onChange={() => setGender('Autre')}
                      className="accent-[#fe6e00]"
                    />
                    Autre
                  </label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Date de naissance :</label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-2 focus:outline-none focus:border-[#fe6e00] font-semibold text-[#423d38]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Nationalité :</label>
                <input
                  type="text"
                  placeholder="Ivoirienne, Française, etc."
                  value={nationality}
                  onChange={(e) => setNationality(e.target.value)}
                  className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-2.5 focus:outline-none focus:border-[#fe6e00] font-bold text-[#423d38]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Type de pièce d'identité :</label>
                <select
                  value={idType}
                  onChange={(e) => setIdType(e.target.value)}
                  className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-2.5 focus:outline-none focus:border-[#fe6e00] font-bold text-[#423d38]"
                >
                  <option value="CNI">Carte Nationale d'Identité (CNI)</option>
                  <option value="Passeport">Passeport</option>
                  <option value="Permis">Permis de Conduire</option>
                  <option value="Autre">Autre carte officielle</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Numéro de la pièce :</label>
                <input
                  type="text"
                  placeholder="Ex: CI010384238 / B023491"
                  value={idNumber}
                  onChange={(e) => setIdNumber(e.target.value)}
                  className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-2.5 focus:outline-none focus:border-[#fe6e00] font-mono font-bold text-[#423d38]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Téléphone :</label>
                <div className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md px-3 py-2 flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#797067]" />
                  <input
                    type="text"
                    placeholder="+225 05..."
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    className="bg-transparent flex-1 focus:outline-none font-semibold text-[#423d38]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Adresse E-mail :</label>
                <div className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md px-3 py-2 flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#797067]" />
                  <input
                    type="email"
                    placeholder="client@mail.com"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    className="bg-transparent flex-1 focus:outline-none text-[#423d38]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* BLOCK B: ADRESSE ET CONTACT */}
          <div className="bg-white p-5 rounded-xl border border-[#e3e0dd] shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-[#f3f4f6] pb-2 text-[#423d38] font-bold">
              <span className="w-5 h-5 rounded-full bg-[#fe6e00]/10 text-[#fe6e00] flex items-center justify-center font-extrabold text-[11px]">B</span>
              <h3 className="text-sm">Adresse & Contact Local</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Adresse domiciliaire :</label>
                <div className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md px-3 py-2 flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-[#797067]" />
                  <input
                    type="text"
                    placeholder="Quartier, Rue, Logement"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="bg-transparent flex-1 focus:outline-none text-[#423d38]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Ville de résidence :</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-2.5 focus:outline-none focus:border-[#fe6e00] text-[#423d38] font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1">
                <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Pays :</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-2.5 focus:outline-none focus:border-[#fe6e00] text-[#423d38] font-semibold"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Code Postal / Boîte Postale :</label>
                <input
                  type="text"
                  placeholder="BP..."
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-2.5 focus:outline-none focus:border-[#fe6e00] text-[#423d38]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Langue préférée :</label>
                <div className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md px-2 py-1.5 flex items-center gap-1">
                  <Languages className="w-3.5 h-3.5 text-[#797067]" />
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="bg-transparent flex-1 focus:outline-none text-[#423d38] font-semibold"
                  >
                    <option value="Français">Français</option>
                    <option value="Anglais">English</option>
                    <option value="Espagnol">Español</option>
                    <option value="Arabe">العربية</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Contact d'urgence (Nom complet, relation et téléphone) :</label>
              <input
                type="text"
                placeholder="Ex: Kouamé Koffi (Frère) - +225 07..."
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-2.5 focus:outline-none focus:border-[#fe6e00] text-[#423d38] font-medium"
              />
            </div>
          </div>

          {/* BLOCK C: DONNÉES DU SÉJOUR */}
          <div className="bg-white p-5 rounded-xl border border-[#e3e0dd] shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-[#f3f4f6] pb-2 text-[#423d38] font-bold">
              <span className="w-5 h-5 rounded-full bg-[#fe6e00]/10 text-[#fe6e00] flex items-center justify-center font-extrabold text-[11px]">C</span>
              <h3 className="text-sm">Données du Séjour</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Chambre attribuée :</label>
                <select
                  required
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-2.5 focus:outline-none focus:border-[#fe6e00] font-bold text-[#423d38]"
                >
                  <option value="">-- Choisir une chambre (Propre) --</option>
                  {cleanRooms.map(r => (
                    <option key={r.id} value={r.id}>
                      CH {r.id} • {r.type} ({r.price.toLocaleString()} F/nuit) - {r.status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Réservation liée :</label>
                <input
                  type="text"
                  readOnly
                  disabled
                  placeholder="Généré automatiquement"
                  value={selectedResId ? `Réf: ${selectedResId}` : 'Aucune (Walk-In direct)'}
                  className="bg-[#edebe9] border border-[#e3e0dd] rounded-md p-2.5 text-[#797067] font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Date d'arrivée :</label>
                <input
                  type="date"
                  required
                  disabled={checkInMode === 'reservation'}
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  className="bg-[#f3f4f6] disabled:bg-[#edebe9] border border-[#e3e0dd] rounded-md p-2.5 focus:outline-none focus:border-[#fe6e00] font-semibold text-[#423d38]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Date de départ prévue :</label>
                <input
                  type="date"
                  required
                  value={checkOutDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-2.5 focus:outline-none focus:border-[#fe6e00] font-semibold text-[#423d38]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Nombre d'adultes :</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setAdults(prev => Math.max(1, prev - 1))}
                    className="w-8 h-8 rounded-md bg-[#f3f4f6] border border-[#e3e0dd] font-black hover:bg-[#edebe9] transition-colors"
                  >
                    -
                  </button>
                  <span className="font-extrabold text-sm w-8 text-center">{adults}</span>
                  <button
                    type="button"
                    onClick={() => setAdults(prev => prev + 1)}
                    className="w-8 h-8 rounded-md bg-[#f3f4f6] border border-[#e3e0dd] font-black hover:bg-[#edebe9] transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Nombre d'enfants :</label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setChildren(prev => Math.max(0, prev - 1))}
                    className="w-8 h-8 rounded-md bg-[#f3f4f6] border border-[#e3e0dd] font-black hover:bg-[#edebe9] transition-colors"
                  >
                    -
                  </button>
                  <span className="font-extrabold text-sm w-8 text-center">{children}</span>
                  <button
                    type="button"
                    onClick={() => setChildren(prev => prev + 1)}
                    className="w-8 h-8 rounded-md bg-[#f3f4f6] border border-[#e3e0dd] font-black hover:bg-[#edebe9] transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Source & Distribution */}
            <div className="border-t border-[#f3f4f6] pt-3 flex flex-col gap-3">
              <span className="font-extrabold text-[#797067] uppercase tracking-widest text-[9px] block">Source & Distribution</span>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Source globale :</label>
                  <select
                    value={bookingSource}
                    onChange={(e) => {
                      const val = e.target.value;
                      setBookingSource(val);
                      
                      let type = 'Offline';
                      if (val === 'Direct') {
                        type = 'Direct';
                        setChannelName('Site Direct');
                      } else if (val === 'OTA') {
                        type = 'OTA';
                        setChannelName('Booking.com');
                      } else {
                        type = 'Offline';
                        if (val === 'Téléphone') setChannelName('Appel Téléphonique');
                        else if (val === 'Walk-In') setChannelName('Walk-In');
                        else setChannelName('Agence de voyage');
                      }
                      setChannelType(type);
                    }}
                    className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-2 focus:outline-none focus:border-[#fe6e00] text-[#423d38] font-semibold"
                  >
                    <option value="Direct">Direct (Site Internet)</option>
                    <option value="OTA">OTA (Booking, Expedia, Airbnb)</option>
                    <option value="Agence">Agence de Voyage</option>
                    <option value="Téléphone">Appel Téléphonique</option>
                    <option value="Walk-In">Walk-In (Physique)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Type de canal :</label>
                  <select
                    value={channelType}
                    onChange={(e) => setChannelType(e.target.value)}
                    className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-2 focus:outline-none focus:border-[#fe6e00] text-[#423d38] font-semibold"
                  >
                    <option value="Direct">Direct</option>
                    <option value="OTA">OTA</option>
                    <option value="Offline">Offline / Agence</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Nom du canal :</label>
                  <input
                    type="text"
                    required
                    value={channelName}
                    onChange={(e) => setChannelName(e.target.value)}
                    placeholder="Ex: Booking.com, Airbnb, Walk-In"
                    className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-2 focus:outline-none focus:border-[#fe6e00] text-[#423d38] font-medium"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px] flex items-center gap-1">
                    Référence OTA {bookingSource !== 'OTA' && <span className="text-[8px] text-[#797067] italic font-normal">(Opt.)</span>} :
                  </label>
                  <input
                    type="text"
                    value={otaReference}
                    onChange={(e) => setOtaReference(e.target.value)}
                    placeholder={bookingSource === 'OTA' ? "Ex: BKG-3829" : "Optionnel"}
                    required={bookingSource === 'OTA'}
                    className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-2 focus:outline-none focus:border-[#fe6e00] text-[#423d38] font-medium"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Pays d'origine :</label>
                  <input
                    type="text"
                    value={originCountry}
                    onChange={(e) => setOriginCountry(e.target.value)}
                    placeholder="Ex: Côte d'Ivoire, France"
                    className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-2 focus:outline-none focus:border-[#fe6e00] text-[#423d38] font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Notes particulières & Consignes d'accueil :</label>
              <textarea
                placeholder="Ex: Petit déjeuner sans gluten, lit bébé requis, départ tardif..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-2.5 focus:outline-none focus:border-[#fe6e00] text-[#423d38] font-medium"
              />
            </div>
          </div>
        </div>

        {/* Right 1 Column: Block D & Final Summary */}
        <div className="flex flex-col gap-6">
          
          {/* BLOCK D: VÉRIFICATION ET VALIDATION */}
          <div className="bg-white p-5 rounded-xl border border-[#e3e0dd] shadow-sm flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-[#f3f4f6] pb-2 text-[#423d38] font-bold">
              <span className="w-5 h-5 rounded-full bg-[#fe6e00]/10 text-[#fe6e00] flex items-center justify-center font-extrabold text-[11px]">D</span>
              <h3 className="text-sm">Vérification & Validation</h3>
            </div>

            {/* Document Scan block */}
            <div className="flex flex-col gap-2">
              <span className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Photo ou scan du document d'identité :</span>
              
              {docScanUrl ? (
                <div className="flex flex-col gap-2">
                  <div className="border border-[#e3e0dd] rounded-lg overflow-hidden relative group">
                    <img src={docScanUrl} alt="Scan document" className="w-full h-auto object-cover max-h-36" referrerPolicy="no-referrer" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <button
                        type="button"
                        onClick={() => setDocScanUrl(null)}
                        className="bg-[#fb2c36] text-white p-2 rounded-lg text-xs font-bold hover:bg-[#d91620] cursor-pointer"
                      >
                        Effacer le scan
                      </button>
                    </div>
                  </div>
                  <span className="text-[10px] text-[#00c758] font-bold flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Fichier numérisé conforme.
                  </span>
                </div>
              ) : (
                <div className="border border-dashed border-[#e3e0dd] bg-[#f3f4f6]/50 rounded-lg p-4 flex flex-col items-center justify-center gap-3 text-center">
                  <FileImage className="w-8 h-8 text-[#797067]" />
                  <div className="flex flex-col">
                    <span className="font-bold text-[#423d38] text-[11px]">Aucun scan attaché</span>
                    <span className="text-[10px] text-[#797067]">Téléversez ou simulez la capture instantanée.</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleSimulateScan}
                      disabled={isScanning}
                      className="bg-[#fe6e00] hover:bg-[#ff6b00] disabled:bg-[#797067] text-white font-bold px-3 py-1.5 rounded-md flex items-center gap-1 cursor-pointer transition-all"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      {isScanning ? 'Scanner en cours...' : 'Simuler un Scan'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Signature block */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Signature du Client (Écran tactile ou souris) :</span>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={clearSignature}
                    className="text-[#797067] hover:text-[#fb2c36] flex items-center gap-0.5 font-bold cursor-pointer"
                    title="Effacer la signature"
                  >
                    <Eraser className="w-3.5 h-3.5" /> Effacer
                  </button>
                  <button
                    type="button"
                    onClick={generateAutoSignature}
                    className="text-[#fe6e00] hover:text-[#ff6b00] flex items-center gap-0.5 font-bold cursor-pointer"
                    title="Générer une signature manuscrite automatique"
                  >
                    Auto-signer
                  </button>
                </div>
              </div>

              <div className="border border-[#e3e0dd] rounded-lg overflow-hidden bg-white relative">
                <canvas
                  ref={canvasRef}
                  width={280}
                  height={110}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-28 cursor-crosshair bg-slate-50"
                />
                {!signatureData && (
                  <div className="absolute inset-0 flex items-center justify-center text-center text-[#797067] pointer-events-none text-[10px] italic">
                    Signez ici
                  </div>
                )}
              </div>
              {signatureData && (
                <span className="text-[10px] text-[#00c758] font-bold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Signature numérisée stockée.
                </span>
              )}
            </div>

            {/* Terms and conditions */}
            <div className="bg-[#f3f4f6] p-3 rounded-lg border border-[#e3e0dd] flex flex-col gap-2 mt-1">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 accent-[#fe6e00]"
                />
                <span className="text-[10px] text-[#423d38] font-semibold leading-relaxed">
                  Je certifie l'identité du client, confirme l'attribution de la <strong>Chambre {roomNumber || '?'}</strong> et certifie la signature du contrat d'hébergement.
                </span>
              </label>
            </div>
          </div>

          {/* FINANCIAL SUMMARY & ACTIONS */}
          <div className="bg-white p-5 rounded-xl border border-[#e3e0dd] shadow-sm flex flex-col gap-4 text-xs">
            <h3 className="font-bold text-[#423d38] text-sm border-b border-[#e3e0dd] pb-2">Récapitulatif Financier</h3>
            
            {roomNumber ? (
              <div className="flex flex-col gap-3">
                <div className="flex justify-between font-semibold">
                  <span>Chambre CH {roomNumber} ({selectedRoomObj?.type}) :</span>
                  <span>{selectedRoomObj?.price.toLocaleString()} F / nuit</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Durée calculée :</span>
                  <span className="text-[#fe6e00] font-bold">{nights} nuit(s)</span>
                </div>
                <div className="h-px bg-[#e3e0dd]"></div>

                <div className="flex justify-between text-sm font-bold text-[#423d38]">
                  <span>Coût Total Hébergement :</span>
                  <span>{simulatedTotalBill.toLocaleString()} F</span>
                </div>

                {/* Walk-in or reservation advance payment registration */}
                <div className="flex flex-col gap-2 bg-[#f3f4f6] p-3 rounded-lg border border-[#e3e0dd]">
                  <div className="flex justify-between items-center">
                    <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Acompte à payer (F) :</label>
                    <input
                      type="number"
                      value={advancePaid}
                      onChange={(e) => setAdvancePaid(e.target.value)}
                      className="bg-white border border-[#e3e0dd] rounded-md p-1 w-28 text-right font-bold text-[#423d38]"
                    />
                  </div>
                  
                  {Number(advancePaid) > 0 && (
                    <div className="flex justify-between items-center">
                      <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Mode de paiement :</label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value as any)}
                        className="bg-white border border-[#e3e0dd] rounded-md p-1 text-[11px] font-semibold text-[#423d38]"
                      >
                        <option value="Espèces">Espèces</option>
                        <option value="Orange Money">Orange Money</option>
                        <option value="MTN Momo">MTN Momo</option>
                        <option value="Moov Money">Moov Money</option>
                        <option value="Carte Bancaire">Carte Bancaire</option>
                      </select>
                    </div>
                  )}
                </div>

                <div className="flex justify-between text-sm text-[#016630] font-bold">
                  <span>Acompte enregistré :</span>
                  <span>{(Number(advancePaid) || 0).toLocaleString()} F</span>
                </div>

                <div className="h-px bg-[#e3e0dd]"></div>

                <div className="flex justify-between text-base font-black text-[#fb2c36]">
                  <span>Reste à payer (Folio) :</span>
                  <span>{(simulatedTotalBill - (Number(advancePaid) || 0)).toLocaleString()} F</span>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-[#797067] italic text-[11px]">
                Sélectionnez une chambre pour calculer les nuitées et simuler la facture.
              </div>
            )}

            <button
              type="submit"
              className="bg-[#fe6e00] hover:bg-[#ff6b00] text-white font-bold py-3 rounded-lg transition-all text-center mt-2 flex items-center justify-center gap-2 text-xs cursor-pointer shadow-sm"
            >
              <UserCheck className="w-4.5 h-4.5" />
              Valider l'Entrée & Activer la Chambre
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
