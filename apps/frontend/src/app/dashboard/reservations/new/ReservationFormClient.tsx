'use client';

import React, { useState } from 'react';
import { Button, Spinner } from '@/components/ui';
import { FloatingInput } from '@/components/ui/Input/FloatingInput';
import { createReservationAction } from './actions';
import { useRouter } from 'next/navigation';

export default function ReservationFormClient({ guests, rooms }: { guests: any[], rooms: any[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    guestId: '',
    roomId: '',
    checkInDate: '',
    checkOutDate: '',
    agreedRate: ''
  });

  const handleRoomChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const roomId = e.target.value;
    const room = rooms.find(r => r.id.toString() === roomId);
    let newRate = formData.agreedRate;
    
    if (room && room.roomType) {
      newRate = room.roomType.baseRate.toString();
    }
    
    setFormData({
      ...formData,
      roomId,
      agreedRate: newRate
    });
  };

  const calculateEstimatedTotal = () => {
    if (!formData.checkInDate || !formData.checkOutDate || !formData.agreedRate) return null;
    const checkIn = new Date(formData.checkInDate).getTime();
    const checkOut = new Date(formData.checkOutDate).getTime();
    if (checkOut <= checkIn) return null; // Invalid dates
    const nights = Math.max(1, Math.ceil((checkOut - checkIn) / (1000 * 3600 * 24)));
    return parseFloat(formData.agreedRate) * nights;
  };

  const estimatedTotal = calculateEstimatedTotal();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = {
      ...formData,
      guestId: parseInt(formData.guestId, 10),
      roomId: formData.roomId ? parseInt(formData.roomId, 10) : undefined,
      agreedRate: parseFloat(formData.agreedRate)
    };

    const res = await createReservationAction(payload);
    
    if (res.success) {
      router.push('/dashboard/reservations');
    } else {
      // 409 Conflict handling for overlaps
      if (res.error.includes('409') || res.error.toLowerCase().includes('chevauchement') || res.error.toLowerCase().includes('overlap') || res.error.toLowerCase().includes('unavailable')) {
        setError('Erreur 409 : Cette chambre est déjà occupée ou réservée sur les dates sélectionnées.');
      } else {
        setError(res.error || 'Erreur lors de la création de la réservation.');
      }
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', backgroundColor: '#fff', padding: '32px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
      {error && <div style={{ color: '#fff', marginBottom: '16px', padding: '12px', backgroundColor: 'var(--color-status-error)', borderRadius: '4px', fontWeight: 500 }}>{error}</div>}
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
          <select 
            value={formData.guestId}
            onChange={(e) => setFormData({ ...formData, guestId: e.target.value })}
            required
            style={{ width: '100%', height: '54px', padding: '1.25rem 1rem 0.5rem 1rem', borderRadius: 'var(--radius-interactive)', border: '1px solid transparent', backgroundColor: 'var(--color-bg-subtle)', fontSize: '0.95rem', color: 'var(--color-text-primary)', outline: 'none', transition: 'border-color var(--transition-organic), background-color var(--transition-organic), box-shadow var(--transition-organic)' }}
          >
            <option value="">Sélectionner un client...</option>
            {guests.map(g => (
              <option key={g.id} value={g.id}>{g.firstName} {g.lastName} ({g.email || g.phone || 'Sans contact'})</option>
            ))}
          </select>
          <label style={{ position: 'absolute', left: '1rem', top: '14px', transform: 'translateY(0) scale(0.75)', fontFamily: 'var(--font-body)', fontSize: '0.95rem', color: 'var(--color-brand-chocolate)', fontWeight: 600, pointerEvents: 'none', transformOrigin: 'left top' }}>Client *</label>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <FloatingInput 
            label="Date d'arrivée"
            type="date"
            value={formData.checkInDate}
            onChange={(e) => setFormData({ ...formData, checkInDate: e.target.value })}
            required
            placeholder=" "
          />
          <FloatingInput 
            label="Date de départ"
            type="date"
            value={formData.checkOutDate}
            onChange={(e) => setFormData({ ...formData, checkOutDate: e.target.value })}
            required
            placeholder=" "
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
            <select 
              value={formData.roomId}
              onChange={handleRoomChange}
              style={{ width: '100%', height: '54px', padding: '1.25rem 1rem 0.5rem 1rem', borderRadius: 'var(--radius-interactive)', border: '1px solid transparent', backgroundColor: 'var(--color-bg-subtle)', fontSize: '0.95rem', color: 'var(--color-text-primary)', outline: 'none', transition: 'border-color var(--transition-organic), background-color var(--transition-organic), box-shadow var(--transition-organic)' }}
            >
              <option value="">Aucune (Assignation ultérieure)</option>
              {rooms.map(r => (
                <option key={r.id} value={r.id}>{r.number} ({r.roomType?.name})</option>
              ))}
            </select>
            <label style={{ position: 'absolute', left: '1rem', top: '14px', transform: 'translateY(0) scale(0.75)', fontFamily: 'var(--font-body)', fontSize: '0.95rem', color: 'var(--color-brand-chocolate)', fontWeight: 600, pointerEvents: 'none', transformOrigin: 'left top' }}>Chambre (Optionnel)</label>
          </div>
          <FloatingInput 
            label="Tarif prévisionnel (CFA)"
            type="number"
            value={formData.agreedRate}
            onChange={(e) => setFormData({ ...formData, agreedRate: e.target.value })}
            required
            placeholder=" "
          />
        </div>

        {estimatedTotal !== null && estimatedTotal > 0 && (
          <div style={{ backgroundColor: 'var(--color-bg-subtle)', padding: '16px', borderRadius: '8px', border: '1px solid var(--color-brand-gold-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <span style={{ fontWeight: 500, color: 'var(--color-brand-chocolate)' }}>Montant estimé du séjour :</span>
             <span style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--color-brand-chocolate)' }}>
               {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(estimatedTotal)}
             </span>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
          <Button variant="outline" type="button" onClick={() => router.back()} disabled={loading}>
            Annuler
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? <><Spinner size="sm" /> Traitement en cours...</> : 'Créer la réservation'}
          </Button>
        </div>
      </form>
    </div>
  );
}
