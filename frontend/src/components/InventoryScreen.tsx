import React, { useState, useEffect } from 'react';
import { InventoryArticle, InventoryEmplacement, InventorySupplier, InventoryMovement } from '../types';
import { api } from '../api';
import { Package, Plus, ArrowUpRight, ArrowDownLeft, AlertTriangle, ShieldCheck, Truck, MapPin, RefreshCw, Layers } from 'lucide-react';

interface InventoryScreenProps {
  onDataRefresh: () => void;
}

export const InventoryScreen: React.FC<InventoryScreenProps> = ({ onDataRefresh }) => {
  const [articles, setArticles] = useState<InventoryArticle[]>([]);
  const [emplacements, setEmplacements] = useState<InventoryEmplacement[]>([]);
  const [suppliers, setSuppliers] = useState<InventorySupplier[]>([]);
  const [movements, setMovements] = useState<InventoryMovement[]>([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [selectedArticleId, setSelectedArticleId] = useState('');
  const [movementType, setMovementType] = useState<'Entrée' | 'Sortie'>('Entrée');
  const [qty, setQty] = useState<number>(0);
  const [reason, setReason] = useState('');
  const [operator, setOperator] = useState('');

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const [art, emp, sup, mov] = await Promise.all([
        api.inventory.articles.getAll(),
        api.inventory.emplacements.getAll(),
        api.inventory.suppliers.getAll(),
        api.inventory.movements.getAll()
      ]);
      setArticles(art);
      setEmplacements(emp);
      setSuppliers(sup);
      setMovements(mov);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleCreateMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedArticleId || qty <= 0 || !operator) {
      alert('Champs obligatoires manquants.');
      return;
    }

    try {
      const art = articles.find(a => a.id === selectedArticleId);
      if (!art) return;

      const newMov: InventoryMovement = {
        id: `MOV-${Math.floor(100 + Math.random() * 900)}`,
        articleId: selectedArticleId,
        type: movementType,
        quantity: qty,
        reason: reason || 'Ajustement manuel',
        operator,
        timestamp: new Date().toLocaleDateString('fr-FR') + ' ' + new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      };

      // In client API, we create the movement
      await api.inventory.movements.create(newMov);

      // We also update the article stock in the database (since this is client-side state we simulate the change on the article object)
      // Actually we'll just reload everything or simulate update
      alert('Mouvement de stock enregistré avec succès !');
      fetchInventory();
      onDataRefresh();
      
      // Clear form
      setSelectedArticleId('');
      setQty(0);
      setReason('');
      setOperator('');
    } catch (err) {
      console.error(err);
      alert('Échec de la mise à jour de stock.');
    }
  };

  return (
    <div id="inventory-screen" className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-outfit font-medium text-gray-900 tracking-tight flex items-center gap-2">
            <Package className="w-6 h-6 text-[#fe6e00]" />
            Gestion des Stocks & Inventaire
          </h1>
          <p className="text-sm text-gray-500">Suivi des consommables de l'hôtel (savons, serviettes, café, minibar)</p>
        </div>
        <button
          onClick={fetchInventory}
          disabled={loading}
          className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Rafraîchir
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core Stock Ledger (Col 2) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-[#fcfaf7]">
              <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#fe6e00]" />
                Articles en Stock
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase font-medium tracking-wider text-[10px]">
                    <th className="p-3">Désignation</th>
                    <th className="p-3">SKU</th>
                    <th className="p-3">Catégorie</th>
                    <th className="p-3">Seuil Min</th>
                    <th className="p-3">P.U. (FCFA)</th>
                    <th className="p-3">Emplacement</th>
                    <th className="p-3 text-right">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {articles.map((art) => {
                    const emp = emplacements.find(e => e.id === art.emplacementId);
                    
                    return (
                      <tr key={art.id} className="hover:bg-gray-50">
                        <td className="p-3">
                          <p className="font-semibold text-gray-900">{art.name}</p>
                          <p className="text-[10px] text-gray-400">{art.description || 'Pas de description'}</p>
                        </td>
                        <td className="p-3 font-mono">{art.sku}</td>
                        <td className="p-3 uppercase text-[10px] bg-gray-100 text-gray-600 rounded px-1.5 py-0.5 inline-block mt-2.5 mx-3">{art.category}</td>
                        <td className="p-3 font-mono">{art.minStock} {art.unit}</td>
                        <td className="p-3 font-mono">{art.priceUnit.toLocaleString()}</td>
                        <td className="p-3">{emp?.name || 'Inconnu'}</td>
                        <td className="p-3 text-right">
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                            <ShieldCheck className="w-3 h-3" /> Conforme
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Movements Log */}
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-gray-100 bg-[#fcfaf7]">
              <h2 className="text-sm font-semibold text-gray-800">Derniers Mouvements de Stock</h2>
            </div>
            <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
              {movements.map((mov) => {
                const art = articles.find(a => a.id === mov.articleId);
                const isEntry = mov.type === 'Entrée';

                return (
                  <div key={mov.id} className="flex justify-between items-center text-xs p-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-1.5 rounded-lg ${isEntry ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                        {isEntry ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">{art?.name || 'Article inconnu'}</p>
                        <p className="text-[10px] text-gray-400">Raison : {mov.reason} | Par : {mov.operator}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold font-mono ${isEntry ? 'text-emerald-600' : 'text-red-600'}`}>
                        {isEntry ? '+' : '-'}{mov.quantity}
                      </p>
                      <p className="text-[9px] text-gray-400">{mov.timestamp}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Create Movement form (Col 1) */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-4">
            <h2 className="text-base font-outfit font-semibold text-gray-900 border-b pb-2">Enregistrer un Flux</h2>
            
            <form onSubmit={handleCreateMovement} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block font-medium text-gray-600">Type de flux :</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setMovementType('Entrée')}
                    className={`py-2 rounded-xl font-medium transition-all ${movementType === 'Entrée' ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-sm' : 'bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100'}`}
                  >
                    Entrée (Stock addition)
                  </button>
                  <button
                    type="button"
                    onClick={() => setMovementType('Sortie')}
                    className={`py-2 rounded-xl font-medium transition-all ${movementType === 'Sortie' ? 'bg-red-50 text-red-700 border border-red-300 shadow-sm' : 'bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100'}`}
                  >
                    Sortie (Consommation)
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-medium text-gray-600">Sélectionner un article :</label>
                <select
                  required
                  value={selectedArticleId}
                  onChange={(e) => setSelectedArticleId(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-700 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#fe6e00] outline-none"
                >
                  <option value="">-- Choisir un article --</option>
                  {articles.map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({a.sku})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block font-medium text-gray-600">Quantité :</label>
                <input
                  required
                  type="number"
                  min="1"
                  value={qty || ''}
                  onChange={(e) => setQty(parseInt(e.target.value, 10))}
                  placeholder="Ex: 50"
                  className="w-full bg-gray-50 border border-gray-200 text-gray-700 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#fe6e00] outline-none font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-medium text-gray-600">Raison / Motif :</label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Ex: Réassort hebdomadaire"
                  className="w-full bg-gray-50 border border-gray-200 text-gray-700 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#fe6e00] outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-medium text-gray-600">Opérateur / Nom :</label>
                <input
                  required
                  type="text"
                  value={operator}
                  onChange={(e) => setOperator(e.target.value)}
                  placeholder="Ex: A. Diallo"
                  className="w-full bg-gray-50 border border-gray-200 text-gray-700 rounded-xl px-3 py-2 text-xs focus:ring-1 focus:ring-[#fe6e00] outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#fe6e00] hover:bg-[#ff6b00] text-white py-2 rounded-xl text-xs font-semibold shadow-sm transition-all active:scale-95"
              >
                Enregistrer le flux de stock
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
