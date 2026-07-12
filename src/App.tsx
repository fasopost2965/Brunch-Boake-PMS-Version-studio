import { Lock, CheckCircle2 } from 'lucide-react';

// Custom Hook & Navigation Structure
import { useAppState } from './hooks/useAppState';
import { Layout } from './components/Layout';
import { NAVIGATION_STRUCTURE } from './navigation';

// Base Components & Screens
import { BrunchLogo } from './components/BrunchLogo';
import { SkeletonScreen } from './components/SkeletonScreen';
import { FrontDeskScreen } from './components/FrontDeskScreen';
import { DashboardScreen } from './components/DashboardScreen';
import { ReservationsScreen } from './components/ReservationsScreen';
import { ArrivalsScreen } from './components/ArrivalsScreen';
import { CheckInScreen } from './components/CheckInScreen';
import { RoomsScreen } from './components/RoomsScreen';
import { GuestsScreen } from './components/GuestsScreen';
import { InHouseScreen } from './components/InHouseScreen';
import { BillingScreen } from './components/BillingScreen';
import { PaymentsScreen } from './components/PaymentsScreen';
import { HousekeepingScreen } from './components/HousekeepingScreen';
import { MaintenanceScreen } from './components/MaintenanceScreen';
import { ReportsScreen } from './components/ReportsScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { DatabaseScreen } from './components/DatabaseScreen';
import { BrunchScreen } from './components/BrunchScreen';
import { InventoryScreen } from './components/InventoryScreen';

