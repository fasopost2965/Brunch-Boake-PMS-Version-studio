import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Database, RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck, HardDrive, Trash2, Download } from 'lucide-react';

interface DatabaseScreenProps {
  onDataRefresh: () => void;
}

export const DatabaseScreen: React.FC<DatabaseScreenProps> = ({ onDataRefresh }) => {
  const [dbStatus, setDbStatus] = useState<{
    connected: boolean;
    mode: string;
    timestamp: string;
    service: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncLogs, setSyncLogs] = useState<string[]>([]);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setDbStatus({
          connected: data.database.connected,
          mode: data.database.mode,
          timestamp: data.timestamp,
          service: data.service,
        });
        addLog(`Connexion API réussie. Mode : ${data.database.mode.toUpperCase()}`);
      } else {
        throw new Error('HTTP ' + res.status);
      }
    } catch (err: any) {
      setDbStatus({
        connected: false,
        mode: 'simulation',
        timestamp: new Date().toISOString(),
        service: 'PMS Local Engine',
      });
      addLog(`Échec de connexion API (${err.message}). Repli sur le stockage LocalStorage.`);
    } finally {
      setLoading(false);
    }
  };

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setSyncLogs((prev) => [`[${timestamp}] ${message}`, ...prev.slice(0, 49)]);
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleForceSync = async () => {
    addLog('Synchronisation forcée initiée...');
    await fetchStatus();
    onDataRefresh();
    addLog('Synchronisation complète effectuée.');
  };

  const handleResetCache = () => {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser le cache local ? Toutes les données non sauvegardées sur MySQL seront perdues.')) {
      localStorage.clear();
      addLog('LocalStorage vidé avec succès.');
      onDataRefresh();
    }
  };

  const handleExportJSON = () => {
    const backup: Record<string, any> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('bouake_pms') || key.startsWith('pms_inventory'))) {
        try {
          backup[key] = JSON.parse(localStorage.getItem(key) || '[]');
        } catch {
          backup[key] = localStorage.getItem(key);
        }
      }
    }
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `pms_brunch_bouake_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    addLog('Export de sauvegarde JSON généré et téléchargé.');
  };

  return (
    <div id="database-screen" className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-outfit font-medium text-gray-900 tracking-tight">Diagnostics & Persistance</h1>
          <p className="text-sm text-gray-500">Contrôle du double moteur de stockage (MySQL & LocalStorage)</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleForceSync}
            disabled={loading}
            className="flex items-center gap-2 bg-[#fe6e00] hover:bg-[#ff6b00] text-white px-4 py-2 rounded-xl font-medium text-sm transition-all shadow-sm active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Rafraîchir
          </button>
        </div>
      </div>

      {/* Grid status panels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Connection status card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">État de connexion</span>
            <Database className="w-5 h-5 text-gray-400" />
          </div>
          <div className="flex items-center gap-3">
            {dbStatus?.connected ? (
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-50 text-[#00c758]">
                <ShieldCheck className="w-6 h-6" />
              </div>
            ) : (
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-50 text-[#edb200]">
                <AlertTriangle className="w-6 h-6" />
              </div>
            )}
            <div>
              <p className="text-lg font-semibold text-gray-900 font-display">
                {dbStatus?.connected ? 'MySQL Connecté' : 'Moteur de Secours'}
              </p>
              <p className="text-xs text-gray-500">
                {dbStatus?.connected ? 'Hostinger u707543112_bb_db_v1' : 'Mode simulation hors-ligne'}
              </p>
            </div>
          </div>
        </div>

        {/* Sync Mode card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">Source de Vérité</span>
            <HardDrive className="w-5 h-5 text-gray-400" />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-gray-900">
                {dbStatus?.mode === 'production' ? 'MySQL' : 'Local'}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${dbStatus?.mode === 'production' ? 'bg-emerald-50 text-[#00c758]' : 'bg-amber-50 text-[#edb200]'}`}>
                {dbStatus?.mode === 'production' ? 'Production' : 'Simulation'}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Changements client mis en cache localement et envoyés à l'API Express.
            </p>
          </div>
        </div>

        {/* Database Latency or Integrity */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">Résilience API</span>
            <CheckCircle2 className="w-5 h-5 text-gray-400" />
          </div>
          <div>
            <div className="text-3xl font-bold font-mono text-gray-900">100%</div>
            <p className="text-xs text-[#00c758] mt-1 flex items-center gap-1">
              <span>●</span> Repli automatique actif et opérationnel
            </p>
            <p className="text-[10px] text-gray-400 mt-2">
              Dernier signal : {dbStatus?.timestamp ? new Date(dbStatus.timestamp).toLocaleTimeString() : 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* Actions and sync logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tools and Operations */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4 lg:col-span-1">
          <h2 className="text-base font-outfit font-medium text-gray-900 border-b pb-2">Outils de maintenance</h2>
          <div className="space-y-3">
            <button
              onClick={handleExportJSON}
              className="w-full flex items-center justify-between text-left text-sm text-gray-700 bg-gray-50 hover:bg-gray-100 px-4 py-3 rounded-xl transition-all"
            >
              <span className="flex items-center gap-2">
                <Download className="w-4 h-4 text-gray-500" />
                Exporter en sauvegarde JSON
              </span>
              <span className="text-xs text-gray-400">Local</span>
            </button>
            <button
              onClick={handleResetCache}
              className="w-full flex items-center justify-between text-left text-sm text-red-600 bg-red-50 hover:bg-red-100 px-4 py-3 rounded-xl transition-all"
            >
              <span className="flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                Vider le LocalStorage
              </span>
              <span className="text-xs text-red-500/80">Danger</span>
            </button>
          </div>
          <div className="text-xs text-gray-400 p-3 bg-[#fcfaf7] rounded-xl border border-dashed border-gray-200">
            <p className="font-semibold text-gray-600 mb-1">Rappel Architecture :</p>
            Si la base de données MySQL hébergée chez Hostinger est inaccessible, le client bascule instantanément sur l'in-memory store côté serveur, ou le LocalStorage côté client, évitant ainsi tout arrêt des opérations à Bouaké.
          </div>
        </div>

        {/* Sync Console */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between border-b pb-2">
            <h2 className="text-base font-outfit font-medium text-gray-900">Console de diagnostics</h2>
            <button
              onClick={() => setSyncLogs([])}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              Effacer la console
            </button>
          </div>
          <div className="bg-gray-950 rounded-xl p-4 font-mono text-xs text-emerald-400 h-64 overflow-y-auto space-y-1.5 shadow-inner">
            {syncLogs.length === 0 ? (
              <p className="text-gray-500 italic">En attente d'événements réseau ou d'actions système...</p>
            ) : (
              syncLogs.map((log, idx) => (
                <div key={idx} className="leading-relaxed whitespace-pre-wrap select-all">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
