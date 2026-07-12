import React from 'react';
import { Menu, X, ChevronDown, ChevronRight, LogOut, Lock, CheckCircle2 } from 'lucide-react';
import { BrunchLogo } from './BrunchLogo';
import { NAVIGATION_STRUCTURE } from '../navigation';

export function Layout({ children, state }: { children: React.ReactNode, state: any }) {
  const { 
    hotelConfig, 
    isMobileMenuOpen, 
    setIsMobileMenuOpen, 
    isSlowNetwork, 
    setIsSlowNetwork, 
    occupiedCount, 
    rooms, 
    totalRevenues, 
    dirtyCount, 
    currentUserRole, 
    setCurrentUserRole, 
    triggerToast, 
    activeTab, 
    handleTabChange, 
    openGroups, 
    toggleGroup, 
    handleLogout, 
    successToast,
    currentUser
  } = state;

  const renderNavigationItems = () => {
    return (
      <div className="flex flex-col gap-2 overflow-y-auto max-h-[calc(100vh-210px)] pr-1 scrollbar-thin">
        {/* Profile / Permission Simulator Panel */}
        <div className="mb-3 px-3 py-2.5 bg-white/5 rounded-xl border border-white/10 flex flex-col gap-1.5 shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-[9px] uppercase font-bold tracking-widest text-white/50">Rôle Actuel :</span>
            <span className={`px-1.5 py-0.5 text-[8px] font-black rounded uppercase tracking-wider ${
              currentUserRole === 'admin' ? 'bg-[#fe6e00]/20 text-[#fe6e00] border border-[#fe6e00]/20' :
              currentUserRole === 'receptionist' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/20' :
              'bg-emerald-500/20 text-emerald-300 border border-emerald-500/20'
            }`}>
              {currentUserRole === 'admin' ? 'Super Admin' : currentUserRole === 'receptionist' ? 'Réception' : 'Comptabilité'}
            </span>
          </div>
          <select
            value={currentUserRole}
            onChange={(e) => {
              setCurrentUserRole(e.target.value as any);
              triggerToast(`Mode simulation de rôle : ${e.target.value === 'admin' ? 'Administrateur' : e.target.value === 'receptionist' ? 'Réceptionniste' : 'Comptable'}`);
            }}
            className="w-full bg-black/60 text-white/90 border border-white/15 rounded-lg p-2 text-xs font-bold focus:outline-none focus:border-[#fe6e00] cursor-pointer"
          >
            <option value="admin">Administrateur (Tout)</option>
            <option value="receptionist">Réceptionniste (Accueil/PMS)</option>
            <option value="accountant">Comptable (Finance/Rapports)</option>
          </select>
        </div>

        {NAVIGATION_STRUCTURE.map((group) => {
          const isOpen = !!openGroups[group.id];
          const GroupIcon = group.icon;
          
          // Count active items in group to highlight parent group if collapsed but has an active child
          const hasActiveChild = group.items.some(item => activeTab === item.id);
          
          return (
            <div key={group.id} className="flex flex-col gap-1 border-b border-white/5 pb-2 last:border-b-0">
              {/* Group Header Button */}
              <button
                onClick={() => toggleGroup(group.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs font-bold uppercase tracking-wide transition-all duration-200 cursor-pointer ${
                  hasActiveChild 
                    ? 'text-[#fe6e00] bg-white/5 font-extrabold' 
                    : 'text-white/80 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <GroupIcon className="w-3.5 h-3.5 shrink-0" />
                  <span className="text-[10px] tracking-wider">{group.title}</span>
                </div>
                {isOpen ? (
                  <ChevronDown className="w-3.5 h-3.5 text-white/40" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-white/40" />
                )}
              </button>

              {/* Group Sub-Items */}
              {isOpen && (
                <div className="flex flex-col gap-0.5 pl-3 mt-1 transition-all duration-200">
                  {group.items.map((item) => {
                    const IconComp = item.icon;
                    const isActive = activeTab === item.id;
                    
                    // Permission Check
                    const hasPermission = !item.requiredRoles || item.requiredRoles.includes(currentUserRole);
                    
                    const handleItemClick = () => {
                      if (item.disabled) {
                        triggerToast(`Le module "${item.label}" est en cours de développement.`);
                        return;
                      }
                      if (!hasPermission) {
                        triggerToast(`Accès restreint au module "${item.label}" pour votre rôle.`);
                        return;
                      }
                      handleTabChange(item.id);
                    };

                    return (
                      <button
                        key={item.id}
                        onClick={handleItemClick}
                        className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-semibold transition-all relative ${
                          isActive 
                            ? 'bg-[#fe6e00] text-white font-bold shadow-xs' 
                            : !hasPermission 
                              ? 'text-white/30 cursor-not-allowed hover:bg-white/5'
                              : item.disabled
                                ? 'text-white/40 cursor-not-allowed hover:bg-white/5'
                                : item.accent 
                                  ? 'text-[#fe6e00] bg-[#fe6e00]/5 hover:bg-[#fe6e00] hover:text-white border border-[#fe6e00]/25'
                                  : 'text-white/70 hover:bg-[#fe6e00] hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <IconComp className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </div>

                        {/* Status badge / lock indicator */}
                        {item.badge ? (
                          <span className="bg-[#fe6e00]/10 text-[#fe6e00] border border-[#fe6e00]/20 text-[7px] font-extrabold px-1 py-0.5 rounded-sm tracking-wider uppercase shrink-0">
                            {item.badge}
                          </span>
                        ) : !hasPermission ? (
                          <span className="text-[8px] bg-red-500/20 text-red-300 font-extrabold px-1 py-0.5 rounded-sm border border-red-500/20 flex items-center gap-0.5 shrink-0">
                            <Lock className="w-2.5 h-2.5" /> Verrouillé
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#fcfaf7] text-[#423d38] flex flex-col antialiased font-sans">
      {successToast && (
        <div className="fixed bottom-5 right-5 bg-[#00c758] text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-semibold text-sm">{successToast}</span>
        </div>
      )}
      
      <header className="bg-black/70 backdrop-blur-md border-b border-white/10 sticky top-0 z-30 px-4 md:px-6 h-16 flex items-center justify-between text-white rounded-none">
        <div className="flex items-center gap-2 md:gap-3">
          {/* Hamburger toggle for mobile */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className="md:hidden text-white hover:text-[#fe6e00] p-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-white/20 shrink-0"
            title="Menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <div className="bg-white p-1 rounded-lg flex items-center justify-center shadow-lg shadow-[#fe6e00]/25 border border-white/10 shrink-0">
            <BrunchLogo size={32} />
          </div>
          <div>
            <h1 className="text-sm md:text-base font-bold tracking-tight text-white">{hotelConfig.name} PMS</h1>
            <p className="text-[9px] md:text-[11px] text-white/60 font-medium flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#00c758] animate-pulse"></span>
              <span className="hidden sm:inline">Gestion de l'Etablissement • Bouaké, CI</span>
              <span className="sm:hidden">Bouaké, CI</span>
            </p>
          </div>
        </div>

        {/* Quick KPI stats banner */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Slow connection simulator */}
          <button 
            onClick={() => {
              setIsSlowNetwork(!isSlowNetwork);
              triggerToast(!isSlowNetwork ? "Mode Connexion Lente (3G simulée) activé." : "Connexion normale rétablie.");
            }}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-bold tracking-wider uppercase transition-all border shrink-0 ${
              isSlowNetwork 
                ? 'bg-red-500/20 text-red-300 border-red-500/40 animate-pulse' 
                : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${isSlowNetwork ? 'bg-red-500' : 'bg-green-500'}`}></span>
            <span className="hidden xs:inline">{isSlowNetwork ? "LENT" : "RÉSEAU NORM."}</span>
            <span className="xs:hidden">{isSlowNetwork ? "3G" : "Normal"}</span>
          </button>

          <div className="hidden lg:flex items-center gap-6 bg-white/5 border border-white/10 rounded-lg px-4 py-1.5 text-xs text-white">
            <div>
              <span className="text-white/50 block uppercase font-bold tracking-widest text-[9px]">Chambres Occ.</span>
              <span className="font-bold text-white text-sm">{occupiedCount} / {rooms.length}</span>
            </div>
            <div className="h-6 w-px bg-white/10"></div>
            <div>
              <span className="text-white/50 block uppercase font-bold tracking-widest text-[9px]">Revenus encaissés</span>
              <span className="font-bold text-[#fe6e00] text-sm">{totalRevenues.toLocaleString()} F</span>
            </div>
            <div className="h-6 w-px bg-white/10"></div>
            <div>
              <span className="text-white/50 block uppercase font-bold tracking-widest text-[9px]">Entretien</span>
              <span className="font-bold text-[#fe6e00] text-sm">{dirtyCount} sales</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs shrink-0">
            <div className="text-right hidden sm:block">
              <span className="font-semibold text-white block">{currentUser?.name || 'Opérateur local'}</span>
              <span className="text-white/60 text-[10px]">{currentUser?.username ? `@${currentUser.username}` : 'fasopost24@gmail.com'}</span>
            </div>
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-lg bg-white/10 flex items-center justify-center text-white font-bold border border-white/10 text-xs md:text-sm">
              {(currentUser?.name || 'Opérateur local')
                .split(' ')
                .map((n: string) => n[0])
                .join('')
                .substring(0, 2)
                .toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row relative">
        {/* MOBILE OVERLAY DRAWER */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
            <aside 
              className="w-72 max-w-[85vw] h-full bg-black/95 border-r border-white/10 p-4 flex flex-col gap-1 text-white shadow-2xl overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-3 mb-4 border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <div className="bg-white p-1 rounded-md">
                    <BrunchLogo size={20} />
                  </div>
                  <span className="font-extrabold text-xs tracking-wider text-[#fe6e00]">BRUNCH BOUAKÉ</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-white/60 hover:text-white p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                {renderNavigationItems()}
              </div>

              <div className="h-px bg-white/10 my-4 shrink-0"></div>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-3 rounded-lg text-xs font-semibold text-red-400 hover:bg-[#fb2c36] hover:text-white transition-all cursor-pointer shrink-0"
              >
                <LogOut className="w-4 h-4" />
                Déconnexion Admin
              </button>
            </aside>
          </div>
        )}

        {/* DESKTOP SIDEBAR NAVIGATION */}
        <aside className="hidden md:flex w-64 bg-black/70 backdrop-blur-md border-r border-white/10 p-4 flex-col gap-1 shrink-0 text-white rounded-none">
          <div className="flex items-center gap-2 px-3 mb-4 border-b border-white/10 pb-3 shrink-0">
            <div className="bg-white p-1 rounded-md">
              <BrunchLogo size={18} />
            </div>
            <span className="font-extrabold text-xs tracking-wider text-[#fe6e00]">BRUNCH BOUAKÉ</span>
          </div>

          <div className="flex-1 overflow-y-auto">
            {renderNavigationItems()}
          </div>

          <div className="h-px bg-white/10 my-2 shrink-0"></div>

          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold text-red-400 hover:bg-[#fb2c36] hover:text-white transition-all cursor-pointer shrink-0"
          >
            <LogOut className="w-4 h-4" />
            Déconnexion Admin
          </button>
        </aside>

        <main className="flex-1 p-4 md:p-8 flex flex-col gap-6 overflow-y-auto max-w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