export default function App() {
  const state = useAppState();
  const {
    rooms,
    setRooms,
    reservations,
    setReservations,
    orders,
    setOrders,
    maintenance,
    setMaintenance,
    guests,
    setGuests,
    payments,
    setPayments,
    hotelConfig,
    setHotelConfig,
    activeTab,
    setActiveTab,
    isTabLoading,
    currentUserRole,
    selectedCheckInReservationId,
    setSelectedCheckInReservationId,
    successToast,
    isAuthenticated,
    loginUsername,
    setLoginUsername,
    loginPassword,
    setLoginPassword,
    loginError,
    triggerToast,
    handleLogin,
    users,
    setUsers,
  } = state;

  // Authentication Guard Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#fcfaf7] text-[#423d38] flex flex-col justify-center items-center p-4 antialiased font-sans">
        {/* SUCCESS TOAST NOTIFICATION */}
        {successToast && (
          <div className="fixed bottom-5 right-5 bg-[#00c758] text-white px-5 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-bounce">
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-semibold text-sm">{successToast}</span>
          </div>
        )}

        <div className="w-full max-w-md bg-white border border-[#e3e0dd] rounded-2xl p-8 shadow-sm flex flex-col gap-6">
          <div className="flex flex-col items-center text-center gap-3">
            <div className="p-3 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-center">
              <BrunchLogo size={80} />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900 tracking-tight">{hotelConfig.name} PMS</h2>
              <p className="text-xs text-[#797067] mt-1 font-medium">Système de Gestion Hôtelière Professionnelle</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Identifiant :</label>
              <input 
                type="text" 
                required 
                placeholder="admin" 
                value={loginUsername} 
                onChange={(e) => setLoginUsername(e.target.value)}
                className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-lg p-2.5 w-full text-sm focus:outline-none font-semibold text-gray-800"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-[#797067] uppercase tracking-widest text-[9px]">Mot de Passe :</label>
              <input 
                type="password" 
                required 
                placeholder="••••••••" 
                value={loginPassword} 
                onChange={(e) => setLoginPassword(e.target.value)}
                className="bg-[#f3f4f6] border border-[#e3e0dd] rounded-lg p-2.5 w-full text-sm focus:outline-none font-mono text-gray-800"
              />
            </div>

            {loginError && (
              <p className="text-xs text-[#fb2c36] font-bold bg-red-50 p-2.5 rounded-lg border border-red-100 text-center animate-shake">
                {loginError}
              </p>
            )}

            <button 
              type="submit"
              className="bg-[#fe6e00] hover:bg-[#d55c00] text-white font-extrabold py-3 rounded-lg transition-all uppercase text-xs tracking-wider cursor-pointer shadow-sm shadow-[#fe6e00]/20 flex items-center justify-center gap-1.5 mt-2"
            >
              <Lock className="w-3.5 h-3.5" />
              S'authentifier
            </button>
          </form>

          <div className="border-t border-dashed border-[#e3e0dd] pt-4 text-center">
            <span className="text-[10px] text-[#797067] font-semibold">Brunch Bouaké PMS Secured Terminal</span>
            <p className="text-[9px] text-[#797067]/80 mt-0.5">Identifiants par défaut: <strong className="font-mono text-gray-800">admin / admin</strong></p>
          </div>
        </div>
      </div>
    );
  }

  // Active navigation tab permission check
  const activeNavItem = NAVIGATION_STRUCTURE.flatMap(group => group.items).find(item => item.id === activeTab);
  const hasPermissionForActiveTab = !activeNavItem || !activeNavItem.requiredRoles || activeNavItem.requiredRoles.includes(currentUserRole);

  return (
    <Layout state={state}>
      {isTabLoading ? (
        <SkeletonScreen tab={activeTab} />
      ) : !hasPermissionForActiveTab ? (
        <div className="bg-red-50 border border-red-200 text-red-800 p-8 rounded-xl flex flex-col items-center justify-center gap-3 animate-fade-in" id="access_denied_screen">
          <Lock className="w-12 h-12 text-red-600 animate-pulse" />
          <h3 className="font-extrabold text-lg uppercase tracking-wider text-red-700">Accès Restreint</h3>
          <p className="text-sm text-center max-w-md text-red-600">
            Vous n'avez pas les habilitations requises pour accéder au module "{activeNavItem?.label}". Ce module est réservé aux rôles : {activeNavItem?.requiredRoles?.map(r => r === 'admin' ? 'Administrateur' : r === 'receptionist' ? 'Réceptionniste' : 'Comptable').join(', ')}.
          </p>
        </div>
      ) : (
        <>
          {activeTab === 'dashboard' && (
            <DashboardScreen 
              rooms={rooms}
              reservations={reservations}
              maintenance={maintenance}
              guests={guests}
              payments={payments}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'frontdesk' && (
            <FrontDeskScreen 
              rooms={rooms}
              reservations={reservations}
              payments={payments}
              setRooms={setRooms}
              setReservations={setReservations}
              setPayments={setPayments}
              triggerToast={triggerToast}
              setActiveTab={setActiveTab}
              setSelectedCheckInReservationId={setSelectedCheckInReservationId}
            />
          )}

          {activeTab === 'reservations' && (
            <ReservationsScreen 
              reservations={reservations}
              rooms={rooms}
              setReservations={setReservations}
              setRooms={setRooms}
              triggerToast={triggerToast}
              hotelConfig={hotelConfig}
              currentUserRole={currentUserRole}
            />
          )}

          {activeTab === 'arrivals' && (
            <ArrivalsScreen 
              reservations={reservations}
              rooms={rooms}
              setReservations={setReservations}
              setRooms={setRooms}
              triggerToast={triggerToast}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'checkin' && (
            <CheckInScreen 
              rooms={rooms}
              reservations={reservations}
              guests={guests}
              payments={payments}
              setRooms={setRooms}
              setReservations={setReservations}
              setGuests={setGuests}
              setPayments={setPayments}
              triggerToast={triggerToast}
              setActiveTab={setActiveTab}
              selectedCheckInReservationId={selectedCheckInReservationId}
              setSelectedCheckInReservationId={setSelectedCheckInReservationId}
              hotelConfig={hotelConfig}
            />
          )}

          {activeTab === 'rooms' && (
            <RoomsScreen 
              rooms={rooms}
              setRooms={setRooms}
              triggerToast={triggerToast}
            />
          )}

          {activeTab === 'guests' && (
            <GuestsScreen 
              guests={guests}
              reservations={reservations}
              payments={payments}
              setGuests={setGuests}
              triggerToast={triggerToast}
            />
          )}

          {activeTab === 'inhouse' && (
            <InHouseScreen 
              reservations={reservations}
              rooms={rooms}
              payments={payments}
              setReservations={setReservations}
              setRooms={setRooms}
              setPayments={setPayments}
              triggerToast={triggerToast}
            />
          )}

          {activeTab === 'billing' && (
            <BillingScreen 
              reservations={reservations}
              orders={orders}
              rooms={rooms}
              payments={payments}
              setReservations={setReservations}
              setPayments={setPayments}
              triggerToast={triggerToast}
              setActiveTab={setActiveTab}
              hotelConfig={hotelConfig}
            />
          )}

          {activeTab === 'payments' && (
            <PaymentsScreen 
              payments={payments}
              reservations={reservations}
              setPayments={setPayments}
              setReservations={setReservations}
              triggerToast={triggerToast}
              currentUserRole={currentUserRole}
            />
          )}

          {activeTab === 'housekeeping' && (
            <HousekeepingScreen 
              rooms={rooms}
              setRooms={setRooms}
              reservations={reservations}
              triggerToast={triggerToast}
            />
          )}

          {activeTab === 'maintenance' && (
            <MaintenanceScreen 
              maintenance={maintenance}
              rooms={rooms}
              setMaintenance={setMaintenance}
              setRooms={setRooms}
              triggerToast={triggerToast}
            />
          )}

          {activeTab === 'inventory' && (
            <InventoryScreen 
              triggerToast={triggerToast}
              currentUserRole={currentUserRole}
            />
          )}

          {activeTab === 'brunch' && (
            <BrunchScreen 
              rooms={rooms}
              orders={orders}
              setOrders={setOrders}
              setReservations={setReservations}
              triggerToast={triggerToast}
            />
          )}

          {activeTab === 'reports' && (
            <ReportsScreen 
              reservations={reservations}
              orders={orders}
              payments={payments}
              rooms={rooms}
              triggerToast={triggerToast}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsScreen 
              hotelConfig={hotelConfig}
              setHotelConfig={setHotelConfig}
              triggerToast={triggerToast}
              reservations={reservations}
              setReservations={setReservations}
              rooms={rooms}
              setRooms={setRooms}
              users={users}
              setUsers={setUsers}
              currentUserRole={currentUserRole}
            />
          )}

          {activeTab === 'database' && (
            <DatabaseScreen 
              triggerToast={triggerToast}
            />
          )}
        </>
      )}
    </Layout>
  );
}
