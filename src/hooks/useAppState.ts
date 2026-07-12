import React, { useState, useEffect } from 'react';
import { Room, Reservation, BrunchOrder, MaintenanceTicket, Guest, Payment, User, UserRole } from '../types';
import { TabType, NAVIGATION_STRUCTURE } from '../navigation';
import { 
  DEFAULT_ROOMS, 
  DEFAULT_RESERVATIONS, 
  DEFAULT_ORDERS, 
  DEFAULT_MAINTENANCE, 
  DEFAULT_GUESTS, 
  DEFAULT_PAYMENTS,
  DEFAULT_USERS
} from '../data';

export function useAppState() {
  const [rooms, setRooms] = useState<Room[]>(() => {
    const saved = localStorage.getItem('bouake_pms_rooms');
    return saved ? JSON.parse(saved) : DEFAULT_ROOMS;
  });

  const [reservations, setReservations] = useState<Reservation[]>(() => {
    const saved = localStorage.getItem('bouake_pms_reservations');
    return saved ? JSON.parse(saved) : DEFAULT_RESERVATIONS;
  });

  const [orders, setOrders] = useState<BrunchOrder[]>(() => {
    const saved = localStorage.getItem('bouake_pms_orders');
    return saved ? JSON.parse(saved) : DEFAULT_ORDERS;
  });

  const [maintenance, setMaintenance] = useState<MaintenanceTicket[]>(() => {
    const saved = localStorage.getItem('bouake_pms_maintenance');
    return saved ? JSON.parse(saved) : DEFAULT_MAINTENANCE;
  });

  const [guests, setGuests] = useState<Guest[]>(() => {
    const saved = localStorage.getItem('bouake_pms_guests');
    return saved ? JSON.parse(saved) : DEFAULT_GUESTS;
  });

  const [payments, setPayments] = useState<Payment[]>(() => {
    const saved = localStorage.getItem('bouake_pms_payments');
    return saved ? JSON.parse(saved) : DEFAULT_PAYMENTS;
  });

  const [hotelConfig, setHotelConfig] = useState(() => {
    const saved = localStorage.getItem('bouake_pms_config');
    return saved ? JSON.parse(saved) : {
      name: 'Brunch Bouaké',
      address: 'Quartier Kennedy, Bouaké, Côte d\'Ivoire',
      email: 'contact@brunch-bouake.ci',
      currency: 'FCFA',
      prices: {
        'Standard': 35000,
        'Deluxe': 55000,
        'Suite Royale': 95000,
        'Pavillon Brunch': 120000,
        'Chambre': 15000,
        'Studio': 25000
      }
    };
  });

  const [activeTab, setActiveTab] = useState<TabType>('frontdesk');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isSlowNetwork, setIsSlowNetwork] = useState<boolean>(false);
  const [isTabLoading, setIsTabLoading] = useState<boolean>(false);

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('bouake_pms_users');
    return saved ? JSON.parse(saved) : DEFAULT_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('bouake_pms_current_user');
    return saved ? JSON.parse(saved) : (users.find(u => u.username === 'admin') || null);
  });

  const [currentUserRole, setCurrentUserRole] = useState<UserRole>(() => {
    return (localStorage.getItem('bouake_pms_user_role') as UserRole) || 'admin';
  });

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    return { pms: true };
  });

  // Sync users to localStorage
  useEffect(() => {
    localStorage.setItem('bouake_pms_users', JSON.stringify(users));
  }, [users]);

  // Sync role to localStorage
  useEffect(() => {
    localStorage.setItem('bouake_pms_user_role', currentUserRole);
  }, [currentUserRole]);

  // Sync current user to localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('bouake_pms_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('bouake_pms_current_user');
    }
  }, [currentUser]);

  // Auto-expand the group of the active tab
  useEffect(() => {
    const parentGroup = NAVIGATION_STRUCTURE.find(group => 
      group.items.some(subItem => subItem.id === activeTab)
    );
    if (parentGroup) {
      setOpenGroups(prev => ({
        ...prev,
        [parentGroup.id]: true
      }));
    }
  }, [activeTab]);

  const toggleGroup = (groupId: string) => {
    setOpenGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const handleTabChange = (tab: TabType) => {
    setIsMobileMenuOpen(false);
    setIsTabLoading(true);
    const delay = isSlowNetwork ? 1000 : 350;
    setActiveTab(tab);
    setTimeout(() => {
      setIsTabLoading(false);
    }, delay);
  };

  const [selectedCheckInReservationId, setSelectedCheckInReservationId] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Authentication State & Handlers
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('bouake_pms_authenticated') === 'true';
  });
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const foundUser = users.find(
      u => u.username.toLowerCase() === loginUsername.trim().toLowerCase() && u.password === loginPassword
    );
    if (foundUser) {
      localStorage.setItem('bouake_pms_authenticated', 'true');
      setCurrentUser(foundUser);
      setCurrentUserRole(foundUser.role);
      setIsAuthenticated(true);
      setLoginError('');
      triggerToast(`Bienvenue, ${foundUser.name} !`);
    } else {
      setLoginError('Identifiant ou mot de passe incorrect.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('bouake_pms_authenticated');
    setCurrentUser(null);
    setIsAuthenticated(false);
    setLoginUsername('');
    setLoginPassword('');
    triggerToast('Déconnexion réussie.');
  };

  // Sync state to localstorage
  useEffect(() => {
    localStorage.setItem('bouake_pms_rooms', JSON.stringify(rooms));
  }, [rooms]);

  useEffect(() => {
    localStorage.setItem('bouake_pms_reservations', JSON.stringify(reservations));
  }, [reservations]);

  useEffect(() => {
    localStorage.setItem('bouake_pms_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('bouake_pms_maintenance', JSON.stringify(maintenance));
  }, [maintenance]);

  useEffect(() => {
    localStorage.setItem('bouake_pms_guests', JSON.stringify(guests));
  }, [guests]);

  useEffect(() => {
    localStorage.setItem('bouake_pms_payments', JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem('bouake_pms_config', JSON.stringify(hotelConfig));
  }, [hotelConfig]);

  const triggerToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  // Header quick KPI calculations
  const occupiedCount = rooms.filter(r => r.status === 'Occupé').length;
  const dirtyCount = rooms.filter(r => r.status === 'Sale').length;
  const totalRevenues = payments.reduce((sum, p) => sum + p.amount, 0);

  return { 
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
    isMobileMenuOpen, 
    setIsMobileMenuOpen, 
    isSlowNetwork, 
    setIsSlowNetwork, 
    isTabLoading, 
    setIsTabLoading, 
    currentUserRole, 
    setCurrentUserRole, 
    openGroups, 
    setOpenGroups, 
    handleTabChange, 
    toggleGroup, 
    selectedCheckInReservationId, 
    setSelectedCheckInReservationId, 
    successToast, 
    triggerToast, 
    isAuthenticated, 
    setIsAuthenticated, 
    loginUsername, 
    setLoginUsername, 
    loginPassword, 
    setLoginPassword, 
    loginError, 
    setLoginError, 
    handleLogin, 
    handleLogout, 
    occupiedCount, 
    dirtyCount, 
    totalRevenues,
    users,
    setUsers,
    currentUser,
    setCurrentUser
  };
}
