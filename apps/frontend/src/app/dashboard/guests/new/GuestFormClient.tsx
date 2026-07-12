'use client';

import React, { useState } from 'react';
import { Button, Spinner } from '@/components/ui';
import { FloatingInput } from '@/components/ui/Input/FloatingInput';
import { createGuestAction } from '../actions';
import { useRouter } from 'next/navigation';

export default function GuestFormClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    idType: '',
    idNumber: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const sanitizeData = Object.fromEntries(
      Object.entries(formData).map(([key, value]) => [key, value === '' ? null : value])
    );

    const res = await createGuestAction(sanitizeData);
    
    if (res.success) {
      router.push('/dashboard/guests');
    } else {
      setError(res.error || 'Erreur lors de la création du client.');
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', backgroundColor: '#fff', padding: '32px', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
      {error && <div style={{ color: 'var(--color-status-error)', marginBottom: '16px', padding: '12px', backgroundColor: '#FEE2E2', borderRadius: '4px' }}>{error}</div>}
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <FloatingInput 
            label="Prénom"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            required
            placeholder=" "
          />
          <FloatingInput 
            label="Nom"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            required
            placeholder=" "
          />
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <FloatingInput 
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder=" "
          />
          <FloatingInput 
            label="Téléphone"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder=" "
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
            <select 
              value={formData.idType}
              onChange={(e) => setFormData({ ...formData, idType: e.target.value })}
              style={{ width: '100%', height: '54px', padding: '1.25rem 1rem 0.5rem 1rem', borderRadius: 'var(--radius-interactive)', border: '1px solid transparent', backgroundColor: 'var(--color-bg-subtle)', fontSize: '0.95rem', color: 'var(--color-text-primary)', outline: 'none', transition: 'border-color var(--transition-organic), background-color var(--transition-organic), box-shadow var(--transition-organic)' }}
            >
              <option value="">Sélectionner...</option>
              <option value="CNI">Carte d'identité</option>
              <option value="PASSPORT">Passeport</option>
              <option value="RESIDENCE_PERMIT">Titre de séjour</option>
              <option value="OTHER">Autre</option>
            </select>
            <label style={{ position: 'absolute', left: '1rem', top: '14px', transform: 'translateY(0) scale(0.75)', fontFamily: 'var(--font-body)', fontSize: '0.95rem', color: 'var(--color-brand-chocolate)', fontWeight: 600, pointerEvents: 'none', transformOrigin: 'left top' }}>Type de pièce d'identité</label>
          </div>
          <FloatingInput 
            label="Numéro de pièce"
            value={formData.idNumber}
            onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })}
            placeholder=" "
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
          <Button variant="outline" type="button" onClick={() => router.back()} disabled={loading}>
            Annuler
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? <Spinner size="sm" /> : 'Créer le client'}
          </Button>
        </div>
      </form>
    </div>
  );
}
