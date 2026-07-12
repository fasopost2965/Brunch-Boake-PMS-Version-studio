import React, { useState } from 'react';
import { Room, Reservation } from '../types';
import { 
  Check, 
  CheckSquare, 
  Plus, 
  AlertTriangle, 
  Settings2, 
  Sparkles, 
  ShieldAlert, 
  ShieldCheck, 
  Trash2, 
  Clock, 
  Grid
} from 'lucide-react';

interface HousekeepingScreenProps {
  rooms: Room[];
  setRooms: React.Dispatch<React.SetStateAction<Room[]>>;
  reservations: Reservation[];
  triggerToast: (msg: string) => void;
}

export interface HousekeepingTask {
  id: string;
  description: string;
  done: boolean;
  priority: 'Basse' | 'Moyenne' | 'Haute';
}

export interface CleaningRule {
  id: string;
  name: string;
  roomType: string; // 'Standard' | 'Deluxe' | 'Suite Royale' | 'Pavillon Brunch' | 'Tous'
  frequencyDays: number;
  priority: 'Basse' | 'Moyenne' | 'Haute';
}

const DEFAULT_RULES: CleaningRule[] = [
  { id: 'rule-1', name: 'Ménage Régulier Résidentiel', roomType: 'Tous', frequencyDays: 3, priority: 'Moyenne' },
  { id: 'rule-2', name: 'Ménage VIP Régulier', roomType: 'Suite Royale', frequencyDays: 2, priority: 'Haute' },
  { id: 'rule-3', name: 'Grand Nettoyage Hebdomadaire', roomType: 'Tous', frequencyDays: 7, priority: 'Moyenne' },
];

