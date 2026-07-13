import React from 'react';
import { User } from '../types';
import { Settings, Shield, User as UserIcon, LogOut, Sliders } from 'lucide-react';

interface SettingsScreenProps {
  currentUser: User | null;
  onLogout: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ currentUser, onLogout }) => {
  return (
    <div id="settings-screen" className="space-y-6 animate-fade-in">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-outfit font-medium text-gray-900 tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-[#fe6e00]" />
          Configuration du Système
        </h1>
        <p className="text-sm text-gray-500 font-outfit">Profil utilisateur, permissions d'accès et paramètres généraux</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Profile Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-[#fe6e00]/10 text-[#fe6e00] rounded-2xl border border-[#fe6e00]/20">
              <UserIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="font-outfit font-bold text-gray-900">{currentUser?.name || 'Utilisateur Anonyme'}</p>
              <p className="text-xs text-gray-500">Rôle : <span className="uppercase font-semibold font-mono text-xs">{currentUser?.role || 'gérant'}</span></p>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-3 space-y-2">
            <div className="flex justify-between text-xs text-gray-600">
              <span>Identifiant de session :</span>
              <span className="font-mono text-gray-800 font-semibold">{currentUser?.username || 'admin'}</span>
            </div>
            <div className="flex justify-between text-xs text-gray-600">
              <span>Habilitations d'accès :</span>
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" /> Administrateur PMS
              </span>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 font-semibold py-2 rounded-xl text-xs transition-all active:scale-95 border border-red-200"
          >
            <LogOut className="w-4 h-4" />
            Se déconnecter
          </button>
        </div>

        {/* General details Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4 md:col-span-2">
          <h2 className="text-sm font-semibold text-gray-800 border-b pb-2 flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-gray-500" />
            Préférences de l'établissement
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-600">
            <div className="space-y-1">
              <label className="block font-medium">Nom commercial :</label>
              <input
                disabled
                type="text"
                value="Brunch Bouaké"
                className="w-full bg-gray-50 border border-gray-100 text-gray-500 rounded-xl px-3 py-2 text-xs cursor-not-allowed"
              />
            </div>
            <div className="space-y-1">
              <label className="block font-medium">Devise monétaire principale :</label>
              <input
                disabled
                type="text"
                value="Franc CFA (XOF / FCFA)"
                className="w-full bg-gray-50 border border-gray-100 text-gray-500 rounded-xl px-3 py-2 text-xs cursor-not-allowed font-mono font-bold"
              />
            </div>
            <div className="space-y-1">
              <label className="block font-medium">Adresse locale :</label>
              <input
                disabled
                type="text"
                value="Bouaké, Côte d'Ivoire"
                className="w-full bg-gray-50 border border-gray-100 text-gray-500 rounded-xl px-3 py-2 text-xs cursor-not-allowed"
              />
            </div>
            <div className="space-y-1">
              <label className="block font-medium">Fuseau horaire :</label>
              <input
                disabled
                type="text"
                value="GMT / UTC+0"
                className="w-full bg-gray-50 border border-gray-100 text-gray-500 rounded-xl px-3 py-2 text-xs cursor-not-allowed"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
