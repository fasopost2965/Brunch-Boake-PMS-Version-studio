'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { logoutAction } from '@/lib/auth.actions';

export async function changePasswordAction(newPassword: string) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  if (!accessToken) return { success: false, error: 'Non authentifié' };

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users-roles/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ newPassword }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      return { success: false, error: errorData.message || 'Erreur lors du changement de mot de passe' };
    }

    // Le backend a déconnecté toutes les sessions, y compris celle en cours (refresh token effacé).
    // Optionnel : déconnecter immédiatement cet utilisateur du frontend.
    // L'utilisateur le verra à l'expiration de l'access_token (max 15min) s'il essaie de refresh.
    // Mais pour une UX immédiate, on peut forcer la déconnexion frontend :
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Erreur réseau ou serveur inaccessible' };
  }
}