export const HousekeepingScreen: React.FC<HousekeepingScreenProps> = ({
  rooms,
  setRooms,
  reservations,
  triggerToast
}) => {
  // Navigation tabs for Housekeeping Sub-sections
  const [activeTab, setActiveTab] = useState<'governance' | 'rules' | 'rooms_status'>('governance');

  // Housekeeper custom task checklists (persisted locally)
  const [tasks, setTasks] = useState<HousekeepingTask[]>(() => {
    const saved = localStorage.getItem('bouake_pms_housekeeping_tasks');
    return saved ? JSON.parse(saved) : [
      { id: 'tsk-1', description: 'Changer les draps de la Suite Royale 201', done: false, priority: 'Haute' },
      { id: 'tsk-2', description: 'Désinfecter la salle de bain de la Chambre Standard 102', done: true, priority: 'Moyenne' },
      { id: 'tsk-3', description: 'Approvisionner les savons & bouteilles d\'eau au Pavillon Brunch 203', done: false, priority: 'Basse' },
      { id: 'tsk-4', description: 'Ménage résidentiel de la Deluxe CH 103 occupée', done: false, priority: 'Moyenne' }
    ];
  });

  const saveTasks = (updated: any) => {
    setTasks(updated);
    localStorage.setItem('bouake_pms_housekeeping_tasks', JSON.stringify(updated));
  };

  const [newTaskText, setNewTaskText] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'Basse' | 'Moyenne' | 'Haute'>('Moyenne');

  // Rules states
  const [rules, setRulesState] = useState<CleaningRule[]>(() => {
    const saved = localStorage.getItem('bouake_pms_cleaning_rules');
    return saved ? JSON.parse(saved) : DEFAULT_RULES;
  });

  // New rule form states
  const [ruleName, setRuleName] = useState('');
  const [ruleRoomType, setRuleRoomType] = useState('Tous');
  const [ruleFrequency, setRuleFrequency] = useState('3');
  const [rulePriority, setRulePriority] = useState<'Basse' | 'Moyenne' | 'Haute'>('Moyenne');

  const saveRules = (updated: CleaningRule[]) => {
    setRulesState(updated);
    localStorage.setItem('bouake_pms_cleaning_rules', JSON.stringify(updated));
  };

  const handleCleanRoom = (roomId: string) => {
    setRooms(prev => prev.map(r => r.id === roomId ? { ...r, status: 'Libre' } : r));
    triggerToast(`Ménage validé ! La chambre CH ${roomId} est désormais propre et Libre.`);
  };

  const toggleTask = (taskId: string) => {
    const updated = tasks.map((t: any) => t.id === taskId ? { ...t, done: !t.done } : t);
    saveTasks(updated);
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText) return;

    const newTask = {
      id: `tsk-${Date.now()}`,
      description: newTaskText,
      done: false,
      priority: newTaskPriority
    };
    const updated = [...tasks, newTask];
    saveTasks(updated);
    setNewTaskText('');
    setNewTaskPriority('Moyenne');
    triggerToast('Consigne de ménage ajoutée.');
  };

  const handleDeleteTask = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = tasks.filter((t: any) => t.id !== taskId);
    saveTasks(updated);
  };

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleName) return;

    const newRule: CleaningRule = {
      id: `rule-${Date.now()}`,
      name: ruleName,
      roomType: ruleRoomType,
      frequencyDays: Number(ruleFrequency) || 3,
      priority: rulePriority
    };

    const updated = [...rules, newRule];
    saveRules(updated);
    setRuleName('');
    setRuleFrequency('3');
    triggerToast(`Règle "${newRule.name}" ajoutée pour les séjours.`);
  };

  const handleDeleteRule = (ruleId: string) => {
    const updated = rules.filter(r => r.id !== ruleId);
    saveRules(updated);
    triggerToast('Règle de ménage supprimée.');
  };

  // Helper: Calculate simulated stay duration for demonstrations
  const getElapsedDays = (checkInStr: string) => {
    const checkInDate = new Date(checkInStr);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - checkInDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    // Safe mock fallback if checkIn string is from mock data with fixed 2026/past years
    if (diffDays > 300 || diffDays <= 0) {
      return (checkInStr.length % 5) + 3; // e.g. yields 3, 4, 5, 6, 7 days
    }
    return diffDays;
  };

  // Calculate suggested cleanings based on rules and active reservations
  const getSuggestedCleanings = () => {
    const suggestions: { roomId: string; guestName: string; roomType: string; ruleName: string; elapsed: number; frequency: number; priority: 'Basse' | 'Moyenne' | 'Haute' }[] = [];
    
    // Filter active reservations in-house
    const activeInHouse = reservations.filter(r => r.status === 'En Cours');
    
    activeInHouse.forEach(res => {
      const room = rooms.find(r => r.id === res.roomNumber);
      if (!room) return;
      
      const elapsed = getElapsedDays(res.checkIn);
      
      // Find matching rules
      const matchingRules = rules.filter(rule => rule.roomType === 'Tous' || rule.roomType === room.type);
      
      matchingRules.forEach(rule => {
        // Suggested if the guest stay length is exactly a multiple of the rule frequency
        if (elapsed > 0 && elapsed % rule.frequencyDays === 0) {
          suggestions.push({
            roomId: room.id,
            guestName: res.guestName,
            roomType: room.type,
            ruleName: rule.name,
            elapsed,
            frequency: rule.frequencyDays,
            priority: rule.priority
          });
        }
      });
    });
    
    return suggestions;
  };

  const suggestedCleanings = getSuggestedCleanings();

  const handleGenerateFromRules = () => {
    if (suggestedCleanings.length === 0) {
      triggerToast("Aucun ménage résidentiel périodique n'est requis aujourd'hui selon vos règles.");
      return;
    }
    
    const generated = suggestedCleanings.map((s, index) => ({
      id: `tsk-rule-${Date.now()}-${index}`,
      description: `${s.ruleName} : CH ${s.roomId} (${s.guestName} - séjour jour ${s.elapsed})`,
      done: false,
      priority: s.priority
    }));
    
    setTasks(prev => {
      // Avoid adding exactly duplicate descriptions
      const nonDuplicates = generated.filter(g => !prev.some((p: any) => p.description === g.description));
      if (nonDuplicates.length === 0) {
        triggerToast("Ces tâches ont déjà été planifiées dans votre liste.");
        return prev;
      }
      const updated = [...prev, ...nonDuplicates];
      saveTasks(updated);
      triggerToast(`✅ ${nonDuplicates.length} tâches de ménage périodique générées automatiquement !`);
      return updated;
    });
  };

  const handleUpdateRoomStatus = (roomId: string, newStatus: Room['status']) => {
    setRooms(prev => prev.map(r => r.id === roomId ? { ...r, status: newStatus } : r));
    triggerToast(`Statut de la chambre CH ${roomId} mis à jour : ${newStatus}`);
  };

  const dirtyRooms = rooms.filter(r => r.status === 'Sale');
  const oooRooms = rooms.filter(r => r.status === 'OOO');
  const oosRooms = rooms.filter(r => r.status === 'OOS');
  const cleanRoomsCount = rooms.filter(r => r.status === 'Libre').length;

  return (
    <div className="flex flex-col gap-6 animate-fade-in" id="housekeeping_screen">
      
      {/* Header and top tab buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#423d38] tracking-tight flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#fe6e00]" /> Gouvernance & Housekeeping Avancé
          </h2>
          <p className="text-xs text-[#797067]">Gérer la propreté, les règles périodiques de long séjour et les retraits techniques (OOO/OOS).</p>
        </div>

        {/* Tab Selection */}
        <div className="bg-[#f3f4f6] p-1 rounded-lg border border-[#e3e0dd] flex gap-1 self-start sm:self-auto">
          <button 
            onClick={() => setActiveTab('governance')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'governance' 
                ? 'bg-[#fe6e00] text-white shadow-sm' 
                : 'text-[#797067] hover:text-[#423d38] hover:bg-white/50'
            }`}
          >
            <CheckSquare className="w-4 h-4" /> Gouvernance
          </button>
          <button 
            onClick={() => setActiveTab('rules')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'rules' 
                ? 'bg-[#fe6e00] text-white shadow-sm' 
                : 'text-[#797067] hover:text-[#423d38] hover:bg-white/50'
            }`}
          >
            <Settings2 className="w-4 h-4" /> Règles Périodiques
          </button>
          <button 
            onClick={() => setActiveTab('rooms_status')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'rooms_status' 
                ? 'bg-[#fe6e00] text-white shadow-sm' 
                : 'text-[#797067] hover:text-[#423d38] hover:bg-white/50'
            }`}
          >
            <Grid className="w-4 h-4" /> Statuts Avancés (OOO/OOS)
          </button>
        </div>
      </div>

      {/* ================= TAB 1: GOVERNANCE & TASKS ================= */}
      {activeTab === 'governance' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Urgent Housekeeping Lists (Dirty & Suggested) */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* 1. Suggested Cleanings based on Resident Frequencies */}
            <div className="bg-amber-50/50 backdrop-blur-md p-5 rounded-xl border border-amber-200 shadow-sm flex flex-col gap-4 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200 pb-2">
                <div>
                  <h3 className="font-extrabold text-[#874b00] text-sm flex items-center gap-1.5">
                    <Clock className="w-4.5 h-4.5 text-[#fe6e00] animate-pulse" /> Ménages périodiques suggérés aujourd'hui ({suggestedCleanings.length})
                  </h3>
                  <p className="text-[10px] text-amber-700 mt-0.5">Filtre intelligent basé sur les dates de check-in et les règles configurées de long séjour.</p>
                </div>
                {suggestedCleanings.length > 0 && (
                  <button
                    onClick={handleGenerateFromRules}
                    className="bg-[#fe6e00] hover:bg-[#ff6b00] text-white font-extrabold px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Générer les tâches
                  </button>
                )}
              </div>

              {suggestedCleanings.length === 0 ? (
                <div className="text-center py-6 bg-white/40 rounded-lg border border-dashed border-amber-200">
                  <span className="text-amber-800 font-bold block text-xs">Aucun ménage périodique n'est exigé aujourd'hui</span>
                  <p className="text-[10px] text-amber-700 mt-0.5">Toutes les résidences actives respectent les cycles de nettoyage réglés.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {suggestedCleanings.map((sc, idx) => (
                    <div key={idx} className="bg-white border border-amber-200 p-3 rounded-lg flex justify-between items-center shadow-xs">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm text-[#423d38]">Chambre CH {sc.roomId}</span>
                          <span className="bg-amber-100 text-[#874b00] px-1.5 py-0.2 rounded font-black text-[8px] uppercase">{sc.roomType}</span>
                        </div>
                        <p className="text-[10px] text-[#797067]">
                          Résident : <strong>{sc.guestName}</strong> • Jour de séjour : <strong>Jour {sc.elapsed}</strong> (Règle : tous les {sc.frequency} jours)
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-1.5 py-0.5 rounded font-black text-[8px] uppercase ${
                          sc.priority === 'Haute' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {sc.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Dirty Rooms requiring immediate attention */}
            <div className="bg-white/80 backdrop-blur-md p-5 rounded-xl border border-[#e3e0dd]/80 shadow-sm flex flex-col gap-4 text-xs">
              <h3 className="font-extrabold text-[#423d38] text-sm border-b border-[#e3e0dd]/80 pb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-4.5 h-4.5 text-[#fe6e00]" /> Chambres nécessitant un ménage urgent ({dirtyRooms.length})
              </h3>

              {dirtyRooms.length === 0 ? (
                <div className="text-center py-10 bg-[#f3f4f6] rounded-lg border border-dashed border-[#e3e0dd]">
                  <span className="text-[#423d38] font-bold block text-xs">Toutes les chambres sont propres !</span>
                  <p className="text-[11px] text-[#797067] mt-0.5">Le plan d'entretien est à jour. {cleanRoomsCount} chambres sont prêtes à l'emploi.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {dirtyRooms.map(room => (
                    <div key={room.id} className="p-4 bg-[#fef9c2]/40 border border-amber-200 rounded-xl flex justify-between items-center shadow-xs">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-black text-[#423d38]">Chambre CH {room.id}</span>
                        <span className="text-[10px] font-bold text-[#797067] uppercase">{room.type}</span>
                      </div>
                      <button
                        onClick={() => handleCleanRoom(room.id)}
                        className="bg-[#016630] hover:bg-[#015226] text-white font-extrabold py-1.5 px-3 rounded-lg text-[10px] uppercase flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Ménage fait
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Housekeeping daily checklists */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-md p-5 rounded-xl border border-[#e3e0dd]/80 shadow-sm flex flex-col gap-4 text-xs h-full min-h-[450px]">
              <h3 className="font-extrabold text-[#423d38] text-sm border-b border-[#e3e0dd]/80 pb-2 flex items-center gap-2">
                <CheckSquare className="w-4.5 h-4.5 text-[#fe6e00]" /> Carnet d'entretien du jour ({tasks.filter((t:any)=>!t.done).length} en attente)
              </h3>

              {/* List */}
              <div className="flex flex-col gap-2 overflow-y-auto max-h-[350px] pr-1 flex-1">
                {tasks.length === 0 ? (
                  <p className="text-[#797067] text-center italic py-10">Aucune consigne pour aujourd'hui.</p>
                ) : (
                  tasks.map((t: any) => (
                    <div 
                      key={t.id} 
                      onClick={() => toggleTask(t.id)}
                      className={`p-3 rounded-xl border flex items-start justify-between gap-2.5 cursor-pointer transition-all ${
                        t.done 
                          ? 'bg-gray-50/50 border-gray-200 opacity-60 line-through text-[#797067]' 
                          : 'bg-white/50 border-[#e3e0dd]/80 hover:border-[#fe6e00]/50 text-[#423d38] hover:scale-[1.01]'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <input 
                          type="checkbox" 
                          checked={t.done}
                          onChange={() => {}} // handled by click
                          className="mt-0.5 accent-[#fe6e00] cursor-pointer"
                        />
                        <div className="flex flex-col">
                          <span className="font-semibold text-[11px] leading-relaxed">{t.description}</span>
                          <span className={`text-[8px] font-black w-fit px-1.5 py-0.2 rounded mt-1 border uppercase tracking-wider ${
                            t.priority === 'Haute' 
                              ? 'bg-red-50 text-red-700 border-red-200/40' 
                              : t.priority === 'Moyenne'
                              ? 'bg-amber-50 text-[#874b00] border-amber-200/40'
                              : 'bg-gray-100 text-gray-700 border-gray-200'
                          }`}>
                            {t.priority}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => handleDeleteTask(t.id, e)}
                        className="text-gray-400 hover:text-red-500 p-1 rounded-md hover:bg-gray-100 transition-all cursor-pointer"
                        title="Supprimer la consigne"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Quick Add */}
              <form onSubmit={handleAddTask} className="flex flex-col gap-2.5 pt-4 border-t border-[#e3e0dd]/80 mt-auto">
                <div className="flex gap-1.5">
                  <input 
                    type="text" 
                    placeholder="Nouvelle consigne..."
                    required
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    className="bg-[#f3f4f6]/50 border border-[#e3e0dd]/80 rounded-xl p-2 focus:outline-none focus:border-[#fe6e00] flex-1 text-xs text-[#423d38]"
                  />
                  <button
                    type="submit"
                    className="bg-[#fe6e00] hover:bg-[#ff6b00] text-white font-bold p-2.5 rounded-xl transition-colors cursor-pointer shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex items-center gap-2 justify-between">
                  <span className="text-[10px] font-bold text-[#797067] uppercase">Priorité :</span>
                  <div className="flex gap-1">
                    {(['Basse', 'Moyenne', 'Haute'] as const).map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setNewTaskPriority(p)}
                        className={`px-2 py-0.5 rounded text-[9px] font-bold border transition-all cursor-pointer ${
                          newTaskPriority === p 
                            ? 'bg-[#fe6e00] text-white border-[#fe6e00]' 
                            : 'bg-[#f3f4f6] text-[#797067] border-transparent hover:border-[#e3e0dd]'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: CLEANING RULES CONFIG ================= */}
      {activeTab === 'rules' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Rules List */}
          <div className="lg:col-span-2 bg-white/80 backdrop-blur-md p-5 rounded-xl border border-[#e3e0dd]/80 shadow-sm flex flex-col gap-4 text-xs">
            <div>
              <h3 className="font-extrabold text-[#423d38] text-sm">Fréquences et Règles configurées</h3>
              <p className="text-[11px] text-[#797067] mt-0.5">Ces règles planifient automatiquement des suggestions de ménage pour les longs séjours.</p>
            </div>

            <div className="flex flex-col gap-3">
              {rules.map(r => (
                <div key={r.id} className="border border-[#e3e0dd]/80 p-4 rounded-xl flex items-center justify-between bg-gray-50/50">
                  <div className="flex flex-col gap-1">
                    <span className="font-black text-sm text-[#423d38]">{r.name}</span>
                    <div className="flex flex-wrap gap-2 items-center text-[10px] text-[#797067] mt-1">
                      <span>Type concerné : <strong className="text-[#fe6e00]">{r.roomType}</strong></span>
                      <span>•</span>
                      <span>Fréquence : <strong className="text-[#016630]">Tous les {r.frequencyDays} jours</strong></span>
                      <span>•</span>
                      <span className={`px-1.5 py-0.1 rounded text-[8px] font-black uppercase ${
                        r.priority === 'Haute' ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-700'
                      }`}>
                        {r.priority}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteRule(r.id)}
                    className="text-gray-400 hover:text-red-500 p-2 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
                    title="Supprimer la règle"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Add New Rule Form */}
          <div className="lg:col-span-1 bg-white p-5 rounded-xl border border-[#e3e0dd] shadow-sm flex flex-col gap-4 text-xs">
            <h3 className="font-extrabold text-[#423d38] text-sm border-b border-[#e3e0dd] pb-2 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-[#fe6e00]" /> Nouvelle Règle de Ménage
            </h3>

            <form onSubmit={handleAddRule} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Nom de la règle :</label>
                <input 
                  type="text"
                  required
                  placeholder="Ex: Ménage Long Séjour 5j"
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-2 focus:outline-none focus:border-[#fe6e00] text-[#423d38] font-semibold"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Type de chambre admissible :</label>
                <select
                  value={ruleRoomType}
                  onChange={(e) => setRuleRoomType(e.target.value)}
                  className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-2 focus:outline-none focus:border-[#fe6e00] text-[#423d38] font-bold"
                >
                  <option value="Tous">Tous les types de chambre</option>
                  <option value="Standard">Chambre Standard</option>
                  <option value="Deluxe">Chambre Deluxe</option>
                  <option value="Suite Royale">Suite Royale</option>
                  <option value="Pavillon Brunch">Pavillon Brunch</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Fréquence de passage (jours) :</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="number"
                    min="1"
                    max="30"
                    required
                    value={ruleFrequency}
                    onChange={(e) => setRuleFrequency(e.target.value)}
                    className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-2 focus:outline-none focus:border-[#fe6e00] text-[#423d38] font-mono font-bold w-20"
                  />
                  <span className="text-[#797067] font-semibold">jours de séjour</span>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Priorité attribuée :</label>
                <select
                  value={rulePriority}
                  onChange={(e) => setRulePriority(e.target.value as any)}
                  className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-md p-2 focus:outline-none focus:border-[#fe6e00] text-[#423d38] font-bold"
                >
                  <option value="Basse">Basse</option>
                  <option value="Moyenne">Moyenne</option>
                  <option value="Haute">Haute</option>
                </select>
              </div>

              <button
                type="submit"
                className="bg-[#fe6e00] hover:bg-[#ff6b00] text-white font-extrabold py-2.5 rounded-lg text-xs uppercase tracking-wider shadow-sm mt-2 transition-all cursor-pointer"
              >
                Créer la règle active
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= TAB 3: ADVANCED ROOM STATUSES (OOO/OOS) ================= */}
      {activeTab === 'rooms_status' && (
        <div className="flex flex-col gap-6">
          
          {/* Status info widgets */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-red-50 border border-red-200/50 p-4 rounded-xl flex items-center gap-3 text-xs">
              <div className="bg-red-100 text-red-700 p-2 rounded-lg">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-black text-red-800">OOO : Out of Order ({oooRooms.length})</h4>
                <p className="text-[#797067] text-[10px] mt-0.5">Hors Service majeur. Retiré de l'inventaire vendable pour panne, dégât des eaux ou travaux lourds.</p>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200/50 p-4 rounded-xl flex items-center gap-3 text-xs">
              <div className="bg-amber-100 text-amber-700 p-2 rounded-lg">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-black text-amber-800">OOS : Out of Service ({oosRooms.length})</h4>
                <p className="text-[#797067] text-[10px] mt-0.5">Hors Service temporaire. Bloqué pour ménage spécifique, inspection rapide ou petit entretien.</p>
              </div>
            </div>

            <div className="bg-[#dcfce7] border border-[#016630]/20 p-4 rounded-xl flex items-center gap-3 text-xs">
              <div className="bg-[#016630]/10 text-[#016630] p-2 rounded-lg">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-black text-[#016630]">Prêtes & Libres ({cleanRoomsCount})</h4>
                <p className="text-[#797067] text-[10px] mt-0.5">Chambres propres prêtes à accueillir les arrivées de Brunch Bouaké.</p>
              </div>
            </div>
          </div>

          {/* Interactive room status matrix */}
          <div className="bg-white p-6 rounded-xl border border-[#e3e0dd] shadow-sm flex flex-col gap-4 text-xs">
            <div>
              <h3 className="font-extrabold text-[#423d38] text-sm">Gestion Directe des Disponibilités</h3>
              <p className="text-[11px] text-[#797067] mt-0.5">Modifier instantanément le statut technique et commercial de chaque chambre de l'établissement.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {rooms.map(room => {
                let statusBg = 'bg-[#dcfce7] text-[#016630] border-[#016630]/20';
                if (room.status === 'Sale') statusBg = 'bg-[#fef9c2] text-[#874b00] border-amber-200';
                else if (room.status === 'Occupé') statusBg = 'bg-[#fef2f2] text-[#fb2c36] border-red-100';
                else if (room.status === 'Maintenance') statusBg = 'bg-[#f3e8ff] text-[#6b21a8] border-purple-100';
                else if (room.status === 'OOO') statusBg = 'bg-red-100 text-red-800 border-red-300';
                else if (room.status === 'OOS') statusBg = 'bg-amber-100 text-[#874b00] border-amber-300';

                return (
                  <div key={room.id} className="bg-gray-50/50 border border-[#e3e0dd] rounded-xl p-4 flex flex-col justify-between gap-3 shadow-xs hover:shadow-md transition-shadow">
                    
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-extrabold text-[#423d38] text-sm">CH {room.id}</span>
                        <span className="text-[10px] font-bold text-[#797067]">{room.type}</span>
                      </div>
                      
                      <span className={`px-2 py-0.5 rounded-full font-black text-[9px] uppercase border ${statusBg}`}>
                        {room.status === 'OOO' ? 'PANNE (OOO)' :
                         room.status === 'OOS' ? 'ENTRETIEN (OOS)' : room.status}
                      </span>
                    </div>

                    {/* Quick State Controller Dropdown */}
                    <div className="flex flex-col gap-1 border-t border-gray-200/50 pt-2.5">
                      <label className="text-[9px] font-black text-[#797067] uppercase tracking-wider">Modifier le statut :</label>
                      <select
                        value={room.status}
                        onChange={(e) => handleUpdateRoomStatus(room.id, e.target.value as any)}
                        className="bg-white border border-[#e3e0dd] rounded-md p-1.5 text-[11px] font-bold text-[#423d38] focus:outline-none focus:border-[#fe6e00]"
                      >
                        <option value="Libre">Libre (Propre & Prêt)</option>
                        <option value="Sale">Sale (Nécessite ménage)</option>
                        <option value="Occupé">Occupé</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="OOO">Hors Service majeur (OOO)</option>
                        <option value="OOS">Retrait temporaire (OOS)</option>
                      </select>
                    </div>

                    {/* Descriptions Popups for OOO/OOS */}
                    {room.status === 'OOO' && (
                      <div className="text-[9px] bg-red-50 p-2 rounded-lg border border-red-200/30 text-red-800 leading-normal">
                        🚨 Chambre retirée des canaux de vente de Brunch Bouaké.
                      </div>
                    )}
                    {room.status === 'OOS' && (
                      <div className="text-[9px] bg-amber-50 p-2 rounded-lg border border-amber-200/30 text-amber-800 leading-normal">
                        ⚠️ Retrait court pour nettoyage spécifique résidentiel.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
