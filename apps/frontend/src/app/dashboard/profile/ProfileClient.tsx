'use client';

import React, { useState } from 'react';
import { Button, Input, Spinner } from '@/components/ui';
import { changePasswordAction } from './actions';
import { logoutAction } from '@/lib/auth.actions';
import styles from './profile.module.css';

export default function ProfileClient() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    if (password.length < 8) {
      setError('Le mot de passe doit faire au moins 8 caractères.');
      return;
    }

    setLoading(true);
    const res = await changePasswordAction(password);
    setLoading(false);

    if (res.success) {
      setSuccess('Mot de passe changé avec succès. Vos sessions sur les autres appareils sont invalidées. Vous allez être déconnecté dans un instant pour vous reconnecter avec le nouveau mot de passe.');
      setPassword('');
      setConfirmPassword('');
      // Optionnel: On peut forcer un logout direct après 3 secondes pour prouver l'invalidation locale
      setTimeout(() => {
        const form = document.createElement('form');
        form.action = logoutAction as unknown as string;
        form.method = 'POST';
        document.body.appendChild(form);
        form.submit();
      }, 3000);
    } else {
      setError(res.error || 'Erreur inconnue.');
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Sécurité et Profil</h2>
      
      {error && <div className={styles.error}>{error}</div>}
      {success && <div className={styles.success}>{success}</div>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Nouveau mot de passe</label>
          <Input 
            type="password" 
            placeholder="Min. 8 caractères" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
          />
        </div>
        <div className={styles.formGroup}>
          <label className={styles.label}>Confirmer le mot de passe</label>
          <Input 
            type="password" 
            placeholder="Confirmez" 
            value={confirmPassword} 
            onChange={e => setConfirmPassword(e.target.value)} 
            required 
          />
        </div>
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? <Spinner size="sm" /> : 'Changer le mot de passe'}
        </Button>
      </form>
    </div>
  );
}
